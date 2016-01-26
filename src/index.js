"use strict";

let JENKINS_URL = 'http://192.168.99.100:8080';

let jenkins = require('jenkins')(JENKINS_URL);

let builds = require('./builds');


function scheduleNextBuild() {

    return builds.getNextQueued()
        .then(build => {
            if (build) {
                return builds.markAsStarted(build.id)
            } else {
                return undefined;
            }
        });

}


function startBuild(repo, commit) {

    return new Promise(function(resolve, reject) {

        let params = [{'repo_url' : repo}, {'repo_commit': commit}];
        let jsonParams = JSON.stringify(params);

        jenkins.job.build('default_job', {parameters : {data : jsonParams}}, function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}


function checkRunningBuilds() {

    // if running, and no timeout do nothing
    // if timeout, mark as fail and stop
    // if failed, mark as faild
    // if succeeded, save log and mark build as finished

}

function buildNext() {

    // if available executors

    return scheduleNextBuild()
                .then(build => {
                    if(build) {
                        startBuild(build.repo, build.commit);
                    } else {
                        return undefined;
                    }
                });

}


function start() {
    buildNext()
        .catch(err => console.error(err))
        .finally(() => start())
}

function scheduleBuildCleanups() {
    // look for running builds
    // check timestamps, and mark as timedout
    // check those running, not being in-memory <--- redis!!
    // poll again after xx seconds
}


start();

scheduleBuildCleanups();


//startBuild('http://stugg', 'HEAD')
//    .then(data => console.log(data));
