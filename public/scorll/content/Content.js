if(!dojo._hasResource["scorll.content.Content"]){
dojo._hasResource["scorll.content.Content"]=true;
dojo.provide("scorll.content.Content");
dojo.require("dojo.store.Memory");
dojo.declare("scorll.content.Content",null,{
	constructor: function(/* Object */ args) {
		var content = this;
		for(var k in args) {
			content[k] = args[k];
		}
		var items = [
		{id: "test", type: "text", data: {
text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vulputate dictum egestas. Curabitur nisi nisi, pellentesque quis sodales id, euismod ut magna. Ut dui lectus, volutpat id dictum sit amet, accumsan nec tortor. Aliquam ac dui non leo aliquam lacinia. Ut egestas nisi a magna elementum scelerisque. Sed mattis facilisis nunc quis elementum. Aenean nisl dui, lobortis sed vehicula porttitor, consectetur nec ante. Vivamus vestibulum dignissim sollicitudin. Aliquam vulputate, est vel vehicula convallis, mi nunc consectetur dui, quis condimentum ligula augue sed elit."}},
		{id: "test2", type: "text", data: {title: "Lorem bolem", text: "Curabitur congue, leo a sodales pulvinar, lacus mi consectetur libero, a blandit turpis sapien a nisi. Donec fringilla enim faucibus risus tincidunt pretium. Integer rhoncus tincidunt pulvinar. Ut quis enim vitae dui tristique rhoncus et non tellus. Sed convallis turpis ut arcu sagittis lobortis. Quisque commodo posuere venenatis. Morbi aliquet rutrum auctor. Phasellus facilisis justo vel purus fringilla eget tristique est varius."}},
		{id: "image1", type: "image", data: {
url: "http://www.worcesterk12.com/media/medium/Service_Learning.jpg"}},
		{id: "question1", type: "multiplechoice",
data: {
						question: "Where is the capital of US?",
											answers: ["Washington","New York", "San Francisco", "Boston"]}},
		{id: "video1", type: "youtube", data: {video: "NDfew0YcDTo"}},
		{id: "test3", type: "text", data: {
			text: "Lorem ipsum"}}
		];
		items = [];
		content.store = new dojo.store.Memory({data: items});
	},
	query: function() {
		return this.store.query();
	},
	add: function(item) {
		if(item.id == undefined) {
			item.id = Date.now();
		}
		this.store.add(item);
	},
	update: function(item) {
		this.store.put(item, item.id);
	},
	remove: function(item) {
		this.store.remove(item.id);
	}	
});
}
