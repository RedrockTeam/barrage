
	var express = require('express');
		io = require('../socket'),
	    mysql = require('mysql'),
	    config = require('../../config'),
	    xss = require('xss'),
	    client = mysql.createConnection(config);
		
	var indexController = {
		
		loginView: function (req, res, next) {
			return res.render('login', {
				title: "红岩网校弹幕系统登录"
			});
		},
		
		
		loginDeal: function (req, res, next) {	
			var activityId = req.body.activityId,
				stuId = req.body.stuId;
			client.query("SELECT * FROM wp_activity WHERE activityId = '" + activityId + "' AND stuId = '" + stuId + "'", function (error, result) {
				if (result.length != 0) {
					return res.json({
						status: 200,
						info: 'ok',
						data: result[0],
						path: req.body.path
					});
				} else {
					return res.json({
						status: 0,
						info: "此活动不存在!"
					});
				}
			});
		},
		
		
		
		indexView: function (req, res, next) {
			var id = req.cookies.id;
			if (id == null) {
				res.redirect('login');
			} else {
				client.query("SELECT videoSrc, cover FROM wp_activity WHERE activityId = '" + id + "'", function (error, result) {
					if (result == undefined || result.length == 0) {
						return res.redirect('login');
					} else {
						if (result[0].videoSrc) {
							var info = {
								videoSrc: result[0].videoSrc,
								cover: result[0].cover
							}
						} else {
							var info = {
								videoSrc: " ",
								cover: result[0].cover
							}
						}
						return res.render('index', {
							title: "弹幕系统!",
							info: info
						});
					}
				});
			}
		},

		insertBarrage:  function (_info) {
			try {
				var _insertSQL = "INSERT INTO wp_barrage SET openid = ?, face = ?, nickname = ?, activityId = ?, color = ?, position = ?, text= ?";
				var _result = client.query(
					_insertSQL, 
					[
						_info.openid, 
						_info.face, 
						_info.nickname, 
						_info.activityId, 
						_info.color, 
						_info.position, 
						_info.text
					]
				);
				return _result;
			} catch (e) {
				return false;
			}
		},
		
		// 弹幕通过审核
		barrageToIndex: function (req, res) {
			var info = req.body;
			try {
				if (info.type == 'array') {
					var count = 0, userCount = 0;
					info.data.forEach(function (_info){
						client.query("SELECT id FROM wp_barrage WHERE openid = '"+ _info.openid +"' AND activityId = '"+ _info.activityId +"'", function (error, result) {
							io.barrageToIndex(_info);
							if (result.length == 0) {
								userCount++;
							}
							count++;
							if (indexController.insertBarrage(_info)) {
								if (info.data.length == count) {
									return res.json({
										status: 200,
										userCount: userCount
									});
								}
							} else {
								return;
							}
						});
					});
				} else if (info.type == 'object') {
					client.query("SELECT id FROM wp_barrage WHERE openid = '"+ info.data.openid +"' AND activityId = '"+ info.data.activityId +"'", function (error, result) {
						// 发送弹幕
						io.barrageToIndex(info.data);
						// 弹幕入库
						if (indexController.insertBarrage(info.data)) {
							result.length == 0 ? userCount = 1 : userCount = 0;
							return res.json({
								status: 200,
								userCount: userCount
							});
						}
					});
				}
			} catch (e) {
				return res.end();
			}
		}
	}

	module.exports = indexController;
	
	
	
	
