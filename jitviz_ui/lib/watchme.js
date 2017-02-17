var JitController = require('./controllers/jit_controller');
var VizController = require('./controllers/viz_controller');

var WATCHME = WATCHME || {};
var jitController;

WATCHME.init = function () {
    WATCHME.jit();
    WATCHME.viz();
};

WATCHME.update = function (jitComponents) {
    for (var i = 0; i < jitComponents.length; i++) {
        var component = jitComponents[i];
        if ($(component).attr('class').indexOf('jit-component') !== -1) {
            JitController.getComponentContent(jitComponents[i]);
        }
    };
};

WATCHME.jit = function () {
    var jitComponents = $('.jit-component');

    for (var i = 0; i < jitComponents.length; i++) {
        var component = jitComponents[i];
        if ($(component).data("initiate") !== 'empty') {
            JitController.getComponentContent(component);
        }
    };
};

WATCHME.viz = function () {
    var vizComponents = $('.viz-component');

    VizController.initialize();
    for (var i = 0; i < vizComponents.length; i++) {
        VizController.getComponentContent(vizComponents[i]);
    }
};

WATCHME.init();

window.WATCHME = WATCHME; // not the nicest way
module.exports = WATCHME;

