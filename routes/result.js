const express = require('express');
const axios = require('axios');
const { Configuration, OpenAIApi } = require('openai');
const router = express.Router();

const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

router.get('/', (req, res) => {
	res.redirect('/');
});

router.post('/', async (req, res) => {
	let { w_link, s_type } = req.body;

	w_link = w_link.split('#')[0];

	try {
		w_title = w_link.replace('http://', 'https://');
		w_title = w_title.replace('https://en.wikipedia.org/wiki/', '');

		if (w_title.includes('/')) {
			throw new Error();
		}
		let wiki_response = await axios.get(
			`https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exlimit=1&titles=${w_title}&explaintext=1&exsectionformat=plain&format=json`
		);
		wiki_info = wiki_response.data.query.pages[Object.keys(wiki_response.data.query.pages)[0]].extract;

		if (!wiki_info) {
			throw new Error();
		}
		let completion;
		if (s_type === 'simple_summary') {
			completion = await openai.createCompletion({
				model: 'text-davinci-003',
				prompt: `Explain the contents of the wikipedia article on "${w_title}" using simplified vocabulary. Go into significant detail while still maintaining vocabulary that can be understood by even children.`,
				temperature: 0,
				max_tokens: 1000,
				top_p: 1,
				frequency_penalty: 0.5,
				presence_penalty: 0
			});
		} else if (s_type === 'explained_like_5') {
			completion = await openai.createCompletion({
				model: 'text-davinci-003',
				prompt: `Explain the contents of the wikipedia article on "${w_title}" using the vocabulary of a 5 year old. Go into significant detail while still maintaining vocabulary that can be understood by a 5 year old child.`,
				temperature: 0,
				max_tokens: 1000,
				top_p: 1,
				frequency_penalty: 0.5,
				presence_penalty: 0
			});
		}

		w_title = wiki_response.data.query.pages[Object.keys(wiki_response.data.query.pages)[0]].title;
		let content_body = completion.data.choices[0].text;

		while (content_body.slice(0, 1) === '\n') {
			content_body = content_body.slice(1);
		}
		content_body = content_body.replaceAll('\n', '<br />');

		res.render('result', {
			content_description: content_body,
			content_title: w_title,
			content_type: s_type,
			wiki_link: w_link
		});
	} catch (error) {
		res.render('error');
	}
});

module.exports = router;
