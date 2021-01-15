export default {
	APP_PORT: process.env.APP_PORT || 8080,
	DID_RESOLVER: process.env.DID_RESOLVER || "http://34.68.56.94:8080",
	MONGODB_URL: process.env.MONGODB_URL,
	REDIS_HOST: process.env.REDIS_HOST || "localhost",
	REDIS_PORT: process.env.REDIS_PORT || 6379,
	REDIS_DB: process.env.REDIS_DB || 9,
	ELASTIC_NODE_URL: process.env.ELASTIC_NODE_URL,
	ELASTIC_APP_KEY: process.env.ELASTIC_APP_KEY,
	ELASTIC_APP_INDEX: process.env.ELASTIC_APP_INDEX,
	ELASTIC_LOGGER_LEVEL: process.env.ELASTIC_LOGGER_LEVEL || "debug",
	CONSOLE_LOGGER_LEVEL: process.env.CONSOLE_LOGGER_LEVEL || "info"
}