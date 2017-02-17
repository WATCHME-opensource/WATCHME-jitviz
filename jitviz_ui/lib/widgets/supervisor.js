var DH = require('../widgets/DataHandler');
var Common = require('../widgets/common');
var Config = require('../widgets/configuration');
var Pop = require('../widgets/Popup');
var i18n = require("../i18n");

exports.generate = function (element) {
    _containerElement = element;
    _generateTabContentContainer(element);
    _generateContent();
};

exports.displayError = function (errorMessage) {
    $('#supervisorLoading').hide();
    var errorContainer = $('#supervisorErrorMessage');
    errorContainer.text(i18n.tr(DH.requester.getLanguage(), "error_retrieving_data") + ". (" + errorMessage + ")");
    errorContainer.show();
};

var _generateTabContentContainer = function (element) {
    if (element.find('#supervisor').length == 0) {
        var elm = $('<div class="tabContent" id="supervisor">');
        element.append(elm);
        elm.append(
            $('<div id="supervisorLoading" class="loading">')
                .append($('<img src="images/loading.gif" />'))
                .append('<span>' + i18n.tr(DH.requester.getLanguage(), "loading") + '</span>')
        );
        elm.append($('<p class="error" id="supervisorErrorMessage">'));
        elm.append(
            $('<div id="supervisorChart">')
                .append($('<div class="navigateTop">'))
                .append($('<div class="navigation">'))
                .append($('<div id="chart">'))
                .append($('<div class="viz-legend">'))
        );
    }
};

var _generateLineHover = function (lineNames, chart, footer) {
    $.each($('.c3-line'), function (index, line) {
        $(line).attr('style', $(line).attr('style') + " stroke-width:3px;");

    });
    var callBackMouseOver=[];
    var callBackMouseOut=[];
    $.each($('.c3-chart-line'), function (index, line) {
        $(line).attr('style', 'opacity: 1;');


        var students = DH.supervisor.getStudents();

        $.each(students, function(index, student) {
            if($(line).attr('class').indexOf(student.hash) !== -1) {
                $(line).attr('data-id',student.hash);
                callBackMouseOver.push(function() {
                    $('.c3-text-epa-'+student.hash).show();
                });
                callBackMouseOut.push(function() {
                    $('.c3-text-epa-'+student.hash).hide();
                });
            }
        });

        $(line).on('click', function(event) {
            var students = DH.supervisor.getStudents();

            var hash = undefined;
            $.each(students, function(index, student) {
                if($(event.currentTarget).attr('class').indexOf(student.hash)!==-1) {
                    viz_open_portfolio(student.hash);
                }
            });
        });

        Common.focusBehavior(chart, $(line), lineNames[index], true, callBackMouseOver[index], callBackMouseOut[index]);
        Common.footerFocus($(line), index, footer);
    });
};

var _generateContent = function () {
    var $supervisorError = $('#supervisorErrorMessage');
    var $supervisorLoading = $('#supervisorLoading');
    var $supervisorChart = $('#supervisorChart');

    $supervisorError.hide();

    if (DH.supervisor.isDataAvailable()) {
        logObject = {
            component : 'VIZ',
            event: 'load-supervisor'
        };
        try {
            jitviz_log('wm_log_supervisor', logObject);
        } catch(e) {
            console.log(e, logObject);
        }

            $supervisorChart.show();
            $supervisorLoading.hide();
            _generateChart();

    } else {
        $supervisorChart.hide();
        $supervisorLoading.show();
        DH.supervisor.requestData();
    }
};

var _generateChart = function () {
    var data = DH.supervisor.getChartData();
    var chart = _createSupervisorChart(data);

    var footer = _generateFooter(chart);

    _generateLineHover(Object.keys(chart.data.colors()), chart, footer);
};

var _createSupervisorChart = function (data) {
    $('#chart').text('');

    var chart = c3.generate(_createChartData(data));

    _createZoom(chart);
    _addNameLabels(data);

    return chart;
};

var _createChartData = function(data) {
    var tick = Common.dateAxis.calculateTickerValues(data);

    return {
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
        axis: {
            y: {
                label: { text: "Level", position: "outer-middle" },
                tick: {
                    values: [0, 1, 2, 3, 4, 5]
                },
                min : -0.1,
                max : 5.1
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
            enabled: true
        }
    };
};

var _createZoom = function(chart) {
    var zoomSelect = $('<select>');

    var selectValues = [{ value: 'S', title: '6 months' }, { value: 'Q', title: '3 months' }, { value: 'M', title: '1 month' }, { value: 'W', title: 'week' }];
    $.each(selectValues, function (idx, val) {
        zoomSelect.append($('<option>').attr('value', val.value).text(val.title));
    });
    zoomSelect.on('change', function () {
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

    $('#zoom').text('').append('Zoom ').append(zoomSelect);
};

var _addNameLabels = function(data) {
    var studentPoints = data.columns.filter(function(column, index){return index % 2});
    $.each(data.colors, function(student, color) {
        var $startOfLine = $('.c3-circles-'+student+' .c3-circle-0');
        d3.select('.c3-chart-texts').append("text")
            .attr("x", parseInt($startOfLine.attr('cx'),10)-20)
            .attr("y", parseInt($startOfLine.attr('cy'), 10) + adjustPosition(student, studentPoints))
            .style("fill", ''+color)
            .style("font-size", "18px")
            .classed("top", true)
            .attr('class', 'c3-text student-label c3-text-epa-'+student)
            .text(getStudentName(DH.supervisor.getStudents(), student));
        $('.c3-text-epa-'+student).hide();
    });

    function getStudentName(students, hash) {
        var name;
        $.each(students, function(index, student){
            if(student.hash === hash) {
                name = student.name;
            }
        });
        return name;
    }

    //$('student-label').hide();
    function adjustPosition(student, studentPoints) {
        var adjustment = 0;
        $.each(studentPoints, function(index, studentPoint) {
            if(studentPoint[0] === student) {
                adjustment =  studentPoint[1] - studentPoint[2] > 0 ? -10 : 20;
            }
        });
        return adjustment;
    }
};

var _generateFooter = function (chart) {
    var data = DH.supervisor.getFooterData();
    return _generateFooterHtml(data, chart, $('#supervisor'));
};

var _generateFooterHtml = function (footerData, chart, selected) {
    var div = $('<div class="legend">');
    var width = 100 / footerData.length;
    var footer = [];

    $.each(footerData, function (i, student) {
        var span = $('<span>').width(width + "%");

        var color=Config.palette(i).primary;

        span.addClass("clickable");
        span.attr('data-id', student.hash);
        span.html($('<i class="icon-doc-text"></i><p>' + student.name + '</p>'));
        var pi = $("<div class='toggle open-portfolio' data-id="+student.hash+"'> Open Student Portfolio </div>");
        pi.attr('style', 'background:' + color);
        span.append(pi);

        span.attr('style', 'color:' + color).width(width + "%");

        footer.push(span);
        Common.footerFocus(span, i, footer);
        Common.focusBehavior(chart, span, student.hash, true, onMouseOver, onMouseOut);
        div.append(span);

        function onMouseOver() {
            $('.c3-text-epa-'+student.hash).show();
        }
        function onMouseOut() {
            $('.c3-text-epa-'+student.hash).hide();
        }
    });
    selected.find('.viz-legend').text('').append(div);

    $('.open-portfolio').on('click', function (event) {
        viz_open_portfolio($(event.currentTarget).data('id'));
    });
    return footer;
};