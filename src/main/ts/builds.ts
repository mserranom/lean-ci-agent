"use strict";

export module builds {

    export interface BuildConfig {
        dependencies : Array<string>;
        commands : Array<string>;
    }

    export interface BuildSchema {
        _id : string;
        repo : string;
        commit : string;
        config : BuildConfig;
    }

    export async function getNextQueued() : Promise<BuildSchema> {
        return null;
    }

    export async function markAsStarted(buildId : string) : Promise<BuildSchema> {
        return null;
    }

    export async function markAsSuccess(buildId : string) : Promise<BuildSchema> {
        return null;
    }

    export async function markAsFailed(buildId : string) : Promise<BuildSchema> {
        return null;
    }

}