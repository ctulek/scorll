var authentication = require('./Authentication.js');

var profiles = {};

var User = function (args) {
    this.po = null;
    this.authenticated = false;
    for (var key in args) {
      this[key] = args[key];
    }
    this.cookie = null;
    this.cookieExpiresAt = null;
  }

User.prototype.getId = function () {
  return this.po ? this.po.id : this.id;
}

User.prototype.authZ = function (params, callback) {
  var user = this;
  var contentId = params.contentId || null;
  user.contentSet.findById(contentId, function (err, content) {
    if (err) {
      callback && callback(err);
      return;
    }
    if (content.getOwnerId() == user.getId()) {
      callback && callback(null, ["teacher"]);
    }
    else {
      callback && callback(null, ["student"]);
    }
  });
}

User.prototype.save = function (callback) {
  if (!this.po) {
    callback && callback();
  }
  this.po.save(function (err) {
    callback && callback(err);
  });
}

User.prototype.delete = function (callback) {
  if (!this.po) {
    callback && callback();
  }
  this.po.remove(function (err) {
    callback && callback(err);
  });
}


User.prototype.load = function (callback) {
  callback && callback();
}

User.prototype.toData = function () {
  return {
    id: this.getId(),
    profile: this.po ? this.po.profile : {},
    cookie: this.cookie,
    cookieExpiresAt: (new Date(this.cookieExpiresAt)).toUTCString()
  }
}


module.exports = User;
