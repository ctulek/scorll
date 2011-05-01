var DEFAULT_TIMEOUT = 24 * 60 * 60;

exports.auth = function(params, callback) {
    var cookie = params.cookie;
    var record = store[cookie] || null;
    if(!record) {
        callback("Invalid cookie");
    } else if(record.expiresAt < Date.now()) {
        callback("Cookie expired");
        delete store[cookie];
    } else {
        callback(null, record.user);
    }
}

exports.link = function(user, params, callback) {
    var cookie = params.cookie;
    var timeout = params.timeout || DEFAULT_TIMEOUT;
    timeout *= 1000;
    if(store[cookie]) {
        callback("Duplicate cookie");
    } else {
        store[username] = {expireAt: Date.now() + timeout, user: user};
        callback(null);
    }
}

var store = {};
