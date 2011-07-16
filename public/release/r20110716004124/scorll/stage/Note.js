/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["scorll.stage.Note"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.stage.Note"] = true;
dojo.provide("scorll.stage.Note");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.InlineEditBox");
dojo.require("dijit.form.Textarea");

dojo.require("scorll.net.ClientComponent");

dojo.declare("scorll.stage.Note", [
    dijit._Widget, dijit._Templated,
    scorll.net.ClientComponent
    ], {
    id: null,
    user: null,
    client: null,
    stage: null,
    text: null,
    templateString:"<div style=\"width: 120px\">\n\t<p dojoAttachPoint=\"bodyText\"></p>\n",
    bodyTextBox: null,
    postCreate: function() {
        if (this.text) {
            this.bodyText.innerHTML = this.text;
        }
        this.bodyTextBox = new dijit.InlineEditBox({editor: "dijit.form.Textarea"}, this.bodyText);
    },
    // scorll.net.ClientComponent functions
    getComponentType: function () {
        return "note";
    },
    getComponentId: function () {
        return this.id;
    }
});

}
