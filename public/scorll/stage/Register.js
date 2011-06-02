dojo.provide("scorll.stage.Register");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.TextBox");
dojo.require("dojox.layout.TableContainer");

dojo.declare("scorll.stage.Register", [
    dijit._Widget,
    dijit._Templated
    ], {
    widgetsInTemplate: true,
    templatePath: dojo.moduleUrl("scorll.stage", "Register.html"),
    postCreate: function () {},
    onSubmit: function (item) {},
    onCancel: function () {},
    submit: function () {
        var username = this.username.attr('value').trim();
        var password = this.password.attr('value').trim();
        this.onSubmit(username, password);
    },
    cancel: function () {
        this.onCancel();
    },
    showError: function (err) {
        console.error(err);
    }
});
