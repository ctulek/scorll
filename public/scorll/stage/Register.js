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
  templatePath: dojo.moduleUrl("scorll.stage", "Register.html"),
  postCreate: function() {},
  onSubmit: function(username, email, password) {},
  onCancel: function() {},
  submit: function() {
    this.hideError();
    if (this.isValid()) {
      var username = this.username.attr('value').trim();
      var email = this.email.attr('value').trim();
      var password = this.password.value;
      this.onSubmit(username, email, password);
    }
  },
  cancel: function() {
    this.onCancel();
  },
  hideError: function() {
    this.errorMessage.innerHTML = "";
    this.errorMessage.style.display = "none";
  },
  isValid: function() {
    return this.username.isValid()
      && this.email.isValid()
      && this.password.isValid();
  },
  showError: function(err) {
    this.errorMessage.innerHTML = err;
    this.errorMessage.style.display = "block";
    console.error(err);
  },
});
