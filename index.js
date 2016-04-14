var cool = require('cool-ascii-faces');
var bodyParser = require('body-parser');
var multer = require('multer');
var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// app.use(bodyParser.json());         
// app.use(bodyParser.urlencoded({ extended: true }));                                
// app.use(multer);

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

  console.log('incoming-request' + JSON.stringify(req.body));
  // messaging_events = req.body.entry[0].messaging;
  // for (i = 0; i < messaging_events.length; i++) {
  //   event = req.body.entry[0].messaging[i];
  //   sender = event.sender.id;
  //   if (event.message && event.message.text) {
  //     text = event.message.text;
  //     // Handle a text message from this sender
  //     console.log('message-received: ' + text);
  //   }
  // }
  res.sendStatus(200);
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


