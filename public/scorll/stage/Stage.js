dojo.provide("scorll.stage.Stage");

dojo.require("dojo.dnd.Source");

dojo.require("dijit.InlineEditBox");
dojo.require("dijit.form.TextBox");

dojo.require("scorll.stage.Menu");
dojo.require("scorll.stage.Login");
dojo.require("scorll.stage.Register");
dojo.require("scorll.asset.AssetManager");
dojo.require("scorll.asset.Dialog");

dojo.declare("scorll.stage.Stage", null, {
    mode: "guest",
    user: null,
    client: null,
    content: null,
    observer: null,
    menu: null,
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
        dojo.connect(content, "onLoad", function() {
            contentTitleBox.set("value", content.title);
        });
        // CONTENT TITLE
        var contentTitleBox = new dijit.InlineEditBox({editor: "dijit.form.TextBox"}, "title");
        dojo.connect(contentTitleBox, "onChange", function(value) {
            content.setTitle(value);
        });
        // ASSET MANAGER
        var assetManager = stage.assetManager = new scorll.asset.AssetManager();
        // MENU
        var menu = stage.menu = new scorll.stage.Menu();
        stage.menu = menu;
        menu.placeAt(dojo.body());
        menu.hide();
        dojo.connect(menu, "onEdit", function (widget) {
            menu.hide(true);
            var form = assetManager.getAssetForm(widget.item);
            if (!form) {
                return;
            }
            var dialog = new scorll.asset.Dialog();
            form.placeAt(dialog.containerNode);
            dialog.show();
            dojo.connect(form, "onSubmit", function (item) {
                dialog.hide();
                stage.content.update(item);
            });
            dojo.connect(form, "onCancel", function () {
                dialog.hide();
            });
        });
        dojo.connect(menu, "onDelete", function (widget) {
            menu.hide(true);
            stage.content.remove(widget.item);
        });
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
            var widget = stage.assetManager.getAssetRenderer(stage, asset);
            var sibling = null;
            if(position) {
                var siblings = dojo.query("#stage > div");
                sibling = siblings[position];
            }
            var assetWrapper = dojo.place('<div id="asset-wrapper-'+asset.id+'" class="dojoDndItem"></div>', "stage");
            dojo.place(widget.domNode, assetWrapper);
            if(sibling) {
                stage.stage.insertNodes(false, [assetWrapper], true, sibling);
            } else {
                stage.stage.insertNodes(false, [assetWrapper]);
            }
            stage.registerAsset(widget);
        });
        dojo.connect(stage.content, "onUpdate", function(asset) {
            var oldWidget = dojo.byId("asset-" + asset.id);
            var widget = stage.assetManager.getAssetRenderer(stage, asset);
            if(oldWidget) {
                dojo.place(widget, oldWidget, "replace");
            }
        });
        dojo.connect(stage.content, "onRemove", function(id) {
            var node = dijit.byId("asset-" + id);
            if (node) {
                node.destroyRecursive();
            }
            dojo.destroy("asset-wrapper-" + id);
        });
        dojo.connect(stage.content, "onMove", function(id, position) {
            var assetWrapper = dojo.byId("asset-wrapper-" + id);
            if(!assetWrapper) {
                return;
            }
            dojo.byId("stage").removeChild(assetWrapper);
            var sibling = dojo.query("#stage > div");
            sibling = sibling[position];
            if(sibling) {
                dojo.place(assetWrapper, sibling, "before");
            } else {
                dojo.place(assetWrapper, "stage");
            }
        });
    },
    registerAsset: function (widget) {
        var stage = this;
        stage.client.register(widget);
        widget.user = stage.user;
        widget.stage = stage;
        dojo.connect(widget, "onMouseOver", function () {
            stage.menu.show(this.domNode);
        });
        dojo.connect(widget, "onMouseOut", function () {
            stage.menu.hide();
        });
    },
    newUserRegister: function (fromLoginForm, callback) {
        var stage = this;
        var widget = new scorll.stage.Register();
        var dialog = new scorll.asset.Dialog();
        widget.placeAt(dialog.containerNode);
        dialog.show();
        dojo.connect(widget, "onSubmit", function (email, password) {
            var params = {
                strategy: "email",
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
                strategy: "email",
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
