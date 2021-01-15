import web3Abi from "web3-eth-abi";
import Web3 from "web3";
import web3Utils from "web3-utils";
import * as ethUtil from "ethereumjs-util";
import ethers from "ethers";
import * as uuid from "uuidv4";
import crypto from "crypto";
import { Buffer } from "buffer";
import moment from "moment";
import tweetnacl from "tweetnacl";
import sealedbox from 'tweetnacl-sealedbox-js';

import DiplomaClaimsVerifier from "./DiplomaClaimsVerifier";

tweetnacl.sealedbox = sealedbox;

const VERIFIED_STUDIES_TYPEHASH = web3Utils.soliditySha3( "VerifiedStudies(address issuer,address subject,bytes32 diploma,uint256 validFrom,uint256 validTo)" );
const EIP712DOMAIN_TYPEHASH = web3Utils.soliditySha3( "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)" );

const encodeEIP712Domain = web3Abi.encodeParameters(
  ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
  [EIP712DOMAIN_TYPEHASH, web3Utils.sha3( "EIP712Studies" ), web3Utils.sha3( "1" ), 648529, process.env.REACT_APP_DIPLOMA_CLAIMS_VERIFIER]
);

const hashEIP712Domain = web3Utils.soliditySha3( encodeEIP712Domain );

export function encryptNaCl( message, receiverPublicKey ) {
  return tweetnacl.sealedbox.seal( Buffer.from( message ), Buffer.from( receiverPublicKey, 'hex' ) );
}

export function sha256( data ) {
  const hashFn = crypto.createHash( 'sha256' );
  hashFn.update( data );
  return hashFn.digest( 'hex' );
}

export function signCredential1( credentialHash, privateKey ) {
  const rsv = ethUtil.ecsign(
    Buffer.from( credentialHash.substring( 2, 67 ), 'hex' ),
    Buffer.from( privateKey, 'hex' )
  );
  console.log(rsv.v, rsv.r.toString('hex'), rsv.s.toString('hex'));
  return ethUtil.toRpcSig( rsv.v, rsv.r, rsv.s );
}

export function getCertificateCredential( issuer, subject ) {
  const issuanceDate = moment();
  const expirationDate = issuanceDate.clone().add( 5, 'years' );
  const { id, givenName, familyName, email } = subject;
  return {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      `https://www.lacchain.net/credentials/library/education/4e6c312cd8e6b18116fe3fd2e9b6e5df810afe0a716c1c511ef6c19cb8554578/v1`
    ],
    id: uuid.uuid(),
    type: ['VerifiableCredential', 'Certificate'],
    issuer: `did:ethr:lacchain:${issuer}`,
    issuanceDate: issuanceDate.toISOString(),
    expirationDate: expirationDate.toISOString(),
    credentialSubject: {
      id,
      givenName,
      familyName,
      email,
      holds: {
        category: "Diploma",
        industry: "Ciência da Computação",
        skillset: "Blockchain",
        course: "Blockchain e suas Aplicações",
        description: "O objetivo do curso é familiarizar os participantes ao funcionamento da tecnologia blockchain, explorando seus mecanismos e efeitos nas organizações e na sociedade – incluindo as implicações para o setor financeiro e para o setor público, no âmbito das oportunidades relacionadas à Transformação Digital",
        url: "https://suap.enap.gov.br/portaldoaluno/curso/1065/?area=31",
        duration: 30,
        modality: "virtual",
        location: null
      }
    },
    evidence: true,
    credentialStatus: {
      id: process.env.REACT_APP_CREDENTIAL_REGISTRY,
      type: "SmartContract"
    },
    proof: []
  }
}

export function getCredentialHash( issuer, vc ) {
  const hashDiplomaHex = `0x${sha256( JSON.stringify( vc.credentialSubject ) )}`;
  console.log( 'diploma', hashDiplomaHex );
  const validFrom = new Date( vc.issuanceDate ).getTime();
  const validTo = new Date( vc.expirationDate ).getTime();
  const subjectAddress = vc.credentialSubject.id.split( ':' ).slice( -1 )[0];
  // console.log(issuer, subjectAddress, hashDiplomaHex, Math.round( validFrom / 1000 ), Math.round( validTo / 1000 ));
  const encodeHashStudiesCredential = web3Abi.encodeParameters(
    ['bytes32', 'address', 'address', 'bytes32', 'uint256', 'uint256'],
    [VERIFIED_STUDIES_TYPEHASH, issuer, subjectAddress, hashDiplomaHex, Math.round( validFrom / 1000 ), Math.round( validTo / 1000 )]
  );
  const hashStudiesCredential = web3Utils.soliditySha3( encodeHashStudiesCredential );

  const encodedCredentialHash = web3Abi.encodeParameters( ['bytes32', 'bytes32'], [hashEIP712Domain, hashStudiesCredential.toString( 16 )] );
  return web3Utils.soliditySha3( '0x1901'.toString( 16 ) + encodedCredentialHash.substring( 2, 131 ) );
}

export const registerCredential = async( credential, issuer, signature ) => {
  const web3 = new Web3( window.ethereum );
  const provider = (new ethers.providers.Web3Provider( web3.currentProvider )).getSigner();

  const subjectAddress = credential.credentialSubject.id.split( ':' ).slice( -1 )[0];
  const credentialHash = getCredentialHash( issuer, credential );

  const issuanceDate = moment( credential.issuanceDate );
  const expirationDate = moment( credential.expirationDate );

  const contract = new ethers.Contract( process.env.REACT_APP_DIPLOMA_CLAIMS_VERIFIER, DiplomaClaimsVerifier.abi, provider );
  const signature1 = signCredential1(credentialHash, '808ad4745bfeee46aafbeb94d247a85896d741aec34ccbfde8ecffc583caef4c');
  console.log(subjectAddress, credentialHash, Math.round( issuanceDate.valueOf() / 1000 ), Math.round( expirationDate.valueOf() / 1000 ));
  console.log( signature, signature1 );
  return (await contract.register(
    subjectAddress, credentialHash, Math.round( issuanceDate.valueOf() / 1000 ), Math.round( expirationDate.valueOf() / 1000 ), signature, {
      gasLimit: 970000,
      gasPrice: 0
    } )).hash;
}

export const signCredential = async( credential, issuer, signature ) => {
  const web3 = new Web3( window.ethereum );
  const provider = (new ethers.providers.Web3Provider( web3.currentProvider )).getSigner();

  const credentialHash = getCredentialHash( issuer, credential );
  const issuanceDate = moment( credential.issuanceDate );
  const expirationDate = moment( credential.expirationDate );
  console.log(credentialHash, Math.round( issuanceDate.valueOf() / 1000 ), Math.round( expirationDate.valueOf() / 1000 ));
  const contract = new ethers.Contract( process.env.REACT_APP_DIPLOMA_CLAIMS_VERIFIER, DiplomaClaimsVerifier.abi, provider );
  return (await contract.registerSignature( credentialHash, issuer, signature, {
    gasLimit: 970000,
    gasPrice: 0
  } )).hash;
}
