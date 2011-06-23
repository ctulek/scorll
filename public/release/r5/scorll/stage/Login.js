/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["scorll.stage.Login"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.stage.Login"] = true;
dojo.provide("scorll.stage.Login");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.TextBox");
dojo.require("dojox.layout.TableContainer");

dojo.declare("scorll.stage.Login", [
    dijit._Widget,
    dijit._Templated
    ], {
    widgetsInTemplate: true,
    templateString:"<div>\n\t<div style=\"width: 500px;\">\n\t\t<div dojoType=\"dojox.layout.TableContainer\" cols=\"1\" labelWidth=\"120\" height=\"300px\">\n\t\t\t<div dojoType=\"dijit.form.TextBox\" dojoAttachPoint=\"username\" title=\"Email\"></div>\n\t\t\t<div dojoType=\"dijit.form.TextBox\" dojoAttachPoint=\"password\" title=\"Password\"></div>\n\t\t</div>\n\t\t<div style=\"text-align: left; float: left;\">\n\t\t\t<div dojoType=\"dijit.form.Button\" dojoAttachEvent=\"onClick:register\">Register</div>\n\t\t</div>\n\t\t<div style=\"text-align: right;\">\n\t\t\t<div dojoType=\"dijit.form.Button\" dojoAttachEvent=\"onClick:submit\">Submit</div>\n\t\t\t<div dojoType=\"dijit.form.Button\" dojoAttachEvent=\"onClick:cancel\">Cancel</div>\n\t\t</div>\n\t</div>\n",
    postCreate: function () {},
    onSubmit: function (item) {},
    onCancel: function () {},
    onRegister: function () {},
    submit: function () {
        var username = this.username.attr('value').trim();
        var password = this.password.attr('value').trim();
        this.onSubmit(username, password);
    },
    cancel: function () {
        this.onCancel();
    },
    register: function () {
        this.onRegister();
    },
    showError: function (err) {
        console.error(err);
    }
});

}
