var apiai = require('apiai');

var app = apiai("5c18bae911984e1baef474d55a14c1da");

function understandQuery(query, callback) {
    var request = app.textRequest(query);

    request.on('response', function(response) {
        callback(null, response);
    });
     
    request.on('error', function(error) {
        callback(error);
    });
     
    request.end();
}

function test(query) {

    understandQuery(query, function queryResponse(error, response) {

        if (error) {
            console.log(error);
            return;
        }

        console.log(response);
    });
}

module.exports = {
    understandQuery: understandQuery,
    test: test
};