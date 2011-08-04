var DEFAULT_TIMEOUT = 24 * 60 * 60;

exports.auth = function (user, params, callback) {
  var cookie = params.cookie;
  var record = store[cookie] || null;
  if (!record) {
    callback && callback("Invalid cookie");
  } else if (record.expiresAt < Date.now()) {
    callback && callback("Cookie expired");
    delete store[cookie];
  } else {
    user.id = record.userId;
    callback && callback(null);
  }
}

exports.link = function (user, params, callback) {
  var cookie = params.cookie || createCookie();
  var timeout = params.timeout || DEFAULT_TIMEOUT;
  timeout *= 1000;
  timeout += Date.now();
  if (store[cookie]) {
    callback && callback("Duplicate cookie");
  } else {
    store[cookie] = {
      expiresAt: timeout,
      userId: user.id
    };
    var expiresAt = (new Date(timeout)).toUTCString();
    user.cookie = cookie;
    user.cookieExpiresAt = expiresAt;
    callback && callback(null);
  }
}

var store = {};


var createCookie = function () {
    return "COOKIE" + Date.now();
  }
