const express = require("express");
const cors = require("cors");
const colors = require("colors");
const env = require("./config/env");

const { autoComRouter } = require("./autoCom/autoCom.router");
const { stripeRouter } = require("./stripe/stripe.router");
const { notFoundHandler } = require("./middleware/notFound.middleware");

const app = express();
const apiRouter = express.Router();

app.use(
	express.json({
		verify: (req, res, buf) => {
			req.rawBody = buf;
		},
	})
);
app.use(express.urlencoded({ extended: true }));

// Enable CORS, allowing localhost and chrome-extension://
app.use(
	cors({
		origin: ["http://localhost:3000", "chrome-extension://dbpjdckgiaociaogoagpnellakojaabd"],

		// Allow cookies to be sent from the client
		credentials: true,

		// Allow these methods to be sent from the client
		methods: ["GET", "POST"],
	})
);

// API routes
app.use("/api", apiRouter);
apiRouter.use("/autoCom", autoComRouter);
apiRouter.use("/stripe", stripeRouter);

// Error handlers
app.use(notFoundHandler);

app.listen(env.PORT, () => {
	console.log(`Listening on port ${env.PORT}`.bgGreen);
});
