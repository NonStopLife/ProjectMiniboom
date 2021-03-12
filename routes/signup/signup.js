var express = require('express');
var path = require('path');
var router = express.Router();
var mysql = require('mysql')

var session = require('express-session') //npm
var passwordTrans = require('../../public/javascripts/passwordTrans');
const bodyParser = require('body-parser');
var crypto = require('crypto') //suth_email
var transporter = require('../../.key/auth_mail');
var auth = require('../../public/javascripts/auth');
var conn = require('../../public/javascripts/mysql.js');

router.use(bodyParser.json());

var info_Chk={
  emailFlag: false,
  useridFlag: false,
  pw1Flag: false,
  pw2Flag: false,
}

router.use(express.json()); //app.use 와 router.use 의 차이?
/* << 클라이언트로 HTML 파일 전송 >> */

router.get('/', function(req, res) {
  var info = auth.statusUI(req,res);
  res.render('signup/signup', info);
});

router.post('/', function(req, res) {
  var flag = req.body['flag'];
  var content = req.body['content'];

  var msg = {
    shake : true  //클라이언트의 html요소를 제어하기위함
  };

  /*** 이메일 유효성, 중복확인***/
  if (flag === 'email') {
    msg.flag='#email';
    if (content == '' || content == 'undefined') return;
    if (!isEmail(content)) {
      info_Chk.emailFlag = false;
      msg.text = '❌ 이메일 형식이 아니다';
      msg.shake = true;
      res.json(msg);
    } else {
      overlapCheck(flag, content, function(chk) {
        if (chk === true) {
          info_Chk.emailFlag = true;
          msg.text = '✔';
          msg.shake = false;
          res.json(msg);
        } else {
          info_Chk.emailFlag = false;
          msg.text = '❌ 이미 사용중인 이메일';
          msg.shake = true;
          res.json(msg);
        }
      })
    }
  }
  /*** 이메일 유효성, 중복확인***/

  /*** 아이디 유효성, 중복확인 ***/
  else if (flag === 'userid') {
    msg.flag='#userid';
    if (content == '' || content == 'undefined') return;
    if (!isId(content)) {
      info_Chk.useridFlag = false;
      msg.text = '❌ 아이디 형식이 아니다';
      msg.shake = true;
      res.json(msg);
    } else {
      overlapCheck(flag, content, function(chk) {
        if (chk === true) {
          info_Chk.useridFlag = true;
          msg.text = '✔';
          msg.shake = false;
          res.json(msg);
        } else {
          info_Chk.useridFlag = false;
          msg.text = '❌ 이미 사용중인 아이디';
          msg.shake = true;
          res.json(msg);
        }
      })
    }
  }
  /*** 아이디 유효성, 중복확인 ***/

  /*** 비밀번호 유효성확인***/
  else if (flag === 'pw' || flag === 'pw-repeat') {
    var content2 = req.body['content2'];
    if (!isPassword(content)) {
      info_Chk.pw1Flag = false;
      msg.text = '❌ 패스워드 형식이 아닙니다.';
      msg.shake = true;
      msg.flag = '#pw';
      res.json(msg);
    } else {
      info_Chk.pw1Flag = true;
      if (content !== content2) {
        info_Chk.pw2Flag = false;
        msg.text = '❌ 패스워드가 일치하지 않습니다.';
        msg.shake = true;
        msg.flag = '#pw-repeat';
        res.json(msg);
      } else {
        info_Chk.pw2Flag = true;
        msg.text = '✔';
        msg.shake = false;
        msg.flag = '.pw';
        res.json(msg);
      }
    }
  }
});

router.post('/process', function(req, res) {
  if (!allOk(info_Chk)) {
    res.json(false);
  } else {
    insert_info(req, function() {
      res.json(true);
    })
  }
});

router.get('/confirmEmail', function(req, res) {
  //이메일로 전송된 링크를 클릭하면 여기로 이동한다 req.query.key가  DB(key_for_verify) 에 있는지 보고 있으면 해당 칼럼의 email_verified를 ture로 변경 한다
  var info = auth.statusUI(req, res, "Auth Mail");
  var key_for_verify = req.query.key;
  var sql = "SELECT * FROM USER_INFO WHERE key_for_verify =" + "'" + key_for_verify + "';"
  conn.query(sql, function(err, result) {
    if (err) {
      throw err;
    }
    if (result[0] === undefined) {
      info.notice = '이메일로 전송된 링크를 클릭하여 인증해주세요!';
      info.auth_state = true;
      res.render('auth_mail/auth_mail.ejs', info);
    } else {
      sql = "UPDATE USER_INFO SET email_verified=" + "'true'" + "WHERE key_for_verify =" + "'" + key_for_verify + "';"
      conn.query(sql, function(err, result) {
        if (err) {
          throw err;
        }
        info.notice = '인증이 완료되었습니다.';
        info.auth_state = true;
        res.render('auth_mail/auth_mail.ejs', info)
      });
    }
  });
});

