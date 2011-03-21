if(!dojo._hasResource["scorll.asset.MultipleChoiceForm"]){
dojo._hasResource["scorll.asset.MultipleChoiceForm"]=true;
dojo.provide("scorll.asset.MultipleChoiceForm");

dojo.require("scorll.asset.AssetForm");
dojo.require("dijit.form.Textarea");

dojo.declare("scorll.asset.MultipleChoiceForm",[scorll.asset.AssetForm],{
		templatePath: dojo.moduleUrl("scorll.asset","MultipleChoiceForm.html"),
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
