var util = require('util');
var events = require('events');

var User = require('libs/scorll/User');
var UserPO = require('libs/scorll/model/User');
var EnrollmentPO = require('libs/scorll/model/Enrollment');
var Authentication = require('./Authentication');

var Client = function (args) {
    this.content = null;
    for (var key in args) {
      this[key] = args[key];
    }
    this.user = this.user || new User(args);
    var client = this;
    if (this.ioClient) {
      this.ioClient.on('message', function (message) {
        client.message(message);
      });
      this.ioClient.on('disconnect', function () {
        client.emit('disconnect');
      });
    }
    this._callbackIdCounter = 0;
    this._callbacks = {};
  }

util.inherits(Client, events.EventEmitter);

Client.prototype.getId = function () {
  return this.ioClient && this.ioClient.id;
}

Client.prototype.join = function (groupId, callback) {
  var client = this;
  this.groupSet.findById(groupId, function (err, group) {
    if (err) {
      console.error(err);
      callback && callback(err);
      return;
    }
    if (group) {
      group.join(client, function (err) {
        if (err) {
          console.error(err);
          callback && callback(err);
          return;
        }
        client.group = group;
        client.contentSet.findById(groupId, function (err, content) {
          if (err) {
            console.error(err);
            callback && callback(err);
            return;
          }
          client.clientComponentSet && client.clientComponentSet.add(content);
          client.content = content;
          callback && callback();
        });
      });
    }
  });
}

Client.prototype.register = function (params, callback) {
  var client = this;
  var args = {
    po: new UserPO(),
    contentSet: client.contentSet
  }
  var user = client.user = new User(args);
  if (params.username) {
    user.po.profile.username = params.username;
  }
  if (params.email) {
    user.po.profile.email = params.email;
  }
  client.userSet.add(user, function (err) {
    if (err) {
      callback && callback(err);
      return;
    }
    var auth = new Authentication(params);
    auth.link(user.getId(), function (err) {
      if (err) {
        console.log(err);
        client.userSet.delete(user);
        client.user = null;
        callback && callback(err);
        return;
      }
      client.rememberme(function(err) {
        if(err) {
          console.error(err);
          callback && callback(err);
          return;
        }
        client.enroll(function(err) {
          if(err) {
            console.error(err);
            callback && callback(err);
            return;
          }
          callback(null, client.user.toData());
        });
      });
    });
  });
}

Client.prototype.authN = function (params, callback) {
  var client = this;
  var auth = new Authentication(params);
  auth.auth(function (err, userId) {
    if (err) {
      callback(err);
    }
    else {
      client.userSet.findById(userId, function (err, user) {
        if (err) {
          console.error(err);
          callback && callback(err);
          return;
        }
        client.user = user;
        if (params.strategy != "cookie") {
          client.rememberme(function(err) {
            if(err) {
              console.error(err);
              callback && callback(err);
              return;
            }
            client.enroll(function(err) {
              if(err) {
                console.error(err);
                callback && callback(err);
                return;
              }
              callback(null, client.user.toData());
            });
          });
        }
        else {
          client.enroll(function(err) {
            if(err) {
              console.error(err);
              callback && callback(err);
              return;
            }
            callback(null, client.user.toData());
          });
        }
      });
    }
  });
}

Client.prototype.authZ = function (params, callback) {
  this.user.authZ(params, callback);
}

Client.prototype.rememberme = function (callback) {
  var client = this;
  var user = client.user;
  var params = {
    strategy: "cookie",
    cookie: client.createCookie(),
    expiresAt: new Date(24 * 60 * 60 * 1000 + Date.now())
  };
  var auth = new Authentication(params)
  auth.link(user.getId(), function (err) {
    if (err) {
      console.log(err);
      callback && callback(err);
    }
    else {
      user.cookie = params.cookie;
      user.cookieExpiresAt = params.expiresAt;
      callback && callback(null, user.toData());
    }
  });
}

