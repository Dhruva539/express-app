var db= require('../dbConnection');
const query= "SELECT Name from OCCUPATION_TABLE";
var Task={
getOccupationData: function(cb) {
  return db.query(query,cb);
}
}

module.exports=Task;