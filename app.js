
var express = require('express');
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    app = express(),
    route = require('./app/routes/route');

    app.set('views', path.join(__dirname, 'app/views'));
    app.set('view engine', 'ejs');

    app.use(favicon(__dirname + '/public/favicon.ico'));
    // app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(cookieParser());
    app.use("/chat_video", express.static(path.join(__dirname, 'public')));
    app.use('/chat_video', route);

    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });


    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
        app.use(function(err, req, res, next) {
            res.status(err.status || 500);
            res.render('error', {
                message: "错误!",
                error: "error"
            });
        });
    }
     

    // no stacktraces leaked to user
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('404');
    });


    module.exports = app;
