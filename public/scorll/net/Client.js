if(!dojo._hasResource["scorll.net.Client"]){
dojo._hasResource["scorll.net.Client"]=true;
dojo.provide("scorll.net.Client");
dojo.declare("scorll.net.Client",null,{
    socket: null,
    connected: false,
    _callbacks: {},
    _components: {},
    _callbackIdCounter: 1,
    onConnect: function() {
    },
    constructor: function(/* Object */ args) {
        var client = this;
        if(io.Socket) {
            client.socket = new io.Socket();
            client.socket.on('connect', function(){
                client.connected = true;
                console.log("Connected to server");
                client.onConnect();
            }); 
            client.socket.on('disconnect', function(){
                client.connected = false;
                console.log("Disconnected from server");
            }); 
            client.socket.on('message', function(message) {
                client._message(message);
            });
        }
    },
    connect: function() {
        if(!this.connected && this.socket) {
            this.socket.connect();
        }
    },
    register: function(/* scorll.net.ClientComponent */ component) {
        this._components[component.getComponentId()] = component;
    },
    _message: function(/* Object */ message) {
        var client = this;
        if (message.componentId) {
            var callbackId = message.callbackId;
            var callback = function(err) {
                if(callbackId) {
                    var message = {};
                    message.callbackId = callbackId;
                    message.params = Array.prototype.slice.call(arguments);
                    client.socket.send(message);
                }
            }
            var component = client._components[message.componentId];
            if(component) {
                var params = message.params || [];
                params.push(callback);
                var method = component[message.method] || null;
                method && method.apply(component, message.params);
            } else {
                console.error("Undefined component id");
            }
        } else if(message.callbackId) {
            var callback = client._callbacks[message.callbackId];
            if(callback) {
                callback.apply(null, message.params);
                delete client._callbacks[message.callbackId];
            } else {
                console.error("Undefined callback id");
            }
        } else {
            console.error("Invalid message:", message);
        }
    },
    call: function(/* scorll.net.ClientComponent */ component,
                   /* String */ method) {
        var args = Array.prototype.slice.call(arguments);  
        var params = args.slice(2);
        var callback = params.pop();
        if(typeof callback != "function") {
            params.push(callback);
            callback = null;
        }
        var message = {};
        message.component = component.getComponentType();
        message.method = method;
        message.params = params;
        if(this.connected && this.socket) {
            if(callback) {
                var callbackId = this._callbackIdCounter++;
                this._callbacks[callbackId] = callback;
                message.callbackId = callbackId; 
            }
            this.socket.send(message);
        } else {
            console.error("Client is not connected");
        }
    }
});
}
