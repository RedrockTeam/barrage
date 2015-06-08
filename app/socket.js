	
	var io = require('socket.io'),
  		mysql = require('mysql'),
  		config = require('../config');
  		
  		
  	var client = mysql.createConnection(config);
	
	
  	var	overallSocket, // 全局socket
  		indexSocket, // 首页socket
  		checkSocket, // 审核页面socket
  		indexSocketsMap = {}, // 主页面socket集合
  		indexSocketIDMap = {},// 主页面socketId集合
  		checkSocketsMap = {}, 
  		checkSocketIDMap = {};
	
	// 创建全局socket
	exports.createSocket = function (server) {
		overallSocket = io(server, {path: "/chat_video/socket_io"});
	}
	
	// 弹幕审核页面Socket
	exports.checkSocket = function () {
		checkSocket = overallSocket.of('check');
		checkSocket.on('connection', function (socket) {
			// 单点登录检测
			socket.on('login', function (data) {
				console.log('cookie是:' + data.id + '---socketId是:' + socket.id);
				if (checkSocketIDMap[data.id]) {
					socket.emit('checkCheckViewIsOpen', {info: false});
				} else {
					checkSocketIDMap[data.id] = socket.id;
					checkSocketsMap[data.id] = socket;
					socket.emit('checkCheckViewIsOpen', {info: true});
				}
			});
		    
		    socket.on('disconnect', function () {
		    	console.log(socket.id + "活动页面已经关闭!");
		    	var activityId;
		    	for (var activityId in checkSocketIDMap) {
		    		if (checkSocketIDMap[activityId] === socket.id) {
		    			console.log("socketId是:" + checkSocketIDMap[activityId] + "---cookie是" + activityId + '的socket链接已经从Map中删除');
		    			delete checkSocketIDMap[activityId];
		    			delete checkSocketsMap[activityId];
		    			break;
		    		}
		    	}
		    	console.log(checkSocketIDMap);
		    });


		});
	}
	
	// 弹幕进入审核页面
	exports.barrageToCheck = function (info) {
		
		if (indexSocketIDMap[info.activityId]) {
			// 弹幕进入对应活动的审核页面
			if (checkSocketsMap[info.activityId]) {
				checkSocketsMap[info.activityId].emit('barrageToCheck', info);
			}
			return true;
		} else {
			// 如果此活动的主页面未打开,不能发送弹幕,直接返回
			return false;
		}
	}
	
	// 项目主页
	exports.indexSocket = function () {
		indexSocket = overallSocket.of('index');
		indexSocket.on('connection', function (socket) {
			// 单点登录检测
			socket.on('login', function (data) {
				if (indexSocketIDMap[data.id]) {
					socket.emit('checkIndexViewIsOpen', {info: false});
				} else {
					indexSocketIDMap[data.id] = socket.id;
					indexSocketsMap[data.id] = socket;
					socket.emit('checkIndexViewIsOpen', {info: true});
				}
			});
		    
		    socket.on('disconnect', function () {
		    	console.log(socket.id + "活动页面已经关闭!");
		    	for (var activityId in indexSocketIDMap) {
		    		if (indexSocketIDMap[activityId] === socket.id) {
		    			console.log("socketId是:" + indexSocketIDMap[activityId] + "---cookie是" + activityId + '的socket链接已经从Map中删除');
		    			delete indexSocketIDMap[activityId];
		    			delete indexSocketsMap[activityId];
		    			/*删除审核的socket相关信息
			    			if (checkSocketsMap[activityId] && checkSocketIDMap[activityId]) { 
			    				checkSocketsMap[activityId].emit("checkLogout", {info: false});
			    				delete checkSocketIDMap[activityId]; 
			    				delete checkSocketsMap[activityId]; 
			    			}
		    			*/
		    			break;
		    		}
		    	}
		    	console.log(indexSocketIDMap);
		    });
		});
	};

	// 弹幕发送到对应活动主页面
	exports.barrageToIndex = function (info) {
		try {
			if (indexSocketsMap[info.activityId]) {
				indexSocketsMap[info.activityId].emit('barrageToIndex', info);
			}
		} catch (e) {
			return false;
		}
	};
	
	
	
	

	