router.get('/re_transmission', function(req, res) {
  var info = auth.statusUI(req, res, "Auth Mail");
  info.notice = '인증받을 이메일을 입력하세요';
  info.auth_state = false;
  res.render('auth_mail/auth_mail.ejs', info);
});

router.post('/re_transmission', function(req, res) {
  var info = auth.statusUI(req, res, "Auth Mail");
  var msg = req.body
  console.log("재전송 이메일",msg['email']);
  var sql = "SELECT * FROM USER_INFO WHERE user_email =" + "'" + msg['email'] + "';"
  conn.query(sql, function(err, result) {
    if (err) {
      throw err;
    }
    if (result[0] === undefined) {
      info.notice = '미가입된 이메일 입니다';
      info.auth_state = false;
      res.render('auth_mail/auth_mail.ejs', info);
    } else {
      key_verify(msg, req);
      info.notice = '이메일로 전송된 링크를 클릭하여 인증해주세요!';
      info.auth_state = true;
      res.render('auth_mail/auth_mail.ejs', info);
    }
  });
});

module.exports = router;

//입력받은 사용자정보를 저장
function insert_info(req, callback) {
  passwordTrans.encoding(req.body['pw'], function(result) {
    var userid = req.body['userid'];
    var email = req.body['email'];
    var password = result['password'];
    console.log("전송 이메일 주소",email);
    var salt = result['salt'];
    var sql = "INSERT INTO USER_INFO(`user_id`, `user_email`, `user_password`, `user_salt`) ";
    sql = sql + "VALUES('" + userid + "','" + email + "','" + password + "','" + salt + "');";
    conn.query(sql, function(err, result) {
      if (err) {
        throw err;
      } else {
        key_verify(req.body, req);
      }
    });
  });
  callback();
}

//인증 링크생성후 이메일 전송
function key_verify(msg, req) {
  console.log("trans", transporter);
  console.log("smtp", transporter.smtpTransport);
  var key_one = crypto.randomBytes(256).toString('hex').substr(100, 5);
  var key_two = crypto.randomBytes(256).toString('base64').substr(50, 5);
  var key_for_verify = key_one + key_two;//문자열에 + 가 찍히는 경우 DB에서는 문자열을 합하는것으로 인식하는 문제가있다.
  var sql = "UPDATE USER_INFO SET key_for_verify=" + "'" + key_for_verify + "'" + "WHERE user_email =" + "'" + msg['email'] + "';"
  conn.query(sql, function(err, result) {
    if (err) throw err;
    //url
    var url = 'http://' + req.get('host') + '/signup/confirmEmail' + '?key=' + key_for_verify;
    //옵션
    var mailOpt = {
      from: `"mini boom" <${'changhee.project@gmail.com'}>`,
      to: msg['email'],
      subject: 'mini boom 이메일 인증을 진행해주세요.',
      html: '<h1>이메일 인증을 위해 URL을 클릭해주세요.</h1><br>' + '<a href=' + url + '>' + url + '</a>'
    };
    //전송
    transporter.sendMail(mailOpt, function(err, res) {
      if (err) {
        console.log(err);
      } else {
        console.log('email has been sent.');
      }
    });
  });
}

//이메일 중복체크
function overlapCheck(flag, content, callback) {
  var sql;
  if (flag == 'email') {
    sql = "select * from USER_INFO where user_email=" + "'" + content + "';"
  } else if (flag == 'userid') {
    sql = "select * from USER_INFO where user_id=" + "'" + content + "';"
  }
  conn.query(sql, function(err, result) {
    if (err) throw err;
    var chk = (result[0] === undefined); //결과값이 undefinded 이면 사용가능
    callback(chk);
  });
}

//이메일 체크 정규식
function isEmail(asValue) {
  var regExp = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;
  return regExp.test(asValue);
}

//아이디 체크 정규식
function isId(asValue) {
  var regExp = /^[a-z]+[a-z0-9]{5,19}$/g; //영문자로 시작하는 6~20자 영문자 또는 숫자
  return regExp.test(asValue);
}
//비밀번호 체크 정규식
function isPassword(asValue) {
  var regExp = /(?=.*\d{1,50})(?=.*[~`!@#$%\^&*()-+=]{1,50})(?=.*[a-zA-Z]{2,50}).{8,50}$/; // : 숫자, 특문 각 1회 이상, 영문은 2개 이상 사용하여 8자리 이상 입력
  return regExp.test(asValue);
}

function allOk(info) {
  for (var index in info) {
    if (!info[index]) return false;
  }
  return true;
}
