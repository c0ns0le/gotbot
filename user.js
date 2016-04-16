var request = require('request');

function getUserInfo(sender, appToken, callback) {
  request({
    url: 'https://graph.facebook.com/v2.6/' + sender,
    qs: {access_token:appToken},
    method: 'GET'
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }

    callback(error || response.body.error, JSON.parse(response.body || '{}'));
  });
}

function test() {

  var userId = '1075147622541780';
  var appToken = 'CAAXinhPErpYBAFbb7CZAhGMs3QA7I2qYVqQdahC8ZBE7TllPxMmpROZCzfDzNIVmn4NMmFHxgf164uzcBQxbLfs5S8w6nZCT6aSnG1ZAzyWoQNflfBWG9lZBIK7cuorAxyZC1Ipfd1daZCh0zlqlzMumBBEGxTv2eCdwAwmp6NLc1zsU2U03Azz2uJNrN1JLzOgZD';

  getUserInfo(userId, 
    appToken, 
    console.log);
}

module.exports = {
  getUserInfo: getUserInfo,
  test: test
};
