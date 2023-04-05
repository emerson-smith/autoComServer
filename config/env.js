const dotenv = require("dotenv").config();
const envVariables = ["NODE_ENV", "PORT", "OPENAI_API_KEY", "CONSOLE_LOG_LEVEL"];

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
