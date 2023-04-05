const asyncHandler = require("express-async-handler");
const env = require("../config/env.js");
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
	apiKey: env.OPENAI_API_KEY,
});

// @desc    Generate Email using Open AI
// @route   POST /api/autoCom/generateEmailBody
// @access  Private
const generateEmailBody = asyncHandler(async (req, res, next) => {
	// console.log(req.body);
	// check for form data in request
	const formData = req.body;
	if (!formData) {
		res.status(400).json({ error: "Missing form data." });
		throw new Error("Missing prompt.");
	}
	if (!formData.typeOfCompletion) {
		res.status(400).json({ error: "Missing type of completion." });
		throw new Error("Missing type of completion.");
	}
	if (!formData.bodyBefore) {
		res.status(400).json({ error: "Missing body before." });
		throw new Error("Missing body before.");
	}
	if (!formData.bodyAfter) {
		formData.bodyAfter = " ";
	}

	// Create Open AI API instance
	const openai = new OpenAIApi(configuration);

	// Create prompts
	const systemPrompt =
		'You are a email writing assistant. You help write clear, direct, concise emails for the user. The user will show you the email they have written so far, and you will help write it. The user will mark the location of where you\'ll be writing with the characters "[WRITE_HERE]". Mimic the style and tone of the user. Do not repeat any ideas already expressed in the email. Do not write the full email. Do not return anything other than what additional text you are suggesting. Do not write [WRITE_HERE]. Do not rewrite the entire email. Only return the characters that will be inserted.';
	let prompt = "";
	let initialPrompt = "";
	let lineStop = true;
	if (formData.typeOfCompletion === "paragraph" && formData.bodyAfter.length < 6) {
		initialPrompt = `finish this email starting at the [WRITE_HERE] tag. \n\nHere is the email:\n---\n`;
		lineStop = false;
	} else if (formData.typeOfCompletion === "paragraph" && formData.bodyAfter.length > 6) {
		initialPrompt = `write a short paragraph that will be inserted into the email at the [WRITE_HERE] tag. Only write 1 paragraph. Your response will be replacing the [WRITE_HERE] marker, so do not respond with it. \n\nHere is the email:\n---\n`;
		lineStop = false;
	} else if (formData.typeOfCompletion === "line") {
		initialPrompt = `Continue writing at the location of the [WRITE_HERE] marker. Your response will be replacing the [WRITE_HERE] marker, so do not respond with it. Do not rewrite the entire email, only add to it. \n\nHere is the email:\n---\n`;
		lineStop = false;
	}

	if (formData.additionalContext) {
		prompt += "Here is additional context about me:\n" + formData.additionalContext + "\n\n";
	}

	if (formData.replyContext) {
		if (formData.replyContext.latestMessageBody && formData.replyContext.latestMessageBody.length > 0) {
			if (formData.replyContext.latestMessageSender && formData.replyContext.latestMessageSender.length > 0) {
				prompt +=
					"Here are the previous emails in this email chain for context:\n---\n\nLatest email, from " +
					formData.replyContext.latestMessageSender +
					" -\n";
			} else {
				prompt += "Here are the previous emails in this email chain for context:\n---\n\nLatest email -\n";
			}
			prompt += formData.replyContext.latestMessageBody + "\n\n";
		}
		if (formData.replyContext.latestMessageQuote && formData.replyContext.latestMessageQuote.length > 0) {
			prompt += "Earlier Emails -\n" + formData.replyContext.latestMessageQuote + "\n\n---\n\n";
		}
		prompt += "Help me with a response.";
	}

	prompt += initialPrompt + formData.bodyBefore + "[WRITE_HERE]\n" + formData.bodyAfter + "\n---\n";

	let completionConfig = {
		model: "gpt-3.5-turbo",
		messages: [
			{
				role: "system",
				content: systemPrompt,
			},
			{
				role: "user",
				content: prompt,
			},
		],
		temperature: 0.8,
		frequency_penalty: 1,
		presence_penalty: 1,
	};

	if (lineStop) {
		completionConfig.stop = ["\n"];
	}

	// console.log(completionConfig);
	// Create completion
	const response = await openai.createChatCompletion(completionConfig);

	// remove the [WRITE_HERE] tag from the response using regex
	let suggested_text = response.data.choices[0].message.content;
	suggested_text = suggested_text.replace(/\[WRITE_HERE\]/g, "");

	// console.log(suggested_text);

	res.status(201).json({ suggested_text });
});

module.exports = {
	generateEmailBody,
};
