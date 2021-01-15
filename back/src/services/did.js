import Web3 from 'web3';
import DIDResolver from 'did-resolver';
import EthrDID from '../utils/ethr-did.js';
import ethr from '../utils/eth-did-resolver.js';
import tweetnacl from "tweetnacl";

export default class DIDService {

	constructor() {
		this.web3 = new Web3( "https://writer.lacchain.net", {
			network_id: 648529,
			gas: 0,
			gasPrice: 0
		} );
		this.web3.currentProvider.sendAsync = this.web3.currentProvider.send;

		const providerConfig = {
			networks: [{
				name: "lacchain",
				registry: "0x488C83c4D1dDCF8f3696273eCcf0Ff4Cf54Bf277",
				rpcUrl: "https://writer.lacchain.net"
			}]
		}

		const ethrResolver = ethr.getResolver( providerConfig );
		this.resolver = new DIDResolver.Resolver( { ...ethrResolver } );
	}

	async resolve( did ) {
		return this.resolver.resolve( did );
	}

	async create() {
		const mainKey = EthrDID.createKeyPair();
		const signingKey = mainKey;
		/*const signingKeyBase58 = await cryptold.Ed25519KeyPair.generate();
		const signingKey = {
			publicKey: bs58.decode( signingKeyBase58.publicKeyBase58 ).toString( 'hex' ),
			privateKey: bs58.decode( signingKeyBase58.privateKeyBase58 ).toString( 'hex' )
		};*/
		const naclKey = tweetnacl.box.keyPair();
		const encryptionKey = {
			publicKey: Buffer.from( naclKey.publicKey ).toString( 'hex' ),
			privateKey: Buffer.from( naclKey.secretKey ).toString( 'hex' ),
		};
		const ethrDid = new EthrDID( {
			...mainKey,
			provider: this.web3.currentProvider,
			registry: "0x488C83c4D1dDCF8f3696273eCcf0Ff4Cf54Bf277",
			web3: this.web3
		} );
		await ethrDid.setAttribute( 'did/pub/Ed25519/veriKey/hex', '0x' + signingKey.publicKey );
		await ethrDid.setAttribute( 'did/pub/X25519/enc/base64', Buffer.from( encryptionKey.publicKey, 'hex' ).toString( 'base64' ) );
		return { did: ethrDid.did, address: ethrDid.address, mainKey, signingKey, encryptionKey };
	}
}