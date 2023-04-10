const express = require("express");
const { generateEmailBody } = require("./autoCom.controller");
const { validateAuth0 } = require("../middleware/auth0.middleware");
const { validatePaidUser } = require("../middleware/stripe.middleware");

const autoComRouter = express.Router();

autoComRouter.post("/generateEmailBody", validateAuth0, validatePaidUser, generateEmailBody);

module.exports = { autoComRouter };
