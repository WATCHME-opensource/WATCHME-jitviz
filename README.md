# WATCHME Project: The JITVIZ Component

This repository is a product of the WATCHME project. For documentation and background we refer to: [WATCHME](http://www.project-watchme.eu/).

This repository holds the JITVIZ (Just In Time / Visualization) API, UI, and test code.

* *JITVIZ/jitviz_api* - The JITVIZ API, which basically relays queries between EPASS (JITVIZ UI) and Student Model.
* *JITVIZ/jitviz_ui* - The JITVIZ UI code, along with a minimal web app to demo the components.
* *JITVIZ/dummy_data/SM* - A mock version of Student Model sending canned data (for test).

JITVIZ-API
----------

The JITVIZ API is based on Node.js. In order to build and run it, first install Node.js, then 'npm', the Node package manager.

    $ sudo yum install nodejs npm

Specific instructions for your platform can be found [here](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager).

Go to JITVIZ/jitviz_ui and install the necessary Node packages, and 'grunt-cli'.

    $ cd JITVIZ/jitviz_api
    $ npm install
    $ npm install -g grunt-cli

Now, 'grunt' (a 'make'-like tool for JavaScript) should be ready to use. Running 'grunt' starts the JITVIZ API server on localhost port 8080, and restarts it when it detects file changes. See `Gruntfile.js` for more details.

    $ grunt

Requesting [http://localhost:8080/api/jit/feedback/1?modelId=...](http://localhost:8080/api/jit/feedback/1?modelId=EXAMMPLE&studentId=xxx&sessionToken=xxx&authToken=xxx&groupId=xxx) in a browser should give a JSON result with recommendations.

In order to deploy to the test server on [Heroku](http://jitviz.herokuapp.com), just type `grunt deploy`. Note that you must be logged in to Heroku with an account that has the necessary privileges. 

JITVIZ-UI Development
---------------------

The JITVIZ-UI project has similar installation instructions as the JITVIZ API, but note that the real output of this project is not the Node server, which just exists for demonstration and development purposes, but the JavaScript and CSS found in `public/js/watchme_bundle.js` and `public/css/epass.css`.

    $ cd JITVIZ/jitviz_ui
    $ npm install
    $ npm install -g grunt-cli # if not already installed before

Running `grunt` starts 'browserify' to combine all JavaScript modules found in `lib/` into the single JavaScript bundle in `public`, and then starts the Node.js server and watches for file changes. To generate the JavaScript bundle without starting a server:

    $ grunt browserify
    Running "browserify:dev" (browserify) task
    >> Bundle ./public/js/watchme_bundle.js created.

The CSS is compiled from a source SASS file in `src/epass_jitviz_examples.scss` by the `grunt sass` command. The generated JavaScript and CSS can be dropped directly into EPASS as per the Usage Guide.

If you start the server using 'grunt', you can see a [Dashboard Example](http://localhost:8080/dashboard.html) and an [Assessment Example](http://localhost:8080/index.html) on `localhost`.

JITVIZ-UI Usage Guide
---------------------

The JITVIZ UI has a syntax for embedding components in HTML. It is implemented as a JavaScript library, which recognizes such components on an HTML page, and provides their content by requesting information from the JITVIZ API.

To embed JITVIZ components into the HTML of a portfolio system such as EPASS, first place the WATCHME JavaScript on the system’s server, preferably in its public JavaScript folder. Then refer to the file on each page that needs JITVIZ components, at the bottom of the page:

    <script src="js/watchme_bundle.js"></script>

Optionally place the default CSS styling for epass.css in a stylesheet or css folder, and insert a reference to it in the <head> element of each page that needs JITVIZ components:

    <link href="css/epass.css" rel="stylesheet" />

Verify that both files are accessible by requesting them in a browser.

### JIT Dashboard Component

To embed a JIT Dashboard component, include the following markup. All data-values (except `data-jit-component-type` and `data-feedback-levels`) should be dynamically generated by your portfolio system - do not use the values provided here for anything other than a quick test. The values you provide are sent directly to Student Model.

    <div class="jitviz-container">
        <div class="jit-component canvas"
            data-jit-component-type="dashboard"
            data-feedback-levels="1"
            data-model-id="EXAMPLE-SCHOOL"
            data-student-id="xxx"
            data-language="en"
            data-session-token="xxx"
            data-auth-token="xxx"
            data-group-id="xxx">
        </div>
    </div>

### JIT Assessment Component

The JIT Assessment Component shows feedback for a single EPA, as specified in `data-epa-ids`. Again, most of the data values here are examples, the real values should be provided by your portfolio system.

    <div class="jitviz-container">
        <div class="jit-component canvas context-jit-feedback"
            data-jit-component-type="assessment"
            data-epa-ids="1"
            data-model-id="EXAMPLE SCHOOL"
            data-student-id="xxx"
            data-language="en"
            data-session-token="xxx"
            data-auth-token="xxx"
            data-group-id="xxx">
        </div>
    </div>
            
The example file in `public/index.html` shows how a combo box can control this component using JavaScript.

Configuration
-------------

For JITVIZ-API:

The JITVIZ/jitviz-api/env.json file has all necessary configuration, with the exception of CORS headers.
It needs to return the correct CORS headers, for different portfolio systems to be able to use it.
This is configured directly in the `JITVIZ/jitviz-api/server.js` file. Simply add the portfolio system URL
to the allowedOrigins array in the file, and re-deploy / re-start the server.

All other configuration is placed in the env.json file, which has values
for different environments (development, production etc.). When starting
Node, use the syntax `NODE_ENV=production node server.js` to enable the
production environment. The following environments are available:

* development - use for local development work that doesn't touch any
  servers online.
* live-test - the test environment used for user test etc.
* production - the real production environment.

The following variables can be configured, in env.json:

* `NODE_PORT` - the port number on which node will be started, unless a
  PORT is specified in the environment when running Node.
* `SM_BASE_URL` - This is the URL which JITVIZ-API will forward all requests to, using PUT.
  Should include port number, but not the path.
* `SM_PATH` - the path, which is appended to the `SM_BASE_URL`.

For JITVIZ-UI:

Environment specific configuration is provided by creating separate
JavaScript bundles for each environment, currently 'dev' or 'dist'
(production).

To set the necessary configuration, edit the separate `env-dev.json`
and `env-dist.json` files. The default 'grunt' task produces a bundle
file (`public/js/watchme_bundle.js`) with configuration suitable for
development, while the 'grunt dist' task produces a bundle file suitable
for distribution to a production environment. This file can be
deployed directly into EPASS.

These variable can be configured:

* `JV_BASE_URL` - the base URL (no path) of the JITVIZ API.
* `JIT_PATH` - the path for the JIT feedback endpoint - is appended to
  the `JV_BASE_URL` to produce the full URL to connect to.

Server Deployment
-----------------

To deploy the JITVIZ-API on a server, use any of the available methods for deploying Node.js services. The process manager [PM2](https://github.com/Unitech/pm2) should be sufficient, when fronted by nginx. It allows for easy installation on Linux based systems, and monitors and restarts the Node.js app if necessary.

Installing and running JITVIZ-API with two clustered workers using PM2 is as simple as:

    $ npm install -g pm2
    $ cd JITVIZ/jitviz-api
    $ NODE_ENV=production pm2 start server.js -i 2 --name "api"

Note that clustering is still a beta feature when using Node 0.10.x.

To monitor performance use `pm2 monit`. To see log files, use `pm2 logs`. To create init.d startup scripts for Ubuntu use `pm2 startup ubuntu`.

