var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : //PRIVATE
  user            : //PRIVATE
  password        : //PRIVATE
  database        : //PRIVATE
  dateStrings     : true
});

module.exports.pool = pool;
