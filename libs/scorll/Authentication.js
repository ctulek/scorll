var strategies = {
  user: require('./UserStrategy.js'),
  cookie: require('./CookieStrategy.js')
};

exports.auth = function (user, params, callback) {
  var strategy = strategies[params.strategy] || null;
  if (!strategy) {
    callback("Undefined strategy: " + params.strategy);
  } else {
    strategy.auth(user, params, callback);
  }
}

exports.link = function (user, params, callback) {
  var strategy = strategies[params.strategy] || null;
  if (!strategy) {
    callback("Undefined strategy: " + params.strategy);
  } else {
    strategy.link(user, params, callback);
  }
}
