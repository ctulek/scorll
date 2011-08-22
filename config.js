var fs = require('fs');

var express = require('express');

module.exports = function(app) {
    app.configure(function() {
        app.set("view engine", "jade");
        app.register(".html", require("jade"));
        var revision = fs.readFileSync("config.release-revision") + "";
        app.set("revision", revision.trim());
    });
    app.configure("development", function() {
        app.set("port", 8080);
    });
    app.configure("production", function() {
        app.set("port", 80);
        app.enable("release");
    });
}
