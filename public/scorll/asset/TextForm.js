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
    var asset = this;
    asset.formContainer.startup();
    if (!asset.item.data) {
      asset.item.data = {};
      asset.item.data.text = asset.getHelpText();
    }
    var data = asset.item.data;
    if (data.title) {
      asset.titleText.attr('value', data.title);
    }
    asset.bodyText.attr('value', data.text + "\n");
    setTimeout(function () {
      asset.bodyText.focus();
    });
    dojo.connect(asset.bodyText, "onKeyPress", function() {
      setTimeout(function() {
        var disabled = asset.bodyText.attr('value').trim().length == 0;
        asset.submitButton.attr("disabled", disabled);
      });
    });
  },
  submit: function () {
    var title = null;
    if (this.titleText.attr('value').trim() != '') {
      title = this.titleText.attr('value').trim();
    }
    var text = this.bodyText.attr('value').trim();
    if(text == "") {
      return;
    }
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
    var help = "\
This text will appear when you press 'Submit' button.\n\
Each new line becomes a paragraph.\n\
Formatting: __underline__ //italic// **bold**\n \
* list item\n\
Link: [[http://google.com]]\n\
Link with label: [[http://google.com Google]]\n\
Mail: [[mailto:info@scorll.com]]\n";
    return help.trim();
  }
});
