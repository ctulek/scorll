var groups = require('libs/scorll/Groups.js');

exports.handle = function(client, message) {
    if(message.action == "load") {
        var callbackId = message.callbackId;
        load(client, message.data, function(err, data) {
            var message = {};
            if(err) {
                message.status = 'error';
                message.errorMessage = err;
            } else {
                message.status = 'ok';
            }
            message.callbackId = callbackId;
            message.data = data;
            client.send(message);
        });
    }
}

var load = function(client, data, callback) {
    groups.add(data.id, client);
    callback(undefined, {id: "1", title: "Lorem Lorem Lorem", items: tempData});
}


var tempData = [
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
