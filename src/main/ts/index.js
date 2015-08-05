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
    if (buildStarted) {
        console.warn('build already started');
        return;
    }
    buildStarted = true;
    appendLog('build request received: ' + JSON.stringify(req.body));
    buildResult.startedTimestamp = new Date();
    buildResult.request = req.body;
    var checkoutSucceeded = checkoutProject();
    if (checkoutSucceeded) {
        startBuild();
        exit();
    }
});
function checkoutProject() {
    repo = new GitRepo_1.GitRepo(buildResult.request.repo, appendLog);
    if (!repo.clone()) {
        buildResult.succeeded = false;
        appendLog('Build succeeded=' + buildResult.succeeded);
        exit();
        return false;
    }
    if (buildResult.request.commit) {
        if (!repo.checkout(buildResult.request.commit)) {
            appendLog('error on commit checkout');
            buildResult.succeeded = false;
            exit();
            return false;
        }
    }
    var buildConf = repo.getFileContent('ci.json');
    buildResult.buildConfig = JSON.parse(buildConf);
    appendLog('build configuration read: ' + buildConf);
    if (!buildResult.request.commit) {
        buildResult.request.commit = repo.getCommit();
        appendLog('commit not provided, running in last commit: ' + buildResult.request.commit);
    }
    return true;
}
function startBuild() {
    buildResult.buildConfig.build.forEach(function (buildCmd) { return executeCommand(buildCmd); });
}
function executeCommand(command) {
    appendLog('$ ' + command);
    var res = repo.exec(command);
    appendLog(res.output);
    if (res.code !== 0) {
        buildResult.succeeded = false;
        appendLog('build failed with error code: ' + res.code);
        exit();
    }
}
function exit() {
    appendLog('notifying build finished');
    buildResult.finishedTimestamp = new Date();
    appendLog('build status: ' + (buildResult.succeeded ? 'SUCCESS' : 'FAILED'));
    fs.writeFileSync('log.txt', buildResult.log, 'utf8');
    console.log(buildResult.log);
    service.pingFinish(buildResult, function () { return console.log('pinged'); });
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
