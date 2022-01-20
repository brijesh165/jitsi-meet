const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const fs = require('fs');
const env = require('dotenv').config();
const cors = require('cors');
const app = express();


let privateKey = fs.readFileSync('sslcert/wildcard_teamlocus_com.key', 'utf8');
let certificate = fs.readFileSync('sslcert/b36c27178f57ff88.crt', 'utf8');
let credentials = { key: privateKey, cert: certificate, ca: fs.readFileSync('sslcert/gd_bundle-g2-g1.crt') };

const server = require('http').Server(app);
const https = require('https');
let httpsServer = https.createServer(credentials, app);
// httpsServer = https.createServer(credentials, app);
let io = require('socket.io')(httpsServer, {
  pingInterval: 5000, // default - 5000
  pingTimeout: 30000,
  cors: {
    origin: '*',
    methods: ["GET", "POST"],
    credentials: true
  }
});
let socketIO = require('./util/socket-manager').openIO(io);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

require('./routes')(app);
require('./util/schedule-manager');

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

server.listen(process.env.HTTP_PORT, function () {
  console.log(`ASHAR SERVICE listening on ${process.env.HTTP_PORT}`);
});

httpsServer.listen(process.env.HTTPS_PORT, function () {
  console.log(`ASHAR SERVICE listening on ${process.env.HTTPS_PORT}`);
});


module.exports = app;
