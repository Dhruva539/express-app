var mysql =require('mysql');
const connection= mysql.createPool({
  localhost:"127.0.0.1",
  user:"root",
  password:"Hazel@539",
  database:"test"
})

module.exports=connection;

