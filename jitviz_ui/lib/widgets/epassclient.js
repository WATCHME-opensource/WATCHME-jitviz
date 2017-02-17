var DH = require('../widgets/DataHandler');
var QB = require('../utilities/query_builder');

exports.getSupervisorStudentsFromEpass = function (data, successCallback, failureCallback) {
    var query = QB.EPASSQuery(data, 'portfolioaccess');
    query.success = function (body) {
        var students = [];
        var access = JSON.parse(body);
        if (access.error !== undefined) {
            failureCallback({ "CustomMessage": access.error.message });
            console.log(error);
        }
        $.each(access.supervisees, function (idx, value) {
            students.push({ "hash": value.user.id, "name": value.user.name });
        });
        successCallback(students);
    };
    query.error = function (error) {
        failureCallback(error);
        console.log(error);
    };
    $.ajax(query);
};
