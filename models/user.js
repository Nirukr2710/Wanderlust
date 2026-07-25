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
    //dashboard
    profileImage: {
         url: {
           type: String,
            default: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg"
         },
        filename: {
          type: String,
          default: ""
         }
        },

    role: {
      type: String,
      enum: ["user", "admin"],
       default: "user"
       },
    //wishlist
    wishlist: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Listing"
    }
]

});
// console.log(passportLocalMongoose);
userSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model('User',userSchema);