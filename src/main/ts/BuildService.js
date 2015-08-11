///<reference path="DataTypes.ts"/>
var BuildService = (function () {
    function BuildService() {
    }
    BuildService.prototype.startListening = function () {
        if (this._app) {
            return;
        }
        var express = require('express');
        var bodyParser = require('body-parser');
        var multer = require('multer');
        var app = express();
        app.use(bodyParser.json()); // for parsing application/json
        app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
        app.use(multer()); // for parsing multipart/form-data
        var server = app.listen(64321, function () {
            var host = server.address().address;
            var port = server.address().port;
            console.log('http server listening at http://%s:%s', host, port);
        });
        this._app = app;
    };
    BuildService.prototype.onBuildRequest = function (func) {
        this._app.post('/start', function (req, res) { return func(req, res); });
    };
    BuildService.prototype.onStatusRequest = function (func) {
        this._app.get('/status', function (req, res) { return func(req, res); });
    };
    BuildService.prototype.onLogRequest = function (func) {
        this._app.get('/log', function (req, res) { return func(req, res); });
    };
    BuildService.prototype.pingFinish = function (result, onFinish) {
        var request = require('request');
        var args = {
            headers: {
                'content-type': 'application/json' },
            'url': result.request.pingURL + "?id=" + result.request.id,
            'body': JSON.stringify(result)
        };
        request.post(args, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log('build finished notification success');
            }
            else {
                console.log('build finished notification error: ' + (error ? error : JSON.stringify(response)));
            }
            onFinish();
        });
    };
    return BuildService;
})();
exports.BuildService = BuildService;
