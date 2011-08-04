dojo.provide("scorll.asset.PollForm");

dojo.require("scorll.asset.AssetForm");
dojo.require("dijit.form.Textarea");

dojo.declare("scorll.asset.PollForm", [
  scorll.asset.AssetForm
  ], {
  templatePath: dojo.moduleUrl("scorll.asset", "PollForm.html"),
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
