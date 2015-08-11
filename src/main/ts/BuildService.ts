///<reference path="DataTypes.ts"/>

import {BuildResult} from 'DataTypes';

export class BuildService {

    private _app : any;

    startListening() {
        if(this._app) {
            return;
        }
        var express : any = require('express');
        var bodyParser : any = require('body-parser');
        var multer : any = require('multer');

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
    }

    onBuildRequest(func : (req, res) => void) {
        this._app.post('/start', (req, res) => func(req,res));
    }

    onStatusRequest(func : (req, res) => void) {
        this._app.get('/status', (req, res) => func(req,res));
    }

    onLogRequest(func : (req, res) => void) {
        this._app.get('/log', (req, res) => func(req,res));
    }

    pingFinish(result : BuildResult, onFinish: () => void) {
        var request : any = require('request');
        let args = {
            headers: {
                'content-type' : 'application/json'},
            'url': result.request.pingURL + "?id=" + result.request.id,
            'body': JSON.stringify(result)
        };

        request.post(args , (error, response, body) => {
            if (!error && response.statusCode == 200) {
                console.log('build finished notification success');
            } else {
                console.log('build finished notification error: ' + (error ? error : JSON.stringify(response)));
            }
            onFinish();
        });
    }

}
