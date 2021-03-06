var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sassMiddleware = require('node-sass-middleware');
var session = require('express-session');
var methodOverride = require('method-override');
var flash = require('connect-flash');
var mongoose   = require('mongoose');
var passport = require('passport');

var index = require('./routes/index');
var users = require('./routes/users');
var event = require('./routes/events');
// var question = require('./routes/questions');
// var reviews = require('./routes/reviews');
var passportConfig = require('./lib/passport-config');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
if (app.get('env') === 'development') {
  app.locals.pretty = true;
}

// Pug의 local에 moment라이브러리와 querystring 라이브러리를 사용할 수 있도록.
app.locals.moment = require('moment');
app.locals.querystring = require('querystring');

//=======================================================
// mongodb connect
//=======================================================
mongoose.Promise = global.Promise; // ES6 Native Promise를 mongoose에서 사용한다.
// const connStr = 'mongodb://localhost/mjdb';
// 아래는 mLab 접속 String
// const connStr = 'mongodb://[유저이름]:[ㅂㅣ번 넣으셈]@ds259325.mlab.com:59325/momo_sweepty';
mongoose.connect(connStr, {useMongoClient: true });
mongoose.connection.on('error', console.error);

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// _method를 통해서 method를 변경할 수 있도록 함. PUT이나 DELETE를 사용할 수 있도록.
app.use(methodOverride('_method', {methods: ['POST', 'GET']}));

// sass, scss를 사용할 수 있도록
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: false, // true = .sass and false = .scss
  debug: true,
  sourceMap: true
}));

// session을 사용할 수 있도록.
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: 'long-long-long-secret-string-1313513tefgwdsvbjkvasd'
}));

app.use(flash()); // flash message를 사용할 수 있도록

// public 디렉토리에 있는 내용은 static하게 service하도록.
app.use(express.static(path.join(__dirname, 'public')));

// pug의 local에 현재 사용자 정보와 flash 메시지를 전달하자.
app.use(function(req, res, next) {
  // res.locals.currentUser = req.session.user;
  // // res.locals.currentUser = req.user;
  // res.locals.flashMessages = req.flash();
  // next();
  if (req.isAuthenticated()) {
    res.locals.currentUser = req.user;
  } else if (req.session.user) {
    res.locals.currentUser = req.session.user;
  } else {}
  res.locals.flashMessages = req.flash();
  next();
});
//=======================================================
// Passport 초기화
//=======================================================
app.use(passport.initialize());
app.use(passport.session());
passportConfig(passport);

// Route
app.use('/', index);
app.use('/users', users);
app.use('/events', event);
// app.user('/questions',question);
// app.use('/ticekts',tickets);
require('./routes/auth')(app, passport);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
