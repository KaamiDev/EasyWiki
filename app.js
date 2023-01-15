require('dotenv').config();
const express = require('express');
const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static('public'));

app.use('/', require('./routes/home.js'));
app.use('/result', require('./routes/result.js'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log('Now listening on port ' + PORT);
});
