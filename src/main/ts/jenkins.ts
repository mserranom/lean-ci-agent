"use strict";

export module jenkins {

    export async function startBuild(repo : string, commit : string) : Promise<string> {
        return null;
    }

    export function addBuildCompletedHook(callback: (jobId : string, succeeded : boolean) => void) : void {
    }

}
