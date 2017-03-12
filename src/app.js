
var path = require('path');

var express = require('express');
var morgan = require('morgan')
var parseurl = require('parseurl');
var session = require('express-session');
var favicon = require('serve-favicon');

console.level = 'debug';

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();
app.use(morgan('\x1b[32minfo\x1b[0m: :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length]', {
  skip: function (req, res) { return res.statusCode < 400 && req.url != "/" && req.originalUrl.indexOf("/api") < 0}
}));

app.use(session({
  secret: 'pcYkbd7BSGEk8ySfC7VngbadEadA',
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 30 * 60 * 1000 // 30 minutes
  }
})); 

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components',  express.static('../bower_components'));

var routes = require('./routes/login');
var webapp = require('./routes/web-app');
var api = require('./routes/api');
var oauth = require('./routes/oauth');
var mailer = require('./routes/mailer');
app.use('/', routes);
app.use('/web-app/', webapp);
app.use('/api/', api);
app.use('/oauth', oauth);
app.use('/mailer', mailer);


app.get('/fail', function (req, res, next) {
  setTimeout(function () {
    var nu = null;
    nu.access();

    res.send('Hello World');
  }, 1000);
});
app.get('*', function(req, res) {
    res.redirect('/');
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
