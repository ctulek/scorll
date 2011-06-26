var Group = function(args) {
    for(var i in args) {
        this[i] = args[i];
    }
    this.clients = {};
    this.clientCount = 0;
}

Group.prototype.getId = function() {
    return this.id;
}

Group.prototype.join = function(client, callback) {
    if(this.clients[client.getId()]) {
        callback && callback(null);
        return;
    }
    this.clients[client.getId()] = client;
    this.clientCount++;
    callback && callback(null);
}

Group.prototype.leave = function(client, callback) {
    if(!this.clients[client.getId()]) {
        callback && callback('Not in group');
        return;
    }
    delete this.clients[client.getId()];
    this.clientCount--;
    callback && callback(null);
}

Group.prototype.findById = function(id, callback) {
    var client = this.clients[id];
    var err = client ? null : "Cannot find client with id " + id;
    callback && callback(err, client);
}

Group.prototype.each = function(callback) {
    for(var i in this.clients) {
        callback(this.clients[i]);
    }
}

Group.prototype.broadcast = function(componentId, method) {
    var args = arguments;
    this.each(function(client) {
        client.call.apply(client, args);
    })
}

module.exports = Group;
