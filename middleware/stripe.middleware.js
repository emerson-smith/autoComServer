const env = require("../config/env.js");
const stripe = require("stripe")(env.STRIPE_SECRET_KEY);

const validatePaidUser = async (req, res, next) => {
	const customerId = req.body.customerId;
	const subscriptions = await stripe.subscriptions.list({
		customer: customerId,
	});
	const subscription = subscriptions.data[0];
	if (subscription.status === "active") {
		next();
	} else {
		res.status(402).json({ message: "Payment required" });
	}
};

module.exports = {
	validatePaidUser,
};
