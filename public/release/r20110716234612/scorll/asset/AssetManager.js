/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["scorll.asset.AssetManager"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.asset.AssetManager"] = true;
dojo.provide("scorll.asset.AssetManager");

dojo.declare("scorll.asset.AssetManager", null, {
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
        },
        "scribd": {
            label: "Scribd Document",
            renderer: "scorll.asset.Scribd",
            form: "scorll.asset.ScribdForm"
        },
        "vimeo": {
            label: "Vimeo Video",
            renderer: "scorll.asset.Vimeo",
            form: "scorll.asset.VimeoForm"
        },
        "poll": {
            label: "Poll",
            renderer: "scorll.asset.Poll",
            form: "scorll.asset.PollForm"
        }

    },
    getAssetRenderer: function(stage, item) {
        if (!this.assets[item.type]) {
            console.error("Undefined asset type: " + item.type);
            return null;
        }
        var className = this.assets[item.type].renderer;
        try {
            dojo['require'](className);
        } catch (e) {
            console.error(e);
            return null;
        }
        var ctor = dojo.getObject(className, true);
        var args = {};
        args.item = item;
        args.user = stage.user;
        args.client = stage.client;
        args.content = stage.content;
        args.id = "asset-" + item.id; // Used by the Memory Store
        var asset = new ctor(args);
        return asset;
    },
    getAssetForm: function(item) {
        if (!this.assets[item.type]) {
            console.error("Undefined asset type: " + item.type);
            return null;
        }
        var className = this.assets[item.type].form;
        try {
            dojo['require'](className);
        } catch (e) {
            console.error(e);
            return null;
        }
        var ctor = dojo.getObject(className, true);
        return new ctor({
            item: item
        });
    }
});

}
