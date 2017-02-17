var _ = require("underscore");

var Common = require("./jit_common_components");
var i18n = require("../i18n");

function feedbackComponent($parent, feedbackJson, lang) {
  var multipleSelectedEpas = feedbackJson.length > 1;
  _.each(feedbackJson, function(epa) {
    $parent.append(epaComponent(epa, multipleSelectedEpas, lang));
  });
}

function epaComponent(epa, multipleSelectedEpas, lang) {
    if (epa.epaId != undefined && epa.epaName != undefined) {
        var epaContainer = document.createElement('div');
        epaContainer.id = epa.epaId;
        epaContainer.className = 'epa';

        if (multipleSelectedEpas) {
            $(epaContainer).append(Common.createEpaNameContainer(epa.epaName));
			$(epaContainer).append(Common.createEpaDateContainer(epa.epaLastFeedbackDate));
            epaContainer.appendChild(document.createElement('hr'));
        }

        feedbackMessagesComponent(epaContainer, epa.feedback, lang);
        return epaContainer;
    }
}

function feedbackMessagesComponent(parent, feedbackMessagesJson, lang) {
  _.each(feedbackMessagesJson, function(feedbackMessage) {

    var feedbackType = feedbackMessage.type;
    var $feedbackMessageContainer = Common.createFeedbackMessagesContainer(feedbackType);

    $feedbackMessageContainer.append(Common.createFeedbackTypeContainer(lang, feedbackType));
    _.each(feedbackMessage.messages, function(message) {
      $feedbackMessageContainer.append(Common.createMessageContainer(feedbackMessage.level, message));
    });

    $(parent).append($feedbackMessageContainer);
  });
}

//Public
exports.GetAssessment = function (json, lang) {
    var $canvas = $("<div class='jit-assessment-content'></div>");

    if (json.epas != undefined && json.epas.length > 0) {
        feedbackComponent($canvas, json.epas, lang);
    } else {
        var error = Common.errorComponent(i18n.tr(lang, "no_feedback"));
        $canvas.append(error);
    }

    return $canvas;
};

