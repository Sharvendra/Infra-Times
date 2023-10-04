const mongoose = require("mongoose");
// const passpostLocalMongoose = require("passport-local-mongoose");

// mongoose.connect("mongodb://127.0.0.1:27017/InstaProfile");

const postSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    data: String,
    likes: [
        { type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    //  comment:[{
    //     type:mongoose.Schema.Types.ObjectId,
    //     ref:"comment"
    // }] ,
  comment:[{userId:{type:mongoose.Schema.Types.ObjectId,ref:"user"},data:String,date: {
    type: Date,
    default: Date.now()
}}],
    date: {
        type: Date,
        default: Date.now()
    }
})

// userSchema.plugin(passpostLocalMongoose);

module.exports = mongoose.model("post", postSchema);