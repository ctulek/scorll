var Content = require('libs/scorll/Content');
var Group = require('libs/scorll/Group');

var app;

module.exports = function(appObj) {
    app = appObj;
    app.get('/new(.html)?', newContent);
    app.get('/:contentId.html', showContent);
    app.get('/(index.html)?', defaultIndex, showContent);
}

var defaultIndex = function(req, res, next) {
    res.local('contentId', 1);
    next();
}

var newContent = function(req, res, next) {
    var args = {
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
