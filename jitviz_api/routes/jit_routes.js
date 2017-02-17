var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('../env.json')[process.env.NODE_ENV || 'development'];

var queryFromRequest = function (req) {
  return {
    baseUrl: config.SM_BASE_URL,
    url : config.SM_PATH,
    json: true,
    body: {
      authorisationData: {
        applicantHash: req.query.authToken,
        studentHash: req.query.studentId,
        sessionToken: req.query.sessionToken
      },
      sourceUrl: req.originalUrl,
      modelId: req.query.modelId,
      groupId: req.query.groupId,
      languageCode: req.query.language,
      epaId: "*"
    }
  };
};

var supervisorQueryFromRequest = function (req) {
  return {
    baseUrl: config.SM_BASE_URL,
    url : config.SM_PATH_SUPERVISOR,
    json: true,
    body: {
      authorisationData: {
        applicantHash: req.query.authToken,
        sessionToken: req.query.sessionToken
      },
      sourceUrl: req.originalUrl,
      modelId: req.query.modelId,
      languageCode: req.query.language,
      students: req.query.students
    }
  };
};

var requestNo = 0;

var pipeRequestTo = function(options, resp) {
  console.time("SM request " + (++requestNo));
  console.log(options);
  request
    .put(options)
    .on('error', function(err) {
      console.log("SM call failed:", err);
    })
    .on('response', function(response) {
      console.timeEnd("SM request " + requestNo);
    })
    .pipe(resp);
};

//GET
router.get('/feedback', function (req, response) {
  console.log('Feedback for all EPAs');
  pipeRequestTo(queryFromRequest(req), response);
});

router.get('/feedback/:epaid', function (req, response) {
  var options = queryFromRequest(req);
  options.body.epaId = req.params.epaid;
  console.log('Feedback for epaId: ' + options.epaId);
  pipeRequestTo(options, response);
});

router.get('/feedback/:epaid/:feedbacktype', function (req, response) {
  var options = queryFromRequest(req);
  options.body.epaId = req.params.epaid;
  options.body.feedbackType = req.params.feedbacktype.toUpperCase();
  pipeRequestTo(options, response);
});

// SUPERVISOR
router.get('/supervisor', function (req, response) {
  console.log('Feedback for supervisor');
  pipeRequestTo(supervisorQueryFromRequest(req), response);
});

//POST
router.post('/feedback/:epaid', function (req, response) {
    var epaId = req.params.epaid;
    var authtoken = req.query.authtoken;

    //DUMMY DATA!!
    response.send('POST jit feedback to question with id: ' + epaId);
});

module.exports = router;

