var QB = require('../utilities/query_builder');
var RH = require('../widgets/DataHandler');

exports.getCurrentPerformance = function (data, callbacks) {
    var successCallback = callbacks.onStudentModelRequestSuccess;
    var failureCallback = callbacks.onStudentModelRequestFailure;


    var promise = $.ajax(QB.smQuery(data, 'currentperformance'));
    promise.done(function (result) {
        var epaMap = RH.requester.getEPAMap();
        if (!epaMap) {
            var ePromise = $.ajax(QB.EPASSQuery(data, 'capabilityrequests'));
            ePromise.done(function (capabilities) {
                // create epaMap
                createEPAMap(result, capabilities);
                successCallback(result);
            });
            ePromise.fail(function (error) {
                failureCallback(error);
            })
        } else {
            successCallback(result);
        }
    });
    promise.fail(function (error) {
        failureCallback(error);
    });
};

exports.getJitFeedback = function (d, epaId, promise) {
    if (jitFeedbackResponses[epaId]) {
        if (jitFeedbackResponses[epaId] != 'awaiting') {
            promise(jitFeedbackResponses[epaId]);
        }
        return;
    }

    jitFeedbackResponses[epaId] = 'awaiting';
    var query = QB.queryParam(d.domain, d.studentHash, d.sessionToken,
        d.applicantHash, 'foo', epaId, d.feedbackType,
        d.language, d.environment);

    $.ajax(query).done(function (result) {
        jitFeedbackResponses[epaId] = result;
        promise(result);
    });
};

var jitFeedbackResponses = {};

exports.getSupervisor = function (data, callbacks) {
    var successCallback = callbacks.onStudentModelRequestSuccess;
    var failureCallback = callbacks.onStudentModelRequestFailure;

    var students = [];

    var query = QB.EPASSQuery(data, 'portfolioaccess');
    query.success = function (body) {
        var access = JSON.parse(body);

        $.each(access.supervisees, function (idx, value) {
            students.push({ "hash": value.user.id, "name": value.user.name });
        });

        var promise = $.ajax(QB.smQuerySupervisor(data, 'supervisor', students));

        promise.done(function (result) {
            result.students = result.students.filter(function (student) {
                if (student.scores === undefined) {
                    return false;
                }
                return true;
            });
            successCallback(result);
        });
        promise.fail(function (error) {
            failureCallback(error);
        });
    };
    query.error = function (e) {
        console.log(e);
    };
    $.ajax(query);

};

var createEPAMap = function (currentData, capabilities) {
    var epaMap = {};
    var EPAKeys = Object.keys(JSON.parse(capabilities));
    var capabilityOffset = 0;
    $.each(currentData.roles, function (idx, value) {
        $.each(value.EPAs, function (idy, epa) {
            if (epaMap[epa.name]) {
                // name is already mapped
            } else {
                epaMap[epa.name] = EPAKeys[capabilityOffset];
                if (capabilityOffset == EPAKeys.length) return false;
                capabilityOffset++;
            }
        });
    });
    RH.requester.setEPAMap(epaMap);
};

exports.getFormData = function (data, formId) {
    var ePromise = $.ajax(QB.EPASSQuery(data, 'forms/' + formId));
    ePromise.done(function (form) {
        console.log(form);
    });
    ePromise.fail(function (error) {
        console.log(error);
    });
};

