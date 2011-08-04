var Asset = function (args) {
    for (var k in args) {
      this[k] = args[k];
    }
    this.tracking = {};
  }

Asset.prototype.getId = function () {
  return this.id;
}

Asset.prototype.populate = function (assetData) {
  for (var k in assetData) {
    this[k] = assetData[k];
  }
}

Asset.prototype.toAssetData = function () {
  return {
    id: this.id,
    type: this.type,
    data: this.data
  }
}

Asset.prototype.save = function (callback) {
  this.id = this.id || Date.now() + Math.round(Math.random() * 1000);
  callback && callback();
}

Asset.prototype.delete = function (callback) {
  callback && callback();
}

// Shared
Asset.prototype.call = function (client, method, args, callback) {
  client.broadcast(this.getId(), method, args);
}


module.exports = Asset;

Asset.prototype.track = function (client, params, callback) {
  var user = client.user;
  var type = params.type;
  var timestamp = params.timestamp || new Date();
  var correctResponses = this.data.correctResponses || [];
  var learnerResponse = params.response;
  var result = params.result || null;
  if (!result && correctResponses && typeof this.responsePattern[type] == 'function') {
    try {
      result = this.responsePattern[type](correctResponses, learnerResponse);
    }
    catch (e) {
      console.log(e);
      callback(e);
      return;
    }
  }
  var latency = params.latency || 0;
  callback(null, result);
  var userTracking = this.tracking[user.id] = this.tracking[user.id] || {};
  userTracking['username'] = user.username;
  userTracking['response'] = learnerResponse;
  userTracking['result'] = result;
  client.broadcast(this.getId(), 'collect', user.id, user.username, learnerResponse, result);
}

Asset.prototype.getTrackingResults = function (client, params, callback) {
  var userId = params.userId || null;
  if (userId) {
    var err = this.tracking[userId] ? null : "No record found";
    callback && callback(err, this.tracking[userId] || null);
  }
  else {
    callback && callback(null, this.tracking);
  }
}

Asset.prototype.TYPE_TRUE_FALSE = "true-false";
Asset.prototype.TYPE_CHOICE = "choice";
Asset.prototype.TYPE_FILL_IN = "fill-in";
Asset.prototype.TYPE_LIKERT = "likert";
Asset.prototype.TYPE_MATCHING = "matching";
Asset.prototype.TYPE_PERFORMANCE = "performance";
Asset.prototype.TYPE_SEQUENCING = "sequencing";
Asset.prototype.TYPE_NUMERIC = "numeric";
Asset.prototype.TYPE_OTHER = "other";

Asset.prototype.responsePattern = {
  "true-false": function (pattern, value) {
    return pattern === value;
  },
  "choice": function (patterns, values) {
    return patterns.some(function (pattern) {
      if (typeof pattern == 'string') {
        return pattern == values;
      }
      else if (typeof pattern == 'number') {
        return pattern == values;
      }
      if (pattern.length != values.length) {
        return false;
      }
      return pattern.every(function (val) {
        return values.indexOf(val) > -1;
      });
    });
  },
  "fill-in": function (patterns, values) {
    return patterns.some(function (pattern) {
      return pattern.every(function (value, i) {
        return value === values[i];
      });
    });
  },
  "likert": function () {
    return null;
  },
  "matching": function (patterns, values) {
    return patterns.some(function (pattern) {
      pattern = Array.prototype.slice(pattern);
      return pattern.every(function (value, key) {
        return value == values[key];
      });
    });
  },
  "performance": function (patterns, values) {
    return patterns.some(function (pattern) {
      return pattern.every(function (step, i) {
        return step[0] === values[i][0] && step[1] === values[i][1];
      });
    });
  },
  "sequencing": function (patterns, values) {
    return patterns.some(function (pattern) {
      return pattern.every(function (value, i) {
        return item == values[i];
      });
    });
  },
  "numeric": function (patterns, value) {
    return patterns.some(function (pattern) {
      return value >= pattern[0] && value <= pattern[1];
    });
  },
  "other": function () {
    return null;
  }
}
