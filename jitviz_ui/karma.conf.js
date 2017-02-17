module.exports = function(config)
{
    config.set({

        basePath: '',
        frameworks: ['browserify', 'jasmine'],
        files: [
            'public/js/jquery-1.9.1.js',
            'test/*.js'
        ],
        exclude: [
        ],
        preprocessors: {
            'test/*.js': ['browserify']
        },
        reporters: ['spec'],
        specReporter: {
            maxLogLines: 5,
            suppressErrorSummary: true,
            suppressFailed: false,
            suppressPassed: false,
            suppressSkipped: true,
            showSpecTiming: true
        },
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: false,
        browsers: ['PhantomJS'],
        browserify: {
            debug: true,
            transform: []
        },
        plugins: [
            'karma-phantomjs-launcher',
            'karma-jasmine','karma-bro', 'karma-spec-reporter'],
        singleRun: true
    });
};