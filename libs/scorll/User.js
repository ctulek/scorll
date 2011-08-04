var authentication = require('./Authentication.js');

var profiles = {};

var User = function () {
    this.id = null;
    this.profile = {};
    this.authenticated = false;
  }

User.prototype.getId = function () {
  return this.id;
}

User.prototype.register = function (params, callback) {
  var user = this;
  if (params.username) {
    user.profile.username = params.username;
  }
  if (params.email) {
    user.profile.email = params.email;
  }
  user.save(function (err) {
    authentication.link(user, params, function (err) {
      if (err) {
        callback(err);
      }
      else {
        user.authenticated = true;
        rememberme(user, callback);
      }
    });
  });
}

User.prototype.authN = function (params, callback) {
  var user = this;
  authentication.auth(user, params, function (err) {
    if (err) {
      callback(err);
    }
    else {
      user.authenticated = true;
      user.profile = profiles[user.id] || {};
      rememberme(user, callback);
    }
  });
}

User.prototype.save = function (callback) {
  this.id = this.id || Date.now() + Math.round(Math.random() * 100000);
  profiles[this.id] = this.profile;
  callback && callback();
}

User.prototype.load = function (callback) {
  callback && callback();
}

User.prototype.toData = function () {
  return {
    id: this.id,
    profile: this.profile,
    cookie: this.cookie,
    cookieExpiresAt: this.cookieExpiresAt
  }
}

var rememberme = function (user, callback) {
    var params = {
      strategy: "cookie"
    };
    authentication.link(user, params, function (err) {
      if (!err) {
        callback(null, user.toData());
      }
      else {
        callback(err);
      }
    });
  }

module.exports = User;
