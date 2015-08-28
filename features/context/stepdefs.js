'use strict';

var English = require('yadda').localisation.English,
    By = require('selenium-webdriver').By,
    webdriver = require('selenium-webdriver'),
    _ = require('lodash'),
    constants = {
        time: new Date().getTime()
    },
    path = '/';

function r(value) {
    var c = _.template(value, {interpolate: /{([\s\S]+?)}/g});

    return c(constants);
}

module.exports = English.library()

    .given('I am on $path', function (newPath, next) {
        if (newPath === path) {
            next();
            return;
        }
        path = r(newPath);
        this.driver.get(this.testHost + r(newPath)).then(next);
    })

    .when(/^I clear the input (.+)$/, function (input, next) {
        this.driver.findElement(By.name(input)).then(function (found) {
            return found.getAttribute('value').then(function (value) {
                return found.sendKeys(_.repeat(webdriver.Key.BACK_SPACE, value.length));
            });
        })
        .then(function () {
            next();
        });
    })

    .when(/^I enter "([^"]+)" into the input (.+)$/, function (value, input, next) {
        this.driver.findElement(By.name(input)).sendKeys(r(value)).then(next);
    })

    .when(/^I select "([^"]+)" from the input (.+)$/, function (value, input, next) {
        var select = this.driver.findElement(By.name(input)).then(function(found) {
            return found.findElement(By.css('option[value="' + r(value) + '"]')).click();
        })
        .then(function() {
                next();
        });
    })

    .when(/^I click the ([^ ]+) "([^"]+)"$/, function (element, text, next) {

        var textIn = 'text()';
        var atPos = element.indexOf('@');
        if (atPos > -1) {
            textIn = element.substr(atPos, element.length - atPos);
            element = element.substr(0, atPos);
        }
        this.driver.findElement(By.xpath('//' + element + '[contains(' + textIn + ',"' + text + '")]')).click().then(function() {
            next();
        });
    })

    .then(/^I wait for ([^ ]+) to contain "([^"]+)"$/, function (css, expectedText, next) {
        this.driver.findElement(By.css(css)).then(function (found) {
            return found.getText().then(function (gotTxt) {
                if (gotTxt.indexOf(expectedText) > -1) {
                    return true;
                }
            });
        })
        .then(function () {
            next();
        });
    })

    .given('I have a fresh browser', function (next) {
        this.restartBrowser().then(next);
    })

;
