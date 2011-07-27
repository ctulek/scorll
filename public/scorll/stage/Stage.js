dojo.provide("scorll.stage.Stage");

dojo.require("dojo.NodeList-traverse");

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
    cutObject: null,
    copyObject: null,
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
    },
    observe: function () {
        var stage = this;
        dojo.connect(stage.content, "onAdd", function(asset, position) {
            var sibling = null;
            if(position !== null && position !== undefined) {
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
            if(sibling) {
              dojo.place(assetWrapper.domNode, sibling, "before");
            } else {
              dojo.place(assetWrapper.domNode, "stage");
            }
            dojo.connect(assetWrapper, "onAdd", function() {
              var index = dojo.query("#stage").children()
                  .indexOf(assetWrapper.domNode);
              var form = new scorll.asset.NewAssetForm(
                {stage: stage, position: index});
              form.placeAt(this.domNode, "before");
              dojo.connect(form, "onSubmit", function() {
                form.destroyRecursive();
              });
              dojo.connect(form, "onCancel", function() {
                form.destroyRecursive();
              });
            });
            dojo.connect(assetWrapper, "onCut", function() {
              stage.cutObject = this;
              stage.copyObject = null;
            });
            dojo.connect(assetWrapper, "onCopy", function() {
              stage.copyObject = this;
              stage.cutObject = null;
            });
            dojo.connect(assetWrapper, "onPaste", function() {
              var index = dojo.query("#stage").children()
                  .indexOf(assetWrapper.domNode);
              stage.paste(index);
            });
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
            var sibling = dojo.query("#stage > div");
            sibling = sibling[position];
            dojo.byId("stage").removeChild(assetWrapper.domNode);
            if(sibling) {
                dojo.place(assetWrapper.domNode, sibling, "before");
            } else {
                dojo.place(assetWrapper.domNode, "stage");
            }
        });
    },
    paste: function (position) {
      var stage = this;
      if(position === undefined) {
        var sibling = dojo.query("#stage > div");
        position = sibling.length;
      }
      if(stage.copyObject) {
        var item = dojo.clone(stage.copyObject.asset);
        item.id = undefined;
        stage.content.add(item, position);
      } else if(stage.cutObject) {
        var id = stage.cutObject.asset.id;
        stage.content.move(id, position);
      }
      stage.cutObject = null;
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
