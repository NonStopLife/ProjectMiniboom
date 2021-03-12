//webPush를 위한 key가져오기
require('dotenv').config({
  path: '.key/variables.env'
});

var express = require('express');
var router = express.Router();
var auth = require('../../public/javascripts/auth');
var bodyParser = require('body-parser');
var conn = require('../../public/javascripts/mysql.js');

/* parse : bodyParser */
router.use(bodyParser.json());

/* GET home page. */
router.get('/', function(req, res, next) {
  var info = auth.statusUI(req, res);
  if (info.nickname !== undefined) { //info.state === Member
    console.log("=====state Member Login=====");
    console.log(req.session);
    res.render('index/index_login', info);
  } else { //info.state === nonMember
    if (req.session.temp_Id) {
      console.log("=====state nonMember Login=====");
      console.log(req.session);
      info.nickname = req.session.temp_Id;
      res.render('index/index_login', info);
    } else {
      console.log("=====state Logout=====");
      console.log(req.session);
      res.render('index/index_logout');
    }
  }
});

router.post('/nonMember', function(req, res) {
  console.log("삐삒 비회원");
  const random_Id = Math.random().toString(36).substr(2, 11);
  var info = auth.statusUI(req, res);
  req.session.temp_Id = random_Id;
  res.json("sucess");
});

router.post('/register', (req, res) => {
  var info = auth.statusUI(req, res);

  const subscription = req.body
  console.log("----------index/register----------");
  console.log(subscription.subscription);
  console.log("----------index/register----------");
  set_pushinfo(info.nickname,subscription);
});

//공개키는 서버가 보내게 하자
router.get('/vapidPublicKey', function(req, res) {
  const publicVapidKey = process.env.PUBLIC_VAPID_KEY;

  var key = {
    publicVapidKey: publicVapidKey,
    isSubscribed: false
  }

  if (req.session.temp_Id) {
    console.log("서버에서 알립니다. 비회원이라서 푸쉬 키발급 안됨요");
    key.publicVapidKey = false;
    res.json(key);
    return;
  }
  var info = auth.statusUI(req, res);

  //DB로 부터 구독정보와 구독 여부를 받아온다
  get_pushinfo(info.nickname,function(result) {
    if (result[0]['isSubscribed'] === 'true') {
      //result가 1이면 푸시알람을 받는다는 뜻이다.
      key.isSubscribed = true;
    }
    res.json(key);
  })
});

module.exports = router;

function get_pushinfo(nickname,callback) {
  var sql = `SELECT isSubscribed,subscription FROM USER_INFO WHERE user_id = '${nickname}';`
  conn.query(sql, function(err, result) {
    if (err) throw err;
    var isSubscribed = result[0]['isSubscribed'];
    var subscription = result[0]['subscription'];
    if(subscription !== null){
      subscription = JSON.parse(result[0]['subscription']);
    }
    console.log("----------GET subscription----------");
    console.log(isSubscribed);
    console.log(subscription);
    console.log("----------GET subscription----------");
    callback(result);
  });
}

function set_pushinfo(nickname,info) {
  var isSubscribed = info.isSubscribed;
  var subscription = JSON.stringify(info.subscription);
  console.log("----------PUSH subscription----------");
  console.log("isSubscribed : ", isSubscribed);
  console.log("subscription : ", subscription);
  console.log("----------PUSH subscription----------");
  var sql = `UPDATE USER_INFO SET isSubscribed='${isSubscribed}', subscription='${subscription}'
              WHERE user_id = '${nickname}';`
  conn.query(sql, function(err, result) {
    if (err) throw err;
  });
}
