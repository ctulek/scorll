if(!dojo._hasResource["scorll.asset.MultipleChoice"]){
dojo._hasResource["scorll.asset.MultipleChoice"]=true;
dojo.provide("scorll.asset.MultipleChoice");
dojo.require("scorll.asset.Asset");
dojo.declare("scorll.asset.MultipleChoice",[scorll.asset.Asset],{
    templatePath: dojo.moduleUrl('scorll.asset', 'MultipleChoice.html'),
    postCreate: function() {
        var asset = this;
        var data = this.item.data;
        if(data.answers) {
            for(var i in data.answers) {
                var p = dojo.place("<p>" + data.answers[i] + "</p>", this.domNode);
                var input = dojo.place('<input type="radio" name="test" value="' + i + '" />', p, "first");
                dojo.connect(input, "change", function() {
                    console.log(this.value);
                    var params = {
                        type: asset.TRACKING_TYPE.CHOICE,
                        response: this.value
                    };
                    asset.track(params, function(err) {
                        console.log(arguments);
                    });
                });

            }
        }
    }
}
);
}
