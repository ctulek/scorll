/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["scorll.asset.MultipleChoiceForm"]){
dojo._hasResource["scorll.asset.MultipleChoiceForm"]=true;
dojo.provide("scorll.asset.MultipleChoiceForm");

dojo.require("scorll.asset.AssetForm");
dojo.require("dijit.form.Textarea");

dojo.declare("scorll.asset.MultipleChoiceForm",[scorll.asset.AssetForm],{
		templateString:"<div>\n\t<div style=\"width: 800px;\">\n\t\t<div>Question:</div>\n\t\t<div dojoType=\"dijit.form.Textarea\"\n\t\t\tdojoAttachPoint=\"questionBox\"\n\t\t\tstyle=\"width: 100%;\" ></div>\n\t\t<div>Answers:</div>\n\t\t<div dojoType=\"dijit.form.Textarea\"\n\t\t\tdojoAttachPoint=\"answersBox\"\n\t\t\tstyle=\"width: 100%; min-height: 200px;\" ></div>\n\t\t<div style=\"text-align: right;\">\n\t\t\t<div dojoType=\"dijit.form.Button\"\n\t\t\t\tdojoAttachEvent=\"onClick:submit\">Submit</div>\n\t\t\t<div dojoType=\"dijit.form.Button\"\n\t\t\t\tdojoAttachEvent=\"onClick:cancel\">Cancel</div>\n\t\t</div>\n\t</div>\n",
		postCreate: function() {
			if(!this.item.data) {
				return;
			}
			var data = this.item.data;
			this.questionBox.attr('value',data.question);
			if(data.answers) {
				var answersString = "";
				for(var i in data.answers) {
					answersString += data.answers[i] + "\n";
				}
				this.answersBox.attr('value',answersString.trim());
			}
		},
		submit: function() {
			var question = this.questionBox.attr('value').trim();
			var answers = this.answersBox.attr('value').trim().split("\n");
			var data = {};
			data.question = question;
			data.answers = answers;
			this.item.data = data;
			this.onSubmit(this.item);
		},
		cancel: function() {
			this.onCancel();
		}
	});
}
