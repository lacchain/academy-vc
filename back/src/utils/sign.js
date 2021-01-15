import util from "ethereumjs-util";
import { Buffer } from "buffer";

export function sign( message, privateKey ) {
	const hash = util.hashPersonalMessage( new Buffer( message ) );
	const buffer = new Buffer( hash, 'hex' );
	const { v, r, s } = util.ecsign( buffer, new Buffer( privateKey, 'hex' ) );
	return util.toRpcSig( v, r, s );
}

export function verify( signature, message ) {
	const hash = util.hashPersonalMessage( new Buffer( message ) );
	const { v, r, s } = util.fromRpcSig( signature );
	const pubKey = util.ecrecover( hash, v, r, s );
	const addrBuf = util.pubToAddress( pubKey );
	return util.bufferToHex( addrBuf );
}