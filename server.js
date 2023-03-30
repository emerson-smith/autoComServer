const express = require("express");
const cors = require("cors");
const colors = require("colors");
const env = require("./config/env");

const { autoComRouter } = require("./autoCom/autoCom.router");
const { notFoundHandler } = require("./middleware/notFound.middleware");

const app = express();
const apiRouter = express.Router();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// // Set content type to JSON
// app.use((req, res, next) => {
// 	res.contentType("application/json");
// 	next();
// });

// Enable CORS, allowing all origins
app.use(
	cors({
		origin: "*",
	})
);

// API routes
app.use("/api", apiRouter);
apiRouter.use("/autoCom", autoComRouter);

// Error handlers
app.use(notFoundHandler);

app.listen(env.PORT, () => {
	console.log(`Listening on port ${env.PORT}`.bgGreen);
});
