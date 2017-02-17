var _ = require('underscore');
var i18n = require('../i18n');

var errorTemplate = _.template("<span class='error'><%- text %></span>");
var epaNameTemplate = _.template("<span class='epa-name'><%- name %></span>");
var epaDateTemplate = _.template("<div class='epa-date'><%- lastFeedbackDate %></div>");
var feedbackMessagesTemplate = _.template("<div class='feedback-message <%- type %>'></div>");
var feedbackTypeTemplate = _.template("<span class='feedback-type'><%- message %></span>");
var messageTemplate = _.template("<p class='feedback-level-<%- level %>'><%- message %></p>");
var supervisorContainerTemplate = _.template("<div></div>");
var supervisorPortfolioMessageTemplate = _.template("<span class='student-alert'><%- message %></span>");

module.exports = {

  errorComponent: function(errorText) {
    return $(errorTemplate({ text: errorText }));
  },

  createEpaNameContainer: function(epaName) {
    return $(epaNameTemplate({ name: epaName }));
  },
  
    createEpaDateContainer: function(epaLastFeedbackDate) {
    return $(epaDateTemplate({ lastFeedbackDate: epaLastFeedbackDate }));
  },

  createFeedbackMessagesContainer: function(feedbackType) {
    return $(feedbackMessagesTemplate({ type: feedbackType.toLowerCase() }));
  },

  createFeedbackTypeContainer: function(lang, feedbackType) {
    return $(feedbackTypeTemplate({ message: i18n.feedback(lang, feedbackType) }));
  },

  createMessageContainer: function(feedbackLevel, message) {
    return $(messageTemplate({ level: feedbackLevel, message: message.text }));
  },

  createPortfolioMessagesContainer: function() {
    return $(supervisorContainerTemplate());
  },

  createPortfolioMessageContainer: function(text) {
    return $(supervisorPortfolioMessageTemplate({ message: text }));
  }

};

