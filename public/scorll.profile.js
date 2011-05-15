dependencies = {
    layers: [
        {
        name: "scorll.js",
        dependencies: [
            "dojo",
            "dojo.store.Memory",
            "dojo.dnd.Source",
            "dijit.form.Button",
            "dijit.Dialog",
            "scorll.content.Content",
            "scorll.net.Client",
            "scorll.net.User",
            "scorll.stage.Stage",
			"scorll.asset.Text",
			"scorll.asset.TextForm",
			"scorll.asset.Image",
			"scorll.asset.ImageForm",
			"scorll.asset.MultipleChoice",
			"scorll.asset.MultipleChoiceForm",
			"scorll.asset.YouTube",
			"scorll.asset.YouTubeForm",
			"scorll.asset.SlideShare",
			"scorll.asset.SlideShareForm",
			"scorll.asset.Scribd",
			"scorll.asset.ScribdForm",
			"scorll.asset.Vimeo",
			"scorll.asset.VimeoForm"
            ],
        layerDependencies: [
            "scorll.asset.AssetManager"
        ]
        }
    ],
    prefixes: [
        ["dojo", "../../dojo"],
        ["dijit", "../dijit"],
        ["dojox", "../dojox"]
    ]
}