Client.prototype.enroll = function(callback) {
  var client = this;
  if(!client.user || !client.user.getId()) {
    var err = "User is not defined";
    console.error(err);
    callback && callback(err);
    return;
  }
  else if(!client.content || !client.content.getId()) {
    var err = "Content is not defined";
    console.error(err);
    callback && callback(err);
    return;
  }
  var conditions = {userId: client.user.getId(), contentId:
  client.content.getId()};
  EnrollmentPO.count(conditions, function(err, count) {
    if(err) {
      console.error(err);
      callback && callback(err);
      return;
    }
    if(count > 0) {
      callback && callback();
      return;
    }
    var enrollment = new EnrollmentPO();
    enrollment.userId = client.user.getId();
    enrollment.contentId = client.content.getId();
    enrollment.save(function(err) {
      if(err) {
        console.error(err);
        callback && callback(err);
        return;
      }
      callback && callback();
    });
  });
}

Client.prototype.createCookie = function () {
  return "SCORLLCOOKIE" + Date.now();
}

Client.prototype.message = function (message) {
  if (message.componentId) {
    this.handleComponentMessage(message);
  }
  else if (message.method) {
    this.handleMethodCallMessage(message);
  }
  else if (message.callbackId) {
    this.handleCallbackMessage(message);
  }
  else {
    console.error("Invalid message:", message);
  }
}

Client.prototype.handleComponentMessage = function (message) {
  var client = this;
  this.clientComponentSet.findById(message.componentId, function (err, component) {
    if (err || !component) {
      console.error("Cannot find component '" + message.componentId + "'");
      return;
    }
    var callbackId = message.callbackId;
    var callback = function (err) {
        if (callbackId) {
          var message = {
            callbackId: callbackId,
            params: Array.prototype.slice.call(arguments)
          }
          client.ioClient.json.send(message);
        }
      }
    var method = component[message.method] || null;
    if (method) {
      var params = message.params || [];
      params.unshift(client);
      params.push(callback);
      if (params.length == method.length) {
        method.apply(component, params);
      }
      else {
        console.log(params);
        var err = "Argument count is not equal to argument count expected by the" + " function " + message.componentId + "/" + message.method;
        callback(err);
        console.error(err);
      }
    }
    else {
      var err = "Undefined component/action type:" + message.componentId + "/" + message.action;
      callback(err);
      console.error(err);
    }
  });
}

Client.prototype.handleMethodCallMessage = function (message) {
  var client = this;
  var callbackId = message.callbackId;
  var callback = function (err) {
      if (callbackId) {
        var message = {
          callbackId: callbackId,
          params: Array.prototype.slice.call(arguments)
        }
        client.ioClient.json.send(message);
      }
    }
  var params = message.params || [];
  params.push(callback);
  if (typeof (this[message.method]) == "function") {
    this[message.method].apply(this, params);
  }
  else {
    callback("Undefined method: " + message.method);
  }
}

Client.prototype.handleCallbackMessage = function (message) {
  var callback = this._callbacks[message.callbackId];
  if (callback) {
    callback.apply(null, message.params);
    delete this._callbacks[message.callbackId];
  }
  else {
    console.error("Undefined callback id");
  }
}

Client.prototype.call = function (componentId, method) {
  var message = {};
  message.componentId = componentId;
  message.method = method;
  var args = Array.prototype.slice.call(arguments);
  var params = args.slice(2);
  var callback = params.pop();
  if (typeof callback != "function") {
    params.push(callback);
  }
  else {
    var callbackId = this._callbackIdCounter++;
    this._callbacks[callbackId] = callback;
    message.callbackId = callbackId;
  }
  message.params = params;
  this.ioClient.json.send(message);
}

Client.prototype.broadcast = function () {
  this.group && this.group.broadcast.apply(this.group, arguments);
}

module.exports = Client;
