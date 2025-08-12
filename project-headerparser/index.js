// index.js
// where your node app starts

// init project
require('dotenv').config();
const axios = require('axios')
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
var cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// your first API endpoint...
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.set('trust proxy', true)

// @TODO: return ipadress, language, and software as json result

app.get('/api/whoami', async (req, res) => {
  try {
      const { data } = await axios.get('https://api.ipify.org?format=json');
      res.json({
        ipadress: data.ip,
        language: req.headers['accept-language'],
        software: req.headers['user-agent']
      })
  } catch (err) {
       res.json({
      ipaddress: req.ip,
      language: req.headers['accept-language']?.split(',')[0],
      software: req.headers['user-agent']
    });
  }
})

// listen for requests :)
var listener = app.listen(process.env.PORT || 3001, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
