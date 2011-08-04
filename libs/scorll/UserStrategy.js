exports.auth = function (user, params, callback) {
  var username = params.username;
  var password = params.password;
  var record = store[username] || null;
  if (!record) {
    callback && callback("Username or password is invalid");
  }
  else if (record.password != password) {
    callback && callback("Username or password is invalid");
  }
  else {
    user.id = record.userId;
    callback && callback(null);
  }
};

exports.link = function (user, params, callback) {
  var username = params.username;
  var email = params.email;
  var password = params.password;
  if (store[username]) {
    callback(username + " is already registered");
  }
  else if (emails[email]) {
    callback(email + " is already registered");
  }
  else {
    store[username] = {
      userId: user.id,
      username: username,
      password: password
    };
    emails[email] = username;
    callback(null);
  }
};

var store = {};
var emails = {};
