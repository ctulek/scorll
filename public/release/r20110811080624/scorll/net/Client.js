/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["scorll.net.Client"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.net.Client"] = true;
dojo.provide("scorll.net.Client");
dojo.declare("scorll.net.Client", null, {
  socket: null,
  connected: false,
  groupId: null,
  _callbacks: {},
  _components: {},
  _callbackIdCounter: 2,
  onConnect: function () {},
  constructor: function ( /* Object */ args) {
    for (var i in args) {
      this[i] = args[i];
    }
    var client = this;
    if (io.Socket) {
      client.socket = io.connect();
      client.socket.on('connect', function () {
        console.log("Connected to server");
        client.connected = true;
        client.call(null, 'join', client.groupId, function (err) {
          if (err) {
            console.error(err);
            return;
          }
          client.onConnect();
        });
      });
      client.socket.on('disconnect', function () {
        client.connected = false;
        console.log("Disconnected from server");
      });
      client.socket.on('message', function (message) {
        client._message(message);
      });
    }
  },
  connect: function () {
    return;
    if (!this.connected && this.socket) {
      this.socket.connect();
    }
  },
  register: function ( /* scorll.net.ClientComponent */ component) {
    this._components[component.getComponentId()] = component;
    component.client = this;
  },
  _message: function ( /* Object */ message) {
    var client = this;
    if (message.componentId) {
      var callbackId = message.callbackId;
      var callback = function (err) {
          if (callbackId) {
            var message = {};
            message.callbackId = callbackId;
            message.params = Array.prototype.slice.call(arguments);
            client.socket.json.send(message);
          }
        }
      var component = client._components[message.componentId];
      if (component) {
        var params = message.params || [];
        params.push(callback);
        var method = component[message.method] || null;
        method && method.apply(component, message.params);
      }
      else {
        console.error("Undefined component id");
      }
    }
    else if (message.callbackId) {
      var callback = client._callbacks[message.callbackId];
      if (callback) {
        callback.apply(null, message.params);
        delete client._callbacks[message.callbackId];
      }
      else {
        console.error("Undefined callback id");
      }
    }
    else {
      console.error("Invalid message:", message);
    }
  },
  call: function ( /* scorll.net.ClientComponent */ component, /* String */ method) {
    var client = this;
    var args = Array.prototype.slice.call(arguments);
    var params = args.slice(2);
    var callback = params.pop();
    if (typeof callback != "function") {
      params.push(callback);
      callback = null;
    }
    var message = {};
    message.componentId = component && component.getComponentId();
    message.method = method;
    message.params = params;
    if (client.connected && client.socket) {
      if (callback) {
        var callbackId = client._callbackIdCounter++;
        client._callbacks[callbackId] = callback;
        message.callbackId = callbackId;
      }
      client.socket.json.send(message);
    }
    else {
      console.error("Client is not connected");
    }
  }
});

}
