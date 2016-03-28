/*global module:false*/
module.exports = function(grunt) {

    grunt.initConfig({

        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*! \n * <%= pkg.title || pkg.name %> v<%= pkg.version %>\n' +
        ' * <%= pkg.homepage %>\n' +
        ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
        ' * License: <%= pkg.license %>\n' +
        ' */\n',

        // Task configuration.
        concat: {
            options: {
                banner: '<%= banner %>'
            },
            build: {
                src: [
                    'app/**/**/*.js'
                ],
                dest: 'build/production.js'
            }
        },
        uglify: {
            options: {
                banner: '<%= banner %>',
                report: 'gzip'
            },
            build: {
                src: 'build/production.js',
                dest: 'build/production.min.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('default', ['concat:build', 'uglify']);
    grunt.registerTask('build', ['default']);

};
