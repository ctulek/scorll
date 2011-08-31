var User = require('libs/scorll/User');
var UserPO = require('libs/scorll/model/User');

var UserSet = function (args) {
    for (var key in args) {
      this[key] = args[key];
    }
    this.userCount = 0;
    this.users = {};
  }

UserSet.prototype.add = function (user, callback) {
  var userSet = this;
  user.save(function (err) {
    if (err) {
      console.error(err);
      callback && callback(err);
      return;
    }
    userSet.users[user.getId()] = user;
    userSet.userCount++;
    console.info('User added. ' + userSet.userCount + " user(s) in total.");
    callback && callback(null);
  });
}

UserSet.prototype.delete = function (user, callback) {
  var userSet = this;
  user.delete(function (err) {
    if (err) {
      console.error(err);
      callback && callback(err);
      return;
    }
    if (userSet.users[user.getId()]) {
      delete userSet.users[user.getId()];
      userSet.userCount--;
      console.info('User removed. ' + userSet.userCount + " user(s) in total.");
    }
    callback && callback();
  });
}

UserSet.prototype.findById = function (id, callback) {
  var userSet = this;
  var user = this.users[id];
  if (user) {
    callback && callback(null, user);
    return;
  }
  UserPO.findById(id, function (err, userPO) {
    if (err) {
      console.error(err);
      callback && callback(err);
      return;
    }
    var args = {
      po: userPO,
      contentSet: userSet.contentSet
    }
    var user = new User(args);
    userSet.users[user.getId()] = user;
    userSet.userCount++;
    console.info('User added from database. ' + userSet.userCount + " user(s) in total.");
    callback && callback(err, user);
  });
}

module.exports = UserSet;
