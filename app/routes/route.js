

	var _Router = require('express').Router(),
	    indexController = require('../controllers/indexController.js'),
		checkController = require('../controllers/checkController.js'),
		sendController = require("../controllers/sendController.js");


	/*
	 * 弹幕发送页面路由
	 */
	_Router.get('/send', sendController.sendView);
	

	/*
	 * 首页部分路由
	 */
	_Router.get('/login', indexController.loginView);
	_Router.post('/login', indexController.loginDeal);
	_Router.get('/index', indexController.indexView);
	_Router.post('/barrageToIndex', indexController.barrageToIndex);


	/*
	 * 审核页面路由
	 */
	_Router.post('/addBlackUser', checkController.addBlackUser);
	_Router.post('/addBlackWord', checkController.addBlackWord);
	_Router.post('/delBlackWord', checkController.delBlackWord);
	_Router.get('/check', checkController.checkView);
	_Router.post('/barrageToCheck', checkController.barrageToCheck);



	module.exports = _Router;
