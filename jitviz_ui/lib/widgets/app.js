var DH = require('../widgets/DataHandler');
var TH = require('../widgets/tabs');
var Client = require('../widgets/smclient');
var EpassClient = require('../widgets/epassclient');
var i18n = require("../i18n");

exports.requestCurrentPerformanceData = function (userData) {
    var callbacks = {
        onStudentModelRequestSuccess: _onCurrentPerformanceRequestSuccessful,
        onStudentModelRequestFailure: _onCurrentPerformanceRequestFailed
    };

    Client.getCurrentPerformance(userData, callbacks);
};

exports.requestJitFeedbackData = function (userData, epaId, promise) {
    Client.getJitFeedback(userData, epaId, promise);
};

exports.requestTimelineData = function (userData) {
    var callbacks = {
        onStudentModelRequestSuccess: _onTimelineRequestSuccessful,
        onStudentModelRequestFailure: _onTimelineRequestFailed
    };

    Client.getTimeline(userData, callbacks);
};

exports.requestFormData = function (data, formId) {
    Client.getFormData(data, formId);
};

exports.requestSupervisorData = function (userData) {
    var callbacks = {
        onStudentModelRequestSuccess: _onSupervisorRequestSuccessful,
        onStudentModelRequestFailure: _onSupervisorRequestFailed
    };

    Client.getSupervisor(userData, callbacks);
};

exports.requestGeneralOverviewData = function (userData) {
    var callbacks = {
        onStudentModelRequestSuccess: _onGeneralRequestSuccessful,
        onStudentModelRequestFailure: _onGeneralRequestFailed
    };

    Client.getGeneral(userData, callbacks);
};

exports.requestJitSupervisorData = function (userData, successCallback, failureCallback) {
    var requestFailureCallback = function (error) {
        if (error.CustomMessage !== undefined) {
            failureCallback(error.CustomMessage);
        } else {
            failureCallback(_resolveError(error));
        }
    }
    var epassSuccessCallback = function (students) {
        Client.getJitSupervisor(userData, students, successCallback, requestFailureCallback);
    }
    EpassClient.getSupervisorStudentsFromEpass(userData, epassSuccessCallback, requestFailureCallback);
};

var _resolveError = function (err) {
    var status = err.statusCode();
    if (status.readyState == 0) {
        return i18n.tr(DH.requester.getLanguage(), "server_unreachable");
    }
    if (status.statusText) {
        return status.statusText;
    }
    return i18n.tr(DH.requester.getLanguage(), "unknown_error");
};

var _onCurrentPerformanceRequestSuccessful = function (result) {
    DH.currentPerformance.setData(result);
    TH.refreshCurrentPerformanceTab();
};

var _onCurrentPerformanceRequestFailed = function (err) {
    DH.currentPerformance.setData(undefined);
    TH.displayCurrentPerformanceError(_resolveError(err));
};

var _onTimelineRequestSuccessful = function (result, levels, levelTexts) {
    DH.timeline.setData(result);
    DH.timeline.setLevels(levels);
    DH.timeline.setLevelTexts(levelTexts);
    TH.refreshTimelineTab();
};

var _onTimelineRequestFailed = function (err) {
    DH.timeline.setData(undefined);
    TH.displayTimelineError(_resolveError(err));
};

var _onSupervisorRequestSuccessful = function (result) {
    DH.supervisor.setData(result);
    TH.refreshSupervisorTab();
};

var _onSupervisorRequestFailed = function (err) {
    DH.supervisor.setData(undefined);
    TH.displaySupervisorError(_resolveError(err));
};

var _onGeneralRequestSuccessful = function (result) {
    DH.general.setData(result);
    TH.refreshGeneralTab();
};

var _onGeneralRequestFailed = function (err) {
    DH.general.setData(undefined);
    TH.displayGeneralError(_resolveError(err));
};
