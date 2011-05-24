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
            var correctResponse = data['correctResponses'] ? data.correctResponses[0] : [];
			this.questionBox.attr('value',data.question);
			if(data.answers) {
				var answersString = "";
				for(var i in data.answers) {
                    var answerString = data.answers[i].trim();
                    if(correctResponse.indexOf(i) > -1) {
                        answerString = "* " + answerString;
                    }
					answersString +=  answerString + "\n";
				}
				this.answersBox.attr('value',answersString.trim());
			}
		},
		submit: function() {
			var question = this.questionBox.attr('value').trim();
			var answers = this.answersBox.attr('value').trim().split("\n");
            var correctResponse = [];
            for(var i in answers) {
                if(answers[i].indexOf("* ") == 0) {
                    correctResponse.push(i);
                    answers[i] = answers[i].slice(2);
                }
            }
			var data = {};
            data.type = correctResponse.length > 1 ? "checkbox" : "radio";
			data.question = question;
			data.answers = answers;
            data.correctResponses = [correctResponse];
			this.item.data = data;
			this.onSubmit(this.item);
		},
		cancel: function() {
			this.onCancel();
		}
	});
}
