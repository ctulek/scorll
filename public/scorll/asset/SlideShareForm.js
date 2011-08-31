dojo.provide("scorll.asset.SlideShareForm");

dojo.require("dojo.io.script");
dojo.require("dijit.form.TextBox");
dojo.require("dojox.layout.TableContainer");

dojo.require("scorll.asset.AssetForm");

dojo.declare("scorll.asset.SlideShareForm", [
  scorll.asset.AssetForm
  ], {
  widgetsInTemplate: true,
  templatePath: dojo.moduleUrl("scorll.asset", "SlideShareForm.html"),
  postCreate: function () {
    this.formContainer.startup();
    if (!this.item.data) {
      return;
    }
    var data = this.item.data;
    if (data.url) {
      this.slideShareUrl.attr('value', data.url);
    }
  },
  submit: function () {
    var thisObject = this;
    var url = "http://www.slideshare.net/api/oembed/1?url=" + this.slideShareUrl.attr('value').trim() + "&format=json";
    dojo.io.script.get({
      url: url,
      preventCache: true,
      checkString: false,
      load: function (data) {
        var data = {};
        data.url = url;
        data.html = data.html
        thisObject.item.data = data;
        thisObject.onSubmit(thisObject.item);
      }
    });
  },
  cancel: function () {
    this.onCancel();
  }
});
