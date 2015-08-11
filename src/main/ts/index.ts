///<reference path="../../../lib/node-0.10.d.ts"/>
///<reference path="../../../lib/Q.d.ts"/>

import fs = require('fs');
var Q = require('Q');

import {Status, BuildResult, BuildRequest, BuildConfig} from './DataTypes';
import {BuildService} from './BuildService';
import {GitRepo} from './GitRepo';

var buildStatus : string = Status.NOT_STARTED;
var buildResult = new BuildResult();

var service = new BuildService();
var repo : GitRepo;

service.startListening();

service.onStatusRequest((req, res) => {
    console.log('received STATUS request');
    res.send(buildStatus);
});


service.onLogRequest((req, res) => {
    console.log('received LOG request');
    if (buildStatus === Status.FAILED || buildStatus === Status.SUCCEEDED) {
        res.send(buildResult.log);
        console.log('sent LOG chunk');
    } else if(buildStatus === Status.NOT_STARTED) {
        res.send('not started')
    } else {

        var intervalId;

        let currentLogLenght = 0;

        let writeChunk = () => {
            console.log('writing http chunk');
            if(currentLogLenght < buildResult.log.length) {
                res.write(buildResult.log.slice(currentLogLenght));
                currentLogLenght = buildResult.log.length;
            } else if(buildStatus === Status.FAILED || buildStatus === Status.SUCCEEDED) {
                if(intervalId) {
                    clearInterval(intervalId);
                }
                res.end();
            }
        };

        intervalId = setInterval(writeChunk, 2000);
    }
});

service.onBuildRequest((req, res) => {
    if(buildStatus !== Status.NOT_STARTED) {
        console.warn('build already started');
    } else{
        start(req.body)
    }
    res.end();
});

function start(req : BuildRequest) {
    appendLog('build request received: ' + JSON.stringify(req));
    buildResult.startedTimestamp = new Date();
    buildResult.request = req;

    doBuild();
}

function doBuild() {
    checkoutProjectAsync()
        .then(() => { return buildAsync() })
        .then(() => {
            buildStatus = Status.SUCCEEDED;
        })
        .fail((reason) => {
            buildStatus = Status.FAILED;
            appendLog(reason);
        })
        .fin(() => {
            finish();
        })
}

function checkoutProjectAsync() : Q.IPromise<void> {
    let defer : Q.Deferred<void> = Q.defer();
    buildStatus = Status.CHECKING_OUT;
    repo = new GitRepo(buildResult.request.repo, appendLog);

    repo.cloneAsync()
        .then(() => {return repo.checkoutAsync(buildResult.request.commit);})
        .then(() => {
            let buildConf = repo.getFileContent('ci.json');
            buildResult.buildConfig = JSON.parse(buildConf);
            appendLog('build configuration read: ' + buildConf);

            if(!buildResult.request.commit) {
                buildResult.request.commit = repo.getCommit();
                appendLog('commit not provided, running in last commit: ' + buildResult.request.commit);
            }
            defer.resolve();
        })
        .fail((error) => {
            defer.reject(error);
        });

    return defer.promise;
}

function buildAsync() : Q.IPromise<void> {

    buildStatus = Status.BUILDING;

    //transforms the command strings in an array of executables commands returning promises
    let commands = buildResult.buildConfig.build.map((command) => {return () => {return executeCommandAsync(command)}});

    //return commands.reduce(Q.when, Q()); // other option to run the sequential promises

    return commands.reduce(function (soFar, f) {
        return soFar.then(f);
    }, Q(undefined));
}

function executeCommandAsync(command : string) : Q.IPromise<void> {
    let defer : Q.Deferred<void> = Q.defer();
    appendLog('$ ' + command);

    repo.execAsync(command)
        .then((commandResult : string) => {
            appendLog(commandResult);
            defer.resolve();
        })
        .fail((reason) => {
            appendLog(reason);
            appendLog('build failed');
            defer.reject(reason);
        });
    return defer.promise;
}

function finish() {

    buildResult.finishedTimestamp = new Date();

    appendLog('build status: ' + buildStatus);

    buildResult.succeeded = (buildStatus === Status.SUCCEEDED);

    console.log(buildResult.log);

    appendLog('notifying build finished');
    service.pingFinish(buildResult, () => {
        appendLog('build finish notification success');
        fs.writeFileSync('log.txt', buildResult.log, 'utf8');
    });
}

function appendLog(text : string) {
    buildResult.log += text + '\n';
    console.log(text);
}

 //TESTING SERVER
 //curl -X POST -H "Content-Type: application/json" -d '{"id":"myBuildId","repo":"mserranom/lean-ci","pingURL":"http://localhost:64321/end"}' http://localhost:64321/start
//service.getApp().post('/end', (req, res) => {
//    appendLog('buildFinish "' + req.query.id + '" was pinged successfully!!');
//    res.end();
//});





