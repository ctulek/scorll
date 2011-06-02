dojo.provide("scorll.asset.MultipleChoice");

dojo.require("dojo.string");

dojo.require("scorll.asset.Asset");

dojo.declare("scorll.asset.MultipleChoice", [
    scorll.asset.Asset,
    scorll.asset.Tracking
    ], {
    templatePath: dojo.moduleUrl('scorll.asset', 'MultipleChoice.html'),
    responses: [],
    postCreate: function() {
        var asset = this;
        var data = this.item.data;
        asset.getTrackingResult(function(err, result) {
            if (result) {
                var learnerResponse = result.response;
                if (Array.isArray(learnerResponse)) asset.responses = learnerResponse;
            }
            if (data.answers) {
                for (var i in data.answers) {
                    var type = data.type || "radio";
                    var id = "interaction-" + asset.item.id + "-" + i;
                    var name = "interaction" + asset.item.id;
                    var value = i;
                    var label = data.answers[i];
                    var html = dojo.string.substitute('<p><label for="${0}">${1}</label></p>', [id, label]);
                    var p = dojo.place(html, asset.domNode);
                    // Checked
                    if (learnerResponse) {
                        if (Array.isArray(learnerResponse)) {
                            var checked = (learnerResponse.indexOf(i) > -1 && " checked") || "";
                        } else {
                            var checked = (learnerResponse == i && " checked") || "";
                        }
                    } else {
                        var checked = "";
                    }
                    html = dojo.string.substitute('<input type="${0}" id="${1}" name="${2}" value="${3}"${4}/>', [type, id, name, value, checked]);
                    var input = dojo.place(html, p, "first");
                    dojo.connect(input, "change", function() {
                        if (type == 'radio') {
                            var response = this.value;
                        } else {
                            if (this.checked) {
                                asset.responses.push(this.value);
                            } else {
                                asset.responses.splice(asset.responses.indexOf(this.value), 1);
                            }
                            var response = asset.responses;
                        }
                        var params = {
                            type: asset.TRACKING_TYPE.CHOICE,
                            response: response
                        };
                        asset.track(params, function(err) {
                            // TODO: You can add feedback here
                            console.log(arguments);
                        });
                    });

                }
            }
        });
    }
});
