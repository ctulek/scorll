/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["scorll.asset.MultipleChoice"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.asset.MultipleChoice"] = true;
dojo.provide("scorll.asset.MultipleChoice");

dojo.require("scorll.asset.Asset");

dojo.declare("scorll.asset.MultipleChoice", [
  scorll.asset.Asset,
  scorll.asset.Tracking
  ], {
  templateString:"<div>\n\t<div>${item.data.question}</div>\n</div>\n",
  responses: null,
  inputs: null,
  postCreate: function () {
    var asset = this;
    asset.responses = [];
    asset.inputs = [];
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
            if(err) {
              console.error(err);
            }
            // TODO: You can add feedback here
          });
        });

      }
    }
    asset.updateLearnerResponse();
    dojo.connect(asset.user, "onLogin", function () {
      asset.updateLearnerResponse();
    });
    dojo.connect(asset.user, "onLogout", function () {
      asset.inputs.forEach(function (input) {
        input.checked = "";
      });
      asset.responses = [];
    });
  },
  updateLearnerResponse: function () {
    var asset = this;
    asset.getTrackingResult(function (err, tracking) {
      if (err) {
        console.error(err);
        return;
      }
      else if (!tracking || !tracking.responses) {
        return;
      }
      var response = tracking.responses[tracking.responses.length - 1];
      var learnerResponse = response.response;
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

}
