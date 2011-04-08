var groups = {};
var index = {};

exports.add = function(groupId, client) {
    if(groups[groupId] == undefined) {
        groups[groupId] = {};
    }
    var group = groups[groupId];
    group[client.sessionId] = client;
    index[client.sessionId] = groupId;
    client.on('disconnect', function() {
        delete(group[this.sessionId]);
        delete(index[this.sessionId]);
    });
}

exports.id = function(client) {
    return index[client.sessionId];
}

exports.each = function(groupId, callback) {
    var group = groups[groupId];
    if(group) {
        for(var i in group) {
            var client = group[i];
            callback(client);
        }
    }
}
