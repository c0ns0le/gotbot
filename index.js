var cool = require('cool-ascii-faces');
var bodyParser = require('body-parser');
var multer = require('multer');
var request = require('request');
var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.get('/cool', function (request, response) {
    response.send(cool());
});

app.get('/gotbot', function (request, response) {
    response.render('pages/gotbot');
});

app.get('/webhooks', function (request, response) {
  if (request.query['hub.verify_token'] === 'gotbot') {
    response.send(request.query['hub.challenge']);
  }
  response.send('Error, wrong validation token');
});

app.post('/webhooks/', function (req, res) {

    var token = 'CAAXinhPErpYBAFbb7CZAhGMs3QA7I2qYVqQdahC8ZBE7TllPxMmpROZCzfDzNIVmn4NMmFHxgf164uzcBQxbLfs5S8w6nZCT6aSnG1ZAzyWoQNflfBWG9lZBIK7cuorAxyZC1Ipfd1daZCh0zlqlzMumBBEGxTv2eCdwAwmp6NLc1zsU2U03Azz2uJNrN1JLzOgZD';

    function sendTextMessage(sender, text) {
      messageData = {
        text:text
      }
      request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
          recipient: {id:sender},
          message: messageData,
        }
      }, function(error, response, body) {
        if (error) {
          console.log('Error sending message: ', error);
        } else if (response.body.error) {
          console.log('Error: ', response.body.error);
        }

        console.log('message echoed succesfully to sender ' + sender);
      });
    }

    function processIncomingRequest(req, res) {
      console.log('incoming-request' + JSON.stringify(req.body));
      messaging_events = req.body.entry[0].messaging;
      for (i = 0; i < messaging_events.length; i++) {
        var event = req.body.entry[0].messaging[i];
        var sender = event.sender.id;
        if (event.message && event.message.text) {
          var text = event.message.text;
          // Handle a text message from this sender
          console.log('message-received: ' + text);
          sendTextMessage(sender, "Text received, echo: "+ text.substring(0, 200));          
        }
      }
      res.sendStatus(200);
    }

    processIncomingRequest();
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


