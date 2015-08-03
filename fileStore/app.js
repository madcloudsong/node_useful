var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var multer = require('multer');

var routes = require('./routes/index');
var login = require('./routes/login');
var register = require('./routes/register');
var download = require('./routes/download');
var logout = require('./routes/logout');
var upload = require('./routes/upload');
var manage = require('./routes/manage');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser('test'));
app.use(session({secret: 'test', 'name' : 'testapp', resave: false, saveUninitialized: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(multer({
  dest:'./uploads',
  onFileUploadStart: function (file, req, res) {
    console.log(file.fieldname + ' is starting ...')
  },
  onFileUploadComplete: function (file, req, res) {
    console.log(file.fieldname + ' uploaded to  ' + file.path)
  }
}));

app.use('/', routes);
app.use('/index', routes);
app.use('/login', login);
app.use('/register', register);
app.use('/download', download);
app.use('/logout', logout);
app.use('/upload', upload);
app.use('/manage', manage);

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

app.listen(8100, function(){
  console.log("server start");
});

module.exports = app;
