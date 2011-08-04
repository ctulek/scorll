dojo.provide("scorll.asset.ScribdForm");

dojo.require("dijit.form.TextBox");
dojo.require("dojox.layout.TableContainer");

dojo.require("scorll.asset.AssetForm");

dojo.declare("scorll.asset.ScribdForm", [
  scorll.asset.AssetForm
  ], {
  widgetsInTemplate: true,
  templatePath: dojo.moduleUrl("scorll.asset", "ScribdForm.html"),
  postCreate: function () {
    this.formContainer.startup();
    if (!this.item.data) {
      return;
    }
    var data = this.item.data;
    if (data.scribd) {
      var url = "http://www.scribd.com/doc/" + data.scribd + "/" + data.prettyUrl;
      this.scribdUrl.attr('value', url);
    }
  },
  submit: function () {
    var regex = new RegExp("/doc/([^/]+)/(.+)");
    var match = regex.exec(this.scribdUrl.attr('value').trim());
    var scribd = match[1];
    var prettyUrl = match[2];
    var data = {};
    data.scribd = scribd;
    data.prettyUrl = prettyUrl;
    this.item.data = data;
    this.onSubmit(this.item);
  },
  cancel: function () {
    this.onCancel();
  }
});
