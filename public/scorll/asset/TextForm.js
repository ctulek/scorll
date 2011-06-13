dojo.provide("scorll.asset.TextForm");

dojo.require("scorll.asset.AssetForm");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.Textarea");
dojo.require("dojox.layout.TableContainer");

dojo.declare("scorll.asset.TextForm", [
    scorll.asset.AssetForm
    ], {
    templatePath: dojo.moduleUrl("scorll.asset", "TextForm.html"),
    postCreate: function() {
        if (!this.item.data) {
            this.item.data = {};
            this.item.data.text = this.getHelpText();
        }
        var data = this.item.data;
        if (data.title) {
            this.titleText.attr('value', data.title);
        }
        this.bodyText.attr('value', data.text);
    },
    submit: function() {
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
    cancel: function() {
        this.onCancel();
    },
    getHelpText: function() {
        return "This text will appear when you press 'Submit' button.\nEach new line becomes a paragraph.\nYou can add basic formatting to your text very easily:\n* Use 2 underscore characters to __underline text__\n* Use //2 slash characters// or **2 asteriks** to emphasize text\n* As you can guess each line starting with an asteriks followed by a space becomes a bullet list item\n* You can create links with [[http://google.com]] or links with labels [[http://google.com Google]]";
    }
});
