// console.log("This is mysql.js");
var mysql = require('mysql');
var mysqlkey = require('../../.key/mysql-key.json');

// 비밀번호는 별도의 파일로 분리해서 버전관리에 포함시키지 않아야 합니다.
var connection = mysql.createConnection({
  host     : mysqlkey.host,
  user     : mysqlkey.user,
  password : mysqlkey.password,
  database : mysqlkey.database
});

module.exports=connection;
