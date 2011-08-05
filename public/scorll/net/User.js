dojo.provide("scorll.net.User");

dojo.require("dojo.cookie");

dojo.require("scorll.net.ClientComponent");

dojo.declare("scorll.net.User", null, {
  authenticated: false,
  id: null,
  profile: {},
  roles: ["guest"],
  onLogin: function () {},
  onLogout: function () {},
  onRolesChange: function () {},
  authN: function (params, callback) {
    var userComponent = this;
    userComponent.client.call(null, "authN", params, function (err, user) {
      if (err) {
        console.log(err);
        dojo.cookie("scorll.user.cookie", null, {
          expires: -1
        });
      }
      else {
        userComponent.id = user.id;
        userComponent.profile = user.profile;
        userComponent.authenticated = true;
        if (user.cookie) {
          var expiresAt = params.rememberme ? user.cookieExpiresAt : null;
          dojo.cookie("scorll.user.cookie", user.cookie, {
            expires: expiresAt
          });
        }
        userComponent.onLogin();
        params = {
          contentId: userComponent.client.groupId
        }
        userComponent.client.call(null, "authZ", params, function (err, roles) {
          if (err) {
            console.log(err);
            return;
          }
          userComponent.addRoles(roles);
        });
      }
      callback(err);
    });
  },
  register: function (params, callback) {
    var userComponent = this;
    userComponent.client.call(null, "register", params, function (err, user) {
      if (!err) {
        userComponent.id = user.id;
        userComponent.profile = user.profile;
        userComponent.authenticated = true;
        if (user.cookie) {
          var expiresAt = params.rememberme ? user.cookieExpiresAt : null;
          dojo.cookie("scorll.user.cookie", user.cookie, {
            expires: expiresAt
          });
        }
        userComponent.onLogin();
      }
      callback(err);
    });
  },
  authNWithCookie: function (callback) {
    var user = this;
    var cookie = dojo.cookie("scorll.user.cookie");
    if (cookie) {
      var params = {
        strategy: "cookie",
        cookie: cookie
      };
      user.authN(params, function (err) {
        if (err) {
          user.onLogout();
        }
        callback && callback(err);
      });
    }
    else {
      this.onLogout();
      callback && callback("No cookie defined");
    }
  },
  logout: function () {
    this.authenticated = false;
    this.id = null;
    this.profile = {};
    this.roles = ["guest"];
    dojo.cookie("scorll.user.cookie", "", {
      expires: -1
    });
    this.onLogout();
    this.onRolesChange();
  },
  hasRole: function (role) {
    return this.roles.indexOf(role) > -1;
  },
  addRoles: function (roles) {
    var user = this;
    var altered = false;
    roles.forEach(function (role) {
      if (!user.hasRole(role)) {
        user.roles.push(role);
        altered = true;
      }
    });
    altered && user.onRolesChange();
  }
});
