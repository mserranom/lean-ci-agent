///<reference path="../../../typings/tsd.d.ts"/>

"use strict";

import {builds} from './builds';
import {jenkins} from './jenkins';

//jenkins.startJenkins()
//    .then(() => console.log('jenkins bootstrap finished!'))
//    .catch(err => console.log(err));

export const runningBuilds : Map<string, builds.BuildSchema> = new Map();

var maxExecutors = 3;

export function setMaxExecutors(count : number) {
    maxExecutors = count;
}

let shouldStop = false;

export async function onBuildFinish(jobId : string, success: boolean) {
    if(runningBuilds.has(jobId)) {
        let build = runningBuilds.get(jobId);
        if(success) {
            await builds.markAsSuccess(build._id);
        } else {
            await builds.markAsFailed(build._id);
        }
        runningBuilds.delete(jobId);
    }
}

async function buildNext() {

    if(runningBuilds.size >= maxExecutors) {
        return;
    }

    let nextQueuedBuild = await builds.getNextQueued();

    if(nextQueuedBuild) {
        nextQueuedBuild = await builds.markAsStarted(nextQueuedBuild._id);
        let buildId =  await jenkins.startBuild(nextQueuedBuild.repo, nextQueuedBuild.commit);
        runningBuilds.set(buildId, nextQueuedBuild);
    }
}

async function run() {
    if(!shouldStop) {
        await buildNext();
        setTimeout(run, 100);
    }

}


jenkins.addBuildCompletedHook(onBuildFinish);


export function start(){
    shouldStop = false;
    run();
}

export function stop() {
    runningBuilds.clear();
    shouldStop = true;
}
