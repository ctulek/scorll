dojo.provide("scorll.asset.YouTubeForm");

dojo.require("dijit.form.TextBox");
dojo.require("dojox.layout.TableContainer");

dojo.require("scorll.asset.AssetForm");

dojo.declare("scorll.asset.YouTubeForm", [
    scorll.asset.AssetForm
    ], {
    widgetsInTemplate: true,
    templatePath: dojo.moduleUrl("scorll.asset", "YouTubeForm.html"),
    postCreate: function() {
        this.formContainer.startup();
        if (!this.item.data) {
            return;
        }
        var data = this.item.data;
        if (data.video) {
            var url = "http://www.youtube.com/watch?v=" + data.video;
            this.videoUrl.attr('value', url);
        }
    },
    submit: function() {
        var regex = new RegExp("v=([^&]+)");
        var match = regex.exec(this.videoUrl.attr('value').trim());
        var video = match[1];
        var data = {};
        data.video = video;
        this.item.data = data;
        this.onSubmit(this.item);
    },
    cancel: function() {
        this.onCancel();
    }
});
