import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export default {
	givenName: String,
	familyName: String,
	email: String,
	request: Object,
	credential: Object,
	proofs: [{
		user: {
			type: Schema.Types.ObjectId,
			ref: 'user'
		},
		signature: String
	}],
	txHash: String,
	issuerSignature: String,
	createdAt: Date,
	sentAt: Date
}