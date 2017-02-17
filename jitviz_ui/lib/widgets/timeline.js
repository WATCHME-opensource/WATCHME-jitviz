var DH = require('../widgets/DataHandler');
var Common = require('../widgets/common');
var Config = require('../widgets/configuration');
var Pop = require('../widgets/Popup');
var i18n = require("../i18n");

var _containerElement;

exports.displayError = function (errorMessage) {
    $('#timelineLoading').hide();
    var errorContainer = $('#timelineErrorMessage');
    errorContainer.text(i18n.tr(DH.requester.getLanguage(), "error_retrieving_data") + ". (" + errorMessage + ")");
    errorContainer.show();
};

exports.generate = function (element) {
    _containerElement = element;
    _generateTabContentContainer(element);
    _generateHeader();
    _generateContent();
};

var _regenerate = function () {
    exports.generate(_containerElement);
};

var _onEpaSelected = function (id) {
    DH.timeline.selectEpaWithId(id);
    _regenerate();
};

var _generateTabContentContainer = function (element) {
    if (element.find('#timeline').length == 0) {
        var elm = $('<div class="tabContent" id="timeline">');
        element.append(elm);
        elm.append(
            $('<div id="timelineLoading" class="loading">')
                .append($('<img src="images/loading.gif" />'))
                .append('<span>' + i18n.tr(DH.requester.getLanguage(), "loading") + '</span>')
            );
        elm.append($('<p class="error" id="timelineErrorMessage">'));
        elm.append(
            $('<div id="timelineChart">')
                .append($('<div class="navigateTop">'))
                .append($('<div class="navigation">'))
                .append($('<div id="chart">'))
                .append($('<div id="zoom" align="right">'))
                .append($('<div class="viz-legend">'))
            );
    }
};

var _generateHeader = function () {
    if (DH.timeline.isDataAvailable()) {
        if (DH.timeline.getSelectedRoleIndex() === undefined) {
            DH.timeline.selectRoleAtIndex(0);
        }
        var roles = DH.requester.PR() ? DH.timeline.getRoles() : [i18n.tr(DH.requester.getLanguage(), 'default_role_name')];
        var selectedRole = roles ? roles[DH.timeline.getSelectedRoleIndex()] : 0;
        var epas = DH.timeline.isModePi() ? DH.timeline.getEPAs() : undefined;
        var selectedEpa = epas ? Object.keys(epas)[DH.timeline.getSelectedEpaIndex()] : undefined;
        var onRoleSelected = function (index, role) {
            DH.timeline.selectRoleAtIndex(index);
            _regenerate();
        };
        Common.generateHeader(_containerElement, roles, selectedRole, epas, selectedEpa, onRoleSelected, _onEpaSelected, 'timeline');
    }
};

var _generateContent = function () {
    var $timelineErrorMessage = $('#timelineErrorMessage');
    $timelineErrorMessage.hide();
    if (DH.timeline.isDataAvailable()) {
        logObject = {
            component : 'VIZ',
            event: 'load-timeline'
        };
        try {
            jitviz_log('wm_log_timeline', logObject);
        } catch(e) {
            console.log(e, logObject);
        }

        var roles = DH.timeline.getRoles();
        if (roles && roles.length > 0) {
            $('#timelineChart').show();
            $('#timelineLoading').hide();
            _generateChart();
        } else {
            $timelineErrorMessage.html(i18n.tr(DH.requester.getLanguage(), "no_data_available"));
            $timelineErrorMessage.show();
            $('#timelineLoading').hide();
        }
    } else {
        $('#timelineChart').hide();
        $('#timelineLoading').show();
        DH.timeline.requestData();
    }
};

var _generateChart = function () {
    $('#navigation').text('');
    var data = DH.timeline.getChartData();
    var chart = _createTimelineChart(data);
    var footer = _generateFooter(chart);
    var lines = [];
    $.each(data.xs, function (k, v) {
        lines.push(k);
    });
    _generateLineHover(lines, chart, footer);
    _generatePointHoverAndClick(lines, data);
};

