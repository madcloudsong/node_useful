var JDB = require('../models/data.js');

function User(user){
    this.userName = user.userName;
    this.userPwd= user.userPwd;
}

module.exports = User;

User.prototype.save = function save() {
    JDB.addUser(this.userName, this.userPwd);
};

User.checkIsExist = function checkIsExist(userName) {
    return JDB.checkUserExist(userName);
};

User.getUserByUserName = function getUserByUserName(userName) {
    return JDB.getUserByUserName(userName);
};