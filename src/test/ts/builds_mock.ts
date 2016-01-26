"use strict";

export module builds_mock {

    export var queue = [];

    var started = [];

    export function restore() {
        queue = [];
        started = [];
    }

    export async function getNextQueued() : Promise<any> {
        return new Promise(resolve => resolve((queue.length > 0) ? queue[0] : undefined));
    }

    export async function markAsStarted(buildId : string) : Promise<any> {
        return new Promise(resolve => {
            let item = queue.find(item => item._id === buildId);
            queue = queue.filter(x => x != item);
            started.push(item);
            resolve(item);
        });
    }

    export async function markAsSuccess(buildId : string) : Promise<any> {
        return new Promise(resolve => {
            let item = started.find(item => item._id === buildId);
            started = started.filter(x => x != item);
            resolve(item);
        });
    }

    export async function markAsFailed(buildId : string) : Promise<any> {
        return new Promise(resolve => {
            let item = started.find(item => item._id === buildId);
            started = started.filter(x => x != item);
            resolve(item);
        });
    }

}