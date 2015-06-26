var GitRepo = (function () {
    function GitRepo(repo, logger) {
        this._repo = repo;
        this._logger = logger;
    }
    GitRepo.prototype.clone = function () {
        var shell = require('shelljs');
        var clone = 'git clone https://github.com/' + this._repo + '.git';
        this.appendLog(clone);
        var result = shell.exec(clone, { silent: true });
        this.appendLog(result.output);
        if (result.code != 0) {
            this.appendLog('git clone failed');
            return false;
        }
        var repoName = this._repo.split('/')[1];
        this._repoPwd = shell.pwd() + '/' + repoName;
        return true;
    };
    GitRepo.prototype.checkout = function (commit) {
        var shell = require('shelljs');
        this.moveRepoPwd();
        var checkout = 'git checkout' + commit;
        this.appendLog(checkout);
        var result = shell.exec(checkout, { silent: true });
        this.appendLog(result.output);
        this.restorePwd();
        return result.code == 0;
    };
    GitRepo.prototype.exec = function (command) {
        var shell = require('shelljs');
        this.moveRepoPwd();
        this.appendLog('executing ' + command);
        var result = shell.exec(command, { silent: true });
        this.appendLog('execution result code: ' + result.code);
        this.restorePwd();
        return result;
    };
    GitRepo.prototype.getFileContent = function (fileName) {
        this.moveRepoPwd();
        var shell = require('shelljs');
        var content = shell.cat(fileName);
        this.restorePwd();
        return content;
    };
    GitRepo.prototype.getCommit = function () {
        var shell = require('shelljs');
        this.moveRepoPwd();
        var commit = shell.exec('git log -1 --stat', { silent: true }).output.split("\n")[0].split(" ")[1].trim();
        this.restorePwd();
        return commit;
    };
    GitRepo.prototype.appendLog = function (log) {
        this._logger(log);
    };
    GitRepo.prototype.moveRepoPwd = function () {
        var shell = require('shelljs');
        this._currentPwd = shell.pwd();
        shell.cd(this._repoPwd);
    };
    GitRepo.prototype.restorePwd = function () {
        var shell = require('shelljs');
        shell.cd(this._currentPwd);
    };
    return GitRepo;
})();
exports.GitRepo = GitRepo;
