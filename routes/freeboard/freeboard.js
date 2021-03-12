var express = require('express');
var router = express.Router();
var auth = require('../../public/javascripts/auth');
const bodyParser = require('body-parser');
var app = express();

//app.set('trust proxy', true)

/*
getClientAddress = function (req) {
        return req.ip.split(":").pop();
};
*/


/* parse : bodyParser */
router.use(bodyParser.json());

/* GET users listing. */
router.get('/', function(req, res, next) {
  var info = auth.statusUI(req,res);
  //freeboard direcotry -> freeboard.ejs
  res.render('freeboard/freeboard', info);
  //res.getClientAddress(req);
});

module.exports = router;
