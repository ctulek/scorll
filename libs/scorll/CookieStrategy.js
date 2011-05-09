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
        callback(null, record.userid);
    }
}

exports.link = function(userid, params, callback) {
    var cookie = params.cookie || createCookie();
    var timeout = params.timeout || DEFAULT_TIMEOUT;
    timeout *= 1000;
    timeout += Date.now();
    if(store[cookie]) {
        callback("Duplicate cookie");
    } else {
        store[cookie] = {expiresAt: timeout, userid: userid};
        var expiresAt = (new Date(timeout)).toUTCString();
        callback(null, {cookie: cookie, expiresAt: expiresAt});
    }
}

var store = {};


var createCookie = function() {
    return "COOKIE" + Date.now();
}
