var async = require('async');

var Authentication = require('libs/scorll/Authentication');
var Content = require('libs/scorll/Content');
var Group = require('libs/scorll/Group');
var User = require('libs/scorll/User');

var ContentPO = require('libs/scorll/model/Content');
var ContentAliasPO = require('libs/scorll/model/ContentAlias');
var EnrollmentPO = require('libs/scorll/model/Enrollment');

var app;

module.exports = function(appObj) {
    app = appObj;
    app.get('/list(.html)?', listContents);
}

var listContents = function(req, res, next) {
  res.local('release', app.enabled('release'));
  res.local('revision', app.set('revision'));
  authByCookie(req, function (err, user) {
    if(err) {
      console.error(err);
      res.end(err + "");
      return;
    }
    if(!user) {
      console.error(new Error("Undefined user"));
      res.end(err + "");
      return;
    }
    getCreatedContents(user, function(err, contents) {
      if(err) {
        console.error(err);
        res.end(err + "");
        return;
      }
      res.local("createdContents", contents);
      var createdContents = contents;
      getEnrolledContents(user, function(err, contents) {
        if(err) {
          console.error(err);
          res.end(err + "");
          return;
        }
        contents = contents.filter(function(content) {
          return createdContents.every(function(c) {
            return c.id != content.id;
          });
        });
        res.local("enrolledContents", contents);
        res.render("list");
      });
    });
  });
}

var getEnrolledContents = function(user, callback) {
  var cond = {
    userId: user.getId()
  }
  console.log(cond);
  EnrollmentPO.find(cond, ['contentId'], function(err, enrollments) {
    if(err) {
      console.error(err);
      callback && callback(err);
      return;
    }
    console.log(enrollments);
    var contentIds = enrollments.map(function(enrollment) {
      return enrollment.contentId;
    });
    ContentPO.find({_id: {$in: contentIds}}, ["id", "title"], function(err,
    contents) {
      if(err) {
        console.error(err);
        callback && callback(err);
        return;
      }
      getContentsWithAlias(contents, callback);
    });
  });
}

var getCreatedContents = function(user, callback) {
  var cond = {
    ownerId: user.getId()
  }
  console.log(cond);
  ContentPO.find(cond, ["_id", "title"], function(err, contents) {
    if(err) {
      console.error(err);
      callback && callback(err);
      return;
    }
    console.log(contents);
    getContentsWithAlias(contents, callback);
  });
}

var getContentsWithAlias = function(contents, callback) {
  async.map(contents, function(content, callback) {
    var cond = {contentId: content.id};
    ContentAliasPO.findOne(cond, function(err, contentAlias) {
      if(err) {
        console.error(err);
        callback && callback(err);
      }
      var datum = {
        title: content.title
      }
      if(contentAlias) {
        datum.url = contentAlias.alias;
      } else {
        datum.url = content.id + ".html";
      }
      callback && callback(null, datum);
    })
  },
  function(err, contents) {
    callback && callback(err, contents);
  }
  );
}

function authByCookie (req, callback) {
  if(!req.cookies["scorll.user.cookie"]) {
    var err = new Error("Undefined cookie");
    console.error(err);
    callback && callback(err);
    return;
  }
  var params = {
    strategy: "cookie",
    cookie: req.cookies["scorll.user.cookie"]
  };
  var auth = new Authentication(params);
  auth.auth(function (err, userId) {
    if (err) {
      console.error(err);
      callback && callback(err);
      return;
    }
    app.userSet.findById(userId, function (err, user) {
      if (err) {
        console.error(err);
        callback && callback(err);
        return;
      }
      callback && callback(null, user)
    });
  });
}

