
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
    command : string;
    dependencies : Array<string>;
}

export interface BuildResult {
    request : BuildRequest;
    succeeded : boolean;
    buildConfig : BuildConfig;
    log : string;
    startedTimestamp : Date;
    finishedTimestamp : Date;
}