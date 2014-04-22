var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('static-favicon');
var bodyParser = require('body-parser');
var cors = require('cors');
var _ = require('underscore');
var routes = require('./routes');


var app = express();

app.use(express.cookieParser());
app.use(express.cookieSession({
    secret: '1234567890QWERTY'
}));

app.use('/', express.static(__dirname + '/app'));
app.use(express.static(__dirname + '/app'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.use(app.router);

routes(app);


var server = app.listen(3100, function(){
    console.log('listening on 3100');
})


module.exports = app;
