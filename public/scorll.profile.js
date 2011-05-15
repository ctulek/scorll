dependencies = {
    layers: [
        {
        name: "scorll.js",
        resourceName: "scorll",
        dependencies: [
            "dojo",
            "dojo.store.Memory",
            "dojo.dnd.Source",
            "dijit.form.Button",
            "dijit.Dialog",
            "scorll.content.Content",
            "scorll.net.Client",
            "scorll.net.User",
            "scorll.stage.Stage"
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
