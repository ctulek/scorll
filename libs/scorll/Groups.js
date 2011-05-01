var groups = {};

exports.add = function(groupId, client) {
    if(groups[groupId] == undefined) {
        groups[groupId] = {};
    }
    var group = groups[groupId];
    group[client.sessionId] = client;
    client.groupId = groupId;
    client.on('disconnect', function() {
        delete(group[this.sessionId]);
    });
}

exports.id = function(client) {
    return client.groupId;
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
