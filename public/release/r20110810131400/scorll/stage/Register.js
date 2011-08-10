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
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit.form.TextBox");
dojo.require("dojox.form.PasswordValidator");
dojo.require("dojox.layout.TableContainer");
dojo.require("dojox.validate");
dojo.require("dojox.validate.web");

dojo.declare("scorll.stage.Register", [
  dijit._Widget, dijit._Templated], {
  widgetsInTemplate: true,
  templateString:"<div>\n  <div>\n\t\t<div dojoType=\"dojox.layout.TableContainer\"\n            dojoAttachPoint=\"tableContainer\"\n            cols=\"1\" labelWidth=\"120\" height=\"300px\">\n\t\t\t<div dojoType=\"dijit.form.ValidationTextBox\" dojoAttachPoint=\"username\"\n        required=\"true\"\n        promptMessage=\"Enter your user name\"\n        invalidMessage=\"Username should be at least 6 characters\"\n        regExp=\" *[^ ]{6} *\"\n        title=\"Username\"></div>\n\t\t\t<div dojoType=\"dijit.form.ValidationTextBox\" dojoAttachPoint=\"email\"\n        required=\"true\"\n        promptMessage=\"Please enter a valid e-mail address\"\n        invalidMessage=\"Invalid e-mail address\"\n        validator=\"dojox.validate.isEmailAddress\"\n        title=\"Email\"></div>\n      <div dojoType=\"dojox.form.PasswordValidator\" dojoAttachPoint=\"password\"\n        title=\"Password\">\n        <input dojoType=\"dijit.form.TextBox\"\n          pwType=\"new\"/>\n        <input dojoType=\"dijit.form.TextBox\"\n          pwType=\"verify\"/>\n      </div>\n    </div>\n    <div dojoAttachPoint=\"errorMessage\"\n      style=\"display: none; color: red\"></div>\n    <div style=\"text-align: right;\">\n        <div dojoType=\"dijit.form.Button\" dojoAttachEvent=\"onClick:submit\">Submit</div>\n        <div dojoType=\"dijit.form.Button\" dojoAttachEvent=\"onClick:cancel\">Cancel</div>\n    </div>\n\t</div>\n",
  postCreate: function () {
    this.tableContainer.startup();
  },
  onSubmit: function (username, email, password) {},
  onCancel: function () {},
  submit: function () {
    this.hideError();
    if (this.isValid()) {
      var username = this.username.attr('value').trim();
      var email = this.email.attr('value').trim();
      var password = this.password.value;
      this.onSubmit(username, email, password);
    }
  },
  cancel: function () {
    this.onCancel();
  },
  hideError: function () {
    this.errorMessage.innerHTML = "";
    this.errorMessage.style.display = "none";
  },
  isValid: function () {
    return this.username.isValid() && this.email.isValid() && this.password.isValid();
  },
  showError: function (err) {
    this.errorMessage.innerHTML = err;
    this.errorMessage.style.display = "block";
    console.error(err);
  },
});

}
