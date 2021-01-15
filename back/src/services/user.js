export default class UserService {

	constructor( dao ) {
		this.dao = dao;
	}

	newUser( user ) {
		return this.dao.save( user, 'user' );
	}

	getUser( username ) {
		return this.dao.findOne( { username }, 'user' );
	}

}