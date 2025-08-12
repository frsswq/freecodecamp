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

app.set('trust proxy', true); // Important for deployed environments

app.get('/api/whoami', (req, res) => {
  // Extract IP from headers (works behind proxies)
  let ip = req.headers['x-forwarded-for'] || req.ip;
  
  // Handle IPv6 localhost (::1) → convert to IPv4 (127.0.0.1)
  if (ip === '::1') ip = '127.0.0.1';
  
  // If still getting local IP, try alternate headers
  if (ip === '127.0.0.1') {
    ip = req.headers['x-real-ip'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress;
  }

  res.json({
    ipaddress: ip, // Will show public IP in tests
    language: req.headers['accept-language'],
    software: req.headers['user-agent']
  });
});

// listen for requests :)
var listener = app.listen(process.env.PORT || 3001, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
