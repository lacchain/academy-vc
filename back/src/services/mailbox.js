import axios from "axios";
import config from "../config.js";
import { sign } from "../utils/sign.js";
import { Buffer } from "buffer";

export default class MailboxService {

	async clearMailbox( user ) {
		const challenge = await axios.get( `${config.DID_RESOLVER}/auth/did:ethr:lacchain:${user.address}` )
			.then( result => result.data ).then( result => result.challenge );
		return await axios.delete( `${config.DID_RESOLVER}/vc/did:ethr:lacchain:${user.address}`, {
			headers: {
				signature: sign( challenge, user.mainKey.privateKey )
			}
		} ).then( result => result.data );
	}

	async sendRawCredential( sender, receiver, credential ) {
		const challenge = await axios
			.get( `${config.DID_RESOLVER}/auth/did:ethr:lacchain:${sender.address.toLowerCase()}` )
			.then( result => result.data ).then( result => result.challenge );

		const signature = sign( challenge, sender.privateKey );
		const data = Buffer.from( JSON.stringify( credential ) ).toJSON().data;
		return axios.post( `${config.DID_RESOLVER}/vc/`,
			{
				"from": `did:ethr:lacchain:${sender.address.toLowerCase()}`,
				"to": `did:ethr:lacchain:${receiver.address.toLowerCase()}`,
				"vc": {
					"type": "Buffer",
					"value": data,
				}
			}, {
				headers: {
					signature
				},
				maxContentLength: `Infinity`
			} ).then( result => result.data );
	}
}