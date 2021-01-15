import Router from './router.js';
import { credentialsService } from "../services/index.js";
import { getCertificate } from "../utils/certificate.js";

export default class APIRouter extends Router {

	constructor( redis ) {
		super();
		this.redis = redis;
	}

	init() {

		this.get( '/credentials/:issuer', async req => {
			const { issuer } = req.params;
			return await credentialsService.getCredentials( issuer );
		} );

		this.post( '/certificate', async req => {
			const { request } = req.body
			const { credentialSubject } = request;
			return getCertificate( credentialSubject );
		} );

		this.post( '/register', async req => {
			const { issuer, credential, request, proof, txHash } = req.body
			await credentialsService.registerCredential( request.id, issuer, credential, proof, txHash );
			return true;
		} );

		this.post( '/sign', async req => {
			const { request, signature, txHash } = req.body
			await credentialsService.signCredential( request.id, signature, txHash );
			return true;
		} );

	}

}