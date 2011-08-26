dojo.provide("scorll.asset.YouTubeForm");

dojo.require("dijit.form.ValidationTextBox");
dojo.require("dojox.layout.TableContainer");

dojo.require("scorll.asset.AssetForm");

dojo.declare("scorll.asset.YouTubeForm", [
  scorll.asset.AssetForm
  ], {
  widgetsInTemplate: true,
  templatePath: dojo.moduleUrl("scorll.asset", "YouTubeForm.html"),
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
