var Dashboard = require("./jit_dashboard_component");
var DashboardSupervisor = require("./jit_dashboard_supervisor_component");
var Assessment = require("./jit_assessment_component");
var Common = require("./jit_common_components");

exports.dashboard = function (jitComponent, json, knowledgeFragments) {

  if (knowledgeFragments) {
    return Dashboard.getKnowledgeFragments(jitComponent, json);
  }
  var feedbackLevels = $(jitComponent).data("feedbackLevels");
  var lang = $(jitComponent).data("language");

  switch (feedbackLevels) {
    case '1':
      return Dashboard.getLevelOne(jitComponent, json);
    case '1,2':
      return Dashboard.getLevelTwo(jitComponent, json);
    default:
      return Dashboard.getLevelOne(jitComponent, json);
  }
};

exports._knowledgeFragments = {};

exports.knowledgeFragments = function () {
  return exports._knowledgeFragments;
};

exports.setKnowledgeFragments = function (knowledgeFragments) {
  exports._knowledgeFragments = knowledgeFragments;
};

exports.parse = function (jitComponent, json, knowledgeFragments) {
  var lang = $(jitComponent).data("language");
  var jitComponentType = $(jitComponent).data("jitComponentType");

  switch (jitComponentType) {
    case 'dashboard':
      jitComponent.innerHTML = '';
      return exports.dashboard(jitComponent, json, knowledgeFragments);

    case 'assessment':
      jitComponent.innerHTML = '';
      return Assessment.GetAssessment(json, lang);

    default:
      return Common.errorComponent("Unknown component type");
  }
};

exports.parseSupervisor = function (jitComponent, json) {
  var lang = $(jitComponent).data("language");
  jitComponent.innerHTML = '';
  return DashboardSupervisor.getStudents(jitComponent, json);
};

