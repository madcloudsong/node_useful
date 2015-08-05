var process_num = 4;


var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var async = require('async');
var http = require('http');
require('node-ka-patch');

var config = require('./config/common');
var util = require('./modules/util');

var routes = require('./routes/index');


var app = express();
var cluster = require('cluster');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.set('port', process.env.PORT || config.listenport);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser('test'));
app.use(session({secret: 'test', 'name': 'testapp', resave: false, saveUninitialized: true}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/index', routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


if (cluster.isMaster) {
    var log4jsMaster = require('log4js');
    var logformat_master = require('./config/logformat_master.json');
    log4jsMaster.configure(logformat_master);

    // redis store
    var RedisStore = require('socket.io/lib/stores/redis');
    var redis = require('socket.io/node_modules/redis');
    var store = redis.createClient(config.databases.store.port, config.databases.store.host);
    var logger = require('./modules/logger');

    store.del(config.connection_key_str + 'redis');

    store.on('error', function (err) {
        logger.info_log('redis store error:' + err);
    });

    for (var i = 0; i < process_num; i++) {
        cluster.fork();
    }

    // 定期graceful
    var destroyTimers = {};
    setInterval(function () {
        logger.info_log("cluster.disconnect");
        cluster.disconnect();
        for (var i = 0; i < process_num; i++) {
            cluster.fork();
        }
    }, config.graceful_time * 10 * 1000);
    //////

    //cluster 事件
    cluster.on('disconnect', function (worker) {
        logger.info_log("disconnect:" + worker.id);
        destroyTimers[worker.id] = setTimeout(function () {
            worker.destroy();
        }, (config.graceful_time + 1) * 10 * 1000);
    });

    cluster.on('exit', function (worker, code, signal) {
        logger.info_log('worker(' + worker.id + ').exit ' + worker.process.pid);
        var timer = destroyTimers[worker.id];
        if (timer) {
            clearTimeout(timer);
            delete destroyTimers[worker.id];
        }
    });
    cluster.on('online', function (worker) {
        logger.info_log('worker(' + worker.id + ').online ' + worker.process.pid);
    });
    cluster.on('listening', function (worker, address) {
        logger.info_log('worker(' + worker.id + ').listening ' + address.address + ':' + address.port);
    });
    cluster.on('death', function (worker) {
        logger.info_log('worker(' + worker.id + ').died. restart...');
        cluster.fork();
    });
    //////////////////

    process.on('uncaughtException', function (err) {
        logger.info_log('uncaughtException(master): ' + err.stack);
    });
} else {
    var connect = 0;
    var retryTimers = {};
    var closedtimer = 0;
    var logger = require('./modules/logger');
    var server;
    var io;

//  if (app.get('env') === 'development') {
//    app.use(function(err, req, res, next) {
//      res.status(err.status || 500);
//      res.render('error', {
//        message: err.message,
//        error: err
//      });
//    });
//  }
//
// production error handler
// no stacktraces leaked to user
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });
    (function () {
        var callee = arguments.callee;
        server = http.createServer(app);
        //io = require('socket.io').listen(server);
        server.listen(app.get('port'), function () {
            logger.info_log('Express server listening on port ' + app.get('port'));
            logger.info_log('env : ' + app.get('env'));
        });
        server.on('error', function (e) {
            if (e.code == 'EADDRINUSE') {
                logger.info_log('Address in use, retrying...');
                setTimeout(callee, 1000);
            }
        });
    })();
    io = require('socket.io').listen(server);


    //if ('production' == app.get('env')) {
    io.set('log level', 1);
    //}
    io.set('close timeout', 10);
    io.set('heartbeat timeout', 10);
    io.set('heartbeat interval', 4);

    // redis store
    var RedisStore = require('socket.io/lib/stores/redis');
    var redis = require('socket.io/node_modules/redis');
    var pub = redis.createClient(config.databases.pub.port, config.databases.pub.host);
    var sub = redis.createClient(config.databases.sub.port, config.databases.sub.host);
    var store = redis.createClient(config.databases.store.port, config.databases.store.host);

    pub.on('error', function (err) {
        logger.error_log('redis pub error:' + err);
        if (io.sockets.clients().length > 0) {
            io.sockets.clients().forEach(function (socket) {
                socket.disconnect();
            })
        }
    });
    sub.on('error', function (err) {
        logger.error_log('redis sub error:' + err);
        if (io.sockets.clients().length > 0) {
            io.sockets.clients().forEach(function (socket) {
                socket.disconnect();
            })
        }
    });
    store.on('error', function (err) {
        logger.error_log('redis store error:' + err);
        if (io.sockets.clients().length > 0) {
            io.sockets.clients().forEach(function (socket) {
                socket.disconnect();
            })
        }
    });

    io.set('transports', ['websocket']);
    io.set('store', new RedisStore({
        redisPub: pub,
        redisSub: sub,
        redisClient: store
    }));

    // グレイスフルタイムを過ぎたworkerは全てのセッションをクローズする
//	process.on('message', function(msg) {
//		console.log("debug !!!!!!!!");
//		if(msg === 'closed') {
//			console.log("worker "+cluster.worker.id+" closed");
//      		io.sockets.clients().forEach(function (socket) { socket.disconnect(); })
//    	}
//  });
    // クラスター切断時、接続数をチェックし0ならプロセス終了
    cluster.on('disconnect', function (worker) {
        closedtimer = 0;
        logger.info_log("debug !!!!!" + cluster.worker.id);
        if (connect == 0) {
            logger.info_log("000 worker " + cluster.worker.id + " ended because connections is 0");
            cluster.worker.destroy();
        } else {
            logger.info_log("debug call back" + cluster.worker.id);
            closedtimer = setTimeout(function () {
                logger.info_log("worker " + cluster.worker.id + " closed");
                io.sockets.clients().forEach(function (socket) {
                    socket.disconnect();
                })
                cluster.worker.destroy();
            }, config.graceful_time * 60 * 1000);
        }
    });

    process.on('uncaughtException', function (err) {
        logger.error_log('uncaughtException:(worker) ' + err.stack);
        process.exit(0);
    });

    io.on('connection', function (socket) {

        console.log("connect " + util.getUserIdBySocket(socket));

        connect++;
        // 接続数が最大に達しているときはエラーを即座に返して切断
        store.incr(config.connection_key_str + 'redis', function (err, connectionNum) {
            store.get(config.max_connection_key_str, function (err, maxConnection) {
                if (!maxConnection) {
                    maxConnection = 100000;
                }
                if (connectionNum > maxConnection) {
                    var send_msg = {
                        'uri': 'error',
                        'user': USER_MYSELF,
                        'resultcode': RESULT_CODE_CROWDED
                    };
                    socket.join(socket.id);
                    io.sockets.in(socket.id).emit('message', JSON.stringify(send_msg));
                    setTimeout(function () {
                        socket.disconnect();
                    }, 3000);

                }
            });
        });
        socket.on('message', function (msg) {
            logger.debug_log('receive msg:' + msg, socket, __LINE__);

            console.log("message recieve");

            var receiveTime = util.unixNow();
            // メッセージのJSONをparamに展開
            if (!util.isJson(msg)) {
                logger.error_log('JSON形式ではないmsgが送られた msg:' + msg, socket, __LINE__);
                socket.disconnect();
                return;
            }

            var param = JSON.parse(msg);


            var uri = (param && param['uri']) ? param['uri'] : '';

            // uriがregistermatchingかcheckbattlecode以外でsocketにuserIdが紐付いていない場合、不正アクセス
            var userId = util.getUserIdBySocket(socket);

            if (!uri) {
                var send_msg = {
                    'uri': 'error',
                    'resultcode': "RESULT_CODE_PARAMETER_ERROR"
                }
                emit(userId, send_msg, socket);
            }

            if (!userId) {
                if (param['uri'] != 'joinroom' &&
                    param['uri'] != 'joinmultibattleroom') {
                    logger.error_log('socketid not exist msg:' + msg, socket, __LINE__);
                    return;
                } else {
                    userId = param['userId'];
                }
            }

            var tasks = [];
            tasks.push(function (next) {
                socket.set('receiveTime', receiveTime, next())
            });
            tasks.push(function (next) {
                socket.set('uri', param['uri'], next())
            });
            async.series(tasks, function (err, results) {
                // receivelog
                logger.access_log(userId, msg, socket);

                // uriによって振り分け処理
                switch (param['uri']) {
                    //ルーム周り
                    case 'joinroom':
                        joinroom(param, socket);
                        break;
                    case 'msg':
                        sendmsg(param, socket);
                        break;
                    default:
                        break;
                }
            });
        });

        socket.on('disconnect', function (msg) {
            console.log("disconnect!");
            connect--;
            store.decr(config.connection_key_str + 'redis');
            cleanup(socket);
            if (cluster.worker.state == "disconnected" && connect == 0) {
                logger.info_log("111 worker " + cluster.worker.id + " ended because connections is 0");
                clearTimeout(closedtimer);
                setTimeout(function () {
                    logger.info_log("worker " + cluster.worker.id + " KILL");
                    cluster.worker.kill();
                }, 2000);
            }
        });
    });
    io.on('end', function (socket) {
        logger.info_log("end " + cluster.worker.id + "socket" + socket);
        socket.end();
    });


}

