export class NpmPackageDescriptor {

    private _descriptor : any;

    constructor(descriptor : string) {
        this._descriptor = JSON.parse(descriptor);
    }

    updateVersion(version:string) {
        this._descriptor.version = version;
    }

    updateDependencyVersions(dependency:string, version:string) {
        let deps = this._descriptor.dependencies;
        if(deps[dependency]) {
            deps[dependency] = version;
        }

        let devDeps = this._descriptor.devDependencies;
        if(devDeps[dependency]) {
            devDeps[dependency] = version;
        }
    }

    print() : string {
        return JSON.stringify(this._descriptor);
    }

}