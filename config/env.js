const dotenv = require("dotenv").config();
const envVariables = [
	"NODE_ENV",
	"PORT",
	"OPENAI_API_KEY",
	"CONSOLE_LOG_LEVEL",
	"AUTH0_DOMAIN",
	"AUTH0_AUDIENCE",
	"AUTH0_API_CLIENT_ID",
	"AUTH0_API_CLIENT_SECRET",
	"FRONTEND_URL",
	"SERVER_URL",
	"STRIPE_SECRET_KEY",
	"STRIPE_WH_SECRET",
];

const checkEnvVariable = (variable) => {
	if (!process.env[variable]) {
		throw new Error(`Missing required environment variable: ${variable}`);
	}
	if (variable === "PORT") {
		return parseInt(process.env[variable], 10);
	}
	return process.env[variable];
};

// Check if all required environment variables are set, then export them
const env = envVariables.reduce((acc, variable) => {
	acc[variable] = checkEnvVariable(variable);
	return acc;
}, {});

module.exports = env;
