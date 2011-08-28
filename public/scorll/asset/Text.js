dojo.provide("scorll.asset.Text");

dojo.require("scorll.asset.Asset");
dojo.require("scorll.asset.Shared");

dojo.declare("scorll.asset.Text", [
  scorll.asset.Asset,
  scorll.asset.Shared
  ], {
  templatePath: dojo.moduleUrl('scorll.asset', 'Text.html'),
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
