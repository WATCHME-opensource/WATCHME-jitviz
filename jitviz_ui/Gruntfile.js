module.exports = function(grunt) {

  grunt.initConfig({
    shell: {
      deploy: {
        command: "cd ../.. ; git subtree push --prefix=JITVIZ/jitviz_ui heroku-epass master"
      }
    },
    browserify: {
      dev: {
        src: './lib/watchme.js',
        dest: './public/js/watchme_bundle.js',
      }
    },
    sass: {
      options: {
        sourceMap: true
      },
      dist: {
        files: {
          './public/css/epass.css': './src/epass_jitviz_examples.scss'
        }
      }
    },
    nodemon: {
      dev: {
        script: 'server.js',
        ignore: [ 'lib/', 'src/' ]
      }
    },
    watch: {
      dev: {
        files: [ 'lib/**/*.js', 'env.json' ],
        tasks: ['browserify']
      }
    },
      karma:{
          unit:{
              configFile:"karma.conf.js"
          }
      },
    concurrent: {
      dev: {
        tasks: [ 'nodemon', 'watch' ],
        options: {
          logConcurrentOutput: true
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-karma');

  grunt.registerTask('deploy', ['shell:deploy']);
  grunt.registerTask('dist', ['sass', 'browserify']);
  grunt.registerTask('default', ['sass', 'browserify', 'concurrent']);

};

