import React from 'react'
import Web3 from "web3";
import { Alert, Button, Card, Table } from 'antd'
import { Redirect } from "react-router-dom";
import { Helmet } from 'react-helmet'
import { connect } from "react-redux";
import axios from 'axios';
import VCModal from "./vc-modal";
import { encryptNaCl, getCertificateCredential, sha256, registerCredential, signCredential } from "../utils";

class ReceivedVC extends React.Component {
  state = {
    vcs: [],
    currentVC: {},
    isVCModalVisible: false,
    loading: false,
    signing: false,
    registering: false
  }

  componentDidMount() {
    this.setState( { loading: true } );
    this.getRequests();
  }

  authenticate = async() => {
    if( window.ethereum ) {
      window.web3 = new Web3( window.ethereum );
      await window.ethereum.enable();
    }
    const accounts = await window.web3.eth.getAccounts();
    const address = localStorage.getItem( 'address' );
    let signature = localStorage.getItem( 'signature' );
    if( !signature || address !== accounts[0] ) {
      const url = `${process.env.REACT_APP_MAILBOX_URL}/auth/did:ethr:lacchain:${accounts[0].toLowerCase()}`;
      const challenge = await axios.get( url ).then( result => result.data ).then( result => result.challenge );
      const web3 = new Web3( window.ethereum );
      signature = await web3.eth.personal.sign( challenge, accounts[0] );
      localStorage.setItem( 'address', accounts[0] );
      localStorage.setItem( 'signature', signature );
    }
    return signature;
  }

  getRequests = async() => {
    const signature = await this.authenticate();
    const accounts = await window.web3.eth.getAccounts();
    try {
      const results = await axios.get( `${process.env.REACT_APP_MAILBOX_URL}/vc/did:ethr:lacchain:${accounts[0].toLowerCase()}`, {
        headers: { signature }
      } ).then( result => result.data ).then( result => result.map( r => JSON.parse( Buffer.from( r.value ).toString() ) ) )
      if( !results ) return this.setState( { vcs: [], loading: false } );
      const credentials = await axios.get( `${process.env.REACT_APP_API_URL}/credentials/${accounts[0]}`).then( result => result.data );
      const vcs = results.map( r => ({
        ...r,
        credential: credentials.find( c => c.requestId === r.id )
      }) );

      return this.setState( { vcs, loading: false } )
    } catch( error ) {
      return this.setState( { error: 'Invalid decryption key', loading: false } );
    }
  }

  sendEncryptedCredential = async( sender, receiver, credential ) => {
    const receiverDID = await axios.get( `${process.env.REACT_APP_MAILBOX_URL}/did/${receiver.toLowerCase()}` )
      .then( result => result.data );
    const receiverPublicKey = Buffer.from( receiverDID.publicKey[receiverDID.publicKey.length - 1].publicKeyBase64, 'base64' ).toString( 'hex' );
    const messageContent = {
      "@context": [
        "https://w3id.org/security/v1",
        "https://wdt.com/credentials"
      ],
      "type": [
        "EncryptedMessage",
        "ResponseVC"
      ],
      "cipherAlgorithm": "nacl-sealed",
      "cipherData": Buffer.from( encryptNaCl( JSON.stringify( credential ), receiverPublicKey ) ).toString( 'hex' ),
      "publicKey": receiverDID.publicKey[receiverDID.publicKey.length - 1].id
    };

    const data = Buffer.from( JSON.stringify( messageContent ) ).toJSON();
    return axios.post( `${process.env.REACT_APP_MAILBOX_URL}/vc/`,
      {
        "from": `did:ethr:lacchain:${sender.toLowerCase()}`,
        "to": receiver.toLowerCase(),
        "vc": {
          "type": "Buffer",
          "value": data.data,
        }
      }, {
        headers: { signature: localStorage.getItem( 'signature' ) },
        maxContentLength: `Infinity`
      } ).then( result => result.data );
  }

  showVCModal = ( vc ) => {
    this.setState( {
      currentVC: vc,
      isVCModalVisible: true
    } )
  };

  hideVCModal = () => {
    this.setState( { isVCModalVisible: false } )
  }

  saveCredential = async ( request, credential, proof, txHash ) => {
    const accounts = await window.web3.eth.getAccounts();
    const issuer = accounts[0];
    return axios.post( `${process.env.REACT_APP_API_URL}/register`,
      { issuer, credential, request, proof, txHash }, {
        headers: { signature: localStorage.getItem( 'signature' ) }
      } ).then( result => result.data );
  }

  updateCredential = async ( request, signature, txHash ) => {
    return axios.post( `${process.env.REACT_APP_API_URL}/sign`,
      { request, signature, txHash }, {
        headers: { signature: localStorage.getItem( 'signature' ) }
      } ).then( result => result.data );
  }

  getCertificate = async ( request ) => {
    return axios.post( `${process.env.REACT_APP_API_URL}/certificate`,
      { request }, {
        headers: { signature: localStorage.getItem( 'signature' ) }
      } ).then( result => result.data );
  }

