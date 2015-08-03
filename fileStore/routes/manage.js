var express = require('express');
var router = express.Router();
var JDB = require('../models/data.js');
var FILE = require('../models/file.js');

/* GET home page. */
router.get('/', function (req, res, next) {
    if (req.session && req.session.userName) {
        res.locals.userName = req.session.userName;
        console.log(req.session.userName);
        var list = FILE.getFileListByUser(req.session.userName);
        console.log(list);
        res.render('manage', {title: 'Manage', list: list});
    } else {
        res.redirect('/login');
    }
});

router.get('/del', function (req, res, next) {
    var id = req.query['id'];
    FILE.deleteFile(req.session.userName, id);
    res.redirect('/manage');

});

module.exports = router;
