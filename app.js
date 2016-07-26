var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session       = require('express-session');
var multipart = require('connect-multiparty');
var uuid = require('uuid');
var redis = require('redis');

var app = express();

var http = require('http').Server(app);
var mongoose = require('mongoose');
var redisClient = redis.createClient();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(cookieParser());
app.use(multipart());
app.use(session({

        secret: 'q~!!#s4HALA^MADRIDcds4<>>*S3--_-`´ç@',
        saveUninitialized:  false,
        resave:       false
      }));
app.use(express.static(path.join(__dirname, 'public')));

require('./db/mongoose_config')(mongoose);

redisClient.on('connect', function (){
    console.log('New Redis Client Connect since now');
});

require('./routes/routes_www')(app);
require('./routes/routes_API')(app, redisClient, uuid);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var port = process.env.PORT || 8080;
http.listen(port,function () {
   
   console.log ('Escuchando por el puerto ',port);

});