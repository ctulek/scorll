/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["scorll.asset.MultipleChoiceForm"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.asset.MultipleChoiceForm"] = true;
dojo.provide("scorll.asset.MultipleChoiceForm");

dojo.require("scorll.asset.AssetForm");
dojo.require("dijit.form.Textarea");

dojo.declare("scorll.asset.MultipleChoiceForm", [
  scorll.asset.AssetForm
  ], {
  templateString:"<div>\n\t<div style=\"width: 100%;\">\n\t\t<div dojoType=\"dojox.layout.TableContainer\" dojoAttachPoint=\"formContainer\" cols=\"1\" orientation=\"vert\" labelWidth=\"120\">\n\t\t<div dojoType=\"dijit.form.Textarea\"\n\t\t\tdojoAttachPoint=\"questionBox\"\n            title=\"Question\"\n\t\t\tstyle=\"width: 100%; min-height: 21px;\" ></div>\n\t\t<div dojoType=\"dijit.form.Textarea\"\n\t\t\tdojoAttachPoint=\"answersBox\"\n            title=\"Answers\"\n\t\t\tstyle=\"width: 100%; min-height: 200px;\" ></div>\n        </div>\n\t\t<div style=\"text-align: right;\">\n\t\t\t<div dojoType=\"dijit.form.Button\"\n\t\t\t\tdojoAttachEvent=\"onClick:submit\">Submit</div>\n\t\t\t<div dojoType=\"dijit.form.Button\"\n\t\t\t\tdojoAttachEvent=\"onClick:cancel\">Cancel</div>\n\t\t</div>\n\t</div>\n",
  postCreate: function () {
    this.formContainer.startup();
    if (!this.item.data) {
      return;
    }
    var data = this.item.data;
    var correctResponse = this.item.interaction ? this.item.interaction.correctResponses[0] : [];
    this.questionBox.attr('value', data.question);
    if (data.answers) {
      var answersString = "";
      for (var i in data.answers) {
        var answerString = data.answers[i].trim();
        if (correctResponse.indexOf(i) > -1) {
          answerString = "* " + answerString;
        }
        answersString += answerString + "\n";
      }
      this.answersBox.attr('value', answersString.trim());
    }
  },
  submit: function () {
    var question = this.questionBox.attr('value').trim();
    var answers = this.answersBox.attr('value').trim().split("\n");
    var correctResponse = [];
    for (var i in answers) {
      if (answers[i].indexOf("* ") == 0) {
        correctResponse.push(i);
        answers[i] = answers[i].slice(2);
      }
    }
    var data = {};
    data.type = correctResponse.length > 1 ? "checkbox" : "radio";
    data.question = question;
    data.answers = answers;
    this.item.data = data;
    this.item.interaction = {};
    this.item.interaction.type = "choice";
    this.item.interaction.correctResponses = [correctResponse];
    this.onSubmit(this.item);
  },
  cancel: function () {
    this.onCancel();
  }
});

}
