
export interface BuildRequest {
    id : string,
    user : string;
    repo : string;
    commit : string;
    pingURL : string;
    requestTimestamp : Date;
    processedTimestamp : Date;
}

export interface BuildConfig {
    build : Array<string>;
    dependencies : Array<string>;
    package : string;
}

export class BuildResult {
    request : BuildRequest;
    succeeded : boolean;
    buildConfig : BuildConfig;
    log : string = '';
    startedTimestamp : Date;
    finishedTimestamp : Date;
}

export class Status {
    static CHECKING_OUT : string = 'checking out';
    static BUILDING : string = 'building';
    static SUCCEEDED : string = 'succeeded';
    static FAILED : string = 'failed';
    static NOT_STARTED : string = 'not started';
}
