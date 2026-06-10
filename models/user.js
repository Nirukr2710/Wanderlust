const { required } = require("joi");
const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const passportLocalMongoose=require("passport-local-mongoose").default;
//this automatically holds username so we dont iniatilize usernmae

const userSchema= new Schema({
    email:{
        type:String,
        required:true
    },

});
// console.log(passportLocalMongoose);
userSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model('User',userSchema);