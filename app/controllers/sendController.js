	
	var express = require('express');
		io = require('../socket'),
	    mysql = require('mysql'),
	    config = require('../../config'),
	    xss = require('xss'),
	    client = mysql.createConnection(config);
	
	
	var sendController = {

		sendView: function (req, res) {
			client.query("SELECT * FROM wp_activity", function (error, result) {
				if (error) {
					return;
				}
				var now = parseInt((new Date()).getTime() / 1000),
					activities = [];
				result.forEach(function (info) {
					if (info['startTime'] < now && now < info['endTime']) {
						activities.push(info);
					}
				});
				return res.render('send', {
					title: "弹幕发送",
					activities: activities
				});
			});
		}
	}

	module.exports = sendController;