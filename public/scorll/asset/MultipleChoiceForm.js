dojo.provide("scorll.asset.MultipleChoiceForm");

dojo.require("scorll.asset.AssetForm");
dojo.require("dijit.form.Textarea");

dojo.declare("scorll.asset.MultipleChoiceForm", [
  scorll.asset.AssetForm
  ], {
  templatePath: dojo.moduleUrl("scorll.asset", "MultipleChoiceForm.html"),
  postCreate: function () {
    this.formContainer.startup();
    if (!this.item.data) {
      this.answersBox.attr('value', this.getHelpText());
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
  },
  getHelpText: function() {
    return "\
Each line becomes an answer\n\
* Line starting with an asteriks and space is the correct answer\n\
Another answer\n\
Another answer".trim();
  }
});
