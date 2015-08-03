var express = require('express');
var router = express.Router();
var TITLE_DOWNLOAD = 'Download';
var fs = require('fs');
var JDB = require('../models/data.js');
var FILE = require('../models/file.js');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.locals.userName = req.session.userName;
    res.render('download', {title: TITLE_DOWNLOAD});
});

router.post('/', function (req, res, next) {
    res.locals.userName = req.session.userName;
    var code = req.body['code'];
    var file = FILE.getFileById(code);
    if (file == undefined || file.endTime < new Date().getTime()) {
        res.locals.error = 'File is not existed or out of date!';
        res.render('download', {title: TITLE_DOWNLOAD});
        return;
    }
    res.setHeader('Content-disposition', 'attachment; filename=' + file.name);
    res.setHeader('Content-type', file.mimetype);
    var fstream = fs.createReadStream(file.path);
    fstream.on('data', function (filebody) {
        res.write(filebody);
    });
    fstream.on('end', function () {
        console.log("end");
        res.end();
    });
    fstream.on('error', function (err) {
        console.log(err);
    });
});

module.exports = router;