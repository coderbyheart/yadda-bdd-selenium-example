'use strict';

var webdriver = require('selenium-webdriver'),
    _ = require('lodash');

/*

Support for testing on browserstack is provided by these environment variables:

# Sets the selenium server to run the tests on, default is a local browser
SELENIUM_SERVER="http://hub.browserstack.com/wd/hub"
# Browsertack needs credentials
BROWSERSTACK_CREDENTIALS="teamfintura1:*****"
# Sets the host to run the tests on, defaults to localhost:3000
SELENIUM_TEST_HOST="https://stage-1.fintura.work/"
# The browsers used is configured via the cababilities (See https://www.browserstack.com/automate/node)
SELENIUM_BROWSER_NAME="internet explorer"
SELENIUM_CAPABILITY_BROWSER_VERSION="10.0"
SELENIUM_CAPABILITY_OS="Windows"
SELENIUM_CAPABILITY_OS_VERSION="8"
SELENIUM_CAPABILITY_RESOLUTION="1024x768"

*/

var getSeleniumCapabilites = function()
{
    var capas = {
        'browserName': process.env.SELENIUM_BROWSER_NAME || 'chrome'
    };
    _.map(process.env, function(value, name) {
        var m = name.match(/^SELENIUM_CAPABILITY_(.+)/);
        if (m) {
            capas[m[1].toLowerCase()] = value;
        }
    });

    if (process.env.BROWSERSTACK_CREDENTIALS) {
        var creds = process.env.BROWSERSTACK_CREDENTIALS.split(":");
        capas['browserstack.user'] = creds[0];
        capas['browserstack.key'] = creds[1];
        capas.project = 'fintura.de'; // Allows the user to specify a name for a logical group of builds.
        capas['browserstack.debug'] = true; // Required if you want to generate screenshots at various steps in your test.
        capas['browserstack.ie.noFlash'] = true; // Use this capability to disable flash on Internet Explorer.
    }

    return capas;
};

var weblibrary = {
    init: function () {
        var context = {};

        function startBrowser() {
            var capa = getSeleniumCapabilites();
            var testHost = _.trimRight(process.env.SELENIUM_TEST_HOST || 'http://127.0.0.1:3000', '/');
            console.log("[Selenium] Creating browser " + capa.browserName + " testing on " + testHost);
            _.map(capa, function(value, name) {
                if (name === 'browserstack.key') {
                    return;
                }
                console.log("[Selenium] @" + name + ": " + value);
            });
            var builder = new webdriver.Builder()
                .withCapabilities(capa);
            if (process.env.SELENIUM_SERVER) {
                console.log('[Selenium] Server: ' + process.env.SELENIUM_SERVER);
                builder.usingServer(process.env.SELENIUM_SERVER);
            }
            var driver = builder.build();
            driver.manage().timeouts().implicitlyWait(15000);
            context.driver = driver;
            context.testHost = testHost;
            return context.driver.get(testHost);
        }

        // mocha lifecycle operations
        function initBrowser(done) {
            if (!context.driver) {
                startBrowser().then(function () {
                    done();
                });
            } else {
                done();
            }
        }

        function shutdownBrowser(done) {
            if (context.driver) {
                console.log("[Selenium] Closing browser …");
                context.driver.quit().then(function () {
                    done();
                });
                delete context.driver;
            } else {
                done();
            }
        }

        function restartBrowser() {
            return context.driver.quit().then(startBrowser);
        }

        context.restartBrowser = restartBrowser;

        before(initBrowser);
        after(shutdownBrowser);

        return context;
    }
};

exports.library = weblibrary;
