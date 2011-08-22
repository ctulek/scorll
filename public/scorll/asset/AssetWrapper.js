dojo.provide("scorll.asset.AssetWrapper");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit._Templated");
dojo.require("dojox.fx.scroll");
dojo.require("dojo.fx.easing");
dojo.require("dojo.window");

dojo.require("scorll.asset.AssetMenu");
dojo.require("scorll.stage.Login");
dojo.require("scorll.stage.Register");
dojo.require("scorll.asset.TrackingStats");

dojo.declare("scorll.asset.AssetWrapper", [
  dijit._Widget, dijit._Templated
  ], {
  widgetsInTemplate: true,
  templatePath: dojo.moduleUrl("scorll.asset", "AssetWrapper.html"),
  menu: null,
  stage: null,
  assetManager: null,
  asset: null,
  widget: null,
  onAdd: function () {},
  onCut: function () {},
  onCopy: function () {},
  onPaste: function () {},
  postCreate: function () {
    var wrapper = this;
    this.menu = new scorll.asset.AssetMenu();
    this.menu.hide(true);
    dojo.place(this.menu.domNode, this.domNode);
    if (this.asset) {
      this.createWidget(this.asset);
    }
    this.registerClipboardEvents();
    this.registerMenuEvents();
    dojo.connect(this.stage.user, "onRolesChange", function() {
      var disabled = !wrapper.stage.user.hasRole("teacher");
      wrapper.menu.disable(disabled);
    });
    var disabled = !wrapper.stage.user.hasRole("teacher");
    wrapper.menu.disable(disabled);
  },
  createWidget: function (asset) {
    var wrapper = this;
    var menu = wrapper.menu;
    var widget = wrapper.widget
      = wrapper.assetManager.getAssetRenderer(wrapper.stage, asset);
    wrapper.stage.registerAsset(widget);
    menu.widget = widget;
    dojo.connect(widget, "onMouseOver", function () {
      if (!wrapper.stage.user.hasRole("teacher")) {
        return;
      }
      menu && menu.show(wrapper.domNode);
      wrapper.domNode.style['border-left'] = "4px solid #def";
      wrapper.domNode.style['margin-left'] = "8px";
    });
    dojo.connect(widget, "onMouseOut", function () {
      menu && menu.hide();
      wrapper.domNode.style['border-left'] = "";
      wrapper.domNode.style['margin-left'] = "12px";
    });
    dojo.connect(widget, "onLoginRequired", function (callback) {
      wrapper.showLogin(callback);
    });
    var anchor = widget.item.id.substr(0,4) + widget.item.id.substr(-4);
    dojo.place('<a name="' + anchor + '"></a>', wrapper.domNode);
    widget && dojo.place(widget.domNode, wrapper.domNode);
  },
  updateAsset: function (asset) {
    this.asset = asset;
    this.widget && this.widget.destroyRecursive();
    this.createWidget(this.asset);
  },
  registerClipboardEvents: function () {
    var wrapper = this;
    var stage = this.stage;
    dojo.connect(stage, "onClipboard", function () {
      if (stage.cutObject == wrapper) {
        wrapper.widget.domNode.style['opacity'] = .3;
        wrapper.menu.pasteButton.domNode.style['display'] = "none";
      }
      else {
        wrapper.widget.domNode.style['opacity'] = null;
        if (stage.cutObject || stage.copyObject) {
          wrapper.menu.pasteButton.domNode.style['display'] = "inline-block";
        }
        else {
          wrapper.menu.pasteButton.domNode.style['display'] = "none";
        }
      }
    });
    if (stage.cutObject || stage.copyObject) {
      wrapper.menu.pasteButton.domNode.style['display'] = "inline-block";
    }
    else {
      wrapper.menu.pasteButton.domNode.style['display'] = "none";
    }
  },
  registerMenuEvents: function () {
    var wrapper = this;
    var menu = this.menu;
    var stage = this.stage;
    var assetManager = this.assetManager;
    dojo.connect(menu, "onAdd", function () {
      if (!wrapper.stage.user.hasRole("teacher")) {
        return;
      }
      wrapper.onAdd();
    });
    dojo.connect(menu, "onEdit", function () {
      if (!wrapper.stage.user.hasRole("teacher")) {
        return;
      }
      // Use the current widget
      var widget = wrapper.widget;
      menu.domNode.style.display = "none";
      widget.domNode.style.display = "none";
      var form = assetManager.getAssetForm(widget.item);
      if (!form) {
        return;
      }
      var container = new dijit.TitlePane({
        title: "Edit Asset",
        toggleable: false
      });
      container.domNode.style["margin-top"] = 20;
      dojo.destroy(container.arrowNode);
      form.placeAt(container.containerNode);
      container.placeAt(widget.domNode, "before");
      dojo.connect(form, "onSubmit", function (item) {
        container.destroyRecursive();
        stage.content.update(item);
        menu.domNode.style.display = "block";
      });
      dojo.connect(form, "onCancel", function () {
        container.destroyRecursive();
        widget.domNode.style.display = "block";
        menu.domNode.style.display = "block";
      });
      setTimeout(function() {
        var windowH = dojo.window.getBox().h;
        var wrapperY = dojo.position(container.domNode).y;
        var wrapperH = dojo.position(container.domNode).h + 10;
        var notInView = wrapperY < 0 || (wrapperY + wrapperH) > windowH;
        if(wrapperH < windowH && notInView) {
          var offsetY = 0;
          if(wrapperY > 0) {
            offsetY = windowH - wrapperH;
          } else {
            offsetY += 30;
          }
          dojox.fx.smoothScroll({win: window, node: wrapper.domNode, easing:
           dojo.fx.easing.quintIn, duration: 300, offset:{y: -offsetY}}).play();
        }
      }, 1);
    });
    dojo.connect(menu, "onDelete", function () {
      if (!wrapper.stage.user.hasRole("teacher")) {
        return;
      }
      var widget = wrapper.widget;
      menu.hide(true);
      stage.content.remove(widget.item);
    });
    dojo.connect(menu, "onCut", function () {
      if (!wrapper.stage.user.hasRole("teacher")) {
        return;
      }
      wrapper.onCut();
    });
    dojo.connect(menu, "onCopy", function () {
      if (!wrapper.stage.user.hasRole("teacher")) {
        return;
      }
      wrapper.onCopy();
    });
    dojo.connect(menu, "onPaste", function () {
      if (!wrapper.stage.user.hasRole("teacher")) {
        return;
      }
      wrapper.onPaste();
    });
    dojo.connect(menu, "onShowStats", function () {
      if (!wrapper.stage.user.hasRole("teacher")) {
        return;
      }
      var widget = wrapper.widget;
      menu.domNode.style.display = "none";
      widget.domNode.style.display = "none";
      var form = new scorll.asset.TrackingStats();
      var container = new dijit.TitlePane({
        title: "Stats",
        toggleable: false
      });
      dojo.destroy(container.arrowNode);
      form.placeAt(container.containerNode);
      container.placeAt(widget.domNode, "before");
      dojo.connect(form, "onClose", function () {
        container.destroyRecursive();
        wrapper.widget.statsForm = null;
        widget.domNode.style.display = "block";
        menu.domNode.style.display = "block";
      });

      // Data part
      var data = new dojo.data.ObjectStore({
        objectStore: wrapper.widget.userTrackingData
      });
      form.resultsGrid.setStore(data);
      wrapper.widget.statsForm = form;
      wrapper.widget.getAllTrackingResults();
    });
  },
  showLogin: function (callback) {
    var wrapper = this;
    var stage = this.stage;
    var login = new scorll.stage.Login();
    var widget = this.widget;
    var height = dojo.position(this.domNode).h;
    this.domNode.style['min-height'] = height;
    widget.domNode.style.display = "none";
    var container = new dijit.TitlePane({
      title: "Login",
      toggleable: false,
      height: height
    });
    dojo.destroy(container.arrowNode);
    login.placeAt(container.containerNode);
    container.placeAt(this.domNode);
    container.domNode.style.width = "380px";
    container.domNode.style.margin = "20px auto 0px";
    dojo.connect(login, "onSubmit", function (username, password) {
      var params = {
        strategy: "user",
        username: username,
        password: password,
        rememberme: true
      }
      // TODO: Move this call to Login Form
      stage.user.authN(params, function (err) {
        if (err) {
          login.showError(err);
        }
        else {
          container.destroyRecursive();
          wrapper.domNode.style['min-height'] = null;
          widget.domNode.style.display = "block";
          callback && callback();
        }
      });
    });
    dojo.connect(login, "onCancel", function () {
      container.destroyRecursive();
      wrapper.domNode.style['min-height'] = null;
      widget.domNode.style.display = "block";
      callback && callback("User cancelled");
    });
    dojo.connect(login, "onRegister", function () {
      container.destroyRecursive();
      wrapper.domNode.style['min-height'] = null;
      widget.domNode.style.display = "block";
      wrapper.showRegistration(true, callback);
    });
  },
  showRegistration: function (fromLoginForm, callback) {
    var wrapper = this;
    var widget = this.widget;
    var stage = this.stage;
    var height = dojo.position(this.domNode).h;
    this.domNode.style['min-height'] = height;
    widget.domNode.style.display = "none";
    var register = new scorll.stage.Register();
    var container = new dijit.TitlePane({
      title: "New User Registration",
      toggleable: false,
      height: height
    });
    dojo.destroy(container.arrowNode);
    register.placeAt(container.containerNode);
    container.placeAt(wrapper.domNode);
    container.domNode.style.width = "380px";
    container.domNode.style.margin = "20px auto 0px";
    dojo.connect(register, "onSubmit", function (username, email, password) {
      var params = {
        strategy: "user",
        username: username,
        email: email,
        password: password
      }
      // TODO: Move this call to Registration Form
      stage.user.register(params, function (err) {
        if (err) {
          register.showError(err);
        }
        else {
          container.destroyRecursive();
          wrapper.domNode.style['min-height'] = null;
          widget.domNode.style.display = "block";
          callback && callback();
        }
      });
    });
    dojo.connect(register, "onCancel", function () {
      container.destroyRecursive();
      wrapper.domNode.style['min-height'] = null;
      widget.domNode.style.display = "block";
      if (fromLoginForm) {
        wrapper.showLogin(callback);
      }
    });
  },
});
