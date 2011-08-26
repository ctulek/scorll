/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["scorll.asset.YouTubeForm"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.asset.YouTubeForm"] = true;
dojo.provide("scorll.asset.YouTubeForm");

dojo.require("dijit.form.ValidationTextBox");
dojo.require("dojox.layout.TableContainer");

dojo.require("scorll.asset.AssetForm");

dojo.declare("scorll.asset.YouTubeForm", [
  scorll.asset.AssetForm
  ], {
  widgetsInTemplate: true,
  templateString:"<div title=\"YouTube Video\">\n  <div style=\"width: 100%;\">\n    <div dojoType=\"dojox.layout.TableContainer\" dojoAttachPoint=\"formContainer\" cols=\"1\" labelWidth=\"120\">\n      <div dojoType=\"dijit.form.ValidationTextBox\"\n        dojoAttachPoint=\"videoUrl\"\n        required=\"true\"\n        title=\"Video Url\" style=\"width: 100%\"></div>\n    </div>\n    <div title=\"Preview\" style=\"text-align: center; margin: 10px;\">\n      <img dojoAttachPoint=\"previewImg\" width=\"480\" height=\"360\"/>\n    </div>\n    <div style=\"text-align: right;\">\n      <div dojoType=\"dijit.form.Button\" dojoAttachEvent=\"onClick:submit\">Submit</div>\n      <div dojoType=\"dijit.form.Button\" dojoAttachEvent=\"onClick:cancel\">Cancel</div>\n    </div>\n  </div>\n",
  youtubeRegex:
  "(http://)?(www.)?(youtube\\.com/watch\\?v=|youtu\\.be/)([^&]+).*",
  postCreate: function () {
    var asset = this;
    this.formContainer.startup();
    this.videoUrl.regExpGen = function() {
        return asset.youtubeRegex;
    };
    dojo.connect(this.videoUrl,"onChange",function() {
      if(true || this.isValid()) {
        var regex = new
        RegExp(asset.youtubeRegex);
        var match = regex.exec(asset.videoUrl.attr('value').trim());
        var video = match.pop();
        console.log(match);
        var url = "http://img.youtube.com/vi/" + video + "/0.jpg";
        asset.previewImg.src = url;
      }
    });
    if (!this.item.data) {
      return;
    }
    var data = this.item.data;
    if (data.video) {
      var url = "http://www.youtube.com/watch?v=" + data.video;
      this.videoUrl.attr('value', url);
    }
  },
  submit: function () {
    var asset = this;
    if(!asset.videoUrl.isValid()) {
      return;
    }
    var regex = new
    RegExp(asset.youtubeRegex);
    var match = regex.exec(asset.videoUrl.attr('value').trim());
    if(!match) {
      return;
    }
    var video = match.pop();
    var data = {};
    data.video = video;
    asset.item.data = data;
    asset.onSubmit(asset.item);
  },
  cancel: function () {
    this.onCancel();
  }
});

}
