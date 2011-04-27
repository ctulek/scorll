var groups = require('libs/scorll/Groups.js');

exports.handle = function(client, message, callback) {
    if(message.action == "load" && callback) {
        load(client, message.data, function(err, data) {
            var message = {};
            if(err) {
                message.status = 'error';
                message.errorMessage = err;
            } else {
                message.status = 'ok';
            }
            message.data = data;
            callback(err, message);
        });
    } else if(message.action == "add") {
        add(client, message);
    } else if(message.action == "update") {
        update(client, message);
    } else if(message.action == "remove") {
        remove(client, message);
    }
}

var add = function(client, message) {
   message.data.item.id = Date.now();
   tempData.push(message.data.item); 
   message.status = 'ok';
   groups.each(groups.id(client), function(client) {
        client.send(message);
   });
}

var update = function(client, message) {
    var id = message.data.item.id;
    var updated = false;
    for(var i in tempData) {
        if(tempData[i].id == id) {
            tempData[i] = message.data.item;
            updated = true;
            break;
        }
    }
    if(updated) {
       message.status = "ok";
    } else {
       message.status = "error";
       message.errorMessage = "Undefined id: " + id;
    }
   groups.each(groups.id(client), function(client) {
        client.send(message);
   });
}

var remove = function(client, message) {
    var id = message.data.item.id;
    var removed = false;
    for(var i in tempData) {
        if(tempData[i].id == id) {
            delete(tempData[i]);
            removed = true;
            break;
        }
    }
    if(removed) {
       message.status = "ok";
    } else {
       message.status = "error";
       message.errorMessage = "Undefined id: " + id;
    }
   groups.each(groups.id(client), function(client) {
        client.send(message);
   });
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
		{id: "video2", type: "vimeo", data: {video: "22721995"}}
		];
