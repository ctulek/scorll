exports.auth = function (user, params, callback) {
    var email = params.email;
    var password = params.password;
    var record = store[email] || null;
    if (!record) {
        callback && callback("Email or password is invalid");
    } else if (record.password != password) {
        callback && callback("Email or password is invalid");
    } else {
        user.id = record.userId;
        user.email = record.email;
        callback && callback(null);
    }
};

exports.link = function (user, params, callback) {
    var email = params.email;
    var password = params.password;
    if (store[email]) {
        callback(email + " is already registered");
    } else {
        store[email] = {
            userId: user.id,
            email: email,
            password: password
        };
        user.email = email;
        callback(null);
    }
};

var store = {};
