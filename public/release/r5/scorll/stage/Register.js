/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["scorll.stage.Register"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.stage.Register"] = true;
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
    templateString:"<div>\n\t<div style=\"width: 500px;\">\n\t\t<div dojoType=\"dojox.layout.TableContainer\" cols=\"1\" labelWidth=\"120\" height=\"300px\">\n\t\t\t<div dojoType=\"dijit.form.TextBox\" dojoAttachPoint=\"email\" title=\"Email\"></div>\n\t\t\t<div dojoType=\"dijit.form.TextBox\" dojoAttachPoint=\"password\" title=\"Password\"></div>\n\t\t\t<div dojoType=\"dijit.form.TextBox\" dojoAttachPoint=\"password2\" title=\"Password Repeat\"></div>\n\t\t</div>\n\t\t<div style=\"text-align: right;\">\n\t\t\t<div dojoType=\"dijit.form.Button\" dojoAttachEvent=\"onClick:submit\">Submit</div>\n\t\t\t<div dojoType=\"dijit.form.Button\" dojoAttachEvent=\"onClick:cancel\">Cancel</div>\n\t\t</div>\n\t</div>\n",
    postCreate: function () {},
    onSubmit: function (item) {},
    onCancel: function () {},
    submit: function () {
        var email = this.email.attr('value').trim();
        var password = this.password.attr('value').trim();
        this.onSubmit(email, password);
    },
    cancel: function () {
        this.onCancel();
    },
    showError: function (err) {
        console.error(err);
    }
});

}
