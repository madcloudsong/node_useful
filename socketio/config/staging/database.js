
// config.local.js

var set = (process.env.NODE_MY_SET) ? process.env.NODE_MY_SET : '';
var host = 'localhost' + set;
console.log('my redis host is '+host);

module.exports = {
	'pub'    : {'port' : 10379, 'host' : host},
	'sub'    : {'port' : 10379, 'host' : host},
	'store'  : {'port' : 10379, 'host' : host},
};