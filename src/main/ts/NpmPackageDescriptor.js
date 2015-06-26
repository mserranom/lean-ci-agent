var NpmPackageDescriptor = (function () {
    function NpmPackageDescriptor(descriptor) {
        this._descriptor = JSON.parse(descriptor);
    }
    NpmPackageDescriptor.prototype.updateVersion = function (version) {
        this._descriptor.version = version;
    };
    NpmPackageDescriptor.prototype.updateDependencyVersions = function (dependency, version) {
        var deps = this._descriptor.dependencies;
        if (deps[dependency]) {
            deps[dependency] = version;
        }
        var devDeps = this._descriptor.devDependencies;
        if (devDeps[dependency]) {
            devDeps[dependency] = version;
        }
    };
    NpmPackageDescriptor.prototype.print = function () {
        return JSON.stringify(this._descriptor);
    };
    return NpmPackageDescriptor;
})();
exports.NpmPackageDescriptor = NpmPackageDescriptor;
