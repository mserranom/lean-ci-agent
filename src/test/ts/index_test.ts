"use strict";

import {start, stop, onBuildFinish, setMaxExecutors, runningBuilds} from '../../main/ts/index'
import {jenkins} from '../../main/ts/jenkins'
import {jenkins_mock} from './jenkins_mock'
import {builds} from '../../main/ts/builds'
import {builds_mock} from './builds_mock'

var simple = require('simple-mock');
var expect = require('chai').expect;

function sleep(ms:number) : Promise<any> {
    return new Promise<void>(function(resolve) {
        setTimeout(function(){ resolve() }, ms);
    });
}

const testBuild1 = { _id : '4321', repo : 'git@myrepo', commit : 'commitHEAD' };
const testBuild2 = { _id : '4322', repo : 'git@myrepo', commit : 'commitHEAD' };
const testBuild3 = { _id : '4323', repo : 'git@myrepo', commit : 'commitHEAD' };
const testBuild4 = { _id : '4324', repo : 'git@myrepo', commit : 'commitHEAD' };

describe('integration tests:', () => {

    afterEach(async function(done) {
        stop();
        await sleep(5);
        simple.restore();
        builds_mock.restore();
        done();
    });

    it('the next queued build is started', async function(done) {
        applyBuildMocks([testBuild1]);

        simple.mock(jenkins, 'startBuild').resolveWith('1001');

        await runAgent();

        expect(builds.markAsStarted['callCount']).equals(1);
        expect(jenkins.startBuild['callCount']).equals(1);

        done();
    });

    it('when a build succeededs, it is marked as succesful', async function(done) {

        applyBuildMocks([testBuild1]);

        simple.mock(jenkins, 'startBuild').resolveWith('1001');

        await runAgent();


        expect(builds.markAsStarted['callCount']).equals(1);
        expect(jenkins.startBuild['callCount']).equals(1);

        onBuildFinish('1001', true);

        expect(builds.markAsSuccess['callCount']).equals(1);
        expect(builds.markAsFailed['callCount']).equals(0);

        done();
    });

    it('when a build fails, it is marked as failed', async function(done) {

        applyBuildMocks([testBuild1]);

        simple.mock(jenkins, 'startBuild').resolveWith('1001');

        await runAgent();

        expect(builds.markAsStarted['callCount']).equals(1);
        expect(jenkins.startBuild['callCount']).equals(1);

        onBuildFinish('1001', false);

        expect(builds.markAsFailed['callCount']).equals(1);
        expect(builds.markAsSuccess['callCount']).equals(0);

        done();
    });

    it('starts builds up to max number of executors', async function(done) {

        setMaxExecutors(3);

        applyBuildMocks([testBuild1, testBuild2, testBuild3, testBuild4]);

        simple.mock(jenkins, 'startBuild').callFn(jenkins_mock.startBuild);

        await runAgent();

        expect(builds.markAsStarted['callCount']).equals(3);
        expect(jenkins.startBuild['callCount']).equals(3);

        done();
    });


    it('the next build should start when an executor is available', async function(done) {

        setMaxExecutors(3);

        applyBuildMocks([testBuild1, testBuild2, testBuild3, testBuild4]);

        simple.mock(jenkins, 'startBuild').callFn(jenkins_mock.startBuild);

        await runAgent();

        expect(builds.markAsStarted['callCount']).equals(3);
        expect(jenkins.startBuild['callCount']).equals(3);

        let runningBuildsList = [];
        runningBuilds.forEach((value, key) => runningBuildsList.push(key));
        onBuildFinish(runningBuildsList[0], false);


        await sleep(100);

        expect(builds.markAsStarted['callCount']).equals(4);
        expect(jenkins.startBuild['callCount']).equals(4);

        done();
    });
});


function applyBuildMocks(buildQueue : Array<any>) {
    builds_mock.queue = buildQueue;
    simple.mock(builds, 'getNextQueued').callFn(builds_mock.getNextQueued);
    simple.mock(builds, 'markAsStarted').callFn(builds_mock.markAsStarted);
    simple.mock(builds, 'markAsSuccess').callFn(builds_mock.markAsSuccess);
    simple.mock(builds, 'markAsFailed').callFn(builds_mock.markAsFailed);
}

async function runAgent() {
    start();
    await sleep(200);
}

