export default class CredentialsService {

	constructor( dao ) {
		this.dao = dao;
	}

	getCredentials( issuer ) {
		return this.dao.findAll( { issuer }, 'vc' )
	}

	registerCredential( requestId, issuer, credential, proof, txRegister ) {
		return this.dao.save( { requestId, issuer, credential, proof, txRegister, issuedAt: new Date() }, 'vc' );
	}

	async signCredential( requestId, signature, txSignature ) {
		const vc = await this.dao.get( { requestId }, 'vc' );
		vc.signature = signature;
		vc.txSignature = txSignature;
		return vc.save();
	}

}