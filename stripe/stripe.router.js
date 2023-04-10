const express = require("express");
const { createCheckoutSession, createPortalSession, webhook, redirectURLToChromeURL } = require("./stripe.controller");
const { validateAuth0 } = require("../middleware/auth0.middleware");

const stripeRouter = express.Router();

stripeRouter.post("/create-checkout-session", validateAuth0, createCheckoutSession);
stripeRouter.post("/create-portal-session", validateAuth0, createPortalSession);
stripeRouter.get("/redirect", redirectURLToChromeURL);
stripeRouter.post("/webhook", express.raw({ type: "application/json" }), webhook);

module.exports = { stripeRouter };
