/**
 * Module dependencies.
 */

var crypto = require('crypto');
if (process.platform == 'linux'){
	var microtime = require('microtime');
}

exports.isJson = function (arg) {
	arg = (typeof(arg) == 'function') ? arg() : arg;
	if (typeof(arg) != 'string') {
		return false;
	}
	try {
		arg = (!JSON) ? eval('(' + arg + ')') : JSON.parse(arg);
		return true;
	} catch (e) {
		return false;
	}
}

exports.recursiveSort = function (obj) {
	var sorted = {},
	key, temp = [];

	for (key in obj) {
		if (obj.hasOwnProperty(key)) {
			temp.push(key);
		}
	}

	temp.sort();

	for (key = 0; key < temp.length; key++) {
		if (this.getTypeName(obj[temp[key]]) == 'Object'){
			obj[temp[key]] = this.recursiveSort(obj[temp[key]]);
		}else if(this.getTypeName(obj[temp[key]]) == 'Array'){	
		
		var self = this;
	    obj[temp[key]].forEach(function(element,k,array){
			if (Object.prototype.toString.call(element).slice(8, -1)  == 'Object'){
				 obj[temp[key]][k] = self.recursiveSort(element);
			}
		 });
		}
		
		sorted[temp[key]] = obj[temp[key]];
	}
	return sorted;
}

exports.getTypeName = function (obj) {
	var clas = Object.prototype.toString.call(obj).slice(8, -1);
	return clas;
	return obj !== undefined && obj !== null && clas === type;
}

exports.checkHash = function (msg, socket, UUID) {
	msg = msg.replace(/\\/g, "\\\\");
	var obj = JSON.parse(msg);
	var sha1sum = crypto.createHash('sha1');
	var appHash = obj['hashcode'];

	var socketUserId = this.getUserIdBySocket(socket);
	var paramUserId = (obj['myinfo'] && obj['myinfo']['userId']) ? obj['myinfo']['userId'] : '';
    if(obj['userId'] != null)
    {
        paramUserId = obj['userId'];
    }
	var userId = (socketUserId) ? socketUserId : paramUserId;
	//obj = this.recursiveSort(obj);
	var serverHash = this.generateSha1Hash(userId, UUID, obj);
	if (serverHash === appHash) {
		return true;
	} else {
		return false;
	}
}

exports.generateSha1Hash = function (userId, UUID, obj) {

	//ハッシュコードのクリア
	obj['hashcode'] = '';
	//ハッシュ生成
	var objStr = JSON.stringify(obj);
	
	var str = UUID
	+ '+' + obj['uri']
	+ '?' + objStr;
	
	var struserId = String(userId);
	if (userId != null && struserId.length > 0) {
		str += '&' + userId;
	}
	str = str.replace(/\\\\/g, "\\");
	console.log(str);
	var sha1sum = crypto.createHash('sha1');
	sha1sum.update(unescape(encodeURIComponent(str)));
	var result = sha1sum.digest('hex');
	return result;
}

exports.getUserIdBySocket = function (socket) {
	try {
		var socketUserId = Object.keys(socket.manager.roomClients[socket.id]);
		socketUserId = (socketUserId[1]) ? socketUserId[1].replace('/', '') : false;
		return socketUserId;
	} catch (e) {
		return false;

	}
}


exports.scranble6 = function (v){
	// 奇数その1の乗算
	v *= 0x1cb5b;
	v &= 0x7FFFF; // 下位19ビットだけ残して正の数であることを保つ
	// ビット上下逆転
	v = (v >> 9) | ((v & 0x7FFF) << 10);
	// 奇数その2（奇数その1の逆数）の乗算
	v *= 0x16CD3;
	v &= 0x7FFFF;
	// ビット上下逆転
	v = (v >> 9) | ((v & 0x7FFF) << 10);
	// 奇数その1の乗算
	v *= 0x1cb5b;
	v &= 0x7FFFF;
	
	v = ('00000' + v).slice(-6);
	return v;
}

exports.scranble10 = function (v){
	
	// 奇数その1の乗算
	v *= 0x1d723a8b;
	v = v >>> 0;
	
	v = ('000000000' + v).slice(-10);
	return v;
}

exports.extgcd = function (a, b) {
	var result, prev;

	if (b === 0) {
		result = {x: 1, y: 0, gcd: a};
	} else {
		prev = this.extgcd(b, a % b);

		result = {
			x: prev.y,
			y: prev.x - Math.floor(a / b) * prev.y,
			gcd: prev.gcd
		};
	}

	return result;
}

exports.now = function(format) {
	var format = format || "yyyy-MM-dd hh:mm:ss"; 
	var date = new Date;

	var vDay = addZero(date.getDate());
	var vMonth = addZero(date.getMonth()+1);
	var vYearLong = addZero(date.getFullYear());
	var vYearShort = addZero(date.getFullYear().toString().substring(2,4));
	var vYear = (format.indexOf("yyyy") > -1 ? vYearLong : vYearShort);
	var vHour	= addZero(date.getHours());
	var vMinute = addZero(date.getMinutes());
	var vSecond = addZero(date.getSeconds());
	var vMillisecond = padWithZeros(date.getMilliseconds(), 3);
	if (process.platform == 'linux'){
		var vMicrosecond = microtime.now().toString().substr(13,3);
	} else {
		var vMicrosecond = '000';
	}
	var vTimeZone = offset(date);
	var formatted = format
		.replace(/dd/g, vDay)
		.replace(/MM/g, vMonth)
		.replace(/y{1,4}/g, vYear)
		.replace(/hh/g, vHour)
		.replace(/mm/g, vMinute)
		.replace(/ss/g, vSecond)
		.replace(/SSS/g, vMillisecond)
		.replace(/mic/g, vMicrosecond)
		.replace(/O/g, vTimeZone);
	return formatted;
};

exports.unixNow = function() {
	if (process.platform == 'linux'){
		return microtime.now();
	} else {
		return parseInt((new Date)/1) + '000';
	}
};

exports.mt_rand = function (min, max) {
  var argc = arguments.length;
  if (argc === 0) {
    min = 0;
    max = 2147483647;
  }
  else if (argc === 1) {
    throw new Error('Warning: mt_rand() expects exactly 2 parameters, 1 given');
  }
  else {
    min = parseInt(min, 10);
    max = parseInt(max, 10);
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addZero(vNumber) {
	return padWithZeros(vNumber, 2);
}

function padWithZeros(vNumber, width) {
	var numAsString = vNumber + "";
	while (numAsString.length < width) {
		numAsString = "0" + numAsString;
	}
	return numAsString;
}

function offset(date) {
	// Difference to Greenwich time (GMT) in hours
	var os = Math.abs(date.getTimezoneOffset());
	var h = String(Math.floor(os/60));
	var m = String(os%60);
	if (h.length == 1) {
		h = "0" + h;
	}
	if (m.length == 1) {
		m = "0" + m;
	}
	return date.getTimezoneOffset() < 0 ? "+"+h+m : "-"+h+m;
}