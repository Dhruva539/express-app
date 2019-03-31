var mongoose= require('mongoose');
var Schema = mongoose.Schema;

var formSchema= new Schema({
  firstname:String,
  lastname:String,
  occupation:String,
  },
{
  timestamps:true
});

module.exports=mongoose.model('form',formSchema);