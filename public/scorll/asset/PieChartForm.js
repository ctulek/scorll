dojo.provide("scorll.asset.PieChartForm");

dojo.require("scorll.asset.AssetForm");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.Textarea");

dojo.declare("scorll.asset.PieChartForm", [
  scorll.asset.AssetForm
  ], {
  widgetsInTemplate: true,
  templatePath: dojo.moduleUrl("scorll.asset", "PieChartForm.html"),
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
