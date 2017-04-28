/*
* FB Messenger Bot Challenge.
* InvestiSave Bot. (Weka)
* Tool for Financial Inclusion
* @brugambwa(git) @bobnsky(twitter)
*/
var express = require('express');
var bodyParse = require('body-parser');
var port = Number(process.env.PORT || 7478);
var routes = require('./routes/indexRouter');

var socialSaverApp = express();


// mount all routes on /api path
socialSaverApp.use('/api', routes);

socialSaverApp.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

socialSaverApp.listen(port, function () {
    console.log('Listening on Port: *:' + port);
});