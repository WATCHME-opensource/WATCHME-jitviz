var express = require('express');
var router = express.Router();
var PREF = require('../education.json');
var QB = require('../utilities/query_builder');
var request = require('request');


// API/VIZ/{VisualizationType}?AuthToken={AuthToken}&{Parameters}
router.get('/:vizType', function (req, response) {
    response.send('GET som viz of the type: ' + req.params.vizType);
});

// API/VIZ/educations/:education/:language
router.get('/educations/:education/:language', function(req, response){
    var education = req.params.education;
    var language = req.params.language;

    try {
        response.send(PREF.preferences[ education ]);
    }
    catch(e) {
        response.status(404);
        response.send(e);
    }

});

// The the EPA capabilities for the current user
router.get('/capabilityrequests/:education', function(req, response) {
    QB.epassConnection(true,req.params.education, req.query,
        "capabilityrequests?user="+req.query.student_id,
        failure(response),
        function(body){
            response.send(body);
        });
});

// Get the mapping from a supervisor to the list of students
router.get('/portfolioaccess/:education', function(req, response) {
    QB.epassConnection(false,req.params.education, req.query,
        "users/"+req.query.auth_token+"/portfolioaccess",
        failure(response),
        function(body){
            response.send(body);
        });
});


// Get the form details of the specified form
router.get('/forms/:formId/:education', function(req, response) {
    QB.epassConnection(true, req.params.education, req.query,
        "forms/"+req.params.formId,
        failure(response),
        function(body){
            response.send(body);
        });
});

router.get('/configs/:education', function(req, response){
    QB.epassConnection(true, req.params.education, req.query,
    'configs',
    failure(response),
    function(body){
        response.send(body);
    });
});


router.get('/sm-router/:endpoint', function(req, response){
    QB.studentModelRequest(req, req.params.endpoint, response);
});

var failure = function(response) {
    return function(message) {
        response.status(403);
        response.send("{error:"+message+"}");
    };
};

module.exports = router;
