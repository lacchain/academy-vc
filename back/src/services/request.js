import { getFullCredential } from "../utils/credential.js";

export default class RequestService {

	constructor( dao ) {
		this.dao = dao;
	}

	async getRequestById( id ) {
		const attendee = await this.dao.findOne( { "request.id": id }, 'attendee' );
		if( !attendee ) return null;
		return attendee.request;
	}

	async getRequestByHash( hash ) {
		const attendee = await this.dao.findOne( { "request.hash": hash }, 'attendee' );
		if( !attendee ) return null;
		return attendee.request;
	}

	async getRequests() {
		const attendees = await this.dao.findAll( {}, 'attendee' );
		return attendees.map( attendee => {
			return {
				request: attendee.request,
				response: getFullCredential( attendee ),
				proofs: attendee.proofs ? attendee.proofs : [],
				issuerSignature: attendee.issuerSignature
			}
		} );
	}

	async getAttendees() {
		return await this.dao.findAll( {}, 'attendee' );
	}

	async registerRequest( request, hash, credential, signature, txHash ) {
		const subject = {
			givenName: request.credentialSubject.givenName,
			familyName: request.credentialSubject.familyName,
			email: request.credentialSubject.email
		};
		let attendee = await this.dao.get( subject, 'attendee' );
		if( !attendee ) {
			attendee = await this.dao.save( subject, 'attendee' )
		}
		attendee.request = {
			...request,
			hash
		};
		attendee.txHash = txHash;
		attendee.credential = credential;
		attendee.issuerSignature = signature;
		return ( await attendee.save() ).request;
	}

}