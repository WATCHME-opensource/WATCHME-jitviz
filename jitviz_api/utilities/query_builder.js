var config = require('../env.json')[process.env.NODE_ENV || 'development'];
var request = require('request');
var epassUsers = require('../epass_users.json')[process.env.NODE_ENV || 'development'];

var epassURL = function(urlQuery) {
    return config.EPASS_API + "json/" + urlQuery;
};

exports.studentModelRequest = function(req, endpoint, response) {
    pipeRequestTo(queryFromRequest(req, endpoint), response);
};

var pipeRequestTo = function(options, resp) {
  console.time("SM request");
  request
    .put(options)
    .on('error', function(err) {
      console.log("SM call failed:", err);
    })
    .on('response', function(response) {
      console.timeEnd("SM request");
    })
    .pipe(resp);
};

var queryFromRequest = function (req, endpoint) {
  console.log('');
  console.log('---------------- start request ----------------');
  console.log('endpoint: ', endpoint);
  console.log('config: ', config);
  console.log('node environment: ', process.env.NODE_ENV);

  var groupId = req.query.groupId === undefined ? 'foo' : req.query.groupId;
  var epaId = req.query.epaId === undefined || req.query.epaId === 'undefined' ? '*' : req.query.epaId;

  var query = {
    baseUrl: config.SM_BASE_URL,
    url : config.SM_PATH_BASE + endpoint,
    json: true,
    body: {
      authorisationData: {
        applicantHash: req.query.applicantHash,
        studentHash: req.query.studentHash,
        sessionToken: req.query.sessionToken
      },
      modelId: req.query.modelId,
      languageCode: req.query.languageCode,
      groupId: groupId,
      epaId: epaId
    }
  };

  if ( req.query.students ) {
    query.body.students = JSON.parse(req.query.students);
  }

  console.log('');
  console.log('----------------------- query -----------------------');
  console.log(query);
  console.log('----------------------- query end -------------------');
  console.log('');
  return query;
};

exports.epassConnection = function( permissionCheck, education, tokens, url, failure, success ) {
    // All EPASS connection must first aquire a
    // session token, and then ask permission
    // manager for permission to proceed.
    console.log('initiating epass request for: '+url);

    // Step 1: login
    var user = epassUsers[ education ];
    if ( !user ) {
        return { "error" : "Education not configured: "+education };
    }
    console.log('user: ', user);
    var options = {
      method: 'POST',
      uri: config.EPASS_API + "token",
      form: {
        grant_type: 'client_credentials'
        },
      headers: {
        'Authorization': 'Basic ' + new Buffer(user.user+":"+user.password).toString('base64')
      }
    };
    request(options, function(error, resp, body) {
        if ( !error ) {
            console.log( body );
            var token = JSON.parse( body)['access_token'];
            console.log('Access token: ' + token);
            if ( permissionCheck ) {
                hasPermission(token, tokens, function() {
                    call(url, token, success, failure);
                }, failure);
            } else {
                call(url, token, success, failure);
            }
        } else {
            console.log('fail1', body);
            failure( body );
        }
    });
};

// check privacy manager if user has access to student
var hasPermission = function(token, tokens, success, failure) {
    var url = epassURL("privacymanager/"+tokens.auth_token+"/has-access-to/"+tokens.student_id+"/with-token/"+tokens.session_token+"?access_token="+token);
    console.log('tokens: ', tokens);
    request( url,
        function(error, response, body){
            if ( !error) {
                var result = JSON.parse(body);
                var keys = Object.keys(result);
                if ( keys.indexOf('access') > -1 ) {
                    if ( result['access']) {
                        console.log('Access granted');
                        success();
                    } else {
                        console.log(result);
                        failure('Access not allowed');
                    }
                } else {
                    console.log('Failure: ',response);
                    failure(result);
                }
            } else {
                console.log('Failure: ',body);
                failure(body);
            }
        }
    );
};

var call = function(url, token, success, failure) {
    var access_token = "&access_token="+token;
    if ( url.indexOf('?') == -1 ) {
        access_token = "?access_token="+token;
    }
    url = epassURL(url+access_token);
    request( url, function(error, response, body) {
        if ( !error) {
            console.log("Success: ", url);
            success( body );
        } else {
            failure(body);
        }
    });
};