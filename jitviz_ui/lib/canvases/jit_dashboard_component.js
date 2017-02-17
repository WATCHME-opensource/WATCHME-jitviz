var _ = require("underscore");

var QueryBuilder = require("../utilities/query_builder");
var Canvas = require("./jit_canvas");
var Common = require("./jit_common_components");
var i18n = require("../i18n");

var headerTemplateWithButton = _.template("<div style='overflow:hidden'><h4 class='dashboard-header'><%- text %></h4><input type='button' class='button pedagogical-feedback-button'  data-feedback-type='pedagogical' value='<%- button_text %>'</input></div>");
var headerTemplate = _.template("<div style='overflow:hidden'><h4 class='dashboard-header'><%- text %></h4></div>");
var buttonTemplate = _.template("<input type='button' class='button' value='<%- text %>'</input>");
var epaTemplate = _.template(
      "<div id='<%- epaId %>' class='epa'>\
         <span class='epa-name'><%- epaName %></span>\
		 <div class='epa-date'><%- epaLastFeedbackDate %></div>\
      </div>");

function epaComponent(epa, level, lang) {
  var epaId = epa.epaId;
  var epaName = epa.epaName;
  if (epaId !== undefined && epaName !== undefined) {
    var $epaContainer = $(epaTemplate(epa));

    if (level > 1) {
      $epaContainer.append(document.createElement('hr'));
    }
    $epaContainer.append(feedbackMessagesComponent(epa.feedback, epaId, level, lang));

    return $epaContainer;
  }
}

function feedbackMessagesComponent(feedbackMessages, epaId, level, lang) {
  if (feedbackMessages.length > 0) {
    return _.map(feedbackMessages, function(feedbackMessage) {
      var feedbackType = feedbackMessage.type;
      var feedbackMessagesContainer = Common.createFeedbackMessagesContainer(feedbackType);

	  var feedbackMessageLevel = parseInt(feedbackMessage.level, 10);
	  
      if (level >= feedbackMessageLevel) {
        feedbackMessagesContainer.append(feedbackMessageContentComponent(
          feedbackMessage, epaId, level, lang));
      }
	  
	  if(level===2 && feedbackMessageLevel===2){
		  var submissionId = feedbackMessage.messages[0].submissionId;
		  var btnGoToForm = $('<input />', {
					class: 'button',
					css: {
						width: 'auto'
					},
					type: 'button',
					value : i18n.tr(lang, 'go_to_submission', {number: submissionId}),
					on : {
						click:function(event){
							event.preventDefault();
							event.stopPropagation();
							
							viz_open_form(submissionId);
						}
					}
				});
			feedbackMessagesContainer.append(btnGoToForm);
	  }
	  
      return feedbackMessagesContainer;
    });
  }
  return Common.errorComponent(i18n.tr(lang, "no_feedback"));
}

function feedbackMessageContentComponent(feedbackMessage, epaId, level, lang) {

  return _.map(feedbackMessage.messages, function(currentMessage) {
    var $message = Common.createMessageContainer(feedbackMessage.level, currentMessage);
    if (level < 2) {
      var $button = $(buttonTemplate({ text: i18n.feedback(lang, feedbackMessage.type) }));
      $button.data("epaIds", epaId);
      $button.data("feedbackType", feedbackMessage.type.toLowerCase());
      $message.append($button);
    }
    return $message;
  });
}

function getDashboard(level, epas, lang, initialDisplay) {
	if(initialDisplay===undefined){
		initialDisplay=2;
	}

  var $canvas = $("<div class='jit-dashboard-level-" + level + "-content'></div>");

  if (level > 1) {
    $canvas.append($("<a href='javascript:location.reload()' class='back-button'>" + i18n.tr(lang, "back") + "</a>"));
    $canvas.append(document.createElement('hr'));
    $canvas.append($(headerTemplate({ text: i18n.tr(lang, "header")})));
  } else {
      if(Canvas.knowledgeFragments()){
        $canvas.append($(headerTemplateWithButton({ text: i18n.tr(lang, "header"), button_text: i18n.feedback(lang, "pedagogical") })));
      } else {
          $canvas.append($(headerTemplate({ text: i18n.tr(lang, "header")})));
      }
  }


  $canvas.append(document.createElement('hr'));
  var hiddenData=[];

  if(level < 3) {
      $(epas).each(function(index){
        if(index<initialDisplay){
            $canvas.append(epaComponent(this, level, lang));
        }
        else{
            hiddenData.push(this);
        }
      });

      if(epas.length > initialDisplay){
          var divShowAllContainer = $('<div/>',{
            class:'show-all-container'
          });
          var btnShowAll = $('<input />', {
                      class: 'button',
                      type  : 'button',
                      value : i18n.tr(lang, "show_all"),
                      id    : 'show-all',
                      data:{
                       hiddenData: JSON.stringify(hiddenData)
                      },
                      on : {
                         click: function(event) {
                             event.preventDefault();
                             event.stopPropagation();

                             $(this).closest('.show-all-container').hide();

                             var hiddenData = JSON.parse($(this).data().hiddenData);
                             $(hiddenData).each(function(){
                                $canvas.append(epaComponent(this, level, lang));
                             });

                             $(hiddenData[hiddenData.length-1]).css('border', 0)
                             return false;
                         }
                      }
                  });

            $(divShowAllContainer).append(btnShowAll);
            $canvas.append(divShowAllContainer);
      }

      if (epas.length === 0) {
        $canvas.append(Common.errorComponent(i18n.tr(lang, "no_feedback")));
      }
  } else {
      $.each(Object.keys(epas), function(index,key) {
          $canvas.append('<p>'+epas[key]+'</p>');
      });
  }


  return $canvas;
}

