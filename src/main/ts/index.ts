///<reference path="../../../lib/node-0.10.d.ts"/>


import fs = require("fs");

interface BuildRequest {
    id : string,
    repo : string;
    commit : string;
    pingURL : string;
}

interface BuildConfig {
    command : string;
    dependencies : Array<string>;
}

class BuildResult {
    repo : string;
    commit : string;
    succeeded : boolean;
    buildConfig : BuildConfig;
    log : string = '';
}

var buildRequest : BuildRequest;
var buildResult = new BuildResult();

function createServer() {
    var express : any = require('express');
    var bodyParser : any = require('body-parser');
    var multer : any = require('multer');

    var app = express();
    app.use(bodyParser.json()); // for parsing application/json
    app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
    app.use(multer()); // for parsing multipart/form-data

    return app;
}

var buildStarted = false;

var app = createServer();

var server = app.listen(64321, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('http server listening at http://%s:%s', host, port);
});

app.post('/start', (req, res) => {
    console.log('received /build/start POST request');
    res.end();

    if(buildStarted) {
        console.warn('build already started');
        return;
    }
    buildStarted = true;

    appendLog('build request received: ' + JSON.stringify(req.body));
    buildRequest = req.body;
    start();
});

var shell = require('shelljs');

function start() {

    buildResult.repo = buildRequest.repo;
    buildResult.commit = buildRequest.commit;

    let checkoutSuccess = checkoutProject(buildRequest.repo, buildRequest.commit);
    if(checkoutSuccess) {
        buildResult.succeeded = startBuild();

    }
    finishBuild();
}

function checkoutProject(repo : string, commit : string) : boolean {
    let clone = 'git clone https://github.com/' + repo + '.git';
    appendLog(clone);
    let result = shell.exec(clone);
    appendLog(result.output);

    if(result.code != 0)
    {
        appendLog('checkout failed');
        return false;
    }

    let cdCmd = 'cd ' + repo.split('/')[1];
    shell.exec(cdCmd);
    appendLog(cdCmd);

    let buildConf = shell.cat(repo.split('/')[1] + '/ci.json');
    buildResult.buildConfig = JSON.parse(buildConf);
    appendLog('build configuration read: ' + buildConf);

    if(!commit) {
        buildResult.commit = shell.exec('git log -1 --stat').output.split("\n")[0].split(" ")[1].trim();
        appendLog('commit not provided, running in last commit: ' + buildResult.commit);
    }

    return true;
}

function startBuild() : boolean {
    appendLog(buildResult.buildConfig.command);
    let res = shell.exec(buildResult.buildConfig.command);
    appendLog(res.output);
    return res.code == 0;
}


function finishBuild() : void {
    appendLog('notifying build finished');

    var request : any = require('request');
    let args = {
            headers: {
                'content-type' : 'application/json'},
                'url': buildRequest.pingURL + "?id=" + buildRequest.id,
                'body': JSON.stringify(buildResult)
            };

    request.post(args , (error, response, body) => {
        if (!error && response.statusCode == 200) {
            appendLog('build finished notification success');
        } else {
            appendLog('build finished notification error: ' + error ? error : JSON.stringify(response));
        }
        appendLog('build status: ' + buildResult.succeeded ? 'SUCCESS' : 'FAILED');
        process.exit(buildResult.succeeded ? 0 : 1);
    });
}

function appendLog(text : string) {
    fs.appendFileSync('log.txt', text + "\n");
    buildResult.log += text + '\n';
}





// TESTING SERVER
// curl -X POST -H "Content-Type: application/json" -d '{"id":"myBuildId","repo":"mserranom/lean-ci","commit":"","pingURL":"http://localhost:65234/end"}' http://localhost:65234/start
//app.post('/end', (req, res) => {
//    console.log('build ' + req.query.id + ' success!!');
//    res.end();
//});





