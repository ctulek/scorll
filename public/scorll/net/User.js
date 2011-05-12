if(!dojo._hasResource["scorll.net.User"]){
dojo._hasResource["scorll.net.User"]=true;
dojo.provide("scorll.net.User");

dojo.require("dojo.cookie");
dojo.require("scorll.net.ClientComponent");

dojo.declare("scorll.net.User",[scorll.net.ClientComponent],{
    authenticated: false,
    profile: {},
    roles: [],
    getComponentType: function() {
        return "user";
    },
    getComponentId: function() {
        return "user";
    },
    auth: function(params, callback) {
        var userComponent = this;
        userComponent.client.call(userComponent, "auth", params, function(err, user) {
            if(!err) {
                userComponent.id = user.id;
                userComponent.authenticated = true;
                if(user.cookie) {
                    var expiresAt = params.rememberme ? user.cookieExpiresAt : null; 
                    dojo.cookie("scorll.user.cookie", user.cookie, {expires: expiresAt});
                }
            } else {
                dojo.cookie("scorll.user.cookie", null, {expires: -1});
            }
            callback(err);
        });
    },
    join: function(params, callback) {
        var userComponent = this;
        userComponent.client.call(userComponent, "join", params, function(err, user) {
            if(!err) {
                userComponent.authenticated = true;
                if(user.cookie) {
                    var expiresAt = params.rememberme ? user.cookieExpiresAt : null; 
                    dojo.cookie("scorll.user.cookie", user.cookie, {expires: expiresAt});
                }
            }
            callback(err);
        });
    },
    authCookie: function(callback) {
        var cookie = dojo.cookie("scorll.user.cookie");
        if(cookie) {
            var params = {
                strategy: "cookie",
                cookie: cookie
            };
            this.auth(params, callback);
        } else {
            callback("No cookie defined");
        }
    },
    hasRole: function(role) {
        return this.roles.indexOf(role) > -1;
    }
});
}
