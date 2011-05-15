/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["scorll.stage.Menu"]){
dojo._hasResource["scorll.stage.Menu"]=true;
dojo.provide("scorll.stage.Menu");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dojo.fx.Toggler");

dojo.declare("scorll.stage.Menu",[dijit._Widget, dijit._Templated],{
	widgetsInTemplate: true,
	templateString:"<div style=\"position: absolute;opacity: 0;\">\n\t<div type=\"button\" dojoType=\"dijit.form.Button\" dojoAttachEvent=\"onClick:edit\">Edit</div>\n\t<div dojoType=\"dijit.form.Button\" dojoAttachEvent=\"onClick:_delete\">Delete</div>\n</div>\n",
	widget: null,
	_toggler: null,
	_timeout: null,
	postCreate: function() {
		this._toggler = new dojo.fx.Toggler({node: this.domNode});
		this._toggler.hideDuration = 100;
		dojo.connect(this,"onMouseOver", function() {
			clearTimeout(this._timeout);
		});
		dojo.connect(this,"onMouseOut", function() {
			this.hide();
		});
	},
	onEdit: function(widget) {
	},
	onDelete: function(widget) {
	},
	edit: function() {
		this.onEdit(this.widget);
	},
	_delete: function() {
		this.onDelete(this.widget);
	},
	show: function(node) {
		clearTimeout(this._timeout);
		this.widget = dijit.byNode(node);
		var position = dojo.position(node, {includeScroll: true});
		this.domNode.style.left = position.x + position.w;
		this.domNode.style.top = position.y;
		this._toggler.show();
	},
	hide: function(immediately) {
		var toggler = this._toggler;
		if(immediately) {
			toggler.hide();
		} else {
			this._timeout = setTimeout(function() {
				toggler.hide();
			}, 300);
		}
	}
});
}