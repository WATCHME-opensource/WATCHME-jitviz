
var Canvas = require('../canvases/jit_canvas');
var Common = require('../canvases/jit_common_components');
var QueryBuilder = require('../utilities/query_builder');
var App = require('../widgets/app');
var i18n = require("../i18n");

exports.getComponentContent = function (jitComponent) {
    var d = $(jitComponent).data();
    if (d.role === "supervisor") {
        getSupervisorContent(jitComponent);
    } else {
        getStudentContent(jitComponent);
    }
};

function getStudentContent(jitComponent) {
    var query = QueryBuilder.queryFromJitComponent(jitComponent);
    query.success =
        function (body, status, xhr) {
            Canvas.setKnowledgeFragments(body['knowledge-fragments']);

            jitComponent.innerHTML = '';
            var $canvas = Canvas.parse(jitComponent, body);
            $(jitComponent).append($canvas);
        };
    query.error = function () {
        jitComponent.innerHTML = '';
        $(jitComponent).append(Common.errorComponent(i18n.tr(lang, "no_feedback")));
    };

    var lang = $(jitComponent).data("language");
    jitComponent.innerHTML = i18n.tr(lang, "loading");


    $.ajax(query);
}

function getSupervisorContent(jitComponent) {
    var element = $(jitComponent);
    var data = {
        domain: element.data('modelId'),
        studentHash: element.data('studentId'),
        applicantHash: element.data('authToken'),
        sessionToken: element.data('sessionToken'),
        language: element.data('language'),
        epaId: element.data('epa-ids'),
        environment: element.data('env') || 'development'
    }
    var successCallback = function (jsonData) {
        jitComponent.innerHTML = '';
        var $canvas = Canvas.parseSupervisor(jitComponent, jsonData);
        $(jitComponent).append($canvas);
    }
    var failureCallback = function (error) {
        jitComponent.innerHTML = '';
        $(jitComponent).append(Common.errorComponent(error));
    }

    var lang = $(jitComponent).data("language");
    jitComponent.innerHTML = i18n.tr(lang, "loading");

    App.requestJitSupervisorData(data, successCallback, failureCallback);
}

function logOnLoad() {
    logObject = {
        component: 'JIT',
        event: 'load-jit'
    };
    try {
        jitviz_log('wm_log_load', logObject);
    } catch (e) {
        console.log(e);
    }


}

function logOnUnload() {
    $(window).unload(function () {
        logObject = {
            component: 'JIT',
            event: 'unload-jit'
        };

        try {
            jitviz_log('wm_log_unload', logObject);
        } catch (e) {
            console.log(e);
        }
    });
}

logOnLoad();
logOnUnload();


