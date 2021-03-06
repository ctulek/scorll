/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["scorll.asset.Text"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.asset.Text"] = true;
dojo.provide("scorll.asset.Text");

dojo.require("scorll.asset.Asset");
dojo.require("scorll.asset.Shared");

dojo.declare("scorll.asset.Text", [
  scorll.asset.Asset,
  scorll.asset.Shared
  ], {
  templateString:"<div>\n\t<p style=\"margin-bottom: 0px;\" dojoAttachPoint=\"bodyText\"></p>\n",
  postCreate: function () {
    var data = this.item.data;
    if (data.text) {
      var text = this.parseText(data.text);
      dojo.place(text, this.bodyText, "only");
    }
    if (data.title) {
      var title = '<h2 style="margin-top: 0px;">' + data.title.trim() + '</h2>';
      dojo.place(title, this.bodyText, "before");
    }
    var userid = this.user ? this.user.id : "unknown";
    this.call("test", "Test Message From User " + userid);
  },
  test: function (message) {
  },
  parseText: function (text) {
    // Clear Empty chars
    text = text.trim();
    // Clean HTML
    text = text.replace(/<\/?([^>])*>/gm, "");
    // Italic
    text = text.replace(/([^:])\/\/(.+?)\/\//gm, "$1<i>$2</i>");
    // Underline
    text = text.replace(/__(.+?)__/gm, "<u>$1</u>");
    // Bold
    text = text.replace(/\*\*(.+?)\*\*/gm, "<strong>$1</strong>");
    // Link
    text = text.replace(/\[\[(http:\/\/[^ ]+?)\]\]/gm, '<a href="$1" target="_blank">$1</a>');
    // Link with Label
    text = text.replace(/\[\[(http:\/\/[^ ]+?)( .+?)\]\]/gm, '<a href="$1" target="_blank">$2</a>');
    // Email
    text = text.replace(/\[\[mailto:([^ ]+?)\]\]/gm, '<a href="mailto:$1">$1</a>');
    // List Item
    text = text.replace(/^\* (.+?)$/gm, "<li>$1</li>");
    // New Line
    text = '<p style="margin-bottom: 0px;">' + text.replace(/\n+/gm, '</p><p style="margin-bottom: 0px;">') + "</p>";
    return text;
  }
});

}
