///<reference path="../../../lib/Q.d.ts"/>
var Q = require('Q');
var GitRepo = (function () {
    function GitRepo(repo, logger) {
        this._repo = repo;
        this._logger = logger;
    }
    GitRepo.prototype.cloneAsync = function () {
        var _this = this;
        var defer = Q.defer();
        var shell = require('shelljs');
        var clone = 'git clone https://github.com/' + this._repo + '.git';
        this.appendLog(clone);
        shell.exec(clone, { silent: true, async: true }, function (code, output) {
            if (code !== 0) {
                defer.reject('git clone failed');
            }
            else {
                _this.appendLog(output);
                var repoName = _this._repo.split('/')[1];
                _this._repoPwd = shell.pwd() + '/' + repoName;
                defer.resolve();
            }
        });
        return defer.promise;
    };
    GitRepo.prototype.checkoutAsync = function (commit) {
        var _this = this;
        var defer = Q.defer();
        if (!commit) {
            defer.resolve();
            return;
        }
        var shell = require('shelljs');
        this.moveRepoPwd();
        var checkout = 'git checkout' + commit;
        this.appendLog(checkout);
        shell.exec(checkout, { silent: true, async: true }, function (code, output) {
            if (code !== 0) {
                defer.reject('git clone failed');
            }
            else {
                _this.appendLog(output);
                _this.restorePwd();
                defer.resolve();
            }
        });
        return defer.promise;
    };
    GitRepo.prototype.execAsync = function (command) {
        var _this = this;
        var shell = require('shelljs');
        var defer = Q.defer();
        this.moveRepoPwd();
        this.appendLog('executing ' + command);
        shell.exec(command, { silent: true, async: true }, function (code, output) {
            if (code !== 0) {
                defer.reject(command + ' returned with exit code=' + code);
            }
            else {
                console.log('RESTORRED');
                _this.restorePwd();
                defer.resolve(output);
            }
        });
        return defer.promise;
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
