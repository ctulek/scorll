if(!dojo._hasResource["scorll.stage.Login"]){
dojo._hasResource["scorll.stage.Login"]=true;
dojo.provide("scorll.stage.Login");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.TextBox");
dojo.require("dojox.layout.TableContainer");

dojo.declare("scorll.stage.Login",[dijit._Widget, dijit._Templated],{
	widgetsInTemplate: true,
    templatePath: dojo.moduleUrl("scorll.stage","Login.html"),
    postCreate: function() {
    },
    onSubmit: function(item) {
    },
    onCancel: function() {
    },
    onRegister: function() {
    },
    submit: function() {
        var username = this.username.attr('value').trim();
        var password = this.password.attr('value').trim();
        this.onSubmit(username, password);
    },
    cancel: function() {
        this.onCancel();
    },
    register: function() {
        this.onRegister();
    },
    showError: function(err) {
        console.error(err);
    }
});
}
