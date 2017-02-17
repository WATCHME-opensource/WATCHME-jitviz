var _ = require("underscore");

var Common = require("./jit_common_components");
var i18n = require("../i18n");

var headerTemplate = _.template("<div style='overflow:hidden'><h4 class='dashboard-header'><%- text %></h4></div>");
var generalMessageTemplate = _.template("<div class='epa'><span class='alerts-message'><%- message %></span></div>");
var studentTemplate = _.template("<div class='epa'><span class='student-name'><%- name %></span></div>");
var buttonTemplate = _.template("<input type='button' class='button jit-open-portfolio' data-id='<%- hash %>' value='<%- text %>'/>");

function studentComponent(student, lang) {
  var studentName = student.name;
  var studentWarnings = student.warnings;
  if (studentName !== undefined && studentWarnings !== undefined) {
    var $studentContainer = $(studentTemplate(student));
    $studentContainer.append(portfolioComponent(studentWarnings, lang));
    var $button = $(buttonTemplate({hash: student.hash, text: "Go to portfolio"}));
    $studentContainer.append($button);
    return $studentContainer;
  }
}

function portfolioComponent(studentWarnings, lang) {
  var portfolioMessagesContainer = Common.createPortfolioMessagesContainer();
  if (studentWarnings["feedback-seeking"] !== undefined) {
    portfolioMessagesContainer.append(Common.createPortfolioMessageContainer(studentWarnings["feedback-seeking"]));
  }
  if (studentWarnings["portfolio-consistency"] !== undefined) {
    portfolioMessagesContainer.append(Common.createPortfolioMessageContainer(studentWarnings["portfolio-consistency"]));
  }
  if (studentWarnings["frustration"] !== undefined) {
    portfolioMessagesContainer.append(Common.createPortfolioMessageContainer(studentWarnings["frustration"]));
  }
  if (studentWarnings["information-level"] !== undefined) {
    portfolioMessagesContainer.append(Common.createPortfolioMessageContainer(studentWarnings["information-level"]));
  }
  return portfolioMessagesContainer;
}

function getDashboard(json, lang, initialDisplay) {
  if (initialDisplay === undefined) {
    initialDisplay = 100;
  }

  var $canvas = $("<div class='jit-dashboard-level-1-content'></div>");
  $canvas.append($(headerTemplate({ text: i18n.tr(lang, "header") })));

  $canvas.append(document.createElement('hr'));
  $canvas.append($(generalMessageTemplate({ message: json.message })));
  var hiddenData = [];

  var students = json.students;
  $(students).each(function (index) {
    if (index < initialDisplay) {
      $canvas.append(studentComponent(this, lang));
    }
    else {
      hiddenData.push(this);
    }
  });

  if (students.length > initialDisplay) {
    var divShowAllContainer = $('<div/>', {
      class: 'show-all-container'
    });
    var btnShowAll = $('<input />', {
      class: 'button',
      type: 'button',
      value: i18n.tr(lang, "show_all"),
      id: 'show-all',
      data: {
        hiddenData: JSON.stringify(hiddenData)
      },
      on: {
        click: function (event) {
          event.preventDefault();
          event.stopPropagation();

          $(this).closest('.show-all-container').hide();

          var hiddenData = JSON.parse($(this).data().hiddenData);
          $(hiddenData).each(function () {
            $canvas.append(studentComponent(this, lang));
          });

          $(hiddenData[hiddenData.length - 1]).css('border', 0)
          return false;
        }
      }
    });

    $(divShowAllContainer).append(btnShowAll);
    $canvas.append(divShowAllContainer);
  }
  return $canvas;
}

//Public
exports.getStudents = function (jitComponent, json) {
  var jitComponentData = $(jitComponent).data();
  var lang = jitComponentData.language;
  var initialDisplay = jitComponentData.initialDisplay;
  var $canvas = getDashboard(json, lang, initialDisplay);
  $(document).on('click', '.jit-open-portfolio', function (event) {
      viz_open_portfolio($(event.currentTarget).data('id'));
  });
  return $canvas;
};
