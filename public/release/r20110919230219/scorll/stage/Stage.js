/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["scorll.stage.Stage"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.stage.Stage"] = true;
dojo.provide("scorll.stage.Stage");

dojo.require("dojo.NodeList-traverse");

dojo.require("dijit.InlineEditBox");
dojo.require("dijit.form.Textarea");
dojo.require("dojo.fx");

dojo.require("scorll.util");
dojo.require("scorll.stage.Login");
dojo.require("scorll.stage.Register");
dojo.require("scorll.asset.AssetManager");
dojo.require("scorll.asset.AssetWrapper");
dojo.require("scorll.asset.Dialog");
dojo.require("scorll.asset.NewAssetForm");


dojo.declare("scorll.stage.Stage", null, {
  user: null,
  client: null,
  content: null,
  observer: null,
  stage: null,
  requireLogin: false,
  cutObject: null,
  copyObject: null,
  onClipboard: function () {},
  constructor: function ( /* Object */ args) {
    var stage = this;
    for (var k in args) {
      stage[k] = args[k];
    }
    // CLIENT
    var client = stage.client;
    client.connect();
    dojo.connect(client, "onConnect", function () {
      user.authNWithCookie(function (err) {
        err && console.error(err);
        if (stage.requireLogin && err) {
          console.error(err);
          stage.userLogin();
        }
        else {
          stage.content.load();
        }
      });
    });
    // USER
    var user = stage.user;
    user.client = client;
    dojo.connect(user, "onRolesChange", function () {
      contentTitleBox.disabled = !user.hasRole("teacher");
    });
    // CONTENT
    var content = stage.content;
    client.register(content);
    stage.observe();
    dojo.connect(content, "onTitleChange", function (title) {
      contentTitleBox.set("value", title);
      document.title = "Scorll - " + title;
    });
    // CONTENT TITLE
    var contentTitleBox = new dijit.InlineEditBox({
      editor: "dijit.form.Textarea",
      disabled: true
    }, "title");
    dojo.connect(contentTitleBox, "onChange", function (value) {
      content.setTitle(value);
      document.title = "Scorll - " + value;
    });
    // ASSET MANAGER
    var assetManager = stage.assetManager = new scorll.asset.AssetManager();
  },
  observe: function () {
    var stage = this;
    dojo.connect(stage.content, "onAdd", function (asset, position) {
      var sibling = null;
      if (position !== null && position !== undefined) {
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
      if (sibling) {
        dojo.place(assetWrapper.domNode, sibling, "before");
      }
      else {
        dojo.place(assetWrapper.domNode, "stage");
      }
      if(stage.content.loaded) {
        assetWrapper.domNode.style.display = "none";
        setTimeout(function() {
          dojo.fx.wipeIn({node: assetWrapper.domNode}).play();
        });
      }
      dojo.connect(assetWrapper, "onAdd", function () {
        var index = dojo.query("#stage").children().indexOf(assetWrapper.domNode);
        var form = new scorll.asset.NewAssetForm({
          stage: stage,
          position: index
        });
        form.placeAt(this.domNode, "before");
        dojo.connect(form, "onSubmit", function () {
          form.destroyRecursive();
        });
        dojo.connect(form, "onCancel", function () {
          dojo.fx.wipeOut({
            node: form.domNode,
            onEnd: function () {
              form.destroyRecursive();
            }
          }).play()
        });
      });
      dojo.connect(assetWrapper, "onCut", function () {
        stage.cutObject = this;
        stage.copyObject = null;
        stage.onClipboard();
      });
      dojo.connect(assetWrapper, "onCopy", function () {
        stage.copyObject = this;
        stage.cutObject = null;
        stage.onClipboard();
      });
      dojo.connect(assetWrapper, "onPaste", function () {
        var index = dojo.query("#stage").children().indexOf(assetWrapper.domNode);
        stage.paste(index);
      });
      stage.registerAsset(assetWrapper.widget);
    });
    dojo.connect(stage.content, "onUpdate", function (asset) {
      var assetWrapper = dijit.byId("asset-wrapper-" + asset.id);
      if (assetWrapper) {
        assetWrapper.updateAsset(asset);
      }
    });
    dojo.connect(stage.content, "onRemove", function (id) {
      var assetWrapper = dijit.byId("asset-wrapper-" + id);
      if (assetWrapper) {
        dojo.fx.wipeOut({node: assetWrapper.domNode, onEnd: function() {
          assetWrapper.destroyRecursive();
        }}).play();
      }
    });
    dojo.connect(stage.content, "onMove", function (id, position) {
      var assetWrapper = dijit.byId("asset-wrapper-" + id);
      if (!assetWrapper) {
        return;
      }
      var sibling = dojo.query("#stage > div");
      sibling = sibling[position];
      dojo.fx.wipeOut({node: assetWrapper.domNode, onEnd: function() {
        dojo.byId("stage").removeChild(assetWrapper.domNode);
        if (sibling) {
          dojo.place(assetWrapper.domNode, sibling, "before");
        }
        else {
          dojo.place(assetWrapper.domNode, "stage");
        }
        assetWrapper.domNode.style.display = "none";
        setTimeout(function() {
          dojo.fx.wipeIn({node: assetWrapper.domNode}).play();
        });
      }}).play();
    });
  },
  paste: function (position) {
    var stage = this;
    if (position === undefined) {
      var sibling = dojo.query("#stage > div");
      position = sibling.length;
    }
    if (stage.copyObject) {
      var item = dojo.clone(stage.copyObject.asset);
      item.id = undefined;
      stage.content.add(item, position);
    }
    else if (stage.cutObject) {
      var id = stage.cutObject.asset.id;
      stage.content.move(id, position);
    }
    stage.cutObject = null;
    stage.onClipboard();
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
          }
          else {
            callback && callback();
          }
        }
        else {
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
      stage.user.authN(params, function (err) {
        if (!err) {
          dialog.hide();
          if (stage.content.loaded == false) {
            stage.content.load(callback);
          }
          else {
            callback && callback();
          }
        }
        else {
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
