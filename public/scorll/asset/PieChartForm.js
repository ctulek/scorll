dojo.provide("scorll.asset.PieChartForm");

dojo.require("scorll.asset.AssetForm");
dojo.require("dijit.form.Textarea");

dojo.declare("scorll.asset.PieChartForm", [
  scorll.asset.AssetForm
  ], {
  templatePath: dojo.moduleUrl("scorll.asset", "PieChartForm.html"),
  postCreate: function () {
    this.formContainer.startup();
    if (!this.item.data) {
      return;
    }
    var data = this.item.data;
    this.valuesBox.attr('value', data.values);
  },
  submit: function () {
    var values = this.valuesBox.attr('value').trim();
    var data = {};
    data.values = values;
    this.item.data = data;
    this.onSubmit(this.item);
  },
  cancel: function () {
    this.onCancel();
  }
});
