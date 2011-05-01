var strategies = {
    password: require('./PasswordStrategy.js'),
    cookie: require('./CookieStrategy.js')
};

exports.auth = function(params, callback) {
    var strategy = strategies[params.strategy] || null;
    if(!strategy) {
        callback("Undefined strategy: " + params.strategy);
    } else {
        strategy.auth(params, callback);
    }
}

exports.link = function(user, params, callback) {
    var strategy = strategies[params.strategy] || null;
    if(!strategy) {
        callback("Undefined strategy: " + params.strategy);
    } else {
        strategy.link(user, params, callback);
    }
}
