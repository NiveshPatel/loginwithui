var mongoose = require('mongoose');

var plm = require('passport-local-mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/loginwithui");

var userSchema = mongoose.Schema({
  username:String,
  email:String,
  
  profilephoto:{
    type:String,
    default:'default.png'
  },
  password:String,
  post:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'post'
  }],
  like:{
    
    type:Array,
    default:[]
  }

});
userSchema.plugin(plm);
module.exports = mongoose.model('user',userSchema);

