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
            return;
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
    }
});
