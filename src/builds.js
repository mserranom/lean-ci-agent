module.exports = function() {

    this.getNextQueued = function() {
        return new Promise((resolve, reject) => {
            resolve({id:'foo'})
        })
    };

    this.markAsStarted = function(buildId) {
        return new Promise((resolve, reject) => {
            resolve();
        })
    };

    this.markAsFailed = function(buildId) {
        return new Promise((resolve, reject) => {
            resolve();
        })
    };

    this.markAsSucceeded = function(buildId) {
        return new Promise((resolve, reject) => {
            resolve();
        })
    };


};