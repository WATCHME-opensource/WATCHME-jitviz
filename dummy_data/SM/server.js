var express = require('express');
var debug = require('debug')('studentmodel:server');
var logger = require('morgan');
var bodyParser = require('body-parser');

var port = process.env.PORT || 8081;

var sm = express();

sm.use(logger('dev'));
sm.use(bodyParser.json());

function fb(type, level, msgs) {
  return { type: type, level: "" + level, messages: msgs };
};

function improvement(level, msg) { return fb('improvement', level, msg); };
function supervisor(level, msg) { return fb('supervisor', level, msg); };
function trend(level, msg) { return fb('trend', level, msg); };
function positive(level, msg) { return fb('positive', level, msg); };
function cohort(level, msg) { return fb('cohort', level, msg); };
function gaps(level, msg) { return fb('gaps', level, msg); };

sm.get('/sm/api/scenario/:number', function (request, response) {
  console.log('Entered sm api requesting scenario: ' + request.params.number);
  switch (request.params.number) {
    case '1':
      return response.json({
        epas: [
          {
            epaName: "Task 1: Set learning goals for the whole curriculum and specific lessons",
            epaId: "1",
            feedback: [
              improvement(1, ["There is room for improvement on this task."]),
              supervisor(1, ["Your Supervisor added an improvement suggestion on this task."])
            ]
          },
          {
            epaName: "Task 2: Design learning activities (incl. materials and methods) for the learning goals",
            epaId: "2",
            feedback: [
              trend(1, ["You currently have a trend for decreasing scores on this task."])
            ]
          },
          {
            epaName: "Task 3: Plan the execution and supervision of learning",
            epaId: "3",
            feedback: [
              positive(1, ["You have recently received good scores on assessment of this task. You can further improve on this task."])
            ]
          },
          {
            epaName: "Task 4: Supervise the execution and supervision of learning activities",
            epaId: "4",
            feedback: [
              cohort(1, ["Compared to your cohort, you have received better scored on this task than your peers"])
            ]
          },
          {
            epaName: "Task 5: Test to which extent the set learning goals have been met",
            epaId: "5",
            feedback: [
              gaps(1, ["On this task, you have received less assessments than your peers."])
            ]
          }
        ]
      });

    case '2':
      return response.json({
        epas: [
          {
            epaName: "Task 1: Set learning goals for the whole curriculum and specific lessons",
            epaId: "1",
            feedback: [
              improvement(1, [ "There is room for improvement on this task." ]),
              improvement(2, [
                "You are level 2 on your Learning Goals. In order to achieve the next level, you should improve the formulation of you specific learning goals.",
                "You are level 1 on your SMART Learning Goals. In order to achieve the next level, you should check regularly whether your goals are SMART formulated.",
                "You are level 3 on all other Performance Indicators for this task."
              ]),
              supervisor(1, ["Your Supervisor added an improvement suggestion on this task."]),
              supervisor(2, ["Your Supervisor commented: \"You are definitely improving, " +
                             "but your SMART goals could be even sharper. Remember that your goals have to be linked to " +
                             "the specific subject content.\" (07 May 2015)"])
            ]
          }
        ]
      });

    case '22':
      return response.json({
        epas: [
          {
            epaName: "Task 2: Design learning activities (incl. materials and methods) for the learning goals",
            epaId: "2",
            feedback: [
              trend(1, ["You currently have a trend for decreasing scores on this task."]),
              trend(2, ["On Interpersonal Competencies, your previous level was 3, but now you achieved level 2. " +
                        "To improve this Performance Indicator, you need to know the background information of most " +
                        "students and know what moves and motivates other students."])
            ]
          }
        ]
      });

    case '222':
      return response.json({
        epas: [
          {
            epaName: "Task 1: Set learning goals for the whole curriculum and specific lessons",
            epaId: "1",
            feedback: [
              improvement(1, ["There is room for improvement on this task."]),
              improvement(2, [
                "You are level 2 on your Learning Goals. In order to achieve the next level, you should improve the formulation of you specific learning goals.",
                "You are level 1 on your SMART Learning Goals. In order to achieve the next level, you should check regularly whether your goals are SMART formulated.",
                "You are level 3 on all other Performance Indicators for this task."
              ]),
              supervisor(1, ["Your Supervisor added an improvement suggestion on this task."]),
              supervisor(2, ["Your Supervisor commented: \"You are definitely improving, but your SMART goals could be even sharper. " +
                             "Remember that your goals have to be linked to the specific subject content.\" (07 May 2015\)"])
            ]
          },
          {
            epaName: "Task 2: Design learning activities (incl. materials and methods) for the learning goals",
            epaId: "2",
            feedback: [
              trend(1, ["You currently have a trend for decreasing scores on this task."]),
              trend(2, ["On Interpersonal Competencies, your previous level was 3, but now you achieved level 2. " +
                        "To improve this Performance Indicator, you need to know the background information of most students " +
                        "and know what moves and motivates other students."])
            ]
          }
        ]
      });

    case '3':
      return response.json({
        epas: [
          {
            epaName: "Task 1: Set learning goals for the whole curriculum and specific lessons",
            epaId: "1",
            feedback: [
              improvement(1, ["There is room for improvement on this task."]),
              improvement(2, [
                "You are level 2 on your Learning Goals. In order to achieve the next level, you should improve the formulation of you specific learning goals.",
                "You are level 1 on your SMART Learning Goals. In order to achieve the next level, you should check regularly whether your goals are SMART formulated.",
                "You are level 3 on all other Performance Indicators for this task."
              ])
            ]
          }
        ]
      });

    case '33':
      return response.json({
        epas: [
          {
            epaName: "Task 1: Set learning goals for the whole curriculum and specific lessons",
            epaId: "1",
            feedback: [
              supervisor(1, ["Your Supervisor added an improvement suggestion on this task."]),
              supervisor(2, [ "Your Supervisor commented: \"You are definitely improving, but your SMART goals could be even sharper. " +
                              "Remember that your goals have to be linked to the specific subject content.\" (07 May 2015\)"])
            ]
          }
        ]
      });

    default:
      return response.send('Oops! Something went wrong.');
  }
});

sm.listen(port);
console.log('Server is running on ' + port);

module.exports = sm;
