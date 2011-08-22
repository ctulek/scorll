/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["scorll.stage.StudentLogin"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.stage.StudentLogin"] = true;
dojo.provide("scorll.stage.StudentLogin");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dojox.layout.TableContainer");

dojo.declare("scorll.stage.StudentLogin", [
  dijit._Widget,
  dijit._Templated
  ], {
  widgetsInTemplate: true,
  templateString:"<div>\n\t<div>\n\t\t<div dojoType=\"dojox.layout.TableContainer\"\n            dojoAttachPoint=\"tableContainer\"\n            cols=\"1\" labelWidth=\"120\" height=\"300px\">\n\t\t\t<div dojoType=\"dijit.form.ValidationTextBox\" dojoAttachPoint=\"username\"\n        required=\"true\" title=\"Name\"></div>\n\t\t\t<div dojoType=\"dijit.form.ValidationTextBox\" dojoAttachPoint=\"password\"\n        required=\"true\" type=\"password\" title=\"Password\"></div>\n\t\t</div>\n    <div dojoAttachPoint=\"errorMessage\"\n      style=\"display: none; color: red\"></div>\n\t\t<div style=\"text-align: left; float: left;\">\n\t\t\t<div dojoType=\"dijit.form.Button\"\n        dojoAttachPoint=\"teacherButton\"\n        dojoAttachEvent=\"onClick:teacher\">Login as Teacher</div>\n\t\t</div>\n\t\t<div style=\"text-align: right;\">\n\t\t\t<div dojoType=\"dijit.form.Button\" dojoAttachEvent=\"onClick:submit\">Enter</div>\n\t\t</div>\n\t</div>\n",
  postCreate: function () {
    this.tableContainer.startup();
  },
  onSubmit: function (username, password) {},
  onTeacher: function () {},
  submit: function () {
    if (this.isValid()) {
      var username = this.username.attr('value').trim();
      var username = this.password.attr('value').trim();
      this.onSubmit(username, password);
    }
  },
  teacher: function () {
    this.onTeacher();
  },
  isValid: function () {
    return this.username.isValid() && this.password.isValid();
  },
  showError: function (err) {
    this.errorMessage.innerHTML = err;
    this.errorMessage.style.display = "block";
    console.error(err);
  }
});

}
