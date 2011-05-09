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
            rememberme(user, params, callback);
        }
    });
}

exports.auth = function(client, params, callback) {
    authentication.auth(params, function(err, userid) {
        if(err) {
            callback(err);
        } else {
            var user = users[userid];
            client.user = user;
            rememberme(user, params, callback);
        }
    });
}

var rememberme = function(user, params, callback) {
    var params = {
        strategy: "cookie"
    };
    authentication.link(user.id, params, function(err, data) {
        if(!err) {
            user.cookie = data.cookie;
            user.cookieExpiresAt = data.expiresAt;
            callback(null, user);
        } else {
            callback(err);
        }
    });
}
