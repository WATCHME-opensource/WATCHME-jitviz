var DH = require('../widgets/DataHandler');
var Config = require('../widgets/configuration');
var i18n = require("../i18n");

exports.generateHeader = function (element, roles, selectedRole, pis, selectedPi, callOnRoleSelected, callOnPiSelected, view) {
    var header = element.find('.navigateTop').text('');

    var size = Math.max(roles ? roles.length : 0, pis ? pis.length : 0);
    var width = 90 / size;

    if (roles) {
        $.each(roles, function (idx, role) {
            $('<span>').addClass(role == selectedRole ? 'button-down' : 'button').text(role).appendTo(header).on('click', function () {
                logObject = {
                    component : 'VIZ',
                    event: 'click-epa-role',
                    role: role
                };
                try {
                    if(view === 'current') {
                        jitviz_log('wm-log-current', logObject);
                    } else if (view === 'timeline') {
                        jitviz_log('wm-log-timeline', logObject);
                    } else {
                        jitviz_log('wm-log-legend', logObject);
                    }

                } catch(e) {
                    console.log(e, logObject);
                }
                callOnRoleSelected(idx, role);
            });
        });
        if (pis) {
            header.append($('<br><br>'));
        }
    }

    if (pis) {
        $.each(pis, function (idx, pi) {
            $('<span>').addClass(pi.name == selectedPi ? 'button-down' : 'button').width(width + '%').text(pi.name).appendTo(header).on('click', function () {
                logObject = {
                    component : 'VIZ',
                    event: 'click-epa-task',
                    task: pi.name
                };
                try {
                    if(view === 'current') {
                        jitviz_log('wm-log-current', logObject);
                    } else if (view === 'timeline') {
                        jitviz_log('wm-log-timeline', logObject);
                    } else {
                        jitviz_log('wm-log-legend', logObject);
                    }

                } catch(e) {
                    console.log(e, logObject);
                }
                callOnPiSelected(pi.id, pi);
            });
        });
    }
};

exports.generateFooter = function (footerData, isModeEpa, onEpaSelected, selectedEpaIndex, chart, selected, view, noFocus) {
    var div = $('<div class="legend">');
    var width = 100 / 5;

    var footer = [];
    $.each(footerData, function (i, value) {
        var span = $('<span>').width(width + "%");

        var title = value.name + '. ' + value.description;
        if ( value.name == value.description ) {
            title = value.name;
        }

        var color;
        if (isModeEpa) {
            span.addClass("clickable");
            span.attr('data-id', 'epa-'+value.id);

            color = Config.palette(i).primary;
            var detail = function () {
                logObject = {
                    component : 'VIZ',
                    event: 'click-epa-legend',
                    epaId: value.id
                };
                try {
                    if(view === 'current') {
                        jitviz_log('wm-log-current', logObject);
                    } else if (view === 'timeline') {
                        jitviz_log('wm-log-timeline', logObject);
                    } else {
                        jitviz_log('wm-log-legend', logObject);
                    }

                } catch(e) {
                    console.log(e, logObject);
                }

                onEpaSelected(value.id);
            };
            span.html($('<i class="icon-doc-text"></i><p>' + title + '</p>').click(detail));
            var lang = DH.requester.getLanguage();
            var message = i18n.tr(lang, "see") + " " + value.numberOfPIs + " " + i18n.tr(lang, DH.requester.term().pi);
            var pi = $("<div class='toggle'>" + message + "</div>");
            pi.click(detail);
            pi.attr('style', 'background:' + color);
            span.append(pi);
        } else {
            span.addClass("not-clickable");
            color = Config.palette(selectedEpaIndex, i);
            span.html('<i class="icon-doc-text"></i><br>' + title);
            span.attr('data-id', 'epa-'+value.id);
        }
        span.attr('style', 'color:' + color).width(width + "%");

        footer.push(span);
        exports.footerFocus(span, 'epa-'+value.id, footer);
        if(!noFocus) {
            exports.focusBehavior(chart, span, 'epa-'+value.id, isModeEpa);
        }
        div.append(span);
    });
    selected.find('.viz-legend').text('').append(div);
    return footer;
};

exports.focusBehavior = function (chart, element, name, isModeEpa, onMouseOver, onMouseOut) {
    element.on("mouseover", function () {
        if (chart.customFocus) {
            chart.customFocus(name);
        } else {
            if ( chart.focus ) {
                chart.focus(name);
            }
        }
        if (isModeEpa) {
            togglePassingScoreLine(name);
            element.css('cursor', 'pointer');
        }
        if(onMouseOver) {
            onMouseOver();
        }
    }).on("mouseout", function () {
        if(isModeEpa) {
            togglePassingScoreLine(name);
        }
        if (chart.customDefocus) {
            chart.customDefocus();
        } else {
            if ( chart.focus ) {
                chart.focus();
            }
        }
            if(onMouseOut) {
                onMouseOut();
            }
    });

    function togglePassingScoreLine(epaId) {
        $.each($('.c3-ygrid-line'), function(index, gridLine) {
            if($(gridLine).attr('class').indexOf(epaId)!== -1){
                $(gridLine).toggle();
            }
        })
    }
};

