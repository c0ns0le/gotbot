var user = require('./user');
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

var userMap = {};

app.post('/webhooks/', function (req, res) {

    var token = 'CAAXinhPErpYBAFbb7CZAhGMs3QA7I2qYVqQdahC8ZBE7TllPxMmpROZCzfDzNIVmn4NMmFHxgf164uzcBQxbLfs5S8w6nZCT6aSnG1ZAzyWoQNflfBWG9lZBIK7cuorAxyZC1Ipfd1daZCh0zlqlzMumBBEGxTv2eCdwAwmp6NLc1zsU2U03Azz2uJNrN1JLzOgZD';
    var human = true;
    var bot = false;

    function finalSendMessage(sender, messageData) {
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
      });
    }

    function sendBillSummaryMessage(sender) {
      messageData = {
        "attachment": {
          "type": "template",
          "payload": {
            "template_type": "generic",
            "elements": [{
              "title": "Monthly Statement",
              "subtitle": "Summary",
              "image_url": "http://boiling-earth-21093.herokuapp.com/tmobilebillsummary.jpg",
              "buttons": [{
                "type": "web_url",
                "url": "http://boiling-earth-21093.herokuapp.com/tmobilebilldetail.jpg",
                "title": "Details"
              }, {
                "type": "postback",
                "title": "Pay now",
                "payload": "{tmobile-pay-now}",
              }],
            },{
              "title": "Billing topics",
              "subtitle": "Select the billing topic you need help with",
              "buttons": [{
                "type": "web_url",
                "url": "https://support.t-mobile.com/community/billing/payments",
                "title": "Payments"
              }],
            }]
          }
        }
      };

      finalSendMessage(sender, messageData);
    }

    function sendGenericMessage(sender) {
      messageData = {
        "attachment": {
          "type": "template",
          "payload": {
            "template_type": "generic",
            "elements": [{
              "title": "First card",
              "subtitle": "Element #1 of an hscroll",
              "image_url": "http://messengerdemo.parseapp.com/img/rift.png",
              "buttons": [{
                "type": "web_url",
                "url": "https://www.messenger.com/",
                "title": "Web url"
              }, {
                "type": "postback",
                "title": "Postback",
                "payload": "Payload for first element in a generic bubble",
              }],
            },{
              "title": "Second card",
              "subtitle": "Element #2 of an hscroll",
              "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
              "buttons": [{
                "type": "postback",
                "title": "Postback",
                "payload": "Payload for second element in a generic bubble",
              }],
            }]
          }
        }
      };

      finalSendMessage(sender, messageData);
    }

    function sendUpsellMessage(sender) {
      sendTextMessage(sender, "Upsell! Upsell!", human, 2000);
    };

    function sendTextMessage(sender, text, isHuman, afterTime) {

      if (afterTime !== undefined) {
        setTimeout(function () {
          sendTextMessage(sender, text, isHuman);
        }, afterTime);
        return;
      }

      if (isHuman !== human) {
        text = text + '\n*T-Force bot';
      }

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

    function processMessage(sender, userInfo, text) {

        var query = text.toLowerCase(); // Query alteration

        if (query.indexOf('bill') > -1) {
          sendBillSummaryMessage(sender, text);
          return;
        }

        if (query.indexOf('data') > -1) {
            sendTextMessage(sender, "Our team is looking into this. We will get back to you shortly", bot, 3000);
            sendTextMessage(sender, "Hi! We looked into your records and found that you have been " +
              "watching lot of \"media\" on 3G cellular network. Do you have WIFi turned on, We strongly suggest using WiFi whenever available" +
              "Let us know if there is anything else we can help you with?\n*JacobG", human, 20000);

          return;
        }
        if (query.indexOf('gotbot') > -1) {
          sendGenericMessage(sender);
          return;
        }

        if (query.indexOf('reset') > -1) {
          userMap[sender] = undefined;
          return;
        }

        if (query.indexOf('thank') > -1) {
          sendUpsellMessage(sender);
          return;
        }

        sendTextMessage(sender, 'Hi ' + userInfo.first_name + '. echo: ' + text.substring(0, 200));
    }

    function processIncomingRequest(req, res) {
      console.log('incoming-request' + JSON.stringify(req.body));
      messaging_events = req.body.entry[0].messaging;
      for (i = 0; i < messaging_events.length; i++) {
        var event = req.body.entry[0].messaging[i];
        var sender = event.sender.id;

        if (event.postback) {
            text = JSON.stringify(event.postback);
            sendTextMessage(sender, "Postback received: "+text.substring(0, 200), token);
            continue;
        }

        if (event.message && event.message.text) {
          var text = event.message.text;
          // Handle a text message from this sender
          console.log('message-received: ' + text);

          var randomPinMessages = [
            "Please enter last 4 digits of your SSN to authenticate.",
            "I need your SSN before we can help you.",
            "You cannot procceed without 4 digits of your SSN",
            "SSN Please!",
            "I am sorry we cannot help you here. GO AWAY!"
          ];

          var userInfo = userMap[sender];
          if (userInfo === undefined) {
            user.getUserInfo(sender, token, function (err, userInformation) {
              userInfo = userInformation || {first_name: 'unknown', last_name: 'unknown'};
              userMap[sender] = userInfo;

              var welcomeString = 'Hi ' + userInfo.first_name + ' ' + userInfo.last_name + '. Great to hear from you.';

              sendTextMessage(sender, welcomeString);

              userInfo.authenticated = 0;

              sendTextMessage(sender, randomPinMessages[0], bot, 1500);
            });
          } else {
            if (userInfo.authenticated >= 0) {
               if (text.indexOf("1234") === -1) {
                 userInfo.authenticated = Math.min(userInfo.authenticated +  1, randomPinMessages.length -1);
                 sendTextMessage(sender, randomPinMessages[userInfo.authenticated]);
               } else {
                  userInfo.authenticated = -1;
                  sendTextMessage(sender, "Thats great! How may I help you Mr " + userInfo.last_name);
               }
            } else {
              processMessage(sender, userInfo, text);
            }
          }
        }
      }
      res.sendStatus(200);
    }

    processIncomingRequest(req, res);
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


