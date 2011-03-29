if(!dojo._hasResource["scorll.asset.AssetManager"]){
dojo._hasResource["scorll.asset.AssetManager"]=true;
dojo.provide("scorll.asset.AssetManager");
dojo.require("dijit.Dialog");
dojo.declare("scorll.asset.AssetManager",null,{
	assets: {
		"text": {
			label: "Text",
			renderer: "scorll.asset.Text",
			form: "scorll.asset.TextForm"
		},
		"image": {
			label: "Image",
			renderer: "scorll.asset.Image",
			form: "scorll.asset.ImageForm"
		},
		"multiplechoice": {
			label: "Multiple Choice",
			renderer: "scorll.asset.MultipleChoice",
			form: "scorll.asset.MultipleChoiceForm"
		},
		"youtube": {
			label: "YouTube Video",
			renderer: "scorll.asset.YouTube",
			form: "scorll.asset.YouTubeForm"
		},
		"slideshare": {
			label: "SlideShare Presentation",
			renderer: "scorll.asset.SlideShare",
			form: "scorll.asset.SlideShareForm"
		}
  },
	getAssetRenderer: function(item) {
		if(!this.assets[item.type]) {
			console.error("Undefined asset type: " + item.type);
			return null;
		}
		var className = this.assets[item.type].renderer;
		try {
			dojo.require(className);
		} catch (e) {
			console.error(e);
			return null;
		}
		var ctor = dojo.getObject(className, true);
		return new ctor({item: item});
	},
	getAssetForm: function(item) {
		if(!this.assets[item.type]) {
			console.error("Undefined asset type: " + item.type);
			return null;
		}
		var className = this.assets[item.type].form;
		try {
			dojo.require(className);
		} catch (e) {
			console.error(e);
			return null;
		}
		var ctor = dojo.getObject(className, true);
		return new ctor({item: item});
	}
});
}
