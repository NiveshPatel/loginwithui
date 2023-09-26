// var mongoose = require('mongoose');
// var postSchema = mongoose.Schema({
  
//   postdets:String,
//   users:{type:mongoose.Schema.Types.ObjectId,ref:'users'},
//   like:[{
//     type:mongoose.Schema.Types.ObjectId,ref:'users',
//     default:[]
//   }],
  
  

// });
// module.exports = mongoose.model('posts',postSchema);
var mongoose = require('mongoose');


var postSchema = mongoose.Schema({
  postdets:String,
  user:{type:mongoose.Schema.Types.ObjectId,ref:'user'},
  postlike:{
    type:Array,
    default:[]
  }
  
});
module.exports = mongoose.model('post',postSchema);



