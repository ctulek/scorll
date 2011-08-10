var Crypto = require('crypto');
var UserStrategyPO = require('libs/scorll/model/UserStrategy');

var UserStrategy = function (params) {
    this.username = params.username ? params.username.toLowerCase() : null;
    this.password = params.password ? this.hashPassword(params.password) : null;
    this.email = params.email ? params.email.toLowerCase() : null;
  }

UserStrategy.prototype.hashPassword = function (password) {
  var sha512 = Crypto.createHash('sha512');
  var salt = this.username;
  sha512.update(salt);
  sha512.update(password);
  return sha512.digest();
}

UserStrategy.prototype.check = function (callback) {
  var strategy = this;
  UserStrategyPO.count({
    username: strategy.username
  }, function (err, count) {
    if (err) {
      callback && callback(err);
    }
    else if (count > 0) {
      callback && callback(strategy.username + " is already registered");
      return;
    }
    UserStrategyPO.count({
      email: strategy.email
    }, function (err, count) {
      if (err) {
        callback && callback(err);
      }
      else if (count > 0) {
        callback && callback(strategy.email + " is already registered");
      }
      else {
        callback && callback(null);
      }
    });
  });
}

UserStrategy.prototype.auth = function (callback) {
  var conditions = {
    username: this.username,
    password: this.password
  }
  UserStrategyPO.findOne(conditions, function (err, record) {
    if (err) {
      callback && callback(err);
    }
    else if (!record) {
      callback && callback("Invalid username or password");
    }
    else {
      callback && callback(null, record.userId);
    }
  });
}

UserStrategy.prototype.link = function (userId, callback) {
  var strategy = this;
  strategy.check(function (err) {
    if (err) {
      callback && callback(err);
      return;
    }
    var po = new UserStrategyPO();
    po.userId = userId;
    po.username = strategy.username;
    po.email = strategy.email;
    po.password = strategy.password;
    po.save(callback);
  });
};

module.exports = UserStrategy;
