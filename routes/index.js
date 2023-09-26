var express = require('express');
var router = express.Router();
var userModel = require('./users');
var postModel = require('./post')
const passport = require('passport');
const localStrategy = require('passport-local');
const multer = require('multer')
const path = require('path')



passport.use(new localStrategy(userModel.authenticate()))


// code of changing dp with multer

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images/uploads')
    },
    filename: function (req, file, cb) {
      var dt = new Date()
      var fn = dt.getTime() + Math.floor(Math.random() * 10000) + path.extname(file.originalname)
      cb(null, fn)
    }
  })
  // filefilter uses for not accepting img in the form of pdf or anyother type....
  function fileFilter(req, file, cb) {
    
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/avif' || file.mimetype === 'image/svg' || file.mimetype === 'image/webp' || file.mimetype === 'image/jpg') {
  
      cb(null, true)
    }
  
    else {
  
      cb(new Error('please upload a valid file', false))
  
    }
  
  }
  
  const upload = multer({ storage: storage, fileFilter: fileFilter })
  
  
  /* GET home page. */
  
  
  router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
  });
  router.get('/feed', isLoggedIn,async function (req, res, next) {
  var loggedinuser = await userModel.findOne({username:req.session.passport.user})
   res.render('feed',{user:loggedinuser})
  });
  // Code of rendering profile page
  router.get('/profile', isLoggedIn, function (req, res, next) {
    userModel.findOne({ username: req.session.passport.user }).then(function (founduser) {
    res.render('profile', { user: founduser });
    })
  });
  // code of going another profile by clicking on searched name
  router.get('/profile/:id', isLoggedIn, function (req, res, next) {
    userModel.findOne({ _id: req.params.id })
      .then(function (founded) {
        res.render('profile', { user: founded })
      })
  });
  
// code of like profile
router.get('/like/:id', isLoggedIn, function (req, res, next) {
  userModel.findOne({ _id: req.params.id }).then(function (user) {
    // is line ki bajah se pata chalega ki user h yaa nahi  indexOf ka yahi kaam h agar h to 2 return karta h nahi h to -1 just like ["aayush","aayushi"].indexOf("harsh") return is -1
    var jsuser = user.like.indexOf(req.session.passport.user);
    if (jsuser == -1) {
      user.like.push(req.session.passport.user)
    } else {

      user.like.splice(jsuser, 1);
    }
    user.save()

      .then(function () {
        res.redirect('back');
      })
  })
});

router.post('/post', isLoggedIn, async function (req, res, next) {
  var loggedinuser = await userModel.findOne({ username: req.session.passport.user })
  var createdpost = await postModel.create({ postdets: req.body.postdets, user: loggedinuser })
  loggedinuser.post.push(createdpost._id)
  await loggedinuser.save()
  res.redirect('back')

});
router.get('/post', isLoggedIn, async function (req, res, next) {
  var loggedinuser = await userModel.findOne({ username: req.session.passport.user })
    .populate({
      path: 'post',
      populate: {
        path: 'user'
      }
    })
  res.render('post', { user: loggedinuser, loggedinuser: req.session.passport.user })

});





router.get('/find/:username', function (req, res, next) {
  var regexp = new RegExp("^" + req.params.username)
  userModel.find({ username: regexp })
    .then(function (allusers) {
      res.json({ allusers })
    })
});


router.get('/username/:username', function (req, res, next) {
  userModel.findOne({ username: req.params.username })
    .then(function (userh) {
      if (userh) {
        res.json({ found: true })
      }
      else {
        res.json({ found: false })
      }
    })

});


router.post('/uploads', isLoggedIn, upload.single('filename'), function (req, res, next) {
  userModel.findOne({ username: req.session.passport.user })
    .then(function (loggedinuser) {
      loggedinuser.profilephoto = req.file.filename
      loggedinuser.save()
    }).then(function () {
      res.redirect('back')
    })
});



router.get('/postlike/:id', isLoggedIn, async function (req, res, next) {
  var user = await postModel.findOne({ _id: req.params.id })
  var jsuser = user.postlike.indexOf(req.session.passport.user);
  if (jsuser == -1) {
    user.postlike.push(req.session.passport.user)
  } else {
    user.postlike.splice(jsuser, 1)

  }
  await user.save();
  res.redirect('back')
});

router.post('/register', function (req, res, next) {
  var newUser = new userModel({
    username: req.body.username,
    email: req.body.email,
    profilephoto: req.body.profilephoto,

  })
  userModel.register(newUser, req.body.password)
    .then(function (u) {
      passport.authenticate('local')(req, res, function () {
        res.redirect('/profile')
      })
    }).catch(function (e) {
      res.send(e);
    })
})
router.post('/login', passport.authenticate('local', {
  successRedirect: '/profile',
  failureRedirect: '/',
}), function (req, res) { });

router.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return (err); }
    res.redirect('/');
  })
})
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  else {
    res.redirect('/')

  }
}


module.exports = router;
