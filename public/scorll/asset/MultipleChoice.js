dojo.provide("scorll.asset.MultipleChoice");

dojo.require("dojo.string");

dojo.require("scorll.asset.Asset");

dojo.declare("scorll.asset.MultipleChoice", [
  scorll.asset.Asset,
  scorll.asset.Tracking
  ], {
  templatePath: dojo.moduleUrl('scorll.asset', 'MultipleChoice.html'),
  responses: [],
  inputs: {},
  postCreate: function () {
    var asset = this;
    var data = this.item.data;
    if (data.answers) {
      for (var i in data.answers) {
        var type = data.type || "radio";
        var id = "interaction-" + asset.item.id + "-" + i;
        var name = "interaction" + asset.item.id;
        var value = i;
        var label = data.answers[i];
        var html = dojo.string.substitute('<p style="margin-bottom: 0px"><label for="${0}">${1}</label></p>', [id, label]);
        var p = dojo.place(html, asset.domNode);
        html = dojo.string.substitute('<input type="${0}" id="${1}" name="${2}" value="${3}"/>', [type, id, name, value]);
        var input = dojo.place(html, p, "first");
        asset.inputs[i] = input;
        dojo.connect(input, "change", function () {
          if (type == 'radio') {
            var response = this.value;
          }
          else {
            if (this.checked) {
              asset.responses.push(this.value);
            }
            else {
              asset.responses.splice(asset.responses.indexOf(this.value), 1);
            }
            var response = asset.responses;
          }
          var params = {
            type: asset.TRACKING_TYPE.CHOICE,
            response: response
          };
          asset.track(params, function (err) {
            // TODO: You can add feedback here
          });
        });

      }
    }
    asset.updateLearnerResponse();
    dojo.connect(asset.user, "onLogin", function () {
      asset.updateLearnerResponse();
    });
  },
  updateLearnerResponse: function () {
    var asset = this;
    asset.getTrackingResult(function (err, result) {
      if (err || !result || !result.response) {
        return;
      }
      var learnerResponse = result.response;
      if (Array.isArray(learnerResponse)) asset.responses = learnerResponse;
      if (Array.isArray(learnerResponse)) {
        learnerResponse.forEach(function (index) {
          var input = asset.inputs[index];
          input.checked = "checked";
        });
      }
      else {
        var input = asset.inputs[learnerResponse];
        input.checked = "checked";
      }
    });
  }
});
