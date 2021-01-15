import mongoose from "mongoose";
import vcModel from "./vc.js";
import config from "../config.js";

export default class MongoDAO {

	constructor() {
		mongoose.connect( config.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true } );

		const userSchema = mongoose.Schema( vcModel );

		this.models = {
			'vc': mongoose.model( 'vc', userSchema ),
		};
	}

	async save( data, entity ) {
		const instance = new this.models[entity]( data );
		return await instance.save();
	}

	async get( query, entity ) {
		return await this.models[entity].findOne( query );
	}

	async findOne( query, entity ) {
		const result = await this.models[entity].findOne( query );
		if( !result ) return null;

		return result.toObject();
	}

	async findAll( query, entity  ) {
		const results = await this.models[entity].find( query );
		if( !results ) return null;

		return results;
	}

}