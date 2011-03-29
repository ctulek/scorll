if(!dojo._hasResource["scorll.net.Server"]){
dojo._hasResource["scorll.net.Server"]=true;
dojo.provide("scorll.net.Server");
dojo.declare("scorll.net.Server",null,{
socket: null,
connected: false,
_callbacks: {},
_callbackIdCounter: 1,
onConnect: function() {
},
constructor: function(/* Object */ args) {
    var server = this;
    if(io.Socket) {
        server.socket = new io.Socket();
        server.socket.on('connect', function(){
            server.connected = true;
            console.log("Connected to server");
            server.onConnect();
        }); 
        server.socket.on('disconnect', function(){
            server.connected = false;
            console.log("Disconnected from server");
        }); 
        server.socket.on('message', function(message) {
            server.message(message);
        });
    }
},
connect: function() {
    if(!this.connected && this.socket) {
        this.socket.connect();
    }
},
message: function(message) {
    if(message.callbackId) {
        var callback = this._callbacks[message.callbackId];
        if(callback) {
            callback(message.data);
            this._callbacks[message.callbackId] = undefined;
        }
    }
},
send: function(message, callback) {
    if(this.connected && this.socket) {
        message = {data: message};
        if(callback) {
            var callbackId = this._callbackIdCounter++;
            this._callbacks[callbackId] = callback;
            message.callbackId = callbackId; 
        }
        this.socket.send(message);
    } else {
        console.err("Server is not connected");
    }
}
});
}
