require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

const urlDatabase = {}

app.post('/api/shorturl', (req, res) => {
  const { url } = req.body

  if (!url) {
    return res.json({error: 'invalid url'})
  }

  let checkUrl;
  try {
    checkUrl = new URL(url)
  } catch (err) {
    return res.json({error: 'invalid url'})
  }

  if (!['http:', 'https:'].includes(checkUrl.protocol)) {
    return res.json({error: 'invalid url'})
  }

  const urlCode = Math.floor(10000 + Math.random() * 90000);
  urlDatabase[urlCode] = url

  res.json({
    original_url: `${url}`,
    short_url: urlCode
  })
})

app.get('/api/shorturl/:url', (req, res) => {
  const { url } = req.params
  const getUrl = urlDatabase[url];

  if (!getUrl) {
   return res.json({error: 'invalid url'})
  } 

  res.redirect(getUrl)
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
