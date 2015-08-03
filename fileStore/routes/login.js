var express = require('express');
var router = express.Router();
var User = require('../models/user.js');
var TITLE_LOGIN = 'Login';

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('login', {title: TITLE_LOGIN});
});

router.post('/', function (req, res) {
    var userName = req.body['txtUserName'],
        userPwd = req.body['txtUserPwd'];

    if (!User.checkIsExist(userName)) {
        res.locals.error = 'User is not existed!';
        res.render('login', {title: TITLE_LOGIN});
        return;
    }

    var user = User.getUserByUserName(userName);
    if (user.userPwd != userPwd) {
        res.locals.error = 'Username or password is not invalid!';
        res.render('login', {title: TITLE_LOGIN});
        console.log('login failed : password is invalid');
        return;
    }

    res.locals.userName = userName;
    req.session.userName = res.locals.userName;
    console.log('login success : ' + req.session.userName);
    res.redirect('/');

});

module.exports = router;