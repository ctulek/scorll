dojo.provide("scorll.stage.Login");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dojox.layout.TableContainer");

dojo.declare("scorll.stage.Login", [
    dijit._Widget,
    dijit._Templated
    ], {
    widgetsInTemplate: true,
    templatePath: dojo.moduleUrl("scorll.stage", "Login.html"),
    postCreate: function () {
        this.tableContainer.startup();
    },
    onSubmit: function (item) {},
    onCancel: function () {},
    onRegister: function () {},
    submit: function () {
        if (this.isValid()) {
          var username = this.username.attr('value').trim();
          var password = this.password.attr('value').trim();
          this.onSubmit(username, password);
        }
    },
    cancel: function () {
        this.onCancel();
    },
    register: function () {
        this.onRegister();
    },
    isValid: function () {
      return this.username.isValid()
        && this.password.isValid();
    },
    showError: function (err) {
        this.errorMessage.innerHTML = err;
        this.errorMessage.style.display = "block";
        console.error(err);
    }
});
