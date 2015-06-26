///<reference path="../../../lib/node-0.10.d.ts"/>
var fs = require("fs");
var BuildService_1 = require('./BuildService');
var GitRepo_1 = require('./GitRepo');
var BuildResultImpl = (function () {
    function BuildResultImpl() {
        this.succeeded = true;
        this.log = '';
    }
    return BuildResultImpl;
})();
var buildStarted = false;
var buildResult = new BuildResultImpl();
var service = new BuildService_1.BuildService(appendLog);
var repo;
service.startListening();
service.onBuildRequest(function (req, res) {
    appendLog('received /build/start POST request');
    res.end();
    //if(buildStarted) {
    //    console.warn('build already started');
    //    return;
    //}
    //buildStarted = true;
    appendLog('build request received: ' + JSON.stringify(req.body));
    buildResult.request = req.body;
    checkoutProject();
    startBuild();
    finishBuild();
});
function checkoutProject() {
    repo = new GitRepo_1.GitRepo(buildResult.request.repo, appendLog);
    if (!repo.clone()) {
        buildResult.succeeded = false;
        appendLog('FAILURE: ' + buildResult.succeeded);
        exit();
    }
    if (buildResult.request.commit) {
        if (!repo.checkout(buildResult.request.commit)) {
            appendLog('error on commit checkout');
            buildResult.succeeded = false;
            exit();
        }
    }
    var buildConf = repo.getFileContent('ci.json');
    buildResult.buildConfig = JSON.parse(buildConf);
    appendLog('build configuration read: ' + buildConf);
    var shell = require('shelljs');
    if (!buildResult.request.commit) {
        buildResult.request.commit = repo.getCommit();
        appendLog('commit not provided, running in last commit: ' + buildResult.request.commit);
    }
}
function startBuild() {
    appendLog('starting build process: ' + buildResult.buildConfig.command);
    var res = repo.exec(buildResult.buildConfig.command);
    appendLog(res.output);
    if (res.code != 0) {
        buildResult.succeeded = false;
        appendLog('build failed with error code: ' + res.code);
        exit();
    }
}
function finishBuild() {
    appendLog('notifying build finished');
    service.pingFinish(buildResult, exit);
}
function exit() {
    appendLog('build status: ' + (buildResult.succeeded ? 'SUCCESS' : 'FAILED'));
    fs.writeFileSync('log.txt', buildResult.log, 'utf8');
    console.log(buildResult.log);
    //process.exit(buildResult.succeeded ? 0 : 1);
}
function appendLog(text) {
    buildResult.log += text + '\n';
}
//TESTING SERVER
//curl -X POST -H "Content-Type: application/json" -d '{"id":"myBuildId","repo":"mserranom/lean-ci-testA","commit":"","pingURL":"http://localhost:64321/end"}' http://localhost:64321/start
//service.getApp().post('/end', (req, res) => {
//    appendLog('buildFinish "' + req.query.id + '" was pinged successfully!!');
//    res.end();
//});
