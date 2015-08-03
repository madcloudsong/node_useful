var fs = require('fs');
var path = require('path');
var dbPath = './data/data.dat';
var db = {};

var USER = 'tbl_user',
    PIC = 'tbl_pic',
    USER_PIC = 'tbl_user_pic';

function JDB() {

}

var save = function save() {
    fs.writeFile(dbPath, JSON.stringify(db), function (err) {
        if (err) {
            console.log('db save error');
        } else {
            console.log('db save success');
        }
    });
};

var loadDB = function loadDB(callback) {
    fs.readFile(dbPath, {encoding: 'utf-8'}, function (err, bytesRead) {
        if (err) {
            console.log('db load error' + err);
        } else {
            console.log('db load success: ' + bytesRead);
            db = JSON.parse(bytesRead);
            callback();
        }
    });
};

JDB.setKV = function setKV(key, value) {
    console.log('setKV: ' + db);
    db[key] = value;
    save();
};

JDB.getKV = function getKV(key) {
    console.log('getKV: ' + db);
    return db[key];
};

var checkNeedInit = function checkNeedInit() {
    if (db[USER] == undefined) {
        db[USER] = {};
    }
    if (db[PIC] == undefined) {
        db[PIC] = {};
    }
    if (db[USER_PIC] == undefined) {
        db[USER_PIC] = {};
    }
    save();
};
//user
JDB.getUserByUserName = function getUserByUserName(userName) {
    return db[USER][userName];
};

JDB.checkUserExist = function checkUserExist(userName) {
    return db[USER][userName] != undefined;
};

JDB.addUser = function addUser(userName, userPwd) {
    db[USER][userName] = {
        userName : userName,
        userPwd : userPwd
    };
    save();
};
//file
JDB.getAllFileList = function getAllFileList() {
    return db[PIC];
};

JDB.getFileListByUser = function getFileListByUser(userName) {
    return db[USER_PIC][userName];
};

JDB.getFileById = function getFileById(id) {
    return db[PIC][id];
};

JDB.checkFileExistForUser = function checkFileExistForUser(userName, id) {
    return db[USER_PIC][userName][id] != undefined;
};

JDB.addFile = function addFile(userName, id, file) {
    db[PIC][id] = file;
    if(db[USER_PIC][userName] == undefined) {
        db[USER_PIC][userName] = {};
    }
    db[USER_PIC][userName][id] = file;
    save();
};

JDB.deleteFile = function deleteFile(userName, id) {
    var path = db[PIC][id]['path'];
    db[PIC][id] = undefined;
    db[USER_PIC][userName][id] = undefined;
    fs.unlink(path);
    save();
};

loadDB(checkNeedInit);

module.exports = JDB;
