if(!dojo._hasResource["scorll.stage.Stage"]){
dojo._hasResource["scorll.stage.Stage"]=true;
dojo.provide("scorll.stage.Stage");

dojo.require("dojo.store.Observable");
dojo.require("dijit.form.Button");

dojo.require("scorll.stage.Menu");
dojo.require("scorll.stage.Login");
dojo.require("scorll.stage.Register");
dojo.require("scorll.asset.AssetManager");

dojo.declare("scorll.stage.Stage",null,{
	mode: "guest",
    user: null,
    client: null,
	content: null,
	observer: null,
	menu: null,
    requireLogin: false,
	constructor: function(/* Object */args) {
		var stage = this;
		for(var k in args) {
			stage[k] = args[k];
		}
        // CLIENT
        var client = stage.client;
        client.connect();
        dojo.connect(client, "onConnect", function() {
            user.authCookie(function(err) {
                if(stage.requireLogin && err) {
                    console.log(err);
                    stage.userLogin();
                } else {
                    stage.content.load(1);
                }
            });
        });
        // USER
        var user = stage.user;
        client.register(user);
        // CONTENT
        var content = stage.content;
        client.register(content);
        stage.observe();
        // MENU
		var menu = stage.menu = new scorll.stage.Menu();
		stage.menu = menu;
		menu.placeAt(dojo.body());
		menu.hide();
		dojo.connect(menu,"onEdit",function(widget) {
			menu.hide(true);
			var assetManager = new scorll.asset.AssetManager();
			var form = assetManager.getAssetForm(widget.item);
			if(!form) {
				return;
			}
			var dialog = new dijit.Dialog();
			form.placeAt(dialog.containerNode);
			dialog.show();
			dojo.connect(form,"onSubmit",function(item) {
				dialog.hide();
				stage.content.update(item);
			});
			dojo.connect(form,"onCancel",function() {
				dialog.hide();
			});
		});
		dojo.connect(menu,"onDelete",function(widget) {
			menu.hide(true);
			stage.content.remove(widget.item);
		});
	},
	observe: function() {
		var stage = this;
        stage.observer = new dojo.store.Observable(stage.content.store);
		var assetManager = new scorll.asset.AssetManager();
		var result = this.observer.query();
		result.forEach(function(item) {
			var widget = assetManager.getAssetRenderer(stage, item);
			dojo.place(widget.domNode, "stage");
            stage.registerAsset(widget);
		});
		result.observe(function(item, removedFrom, insertedInto) {
			if(removedFrom > -1){ // existing object removed
				var node = dijit.byId("asset-" + item.id);
				if(node) {
                    node.destroyRecursive();
				}
			}
			if(insertedInto > -1){ // new or updated object inserted
				var widget = assetManager.getAssetRenderer(stage, item);
				dojo.place(widget.domNode, "stage", insertedInto);
                stage.registerAsset(widget);
			}
		}, true);
	},
    registerAsset: function(widget) {
        var stage = this;
        stage.client.register(widget);
        widget.user = stage.user;
        widget.stage = stage;
        dojo.connect(widget,"onMouseOver", function() {
            stage.menu.show(this.domNode);
        });
        dojo.connect(widget,"onMouseOut", function() {
            stage.menu.hide();
        });
    },
    newUserRegister: function(fromLoginForm, callback) {
        var stage = this;
        var widget = new scorll.stage.Register();
        var dialog = new dijit.Dialog();
        widget.placeAt(dialog.containerNode);
        dialog.show();
        dojo.connect(widget,"onSubmit",function(username, password) {
            var params = {
                strategy: "password",
                username: username,
                password: password,
                rememberme: true
            }
            stage.user.join(params, function(err) {
                if(!err) {
                    dialog.hide();
                    if(stage.content.loaded == false) {
                        stage.content.load(1, callback);
                    } else {
                        callback && callback();
                    }
                } else {
                    widget.showError(err);
                }
            });
        });
        dojo.connect(widget,"onCancel",function() {
            dialog.hide();
            if(fromLoginForm) {
                stage.userLogin(callback);
            }
        });
    },
    userLogin: function(callback) {
        var stage = this;
        var widget = new scorll.stage.Login();
        var dialog = new dijit.Dialog();
        widget.placeAt(dialog.containerNode);
        dialog.show();
        dojo.connect(widget,"onSubmit",function(username, password) {
            var params = {
                strategy: "password",
                username: username,
                password: password,
                rememberme: true
            }
            stage.user.auth(params, function(err) {
                if(!err) {
                    dialog.hide();
                    if(stage.content.loaded == false) {
                        stage.content.load(1, callback);
                    } else {
                        callback && callback();
                    }
                } else {
                    widget.showError(err);
                }
            });
        });
        dojo.connect(widget,"onCancel",function() {
            callback("Cancelled");
            dialog.hide();
        });
        dojo.connect(widget,"onRegister",function() {
            dialog.hide();
            stage.newUserRegister(true, callback);
        });
    }
});
}
