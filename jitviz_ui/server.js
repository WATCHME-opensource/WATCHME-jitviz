var express = require('express');
var debug = require('debug')('JITVIZ:server');
var logger = require('morgan');
var cors = require('express-cors');
var path = require('path');

var port = process.env.PORT || 8080;

var app = express();

app.use(cors({
    allowedOrigins: [
        'http://localhost:8080'
     ],
    methods: [
        'GET'
    ]
}));
app.use(logger('dev'));

// EPASS returns iso-8859-1
app.use(function(req, res, next) {
  console.log("Req from ", req.path);
  if (path.extname(req.path) === '.html') {
    res.set('content-type', "text/html; charset=iso-8859-1");
  }
  else if (path.extname(req.path) === '.js') {
    res.set('content-type', "application/javascript; charset=iso-8859-1");
  }
  next();
});

app.use(express.static('public'));

app.listen(port);
console.log('Static server is running on ' + port);

module.exports = app;
