const mongoose = require("mongoose");
// const passpostLocalMongoose = require("passport-local-mongoose");

// mongoose.connect("mongodb://127.0.0.1:27017/InstaProfile");

const commentSchema = mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "post"
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    data: String,
    date: {
        type: Date,
        default: Date.now()
    }
})

// userSchema.plugin(passcommentLocalMongoose);

module.exports = mongoose.model("commentss", commentSchema);