var express = require('express');
var path = require('path');
var router = express.Router();
const bodyParser = require('body-parser');

router.use(bodyParser.json());


router.use('/', function(req, res) {
  req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.redirect('/');
    });

});

module.exports = router; //su_server를 다른 파일에서도 사용할수있기 하기위해?
