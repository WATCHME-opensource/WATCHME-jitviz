var env = require("../env");

exports.queryParam = function (modelId, studentId, sessionToken, authToken, groupId, epaIds, feedbackType, language, environment) {
    environment = environment || "development";
    return {
        url: env[environment].JV_BASE_URL + env[environment].JIT_PATH + (epaIds !== undefined ? "/" + epaIds : "") + (feedbackType !== undefined ? "/" + feedbackType : ""),
        data: {
            modelId: modelId,
            studentId: studentId,
            sessionToken: sessionToken,
            authToken: authToken,
            groupId: groupId,
            language: language,
            dataType: "json"
        }
    };
};

exports.queryFromJitComponent = function (jitComponent) {
    var d = $(jitComponent).data();
    return exports.queryParam(d.modelId, d.studentId, d.sessionToken,
        d.authToken, d.groupId, d.epaIds, d.feedbackType,
        d.language, d.env);
};

exports.querySupervisorFromJitComponent = function (d, students) {
    return {
        url: env[d.environment].JV_BASE_URL + env[d.environment].JIT_SUPERVISOR_PATH,
        data: {
            modelId: d.domain,
            students: students,
            sessionToken: d.sessionToken,
            authToken: d.applicantHash,
            language: d.language,
            dataType: "json"
        }
    };
};

exports.vizQuery = function (environment, urlQuery) {
    environment = environment || "production";
    return {
        url: env[environment].JV_BASE_URL + env[environment].VIZ_PATH + urlQuery
    };
};

exports.EPASSQuery = function (data, queryPath) {
    var params = data.domain + '?session_token=' + data.sessionToken + '&auth_token=' + data.applicantHash;
    if (data.studentHash) {
        params += '&student_id=' + data.studentHash;
    }
    return {
        url: env[data.environment].JV_BASE_URL + env[data.environment].VIZ_PATH + queryPath + "/" + params
    }
};

exports.smQuery = function (data, query) {
    return {
        url: env[data.environment].JV_BASE_URL + env[data.environment].VIZ_PATH + "sm-router/" + query,
        method: 'GET',
        crossDomain: true,
        contentType: 'application/json',
        data: "applicantHash=" + data.applicantHash + "&sessionToken=" + data.sessionToken + "&studentHash=" + data.studentHash + "&modelId=" + data.domain + "&languageCode=" + data.language + "&epaId=" + data.epaId || '*',
        dataType: 'json'
    }
};

exports.smQuerySupervisor = function (data, query, students) {
    var userData = {
        authorisationData: {
            applicantHash: data.applicantHash,
            sessionToken: data.sessionToken
        },
        modelId: data.domain,
        languageCode: data.language,
        students: students
    };
    var students = JSON.stringify(students);
    return {
        url: env[data.environment].JV_BASE_URL + env[data.environment].VIZ_PATH + "sm-router/" + query,
        method: 'GET',
        contentType: 'application/json',
        crossDomain: true,
        //data: JSON.stringify(userData),
        data: "applicantHash=" + data.applicantHash + "&sessionToken=" + data.sessionToken + "&modelId=" + data.domain + "&languageCode=" + data.language + "&students=" + students,
        dataType: 'json'
    }
};