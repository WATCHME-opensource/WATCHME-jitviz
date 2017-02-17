var Config = require('../widgets/configuration');
var VizApp = require('../widgets/app');
var i18n = require("../i18n");

var _MODE_EPA = 'epa';
var _MODE_PI = 'pi';

var _currentEducation;
var _userData;
var _epaMap;

exports.requester = {
    selectEducation: function (education) {
        _currentEducation = education;
    },
    getCurrentEducation: function () {
        return _currentEducation;
    },
    PR: function () {
        return Config.hasRoles(_currentEducation);
    },
    average: function () {
        return Config.hasAverage(_currentEducation)
    },
    term: function () {
        return Config.terminology(_currentEducation)
    },
    setUserData: function(userData) {
        _userData = userData;
    },
    getLanguage: function() {
        if(_userData && _userData.language) {
            return _userData.language;
        }
        return 'en';
    },
    getDefaultRoleName: function() {
        return i18n.tr(exports.requester.getLanguage(), "default_role_name");
    },
    getEPAMap: function() {
        return _epaMap;
    },
    setEPAMap: function( epaMap ) {
        _epaMap = epaMap;
    }
};

exports.currentPerformance = {
    _data: undefined,
    _selectedRoleIndex: undefined,
    _selectedEpaIndex: undefined,
    _mode: _MODE_EPA,
    restoreDefaults: function () {
        exports.currentPerformance._data = undefined;
        exports.currentPerformance._selectedRoleIndex = undefined;
        exports.currentPerformance._selectedEpaIndex = undefined;
        exports.currentPerformance._mode = _MODE_EPA;
    },
    isDataAvailable: function () {
        return exports.currentPerformance._data !== undefined;
    },
    requestData: function () {
        VizApp.requestCurrentPerformanceData(_userData);
    },
    requestJITData : function(epaId, promise) {
        VizApp.requestJitFeedbackData(_userData, epaId, promise);
    },
    setData: function (data) {
        exports.currentPerformance._data = data;
    },
    getRoles: function () {
        var roleNames = [];
        if (exports.currentPerformance._data.roles) {
            $.each(exports.currentPerformance._data.roles, function (idx, v) {
                roleNames.push(v.name);
            });
        }
        return roleNames;
    },
    getSelectedRoleIndex: function () {
        return exports.currentPerformance._selectedRoleIndex;
    },
    selectRoleAtIndex: function (index) {
        exports.currentPerformance._selectedRoleIndex = index;
        exports.currentPerformance._mode = _MODE_EPA;
    },
    isModeEpa: function () {
        return exports.currentPerformance._mode === _MODE_EPA;
    },
    isModePi: function () {
        return exports.currentPerformance._mode === _MODE_PI;
    },
    switchToModeEpa: function () {
        exports.currentPerformance._mode = _MODE_EPA;
    },
    getSelectedEpaIndex: function () {
        return exports.currentPerformance._selectedEpaIndex;
    },
    selectEpaAtIndex: function (index) {
        exports.currentPerformance._selectedEpaIndex = index;
        exports.currentPerformance._mode = _MODE_PI;
    },
    selectEpaWithId: function (id) {
        var index = 0;

        var epas=exports.currentPerformance._data.roles[exports.currentPerformance._selectedRoleIndex].EPAs;
        $.each(epas, function(epaIndex, epa) {
            if(epa.id === id){
                index = epaIndex;
            }
        });

        exports.currentPerformance._selectedEpaIndex = index;
        exports.currentPerformance._mode = _MODE_PI;
    },
    getChartData: function () {
        var category = [];
        var average = [];
        var personal = [];
        var selectedRole = exports.currentPerformance._data.roles[exports.currentPerformance._selectedRoleIndex];
        if (exports.currentPerformance.isModeEpa()) {
            var EPAs = selectedRole.EPAs;
            $.each(EPAs, function (idx, v) {
                category.push(v.name);
                average.push(v.level.group);
                personal.push(v.level.self);
            });
        } else {
            var PIs = selectedRole.EPAs[exports.currentPerformance._selectedEpaIndex].performanceIndicators;
            $.each(PIs, function (idx, v) {
                category.push(v.name);
                average.push(v.level.group);
                personal.push(v.level.self);
            });
        }
        return {
            categories: category,
            personalScores: personal,
            averageScores: average
        };
    },
    getEPAs: function () {
        var selected = {};
        var EPAs = exports.currentPerformance._data.roles[exports.currentPerformance._selectedRoleIndex].EPAs;
        $.each(EPAs, function (idx, v) {
            var subtasks = [];
            var PIs = v.performanceIndicators;
            $.each(PIs, function (idx, v) {
                subtasks.push({
                    description: v.description,
                    name: v.name,
                    id: v.name.replace(/ /g,'')
                });
            });
            var value = {
                name: v.name,
                description: v.description,
                subTasks: subtasks,
                id: v.id
            };

            selected[v.name] = value;
        });
        return selected;
    },
    getFooterData: function () {
        var footerData = [];
        if (exports.currentPerformance.isModeEpa()) {
            var EPAs = exports.currentPerformance._data.roles[exports.currentPerformance._selectedRoleIndex].EPAs;
            $.each(EPAs, function (epaIndex, epa) {
                footerData.push({ name: epa.name, id:epa.id, description: epa.description, numberOfPIs: epa.performanceIndicators.length });
            });
        } else {
            var PIs = exports.currentPerformance._data.roles[exports.currentPerformance._selectedRoleIndex].EPAs[exports.currentPerformance._selectedEpaIndex].performanceIndicators;
            $.each(PIs, function (piIndex, pi) {
                pi.id = replaceSpecialCharacters(pi.name);
                footerData.push({ name: pi.name, id:pi.id, description: pi.description });
            });
        }
        return footerData;
    },
    getDragBehaviourData: function () {
        var axis = [];
        var EPAs = exports.currentPerformance._data.roles[exports.currentPerformance._selectedRoleIndex].EPAs;
        $.each(EPAs, function (piIndex, pi) {
            axis.push({ name: pi.name, recommendation: pi.level.recommendation });
        });
        return { numberOfSeries: exports.requester.average() ? 2 : 1, PIs: axis }
    }
};

