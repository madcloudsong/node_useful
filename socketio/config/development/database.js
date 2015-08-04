
// config.local.js

var set = (process.env.NODE_MY_SET) ? process.env.NODE_MY_SET : '';
var host = 'itsong.net' + set;
console.log('my redis host is '+host);

module.exports = {
	'pub'    : {'port' : 6379, 'host' : host},
	'sub'    : {'port' : 6379, 'host' : host},
	'store'  : {'port' : 6379, 'host' : host},
};