var Pop      = require('../widgets/Popup');
var RQ  = require('../widgets/DataHandler');
var TH  = require('../widgets/tabs');
var QUERY = require('../utilities/query_builder');

exports.initialize = function() {
    Pop.initialize();
};

exports.getComponentContent = function (vizElement) {
    var element = $(vizElement);
    var education = element.data('model-id');
    var environment = element.data('env') || 'production';

    RQ.requester.selectEducation(education);
    RQ.requester.setUserData({
        domain: element.data('modelId'),
        studentHash: element.data('studentId'),
        applicantHash: element.data('authToken'),
        sessionToken: element.data('sessionToken'),
        language: element.data('language'),
        epaId: element.data('epa-ids'),
        environment: environment
    });
    TH.init(vizElement);
};

var generateTab = function( generator, element ) {
    generator.generate( element );
};
