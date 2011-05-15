/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["scorll.asset.MultipleChoice"]){
dojo._hasResource["scorll.asset.MultipleChoice"]=true;
dojo.provide("scorll.asset.MultipleChoice");

dojo.require("dojo.string");

dojo.require("scorll.asset.Asset");

dojo.declare("scorll.asset.MultipleChoice",[scorll.asset.Asset],{
    templateString:"<div>\n\t<div>${item.data.question}</div>\n</div>\n",
    postCreate: function() {
        var asset = this;
        var data = this.item.data;
        if(data.answers) {
            for(var i in data.answers) {
                var type = "radio";
                var id = "interaction-" + this.item.id + "-" + i;
                var name = "interaction" + this.item.id;
                var value = i;
                var label = data.answers[i];
                var html = dojo.string.substitute(
                    '<p><label for="${0}">${1}</label></p>',
                    [id, label]);
                var p = dojo.place(html, this.domNode);
                html = dojo.string.substitute(
                    '<input type="${0}" id="${1}" name="${2}" value="${3}" />',
                    [type, id, name, value]);
                var input = dojo.place(html, p, "first");
                dojo.connect(input, "change", function() {
                    var params = {
                        type: asset.TRACKING_TYPE.CHOICE,
                        response: this.value
                    };
                    asset.track(params, function(err) {
                    });
                });

            }
        }
    }
}
);
}
