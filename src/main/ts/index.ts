///<reference path="../../../lib/node-0.10.d.ts"/>

import fs = require("fs");

import {BuildResult, BuildRequest, BuildConfig} from './DataTypes';
import {BuildService} from './BuildService';
import {GitRepo} from './GitRepo';

class BuildResultImpl implements BuildResult {
    startedTimestamp:Date;
    finishedTimestamp:Date;
    request : BuildRequest;
    succeeded : boolean = true;
    buildConfig : BuildConfig;
    log : string = '';
}

var buildStarted = false;

var buildResult = new BuildResultImpl();

var service = new BuildService(appendLog);

var repo : GitRepo;

service.startListening();

service.onBuildRequest((req, res) => {
    appendLog('received /build/start POST request');
    res.end();

    if(buildStarted) {
        console.warn('build already started');
        return;
    }
    buildStarted = true;

    appendLog('build request received: ' + JSON.stringify(req.body));
    buildResult.startedTimestamp = new Date();
    buildResult.request = req.body;

    checkoutProject();
    startBuild();
    finishBuild();
});

function checkoutProject() {

    repo = new GitRepo(buildResult.request.repo, appendLog);

    if(!repo.clone())
    {
        buildResult.succeeded = false;
        appendLog('FAILURE: ' + buildResult.succeeded);
        exit();
    }

    if(buildResult.request.commit) {
       if(!repo.checkout(buildResult.request.commit)) {
           appendLog('error on commit checkout');
           buildResult.succeeded = false;
           exit();
       }
    }

    let buildConf = repo.getFileContent('ci.json');
    buildResult.buildConfig = JSON.parse(buildConf);
    appendLog('build configuration read: ' + buildConf);

    if(!buildResult.request.commit) {
        buildResult.request.commit = repo.getCommit();
        appendLog('commit not provided, running in last commit: ' + buildResult.request.commit);
    }
}

function startBuild()  {
    buildResult.buildConfig.build.forEach(buildCmd => executeCommand(buildCmd));
}

function executeCommand(command : string) {
    appendLog('$ ' + command);
    let res = repo.exec(command);
    appendLog(res.output);
    if(res.code !== 0) {
        buildResult.succeeded = false;
        appendLog('build failed with error code: ' + res.code);
        exit();
    }
}

function finishBuild() : void {
    appendLog('notifying build finished');
    buildResult.finishedTimestamp = new Date();
    service.pingFinish(buildResult, exit);
}

function exit() {
    appendLog('build status: ' + (buildResult.succeeded ? 'SUCCESS' : 'FAILED'));
    fs.writeFileSync('log.txt', buildResult.log, 'utf8');
    console.log(buildResult.log);
    process.exit(buildResult.succeeded ? 0 : 1);
}

function appendLog(text : string) {
    buildResult.log += text + '\n';
}

 //TESTING SERVER
 //curl -X POST -H "Content-Type: application/json" -d '{"id":"myBuildId","repo":"mserranom/lean-ci-testA","commit":"","pingURL":"http://localhost:64321/end"}' http://localhost:64321/start
//service.getApp().post('/end', (req, res) => {
//    appendLog('buildFinish "' + req.query.id + '" was pinged successfully!!');
//    res.end();
//});





