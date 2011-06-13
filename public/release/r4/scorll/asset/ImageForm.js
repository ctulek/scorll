/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["scorll.asset.ImageForm"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.asset.ImageForm"] = true;
dojo.provide("scorll.asset.ImageForm");

dojo.require("scorll.asset.AssetForm");
dojo.require("dijit.form.TextBox");
dojo.require("dojox.layout.TableContainer");

dojo.declare("scorll.asset.ImageForm", [
    scorll.asset.AssetForm
    ], {
    templateString:"<div>\n\t<div style=\"width: 800px;\">\n\t\t<div dojoType=\"dojox.layout.TableContainer\" cols=\"1\" labelWidth=\"120\">\n\t\t\t<div dojoType=\"dijit.form.TextBox\" dojoAttachPoint=\"imageUrl\" title=\"Image Url\" style=\"width: 100%\"></div>\n\t\t</div>\n\t\t<div style=\"text-align: right;\">\n\t\t\t<div dojoType=\"dijit.form.Button\" dojoAttachEvent=\"onClick:submit\">Submit</div>\n\t\t\t<div dojoType=\"dijit.form.Button\" dojoAttachEvent=\"onClick:cancel\">Cancel</div>\n\t\t</div>\n\t</div>\n",
    postCreate: function() {
        if (!this.item.data) {
            return;
        }
        var data = this.item.data;
        if (data.url) {
            this.imageUrl.attr('value', data.url);
        }
    },
    submit: function() {
        var url = this.imageUrl.attr('value').trim();
        var data = {};
        data.url = url;
        this.item.data = data;
        this.onSubmit(this.item);
    },
    cancel: function() {
        this.onCancel();
    }
});

}