  getSignature = async( vc ) => {
    const accounts = await window.web3.eth.getAccounts();
    const web3 = new Web3( window.ethereum );
    const diploma = `0x${sha256( JSON.stringify( vc.credentialSubject ) )}`;
    const validFrom = new Date( vc.issuanceDate ).getTime();
    const validTo = new Date( vc.expirationDate ).getTime();
    const subject = vc.credentialSubject.id.split( ':' ).slice( -1 )[0];
    const data = JSON.stringify({
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" }
        ],
        VerifiedStudies: [
          { name: "issuer", type: "address" },
          { name: "subject", type: "address" },
          { name: "diploma", type: "bytes32" },
          { name: "validFrom", type: "uint256" },
          { name: "validTo", type: "uint256" }
        ]
      },
      domain: {
        name: "EIP712Studies",
        version: "1",
        chainId: 648529,
        verifyingContract: process.env.REACT_APP_DIPLOMA_CLAIMS_VERIFIER
      },
      primaryType: "VerifiedStudies",
      message: {
        issuer: accounts[0],
        subject,
        diploma,
        validFrom: Math.round( validFrom / 1000 ),
        validTo: Math.round( validTo / 1000 )
      }
    });
    return web3.currentProvider.request( {
      method: "eth_signTypedData_v3",
      params: [accounts[0], data],
      from: accounts[0]
    });
  }

  async register( request ) {
    const accounts = await window.web3.eth.getAccounts();
    this.setState( { registering: true } );
    const vc = getCertificateCredential( accounts[0], request.credentialSubject );
    const signature = await this.getSignature(vc);
    const txHash = await registerCredential( vc, accounts[0], signature );
    await this.saveCredential( request, vc, signature, txHash );
    await this.getRequests();
    this.setState( { registering: false } );
  }

  async sign( request ) {
    const accounts = await window.web3.eth.getAccounts();
    this.setState( { signing: true } );
    const vc = request.credential.credential; // getCertificateCredential( accounts[0], request.credentialSubject );
    const signature = request.credential.proof; // await this.getSignature(vc);
    const txHash = await signCredential( vc, accounts[0], signature );
    await this.updateCredential( request, signature, txHash );
    await this.getRequests();
    const credential = {
      ...request.credential.credential,
      proof: [{
          id: `did:ethr:lacchain:${accounts[0]}`,
          type: "EcdsaSecp256k1Signature2019",
          proofPurpose: "assertionMethod",
          verificationMethod: process.env.REACT_APP_DIPLOMA_CLAIMS_VERIFIER,
          proofValue: signature
        }]
    };
    const certificate = await this.getCertificate( request );
    await this.sendEncryptedCredential( accounts[0], credential.credentialSubject.id, {
      credential,
      evidence: certificate
    } );
    this.setState( { signing: false } );
  }

  render() {
    const { user } = this.props;
    const { signing, registering } = this.state;
    const columns = [
      {
        title: 'Subject',
        dataIndex: 'requissuanceDate',
        key: 'issuanceDate',
        render: ( _, record ) => `${record.credentialSubject.givenName} ${record.credentialSubject.familyName}`,
      },
      {
        title: 'DID',
        dataIndex: 'issuer',
        key: 'issuer',
        render: ( text, record ) => (
          <a
            className="btn btn-sm btn-light"
            href={`https://mailbox.lacchain.net/#/did/resolve/${record.credentialSubject.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {record.credentialSubject.id}
          </a>
        ),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: ( _, record ) => {
          if( !record.credential ) {
            return (
              <span className="font-size-12 badge badge-default">
                Pending registration
              </span>
            );
          }
          if( record.credential && !record.credential.signature ) {
            return (
              <span className="font-size-12 badge badge-default">
                Pending Signature
              </span>
            );
          }
          return (
            <>
              <span className="font-size-12 badge badge-success">
                Signed
              </span>
              <span className="font-size-12 badge badge-warning ml-2">
                Issued
              </span>
            </>
          );
        }
      },
      {
        title: 'Action',
        key: 'action',
        render: ( _, item ) => (
          <span>
            <Button
              onClick={e => {
                this.showVCModal( item );
                e.preventDefault();
              }}
              className="btn btn-sm btn-primary mr-2"
            >
              <i className="fe fe-edit mr-2" />
              View
            </Button>
            {!item.credential &&
              <Button
                onClick={e => {
                  this.register( item );
                  e.preventDefault();
                }}
                className="btn btn-sm btn-warning mr-2"
                loading={registering /* && id === item.request.id */}
              >
                <i className="fe fe-edit mr-2" />
                Register
              </Button>
            }
            {item.credential && !item.credential.signature &&
              <Button
                onClick={e => {
                  this.sign( item );
                  e.preventDefault();
                }}
                className="btn btn-sm btn-success mr-2"
                loading={signing /* && id === item.request.id */}
              >
                <i className="fe fe-edit mr-2" />
                Sign
              </Button>
            }
          </span>
        ),
      },
    ]
    const { currentVC, isVCModalVisible, loading, vcs, error } = this.state;
    if( error ) {
      localStorage.removeItem( 'address' );
      localStorage.removeItem( 'signature' );
      return <Redirect to="/vc/received" />
    }
    return (
      <div>
        <Helmet title="VC" />
        <VCModal visible={isVCModalVisible} vc={currentVC} hide={this.hideVCModal} user={user} />
        <div className="cui__utils__heading">
          <strong>Credentials » Requests</strong>
        </div>
        {error &&
        <Alert message={error} type="error" className="mb-4" />
        }
        <Card className="card" loading={loading}>
          <div className="card-header card-header-flex">
            <div className="d-flex flex-column justify-content-center mr-auto">
              <h5 className="mb-0">BNDES VC Requests</h5>
            </div>
          </div>
          <div className="card-body">
            <div className="text-nowrap">
              <Table columns={columns} dataSource={vcs} rowKey="id" />
            </div>
          </div>
        </Card>
      </div>
    )
  }
}

const mapStateToProps = ( { user } ) => ( { user } );

export default connect( mapStateToProps )( ReceivedVC )
