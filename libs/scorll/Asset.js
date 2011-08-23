var TrackingPO = require('libs/scorll/model/Tracking');

var Asset = function (args) {
    this.po = null;
    for (var k in args) {
      this[k] = args[k];
    }
    if (this.po && !this.po.interaction) {
      this.po.interaction = {};
    }
  }

Asset.prototype.getId = function () {
  return this.po ? this.po.id : null;
}

Asset.prototype.populate = function (assetData) {
  if (this.po) {
    for (var k in assetData) {
      this.po[k] = assetData[k];
    }
  }
}

Asset.prototype.toAssetData = function (isTeacher) {
  var data = {
    id: this.po.id,
    type: this.po.type,
    data: this.po.data
  }
  if (isTeacher) {
    data.interaction = this.po.interaction;
  }
  return data;
}

Asset.prototype.save = function (callback) {
  if (!this.po) {
    callback && callback();
  }
  this.po.save(function (err) {
    callback && callback(err);
  });
}

Asset.prototype.delete = function (callback) {
  var asset = this;
  if (!asset.po) {
    var err = "Undefined po object";
    console.error(err);
    callback && callback(err);
    return;
  }
  var assetId = asset.getId();
  asset.po.remove(function (err) {
    if (err) {
      console.error(err);
      callback && callback(err);
      return;
    }
    TrackingPO.remove({
      assetId: assetId
    }, function (err) {
      if (err) {
        console.error(err);
        callback && callback(err);
        return;
      }
      callback && callback();
    });
  });
}

// Shared
Asset.prototype.call = function (client, method, args, callback) {
  client.broadcast(this.getId(), method, args);
}

module.exports = Asset;

Asset.prototype.track = function (client, params, callback) {
  var asset = this;
  var user = client.user;
  var type = params.type;
  var timestamp = params.timestamp || new Date();
  var correctResponses = asset.getCorrectResponses();
  var learnerResponse = params.response;
  var result = params.result || null;
  if (!result && correctResponses && typeof asset.responsePattern[type] == 'function') {
    try {
      result = asset.responsePattern[type](correctResponses, learnerResponse);
    }
    catch (e) {
      console.error(e);
      callback && callback(e);
      return;
    }
  }
  var latency = params.latency || 0;
  var conditions = {
    ownerId: user.getId(),
    assetId: asset.getId()
  };
  TrackingPO.findOne(conditions, function (err, tracking) {
    if (err) {
      console.error(err);
      callback && callback(err);
      return;
    }
    if (!tracking) {
      tracking = new TrackingPO();
      tracking.ownerId = user.getId();
      tracking.username = user.po.profile.username;
      tracking.assetId = asset.getId();
      tracking.responses = [];
    }
    tracking.updated = new Date();
    var response = {
      date: new Date(),
      response: learnerResponse,
      result: result
    }
    tracking.responses.push(response);
    tracking.save(function (err) {
      if (err) {
        console.error(err);
        callback && callback(err);
        return;
      }
      callback(null, result);
      client.broadcast(asset.getId(), 'collect', tracking);
    });
  });
}

Asset.prototype.getCorrectResponses = function () {
  if (this.po && this.po.interaction && this.po.interaction.correctResponses) {
    return this.po.interaction.correctResponses;
  }
  else {
    return [];
  }
}

Asset.prototype.getTrackingResults = function (client, params, callback) {
  var asset = this;
  var userId = params.userId || null;
  if (userId) {
    var conditions = {
      ownerId: userId,
      assetId: asset.getId()
    };
    TrackingPO.findOne(conditions, function (err, tracking) {
      if (err) {
        console.error(err);
        callback && callback(err);
        return;
      }
      callback && callback(null, tracking);
    });
  }
  else {
    var conditions = {
      assetId: asset.getId()
    };
    TrackingPO.find(conditions, function (err, tracking) {
      if (err) {
        console.error(err);
        callback && callback(err);
        return;
      }
      callback && callback(null, tracking);
    });
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
