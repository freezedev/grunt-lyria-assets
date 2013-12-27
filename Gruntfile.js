/*
 * grunt-lyria-assets
 * https://github.com/freezedev/grunt-lyria-assets
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>',
      ],
      options: {
        jshintrc: '.jshintrc',
      },
    },
    coffee: {
      tasks: {
        files: [{
          expand: true,
          src: ['**/*.coffee'],
          ext: '.js',
          cwd: 'src',
          dest: 'tasks/'
        }]
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp'],
    },
    
    // Configuration to be run (and then tested).
    lyriaScene: {
      all: {
        options: {
          namespace: 'test'
        },
        files: [{
          dest: 'generated.js',
          src: ['assets/scenes/*'],
          filter: 'isDirectory'
        }]
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js'],
    },

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean'/*, 'coffee', 'lyria_assets', 'nodeunit'*/]);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
