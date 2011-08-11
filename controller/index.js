var Authentication = require('libs/scorll/Authentication');
var Content = require('libs/scorll/Content');
var Group = require('libs/scorll/Group');
var User = require('libs/scorll/User');

var ContentPO = require('libs/scorll/model/Content');
var ContentAliasPO = require('libs/scorll/model/ContentAlias');

var app;

module.exports = function(appObj) {
    app = appObj;
    app.get('/new(.html)?', newContent);
    app.get('/list(.html)?', listContents);
    app.get(/^\/([a-z0-9]{5})$/, showContentAlias);
    app.get('/:contentId.html', showContent);
    app.get('/(index.html)?', defaultIndex, showContent);
}

var defaultIndex = function(req, res, next) {
    res.local('contentId', app.defaultContentId);
    next();
}

var newContent = function(req, res, next) {
  var params = {
    strategy: "cookie",
    cookie: req.cookies["scorll.user.cookie"]
  };
  var auth = new Authentication(params);
  auth.auth(function (err, userId) {
    if (err) {
      res.end(err);
      return;
    }
    app.userSet.findById(userId, function (err, user) {
      if (err) {
        res.end(err);
        return;
      }
      user.authenticated = true;

      var po = new ContentPO();
      po.ownerId = user.getId();
      var args = {
          po: po,
          assetSet: app.assetSet,
          clientComponentSet: app.clientComponentSet
      }
      var content = new Content(args);
      app.contentSet.add(content, function(err) {
          if(err) {
              res.send(err, 500);
              return;
          }
          app.clientComponentSet.add(content);
          var args = {id: content.getId()};
          var group = new Group(args);
          app.groupSet.add(group);
          var assetData = {
              type: "text",
              data: {
                  text: "You have successfuly created a new content. You can change content title by clicking/tapping to it.\nTo add new asset press the \"Add New Asset\" button and choose an asset type. This help message itsef is an asset, too. You can delete/edit it from menu that appears when you put mouse over/tap it."
              }
          }
          content.addAsset(null, assetData);
          var contentAlias = new ContentAliasPO();
          contentAlias.alias = createAlias();
          contentAlias.contentId = content.getId();
          contentAlias.save(function(err) {
            if(err) {
              console.error(err);
              res.end(err, 500);
              return;
            }
            res.redirect("/" + contentAlias.alias, 303);
          });
      });
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

var showContentAlias = function(req, res, next) {
  var alias = req.params[0];
  ContentAliasPO.findOne({alias: alias}, function(err, contentAlias) {
    if(err || !contentAlias) {
      err = err ? err : "Content not found";
      console.error(err);
      next(err, 404);
      return;
    }
    res.local('contentId', contentAlias.contentId);
    res.local('release', app.enabled('release'));
    res.local('revision', app.set('revision'));
    app.contentSet.findById(res.local('contentId'), function(err, content) {
        if(err || !content) {
            err = err ? err : "Content not found";
            console.error(err);
            next(err, 404);
        } else {
            res.render('index');
        }
    });
  });
}

var createAlias = function() {
  var list = "abcdefghijklmnopqrstuvwxyz0123456789";
  var alias = "";
  var min = 0;
  var max = list.length;
  for(var i = 0; i < 5; i++) {
    var index = Math.floor(Math.random() * (max - min + 1)) + min;
    alias += list.charAt(index);
  }
  return alias;
}