exports.general = {
    isDataAvailable: function () {
        return exports.general._data !== undefined;
    },
    getOverviewData: function() {
        return exports.general._data;
    },
    requestData: function () {
        VizApp.requestGeneralOverviewData(_userData);
    },
    setData: function (data) {
        exports.general._data = data;
    }
};

exports.supervisor = {
    _data:undefined,
    _students:undefined,
    isDataAvailable: function () {
        return exports.supervisor._data !== undefined;
    },
    getChartData: function() {
        var xs = {};
        var columns = [];
        var colors = {};

            _students = exports.supervisor._data.students;

            aggregateScores();

            $.each(_students, function (index, student) {
                var key = 'x' + index;
                xs[student.hash] = key;
                if (!columns[key]) {
                    var dates = [];
                    var scores = [];
                    dates.push(key);
                    scores.push(student.hash);
                    $.each(student.scores, function (index, score) {
                        dates.push(score.date);
                        scores.push(score.score);
                    });
                    columns.push(dates);
                    columns.push(scores);
                    colors[student.hash] = Config.palette(index).primary;
                }
            });

        return {
            xs: xs,
            columns: columns,
            type: 'spline',
            colors: colors
        };

        function aggregateScores() {
            $.each (_students, function(index, student){
                var scoresPerDate = [];
                $.each(student.scores, function(index, level){
                    if(scoresPerDate[level.date] === undefined) {
                        scoresPerDate[level.date] = [];
                    }
                    scoresPerDate[level.date].push(level.score)
                });

                var scores = [];
                $.each (Object.keys(scoresPerDate), function(index, key){
                    var aggregatedScore = scoresPerDate[key].reduce(function(prev, curr){
                        return prev + curr;
                    }, 0) / scoresPerDate[key].length;

                    scores.push({date:key, score:aggregatedScore});
                });
                student.scores = scores;
            })
        }
    },

    getStudents: function() {
        return _students;
    },
    requestData: function () {
        VizApp.requestSupervisorData(_userData);
    },
    setData: function (data) {
        exports.supervisor._data = data;
    },
    getFooterData: function () {
        var footerData = [];

        var students = exports.supervisor._data.students;
        $.each(students, function (index, student) {
            footerData.push({ name: student.name, hash: student.hash });
        });

        return footerData;
    }
};

