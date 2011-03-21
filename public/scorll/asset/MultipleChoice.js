if(!dojo._hasResource["scorll.asset.MultipleChoice"]){
dojo._hasResource["scorll.asset.MultipleChoice"]=true;
dojo.provide("scorll.asset.MultipleChoice");
dojo.require("scorll.asset.Asset");
dojo.declare("scorll.asset.MultipleChoice",[scorll.asset.Asset],
		{
			templatePath    : dojo.moduleUrl('scorll.asset', 'MultipleChoice.html'),
			postCreate: function() {
				var data = this.item.data;
				if(data.answers) {
					for(var i in data.answers) {
						dojo.place("<p><input type=\"radio\">" + data.answers[i] + "</p>", this.domNode);
					}
				}
			}
		}
);
}
