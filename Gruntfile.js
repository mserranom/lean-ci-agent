module.exports = function (grunt) {

    "use strict";

    var project = {
        srcDir : 'src/main/ts',
        testDir : 'src/test/ts',
        targetDir : 'dist',
        targetTestDir : 'dist/src/test/ts',
        name : '<%= pkg.name %>',
        version : '<%= pkg.version %>',
        extension : 'ts'
    };

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        clean:{
            target:[ project.targetDir,'_SpecRunner.html', project.srcDir + '/**/*.js', project.srcDir + '/**/*.js.map',
                project.srcDir + '/**/*.html', project.testDir + '/**/*.js',  project.testDir + '/**/*.js.map',
                project.testDir + '/**/*.html' ]
        },

        ts: {
            options: {
                fast: 'never'
            },
            default: {
                tsconfig: './tsconfig.json'
            }
        },

        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                    captureFile: project.targetTestDir + '/results.txt', // Optionally capture the reporter output to a file
                    quiet: false, // Optionally suppress output to standard out (defaults to false)
                    clearRequireCache: true // Optionally clear the require cache before running tests (defaults to false)
                },
                src: [project.targetTestDir + '/*.js']
            }
        },

        watch: {
            scripts: {
                files: [project.srcDir + '/**/*.ts', project.testDir + '/**/*.ts'],
                tasks: ['test'],
                options: {
                    spawn: true
                }
            }
        },

        notify_hooks: {
            options: {
                enabled: true,
                max_jshint_notifications: 2, // maximum number of notifications from jshint output
                title: '<%= pkg.name %>', // defaults to the name in package.json, or will use project directory's name
                success: true, // whether successful grunt executions should be notified automatically
                duration: 3 // the duration of notification in seconds, for `notify-send only
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-notify');

    grunt.registerTask("compile", ["clean", "ts"]);
    grunt.registerTask("test", ["compile", "mochaTest"]);
    grunt.registerTask("default", ["test"]);

    grunt.task.run('notify_hooks'); //requires 'brew install terminal-notifier'

};