/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["scorll.asset.PollForm"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.asset.PollForm"] = true;
dojo.provide("scorll.asset.PollForm");

dojo.require("scorll.asset.AssetForm");
dojo.require("dijit.form.Textarea");

dojo.declare("scorll.asset.PollForm", [
  scorll.asset.AssetForm
  ], {
  templateString:"<div>\n\t<div style=\"width: 100%;\">\n\t\t<div dojoType=\"dojox.layout.TableContainer\" dojoAttachPoint=\"formContainer\" cols=\"1\" orientation=\"vert\" labelWidth=\"120\">\n\t\t<div dojoType=\"dijit.form.Textarea\"\n\t\t\tdojoAttachPoint=\"questionBox\"\n            title=\"Question\"\n\t\t\tstyle=\"width: 100%; min-height: 21px;\" ></div>\n\t\t<div dojoType=\"dijit.form.Textarea\"\n\t\t\tdojoAttachPoint=\"optionBox\"\n            title=\"Options\"\n\t\t\tstyle=\"width: 100%; min-height: 200px;\" ></div>\n        </div>\n\t\t<div style=\"text-align: right;\">\n\t\t\t<div dojoType=\"dijit.form.Button\"\n\t\t\t\tdojoAttachEvent=\"onClick:submit\">Submit</div>\n\t\t\t<div dojoType=\"dijit.form.Button\"\n\t\t\t\tdojoAttachEvent=\"onClick:cancel\">Cancel</div>\n\t\t</div>\n\t</div>\n",
  postCreate: function () {
    this.formContainer.startup();
    if (!this.item.data) {
      return;
    }
    var data = this.item.data;
    this.questionBox.attr('value', data.question);
  },
  submit: function () {
    var question = this.questionBox.attr('value').trim();
    var entries = this.optionBox.attr('value').trim().split("\n");
    var options = [];
    var uniq = {};
    dojo.forEach(entries, function (entry) {
      if (!uniq[entry]) {
        options.push(entry);
        uniq[entry] = true;
      }
    });
    this.item.data = {
      question: question,
      options: options
    };
    this.onSubmit(this.item);
  },
  cancel: function () {
    this.onCancel();
  }
});

}
