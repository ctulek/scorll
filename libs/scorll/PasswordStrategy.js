exports.auth = function(params, callback) {
    var username = params.username;
    var password = params.password;
    var record = store[username] || null;
    if(!record) {
        callback("Username or password is invalid");
    } else if(record.password != password) {
        callback("Username or password is invalid");
    } else {
        callback(null, record.user);
    }
}

exports.link = function(userid, params, callback) {
    var username = params.username;
    var password = params.password;
    if(store[username]) {
        callback(username + " is already registered");
    } else {
        store[username] = {password: password, userid: userid};
        callback(null);
    }
}

var store = {};
