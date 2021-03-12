var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var app_s = express();
var app = express();

var debug = require('debug')('helloexpress:server');
var http = require('http'); // before it was http
var https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('.key/private.pem'), // 개인 키 지정
  cert: fs.readFileSync('.key/certificate.crt.pem'), // 서버 인증서 지정
  ca: fs.readFileSync('.key/ca_bundle.crt.pem') // 루트 체인 지정
};

var port = normalizePort(process.env.PORT || '80'); // before it was 80
var port_s = normalizePort(process.env.PORT || '443');
app_s.set('port', port_s);

var server = http.createServer(app);
var server_s = https.createServer(options, app_s);
// socket 통신 관련
var socket = require('socket.io');
var io = socket(server_s);

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

server_s.listen(port_s);
server_s.on('error', onError);
server_s.on('listening', onListening);



//console.log("Server is start/restart"); 서버 시작시 콘솔창 출력

app_s.use(session({
  //secure:true //https통신일때만 session을 주고받을수있다(반드시!!https)
  //httpOnly: true, //xxs방지
  secret: 'keyboard cat', //세션을 암호화
  resave: false, //값이 바뀔때만 저장한다.
  saveUninitialized: true, //session이 필요하기 전까지는 실행시키지않는다
  //store: new FileStore() //파일생성
}));

//view engine setup
//app_s.set('public', path.join(__dirname, 'public')); // ejs 경로 설정이 문제인가?
app.set('view engine', 'ejs');
app_s.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, '/')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));

app_s.use(express.static(path.join(__dirname, '/')));
app_s.use(express.static(path.join(__dirname, 'public')));
app_s.use(express.static(path.join(__dirname, 'views')));

// 리다이렉트 코드 from http to https
// 이 코드 덕분에 다른 http로 라우팅 되는 코드를 다 지워도 될 수 있음
// -----------------------------------------------------------------------------
// 일단은 _s가 없는 코드는 놔둘것
// 주말이나 시간 넉넉할때 날 잡아서 코드 정리
app.all('*', (req, res, next) => //
{
  // x-forwarded-proto: 프로토콜(http | https) 확인하는 사실상의 표준 헤더
  // req.protocol: express의 Application Request로써 요청 프로토콜의 http | https 둘 중 하나를 포함
  let protocol = req.headers['x-forwarded-proto'] || req.protocol;
  if (protocol == 'https')
  {
    next(); //미들웨어 함수에 제어를 전달
  }
  else
  {
    //let from = `${protocol}://${req.hostname}${req.url}`;
    let from = protocol + '://' + req.hostname + req.url;
    let to = 'https://' + req.hostname + req.url; // log and redirect
    //console.log('[${req.method}]: ${from} -> ${to}'); 확인용 코드
    res.redirect(to);
  }
});

var indexRouter = require('./routes/index/index'); //메인페이지 라우터
var freeboardRouter = require('./routes/freeboard/freeboard'); // 자유게시판 라우터
var freeboardwriteRouter = require('./routes/freeboard/write/freeboardwrite'); // 자유게시판 글 쓰기 라우터

var loginRouter = require('./routes/login/login'); //로그인 라우터
var logoutRouter = require('./routes/logout/logout'); //로그아웃 라우터

var questionboardRouter = require('./routes/questionboard/questionboard'); //질문게시판 라우터

var chatRouter = require('./routes/chat/chat')(io); // 채팅 라우터
var signupRouter = require('./routes/signup/signup'); // 회원가입 라우터

//0305 추가 push_test, push_notification
var push_testRouter = require('./routes/push_test/push_test'); // 푸시알림 테스트 라우터
var push_notificationRouter = require('./routes/push_notification/push_notification'); // 푸시메시지 보내기위한 라우터

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app_s.use(logger('dev'));
app_s.use(express.json());
app_s.use(express.urlencoded({ extended: false }));
app_s.use(cookieParser());

app.use('/', indexRouter);
app.use('/freeboard', freeboardRouter);
app.use('/login', loginRouter);
app.use('/questionboard', questionboardRouter);
app.use('/chat', chatRouter);
app.use('/signup', signupRouter);
app.use('/logout', logoutRouter);

//0305 추가 push_test, push_notification
app.use('/push_test', push_testRouter);
app.use('/push_notification', push_notificationRouter);

app_s.use('/', indexRouter);
app_s.use('/freeboard', freeboardRouter);
app_s.use('/login', loginRouter);
app_s.use('/questionboard', questionboardRouter);
app_s.use('/chat', chatRouter);
app_s.use('/signup', signupRouter);
app_s.use('/logout', logoutRouter);
app_s.use('/freeboard/write', freeboardwriteRouter);

//0305 추가 push_test, push_notification
app_s.use('/push_test', push_testRouter);
app_s.use('/push_notification', push_notificationRouter);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port_s = parseInt(val, 10);

  if (isNaN(port_s)) {
    // named pipe
    return val;
  }

  if (port_s >= 0) {
    // port_s number
    return port_s;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port_s === 'string'
    ? 'Pipe ' + port_s
    : 'port_s ' + port_s;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server_s.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port_s ' + addr.port_s;
  debug('Listening on ' + bind);
}

module.export = app;

module.export = app_s;
