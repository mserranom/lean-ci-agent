var BuildResult = (function () {
    function BuildResult() {
        this.log = '';
    }
    return BuildResult;
})();
exports.BuildResult = BuildResult;
var Status = (function () {
    function Status() {
    }
    Status.CHECKING_OUT = 'checking out';
    Status.BUILDING = 'building';
    Status.SUCCEEDED = 'succeeded';
    Status.FAILED = 'failed';
    Status.NOT_STARTED = 'not started';
    return Status;
})();
exports.Status = Status;
