var content = require('libs/scorll/Content.js');

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
    var params = {title: "New Content"};
    content.post(params, function(err, id) {
        if(err) {
            res.send(err, 500);
            return;
        }
        res.redirect("/" + id + ".html", 303);
    });
}

var showContent = function(req, res, next) {
    res.local('contentId') || res.local('contentId', req.params.contentId);
    app.contentSet.findById(res.local('contentId'), function(err, content) {
        if(err || !content) {
            next("Content not found", 404);
        } else {
            res.render('index');
        }
    })
}
