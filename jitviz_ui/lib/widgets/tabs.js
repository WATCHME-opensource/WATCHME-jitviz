var timeline = require('../widgets/timeline');
var current = require('../widgets/current');
var supervisor = require('../widgets/supervisor');
var general = require('../widgets/general');
var DH = require('../widgets/DataHandler');
var i18n = require("../i18n");

var _currentPerformanceTabId = '#current';
var _timelineTabId = '#timeline';
var _supervisorTabId = '#supervisor';
var _generalTabId = '#general';
var _renderers = { '#timeline': timeline, '#current': current, '#supervisor' : supervisor, '#general': general };
var _selectedTab;
var _vizElement;

exports.init = function (vizElement) {
    _vizElement = $(vizElement);
    var defaultTab = _vizElement.data('viz-component-default');
    var components = _vizElement.data('viz-components');
    var widgets = components.split(",");
    if (!defaultTab) {
        defaultTab = widgets[0];
    }
    if (widgets.length > 1) {
        _generateTabControllers(vizElement, widgets, defaultTab);
    }
    _selectedTab = "#" + defaultTab;
    _refresh();
};

exports.refreshCurrentPerformanceTab = function () {
    if (_isCurrentPerformanceTabSelected()) {
        _refresh();
    }
};

exports.displayCurrentPerformanceError = function (errorMessage) {
    if (_isCurrentPerformanceTabSelected()) {
        _renderers[_selectedTab].displayError(errorMessage);
    }
};

exports.refreshTimelineTab = function () {
    if (_isTimelineTabSelected()) {
        _refresh();
    }
};

exports.refreshSupervisorTab = function () {
    if (_isSupervisorTabSelected()) {
        _refresh();
    }
};

exports.refreshGeneralTab = function () {
    if (_isGeneralTabSelected()) {
        _refresh();
    }
};

exports.displayTimelineError = function (errorMessage) {
    if (_isTimelineTabSelected()) {
        _renderers[_selectedTab].displayError(errorMessage);
    }
};

exports.displaySupervisorError = function (errorMessage) {
    if (_isSupervisorTabSelected()) {
        _renderers[_selectedTab].displayError(errorMessage);
    }
};

exports.displayGeneralError = function (errorMessage) {
    if (_isGeneralTabSelected()) {
        _renderers[_selectedTab].displayError(errorMessage);
    }
};

var _generateTabControllers = function (vizElement, widgets, defaultTab) {
    var tabs = $('<ul class="tabs">').appendTo(vizElement);
    var tabLinks = [];
    $.each(widgets, function (i, value) {
        var link = $('<a>').attr('href', '#' + value).text(i18n.tr(DH.requester.getLanguage(), value));
        if (defaultTab == value) {
            link.addClass('selected');
        }
        tabLinks.push(link);
        $('<li>').append(link).appendTo(tabs)
            .click(function () {
                _onTabSelected(tabLinks, link);
                return false;
            })
            .focus(function () {
                this.blur();
            });
        //$(link.attr('href')).hide();
    });
};

var _onTabSelected = function (tabLinks, link) {
    $.each(tabLinks, function (k, value) {
        $(value).removeClass('selected');
        $($(value).attr('href')).hide();
    });
    link.addClass('selected');
    _selectedTab = link.attr('href');
    $(_selectedTab).show();
    _refresh();
};

var _refresh = function () {
    _renderers[_selectedTab].generate(_vizElement);
};

var _isCurrentPerformanceTabSelected = function () {
    return _selectedTab === _currentPerformanceTabId;
};

var _isTimelineTabSelected = function () {
    return _selectedTab === _timelineTabId;
};

var _isSupervisorTabSelected = function () {
    return _selectedTab === _supervisorTabId;
};

var _isGeneralTabSelected = function () {
    return _selectedTab === _generalTabId;
};