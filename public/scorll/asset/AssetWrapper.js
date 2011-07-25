dojo.provide("scorll.asset.AssetWrapper");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.TitlePane");

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
    postCreate: function () {
        var wrapper = this;
        this.menu = new scorll.asset.AssetMenu();
        this.menu.hide(true);
        dojo.place(this.menu.domNode, this.domNode);
        if(this.asset) {
            this.createWidget(this.asset);
        }
        this.registerEvents();
    },
    createWidget: function (asset) {
        var wrapper = this;
        var menu = this.menu;
        var widget = this.widget =
            this.assetManager.getAssetRenderer(this.stage, this.asset);
        this.stage.registerAsset(widget);
        menu.widget = widget;
        dojo.connect(widget, "onMouseOver", function () {
            menu && menu.show(wrapper.domNode);
        });
        dojo.connect(widget, "onMouseOut", function () {
            menu && menu.hide();
        });
        dojo.connect(widget, "onRequireLogin", function () {
            wrapper.showLogin();
        });
        widget && dojo.place(widget.domNode, this.domNode);
    },
    updateAsset: function (asset) {
        this.asset = asset;
        this.widget && this.widget.destroyRecursive();
        this.createWidget(this.asset);
    },
    registerEvents: function() {
        var wrapper = this;
        var menu = this.menu;
        var stage = this.stage;
        var assetManager = this.assetManager;
        dojo.connect(menu, "onEdit", function () {
            // Use the current widget
            var widget = wrapper.widget;
            menu.hide(true);
            widget.domNode.style.display = "none";
            var form = assetManager.getAssetForm(widget.item);
            if (!form) {
                return;
            }
            var container = new dijit.TitlePane({title: "Edit Asset", toggleable: false});
            dojo.destroy(container.arrowNode);
            form.placeAt(container.containerNode);
            container.placeAt(widget.domNode, "before");
            dojo.connect(form, "onSubmit", function (item) {
                container.destroyRecursive();
                stage.content.update(item);
            });
            dojo.connect(form, "onCancel", function () {
                container.destroyRecursive();
                widget.domNode.style.display = "block";
            });
        });
        dojo.connect(menu, "onDelete", function () {
            var widget = wrapper.widget;
            menu.hide(true);
            stage.content.remove(widget.item);
        });
        dojo.connect(menu, "onShowStats", function () {
            var widget = wrapper.widget;
            widget.domNode.style.display = "none";
            var form = new scorll.asset.TrackingStats();
            var container = new dijit.TitlePane({title: "Stats", toggleable: false});
            dojo.destroy(container.arrowNode);
            form.placeAt(container.containerNode);
            container.placeAt(widget.domNode, "before");
            dojo.connect(form, "onClose", function() {
                container.destroyRecursive();
                wrapper.asset.statsForm = null;
                widget.domNode.style.display = "block";
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
    showLogin: function() {
        var wrapper = this;
        var stage = this.stage;
        var login = new scorll.stage.Login();
        var widget = this.widget;
        var height = dojo.position(this.domNode).h;
        this.domNode.style['min-height'] = height;
        widget.domNode.style.display = "none";
        var container = new dijit.TitlePane({title: "Login",
            toggleable: false, height: height});
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
            stage.user.auth(params, function (err) {
                if (!err) {
                    container.destroyRecursive();
                    wrapper.domNode.style['min-height'] = null;
                    widget.domNode.style.display = "block";
                } else {
                    login.showError(err);
                }
            });
        });
        dojo.connect(login, "onCancel", function () {
            container.destroyRecursive();
            wrapper.domNode.style['min-height'] = null;
            widget.domNode.style.display = "block";
        });
        dojo.connect(login, "onRegister", function () {
            container.destroyRecursive();
            wrapper.domNode.style['min-height'] = null;
            widget.domNode.style.display = "block";
            wrapper.showRegistration(true);
        });
    },
    showRegistration: function (fromLoginForm) {
        var wrapper = this;
        var widget = this.widget;
        var stage = this.stage;
        var height = dojo.position(this.domNode).h;
        this.domNode.style['min-height'] = height;
        widget.domNode.style.display = "none";
        var register = new scorll.stage.Register();
        var container = new dijit.TitlePane({title: "New User Registration",
            toggleable: false, height: height});
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
                if (!err) {
                    container.destroyRecursive();
                    wrapper.domNode.style['min-height'] = null;
                    widget.domNode.style.display = "block";
                } else {
                    register.showError(err);
                }
            });
        });
        dojo.connect(register, "onCancel", function () {
            container.destroyRecursive();
            wrapper.domNode.style['min-height'] = null;
            widget.domNode.style.display = "block";
            if (fromLoginForm) {
                wrapper.showLogin();
            }
        });
    },
});
