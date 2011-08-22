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
  templatePath: dojo.moduleUrl("scorll.stage", "StudentLogin.html"),
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
