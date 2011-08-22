var Authentication = require('libs/scorll/Authentication');

var app;

module.exports = function(appObj) {
  app = appObj;
  app.get('/login(.html)?', login);
  app.post('/auth(.html)?', auth);
}

var login = function(req, res, next) {
  res.local('contentId') || res.local('contentId', req.cookies['scorll.login.content-id']);
  res.local('release', app.enabled('release'));
  res.local('revision', app.set('revision'));
  res.render("login");
}

var auth = function(req, res, next) {
  var auth = new Authentication(req.body);
  auth.auth(function (err, userId) {
    if (err) {
      console.error(err);
      res.json({error: err});
      return;
    }
    var params = {
      strategy: "cookie",
      cookie: createCookie(),
      expiresAt: new Date(24 * 60 * 60 * 1000 + Date.now())
    };
    var auth = new Authentication(params)
    auth.link(userId, function (err) {
      if (err) {
        console.error(err);
        res.json({error: err});
      }
      else {
        res.json({ok: true, cookie: params.cookie});
      }
    });
  });
}

var createCookie = function () {
  return "SCORLLCOOKIE" + Date.now();
}
