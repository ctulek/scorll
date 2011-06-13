/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["scorll.asset.TextForm"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.asset.TextForm"] = true;
dojo.provide("scorll.asset.TextForm");

dojo.require("scorll.asset.AssetForm");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.Textarea");
dojo.require("dojox.layout.TableContainer");

dojo.declare("scorll.asset.TextForm", [
    scorll.asset.AssetForm
    ], {
    templateString:"<div>\n\t<div style=\"width: 500px;\">\n\t\t<div dojoType=\"dojox.layout.TableContainer\" cols=\"1\" labelWidth=\"120\" height=\"300px\">\n\t\t\t<div dojoType=\"dijit.form.TextBox\" dojoAttachPoint=\"titleText\" title=\"Title (Optional)\"></div>\n\t\t\t<div dojoType=\"dijit.form.Textarea\" dojoAttachPoint=\"bodyText\" title=\"Text\" style=\"min-height: 200px;\"></div>\n\t\t</div>\n\t\t<div style=\"text-align: right;\">\n\t\t\t<div dojoType=\"dijit.form.Button\" dojoAttachEvent=\"onClick:submit\">Submit</div>\n\t\t\t<div dojoType=\"dijit.form.Button\" dojoAttachEvent=\"onClick:cancel\">Cancel</div>\n\t\t</div>\n\t</div>\n",
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

}
