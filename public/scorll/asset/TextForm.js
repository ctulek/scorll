dojo.provide("scorll.asset.TextForm");

dojo.require("scorll.asset.AssetForm");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.Textarea");
dojo.require("dojox.layout.TableContainer");

dojo.declare("scorll.asset.TextForm", [
  scorll.asset.AssetForm
  ], {
  widgetsInTemplate: true,
  templatePath: dojo.moduleUrl("scorll.asset", "TextForm.html"),
  postCreate: function () {
    this.formContainer.startup();
    if (!this.item.data) {
      this.item.data = {};
      this.item.data.text = this.getHelpText();
    }
    var data = this.item.data;
    if (data.title) {
      this.titleText.attr('value', data.title);
    }
    this.bodyText.attr('value', data.text + "\n");
    var asset = this;
    setTimeout(function() {
      asset.bodyText.focus();
    });
  },
  submit: function () {
    var title = null;
    if (this.titleText.attr('value').trim() != '') {
      title = this.titleText.attr('value').trim();
    }
    var text = this.bodyText.attr('value').trim();
    var data = {};
    if (title) {
      data.title = title;
    }
    data.text = text;
    this.item.data = data;
    this.onSubmit(this.item);
  },
  cancel: function () {
    this.onCancel();
  },
  getHelpText: function () {
    return "This text will appear when you press 'Submit' button.\nEach new line becomes a paragraph.\nBasic Formatting:\n__underline__\n//italic//\n**bold**\n* list item\nLink: [[http://google.com]]\nLink with label: [[http://google.com Google]]";
  }
});
