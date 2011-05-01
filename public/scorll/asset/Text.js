if(!dojo._hasResource["scorll.asset.Text"]){
dojo._hasResource["scorll.asset.Text"]=true;
dojo.provide("scorll.asset.Text");

dojo.require("scorll.asset.Asset");

dojo.declare("scorll.asset.Text",[scorll.asset.Asset], {
    templatePath    : dojo.moduleUrl('scorll.asset', 'Text.html'),
    postCreate: function() {
        var data = this.item.data;
        if(data.text) {
            this.bodyText.innerHTML = data.text;
        }
        if(data.title) {
            this.titleText.innerHTML = data.title;
        } else {
            dojo.destroy(this.titleText);
        }
        this.call("test","Test Message From My Self");
    },
    test: function(message) {
        console.log("Message to Test: " + message);
    }
});
}
