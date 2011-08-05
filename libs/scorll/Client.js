var util = require('util');
var events = require('events');

var User = require('libs/scorll/User');

var Client = function (args) {
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
        if (!err) {
          client.group = group;
        }
        else {
          console.error(err);
        }
      });
    }
    callback && callback(err);
  });
}

Client.prototype.register = function (params, callback) {
  this.user.register(params, callback);
}

Client.prototype.authN = function (params, callback) {
  this.user.authN(params, callback);
}

Client.prototype.authZ = function (params, callback) {
  this.user.authZ(params, callback);
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
