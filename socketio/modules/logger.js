/**
 * Module dependencies.
 */

var enableLogging = 1; // ログ取得

var log4js = require('log4js');
var util = require('./util');
var logformat = require('../config/logformat.json');

// log4js
log4js.configure(logformat);

var accLogger = log4js.getLogger('ACCESS');
var appLogger = log4js.getLogger('APP');
var errLogger = log4js.getLogger('ERROR');
var retLogger = log4js.getLogger('RESULT');

exports.access_log = function (userId, msg, socket, emitTime) {
	var self = this;
	socket.get('receiveTime', function (err, receiveTime) {
		if (err) {
			return self.error_log(err, socket, __LINE__);
		}
		socket.get('uri', function (err, uri) {
			if (err) {
				return self.error_log(err, socket, __LINE__);
			}
			
			var sourceIp;
			var userAgent;
			if (undefined != socket.handshake){
			sourceIp = (undefined != socket.handshake.address) ?
				socket.handshake.address.address : '';
			userAgent = (undefined !== socket.handshake.headers) ?
				socket.handshake.headers['user-agent'] : '';
			}
			
			// emitTimeが存在する場合send
			if (emitTime){
				var category = 'send';
				var resTime = (emitTime - receiveTime);
			// emitTimeが存在しない場合receive
			} else {
				var category = 'receive';
				var resTime = '';
			}
			
			var logText = 'time:'+util.now('yyyy-MM-dd hh:mm:ss.SSSmic')+'\t'+
				'notify:'+category+'\t'+
				'viewer_id:'+userId+'\t'+
				'unixtime:'+util.unixNow()+'\t'+
				'response_time:'+resTime+'\t'+
				'log_leve:INFO'+'\t'+
				'event:'+'\t'+
				'uri:'+uri+'\t'+
				'source_ip:'+sourceIp+'\t'+
				'useragent:'+userAgent+'\t'+
				'body:'+msg;

			if (enableLogging == 0) {
				console.log(logText);
			} else {
				accLogger.info(logText);

			}
		});
	});
}

exports.error_log = function (str, socket, line) {
	var socketUserId = getUserIdBySocket(socket);
	if (socketUserId && socketUserId < 1000) { return; } // インフラチェックユーザはログ出力しない
	
	var socketId = (socket && socket.id) ? socket.id : '';
	if (enableLogging == 0) {
		console.log('【' + str + ' socketId:' + socketId + ' socketUserId:' + socketUserId + '】' + 'line:' + line);
	} else {
		errLogger.error('【' + str + ' socketId:' + socketId + ' socketUserId:' + socketUserId + '】' + 'line:' + line);
	}

}

exports.debug_log = function (str, socket, line) {
	var socketUserId = getUserIdBySocket(socket);
	if (socketUserId && socketUserId < 1000) { return; } // インフラチェックユーザはログ出力しない
	
	var socketId = (socket && socket.id) ? socket.id : '';
	var usage = process.memoryUsage();
	if (enableLogging == 0) {
		console.log('【' + str + ' socketId:' + socketId + ' socketUserId:' + socketUserId + '】' + ' rss;' + usage.rss + ' heapTotal;' + usage.heapTotal + ' heapUsed:' + usage.heapUsed);
	} else {
		appLogger.debug('【' + str + ' socketId:' + socketId + ' socketUserId:' + socketUserId + '】' + ' rss;' + usage.rss + ' heapTotal;' + usage.heapTotal + ' heapUsed:' + usage.heapUsed);
	}
}

exports.info_log = function (str, socket, line) {
	var socketUserId = getUserIdBySocket(socket);
	if (socketUserId && socketUserId < 1000) { return; } // インフラチェックユーザはログ出力しない
	
	var socketId = (socket && socket.id) ? socket.id : '';
	if (enableLogging == 0) {
		console.log('【' + str + ' socketId:' + socketId + ' socketUserId:' + socketUserId + '】');
	} else {
		appLogger.info('【' + str + ' socketId:' + socketId + ' socketUserId:' + socketUserId + '】');
	}
}

exports.result_log = function (str) {

	if (enableLogging == 0) {
		console.log(str);
	} else {
		retLogger.info(str);
	}
}

var getUserIdBySocket = function (socket) {
	try {
		var socketUserId = Object.keys(socket.manager.roomClients[socket.id]);
		socketUserId = (socketUserId[1]) ? socketUserId[1].replace('/', '') : false;
		return socketUserId;
	} catch (e) {
		return false;

	}
}