var _createTimelineChart = function (data) {
    $('#chart').text('');
    // if some data points lies in a different year
    // that the current - the format should
    // include year
    var format = '%b';
    var thisYear = new Date().getYear();
    var tick = Common.dateAxis.calculateTickerValues(data);

    $.each(data.columns, function (i, val) {
        if (i % 2 == 0) {
            for (j = 1; j < val.length; j++) {
                if (thisYear != new Date(val[j]).getYear()) {
                    // there is a year different from current year
                    format = '%b %Y';
                    return false;
                }
            }
        }
    });

    var yAxisLabels = DH.timeline.getLevels();

    var chartData = {
        bindto: '#chart',
        data: data,
        tooltip: {
            show: false
        },
        point: {
            show: true,
            r: 5,
            focus: {
                expand: {
                    enabled: false
                }
            }
        },
        grid: {
            y: {
                lines: calculatePassingScoreLine()
            }
        },
        axis: {
            y: {
                label: { text: i18n.tr(DH.requester.getLanguage(), 'level'), position: "outer-middle" },
                tick: {
                    values: yAxisLabels,
                    format: DH.timeline.levelFormat()
                },
                min: 0,
                max: (yAxisLabels.length)
            },
            x: {
                type: 'timeseries',
                tick: {
                    values: tick.values,
                    format: tick.format
                },
                min: tick.min,
                max: tick.max
            }
        },
        legend: {
            show: false
        },
        zoom: {
            enabled: true,
            onzoom: function (domain) {
                // do something with domain, which is the domain after zoomed
            }
        }
    };

    function calculatePassingScoreLine(){

        var gridValues = [];
        $.each(DH.timeline.getPassingScores(), function(epaId, score) {
            gridValues.push({value:score, text:i18n.tr(DH.requester.getLanguage(), "passing_score"), class:'passing-score passing-score-'+epaId});
        });
        return gridValues;
    }

    var chart = c3.generate(chartData);
    // hide graphs in sub chart
    var chartLines = $('.c3-chart-lines');
    if (chartLines.size() > 1) {
        $(chartLines[1]).hide();
    }

    $('.c3-ygrid-line').hide();

    var zoomSelect = $('<select>');
    var selectValues = [{ value: 'S', title: '6 months' }, { value: 'Q', title: '3 months' }, { value: 'M', title: '1 month' }, { value: 'W', title: 'week' }];
    $.each(selectValues, function (idx, val) {
        zoomSelect.append($('<option>').attr('value', val.value).text(val.title));
    });
    zoomSelect.on('change', function (e) {
        var range = chart.zoom();
        var highest, lowest;
        if (range[0].getTime() == range[1].getTime()) {
            // no selection. Find highest point
            highest = new Date(0);
            $.each(chart.xs(), function (k, v) {
                var candidate = v[v.length - 1];
                if (candidate.getTime() > highest.getTime()) {
                    highest = candidate;
                }
            });
        } else {
            // selection
            highest = range[1];
        }
        if (this.value == 'S') {
            chart.unzoom();
            return;
        } else if (this.value == 'M') {
            lowest = new Date(1900 + highest.getYear(), highest.getMonth() - 1, highest.getDate());
        } else if (this.value == 'W') {
            lowest = new Date(1900 + highest.getYear(), highest.getMonth(), highest.getDate() - 7);
        } else if (this.value == 'Q') {
            lowest = new Date(1900 + highest.getYear(), highest.getMonth() - 3, highest.getDate());
        }
        chart.zoom([lowest, highest]);
    });
    return chart;
};

var _generateLineHover = function (lineNames, chart, footer) {
    $.each($('.c3-line'), function (i, v) {
        $(v).attr('style', $(v).attr('style') + " stroke-width:3px;");
    });
    $.each($('.c3-chart-line'), function (i, v) {
        $(v).attr('style', 'opacity: 1;');
        var isModeEpa = DH.timeline.isModeEpa();

        Common.focusBehavior(chart, $(v), extractEpaId(v).name, isModeEpa);
        Common.footerFocus($(v), i, footer);

        $(v).on("click", function () {
            if (isModeEpa) {
                var extractedId = extractEpaId(v).id;
                logObject = {
                    component : 'VIZ',
                    event: 'click-epa-line',
                    epaId: extractedId
                };
                try {
                    jitviz_log('wm-log-timeline', logObject);
                } catch(e) {
                    console.log(e, logObject);
                }
                _onEpaSelected(extractedId);
            }
        });
    });

    function extractEpaId(element) {
        var classes = $(element).attr('class').split(' ');
        var epa = {};
        $.each(classes, function(index, elementClass){
            if(elementClass.indexOf('epa') > -1) {
                var classParts = elementClass.split('-');
                epa.id = classParts[classParts.length -1];
                epa.name = 'epa-'+epa.id;
            }
        });
        return epa;
    }
};

