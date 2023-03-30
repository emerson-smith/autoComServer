const express = require("express");
const { generateEmailBody } = require("./autoCom.controller");

const autoComRouter = express.Router();

autoComRouter.post("/generateEmailBody", generateEmailBody);

module.exports = { autoComRouter };
