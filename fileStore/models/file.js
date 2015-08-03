var crypto = require('crypto');
var JDB = require('../models/data.js');

function File(file){
    this.id = file.id;
    this.name = file.name;
    this.path= file.path;
    this.md5 = file.md5;
    this.code = file.code;
    this.endTime = file.endTime;
}

module.exports = File;

File.prototype.save = function save() {
    JDB.addFile(this.userName, this.userPwd);
};

var genMd5 = function genMd5(t) {
    return crypto.createHash('md5').update(t).digest('hex');
};

File.addFile = function addFile(userName, file) {
    var t = file.md5 + userName;
    var id = genMd5(t).substr(0, 6);
    file.id = id;
    file.code = id;
    JDB.addFile(userName, id, file);
};

File.checkIsExist = function checkIsExist(userName, md5) {
    var t = md5+ userName;
    var id = genMd5(t).substr(0, 6);
    return JDB.checkFileExistForUser(userName, id);
};

File.getAllFileList = function getAllFileList() {
    return JDB.getAllFileList();
};

File.getFileListByUser = function getFileListByUser(userName) {
    return JDB.getFileListByUser(userName);
};

File.getFileById = function getFileById(id) {
    return JDB.getFileById(id);
};

File.deleteFile = function deleteFile(userName, id) {
    JDB.deleteFile(userName, id);
};