var _generatePointHoverAndClick = function (lines, data) {
    $.each(lines, function (lineIndex, line) {
        var range = data.xs[line];
        var rangeDef;
        var values;
        var isModeEpa = DH.timeline.isModeEpa();

        $.each(data.columns, function (columnIndex, column) {
            if (column[0] == range) {
                rangeDef = column;
            }
            if (column[0] == line) {
                values = column;
            }
        });

        $.each($('.c3-circles-' + line + ' .c3-shape'), function (circleIndex, circle) {
            var targetDate;
            var current;

            $(circle).on("mouseover", function (e) {

                current = getCurrent(circle);
                targetDate = getDateForCircle(sortFormsByDate(current.levels), circleIndex);

                createPopup(e,targetDate, current);

            }).on("click", function (e) {
                logObject = {
                    component : 'VIZ',
                    event: 'click-timeline-point',
                    pointDate: targetDate,
                    epaId: current.id,
                    epaName: current.name
                };
                try {
                    jitviz_log('wm_log_timeline', logObject);
                } catch(e) {
                    console.log(e, logObject);
                }
                console.log (targetDate, current);
                createStickyPopup(e,targetDate, current);
                e.stopPropagation();

                $('.go-to-submission').on('click', function(e){
                    logObject = {
                        component : 'VIZ',
                        event: 'open-submission',
                        submissionId: $(e.target).data('submission-id')
                    };
                    try {
                        jitviz_log('wm_log_timeline', logObject);
                    } catch(e) {
                        console.log(e, logObject);
                    }
                    viz_open_form($(e.target).data('submission-id'));
                });
            }).on("mouseout", function (e) {
                Pop.hidePopup();
            });
        });

        function createPopup(e, targetDate, current) {
            var tasks = getTasks(targetDate, current);

            var popupString = "";

            $.each(tasks, function(index, task){
                popupString += '<hr>'+ task.name + '<br><hr>' +task.formCount+i18n.tr(DH.requester.getLanguage(), 'forms_completed');
            });


            Pop.showPopup(e , targetDate, popupString);
        }

        function createStickyPopup(e,targetDate, current) {
            var tasks = getTasks(targetDate, current);
            var popupString = "";
            $.each(tasks, function(index, tasks){
                console.log(index);
                if(index === 0) {
                    popupString += '<div><div class="task-name" style="font-weight:bold"><hr>' + tasks.name + '</div><div class="task-info" style="display:block; margin:5px">';
                } else {
                    popupString += '<div><div class="task-name" style="cursor:pointer"><hr>' + tasks.name + '</div><div class="task-info" style="display:none; margin:5px">';
                }
                $.each( tasks.forms, function(index, task){
                    if(isModeEpa && task.sentiment !== undefined) {
                        popupString += task.sentiment + '<br>';
                    }
                    popupString += "<button class='go-to-submission' type='button' data-submission-id="+task.submissionId+">"+ i18n.tr(DH.requester.getLanguage(), 'go_to_submission', {number: task.submissionId}) +"</button><br>";
                });
                popupString += '</div></div>';

            });

            Pop.showPopup(e,targetDate,popupString);
            Pop.stick();

            $('.task-name').on('click', function(event){
                $('.task-info').hide();
                $('.task-name').css('font-weight', 'normal');
                $('.task-name').css('cursor', 'pointer');
                $(event.target).css('font-weight', 'bold');
                $(event.target).css('cursor', 'default');
                $(event.target).parent().find('.task-info').show();

            });
        }

        function getTasks (targetDate, current) {
            var sortedLevels;
            if(!DH.timeline.isModeEpa()) {
                sortedLevels = DH.timeline.getPILevelsSortedByDate(DH.timeline.getSelectedEpaId());
            } else{
                sortedLevels = DH.timeline.getEpaLevelsSortedByDate();
            }

            var average = getCurrentAverageForTargetDate(targetDate, current);

            return sortedLevels.map(function(task){
                if(task.levels[targetDate]!== undefined) {
                    var taskAverage = task.levels[targetDate].reduce(function(previous, level){return previous + level.score}, 0);
                    taskAverage = (taskAverage/task.levels[targetDate].length).toFixed(1);

                    if(taskAverage === average) {
                        return  {id: task.id, name: task.name, formCount: task.levels[targetDate].length, forms: task.levels[targetDate]}
                    }
                }
            }).filter(function(epa){
                return epa !== undefined;
            });
        }

        function getCurrentAverageForTargetDate(targetDate, current) {
            var sortedLevels;
            if(!isModeEpa) {
                sortedLevels = DH.timeline.getPILevelsSortedByDate(DH.timeline.getSelectedEpaId());
            } else {
               sortedLevels = DH.timeline.getEpaLevelsSortedByDate();
            }


            var average = 0;
            $.each(sortedLevels, function(index, task){
                if(task.id === current.id) {
                    average = task.levels[targetDate].reduce(function(previous, level){return previous + level.score}, 0);
                    average = (average/task.levels[targetDate].length).toFixed(1);
                }
            });

            return average;
        }

        function getCurrent(circle){
            if(!DH.timeline.isModeEpa()){
                var selectedEpa = DH.timeline.getSelectedEpaIndex();
                var PIs = DH.timeline._data.roles[DH.timeline._selectedRoleIndex].EPAs[selectedEpa].performanceIndicators;

                var currentPi = undefined;
                $.each(PIs, function(piIndex, pi){
                    var circleClasses = $(circle).parent().attr('class');
                    if(circleClasses.indexOf(pi.id)!== -1) {
                        currentPi = pi;
                    }
                });
                return currentPi;
            } else {
                var circleClasses = $(circle).parent().attr('class');
                var EPAs = DH.timeline._data.roles[DH.timeline._selectedRoleIndex].EPAs;

                var currentEpa = undefined;
                $.each(EPAs, function(epaIndex, epa) {
                    if(circleClasses.indexOf('epa-'+epa.id)!== -1) {
                        currentEpa = epa;
                    }
                });

                return currentEpa;
            }
        }

        function getDateForCircle(sortedLevels, circleIndex) {
            return Object.keys(sortedLevels)[circleIndex];
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
    });
};

var _generateFooter = function (chart) {
    var data = DH.timeline.getFooterData();
    var isModeEpa = DH.timeline.isModeEpa();
    var selectedEpaIndex = DH.timeline.getSelectedEpaIndex();
    return Common.generateFooter(data, isModeEpa, _onEpaSelected, selectedEpaIndex, chart, $('#timeline'), 'timeline');
};
