/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["scorll.stage.Stage"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.stage.Stage"] = true;
dojo.provide("scorll.stage.Stage");

dojo.require("dojo.dnd.Source");

dojo.require("dijit.InlineEditBox");
dojo.require("dijit.form.TextBox");

dojo.require("scorll.stage.Login");
dojo.require("scorll.stage.Register");
dojo.require("scorll.asset.AssetManager");
dojo.require("scorll.asset.AssetWrapper");
dojo.require("scorll.asset.Dialog");


dojo.declare("scorll.stage.Stage", null, {
    mode: "guest",
    user: null,
    client: null,
    content: null,
    observer: null,
    stage: null,
    requireLogin: false,
    constructor: function ( /* Object */ args) {
        var stage = this;
        for (var k in args) {
            stage[k] = args[k];
        }
        // CLIENT
        var client = stage.client;
        client.connect();
        dojo.connect(client, "onConnect", function () {
            user.authCookie(function (err) {
                if (stage.requireLogin && err) {
                    console.log(err);
                    stage.userLogin();
                } else {
                    stage.content.load();
                }
            });
        });
        // USER
        var user = stage.user;
        user.client = client;
        // CONTENT
        var content = stage.content;
        client.register(content);
        stage.observe();
        dojo.connect(content, "onTitleChange", function(title) {
            contentTitleBox.set("value", title);
        });
        // CONTENT TITLE
        var contentTitleBox = new dijit.InlineEditBox({editor: "dijit.form.TextBox"}, "title");
        dojo.connect(contentTitleBox, "onChange", function(value) {
            content.setTitle(value);
        });
        // ASSET MANAGER
        var assetManager = stage.assetManager = new scorll.asset.AssetManager();
        // STAGE
        stage.stage = new dojo.dnd.Source("stage", {delay: 10});
        dojo.connect(stage.stage, "onDropInternal", function(nodes, copy) {
            var children = dojo.query("#stage > div");
            var tokens = nodes[0].id.split("-");
            var id = tokens[2];
            for(var i in children) {
                if(children[i] == nodes[0]) {
                    var position = i;
                    content.move(id, position);
                    break;
                }
            }
        });
    },
    observe: function () {
        var stage = this;
        dojo.connect(stage.content, "onAdd", function(asset, position) {
            var sibling = null;
            if(position) {
                var siblings = dojo.query("#stage > div");
                sibling = siblings[position];
            }
            var args = {
                id: "asset-wrapper-" + asset.id,
                asset: asset,
                stage: stage,
                assetManager: stage.assetManager
            }
            var assetWrapper = new scorll.asset.AssetWrapper(args);
            dojo.place(assetWrapper.domNode, "stage");
            if(sibling) {
                stage.stage.insertNodes(false, [assetWrapper.domNode], true, sibling);
            } else {
                stage.stage.insertNodes(false, [assetWrapper.domNode]);
            }
            stage.registerAsset(assetWrapper.widget);
        });
        dojo.connect(stage.content, "onUpdate", function(asset) {
            var assetWrapper = dijit.byId("asset-wrapper-" + asset.id);
            if(assetWrapper) {
                assetWrapper.updateAsset(asset);
            }
        });
        dojo.connect(stage.content, "onRemove", function(id) {
            var assetWrapper = dijit.byId("asset-wrapper-" + id);
            if(assetWrapper) {
                assetWrapper.destroyRecursive();
            }
        });
        dojo.connect(stage.content, "onMove", function(id, position) {
            var assetWrapper = dijit.byId("asset-wrapper-" + id);
            if(!assetWrapper) {
                return;
            }
            dojo.byId("stage").removeChild(assetWrapper.domNode);
            var sibling = dojo.query("#stage > div");
            sibling = sibling[position];
            if(sibling) {
                dojo.place(assetWrapper.domNode, sibling, "before");
            } else {
                dojo.place(assetWrapper.domNode, "stage");
            }
        });
    },
    registerAsset: function (widget) {
        var stage = this;
        stage.client.register(widget);
        widget.user = stage.user;
        widget.stage = stage;
    },
    newUserRegister: function (fromLoginForm, callback) {
        var stage = this;
        var widget = new scorll.stage.Register();
        var dialog = new scorll.asset.Dialog();
        widget.placeAt(dialog.containerNode);
        dialog.show();
        dojo.connect(widget, "onSubmit", function (username, email, password) {
            var params = {
                strategy: "user",
                username: username,
                email: email,
                password: password
            }
            stage.user.register(params, function (err) {
                if (!err) {
                    dialog.hide();
                    if (stage.content.loaded == false) {
                        stage.content.load(callback);
                    } else {
                        callback && callback();
                    }
                } else {
                    widget.showError(err);
                }
            });
        });
        dojo.connect(widget, "onCancel", function () {
            dialog.hide();
            if (fromLoginForm) {
                stage.userLogin(callback);
            }
        });
    },
    userLogin: function (callback) {
        var stage = this;
        var widget = new scorll.stage.Login();
        var dialog = new scorll.asset.Dialog();
        widget.placeAt(dialog.containerNode);
        dialog.show();
        dojo.connect(widget, "onSubmit", function (username, password) {
            var params = {
                strategy: "user",
                username: username,
                password: password,
                rememberme: true
            }
            stage.user.auth(params, function (err) {
                if (!err) {
                    dialog.hide();
                    if (stage.content.loaded == false) {
                        stage.content.load(callback);
                    } else {
                        callback && callback();
                    }
                } else {
                    widget.showError(err);
                }
            });
        });
        dojo.connect(widget, "onCancel", function () {
            callback && callback("Cancelled");
            dialog.hide();
        });
        dojo.connect(widget, "onRegister", function () {
            dialog.hide();
            stage.newUserRegister(true, callback);
        });
    }
});

}
