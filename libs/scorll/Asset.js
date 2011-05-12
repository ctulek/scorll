var groups = require('libs/scorll/Groups.js');
var client = require('libs/scorll/Client.js');

var call = function(ioclient, componentId, method) {
    client.call.apply(client, arguments);
}

exports.call = function(client, componentId, method) {
    var params = Array.prototype.slice.call(arguments);  
    var callback = params.pop();
    groups.each(groups.id(client), function(client) {
        call.apply(null, params);
    });
}

exports.track = function(client, componentId, params, callback) {
    var assetId = params.assetId;
    var user = client.user;
    var type = params.type;
    var timestamp = params.timestamp || new Date();
    var correctResponses = ['0']; // TODO: Get this from asset data
    var learnerResponse = params.response;
    var result = params.result || null;
    if(!result && typeof this.responsePattern[type] == 'function') {
        try {
            result = this.responsePattern[type](correctResponses, learnerResponse);
        } catch (e) {
            console.log(e);
            callback(e);
            return;
        }
    }
    var latency = params.latency || 0;
    callback(null, result);
    groups.each(groups.id(client), function(client) {
        call(client, componentId, "collect", user.id, result);
    });
}

exports.TYPE_TRUE_FALSE = "true-false";
exports.TYPE_CHOICE = "choice";
exports.TYPE_FILL_IN = "fill-in";
exports.TYPE_LIKERT = "likert";
exports.TYPE_MATCHING = "matching";
exports.TYPE_PERFORMANCE = "performance";
exports.TYPE_SEQUENCING = "sequencing";
exports.TYPE_NUMERIC = "numeric";
exports.TYPE_OTHER = "other";

exports.responsePattern = {
    "true-false": function(pattern, value) {
        return pattern === value;
    }
    ,"choice": function(patterns, values) {
        return patterns.some(function(pattern) {
            if(typeof pattern == 'string') {
                return pattern == values;
            } else if(typeof pattern == 'number') {
                return pattern == values;
            }
            return pattern.every(function(val) {
                return values.indexOf(val) > -1;
            });
        });
    }
    ,"fill-in": function(patterns, values) {
        return patterns.some(function(pattern) {
            return pattern.every(function(value, i) {
                return value === values[i];
            });
        });
    }
    ,"likert": function() {
        return null;
    }
    ,"matching": function (patterns, values) {
        return patterns.some(function(pattern) {
            pattern = Array.prototype.slice.call(pattern);
            return pattern.every(function(value, key) {
                return value == values[key];
            });
        });
    }
    ,"performance": function (patterns, values) {
        return patterns.some(function(pattern) {
            return pattern.every(function(step, i) {
                return step[0] === values[i][0]
                    && step[1] === values[i][1];
            });
        });
    }
    ,"sequencing": function (patterns, values) {
        return patterns.some(function(pattern) {
            return pattern.every(function(value, i) {
               return item == values[i]; 
            });
        });
    }
    ,"numeric": function (patterns, value) {
        return patterns.some(function(pattern) {
            return value >= pattern[0]
                && value <= pattern[1];
        });
    }
    ,"other": function() {
        return null;
    }
}
