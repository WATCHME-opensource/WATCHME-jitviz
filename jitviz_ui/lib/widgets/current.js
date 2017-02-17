var DH = require('../widgets/DataHandler');
var Pop = require('../widgets/Popup');
var Drag = require('../widgets/DragSnap');
var Common = require('../widgets/common');
var Config = require('../widgets/configuration');
var Radar = require('../widgets/RadarChart');
var i18n = require("../i18n");

var _currentDiagram = 'radar';
var _containerElement;

var _onEpaSelected = function (id) {
    DH.currentPerformance.selectEpaWithId(id);
    _regenerate();
};

exports.displayError = function (errorMessage) {
    $('#currentPerformanceLoading').hide();
    var errorContainer = $('#currentPerformanceErrorMessage');
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

var _generateTabContentContainer = function (element) {
    if (element.find('#current').length == 0) {
        var elm = $('<div class="tabContent" id="current">');
        element.append(elm);
        elm.append(
            $('<div id="currentPerformanceLoading" class="loading">')
                .append($('<img src="images/loading.gif" />'))
                .append('<span>' + i18n.tr(DH.requester.getLanguage(), "loading") + '</span>')
            );
        elm.append($('<p class="error" id="currentPerformanceErrorMessage">'));
        elm.append(
            $('<div id="currentPerformanceChart">')
                .append($('<div class="navigateTop">'))
                .append($('<div id="chartOptions">'))
                .append($('<div id="radarChart" class="centered">'))
                .append($('<div class="viz-legend">'))
            );
    }
};

var _generateHeader = function () {
    if (DH.currentPerformance.isDataAvailable()) {
        if (DH.currentPerformance.getSelectedRoleIndex() === undefined) {
            DH.currentPerformance.selectRoleAtIndex(0);
        }
        var roles = DH.requester.PR() ? DH.currentPerformance.getRoles() : [DH.requester.getDefaultRoleName()];
        var selectedRole = roles ? roles[DH.currentPerformance.getSelectedRoleIndex()] : 0;
        var epas = DH.currentPerformance.isModePi() ? DH.currentPerformance.getEPAs() : undefined;
        var selectedEpa = epas ? Object.keys(epas)[DH.currentPerformance.getSelectedEpaIndex()] : undefined;

        var onRoleSelected = function (index, role) {
            DH.currentPerformance.selectRoleAtIndex(index);
            _regenerate();
        };
        Common.generateHeader(_containerElement, roles, selectedRole, epas, selectedEpa, onRoleSelected, _onEpaSelected, 'current');
        //_generateRolesHeader(roles, selectedRoleIndex, onRoleSelected);
    }
};

var _generateContent = function () {
    $('#currentPerformanceErrorMessage').hide();
    if (DH.currentPerformance.isDataAvailable()) {
        logObject = {
            component : 'VIZ',
            event: 'load-current'
        };
        try {
            jitviz_log('wm-log-current', logObject);
        } catch(e) {
            console.log(e, logObject);
        }

        var roles = DH.currentPerformance.getRoles();
        if (roles && roles.length > 0) {
            $('#currentPerformanceChart').show();
            $('#currentPerformanceLoading').hide();
            var chart = _generateChart();
            _generateFooter(chart);
        } else {
            $('#currentPerformanceErrorMessage').html(i18n.tr(DH.requester.getLanguage(), "no_data_available"));
            $('#currentPerformanceErrorMessage').show();
            $('#currentPerformanceLoading').hide();
        }
    } else {
        $('#currentPerformanceChart').hide();
        $('#currentPerformanceLoading').show();
        DH.currentPerformance.requestData();
    }
};

var _generateChart = function () {
    var chart;
    var data = DH.currentPerformance.getChartData();

    $('#radarChart').text('');
    if (data['categories'].length > 2 && _currentDiagram == 'radar') {
        _generateRadarChartOptions();
        chart = _generateRadarChart(data);
        _generateRadarChartAxisBehaviour(data);
    } else {
        _generateBarChartOptions(data);
        chart = _generateBarChart(data);
    }
    var lines = [];
    $.each(data['categories'], function (i, v) {
        lines.push(v.axis);
    });
    return chart;
};

var _generateRadarChartOptions = function () {
    var options = $('#chartOptions');
    options.text('');
    options.append(i18n.tr(DH.requester.getLanguage(), 'spider')+' | ');
    options.append($("<a href='#'>"+i18n.tr(DH.requester.getLanguage(), 'bar_chart')+"</a>").click(function (e) {
        logObject = {
            component : 'VIZ',
            event: 'click-bar-chart'
        };
        try {
            jitviz_log('wm_log_current', logObject);
        } catch(e) {
            console.log(e, logObject);
        }
        _currentDiagram = 'bar';
        _regenerate();
        return false;
    }));
};

var _generateRadarChart = function (data) {
    var actualChartData = [];
    var color;
    var domain;
    var lang = DH.requester.getLanguage();

    if (DH.requester.average() && DH.currentPerformance.isModeEpa()) {
        domain = [i18n.tr(lang, "chart_domain_group"), i18n.tr(lang, "chart_domain_self")];
        color = d3.scale.ordinal()
            .domain(domain)
            .range(["#C0C0C0", '#000000']);
        var personal = [];
        var group = [];
        $.each(data['categories'], function (idx, categ) {
            group.push({ axis: categ, value: data['averageScores'][idx] });
            personal.push({ axis: categ, value: data['personalScores'][idx] });
        });
        actualChartData.push(group);
        actualChartData.push(personal);
    } else {
        domain = [i18n.tr(lang, "chart_domain_self")];
        color = d3.scale.ordinal()
            .domain(domain)
            .range('#000000');
        var personal = [];
        $.each(data['categories'], function (idx, categ) {
            personal.push({ axis: categ, value: data['personalScores'][idx] });
        });
        actualChartData.push(personal);
    }
    var title = DH.currentPerformance.isModeEpa() ? DH.requester.term().epa : DH.requester.term().pi;
    var chart = Radar.createRadar("#radarChart", actualChartData, domain, color, title);

    // let categories be selectable in the radar chart
    var orig = $('g.legend rect').attr('style');
    $.each( $('g.legend rect'), function(idx, rect) {
        if ( idx != 0) return true;
        if(DH.currentPerformance.isModeEpa()) {
            $(rect).on('click', function() {
                if ( d3.select(this).style('opacity') == "1") {
                    d3.select(this).transition().style("opacity", 0.1);
                    $($('g polygon')[idx]).hide();
                    $('g circle.radar-chart-serie'+idx).hide();
                } else {
                    d3.select(this).transition().style("opacity", "1");
                    $($('g polygon')[idx]).show();
                    $('g circle.radar-chart-serie'+idx).show();
                }
            });
        }
    });

    // set axis fill colors
    $.each($.find('.axis .legend'), function (idx, val) {
        if (DH.currentPerformance.isModeEpa()) {
            if (Config.palette(idx)) {
                $(val).attr('fill', Config.palette(idx).primary);
            }
        } else {
            $(val).attr('fill', Config.palette(DH.currentPerformance.getSelectedEpaIndex(), idx));
        }
    });
    return chart;
};

var _generateRadarChartAxisBehaviour = function (data) {

    var categories = data.categories;
    var epas = DH.currentPerformance.getEPAs();
    // add axis click behavior
    if (DH.currentPerformance.isModeEpa()) {
        $.each($('.axis text'), function (idx, val) {
            var epaId = getEPAId(val, categories, epas);
            $(val).css('cursor', 'pointer');
            $(val).attr('class',$(val).attr('class')+' epa-'+epaId);
            $(val).click(function () {
                logObject = {
                    component : 'VIZ',
                    event: 'click-epa-axis',
                    epaId: epaId
                };
                try {
                    jitviz_log('wm_log_current', logObject);
                } catch(e) {
                    console.log(e, logObject);
                }
                _onEpaSelected(epaId);
            });
            addHover(val);
        });
        Drag.dragBehavior(DH.currentPerformance.getDragBehaviourData(), function(epaId, cb){
            logObject = {
                component : 'VIZ',
                event: 'drag-epa',
                epaId: epaId
            };
            try {
                jitviz_log('wm_log_current', logObject);
            } catch(e) {
                console.log(e, logObject);
            }

            DH.currentPerformance.requestJITData(epaId, function(result) {
                    cb(result);
            });
        });
    } else {
        $.each($('.axis text'), function (idx, val) {
            var text = $(val).text().replace(/ /g,'');
            $(val).css('cursor', 'pointer');
            $(val).attr('class',$(val).attr('class')+' epa-'+text);
            addHover(val);
        });
    }

    function addHover(element) {
        $(element).hover(function() {
            $('.axis text').css('opacity', 0.5);
            $(element).css('opacity', 1);

        }, function() {
            $('.axis text').css('opacity', 1);
        });
    }

    function getEPAId(element, epaNames, epas) {
        var text = $(element).text();
        var id=undefined;

        $.each(epaNames, function(index, epaName) {
            if(text === epaName) {
                id=epas[epaName].id;
            }
        });

        return id;
    }
};

var _generateBarChartOptions = function (data) {
    var options = $('#chartOptions');
    options.text('');
    if (data['categories'].length > 2) {
        options.append($("<a href='#'>Spider</a>").click(function (e) {
            logObject = {
                component : 'VIZ',
                event: 'click-spider-chart'
            };
            try {
                jitviz_log('wm_log_current', logObject);
            } catch(e) {
                console.log(e, logObject);
            }
            _currentDiagram = 'radar';
            _regenerate();
            return false;
        }));
    } else {
        options.append('<s>Spider</s>');
    }
    options.append(' | Bar chart');
};

var _generateBarChart = function (data) {
    var categories = data['categories'];
    var lang = DH.requester.getLanguage();
    var domainGroup = i18n.tr(lang, "chart_domain_group");
    var domainSelf = i18n.tr(lang, "chart_domain_self");
    var average = [domainGroup].concat(data['averageScores']);
    var personal = [domainSelf].concat(data['personalScores']);
    var columns;
    var colors;
    if (DH.requester.average()) {
        columns = [
            average,
            personal
        ];
        colors = {};
        colors[domainGroup] = '#C0C0C0';
        colors[domainSelf] = Config.palette(0).primary;
    } else {
        columns = [
            personal
        ];
        colors = {};
        colors[domainSelf] = Config.palette(0).primary;
    }

    var chart = c3.generate({
        bindto: "#radarChart",
        data: {
            columns: columns,
            type: 'bar',
            colors: colors
        },
        bar: {
            width: {
                ratio: 0.5 // this makes bar width 50% of length between ticks
            }
        },
        axis: {
            y: {
                label: { text: i18n.tr(DH.requester.getLanguage(), 'level'), position: "outer-middle" },
                tick: {
                    values: [1, 2, 3, 4]
                }
            },
            x: {
                type: 'category',
                categories: categories,
                colors: colors
            }
        },
        point: {
            show: false
        },
        size: {
            height: 400,
            width: 600
        }
    });
    $.each($.find('#current .c3-axis .tick text'), function (idx, val) {
        if (DH.currentPerformance.isModeEpa()) {
            $(val).attr('fill', Config.palette(idx).primary);
        } else {
            $(val).attr('fill', Config.palette(DH.currentPerformance.getSelectedEpaIndex(),idx));
        }
    });

    return chart;
};

var _generateFooter = function (chart) {
    var data = DH.currentPerformance.getFooterData();
    var isModeEpa = DH.currentPerformance.isModeEpa();
    var selectedEpaIndex = DH.currentPerformance.getSelectedEpaIndex();
    var footer = Common.generateFooter(data, isModeEpa, _onEpaSelected, selectedEpaIndex, chart, $('#current'), 'current', true);

    $.each($('#currentPerformanceChart .c3-event-rect'), function (idx, value) {
        $(value).hover(
            function(){
                var bars =  $('.c3-bar');
                var footerItems = $('#currentPerformanceChart .legend .clickable');

                bars.css('opacity', 0.3);
                $('._expanded_').css('opacity', 1);

                footerItems.css('opacity', 0.3);
                $.each(footerItems, function(index, footer) {
                    if(index === idx) {
                        $(footer).css('opacity', 1);
                    }
                })
            },
            function(){
                $('.legend .clickable').css('opacity', 1);
                $('.c3-bar').css('opacity', 1);
            });
    });
    $.each($('#current .axis text'), function (idx, value) {
        Common.footerFocus($(value), idx, footer);
    });
    $.each($('#current .c3-axis-x .tick text'), function (idx, value) {
        if (DH.currentPerformance.isModeEpa()) {
            $(value).css('cursor', 'pointer');

            $(value).click(function () {
                _onEpaSelected(idx);
            });
        }
    });
};