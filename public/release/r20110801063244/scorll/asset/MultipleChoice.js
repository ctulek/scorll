/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["scorll.asset.MultipleChoice"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.asset.MultipleChoice"] = true;
dojo.provide("scorll.asset.MultipleChoice");

dojo.require("dojo.string");

dojo.require("scorll.asset.Asset");

dojo.declare("scorll.asset.MultipleChoice", [
    scorll.asset.Asset,
    scorll.asset.Tracking
    ], {
    templateString:"<div>\n\t<div>${item.data.question}</div>\n</div>\n",
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
                    var html = dojo.string.substitute('<p style="margin-bottom: 0px"><label for="${0}">${1}</label></p>', [id, label]);
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

}
