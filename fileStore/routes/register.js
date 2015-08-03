var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user.js');
var TITLE_REG = 'Register';

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('register', {title: TITLE_REG});
});

router.post('/', function (req, res, next) {
    var userName = req.body['txtUserName'],
        userPwd = req.body['txtUserPwd'],
        userRePwd = req.body['txtUserRePwd'];
    var newUser = new User({
        userName: userName,
        userPwd: userPwd
    });

    console.log('post');

    if (User.checkIsExist(newUser.userName)) {
        res.locals.error ='username is existed';
        res.render('register', {title: TITLE_REG});
        return;
    }

    console.log('after check');

    newUser.save();
    res.locals.success = 'register success <a class="btn btn-link" href="/login" role="button"> Login </a>';
    res.render('register', {title: TITLE_REG});

});

module.exports = router;