exports.footerFocus = function (element, index, footer) {
    element.on('mouseover', function () {
        $.each(footer, function (i, value) {
            var id = $(value).attr('data-id');
            if($(element).attr('class').indexOf('epa-') !== -1){
                if ($(element).attr('class').indexOf(id) === -1) {
                    $(value).css('opacity', '0.3');
                }
            } else {
                if ($(element).attr('data-id').indexOf(id) === -1) {
                    $(value).css('opacity', '0.3');
                }
            }
        });
    }).on('mouseout', function () {
        $.each(footer, function (i, value) {
            $(value).css('opacity', '1.0');
        });
    });
};

exports.dateAxis = {
    calculateTickerValues: function(data) {
        var minDate = exports.dateAxis.calculateMinDate(data);
        var maxDate = exports.dateAxis.calculateMaxDate(data);

        var tick = {};

        if(exports.dateAxis.rangeIsLessThanAWeek(minDate, maxDate)) {
            tick = exports.dateAxis.populateTick(exports.dateAxis.createWeekTickValues(minDate));
        } else if(exports.dateAxis.rangeIsLessThanAMonth(minDate, maxDate)) {
            tick = exports.dateAxis.populateTick(exports.dateAxis.createMonthTickValues(minDate));
        } else if(exports.dateAxis.rangeIsLessThanSixMonths(minDate, maxDate)) {
            tick = exports.dateAxis.populateTick(exports.dateAxis.createHalfYearTickValues(minDate));
        } else {
            tick = exports.dateAxis.populateTick(exports.dateAxis.createAllTimeTickValues(minDate, maxDate));
        }

        return tick;
    },

    calculateMinDate: function (data){
        var minDate = new Date();
        $.each(data.columns, function (i, column) {
            if (i % 2 == 0) {
                for (date = 1; date < column.length; date++) {
                    if (new Date(minDate) > new Date(column[date])) {
                        minDate = column[date];
                    }
                }
            }
        });
        return new Date(minDate);
    },

    calculateMaxDate: function(data){
        var maxDate = new Date('1900-01-01');
        $.each(data.columns, function (i, column) {
            if (i % 2 == 0) {
                for (date = 1; date < column.length; date++) {
                    if (new Date(maxDate) < new Date(column[date])) {
                        maxDate = column[date];
                    }
                }
            }
        });
        return new Date(maxDate);
    },

    populateTick: function(tickValues){
        var tick = {};
        tick.values = tickValues;
        tick.min = tickValues[0];
        tick.max = tickValues[tickValues.length -1];
        tick.format = function(date) { return date.toLocaleDateString()};
        return tick;
    },

    rangeIsLessThanAWeek: function(min, max) {
        var weekMilliseconds = 3600 * 24 * 7 * 1000;
        return (max - min) < weekMilliseconds;
    },

    rangeIsLessThanAMonth: function(min, max) {
        var monthMilliseconds = 3600 * 24 * 7 * 1000 * 4;
        return (max - min) <= monthMilliseconds;
    },

    rangeIsLessThanSixMonths: function(min, max) {
        var monthMilliseconds = 3600 * 24 * 7 * 1000 * 4 * 6;
        return (max - min) <= monthMilliseconds;
    },

    createWeekTickValues: function (minDate) {
        var tickValues = [];
        minDate.setDate(minDate.getDate()-1);

        for (var i = 0; i < 9; i++) {
            var date = new Date(minDate);
            date.setDate(minDate.getDate() + i);
            tickValues.push (date.getFullYear() +  '-'  + pad(date.getMonth() + 1) + '-' + pad(date.getDate()));
        }

        return tickValues;
    },

    createMonthTickValues: function(minDate) {
        var tickValues = [];
        minDate.setDate(minDate.getDate() - 3);

        for (var i = 0; i < 40; i+=4) {
            var date = new Date(minDate);
            date.setDate(minDate.getDate() + i);
            tickValues.push(date.getFullYear() +  '-'  + pad(date.getMonth() + 1) + '-' + pad(date.getDate()));
        }
        return tickValues;
    },

    createHalfYearTickValues: function(minDate) {
        var tickValues = [];
        minDate.setDate(minDate.getDate() - 14);

        for (var i = 0; i < 8; i++) {
            var date = new Date(minDate);
            date.setDate(1);
            date.setMonth(minDate.getMonth() + i);
            tickValues[i] = date.getFullYear() +  '-'  + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
        }

        return tickValues;
    },

    createAllTimeTickValues: function(minDate, maxDate) {
        var tickValues = [];
        minDate.setMonth(minDate.getMonth() - 1);
        maxDate.setMonth(maxDate.getMonth() + 1);

        var maxDatePlusThree = new Date(maxDate);
        maxDatePlusThree.setMonth(maxDatePlusThree.getMonth() +3);

        for(var date = new Date(minDate); date < maxDatePlusThree; date.setMonth(date.getMonth() + 3)) {
            date.setDate(1);
            tickValues.push(date.getFullYear() +  '-'  + pad(date.getMonth() + 1) + '-' + pad(date.getDate()));
        }

        return tickValues;
    }
};

function pad(n){return n<10 ? '0'+n : n}
