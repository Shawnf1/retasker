var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var expressJwt = require('express-jwt');
//var angular = require('angular');
//var moment = require('moment');
//var angularMoment = require('angular-moment');

var index = require('./routes/index');
var authenticate = require('./routes/authenticate');
var register = require('./routes/register');
var tasks = require('./routes/tasks');
var tags = require('./routes/tags');
var notes = require('./routes/notes');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/notes', expressJwt({secret: 'kindaSecret'}));
app.use('/tasks', expressJwt({secret: 'kindaSecret'}));
app.use('/tags', expressJwt({secret: 'kindaSecret'}));

app.use('/authenticate', authenticate);
//app.use('/users', users);
app.use('/register', register);
app.use('/tasks', tasks);
app.use('/tags', tags);
app.use('/notes', notes);
app.use('/', index);

//app.use('/private/*', expressJwt({secret: 'Über_spaß_token'}));

// Sets up protection for all /api routes, using json web tokens
//app.use('/api/*', expressJwt({secret: 'kindaSecret'}));

//app.use('/', expressJwt({secret: 'kindaSecret'}));
app.use(function (err, req, res, next) {
	if (err.name === 'UnauthorizedError') {
		//res.send(401, 'invalid token...');
		res.redirect('/');
	}
});

var mongoURI = "mongodb://localhost:27017/retasker";
var MongoDB = mongoose.connect(mongoURI).connection;

MongoDB.on('error', function (err) {
	console.log('mongodb connection error', err);
});

MongoDB.once('open', function () {
	console.log('mongodb connection open');
});

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


module.exports = app;