function handleButtonClick(evt, jitComponent, json) {
  var logObject = {};
  var $button = $(evt.target), $jit = $(jitComponent);
  evt.preventDefault();

  if ($button.hasClass('back-button')) {
    logObject = {
        component : 'JIT',
        event: 'leave-feedback-view',
        feedbackType: $jit.data('feedbackType'),
        epaId : $jit.data('epaIds'),
        feedBackLevel1: $(evt.target).parent().find('.feedback-level-1').text(),
        feedBackLevel2: $(evt.target).parent().find('.feedback-level-2').text()
    };

    $jit.removeData('feedbackType');
    $jit.removeData('epaIds');
    $jit.data('feedbackLevels', '1');
  }
  else if ($button.hasClass('button')) {
    var epaId = $button.data('epaIds');
    var feedbackType = $button.data('feedbackType');

    logObject = {
        component : 'JIT',
        event: 'view-feedback',
        feedbackType: feedbackType,
        epaId : epaId,
        feedBackLevel1: $(evt.target).parent().text(),
        feedBackLevel2: getFeedbackLevel2(epaId,feedbackType, json)
    };

    function getFeedbackLevel2(epaId, feedbackType, json) {
        var result = "empty";
        json.epas.forEach(function(epa) {
            if(epa.epaId === epaId) {
                epa.feedback.forEach(function(feedback) {
                    console.log(feedback.level == 2, feedback.type === feedbackType.toUpperCase())
                    if(feedback.level == 2 && feedback.type === feedbackType.toUpperCase()) {
                        result = feedback.messages[0].text;
                    }
                })
            }
        });

        return result;
    }

    $jit.data('feedbackType', $button.data('feedbackType'));
    $jit.data('epaIds', $button.data('epaIds'));
    $jit.data('feedbackLevels', '1,2');
  }
  else {
    return false;
  }
  try {
    jitviz_log('wm_log_feedback', logObject);
  } catch(e) {
      console.log(e);
  }

  var lang = $jit.data("language");

  if($button.data('feedbackType') === 'pedagogical') {
      jitComponent.innerHTML = i18n.tr(lang, "loading");
      var $canvas = Canvas.parse(jitComponent, Canvas.knowledgeFragments(), true);
      $jit.append($canvas);
  } else {
      var options = QueryBuilder.queryFromJitComponent(jitComponent);
      jitComponent.innerHTML = i18n.tr(lang, "loading");
      options.success = function(body, status, xhr) {
        var $canvas = Canvas.parse(jitComponent, body);
        $jit.append($canvas);
      };

      $.ajax(options);
  }
}

//Public
exports.getLevelOne = function (jitComponent, json) {
  var jitComponentData = $(jitComponent).data();
  var lang = jitComponentData.language;
  var initialDisplay = jitComponentData.initialDisplay;
  var $canvas = getDashboard(1, json.epas, lang, initialDisplay);
  $canvas.click(function(evt) {
    return handleButtonClick(evt, jitComponent, json);
  });
  return $canvas;
};

exports.getLevelTwo = function (jitComponent, json) {
  var jitComponentData = $(jitComponent).data();
  var lang = jitComponentData.language;
  var initialDisplay = jitComponentData.initialDisplay;
  var $canvas = getDashboard(2, json.epas, lang, initialDisplay);
  $canvas.click(function(evt) {
    return handleButtonClick(evt, jitComponent, json);
  });
  return $canvas;
};

exports.getKnowledgeFragments = function(jitComponent, json) {
    var jitComponentData = $(jitComponent).data();
    var lang = jitComponentData.language;
    var initialDisplay = jitComponentData.initialDisplay;

    var $canvas = getDashboard(3, json, lang, initialDisplay);
    $canvas.click(function(evt) {
        return handleButtonClick(evt, jitComponent, json);
    });
    return $canvas;
};

