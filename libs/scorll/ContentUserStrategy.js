var Crypto = require('crypto');
var ContentUserStrategyPO = require('libs/scorll/model/ContentUserStrategy');
var UserPO = require('libs/scorll/model/User');
var EnrollmentPO = require('libs/scorll/model/Enrollment');

var ContentUserStrategy = function (params) {
    this.contentId = params.contentId ? params.contentId.toLowerCase() : null;
    this.username = params.username ? params.username.toLowerCase().trim() : null;
    this.password = params.password ? this.hashPassword(params.password) : null;
  }

ContentUserStrategy.prototype.hashPassword = function (password) {
  var sha512 = Crypto.createHash('sha512');
  var salt = this.username;
  sha512.update(salt);
  sha512.update(password);
  return sha512.digest();
}

ContentUserStrategy.prototype.check = function (callback) {
  var strategy = this;
  ContentUserStrategyPO.count({
    contentId: strategy.contentId,
    username: strategy.username
  }, function (err, count) {
    if (err) {
      callback && callback(err);
    }
    else if (count > 0) {
      callback && callback(strategy.username + " is already registered");
      return;
    }
    else {
      callback && callback(null);
    }
  });
}

ContentUserStrategy.prototype.auth = function (callback) {
  var strategy = this;
  var conditions = {
    contentId: strategy.contentId,
    username: strategy.username,
    password: strategy.password
  }
  ContentUserStrategyPO.findOne(conditions, function (err, record) {
    if (err) {
      callback && callback(err);
    }
    else {
      callback && callback(null, record.userId);
    }
  });
}

ContentUserStrategy.prototype.link = function (userId, callback) {
  var strategy = this;
  strategy.check(function (err) {
    if (err) {
      callback && callback(err);
      return;
    }
    var po = new ContentUserStrategyPO();
    po.contentId = strategy.contentId;
    po.userId = userId;
    po.username = strategy.username;
    po.password = strategy.password;
    po.save(callback);
  });
};

module.exports = ContentUserStrategy;
