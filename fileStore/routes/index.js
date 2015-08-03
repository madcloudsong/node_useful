var express = require('express');
var router = express.Router();
var JDB = require('../models/data.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.locals.userName = req.session.userName;
  JDB.setKV('test', 'value');
  console.log(JDB.getKV('test'));
  res.render('index', { title: 'Express' });
});

module.exports = router;
