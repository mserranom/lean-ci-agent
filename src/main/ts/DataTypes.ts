export interface BuildRequest {
    id : string,
    repo : string;
    commit : string;
    pingURL : string;
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
}