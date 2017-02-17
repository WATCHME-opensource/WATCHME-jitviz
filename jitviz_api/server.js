var express = require('express');
var debug = require('debug')('JITVIZ:server');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cors = require('express-cors');

var config = require('./env.json')[process.env.NODE_ENV || 'development'];
var jitRoutes = require('./routes/jit_routes');
var vizRoutes = require('./routes/viz_routes');

var port = process.env.PORT || config.NODE_PORT || 8081;

var api = express();

api.use(cors({
  allowedOrigins: [
        'http://localhost:8080'
  ],
  methods: [
      'GET'
  ]
}));
api.use(logger('dev'));
api.use(bodyParser.json());
api.use(bodyParser.urlencoded({ extended: false }));
api.use('/api/jit', jitRoutes);
api.use('/api/viz', vizRoutes);

api.listen(port);
console.log('Server is running on ' + port);

module.exports = api;
