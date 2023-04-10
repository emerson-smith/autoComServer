const asyncHandler = require("express-async-handler");
const auth0 = require("auth0");
const env = require("../config/env");
const stripe = require("stripe")(env.STRIPE_SECRET_KEY);

const auth0Management = new auth0.ManagementClient({
	domain: env.AUTH0_DOMAIN,
	clientId: env.AUTH0_API_CLIENT_ID,
	clientSecret: env.AUTH0_API_CLIENT_SECRET,
});

const createCheckoutSession = asyncHandler(async (req, res) => {
	if (!req.body.email) {
		res.status(400).json({ message: "Email is required" });
		throw new Error("Email is required");
	}

	// const prices = await stripe.prices.list({
	// 	lookup_keys: [req.body.lookup_key],
	// 	expand: ["data.product"],
	// });
	// console.log(prices);
	const config = {
		billing_address_collection: "auto",
		line_items: [
			{
				price: env.STRIPE_PRICE_ID,
				// For metered billing, do not pass quantity
				quantity: 1,
			},
		],
		mode: "subscription",
		success_url: `${env.SERVER_URL}/api/stripe/redirect?success=true&session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: `${env.SERVER_URL}/api/stripe/redirect?canceled=true`,
	};
	if (!req.body.customerId) {
		config.customer_email = req.body.email;
	} else if (req.body.customerId) {
		config.customer = req.body.customerId;
	} else {
		res.status(400).json({ message: "customerId or email is required" });
	}
	const session = await stripe.checkout.sessions.create(config);

	res.json({ url: session.url });
});

const redirectURLToChromeURL = asyncHandler(async (req, res) => {
	// get everything after the question mark
	const url = req.url.split("?")[1] || "";
	// prepend the chrome:// scheme
	const chromeURL = env.FRONTEND_URL + "?" + url;
	res.redirect(chromeURL);
});

const createPortalSession = asyncHandler(async (req, res) => {
	const { customer_id } = req.body;

	const returnUrl = `${env.SERVER_URL}/api/stripe/redirect`;

	const portalSession = await stripe.billingPortal.sessions.create({
		customer: customer_id,
		return_url: returnUrl,
	});

	res.json({ url: portalSession.url });
});

const webhook = asyncHandler(async (req, res) => {
	// Replace this endpoint secret with your endpoint's unique secret
	// If you are testing with the CLI, find the secret by running 'stripe listen'
	// If you are using an endpoint defined with the API or dashboard, look in your webhook settings
	// at https://dashboard.stripe.com/webhooks
	const endpointSecret = env.STRIPE_WH_SECRET;
	// Only verify the event if you have an endpoint secret defined.
	// Otherwise use the basic event deserialized with JSON.parse
	const sig = req.headers["stripe-signature"];
	// console.log("req.body", req.body);
	const payloadString = JSON.stringify(req.body, null, 2);
	// const header = stripe.webhooks.generateTestHeaderString({
	// 	payload: payloadString,
	// 	secret: endpointSecret,
	// });
	// use header in testing, sig in production

	let event;

	try {
		event = stripe.webhooks.constructEvent(payloadString, sig, endpointSecret);
	} catch (err) {
		console.log(`⚠️  Webhook signature verification failed.`, err.message);
		res.status(400).send(`Webhook Error: ${err.message}`);
		return;
	}

	let subscription;
	let status;
	// Handle the event
	switch (event.type) {
		case "customer.subscription.trial_will_end":
			subscription = event.data.object;
			status = subscription.status;
			console.log(`Subscription status is ${status}.`);
			// Then define and call a method to handle the subscription trial ending.
			// handleSubscriptionTrialEnding(subscription);
			break;
		case "customer.subscription.deleted":
			subscription = event.data.object;
			status = subscription.status;
			console.log(`Subscription status is ${status}.`);
			// Then define and call a method to handle the subscription deleted.
			// handleSubscriptionDeleted(subscriptionDeleted);
			break;
		case "customer.subscription.created":
			subscription = event.data.object;
			status = subscription.status;
			console.log(`Subscription status is ${status}.`);
			// Then define and call a method to handle the subscription created.
			// handleSubscriptionCreated(subscription);
			break;
		case "customer.subscription.updated":
			subscription = event.data.object;
			status = subscription.status;
			console.log(`Subscription status is ${status}.`);
			handleSubscriptionUpdated(subscription);
			break;
		case "customer.deleted":
			const customer = event.data.object;
			console.log(`Customer deleted: ${customer.id}`);
			break;
		default:
			// Unexpected event type
			console.log(`Unhandled event type ${event.type}.`);
	}
	// Return a 200 response to acknowledge receipt of the event
	res.send();
});

const handleSubscriptionUpdated = async (subscription) => {
	// look up user in auth0 by customer email, then update the user_metadata
	const customer = await stripe.customers.retrieve(subscription.customer);
	const users = await auth0Management.getUsersByEmail(customer.email);
	if (!users || users.length === 0) {
		console.log(`No user found with email ${customer.email}`);
		return;
	} else if (users.length > 1) {
		console.log(`Multiple users found with email ${customer.email}`);
		return;
	}
	const user = users[0];
	const app_metadata = user.app_metadata || {};
	app_metadata.subscription = subscription;
	await auth0Management.updateAppMetadata({ id: user.user_id }, app_metadata);
};

module.exports = {
	createCheckoutSession,
	createPortalSession,
	redirectURLToChromeURL,
	webhook,
};
