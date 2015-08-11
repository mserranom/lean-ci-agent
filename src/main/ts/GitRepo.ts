///<reference path="../../../lib/Q.d.ts"/>
var Q = require('Q');


export class GitRepo {

    private _repo : string;
    private _logger : (string) => void;

    private _repoPwd : string;
    private _currentPwd : string;

    constructor(repo : string, logger:(string) => void) {
        this._repo = repo;
        this._logger = logger;
    }

    cloneAsync() : Q.IPromise<void> {

        let defer : Q.Deferred<void> = Q.defer();

        let shell = require('shelljs');

        let clone = 'git clone https://github.com/' + this._repo + '.git';
        this.appendLog(clone);

        shell.exec(clone, {silent:true, async: true}, (code : number, output : string) => {
            if(code !== 0) {
                defer.reject('git clone failed');
            } else {
                this.appendLog(output);
                let repoName = this._repo.split('/')[1];
                this._repoPwd = shell.pwd() + '/' + repoName;
                defer.resolve();
            }
        });

        return defer.promise;
    }

    checkoutAsync(commit:string) : Q.IPromise<void> {
        let defer : Q.Deferred<void> = Q.defer();

        if(!commit) {
            defer.resolve();
            return;
        }

        let shell = require('shelljs');

        this.moveRepoPwd();

        let checkout = 'git checkout' + commit;
        this.appendLog(checkout);

        shell.exec(checkout, {silent:true, async: true}, (code : number, output : string) => {
            if(code !== 0) {
                defer.reject('git clone failed');
            } else {
                this.appendLog(output);
                this.restorePwd();
                defer.resolve();
            }
        });

        return defer.promise;
    }

    execAsync(command : string) : Q.Promise<string> {
        let shell = require('shelljs');
        let defer : Q.Deferred<string> = Q.defer();
        this.moveRepoPwd();
        this.appendLog('executing ' + command);

        shell.exec(command, {silent:true, async: true}, (code : number, output : string) => {
            if(code !== 0) {
                defer.reject(command + ' returned with exit code=' + code);
            } else {
                console.log('RESTORRED');
                this.restorePwd();
                defer.resolve(output);
            }
        });
        return defer.promise;
    }

    getFileContent(fileName : string) : string {
        this.moveRepoPwd();
        let shell = require('shelljs');
        let content : string = shell.cat(fileName);
        this.restorePwd();
        return content;
    }

    getCommit() : string {
        let shell = require('shelljs');
        this.moveRepoPwd();
        let commit = shell.exec('git log -1 --stat', {silent:true}).output.split("\n")[0].split(" ")[1].trim();
        this.restorePwd();
        return commit;
    }

    private appendLog(log:string) {
        this._logger(log);
    }

    private moveRepoPwd() {
        let shell = require('shelljs');
        this._currentPwd = shell.pwd();
        shell.cd(this._repoPwd);
    }

    private restorePwd() {
        let shell = require('shelljs');
        shell.cd(this._currentPwd);
    }

}
