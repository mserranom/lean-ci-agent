"use strict";

let shelljs = require('shelljs');
let exec = shelljs.exec;

export module jenkins {

    const START_JENKINS = 'docker run -d -p 8080:8080 -p 50000:50000  -v `pwd`/jenkins_home:/var/jenkins_home jenkins:1.642.1';
    const START_AGENT = 'java -jar ./slave.jar -jnlpUrl http://192.168.99.100:8080/computer/local_slave/slave-agent.jnlp';

    const DOCKER_INFO = 'docker info';
    const JAVA_VERSION = 'java -version';

    export function startJenkins() : Promise<void> {

        return new Promise<void>(resolve => {
            checkDockerInstallation();
            checkJavaInstallation();
            startJenkinsServer();
            setTimeout(() => {
                startJenkinsAgent();
                resolve();
            }, 3000);
        });


        function checkDockerInstallation() : void {
            let info = exec(DOCKER_INFO, {silent:true, async:false});
            if(info.code != 0) {
                throw new Error(`Docker installation not found. Command '${DOCKER_INFO}' ` +
                    `threw the following error: \n${info.stderr}`)
            }
        }

        function checkJavaInstallation() : void {
            let info = exec(JAVA_VERSION, {silent:true, async:false});
            if(info.code != 0) {
                throw new Error(`Java installation not found. Command '${JAVA_VERSION}' ` +
                    `threw the following error: \n${info.stderr}`)
            }
        }

        function startJenkinsServer() : void {
            let out = exec(START_JENKINS, {silent:true, async:false});
            if(out.code != 0) {
                throw new Error(`Error starting Jenkins server: \n${out.stderr}`)
            }
        }

        function startJenkinsAgent() : void {
            let out = exec(START_AGENT, {silent:true, async:false});
            if(out.code != 0) {
                throw new Error(`Error starting Jenkins agent: \n${out.stderr}`)
            }
        }
    }

    export async function startBuild(repo : string, commit : string) : Promise<string> {
        return null;
    }

    export function addBuildCompletedHook(callback: (jobId : string, succeeded : boolean) => void) : void {
    }

}
