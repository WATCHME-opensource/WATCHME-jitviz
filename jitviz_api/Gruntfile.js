module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-nodemon');

  grunt.initConfig({
    shell: {
      deploy: {
        command: "cd ../.. ; git subtree push --prefix=JITVIZ/jitviz_api heroku-api master"
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

  grunt.registerTask('sm', "Put a request to SM returning JSON", function() {
    var request = require('request');
    var done = this.async();

    grunt.log.writeln("Request feedback...");
    request.put("http://www.example.server/jit",
                { json: true, body: {
                 "authorisationData": {
                    "applicantHash": "xxx",
                    "studentHash": "xxx",
                    "sessionToken": "xxx"
                  },
                 "sourceUrl": "https://www.example.eu",
                 "modelId": "EXAMPLE SCHOOL",
                 "groupId": "xxx",
                 "languageCode": "en",
                 "epaId": "*"
                 // "feedbackType": 0 // "improvement=0 | positive=1 | supervisor=2 | cohort=3 | gaps=4 | trend=5"
                } },
      function(error, response, body) {
        if (error) {
          grunt.log.writeln("Got an error", error);
          done();
        }
        else {
          grunt.log.writeln("POST response:", body);
          grunt.log.writeln("EPA 0 feedback: ", body.epas[0].feedback);
        }
      });
  });

  grunt.registerTask('auth', "Run OAuth2 flow, returning a token", function() {
    var request = require('request');
    var done = this.async();

    grunt.log.writeln("Request auth token...");
    request.get("http://example.server/v1/authorize?response_type=code&client_id=testclient&state=123abc",
                { json: true },
      function(error, response, body) {
        if (error) {
          grunt.log.writeln("Got an error", error);
          done();
        }
        else {
          grunt.log.writeln("GET response body", body);
        }
      });

    request.post("http://example.server/v1/authorize",
                 { form: { tssemail: 'example', tsspassword: 'xxxx' } },
      function(err, response) {
        grunt.log.writeln("Got err, response", err, response);
        done();
      });
  });
};


e
