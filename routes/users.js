const mongoose = require("mongoose");
const passpostLocalMongoose = require("passport-local-mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/InstaProfile");

const userSchema = mongoose.Schema({
    username: String,
    email:String,
    age:Number,
    contact:Number,
    password:String,
    image:{
        type:String,
        default:'def.png'
    },
    post:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"post"
        }
    ],
    about:String,
    followers:[{type:mongoose.Schema.Types.ObjectId, ref:"users"}],
    following:[{type:mongoose.Schema.Types.ObjectId, ref:"users"}]

})

userSchema.plugin(passpostLocalMongoose);

module.exports= mongoose.model("user",userSchema);