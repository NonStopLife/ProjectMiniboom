//webPush를 위한 key가져오기
require('dotenv').config({
  path: '.key/variables.env'
});

var express = require('express');
var path = require('path');
var router = express.Router();
var auth = require('../../public/javascripts/auth');
var bodyParser = require('body-parser');
var conn = require('../../public/javascripts/mysql.js');
var webPush = require('web-push');

/* parse : bodyParser */
router.use(bodyParser.json());

const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;
webPush.setVapidDetails('mailto:test@example.com', publicVapidKey, privateVapidKey);

router.post('/', (req, res) => {
  var info =req.body;
  var nickname = info.nickname;
  var title = info.title;
  var content = info.content;

  //테스트를 위해..
  if(nickname === "" || nickname ===undefined){
    console.log("name is undefined");
    return;
  }

  get_pushinfo(nickname,function(result){
    var isSubscribed = result[0]['isSubscribed'];
    var subscription = JSON.parse(result[0]['subscription']);
    console.log(isSubscribed);
    if(isSubscribed==='false') {
      console.log(`${nickname} push off`);
      return;
    }else{
      res.status(201).json({});
      const payload = JSON.stringify({
        title: title,
        body : content
      });
      webPush.sendNotification(subscription, payload).catch(error => console.error(error));
    }
  })
});

module.exports = router; //su_server를 다른 파일에서도 사용할수있기 하기위해?

function get_pushinfo(nickname, callback) {
  var sql = `SELECT isSubscribed,subscription FROM USER_INFO WHERE user_id = '${nickname}';`
  conn.query(sql, function(err, result) {
    if (err) throw err;
    console.log("-----push_TEST-----");
    var isSubscribed = result[0]['isSubscribed'];
    var subscription = result[0]['subscription'];
    console.log(isSubscribed);
    console.log(subscription);
    console.log("-----push_TEST-----");
    callback(result);
  });
}
