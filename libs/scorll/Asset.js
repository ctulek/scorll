var groups = require('libs/scorll/Groups.js');
var client = require('libs/scorll/Client.js');

var assets = {
		"test": {id: "test", type: "text", data: {
text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vulputate dictum egestas. Curabitur nisi nisi, pellentesque quis sodales id, euismod ut magna. Ut dui lectus, volutpat id dictum sit amet, accumsan nec tortor. Aliquam ac dui non leo aliquam lacinia. Ut egestas nisi a magna elementum scelerisque. Sed mattis facilisis nunc quis elementum. Aenean nisl dui, lobortis sed vehicula porttitor, consectetur nec ante. Vivamus vestibulum dignissim sollicitudin. Aliquam vulputate, est vel vehicula convallis, mi nunc consectetur dui, quis condimentum ligula augue sed elit."}},
		"test2": {id: "test2", type: "text", data: {title: "Lorem bolem", text: "Curabitur congue, leo a sodales pulvinar, lacus mi consectetur libero, a blandit turpis sapien a nisi. Donec fringilla enim faucibus risus tincidunt pretium. Integer rhoncus tincidunt pulvinar. Ut quis enim vitae dui tristique rhoncus et non tellus. Sed convallis turpis ut arcu sagittis lobortis. Quisque commodo posuere venenatis. Morbi aliquet rutrum auctor. Phasellus facilisis justo vel purus fringilla eget tristique est varius."}},
		"image1": {id: "image1", type: "image", data: {
url: "http://www.worcesterk12.com/media/medium/Service_Learning.jpg"}},
		"question1": {id: "question1", type: "multiplechoice",
        data: {
            question: "Where is the United States Capitol?",
            correctResponses: [['0']],
            answers: ["Washington","New York", "San Francisco", "Boston"]}},
		"video1": {id: "video1", type: "youtube", data: {video: "NDfew0YcDTo"}},
		"video2": {id: "video2", type: "vimeo", data: {video: "22721995"}}
};

var tracking = {
};

exports.post = function(asset, callback) {
    var id = Date.now();
    asset['id'] = id;
    assets[id] = asset;
    callback && callback(null, id);
}

exports.get = function(id, callback) {
    if(typeof id == "object") {
        var items = id.map(function(index) {
            return assets[index];
        });
        callback && callback(null, items);
    } else {
        var asset = assets[id];
        asset ? callback && callback(null, asset) : callback && callback('Not found');
    }
}

exports.put = function(id, asset, callback) {
    if(assets[id]) {
        assets[id] = asset;
        callback && callback(null);
    } else {
        callback && callback('Not found');
    }
}

exports.delete = function(id, callback) {
    delete assets[id];
    callback && callback();
}

var call = function(ioclient, componentId, method) {
    client.call.apply(client, arguments);
}

exports.call = function(client, componentId, method) {
    var params = Array.prototype.slice.call(arguments);  
    var callback = params.pop();
    groups.each(groups.id(client), function(client) {
        params[0] = client;
        call.apply(null, params);
    });
}

exports.track = function(client, componentId, params, callback) {
    var assetId = params.assetId;
    var asset = assets[assetId];
    var user = client.user;
    var type = params.type;
    var timestamp = params.timestamp || new Date();
    var correctResponses = asset.data.correctResponses || [];
    var learnerResponse = params.response;
    var result = params.result || null;
    if(!result && correctResponses && typeof this.responsePattern[type] == 'function') {
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
    var assetTracking = tracking[assetId] = tracking[assetId] || {};
    var userTracking = assetTracking[user.id] = assetTracking[user.id] || {};
    userTracking['username'] = user.username;
    userTracking['response'] = learnerResponse;
    userTracking['result'] = result;
    groups.each(groups.id(client), function(client) {
        call(client, componentId, "collect", user.id, user.username, learnerResponse, result);
    });
}

exports.getTrackingResults = function(client, componentId, params, callback) {
    var userId = params.userId || null;
    var assetId = params.assetId || null;
    if(userId && assetId) {
        var assetTracking = tracking[assetId] || {};
        callback(null, assetTracking[userId] || {});
    } else if(assetId) {
        callback(null, tracking[assetId] || {});
    } else if(userId) {
        var results = [];
        for(assetId in tracking) {
            var result = tracking[assetId][userId];
            result && results.push({assetId: assetId, result: result});
        }
        callback(null, results);
    } else {
        callback("No userId or assetId defined");
    }
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
            if(pattern.length != values.length) {
                return false;
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
            pattern = Array.prototype.slice(pattern);
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