exports.getGeneral = function (data, callbacks) {
    var successCallback = callbacks.onStudentModelRequestSuccess;
    var failureCallback = callbacks.onStudentModelRequestFailure;

    var promise = $.ajax(QB.smQuery(data, 'currentperformance'));

    promise.done(function (currentData) {
        var ePromise = $.ajax(QB.EPASSQuery(data, 'capabilityrequests'));

        ePromise.done(function (capabilities) {
            createEPAMap(currentData, capabilities);
            var cap = JSON.parse(capabilities);
            var result = [];

            $.each(currentData.roles, function (idx, role) {
                $.each(role.EPAs, function (idy, epa) {
                    if (!containsEPA(result, epa)) {
                        result.push(createRowData(epa, cap, idy));
                    }
                });
            });
            successCallback(result);
        });
        ePromise.fail(function (error) {
            console.log(error);
            failureCallback(error);
        });
    });
    promise.fail(function (error) {
        console.log(error);
        failureCallback(error);
    });

    function containsEPA(epas, epa) {
        var containsEPA = false;
        $.each(epas, function (index, epaResult) {
            if (epaResult.epaId === epa.id) {
                containsEPA = true;
            }
        });
        return containsEPA;
    }

    function createRowData(epa, cap, colorIndex) {
        var capability = cap[epa.id];

        return {
            name: epa.name + ': ' + epa.description,
            epaName: RH.requester.getEPAMap()[epa.name],
            epaId: epa.id,
            colorIndex: colorIndex,
            passingScore: (data.domain === 'tt-ut') || (data.domain === 'tt-uu') ? 2 : 3,
            score: epa.level.self,
            requiredForms: 6,
            deliveredForms: epa.deliveredForms === undefined ? 'N/A' : epa.deliveredForms,
            entrustment: createEntrustmentInformation(capability, epa),
            competencies: createCompetencies(epa.performanceIndicators)
        };
    }

    function createEntrustmentInformation(capability, epa) {
        var capLevels = capability.levels;
        var currentLevel = epa.level.self;
        var maxLevel = Object.keys(capLevels)[Object.keys(capLevels).length - 1];
        var entrustment = {
            currentLevel: currentLevel,
            maxLevel: maxLevel,
            entLevel: 0,
            nextLevel: 0,
            allApproved: false,
            pending: false
        };

        if (!isAllApproved(capLevels)) {
            $.each(capLevels, function (index, level) {
                var status = level.status;
                if (status === 'approved') {
                    entrustment.entLevel = parseInt(index);
                } else if (status === 'pending') {
                    entrustment.entLevel = parseInt(index);
                    if (entrustment.entLevel >= currentLevel) {
                        entrustment.pending = true;
                    }
                } else if (status === 'declined') {
                    entrustment.entLevel = parseInt(index) - 1;
                }
            });
        } else {
            entrustment.allApproved = true;
            entrustment.entLevel = maxLevel;
        }

        if (currentLevel <= entrustment.entLevel) {
            entrustment.nextLevel = entrustment.entLevel + 1;
        } else {
            entrustment.nextLevel = currentLevel;
        }

        return entrustment;
    }

    function isAllApproved(capLevels) {
        var lastEntry = Object.keys(capLevels)[Object.keys(capLevels).length - 1];
        return capLevels[lastEntry].status === 'approved';
    }

    function createCompetencies(performanceIndicators) {
        var competencies = [];
        $.each(performanceIndicators, function (idz, competency) {
            var comp = {
                name: competency.name + ": " + competency.description,
                passingScore: 3,
                score: competency.level.self,
                'requiredForms': 0,
                'deliveredForms': 0
            };
            competencies.push(comp);
        });
        return competencies;
    }
};

exports.getTimeline = function (data, callbacks) {
    var passingScore = (data.domain === 'tt-ut') || (data.domain === 'tt-uu') ? 2 : 3;

    var successCallback = callbacks.onStudentModelRequestSuccess;
    var failureCallback = callbacks.onStudentModelRequestFailure;

    var configPromise = $.ajax(QB.EPASSQuery(data, 'configs'));
    configPromise.done(function (body) {
        var configs = JSON.parse(body);

        var promise = $.ajax(QB.smQuery(data, 'timeline'));
        promise.done(function (result) {
            var isNotNumeric = false;

            var epaValues = Object.keys(configs.EPA.levels);

            result.passingScore = passingScore;



            successCallback(result, epaValues, configs.EPA.shortlevels);

        });
        promise.fail(function (result) {
            failureCallback(result);
        })
    });
    configPromise.fail(function (result) {
        failureCallback(result);
    });
};

exports.getJitSupervisor = function (data, students, successCallback, failureCallback) {
    var query = QB.querySupervisorFromJitComponent(data, students);
    query.success = function (body, status, xhr) {
        successCallback(body);
    };
    query.error = failureCallback;
    $.ajax(query);
};
