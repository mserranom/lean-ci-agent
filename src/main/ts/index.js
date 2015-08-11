///<reference path="../../../lib/node-0.10.d.ts"/>
///<reference path="../../../lib/Q.d.ts"/>
var fs = require('fs');
var Q = require('Q');
var DataTypes_1 = require('./DataTypes');
var BuildService_1 = require('./BuildService');
var GitRepo_1 = require('./GitRepo');
var buildStatus = DataTypes_1.Status.NOT_STARTED;
var buildResult = new DataTypes_1.BuildResult();
var service = new BuildService_1.BuildService();
var repo;
service.startListening();
service.onStatusRequest(function (req, res) {
    console.log('received STATUS request');
    res.send(buildStatus);
});
service.onLogRequest(function (req, res) {
    console.log('received LOG request');
    if (buildStatus === DataTypes_1.Status.FAILED || buildStatus === DataTypes_1.Status.SUCCEEDED) {
        res.send(buildResult.log);
        console.log('sent LOG chunk');
    }
    else if (buildStatus === DataTypes_1.Status.NOT_STARTED) {
        res.send('not started');
    }
    else {
        var intervalId;
        var currentLogLenght = 0;
        var writeChunk = function () {
            console.log('writing http chunk');
            if (currentLogLenght < buildResult.log.length) {
                res.write(buildResult.log.slice(currentLogLenght));
                currentLogLenght = buildResult.log.length;
            }
            else if (buildStatus === DataTypes_1.Status.FAILED || buildStatus === DataTypes_1.Status.SUCCEEDED) {
                if (intervalId) {
                    clearInterval(intervalId);
                }
                res.end();
            }
        };
        intervalId = setInterval(writeChunk, 2000);
    }
});
service.onBuildRequest(function (req, res) {
    if (buildStatus !== DataTypes_1.Status.NOT_STARTED) {
        console.warn('build already started');
    }
    else {
        start(req.body);
    }
    res.end();
});
function start(req) {
    appendLog('build request received: ' + JSON.stringify(req));
    buildResult.startedTimestamp = new Date();
    buildResult.request = req;
    doBuild();
}
function doBuild() {
    checkoutProjectAsync()
        .then(function () { return buildAsync(); })
        .then(function () {
        buildStatus = DataTypes_1.Status.SUCCEEDED;
    })
        .fail(function (reason) {
        buildStatus = DataTypes_1.Status.FAILED;
        appendLog(reason);
    })
        .fin(function () {
        finish();
    });
}
function checkoutProjectAsync() {
    var defer = Q.defer();
    buildStatus = DataTypes_1.Status.CHECKING_OUT;
    repo = new GitRepo_1.GitRepo(buildResult.request.repo, appendLog);
    repo.cloneAsync()
        .then(function () { return repo.checkoutAsync(buildResult.request.commit); })
        .then(function () {
        var buildConf = repo.getFileContent('ci.json');
        buildResult.buildConfig = JSON.parse(buildConf);
        appendLog('build configuration read: ' + buildConf);
        if (!buildResult.request.commit) {
            buildResult.request.commit = repo.getCommit();
            appendLog('commit not provided, running in last commit: ' + buildResult.request.commit);
        }
        defer.resolve();
    })
        .fail(function (error) {
        defer.reject(error);
    });
    return defer.promise;
}
function buildAsync() {
    buildStatus = DataTypes_1.Status.BUILDING;
    //transforms the command strings in an array of executables commands returning promises
    var commands = buildResult.buildConfig.build.map(function (command) { return function () { return executeCommandAsync(command); }; });
    //return commands.reduce(Q.when, Q()); // other option to run the sequential promises
    return commands.reduce(function (soFar, f) {
        return soFar.then(f);
    }, Q(undefined));
}
function executeCommandAsync(command) {
    var defer = Q.defer();
    appendLog('$ ' + command);
    repo.execAsync(command)
        .then(function (commandResult) {
        appendLog(commandResult);
        defer.resolve();
    })
        .fail(function (reason) {
        appendLog(reason);
        appendLog('build failed');
        defer.reject(reason);
    });
    return defer.promise;
}
function finish() {
    buildResult.finishedTimestamp = new Date();
    appendLog('build status: ' + buildStatus);
    buildResult.succeeded = (buildStatus === DataTypes_1.Status.SUCCEEDED);
    console.log(buildResult.log);
    appendLog('notifying build finished');
    service.pingFinish(buildResult, function () {
        appendLog('build finish notification success');
        fs.writeFileSync('log.txt', buildResult.log, 'utf8');
    });
}
function appendLog(text) {
    buildResult.log += text + '\n';
    console.log(text);
}
//TESTING SERVER
//curl -X POST -H "Content-Type: application/json" -d '{"id":"myBuildId","repo":"mserranom/lean-ci","pingURL":"http://localhost:64321/end"}' http://localhost:64321/start
//service.getApp().post('/end', (req, res) => {
//    appendLog('buildFinish "' + req.query.id + '" was pinged successfully!!');
//    res.end();
//});
