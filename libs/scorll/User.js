var users = {};
var authentication = require('./Authentication.js');

exports.join = function(client, params, callback) {
    var user = {id: Date.now()};
    authentication.link(user.id, params, function(err) {
        if(err) {
            callback(err);
        } else {
            client.user = user;
            users[user.id] = user;
            callback();
        }
    });
}

exports.login = function(client, params, callback) {
    authentication.auth(params, function(err, userid) {
        if(err) {
            callback(err);
        } else {
            var user = users[userid];
            client.user = user;
            callback();
        }
    });
}
