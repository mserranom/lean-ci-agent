export class GitRepo {

    private _repo : string;
    private _logger : (string) => void;

    private _repoPwd : string;
    private _currentPwd : string;

    constructor(repo : string, logger:(string) => void) {
        this._repo = repo;
        this._logger = logger;
    }

    clone() : boolean {
        let shell = require('shelljs');

        let clone = 'git clone https://github.com/' + this._repo + '.git';
        this.appendLog(clone);

        let result = shell.exec(clone, {silent:true});
        this.appendLog(result.output);

        if(result.code != 0)
        {
            this.appendLog('git clone failed');
            return false;
        }

        let repoName = this._repo.split('/')[1];
        this._repoPwd = shell.pwd() + '/' + repoName;

        return true;
    }

    checkout(commit:string) : boolean {
        let shell = require('shelljs');

        this.moveRepoPwd();

        let checkout = 'git checkout' + commit;
        this.appendLog(checkout);

        let result = shell.exec(checkout, {silent:true});
        this.appendLog(result.output);

        this.restorePwd();

        return result.code == 0;
    }

    exec(command : string) : any {
        let shell = require('shelljs');
        this.moveRepoPwd();
        this.appendLog('executing ' + command);
        let result = shell.exec(command, {silent:true});
        this.appendLog('execution result code: ' + result.code);
        this.restorePwd();
        return result;
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