var components = {
    user: require('libs/scorll/User.js')
    ,content: require('libs/scorll/Content.js')
    ,asset: require('libs/scorll/Asset.js')
}

var clientCount = 0;

exports.add = function(client) {
    clientCount++;
	console.log('Client connected. ' + clientCount + " client(s) in total.");
	client.on('message', function(message) {
        _message(client, message);
	});
	client.on('disconnect', function() {
        clientCount--;
        console.log('Client disconnected. ' + clientCount + " client(s) in total.");
	});
}

var _message = function(client, message) {
    if(message.component) {
        var callbackId = message.callbackId;
        var callback = function(err) {
            if(callbackId) {
                var message = {};
                message.callbackId = callbackId;
                message.params = Array.prototype.slice.call(arguments);
                client.send(message);
            }
        }
        var component = components[message.component] || null;
        var method = component[message.method] || null;
        if(method) {
            var params = message.params || [];
            params.unshift(client);
            params.push(callback);
            if(params.length >= method.length) {
                method.apply(component, params);
            } else {
                var err = "Argument count is less than the"
                    + " argument count expected by the"
                    + " function " + message.component
                    + "/" + message.method;
                callback(err);
                console.error(err);
            }
        } else {
            var err = "Undefined component/action type:"
                + message.component
                + "/" + message.action;
            callback(err);
            console.error(err);
        }
    } else if(message.callbackId) {
        var callback = _callbacks[message.callbackId];
        if(callback) {
            callback.apply(null, message.params);
            delete _callbacks[message.callbackId];
        } else {
            console.error("Undefined callback id");
        }
    } else {
        console.error("Invalid message:", message);
    }
}

var _callbackIdCounter = 0;
var _callbacks = {};

exports.call = function(client, componentId, method) {
    var message = {};
    message.componentId = componentId;
    message.method = method;
    var args = Array.prototype.slice.call(arguments);  
    var params = args.slice(3);
    var callback = params.pop();
    if(typeof callback != "function") {
        params.push(callback);
    } else {
        var callbackId = _callbackIdCounter++;
        _callbacks[callbackId] = callback;
        message.callbackId = callbackId; 
    }
    message.params = params;
    client.send(message);
}
