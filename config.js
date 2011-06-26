var express = require('express');

module.exports = function(app) {
    app.configure(function() {
        app.set("view engine", "jade");
        app.register(".html", require("jade"));
    });
    app.configure("development", function() {
        app.set("port", 8080);
    });
    app.configure("production", function() {
        app.set("port", 80);
        app.enable("release");
        app.set("revision", "r7");
    });
}
