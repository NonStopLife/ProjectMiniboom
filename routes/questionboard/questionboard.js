var express = require('express');
var router = express.Router();
var auth = require('../../public/javascripts/auth');
const bodyParser = require('body-parser');

/* parse : bodyParser */
router.use(bodyParser.json());

router.get('/', function(req, res, next) {
  var info = auth.statusUI(req,res);
  res.render('questionboard/questionboard', info);
});


module.exports = router;
