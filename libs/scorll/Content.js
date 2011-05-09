var groups = require('libs/scorll/Groups.js');
var client = require('libs/scorll/Client.js');

var call = function(ioclient, method) {
    var args = Array.prototype.slice.call(arguments);  
    var params = args.slice(2);
    params = [ioclient, 'content', method].concat(params);
    client.call.apply(client, params);
}

exports.add = function(client, item, callback) {
   item.id = Date.now();
   tempData.push(item); 
   groups.each(groups.id(client), function(client) {
       call(client, '_add', item);
   });
}

exports.update = function(client, item, callback) {
    var id = item.id;
    var updated = false;
    for(var i in tempData) {
        if(tempData[i].id == id) {
            tempData[i] = item;
            updated = true;
            break;
        }
    }
    if(updated) {
        groups.each(groups.id(client), function(client) {
           call(client, '_update', item);
        });
        callback();
    } else {
        callback("Undefined id: " + id);
    }
}

exports.remove = function(client, item, callback) {
    var id = item.id;
    var removed = false;
    for(var i in tempData) {
        if(tempData[i].id == id) {
            delete(tempData[i]);
            removed = true;
            break;
        }
    }
    if(removed) {
        groups.each(groups.id(client), function(client) {
           call(client, '_remove', item);
        });
        callback();
    } else {
        callback("Undefined id: " + id);
    }
}

exports.load = function(client, contentId, callback) {
    groups.add(contentId, client);
    var content = {id: contentId, title: "Lorem Lorem Lorem", items: tempData};
    callback(null, content);
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
