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
    $('#generalLoading').hide();
    var errorContainer = $('#generalErrorMessage');
    errorContainer.text(i18n.tr(DH.requester.getLanguage(), "error_retrieving_data") + ". (" + errorMessage + ")");
    errorContainer.show();
};

var _generateTabContentContainer = function (element) {
    if (element.find('#general').length == 0) {
        var elm = $('<div class="tabContent" id="general">');
        element.append(elm);
        elm.append(
            $('<div id="generalLoading" class="loading">')
                .append($('<img src="images/loading.gif" />'))
                .append('<span>' + i18n.tr(DH.requester.getLanguage(), "loading") + '</span>')
        );
        elm.append($('<p class="error" id="generalErrorMessage">'));
        elm.append(
            $('<div id="generalChart">')
                .append($('<div id="table">'))
                .append($('<div class="viz-legend">'))
        );
    }
};

var _generateContent = function() {
    var $generalError = $('#generalErrorMessage');
    var $generalLoading = $('#generalLoading');
    var $generalChart = $('#generalChart');

    $generalError.hide();

    if (DH.general.isDataAvailable()) {
        logObject = {
            component : 'VIZ',
            event: 'load-general'
        };
        try {
            jitviz_log('wm_log_general', logObject);
        } catch(e) {
            console.log(e, logObject);
        }

        $generalChart.show();
        $generalLoading.hide();
        _generateChart();

    } else {
        $generalChart.hide();
        $generalLoading.show();
        DH.general.requestData();
    }
};

var _generateChart = function() {
    var data = DH.general.getOverviewData();
    _createGeneralChart(data);
};

var _createGeneralChart = function(data) {
    var elm = $('#table');

    if (elm.find('#epas').length == 0) {
        elm.append($('<table id="epas">'));

        var table = $('#epas');

        createTableHeader(table, data);

        $.each(data, function(epaIndex, epa){
            var color = Config.palette(epa.colorIndex)['class'];
            createTableRow(table, epa, color, epaIndex);
        });
    }

    function createTableHeader(table) {
        var header = $('<tr>');
        table.append(header);


        addHeaderColumn(header, i18n.tr(DH.requester.getLanguage(), 'epa'));
        addHeaderColumn(header, i18n.tr(DH.requester.getLanguage(), 'passing_score'));
        addHeaderColumn(header, i18n.tr(DH.requester.getLanguage(), 'current_level'));
        //addHeaderColumn(header, i18n.tr(DH.requester.getLanguage(), 'assessment_forms'));

        if (useEntrustments()) {
            addHeaderColumn(header, i18n.tr(DH.requester.getLanguage(), 'entrustment_level'));
            addHeaderColumn(header, i18n.tr(DH.requester.getLanguage(), 'entrustment_granted'));
        }
    }

    function useEntrustments() {
        var edu = DH.requester.getCurrentEducation();
        // teacher education does not support entrustments
        return (!(edu == "tt-uu" || edu == "tt-ut"));
    }

    function addHeaderColumn (header, text) {
        var column = $('<th>');
        header.append(column);
        column.append(text);


    }

    function createTableRow(table, epa, color) {
        var row = $('<tr>');
        table.append(row);

        addRowColumn(row, epa.name, 'general-name-column ' + color);
        addRowColumn(row, epa.passingScore, 'general-data-column');
        addRowColumn(row, epa.score, createScoreBackGround(epa.passingScore, epa.score));
        //addRowColumn(row, epa.deliveredForms, createFormBackGround(epa.requiredForms, epa.deliveredForms));

        if (!useEntrustments()) return row;
        color = "green";
        if ( epa.entrustment.allApproved ) {
            var value = epa.entrustment.entLevel == 0 ? 0 : epa.entrustment.entLevel;
            // green
            addRowColumn(row, value, createEntrustmentBackGround(color));
        } else {
            // generate waiting label or request entrustment link
            color = epa.entrustment.entLevel == 0 ? "red" : "amber";
            var value = epa.entrustment.entLevel == 0 ? 0 : epa.entrustment.entLevel;
            addRowColumn(row, value, createEntrustmentBackGround(color));
        }

        var label = "<button type='button'>"+i18n.tr(DH.requester.getLanguage(),'request_entrustment', {level: epa.entrustment.nextLevel})+"</button>";
        if ( epa.entrustment.pending ) {
            label = "Awaiting entrustment for level " + epa.entrustment.entLevel;
        }
        if(epa.entrustment.allApproved) {
            label = "Entrusted";
        }
        column = addRowColumn(row, label, createEntrustmentBackGround(color) + ' viz-general-entrusted');

        $(column).on('click', function(event){
            logObject = {
                component : 'VIZ',
                event: 'request-entrustment',
                epaId: epa.epaId,
                requested_level: epa.entrustment.nextLevel
            };
            try {
                jitviz_log('wm_log_general', logObject);
            } catch(e) {
                console.log(e, logObject);
            }
            event.preventDefault();
            viz_open_entrustment_request(epa.epaName, epa.entrustment.nextLevel);
        });
        return row;
    }

    function createScoreBackGround(passingScore, score) {
        if(passingScore > score) {
            return 'red-background general-data-column';
        }
        return 'green-background general-data-column';
    }

    function createFormBackGround(requiredForms, deliveredForms){
        if(deliveredForms === 'N/A' || requiredForms > deliveredForms) {
            return 'red-background general-data-column';
        }
        return 'green-background general-data-column';
    }

    function createEntrustmentBackGround(color) {
        return 'entrustment '+color+'-background general-data-column';
    }

    function addRowColumn (row, text, css) {
        var column = $('<td>');
        column.addClass(css);
        row.append(column);
        column.append(text);
        return column;
    }
};