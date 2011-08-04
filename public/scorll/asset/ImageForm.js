dojo.provide("scorll.asset.ImageForm");

dojo.require("scorll.asset.AssetForm");
dojo.require("dijit.form.TextBox");
dojo.require("dojox.layout.TableContainer");

dojo.declare("scorll.asset.ImageForm", [
  scorll.asset.AssetForm
  ], {
  widgetsInTemplate: true,
  templatePath: dojo.moduleUrl("scorll.asset", "ImageForm.html"),
  postCreate: function () {
    this.formContainer.startup();
    if (!this.item.data) {
      return;
    }
    var data = this.item.data;
    if (data.url) {
      this.imageUrl.attr('value', data.url);
    }
  },
  submit: function () {
    var url = this.imageUrl.attr('value').trim();
    var data = {};
    data.url = url;
    this.item.data = data;
    this.onSubmit(this.item);
  },
  cancel: function () {
    this.onCancel();
  }
});
