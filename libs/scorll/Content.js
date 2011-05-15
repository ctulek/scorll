var groups = require('libs/scorll/Groups.js');
var client = require('libs/scorll/Client.js');
var asset = require('libs/scorll/Asset.js');

var call = function(ioclient, method) {
    var args = Array.prototype.slice.call(arguments);  
    var params = args.slice(2);
    params = [ioclient, 'content', method].concat(params);
    client.call.apply(client, params);
}

exports.addAsset = function(client, contentId, item, position, callback) {
   var content = tempData[contentId];
   if(!content) {
    console.error("Content not found");
    callback && callback("Content not found");
    return;
   }
   position = position || content.items.length;
   asset.post(item, function(err, id) {
       if(err) {
        callback && callback(err);
        return
       }
       content.items.splice(position,0,item.id); 
       groups.each(groups.id(client), function(client) {
           call(client, '_add', item, position);
       });
       callback && callback();
   });
}

exports.updateAsset = function(client, contentId, item, callback) {
    var content = tempData[contentId];
    if(!content) {
        callback && callback("Content not found");
        return;
    }
    var id = item.id;
    if(content.items.indexOf(id) < 0) {
        callback && callback("Asset not found");
        return;
    }
    asset.put(id, item, function(err) {
        if(err) {
            callback && callback(err);
            return;
        }
        groups.each(groups.id(client), function(client) {
           call(client, '_update', item);
        });
        callback && callback();
    });
}

exports.deleteAsset = function(client, contentId, item, callback) {
    var content = tempData[contentId];
    if(!content) {
        callback && callback("Content not found");
        return;
    }
    var id = item.id;
    var position = content.items.indexOf(id);
    if(position < 0) {
        callback && callback("Asset not found");
        return;
    }
    asset.delete(id, function(err) {
        if(err) {
            callback && callback(err);
            return;
        }
        content.items.splice(position,1);
        groups.each(groups.id(client), function(client) {
           call(client, '_remove', item);
        });
        callback && callback();
    });
}

exports.post = function(params, callback) {
    var id = Date.now();
    var content = {};
    content['id'] = id;
    content.title = '';
    content.items = [];
    for(var k in params) {
        content[k] = params[k];
    }
    tempData[id] = content;
    callback && callback(null, id);
}

exports.get = function(client, contentId, callback) {
    groups.add(contentId, client);
    var content = tempData[contentId];
    if(!content) {
        callback && callback("Not found");
        return;
    }
    asset.get(content.items, function(err, assets) {
        if(err) {
            callback && callback(err);
            return;
        }
        var c = {
            id: content.id,
            title: content.title,
            items: assets
        }
        callback && callback(null, c);
    });
}

exports.exists = function(contentId, callback) {
    callback && callback(null, !!tempData[contentId])
}

var tempData = {
    "1": {
        id: 1,
        title: "Test test test",
        items: ["test", "test2", "image1", "question1", "video1", "video2"]
        }
}
