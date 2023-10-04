var express = require('express');
var router = express.Router();

var userModel = require('./users');
var postModel = require('./post');
// var commentModel=require('./commentss');
const passport = require('passport');
var multer = require('multer');
var path = require('path');
var fs = require('fs');

const localStrategy = require('passport-local')
passport.use(new localStrategy(userModel.authenticate()));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname)
    cb(null, uniqueSuffix)
  }
})

function fileFilter(req, file, cb) {

  var ext = path.extname(file.originalname);
  if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
    return cb(new Error('Only images are allowed'))
  }
  cb(null, true)
}

const upload = multer({ storage: storage, fileFilter, limits: { fileSize: 1024 * 1024 * 2 } })

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/signup', function (req, res) {
  res.render('register')
})
router.post('/signup', function (req, res, next) {
  userModel
    .findOne({ username: req.body.username })
    .then(function (foundUser) {
      if (foundUser) {
        res.send("User already exist");
      }
      else {
        var newuser = userModel({
          username: req.body.username,
          email: req.body.email,
          contact: req.body.contact,
          age: req.body.age,
        })
        userModel.register(newuser, req.body.password)
          .then(function (u) {
            passport.authenticate('local')(req, res, function () {
              res.redirect('/feed')
            })
          })
      }
    })
})
router.get('/login', function (req, res) {
  res.render('index')
})

router.post('/login', passport.authenticate('local', {
  successRedirect: "/feed",
  failureRedirect: "/"

}), function (req, res, next) { });
router.get('/profile', isLoggedIn, function (req, res, next) {
  userModel
    .findOne({ username: req.session.passport.user })
    .populate('post')
    .populate('post.comment')
    .populate('post.comment.userId')
    .then(function (foundUser) {
      res.render('profile', { foundUser })
    })
})

router.post("/post", isLoggedIn, function (req, res, next) {
  userModel.findOne({ username: req.session.passport.user })
    .then(function (user) {
      postModel.create({
        userId: user._id,
        data: req.body.data
      })
        .then(function (posts) {
          user.post.push(posts._id)
          user.save()
            .then(function () {
              res.redirect('back');
            })
        })
    })
})

router.get('/like/:postId', isLoggedIn, function (req, res) {
  userModel.findOne({ username: req.session.passport.user })
    .then(function (user) {
      postModel.findOne({ _id: req.params.postId })
        .then(function (post) {
          if (post.likes.indexOf(user._id) === -1) {
            post.likes.push(user._id);
          }
          else {
            post.likes.splice(post.likes.indexOf(user._id), 1);
          }
          post.save()
            .then(function () {
              res.redirect("back");
            })
        })

    })
})

router.get('/feed', isLoggedIn, function (req, res) {
  userModel.findOne({ username: req.session.passport.user })
    .then(function (user) {
      postModel
        .find()
        // .populate('')
        .populate('userId')
        .populate('comment.userId')
        .then(function (allPosts) {
          res.render('feed', { allPosts, user });
        })
    })
})

router.get('/update/:val', function (req, res, next) {
  userModel.findOne({ username: req.params.val })
    .then(function (users) {
      if (users) {
        res.json(true)
      }
      else {
        res.json(false);
      }
    })
})

router.post('/updatepic', isLoggedIn, upload.single('image'), function (req, res) {
  userModel
    .findOne({ username: req.session.passport.user })
    .then(function (user) {
      if (user.image !== 'def.png') {
        fs.unlinkSync(`./public/images/uploads/${user.image}`);
      }
      user.image = req.file.filename;
      user.save()
        .then(function () {
          res.redirect("back");
        })
    })
})
router.get('/update', isLoggedIn, function (req, res) {
  userModel.findOne({ username: req.session.passport.user })
    .then(function (user) {
      res.render('update', { user })
    })
})
router.post('/update', isLoggedIn, function (req, res, next) {
  userModel.findOneAndUpdate({ username: req.session.passport.user }, { username: req.body.username, contact: req.body.contact }, {
    new:
      true
  })
    .then(function (updateduser) {
      req.login(updateduser, function (err) {
        if (err) { return next(err); }
        return res.redirect("/profile");
      });
    })
})

router.get('/logout', isLoggedIn, function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });

})

// router.post('/comment/:postId',isLoggedIn,function(req,res,next){
//    userModel.findOne({username:req.session.passport.user})
//    .then(function(user){
//     postModel.findOne({_id:req.params.postId})
//     .then(function(post){
//       commentModel.create({
//         postId:post._id,
//         userId:user._id,
//         data:req.body.comment
//       })
//       .then(function (comment) {
//         post.comment.push(comment._id)
//         post.save()
//           .then(function () {
//             res.redirect('back');
//           })
//       })
//     })
//    })
// })
router.post('/comment/:postId', function (req, res, next) {
  userModel.findOne({ username: req.session.passport.user })
    .then(function (user) {
      postModel.findOne({ _id: req.params.postId })
        .then(function (post) {
          post.comment.push({ userId: user._id, data: req.body.comment })
          post.save()
            .then(function (post) {
              res.redirect("back");
            })
        })
    })
})

router.post('/search', function (req, res) {
  userModel.findOne({ username: req.body.val })
    .then(function (client) {
      if (client) {
        // res.redirect("back",{client})
        console.log(client);
      } else {
        // res.redirect("back");
        console.log("no")
      }
    })
})

router.get('/postprofile/:username', function (req, res) {
  userModel.findOne({ username: req.params.username })
    .populate('post')
    .populate('post.comment')
    .populate('post.comment.userId')
    .then(function (foundUser) {
      res.render("postprofile", { foundUser });
      // console.log(profile);
    })
})

router.get('/followUnfollow/:username', function (req, res) {
  userModel.findOne({ username: req.session.passport.user })
    .then(function (user) {
      console.log(user)
      // if (user.follower.indexOf(req.session.passport.user.userId) === -1) {
      //   user.follower.push(req.session.passport.user.userId);
      // }
      // else {
      //   user.follower.splice( user.follower.indexOf(req.session.passport.user.userId), 1);
      // }
      // users.save()
      //   .then(function () {
      //     res.redirect("back");
      //   })
    })
})

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  else {
    res.redirect('back')
  }
}




module.exports = router;
