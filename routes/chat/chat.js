var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
var mysql = require('mysql');
var auth = require('../../public/javascripts/auth');
var conn = require('../../public/javascripts/mysql.js');

module.exports = function(io){
  var nickname = undefined; //auth.statusUI로 받아온 nickname을 socket.name에 저장하기 위함

  router.use(bodyParser.json());
  router.get('/', function(req, res) {
    var info = auth.statusUI(req,res);
    if(info.nickname !== undefined){  //info.state === Member
      nickname = info.nickname;
      res.render('chat/chat',info);
    }else{  //info.state === nonMember
      if(req.session.temp_Id){
        info.nickname=req.session.temp_Id;
        nickname = info.nickname;
        res.render('chat/chat',info);
      }else{
        res.redirect('/')
      }
    }
  });

  io.sockets.on('connection', function(socket) {

    /* 새로운 유저가 접속했을 경우 다른 소켓에게도 알려줌 */
    socket.on('newUser', function() {
      loadChat(function(result){

        /* 소켓에 이름 저장해두기 */
        socket.name = nickname;

        /* 현재 클라이언트에게만 전송 */
        socket.emit('loadData', {
          name : socket.name,
          loadData : result
        })
      });
    })

    /* 새로운 유저 입장시 모든유저들에게 알림 */
    socket.on('newUser_notice', function() {
      console.log("SERVER : newUser_notice");
      /* 받은 데이터에 누가 보냈는지 이름을 추가 */
      io.emit('newUser_notice', {
        name: socket.name
      });
    })

    /* 전송한 메시지 받기 */
    socket.on('message', function(data) {
      /* 받은 데이터에 누가 보냈는지 이름을 추가 */
      data.name = socket.name
      saveChat(data);
      io.emit('update', data);
    })

    /* 접속 종료 */
    socket.on('disconnect', function() {
      //console.log(socket.name + '님이 나가셨습니다.')
      /* 나가는 사람을 제외한 나머지 유저에게 메시지 전송 */
      socket.broadcast.emit('disconnection', {
        message: socket.name
      });
    })
  })
  /* 소켓통신 */
  //
  return router;
}

function saveChat(data){
  var sql = `INSERT INTO CHAT(user_id, chat_data) VALUES ('${data.name}', '${data.message}');`
  conn.query(sql, function(err, result2) {
    if (err) throw err;
    console.log("DB SAVE", data.name, data.message);
  });
}

function loadChat(callback){
  // 최근 채팅 내용 100개 까지 불러옴 at 2021-02-23
  //최근 100개출력안됨 at 2021-02-26
  var sql = `SELECT user_id, chat_data, DATE_FORMAT(chat_time, '%H:%i') AS chat_time
              FROM CHAT WHERE DATE(chat_time) = DATE(NOW());`// ORDER BY chat_time ASC limit 0, 100;`
  conn.query(sql, function(err, result) {
    if (err) throw err;
    for(var index in result){
      var data=result[index];
      console.log("DB LOAD",data['user_id'], data['chat_data']);
    }
    callback(result);
  });
}
