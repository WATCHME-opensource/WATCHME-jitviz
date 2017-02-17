module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-nodemon');

  grunt.initConfig({
    shell: {
      deploy: {
        command: "cd ../../.. ; git subtree push --prefix=JITVIZ/dummy_data/SM heroku-sm master"
      }
    },

    nodemon: {
      dev: {
        script: 'server.js'
      }
    }

  });

  grunt.registerTask('deploy', ['shell:deploy']);
  grunt.registerTask('default', ['nodemon']);
};


