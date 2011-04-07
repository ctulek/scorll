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
                client.message(message);
            });
        }
    },
    connect: function() {
        if(!this.connected && this.socket) {
            this.socket.connect();
        }
    },
    register: function(componentId, component) {
        this._components[componentId] = component;
    },
    message: function(message) {
        var err = message.status != 'ok' ?
                message.errorMessage : undefined;
        if(message.callbackId) {
            var callback = this._callbacks[message.callbackId];
            if(callback) {
                callback(err, message);
                this._callbacks[message.callbackId] = undefined;
            }
        } else if (message.componentId) {
            var component = this._components[message.componentId];
            if(component) {
                component.receive(err, message);
            }
        } else {
            console.warn("Unhandled message:", message);
        }
    },
    send: function(message, callback) {
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
