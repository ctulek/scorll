var CookieStrategyPO = require('libs/scorll/model/CookieStrategy');

var CookieStrategy = function (params) {
    this.cookie = params.cookie || null;
    this.expiresAt = params.expiresAt || null;
  }

CookieStrategy.prototype.check = function (callback) {
  CookieStrategyPO.count({
    cookie: this.cookie
  }, function (err, count) {
    if (err) {
      callback && callback(err);
    }
    else if (count > 0) {
      callback && callback("Duplicate cookie");
    }
    else {
      callback && callback();
    }
  });
}

CookieStrategy.prototype.auth = function (callback) {
  CookieStrategyPO.findOne({cookie: this.cookie}, function (err, record) {
    if (err) {
      callback && callback(err);
    }
    else if (!record) {
      callback && callback("Invalid cookie");
    }
    else if (record.expiresAt.getTime() < Date.now()) {
      record.remove();
      callback && callback("Cookie expired");
    }
    else {
      callback && callback(null, record.userId);
    }
  });
}

CookieStrategy.prototype.link = function (userId, callback) {
  var strategy = this;
  strategy.check(function (err) {
    if (err) {
      callback && callback(err);
      return;
    }
    var po = new CookieStrategyPO();
    po.userId = userId;
    po.cookie = strategy.cookie;
    po.expiresAt = strategy.expiresAt;
    po.save(callback);
  });
}

module.exports = CookieStrategy;