global.__defineGetter__('__LINE__', function () {
    return (new Error()).stack.split('\n')[2].split(':').reverse()[1];
});

function emit(id, obj, senderSocket) {
    if (!id) {
        return false;
    }
    msg = JSON.stringify(obj);
    io.sockets.in(id).emit('message', msg);
    var emitTime = util.unixNow();
    logger.access_log(id, msg, senderSocket, emitTime);
}


function cleanup(socket) {

    socket_userId = util.getUserIdBySocket(socket);

    if (!socket_userId) {
        socket.removeAllListeners();
        return;
    }

    logger.info_log('disconnect user_id:' + socket_userId + ' socket.id:' + socket.id, socket, __LINE__);
    socket.leave(socket_userId);
}


function joinroom(param, socket) {
    console.log("workerid" + cluster.worker.id);
    socket.join(param['roomId']);
    var data = {msg: param['userId'] + " enter room: " + param['roomId']};
    socket.broadcast.emit('message', JSON.stringify(data));
    //socket.to(param['roomId']).emit('message', JSON.stringify(data));
    //io.socket.in(param['roomId']).emit('message', JSON.stringify(data));
    console.log(param['userId'] + " enter room: " + param['roomId']);
}

function sendmsg(param, socket) {
    console.log("workerid" + cluster.worker.id);
    var data = {msg: param['userId'] + " say in room " + param['roomId'] + ": " + param['msg']};
    console.log(param['userId'] + " room " + param['roomId'] + " say " + param['msg']);
    socket.to(param['roomId']).emit('message', JSON.stringify(data));
}




