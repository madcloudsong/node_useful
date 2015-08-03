var express = require('express');
var fs = require('fs');
var router = express.Router();
var crypto = require('crypto');
var TITLE_UPLOAD = 'Upload';
var FILE = require('../models/file.js');

/* GET home page. */
router.get('/', function (req, res, next) {
    if (req.session && req.session.userName) {
        res.locals.userName = req.session.userName;
        res.render('upload', {title: TITLE_UPLOAD});
    } else {
        res.redirect('/login');
    }
});

router.post('/', function (req, res, next) {
    var endTime = req.body['endTime'];
    if (endTime == 7) {
        endTime = new Date().getTime() + 7 * 24 * 3600 * 1000;
        console.log('endTIme: ' + endTime);
    } else {
        endTime = new Date().getTime() + 3 * 24 * 3600 * 1000;
    }
    var fileLimit = 20971520;
    var fileSize = req.files.file.size;
    if (fileSize > fileLimit) {
        fs.unlink(req.files.file.path);
        console.log('file is too large');
        res.locals.error = 'File is larger than 20M';
        res.render('upload', {title: TITLE_UPLOAD});
        return;
    }
    console.log(req.body);
    console.log(req.files);

    console.log('username: ' + req.session.userName);
    fs.readFile(req.files.file.path, function (err, bytesRead) {
        if (err) {
            console.log('file load error' + err);
        } else {
            console.log('file load success: ');

            var md5 = crypto.createHash('md5').update(bytesRead).digest('hex');
            var fileList = FILE.getFileListByUser(req.session.userName);
            for (i in fileList) {
                if (fileList[i] && fileList[i]['endTime'] > new Date().getTime() && fileList[i]['md5'] == md5) {
                    console.log("The same file is existed!");
                    res.locals.error = 'The same file is existed!';
                    res.render('upload', {title: TITLE_UPLOAD});
                    return;
                }
            }
            var file = {
                id: md5 + req.session.userName,
                code: md5 + req.session.userName,
                name: req.files.file.originalname,
                path: req.files.file.path,
                md5: md5,
                mimetype: req.files.file.mimetype,
                endTime: endTime
            };
            FILE.addFile(req.session.userName, file);
            res.redirect('/manage');
        }
    });

    //if (req.files.filePic != 'undefined') {
    //    var tempPath = req.files.filePic.path;
    //    fs.rename(tempPath, "./store/1.jpg", function (err) {
    //        if (err) {
    //            throw err
    //        }
    //        fs.fs.unlink(tempPath);
    //    });
    //}
    //res.send("put");
});

module.exports = router;