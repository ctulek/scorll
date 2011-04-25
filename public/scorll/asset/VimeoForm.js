if(!dojo._hasResource["scorll.asset.VimeoForm"]){
dojo._hasResource["scorll.asset.VimeoForm"]=true;
dojo.provide("scorll.asset.VimeoForm");

dojo.require("scorll.asset.AssetForm");
dojo.require("dijit.form.TextBox");
dojo.require("dojox.layout.TableContainer");

dojo.declare("scorll.asset.VimeoForm",[scorll.asset.AssetForm],{
		templatePath: dojo.moduleUrl("scorll.asset","VimeoForm.html"),
		postCreate: function() {
			if(!this.item.data) {
				return;
			}
			var data = this.item.data;
			if(data.video) {
				var url = "http://www.vimeo.com/" + data.video;
				this.videoUrl.attr('value',url);
			}
		},
		submit: function() {
			var regex = new RegExp("com\/([^&]+)");
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
}
