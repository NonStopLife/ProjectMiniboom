/*
 * 2021-02-19 현재 sql 쿼리문 사용 X
 *
 */
var express = require('express');
var router = express.Router();
var auth = require('../../public/javascripts/auth');

const bodyParser = require('body-parser');
var path = require('path');
var crypto = require('crypto');
const nodemailer =require('nodemailer');

var auth = require('../../public/javascripts/auth');
var mysql = require('mysql')
var passwordTrans = require('../../public/javascripts/passwordTrans');
var conn = require('../../public/javascripts/mysql.js');

/* parse : bodyParser */
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
  extended: false
}));

/*
 * mysql 연결 코드 필요할까?
 */

router.get('/', function(req, res, next) {
  var info = auth.statusUI(req,res);
  res.render('login/login', info);
});

/***passport에서 사용***/
var passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy; //passport는 내부적을 session을 사용하기 때문에 session이 활성화되어있어야한다.

router.use(passport.initialize()); //express에 패스포트 미들웨어 설치
router.use(passport.session()); //패스포트는 내부적으로 세션을 사용

passport.serializeUser(function(user, done) { //로그인 성공사실을 세션에 저장한다.
  //console.log("serializeUser : "  user);
  done(null, user);
});

passport.deserializeUser(function(id, done) { //로그인후 페이지방문마다 호출된다.
  //console.log("deserializeUser : "user);
  done(null, id);
});

passport.use(new LocalStrategy({ //로그인 성공여부를 판단
    usernameField: 'id',
    passwordField: 'pw'
  },
  function(username, password, done) {
    //1.해당 아이디가 이메일 인증이 되어야만 로그인을 진행
    //2.받아온 아이디를 참고하여 DB에서 암호화 된 비밀번호와 salt를가져오고
    //받아온 password를 salt로 암호화시킨다.
    //1 2 번에서의 비밀번호가 같으면 로그인시킨다

    var sql = "SELECT user_password, user_salt FROM USER_INFO WHERE user_id=" + "'" + username + "';"
    conn.query(sql, function(err, result) {
      if (err) throw err;
      if (result[0] === undefined) {
        return done(null, false, {
          message: 'Incorrect info.'
        });
      }
      passwordTrans.decoding(password, result[0]['user_salt'], function(resultPassword) {

        var sql = "SELECT * FROM USER_INFO WHERE user_id=" + "'" + username + "'" + "AND user_password=" + "'" + resultPassword + "';";
        conn.query(sql, function(err, result2) {
          if (err) throw err;
          if (result2[0] !== undefined) { //계정은 존재
            if (result2[0]['email_verified'] !== 'true') {  //회원가입은 되었지만 이메일 인증이 안됨
              return done(null, false, {
                message: 'Incorrect info.'
              });
            }
            var log = {
              id: result2[0]['user_id'],
              email: result2[0]['user_email']
            };
            return done(null, log); //serializeUser콜백함수에 첫번째인자전달
          } else {
            return done(null, false, {
              message: 'Incorrect info.'
            });
          }
        });
      })
      return;
    });
  }
));

//왜 안되는것인가
router.post('/process', passport.authenticate('local', { //로그인시 인증정보를 받을곳
    successRedirect: '/',
    failureRedirect: '/login', //local방식은 username,pass 를 통해서 로그인하는것(구글은 다른것)
    failureFlash: false
  })
  /*function(req, res) {
    req.session.save(function() {
      res.redirect('http://localhost');
    })
  }*/
);


module.exports = router;
