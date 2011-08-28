/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["scorll.asset.SlideShareForm"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.asset.SlideShareForm"] = true;
dojo.provide("scorll.asset.SlideShareForm");

dojo.require("dojo.io.script");
dojo.require("dijit.form.TextBox");
dojo.require("dojox.layout.TableContainer");

dojo.require("scorll.asset.AssetForm");

dojo.declare("scorll.asset.SlideShareForm", [
  scorll.asset.AssetForm
  ], {
  widgetsInTemplate: true,
  templateString:"<div>\n\t<div style=\"width: 100%;\">\n\t\t<div dojoType=\"dojox.layout.TableContainer\" dojoAttachPoint=\"formContainer\" cols=\"1\" labelWidth=\"120\">\n\t\t\t<div dojoType=\"dijit.form.TextBox\" dojoAttachPoint=\"slideShareUrl\" title=\"SlideShare URL\" style=\"width: 100%\"></div>\n\t\t</div>\n\t\t<div style=\"text-align: right;\">\n\t\t\t<div dojoType=\"dijit.form.Button\" dojoAttachEvent=\"onClick:submit\">Submit</div>\n\t\t\t<div dojoType=\"dijit.form.Button\" dojoAttachEvent=\"onClick:cancel\">Cancel</div>\n\t\t</div>\n\t</div>\n",
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
        console.log(data);
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

}
