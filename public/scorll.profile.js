dependencies = {
    localeList: "en-us",
    layers: [
        {
        name: "../scorll/scorll.js",
        dependencies: [
            "dojo",
            "dijit.form.DropDownButton",
            "dijit.TooltipDialog",
            "dijit.TitlePane",
            "scorll.asset.NewAssetForm",
            "scorll.content.Content",
            "scorll.net.Client",
            "scorll.net.User",
            "scorll.stage.Stage"
            ]
        }
    ],
    prefixes: [
        ["dojo", "../../dojo"],
        ["dijit", "../dijit"],
        ["dojox", "../dojox"],
        ["scorll", "../scorll"]
    ]
}
