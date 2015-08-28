"use strict";

/* global featureFile, scenarios, steps */

var glob = require('glob'),
    Yadda = require('yadda'),
    toposort = require('toposort'),
    _ = require('lodash');
Yadda.plugins.mocha.StepLevelPlugin.init();

function stepDefs() {
    return glob.sync("./features/context/*.js");
}

function importStepDef(stepdefs, stepdef) {
    var fileName = stepdef.replace('.js', '');
    fileName = fileName.replace('./', '../');
    var library = require(fileName);
    return stepdefs.concat(library);
}

var libraries = stepDefs().reduce(importStepDef, []);
var context = require('./weblibrary').library.init();
var yadda = new Yadda.Yadda(libraries, context);

var featureFileMap = {};
var featureGraph = [];

new Yadda.FeatureFileSearch('./features').each(function (file) {
    featureFile(file, function (feature) {
        var name = file.match(/([^\/]+)\.feature$/)[1];
        // Build inventory of all features to sort it by dependencies
        featureFileMap[name] = file;
        featureGraph.push([feature.annotations.depends, name]);
    });
});

_.map(toposort(featureGraph), function (featureName) {
    if (featureName === undefined) {
        return;
    }
    var file = featureFileMap[featureName];
    featureFile(file, function (feature) {
        scenarios(feature.scenarios, function (scenario) {
            steps(scenario.steps, function (step, done) {
                yadda.run(step, done);
            });
        });
    });
});

