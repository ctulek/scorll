var Content = require('libs/scorll/Content');
var Group = require('libs/scorll/Group');
var User = require('libs/scorll/User');

var app;

module.exports = function(appObj) {
    app = appObj;
    app.get('/new(.html)?', newContent);
    app.get('/list(.html)?', listContents);
    app.get('/:contentId.html', showContent);
    app.get('/(index.html)?', defaultIndex, showContent);
}

var defaultIndex = function(req, res, next) {
    res.local('contentId', 1);
    next();
}

var newContent = function(req, res, next) {
    var user = new User();
    var params = {
      strategy: "cookie",
      cookie: req.cookies["scorll.user.cookie"]
    };
    user.authN(params, function(err, userData) {
      if (err) {
        res.end("You need to be registered");
        return;
      }
      user.id = userData.id;
      var args = {
          user: user,
          title: "New Content Title (Click to Change)",
          assetSet: app.assetSet,
          clientComponentSet: app.clientComponentSet
      }
      var content = new Content(args);
      content.save(function(err) {
          if(err) {
              res.send(err, 500);
              return;
          }
          res.redirect("/" + content.id + ".html", 303);
          app.contentSet.add(content);
          app.clientComponentSet.add(content);
          var args = {id: content.id};
          var group = new Group(args);
          app.groupSet.add(group);
          var assetData = {
              type: "text",
              data: {
                  text: "You have successfuly created a new content. You can change content title by clicking/tapping to it.\nTo add new asset press the \"Add New Asset\" button and choose an asset type. This help message itsef is an asset, too. You can delete/edit it from menu that appears when you put mouse over/tap it."
              }
          }
          content.addAsset(null, assetData);
      });
    });
}

var listContents = function(req, res, next) {
    var ids = [];
    for(var i in app.contentSet.contents) {
        ids.push(i);
    }
    res.local("contentIds", ids);
    res.render("list");
}

var showContent = function(req, res, next) {
    res.local('contentId') || res.local('contentId', req.params.contentId);
    res.local('release', app.enabled('release'));
    res.local('revision', app.set('revision'));
    app.contentSet.findById(res.local('contentId'), function(err, content) {
        if(err || !content) {
            next("Content not found", 404);
        } else {
            res.render('index');
        }
    })
}
