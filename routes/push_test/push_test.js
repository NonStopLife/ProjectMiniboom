var express = require('express');
var router = express.Router();
var auth = require('../../public/javascripts/auth');
var bodyParser = require('body-parser');

/* parse : bodyParser */
router.use(bodyParser.json());

router.get('/', function (req, res) {
  var info = auth.statusUI(req,res,"main");
  res.render('push_test/push_test.ejs',info);
});

module.exports = router; //su_server를 다른 파일에서도 사용할수있기 하기위해?
