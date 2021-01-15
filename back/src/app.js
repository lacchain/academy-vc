import express from 'express';
import http from 'http';
import cors from 'cors';
import APIRouter from "./routes/api.js";
import redis from "redis";
import { promisify } from "util";
import config from "./config.js";

const app = express();

const redisClient = redis.createClient( {
	host: config.REDIS_HOST,
	port: config.REDIS_PORT,
	db: config.REDIS_DB
} );
const setSession = promisify( redisClient.setex ).bind( redisClient );
const getSession = promisify( redisClient.get ).bind( redisClient );

const apiRouter = new APIRouter( { setSession, getSession } );

app.use( cors() );
app.use( express.json() );
app.use( express.urlencoded( { extended: false } ) );

app.use( function( req, res, next ) {
	res.setHeader( 'Strict-Transport-Security', 'max-age=15724800; includeSubDomains' );
	next();
} );

app.use( '/', apiRouter.getRouter() );

const server = http.createServer( app );

server.listen( config.APP_PORT, () => {
	console.log( 'LACChain VC Issuer v1.0 | Port: ', config.APP_PORT );
} );