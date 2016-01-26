"use strict";

export module jenkins_mock {

    export async function startBuild(repo : string, commit : string) : Promise<any> {
        return new Promise(resolve => resolve('1001' + (Math.random() * 100000000).toFixed(0)))
    }

}