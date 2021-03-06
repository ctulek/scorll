/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["scorll.asset.PieChartForm"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.asset.PieChartForm"] = true;
dojo.provide("scorll.asset.PieChartForm");

dojo.require("scorll.asset.AssetForm");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.Textarea");

dojo.declare("scorll.asset.PieChartForm", [
  scorll.asset.AssetForm
  ], {
  widgetsInTemplate: true,
  templateString:"<div>\n\t<div style=\"width: 100%;\">\n\t\t<div dojoType=\"dojox.layout.TableContainer\" dojoAttachPoint=\"formContainer\" cols=\"1\" orientation=\"vert\" labelWidth=\"120\">\n      <div dojoType=\"dijit.form.TextBox\"\n        dojoAttachPoint=\"titleBox\"\n              title=\"Title (optional)\"\n        style=\"width: 100%;\" ></div>\n      <div dojoType=\"dijit.form.Textarea\"\n        dojoAttachPoint=\"valuesBox\"\n              title=\"Data\"\n        style=\"width: 100%; min-height: 100px;\" ></div>\n    </div>\n\t\t<div style=\"text-align: right;\">\n\t\t\t<div dojoType=\"dijit.form.Button\"\n\t\t\t\tdojoAttachEvent=\"onClick:submit\">Submit</div>\n\t\t\t<div dojoType=\"dijit.form.Button\"\n\t\t\t\tdojoAttachEvent=\"onClick:cancel\">Cancel</div>\n\t\t</div>\n\t</div>\n",
  postCreate: function () {
    this.formContainer.startup();
    if (!this.item.data) {
      this.valuesBox.attr('value', this.getHelpText());
      return;
    }
    var data = this.item.data;
    this.titleBox.attr('value', data.title);
    this.valuesBox.attr('value', data.values);
  },
  submit: function () {
    var title = this.titleBox.attr('value').trim();
    var values = this.valuesBox.attr('value').trim();
    var data = {};
    data.title = title;
    data.values = values;
    this.item.data = data;
    this.onSubmit(this.item);
  },
  cancel: function () {
    this.onCancel();
  },
  getHelpText: function() {
    return "\
30 Label 1\n\
20 Label 2\n\
15 Label 3".trim();
  }
});

}
