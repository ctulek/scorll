dojo.provide("scorll.asset.Image");

dojo.require("scorll.asset.Asset");

dojo.declare("scorll.asset.Image", [
    scorll.asset.Asset
    ], {
    templatePath: dojo.moduleUrl('scorll.asset', 'Image.html')
});