exports.timeline = {
    _data: undefined,
    _levels: undefined,
    _sortedLevels: undefined,
    _sortedPILevels: [],
    _levelTexts: undefined,
    _selectedRoleIndex: undefined,
    _selectedEpaIndex: undefined,
    _mode: _MODE_EPA,
    _passingScores: {},

    restoreDefaults: function () {
        exports.timeline._data = undefined;
        exports.timeline._selectedRoleIndex = undefined;
        exports.timeline._selectedEpaIndex = undefined;
        exports.timeline._mode = _MODE_EPA;
    },
    levelFormat: function () {
            return function (levelValue) {
                return exports.timeline._levelTexts[levelValue];
            };
    },
    isDataAvailable: function () {
        return exports.timeline._data !== undefined;
    },
    requestData: function () {
        VizApp.requestTimelineData(_userData);
    },
    setData: function (data) {
        exports.timeline._data = data;
    },
    setLevels: function(levels) {
        exports.timeline._levels = levels;
    },
    setLevelTexts: function(levelTexts) {
        exports.timeline._levelTexts = levelTexts;
    },
    getLevels: function() {
        return exports.timeline._levels;
    },
    getLevelTexts: function() {
        return exports.timeline._levelTexts;
    },
    getRoles: function () {
        var roleNames = [];
        var roles = exports.timeline._data.roles;
        if (roles) {
            $.each(roles, function (roleIndex, role) {
                roleNames.push(role.name);
            });
        }
        return roleNames;
    },
    getSelectedRoleIndex: function () {
        return exports.timeline._selectedRoleIndex;
    },
    selectRoleAtIndex: function (index) {
        exports.timeline._selectedRoleIndex = index;
        exports.timeline._mode = _MODE_EPA;
    },
    isModeEpa: function () {
        return exports.timeline._mode === _MODE_EPA;
    },
    isModePi: function () {
        return exports.timeline._mode === _MODE_PI;
    },
    switchToModeEpa: function () {
        exports.timeline._mode = _MODE_EPA;
    },
    getSelectedEpaIndex: function () {
        return exports.timeline._selectedEpaIndex;
    },
    getSelectedEpaId: function() {
       return exports.timeline._data.roles[exports.timeline._selectedRoleIndex].EPAs[exports.timeline._selectedEpaIndex].id;
    },
    getPassingScores: function () {
        return exports.timeline._passingScores;
    },
    selectEpaAtIndex: function (index) {
        exports.timeline._selectedEpaIndex = index;
        exports.timeline._mode = _MODE_PI;
    },
    selectEpaWithId: function (id) {
        var index = 0;

        var epas=exports.timeline._data.roles[exports.timeline._selectedRoleIndex].EPAs;
        $.each(epas, function(epaIndex, epa) {
            if(epa.id === id){
                index = epaIndex;
            }
        });

        exports.timeline._selectedEpaIndex = index;
        exports.timeline._mode = _MODE_PI;
    },
    getEPANameFromId: function(epaId) {
        var epas = exports.timeline._data.roles[exports.timeline._selectedRoleIndex].EPAs;
        var name = undefined;

        $.each(epas, function(index, epa) {
            if(epa.id === epaId) {
                name = epa.name;
            }
        });

        return name;
    },
    getChartData: function () {
        var xs = {};
        var columns = [];
        var colors = {};
        if (exports.timeline.isModeEpa()) {
            var EPAs = exports.timeline._data.roles[exports.timeline._selectedRoleIndex].EPAs;

            $.each(EPAs, function (epaIndex, epa) {
                exports.timeline._passingScores['epa-'+epa.id] = exports.timeline._data.passingScore;

                var key = 'x' + epaIndex;
                xs['epa-'+epa.id] = key;
                if (!columns[key]) {
                    var dates = [];
                    var scores = [];
                    var multiScoreDates = {};
                    dates.push(key);
                    scores.push('epa-'+epa.id);
                    $.each(epa.levels, function (levelIndex, level) {
                        if ( dates.indexOf( level.date ) == -1 ) {
                            dates.push(level.date);
                            scores.push(level.score);
                        } else {
                            var levelScore = multiScoreDates[ level.date ];
                            if ( !levelScore ) {
                                levelScore = [scores[dates.indexOf( level.date )]];
                                multiScoreDates[ level.date ] = levelScore;
                            }
                            levelScore.push(level.score);
                        }
                    });
                    // update scores with multiple entries
                    $.each(multiScoreDates, function(key, levelScore){
                        var sum = 0;
                        $.each(levelScore, function(idx, score){
                            sum += score;
                        });
                        scores[ dates.indexOf(key) ] = sum / levelScore.length;
                    });

                    columns.push(dates);
                    columns.push(scores);
                    colors['epa-'+epa.id] = Config.palette(epaIndex).primary;
                }
            });
        } else {
            var PIs = exports.timeline._data.roles[exports.timeline._selectedRoleIndex].EPAs[exports.timeline._selectedEpaIndex].performanceIndicators;
            $.each(PIs, function (piIndex, pi) {
                var piKey = 'epa-'+replaceSpecialCharacters(pi.name)+piIndex;
                var key = 'x-pi' + piIndex;
                xs[piKey] = key;
                if (!columns[key]) {
                    var dates = [];
                    var scores = [];
                    var multiScoreDates = {};
                    dates.push(key);
                    scores.push(piKey);
                    $.each(pi.levels, function (levelIndex, level) {
                        if (dates.indexOf( level.date ) == -1 ) {
                            dates.push(level.date);
                            scores.push(level.score);
                        } else {
                            var levelScore = multiScoreDates[ level.date ];
                            if ( !levelScore ) {
                                levelScore = [scores[dates.indexOf( level.date )]];
                                multiScoreDates[ level.date ] = levelScore;
                            }
                            levelScore.push(level.score);
                        }
                    });

                    // update scores with multiple entries
                    $.each(multiScoreDates, function(key, levelScore){
                        var sum = 0;
                        $.each(levelScore, function(idx, score){
                            sum += score;
                        });
                        scores[ dates.indexOf(key) ] = sum / levelScore.length;
                    });
                    columns.push(dates);
                    columns.push(scores);
                    colors[piKey] = Config.palette(exports.timeline._selectedEpaIndex, piIndex);
                }
            });
        }

        return {
            xs: xs,
            columns: columns,
            type: 'spline',
            colors: colors
        }
    },
    getEPAs: function () {
        var selected = {};
        var EPAs = exports.timeline._data.roles[exports.timeline._selectedRoleIndex].EPAs;
        $.each(EPAs, function (idx, v) {
            var subtasks = [];
            var PIs = v.performanceIndicators;
            $.each(PIs, function (idx, v) {
                subtasks.push({
                    description: v.description,
                    name: v.name
                });
            });
            var value = {
                name: v.name,
                description: v.description,
                subTasks: subtasks,
                id: v.id
            };
            selected[v.name] = value;
        });
        return selected;
    },

    getEpaLevelsSortedByDate: function() {
        if (exports.timeline._sortedLevels !== undefined) {
            return exports.timeline._sortedLevels;
        }

        var EPAs = exports.timeline._data.roles[exports.timeline._selectedRoleIndex].EPAs;

        exports.timeline._sortedLevels = EPAs.map(function(epa){
            return {id: epa.id, name:epa.name, levels: sortFormsByDate(epa.levels)};
        });

        return exports.timeline._sortedLevels;
    },

    getPILevelsSortedByDate: function (epaId) {
        if(exports.timeline._sortedPILevels[epaId] !== undefined) {
            return exports.timeline._sortedPILevels[epaId];
        }

        var EPAs = exports.timeline._data.roles[exports.timeline._selectedRoleIndex].EPAs;

        $.each(EPAs, function(index, epa) {
            var PIs = epa.performanceIndicators

            var sortedPIlevels = PIs.map(function(pi, index){
                pi.id = replaceSpecialCharacters(pi.name)+index;
                return {id: pi.id, name: pi.name, levels: sortFormsByDate(pi.levels)};
            });

            exports.timeline._sortedPILevels[epa.id] = sortedPIlevels;
        });

        return exports.timeline._sortedPILevels[epaId]
    },

    getFooterData: function () {
        var footerData = [];
        if (exports.timeline.isModeEpa()) {
            var EPAs = exports.timeline._data.roles[exports.timeline._selectedRoleIndex].EPAs;
            $.each(EPAs, function (epaIndex, epa) {
                footerData.push({ name: epa.name, id: epa.id, description: epa.description, numberOfPIs: epa.performanceIndicators.length });
            });
        } else {
            var PIs = exports.timeline._data.roles[exports.timeline._selectedRoleIndex].EPAs[exports.timeline._selectedEpaIndex].performanceIndicators;
            $.each(PIs, function (piIndex, pi) {
                pi.id = replaceSpecialCharacters(pi.name)+piIndex;
                footerData.push({ name: pi.name, id: pi.id, description: pi.description });
            });
        }
        return footerData;
    },
    getFormData: function(formId) {
        VizApp.requestFormData(_userData, formId);
    }
};

function replaceSpecialCharacters(string) {
    return string.replace(/[`~!@#$%^&*()_|+\-=?;:'" ,.<>\{\}\[\]\\\/]/gi, '');
}

function sortFormsByDate(forms){
    levels = {};
    $.each(forms, function(index, form) {
        if(levels[form.date] === undefined) {
            levels[form.date] = [];
        }
        levels[form.date].push(form);
    });
    return levels;
}
