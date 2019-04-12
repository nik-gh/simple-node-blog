const express = require('express');
const path = require('path');
// const favicon = require('serve-favicon');
const logger = require('morgan');
const expressValidator = require('express-validator');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bodyParser = require('body-parser');
// const mongo = require('mongodb');
const multer = require('multer');
const flash = require('connect-flash');
const { DB } = require('./helper');
const db = require('monk')(DB);

const routes = require('./routes/index');
const posts = require('./routes/posts');
const categories = require('./routes/categories');

const app = express();

app.locals.moment = require('moment');

app.locals.truncateText = (text, length) => {
  const truncateText = text.substring(0, length);
  return truncateText;
};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Handle file uploads
app.use(multer({ dest: './public/images/uploads' }).single('mainimage'));

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Handle Express Sessions
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true,
}));

// Validator
app.use(expressValidator({
  errorFormatter(param, msg, value) {
    const namespace = param.split('.'),
      root = namespace.shift();
    let formParam = root;

    while (namespace.length) {
      formParam += `[${namespace.shift()}]`;
    }
    return {
      param: formParam,
      msg,
      value,
    };
  },
}));

app.use(express.static(path.join(__dirname, 'public')));

// Connect flash
app.use(flash());
app.use((req, res, next) => {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Make db accessible to our router
app.use((req, res, next) => {
  req.db = db;
  next();
});

app.use('/', routes);
app.use('/posts', posts);
app.use('/categories', categories);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {},
  });
});

module.exports = app;
