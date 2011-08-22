var strategies = {
  user: require('./UserStrategy.js'),
  cookie: require('./CookieStrategy.js'),
  "content-user": require('./ContentUserStrategy.js')
};

var Authentication = function (params) {
    this.params = params;
    if (strategies[params.strategy]) {
      this.strategy = new strategies[params.strategy](params);
    }
    else {
      this.strategy = null;
    }
  }

Authentication.prototype.check = function (callback) {
  if (!this.strategy) {
    callback("Undefined strategy: " + this.params.strategy);
  }
  else {
    this.strategy.check(callback);
  }
}

Authentication.prototype.auth = function (callback) {
  if (!this.strategy) {
    callback("Undefined strategy: " + this.params.strategy);
  }
  else {
    this.strategy.auth(callback);
  }
}

Authentication.prototype.link = function (userId, callback) {
  if (!this.strategy) {
    callback("Undefined strategy: " + this.params.strategy);
  }
  else {
    this.strategy.link(userId, callback);
  }
}

module.exports = Authentication;
