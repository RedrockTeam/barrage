
	var express = require('express');
		io = require('../socket'),
	    mysql = require('mysql'),
	    config = require('../../config'),
	    xss = require('xss'),
	    client = mysql.createConnection(config);


	var checkController = {
		checkView: function (req, res, next) {
			var id = req.cookies.id;

			if (!id) {
				res.redirect('login');
			}
			try {
				client.query("SELECT count(*) as allCount FROM wp_barrage WHERE activityId = '"+ id + "'", function (error, result) {
					if (result == undefined || result.length == 0) {
						return res.redirect('login');
					}

					var allCount = result[0].allCount;
					client.query("SELECT count(*) as userCount FROM wp_barrage WHERE activityId = '"+ id +"' GROUP BY openid", function (error, result) {
						var userCount = result.length;
						var ave = 0;
						if (allCount != 0) {
							ave = allCount / userCount;
							if (parseInt(ave) != ave) {
								ave = ave.toFixed(1);
							}
						}
						client.query("SELECT * FROM wp_filter WHERE activityId = '"+ req.cookies.id + "' ORDER BY id ASC", function (error, blackWords) {
							var blackWords = blackWords;
							client.query("SELECT * FROM wp_black WHERE activityId = '"+ req.cookies.id + "' ORDER BY id ASC", function (error, blackUsers) {
								return res.render("check", {
									title: '红岩网校弹幕系统审核',
									allCount: allCount,
									userCount: userCount,
									ave: ave,
									blackWords: blackWords,
									blackUsers: blackUsers
								});
							});
						});
					})
				});
			} catch (e) {
				return;
			}
		},
		
		// 加入黑名单
		addBlackUser: function (req, res) {
			client.query("INSERT INTO wp_black SET ?", req.body, function (error, info) {
				if (info.affectedRows) {
					return res.json({
						status: 200,
						info: '此用户已被加入黑名单',
					});
				} else {
					return res.json({
						status: 0,
						info: '加入黑名单失败'
					});
				}
			});
		},

		// 添加屏蔽词
		addBlackWord: function (req, res)  {
			var colorsArray = ['#006633', '#0099ff', '#f16e50', '#666666', '#4c549f', '#87b11d'];
			var color = colorsArray[parseInt(6 * Math.random())];
			req.body.color = color;
			client.query("INSERT INTO wp_filter SET ?", req.body, function (error, info) {
				if (info.affectedRows) {
					return res.json({
						status: 200,
						info: '屏蔽词汇添加成功',
						data: {
							id: info.insertId,
							color: color
						}
					});
				} else {
					return res.json({
						status: 0,
						info: '屏蔽词汇添加失败'
					});
				}
			});
		},


		// 删除屏蔽词汇
		delBlackWord: function (req, res) {
			if (req.body) {
				client.query('DELETE FROM wp_filter WHERE id = '+ req.body.id +'', function (error, result) {
					if (result.affectedRows) {
						return res.json({
							status: 200,
							info: "成功删除"
						});
					} else {
						return res.json({
							status: 0,
							info: "屏蔽词汇删除失败"
						});
					}
				});
			}
		},
		
		// 弹幕发送之后进入审核页面
		barrageToCheck: function (req, res, next) {
			var info = req.body,
			    id = info.activityId;
			
			var blackSQL = "SELECT * FROM wp_black WHERE openid = '" + info.openid + "' AND activityId = '" + id + "'";
			try {
				client.query(blackSQL, function (error, result) {
					if (result.length != 0) {
						return res.json({
							status: 100,
							info: '本次活动你已经不能发送弹幕了哦︶︿︶'
						});
					} else {
						// 屏蔽词汇列表
						client.query("SELECT * FROM wp_filter WHERE activityId = '"+ id + "'", function (error, result) {
							// 过滤xss注入
							info = JSON.parse(xss(JSON.stringify(info)));
							if(info.text){
								info.text = info.text.substring(0, 70);
								var blackWords = '';
								result.forEach(function (word) {
									blackWords += word.content + '|';
								});
								var pattern = new RegExp(blackWords, "gi");
								// 过滤字符
								info.text = info.text.replace(pattern, "");
							}
							
						    // 判断活动是否在举行中  开始前一小时--结束后两小时
							var checkTimeSQL = "SELECT startTime, endTime FROM wp_activity WHERE activityId = '" + id + "'";
							client.query(checkTimeSQL, function (error, result) {
								if (result == undefined || result.length == 0) {
									return;
								}

								var now = parseInt((new Date()).getTime() / 1000);
								if (parseInt(result[0].startTime) - now > 3600) {
									return res.json({
										status: 0,
										info: "此活动暂未开始!"
									});
								} else if (now - parseInt(result[0].endTime) > 7200) {
									return res.json({
										status: 0,
										info: "此活动已结束!"
									});
								} else {
									// 弹幕数字++;
									info.barrageCount = 1;
									// 弹幕发送到审核页面
									if (!io.barrageToCheck(info)) {
										return res.json({
											status: 0,
											info: "此活动暂未举办"
										})
									} else {
										// ajax请求返回
										return res.json({
											status: 200,
											info: "发送成功!"
										});
									}
								}
							});
						});
					}
				});	
			} catch (e) {
				return res.end();
			}
		}
	}


	module.exports = checkController;