/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

/*
	This is an optimized version of Dojo, built for deployment and not for
	development. To get sources and documentation, please visit:

		http://dojotoolkit.org
*/

if(!dojo._hasResource["scorll.net.ClientComponent"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.net.ClientComponent"] = true;
dojo.provide("scorll.net.ClientComponent");
dojo.declare("scorll.net.ClientComponent", null, {
    client: null,
    getComponentType: function () {
        throw new Error("Unimplemented function");
    },
    getComponentId: function () {
        throw new Error("Unimplemented function");
    }
});

}

if(!dojo._hasResource["scorll.content.Content"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.content.Content"] = true;
dojo.provide("scorll.content.Content");



dojo.declare("scorll.content.Content", [
    scorll.net.ClientComponent
    ], {
    id: null,
    title: null,
    client: null,
    loaded: false,
    constructor: function( /* Object */ args) {
        var content = this;
        for (var k in args) {
            content[k] = args[k];
        }
    },
    getComponentType: function() {
        return "content";
    },
    getComponentId: function() {
        return this.id;
    },
    onLoad: function() {},
    load: function(callback) {
        var content = this;
        content.client.call(this, "load", function(err, data) {
            if (err) {
                console.error(err);
                callback && callback(err);
                return;
            }
            content._setTitle(data.title);
            if (data.assets) {
                for (var i in data.assets) {
                    var asset = data.assets[i];
                    if (asset) {
                        content._add(asset);
                    }
                }
            }
            content.loaded = true;
            content.onLoad();
            callback && callback();
        });
    },
    add: function(asset) {
        this.client.call(this, "addAsset", asset, null);
    },
    _add: function(asset, position) {
        this.onAdd(asset, position);
    },
    onAdd: function(asset, position) {
    },
    setTitle: function(value) {
        this.client.call(this, "setTitle", value);
    },
    _setTitle: function(value) {
        this.title = value;
        this.onTitleChange(value);
    },
    onTitleChange: function(value) {
    },
    update: function(asset) {
        this.client.call(this, "updateAsset", asset);
    },
    _update: function(asset) {
        this.onUpdate(asset);
    },
    onUpdate: function(asset) {
    },
    remove: function(asset) {
        this.client.call(this, "deleteAsset", asset.id);
    },
    _remove: function(id) {
        this.onRemove(id);
    },
    onRemove: function(id) {
    },
    move: function(id, position) {
        this.client.call(this, "moveAsset", id, position);
    },
    _move: function(id, position) {
        this.onMove(id, position);
    },
    onMove: function(id, position) {
    }
});

}

if(!dojo._hasResource["scorll.net.Client"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.net.Client"] = true;
dojo.provide("scorll.net.Client");
dojo.declare("scorll.net.Client", null, {
    socket: null,
    connected: false,
    groupId: null,
    _callbacks: {},
    _components: {},
    _callbackIdCounter: 2,
    onConnect: function () {},
    constructor: function ( /* Object */ args) {
        for(var i in args) {
            this[i] = args[i];
        }
        var client = this;
        if (io.Socket) {
            client.socket = new io.Socket();
            client.socket.on('connect', function () {
                console.log("Connected to server");
                client.connected = true;
                client.call(null, 'join', client.groupId, function(err) {
                    if(err) {
                        console.error(err);
                        return;
                    }
                    client.onConnect();
                });
            });
            client.socket.on('disconnect', function () {
                client.connected = false;
                console.log("Disconnected from server");
            });
            client.socket.on('message', function (message) {
                client._message(message);
            });
        }
    },
    connect: function () {
        if (!this.connected && this.socket) {
            this.socket.connect();
        }
    },
    register: function ( /* scorll.net.ClientComponent */ component) {
        this._components[component.getComponentId()] = component;
        component.client = this;
    },
    _message: function ( /* Object */ message) {
        var client = this;
        if (message.componentId) {
            var callbackId = message.callbackId;
            var callback = function (err) {
                    if (callbackId) {
                        var message = {};
                        message.callbackId = callbackId;
                        message.params = Array.prototype.slice.call(arguments);
                        client.socket.send(message);
                    }
                }
            var component = client._components[message.componentId];
            if (component) {
                var params = message.params || [];
                params.push(callback);
                var method = component[message.method] || null;
                method && method.apply(component, message.params);
            } else {
                console.error("Undefined component id");
            }
        } else if (message.callbackId) {
            var callback = client._callbacks[message.callbackId];
            if (callback) {
                callback.apply(null, message.params);
                delete client._callbacks[message.callbackId];
            } else {
                console.error("Undefined callback id");
            }
        } else {
            console.error("Invalid message:", message);
        }
    },
    call: function ( /* scorll.net.ClientComponent */ component, /* String */ method) {
        var client = this;
        var args = Array.prototype.slice.call(arguments);
        var params = args.slice(2);
        var callback = params.pop();
        if (typeof callback != "function") {
            params.push(callback);
            callback = null;
        }
        var message = {};
        message.componentId = component && component.getComponentId();
        message.method = method;
        message.params = params;
        if (client.connected && client.socket) {
            if (callback) {
                var callbackId = client._callbackIdCounter++;
                client._callbacks[callbackId] = callback;
                message.callbackId = callbackId;
            }
            client.socket.send(message);
        } else {
            console.error("Client is not connected");
        }
    }
});

}

if(!dojo._hasResource["dojo.regexp"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojo.regexp"] = true;
dojo.provide("dojo.regexp");

dojo.getObject("regexp", true, dojo);

/*=====
dojo.regexp = {
	// summary: Regular expressions and Builder resources
};
=====*/

dojo.regexp.escapeString = function(/*String*/str, /*String?*/except){
	//	summary:
	//		Adds escape sequences for special characters in regular expressions
	// except:
	//		a String with special characters to be left unescaped

	return str.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, function(ch){
		if(except && except.indexOf(ch) != -1){
			return ch;
		}
		return "\\" + ch;
	}); // String
};

dojo.regexp.buildGroupRE = function(/*Object|Array*/arr, /*Function*/re, /*Boolean?*/nonCapture){
	//	summary:
	//		Builds a regular expression that groups subexpressions
	//	description:
	//		A utility function used by some of the RE generators. The
	//		subexpressions are constructed by the function, re, in the second
	//		parameter.  re builds one subexpression for each elem in the array
	//		a, in the first parameter. Returns a string for a regular
	//		expression that groups all the subexpressions.
	// arr:
	//		A single value or an array of values.
	// re:
	//		A function. Takes one parameter and converts it to a regular
	//		expression.
	// nonCapture:
	//		If true, uses non-capturing match, otherwise matches are retained
	//		by regular expression. Defaults to false

	// case 1: a is a single value.
	if(!(arr instanceof Array)){
		return re(arr); // String
	}

	// case 2: a is an array
	var b = [];
	for(var i = 0; i < arr.length; i++){
		// convert each elem to a RE
		b.push(re(arr[i]));
	}

	 // join the REs as alternatives in a RE group.
	return dojo.regexp.group(b.join("|"), nonCapture); // String
};

dojo.regexp.group = function(/*String*/expression, /*Boolean?*/nonCapture){
	// summary:
	//		adds group match to expression
	// nonCapture:
	//		If true, uses non-capturing match, otherwise matches are retained
	//		by regular expression.
	return "(" + (nonCapture ? "?:":"") + expression + ")"; // String
};

}

if(!dojo._hasResource["dojo.cookie"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojo.cookie"] = true;
dojo.provide("dojo.cookie");



/*=====
dojo.__cookieProps = function(){
	//	expires: Date|String|Number?
	//		If a number, the number of days from today at which the cookie
	//		will expire. If a date, the date past which the cookie will expire.
	//		If expires is in the past, the cookie will be deleted.
	//		If expires is omitted or is 0, the cookie will expire when the browser closes. << FIXME: 0 seems to disappear right away? FF3.
	//	path: String?
	//		The path to use for the cookie.
	//	domain: String?
	//		The domain to use for the cookie.
	//	secure: Boolean?
	//		Whether to only send the cookie on secure connections
	this.expires = expires;
	this.path = path;
	this.domain = domain;
	this.secure = secure;
}
=====*/


dojo.cookie = function(/*String*/name, /*String?*/value, /*dojo.__cookieProps?*/props){
	//	summary:
	//		Get or set a cookie.
	//	description:
	// 		If one argument is passed, returns the value of the cookie
	// 		For two or more arguments, acts as a setter.
	//	name:
	//		Name of the cookie
	//	value:
	//		Value for the cookie
	//	props:
	//		Properties for the cookie
	//	example:
	//		set a cookie with the JSON-serialized contents of an object which
	//		will expire 5 days from now:
	//	|	dojo.cookie("configObj", dojo.toJson(config), { expires: 5 });
	//
	//	example:
	//		de-serialize a cookie back into a JavaScript object:
	//	|	var config = dojo.fromJson(dojo.cookie("configObj"));
	//
	//	example:
	//		delete a cookie:
	//	|	dojo.cookie("configObj", null, {expires: -1});
	var c = document.cookie;
	if(arguments.length == 1){
		var matches = c.match(new RegExp("(?:^|; )" + dojo.regexp.escapeString(name) + "=([^;]*)"));
		return matches ? decodeURIComponent(matches[1]) : undefined; // String or undefined
	}else{
		props = props || {};
// FIXME: expires=0 seems to disappear right away, not on close? (FF3)  Change docs?
		var exp = props.expires;
		if(typeof exp == "number"){
			var d = new Date();
			d.setTime(d.getTime() + exp*24*60*60*1000);
			exp = props.expires = d;
		}
		if(exp && exp.toUTCString){ props.expires = exp.toUTCString(); }

		value = encodeURIComponent(value);
		var updatedCookie = name + "=" + value, propName;
		for(propName in props){
			updatedCookie += "; " + propName;
			var propValue = props[propName];
			if(propValue !== true){ updatedCookie += "=" + propValue; }
		}
		document.cookie = updatedCookie;
	}
};

dojo.cookie.isSupported = function(){
	//	summary:
	//		Use to determine if the current browser supports cookies or not.
	//
	//		Returns true if user allows cookies.
	//		Returns false if user doesn't allow cookies.

	if(!("cookieEnabled" in navigator)){
		this("__djCookieTest__", "CookiesAllowed");
		navigator.cookieEnabled = this("__djCookieTest__") == "CookiesAllowed";
		if(navigator.cookieEnabled){
			this("__djCookieTest__", "", {expires: -1});
		}
	}
	return navigator.cookieEnabled;
};

}

if(!dojo._hasResource["scorll.net.User"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.net.User"] = true;
dojo.provide("scorll.net.User");





dojo.declare("scorll.net.User", null, {
    authenticated: false,
    profile: {},
    roles: [],
    auth: function (params, callback) {
        var userComponent = this;
        userComponent.client.call(null, "authN", params, function (err, user) {
            if (!err) {
                userComponent.id = user.id;
                userComponent.authenticated = true;
                if (user.cookie) {
                    var expiresAt = params.rememberme ? user.cookieExpiresAt : null;
                    dojo.cookie("scorll.user.cookie", user.cookie, {
                        expires: expiresAt
                    });
                }
            } else {
                dojo.cookie("scorll.user.cookie", null, {
                    expires: -1
                });
            }
            callback(err);
        });
    },
    register: function (params, callback) {
        var userComponent = this;
        userComponent.client.call(null, "register", params, function (err, user) {
            if (!err) {
                userComponent.authenticated = true;
                if (user.cookie) {
                    var expiresAt = params.rememberme ? user.cookieExpiresAt : null;
                    dojo.cookie("scorll.user.cookie", user.cookie, {
                        expires: expiresAt
                    });
                }
            }
            callback(err);
        });
    },
    authCookie: function (callback) {
        var cookie = dojo.cookie("scorll.user.cookie");
        if (cookie) {
            var params = {
                strategy: "cookie",
                cookie: cookie
            };
            this.auth(params, callback);
        } else {
            callback("No cookie defined");
        }
    },
    hasRole: function (role) {
        return this.roles.indexOf(role) > -1;
    }
});

}

if(!dojo._hasResource["dojo.dnd.common"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojo.dnd.common"] = true;
dojo.provide("dojo.dnd.common");

dojo.getObject("dnd", true, dojo);

dojo.dnd.getCopyKeyState = dojo.isCopyKey;

dojo.dnd._uniqueId = 0;
dojo.dnd.getUniqueId = function(){
	// summary:
	//		returns a unique string for use with any DOM element
	var id;
	do{
		id = dojo._scopeName + "Unique" + (++dojo.dnd._uniqueId);
	}while(dojo.byId(id));
	return id;
};

dojo.dnd._empty = {};

dojo.dnd.isFormElement = function(/*Event*/ e){
	// summary:
	//		returns true if user clicked on a form element
	var t = e.target;
	if(t.nodeType == 3 /*TEXT_NODE*/){
		t = t.parentNode;
	}
	return " button textarea input select option ".indexOf(" " + t.tagName.toLowerCase() + " ") >= 0;	// Boolean
};

}

if(!dojo._hasResource["dojo.date.stamp"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojo.date.stamp"] = true;
dojo.provide("dojo.date.stamp");

dojo.getObject("date.stamp", true, dojo);

// Methods to convert dates to or from a wire (string) format using well-known conventions

dojo.date.stamp.fromISOString = function(/*String*/formattedString, /*Number?*/defaultTime){
	//	summary:
	//		Returns a Date object given a string formatted according to a subset of the ISO-8601 standard.
	//
	//	description:
	//		Accepts a string formatted according to a profile of ISO8601 as defined by
	//		[RFC3339](http://www.ietf.org/rfc/rfc3339.txt), except that partial input is allowed.
	//		Can also process dates as specified [by the W3C](http://www.w3.org/TR/NOTE-datetime)
	//		The following combinations are valid:
	//
	//			* dates only
	//			|	* yyyy
	//			|	* yyyy-MM
	//			|	* yyyy-MM-dd
	// 			* times only, with an optional time zone appended
	//			|	* THH:mm
	//			|	* THH:mm:ss
	//			|	* THH:mm:ss.SSS
	// 			* and "datetimes" which could be any combination of the above
	//
	//		timezones may be specified as Z (for UTC) or +/- followed by a time expression HH:mm
	//		Assumes the local time zone if not specified.  Does not validate.  Improperly formatted
	//		input may return null.  Arguments which are out of bounds will be handled
	// 		by the Date constructor (e.g. January 32nd typically gets resolved to February 1st)
	//		Only years between 100 and 9999 are supported.
	//
  	//	formattedString:
	//		A string such as 2005-06-30T08:05:00-07:00 or 2005-06-30 or T08:05:00
	//
	//	defaultTime:
	//		Used for defaults for fields omitted in the formattedString.
	//		Uses 1970-01-01T00:00:00.0Z by default.

	if(!dojo.date.stamp._isoRegExp){
		dojo.date.stamp._isoRegExp =
//TODO: could be more restrictive and check for 00-59, etc.
			/^(?:(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(.\d+)?)?((?:[+-](\d{2}):(\d{2}))|Z)?)?$/;
	}

	var match = dojo.date.stamp._isoRegExp.exec(formattedString),
		result = null;

	if(match){
		match.shift();
		if(match[1]){match[1]--;} // Javascript Date months are 0-based
		if(match[6]){match[6] *= 1000;} // Javascript Date expects fractional seconds as milliseconds

		if(defaultTime){
			// mix in defaultTime.  Relatively expensive, so use || operators for the fast path of defaultTime === 0
			defaultTime = new Date(defaultTime);
			dojo.forEach(dojo.map(["FullYear", "Month", "Date", "Hours", "Minutes", "Seconds", "Milliseconds"], function(prop){
				return defaultTime["get" + prop]();
			}), function(value, index){
				match[index] = match[index] || value;
			});
		}
		result = new Date(match[0]||1970, match[1]||0, match[2]||1, match[3]||0, match[4]||0, match[5]||0, match[6]||0); //TODO: UTC defaults
		if(match[0] < 100){
			result.setFullYear(match[0] || 1970);
		}

		var offset = 0,
			zoneSign = match[7] && match[7].charAt(0);
		if(zoneSign != 'Z'){
			offset = ((match[8] || 0) * 60) + (Number(match[9]) || 0);
			if(zoneSign != '-'){ offset *= -1; }
		}
		if(zoneSign){
			offset -= result.getTimezoneOffset();
		}
		if(offset){
			result.setTime(result.getTime() + offset * 60000);
		}
	}

	return result; // Date or null
};

/*=====
	dojo.date.stamp.__Options = function(){
		//	selector: String
		//		"date" or "time" for partial formatting of the Date object.
		//		Both date and time will be formatted by default.
		//	zulu: Boolean
		//		if true, UTC/GMT is used for a timezone
		//	milliseconds: Boolean
		//		if true, output milliseconds
		this.selector = selector;
		this.zulu = zulu;
		this.milliseconds = milliseconds;
	}
=====*/

dojo.date.stamp.toISOString = function(/*Date*/dateObject, /*dojo.date.stamp.__Options?*/options){
	//	summary:
	//		Format a Date object as a string according a subset of the ISO-8601 standard
	//
	//	description:
	//		When options.selector is omitted, output follows [RFC3339](http://www.ietf.org/rfc/rfc3339.txt)
	//		The local time zone is included as an offset from GMT, except when selector=='time' (time without a date)
	//		Does not check bounds.  Only years between 100 and 9999 are supported.
	//
	//	dateObject:
	//		A Date object

	var _ = function(n){ return (n < 10) ? "0" + n : n; };
	options = options || {};
	var formattedDate = [],
		getter = options.zulu ? "getUTC" : "get",
		date = "";
	if(options.selector != "time"){
		var year = dateObject[getter+"FullYear"]();
		date = ["0000".substr((year+"").length)+year, _(dateObject[getter+"Month"]()+1), _(dateObject[getter+"Date"]())].join('-');
	}
	formattedDate.push(date);
	if(options.selector != "date"){
		var time = [_(dateObject[getter+"Hours"]()), _(dateObject[getter+"Minutes"]()), _(dateObject[getter+"Seconds"]())].join(':');
		var millis = dateObject[getter+"Milliseconds"]();
		if(options.milliseconds){
			time += "."+ (millis < 100 ? "0" : "") + _(millis);
		}
		if(options.zulu){
			time += "Z";
		}else if(options.selector != "time"){
			var timezoneOffset = dateObject.getTimezoneOffset();
			var absOffset = Math.abs(timezoneOffset);
			time += (timezoneOffset > 0 ? "-" : "+") +
				_(Math.floor(absOffset/60)) + ":" + _(absOffset%60);
		}
		formattedDate.push(time);
	}
	return formattedDate.join('T'); // String
};

}

if(!dojo._hasResource["dojo.parser"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojo.parser"] = true;
dojo.provide("dojo.parser");



new Date("X"); // workaround for #11279, new Date("") == NaN

dojo.parser = new function(){
	// summary:
	//		The Dom/Widget parsing package

	var d = dojo;

	function val2type(/*Object*/ value){
		// summary:
		//		Returns name of type of given value.

		if(d.isString(value)){ return "string"; }
		if(typeof value == "number"){ return "number"; }
		if(typeof value == "boolean"){ return "boolean"; }
		if(d.isFunction(value)){ return "function"; }
		if(d.isArray(value)){ return "array"; } // typeof [] == "object"
		if(value instanceof Date) { return "date"; } // assume timestamp
		if(value instanceof d._Url){ return "url"; }
		return "object";
	}

	function str2obj(/*String*/ value, /*String*/ type){
		// summary:
		//		Convert given string value to given type
		switch(type){
			case "string":
				return value;
			case "number":
				return value.length ? Number(value) : NaN;
			case "boolean":
				// for checked/disabled value might be "" or "checked".	 interpret as true.
				return typeof value == "boolean" ? value : !(value.toLowerCase()=="false");
			case "function":
				if(d.isFunction(value)){
					// IE gives us a function, even when we say something like onClick="foo"
					// (in which case it gives us an invalid function "function(){ foo }").
					//	Therefore, convert to string
					value=value.toString();
					value=d.trim(value.substring(value.indexOf('{')+1, value.length-1));
				}
				try{
					if(value === "" || value.search(/[^\w\.]+/i) != -1){
						// The user has specified some text for a function like "return x+5"
						return new Function(value);
					}else{
						// The user has specified the name of a function like "myOnClick"
						// or a single word function "return"
						return d.getObject(value, false) || new Function(value);
					}
				}catch(e){ return new Function(); }
			case "array":
				return value ? value.split(/\s*,\s*/) : [];
			case "date":
				switch(value){
					case "": return new Date("");	// the NaN of dates
					case "now": return new Date();	// current date
					default: return d.date.stamp.fromISOString(value);
				}
			case "url":
				return d.baseUrl + value;
			default:
				return d.fromJson(value);
		}
	}

	var dummyClass = {}, instanceClasses = {
		// map from fully qualified name (like "dijit.Button") to structure like
		// { cls: dijit.Button, params: {label: "string", disabled: "boolean"} }
	};

	// Widgets like BorderContainer add properties to _Widget via dojo.extend().
	// If BorderContainer is loaded after _Widget's parameter list has been cached,
	// we need to refresh that parameter list (for _Widget and all widgets that extend _Widget).
	// TODO: remove this in 2.0, when we stop caching parameters.
	d.connect(d, "extend", function(){
		instanceClasses = {};
	});

	function getProtoInfo(cls, params){
		// cls: A prototype
		//		The prototype of the class to check props on
		// params: Object
		//		The parameters object to mix found parameters onto.
		for(var name in cls){
			if(name.charAt(0)=="_"){ continue; }	// skip internal properties
			if(name in dummyClass){ continue; }		// skip "constructor" and "toString"
			params[name] = val2type(cls[name]);
		}
		return params;
	}

	function getClassInfo(/*String*/ className, /*Boolean*/ skipParamsLookup){
		// summary:
		//		Maps a widget name string like "dijit.form.Button" to the widget constructor itself,
		//		and a list of that widget's parameters and their types
		// className:
		//		fully qualified name (like "dijit.form.Button")
		// returns:
		//		structure like
		//			{
		//				cls: dijit.Button,
		//				params: { label: "string", disabled: "boolean"}
		//			}

		var c = instanceClasses[className];
		if(!c){
			// get pointer to widget class
			var cls = d.getObject(className), params = null;
			if(!cls){ return null; }		// class not defined [yet]
			if(!skipParamsLookup){ // from fastpath, we don't need to lookup the attrs on the proto because they are explicit
				params = getProtoInfo(cls.prototype, {})
			}
			c = { cls: cls, params: params };
			
		}else if(!skipParamsLookup && !c.params){
			// if we're calling getClassInfo and have a cls proto, but no params info, scan that cls for params now
			// and update the pointer in instanceClasses[className]. This happens when a widget appears in another
			// widget's template which still uses dojoType, but an instance of the widget appears prior with a data-dojo-type,
			// skipping this lookup the first time.
			c.params = getProtoInfo(c.cls.prototype, {});
		}
		
		return c;
	}

	this._functionFromScript = function(script, attrData){
		// summary:
		//		Convert a <script type="dojo/method" args="a, b, c"> ... </script>
		//		into a function
		// script: DOMNode
		//		The <script> DOMNode
		// attrData: String
		//		For HTML5 compliance, searches for attrData + "args" (typically
		//		"data-dojo-args") instead of "args"
		var preamble = "";
		var suffix = "";
		var argsStr = (script.getAttribute(attrData + "args") || script.getAttribute("args"));
		if(argsStr){
			d.forEach(argsStr.split(/\s*,\s*/), function(part, idx){
				preamble += "var "+part+" = arguments["+idx+"]; ";
			});
		}
		var withStr = script.getAttribute("with");
		if(withStr && withStr.length){
			d.forEach(withStr.split(/\s*,\s*/), function(part){
				preamble += "with("+part+"){";
				suffix += "}";
			});
		}
		return new Function(preamble+script.innerHTML+suffix);
	};

	this.instantiate = function(/* Array */nodes, /* Object? */mixin, /* Object? */args){
		// summary:
		//		Takes array of nodes, and turns them into class instances and
		//		potentially calls a startup method to allow them to connect with
		//		any children.
		// nodes: Array
		//		Array of nodes or objects like
		//	|		{
		//	|			type: "dijit.form.Button",
		//	|			node: DOMNode,
		//	|			scripts: [ ... ],	// array of <script type="dojo/..."> children of node
		//	|			inherited: { ... }	// settings inherited from ancestors like dir, theme, etc.
		//	|		}
		// mixin: Object?
		//		An object that will be mixed in with each node in the array.
		//		Values in the mixin will override values in the node, if they
		//		exist.
		// args: Object?
		//		An object used to hold kwArgs for instantiation.
		//		See parse.args argument for details.

		var thelist = [],
		mixin = mixin||{};
		args = args||{};

		// TODO: for 2.0 default to data-dojo- regardless of scopeName (or maybe scopeName won't exist in 2.0)
		var attrName = (args.scope || d._scopeName) + "Type",	// typically "dojoType"
			attrData = "data-" + (args.scope || d._scopeName) + "-";	// typically "data-dojo-"

		d.forEach(nodes, function(obj){
			if(!obj){ return; }

			// Get pointers to DOMNode, dojoType string, and clsInfo (metadata about the dojoType), etc.
			var node, type, clsInfo, clazz, scripts, fastpath;
			if(obj.node){
				// new format of nodes[] array, object w/lots of properties pre-computed for me
				node = obj.node;
				type = obj.type;
				fastpath = obj.fastpath;
				clsInfo = obj.clsInfo || (type && getClassInfo(type, fastpath));
				clazz = clsInfo && clsInfo.cls;
				scripts = obj.scripts;
			}else{
				// old (backwards compatible) format of nodes[] array, simple array of DOMNodes. no fastpath/data-dojo-type support here.
				node = obj;
				type = attrName in mixin ? mixin[attrName] : node.getAttribute(attrName);
				clsInfo = type && getClassInfo(type);
				clazz = clsInfo && clsInfo.cls;
				scripts = (clazz && (clazz._noScript || clazz.prototype._noScript) ? [] :
							d.query("> script[type^='dojo/']", node));
			}
			if(!clsInfo){
				throw new Error("Could not load class '" + type);
			}

			// Setup hash to hold parameter settings for this widget.	Start with the parameter
			// settings inherited from ancestors ("dir" and "lang").
			// Inherited setting may later be overridden by explicit settings on node itself.
			var params = {};
				
			if(args.defaults){
				// settings for the document itself (or whatever subtree is being parsed)
				d._mixin(params, args.defaults);
			}
			if(obj.inherited){
				// settings from dir=rtl or lang=... on a node above this node
				d._mixin(params, obj.inherited);
			}
			
			// mix things found in data-dojo-props into the params
			if(fastpath){
				var extra = node.getAttribute(attrData + "props");
				if(extra && extra.length){
					try{
						extra = d.fromJson.call(args.propsThis, "{" + extra + "}");
						d._mixin(params, extra);
					}catch(e){
						// give the user a pointer to their invalid parameters. FIXME: can we kill this in production?
						throw new Error(e.toString() + " in data-dojo-props='" + extra + "'");
					}
				}

				// For the benefit of _Templated, check if node has data-dojo-attach-point/data-dojo-attach-event
				// and mix those in as though they were parameters
				var attachPoint = node.getAttribute(attrData + "attach-point");
				if(attachPoint){
					params.dojoAttachPoint = attachPoint;
				}
				var attachEvent = node.getAttribute(attrData + "attach-event");
				if(attachEvent){
					params.dojoAttachEvent = attachEvent;
				}
				dojo.mixin(params, mixin);
			}else{
				// FIXME: we need something like "deprecateOnce()" to throw dojo.deprecation for something.
				// remove this logic in 2.0
				// read parameters (ie, attributes) specified on DOMNode

				var attributes = node.attributes;

				// clsInfo.params lists expected params like {"checked": "boolean", "n": "number"}
				for(var name in clsInfo.params){
					var item = name in mixin ? { value:mixin[name], specified:true } : attributes.getNamedItem(name);
					if(!item || (!item.specified && (!dojo.isIE || name.toLowerCase()!="value"))){ continue; }
					var value = item.value;
					// Deal with IE quirks for 'class' and 'style'
					switch(name){
					case "class":
						value = "className" in mixin ? mixin.className : node.className;
						break;
					case "style":
						value = "style" in mixin ? mixin.style : (node.style && node.style.cssText); // FIXME: Opera?
					}
					var _type = clsInfo.params[name];
					if(typeof value == "string"){
						params[name] = str2obj(value, _type);
					}else{
						params[name] = value;
					}
				}
			}

			// Process <script type="dojo/*"> script tags
			// <script type="dojo/method" event="foo"> tags are added to params, and passed to
			// the widget on instantiation.
			// <script type="dojo/method"> tags (with no event) are executed after instantiation
			// <script type="dojo/connect" event="foo"> tags are dojo.connected after instantiation
			// note: dojo/* script tags cannot exist in self closing widgets, like <input />
			var connects = [],	// functions to connect after instantiation
				calls = [];		// functions to call after instantiation

			d.forEach(scripts, function(script){
				node.removeChild(script);
				// FIXME: drop event="" support in 2.0. use data-dojo-event="" instead
				var event = (script.getAttribute(attrData + "event") || script.getAttribute("event")),
					type = script.getAttribute("type"),
					nf = d.parser._functionFromScript(script, attrData);
				if(event){
					if(type == "dojo/connect"){
						connects.push({event: event, func: nf});
					}else{
						params[event] = nf;
					}
				}else{
					calls.push(nf);
				}
			});

			var markupFactory = clazz.markupFactory || clazz.prototype && clazz.prototype.markupFactory;
			// create the instance
			var instance = markupFactory ? markupFactory(params, node, clazz) : new clazz(params, node);
			thelist.push(instance);

			// map it to the JS namespace if that makes sense
			// FIXME: in 2.0, drop jsId support. use data-dojo-id instead
			var jsname = (node.getAttribute(attrData + "id") || node.getAttribute("jsId"));
			if(jsname){
				d.setObject(jsname, instance);
			}

			// process connections and startup functions
			d.forEach(connects, function(connect){
				d.connect(instance, connect.event, null, connect.func);
			});
			d.forEach(calls, function(func){
				func.call(instance);
			});
		});

		// Call startup on each top level instance if it makes sense (as for
		// widgets).  Parent widgets will recursively call startup on their
		// (non-top level) children
		if(!mixin._started){
			// TODO: for 2.0, when old instantiate() API is desupported, store parent-child
			// relationships in the nodes[] array so that no getParent() call is needed.
			// Note that will  require a parse() call from ContentPane setting a param that the
			// ContentPane is the parent widget (so that the parse doesn't call startup() on the
			// ContentPane's children)
			d.forEach(thelist, function(instance){
				if( !args.noStart && instance  &&
					dojo.isFunction(instance.startup) &&
					!instance._started &&
					(!instance.getParent || !instance.getParent())
				){
					instance.startup();
				}
			});
		}
		return thelist;
	};

	this.parse = function(rootNode, args){
		// summary:
		//		Scan the DOM for class instances, and instantiate them.
		//
		// description:
		//		Search specified node (or root node) recursively for class instances,
		//		and instantiate them. Searches for either data-dojo-type="Class" or
		//		dojoType="Class" where "Class" is a a fully qualified class name,
		//		like `dijit.form.Button`
		//
		//		Using `data-dojo-type`:
		//		Attributes using can be mixed into the parameters used to instantitate the
		//		Class by using a `data-dojo-props` attribute on the node being converted.
		//		`data-dojo-props` should be a string attribute to be converted from JSON.
		//
		//		Using `dojoType`:
		//		Attributes are read from the original domNode and converted to appropriate
		//		types by looking up the Class prototype values. This is the default behavior
		//		from Dojo 1.0 to Dojo 1.5. `dojoType` support is deprecated, and will
		//		go away in Dojo 2.0.
		//
		// rootNode: DomNode?
		//		A default starting root node from which to start the parsing. Can be
		//		omitted, defaulting to the entire document. If omitted, the `args`
		//		object can be passed in this place. If the `args` object has a
		//		`rootNode` member, that is used.
		//
		// args: Object
		//		a kwArgs object passed along to instantiate()
		//
		//			* noStart: Boolean?
		//				when set will prevent the parser from calling .startup()
		//				when locating the nodes.
		//			* rootNode: DomNode?
		//				identical to the function's `rootNode` argument, though
		//				allowed to be passed in via this `args object.
		//			* template: Boolean
		//				If true, ignores ContentPane's stopParser flag and parses contents inside of
		//				a ContentPane inside of a template.   This allows dojoAttachPoint on widgets/nodes
		//				nested inside the ContentPane to work.
		//			* inherited: Object
		//				Hash possibly containing dir and lang settings to be applied to
		//				parsed widgets, unless there's another setting on a sub-node that overrides
		//			* scope: String
		//				Root for attribute names to search for.   If scopeName is dojo,
		//				will search for data-dojo-type (or dojoType).   For backwards compatibility
		//				reasons defaults to dojo._scopeName (which is "dojo" except when
		//				multi-version support is used, when it will be something like dojo16, dojo20, etc.)
		//			* propsThis: Object
		//				If specified, "this" referenced from data-dojo-props will refer to propsThis.
		//				Intended for use from the widgets-in-template feature of `dijit._Templated`
		//
		// example:
		//		Parse all widgets on a page:
		//	|		dojo.parser.parse();
		//
		// example:
		//		Parse all classes within the node with id="foo"
		//	|		dojo.parser.parse(dojo.byId('foo'));
		//
		// example:
		//		Parse all classes in a page, but do not call .startup() on any
		//		child
		//	|		dojo.parser.parse({ noStart: true })
		//
		// example:
		//		Parse all classes in a node, but do not call .startup()
		//	|		dojo.parser.parse(someNode, { noStart:true });
		//	|		// or
		//	|		dojo.parser.parse({ noStart:true, rootNode: someNode });

		// determine the root node based on the passed arguments.
		var root;
		if(!args && rootNode && rootNode.rootNode){
			args = rootNode;
			root = args.rootNode;
		}else{
			root = rootNode;
		}
		root = root ? dojo.byId(root) : dojo.body();
		args = args || {};

		var attrName = (args.scope || d._scopeName) + "Type",		// typically "dojoType"
			attrData = "data-" + (args.scope || d._scopeName) + "-";	// typically "data-dojo-"

		function scan(parent, list){
			// summary:
			//		Parent is an Object representing a DOMNode, with or without a dojoType specified.
			//		Scan parent's children looking for nodes with dojoType specified, storing in list[].
			//		If parent has a dojoType, also collects <script type=dojo/*> children and stores in parent.scripts[].
			// parent: Object
			//		Object representing the parent node, like
			//	|	{
			//	|		node: DomNode,			// scan children of this node
			//	|		inherited: {dir: "rtl"},	// dir/lang setting inherited from above node
			//	|
			//	|		// attributes only set if node has dojoType specified
			//	|		scripts: [],			// empty array, put <script type=dojo/*> in here
			//	|		clsInfo: { cls: dijit.form.Button, ...}
			//	|	}
			// list: DomNode[]
			//		Output array of objects (same format as parent) representing nodes to be turned into widgets

			// Effective dir and lang settings on parent node, either set directly or inherited from grandparent
			var inherited = dojo.clone(parent.inherited);
			dojo.forEach(["dir", "lang"], function(name){
				// TODO: what if this is a widget and dir/lang are declared in data-dojo-props?
				var val = parent.node.getAttribute(name);
				if(val){
					inherited[name] = val;
				}
			});

			// if parent is a widget, then search for <script type=dojo/*> tags and put them in scripts[].
			var scripts = parent.clsInfo && !parent.clsInfo.cls.prototype._noScript ? parent.scripts : null;

			// unless parent is a widget with the stopParser flag set, continue search for dojoType, recursively
			var recurse = (!parent.clsInfo || !parent.clsInfo.cls.prototype.stopParser) || (args && args.template);

			// scan parent's children looking for dojoType and <script type=dojo/*>
			for(var child = parent.node.firstChild; child; child = child.nextSibling){
				if(child.nodeType == 1){
					// FIXME: desupport dojoType in 2.0. use data-dojo-type instead
					var type, html5 = recurse && child.getAttribute(attrData + "type");
					if(html5){
						type = html5;
					}else{
						// fallback to backward compatible mode, using dojoType. remove in 2.0
						type = recurse && child.getAttribute(attrName);
					}
					
					var fastpath = html5 == type;

					if(type){
						// if dojoType/data-dojo-type specified, add to output array of nodes to instantiate
						var params = {
							"type": type,
							fastpath: fastpath,
							clsInfo: getClassInfo(type, fastpath), // note: won't find classes declared via dojo.Declaration
							node: child,
							scripts: [], // <script> nodes that are parent's children
							inherited: inherited // dir & lang attributes inherited from parent
						};
						list.push(params);

						// Recurse, collecting <script type="dojo/..."> children, and also looking for
						// descendant nodes with dojoType specified (unless the widget has the stopParser flag),
						scan(params, list);
					}else if(scripts && child.nodeName.toLowerCase() == "script"){
						// if <script type="dojo/...">, save in scripts[]
						type = child.getAttribute("type");
						if (type && /^dojo\/\w/i.test(type)) {
							scripts.push(child);
						}
					}else if(recurse){
						// Recurse, looking for grandchild nodes with dojoType specified
						scan({
							node: child,
							inherited: inherited
						}, list);
					}
				}
			}
		}

		// Ignore bogus entries in inherited hash like {dir: ""}
		var inherited = {};
		if(args && args.inherited){
			for(var key in args.inherited){
				if(args.inherited[key]){ inherited[key] = args.inherited[key]; }
			}
		}

		// Make list of all nodes on page w/dojoType specified
		var list = [];
		scan({
			node: root,
			inherited: inherited
		}, list);

		// go build the object instances
		var mixin = args && args.template ? {template: true} : null;
		return this.instantiate(list, mixin, args); // Array
	};
}();

//Register the parser callback. It should be the first callback
//after the a11y test.

(function(){
	var parseRunner = function(){
		if(dojo.config.parseOnLoad){
			dojo.parser.parse();
		}
	};

	// FIXME: need to clobber cross-dependency!!
	if(dojo.getObject("dijit.wai.onload") === dojo._loaders[0]){
		dojo._loaders.splice(1, 0, parseRunner);
	}else{
		dojo._loaders.unshift(parseRunner);
	}
})();

}

if(!dojo._hasResource["dojo.dnd.Container"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojo.dnd.Container"] = true;
dojo.provide("dojo.dnd.Container");




/*
	Container states:
		""		- normal state
		"Over"	- mouse over a container
	Container item states:
		""		- normal state
		"Over"	- mouse over a container item
*/

/*=====
dojo.declare("dojo.dnd.__ContainerArgs", [], {
	creator: function(){
		// summary:
		//		a creator function, which takes a data item, and returns an object like that:
		//		{node: newNode, data: usedData, type: arrayOfStrings}
	},

	// skipForm: Boolean
	//		don't start the drag operation, if clicked on form elements
	skipForm: false,

	// dropParent: Node||String
	//		node or node's id to use as the parent node for dropped items
	//		(must be underneath the 'node' parameter in the DOM)
	dropParent: null,

	// _skipStartup: Boolean
	//		skip startup(), which collects children, for deferred initialization
	//		(this is used in the markup mode)
	_skipStartup: false
});

dojo.dnd.Item = function(){
	// summary:
	//		Represents (one of) the source node(s) being dragged.
	//		Contains (at least) the "type" and "data" attributes.
	// type: String[]
	//		Type(s) of this item, by default this is ["text"]
	// data: Object
	//		Logical representation of the object being dragged.
	//		If the drag object's type is "text" then data is a String,
	//		if it's another type then data could be a different Object,
	//		perhaps a name/value hash.
	
	this.type = type;
	this.data = data;
}
=====*/

dojo.declare("dojo.dnd.Container", null, {
	// summary:
	//		a Container object, which knows when mouse hovers over it,
	//		and over which element it hovers
	
	// object attributes (for markup)
	skipForm: false,
	
	/*=====
	// current: DomNode
	//		The DOM node the mouse is currently hovered over
	current: null,
	
	// map: Hash<String, dojo.dnd.Item>
	//		Map from an item's id (which is also the DOMNode's id) to
	//		the dojo.dnd.Item itself.
	map: {},
	=====*/
	
	constructor: function(node, params){
		// summary:
		//		a constructor of the Container
		// node: Node
		//		node or node's id to build the container on
		// params: dojo.dnd.__ContainerArgs
		//		a dictionary of parameters
		this.node = dojo.byId(node);
		if(!params){ params = {}; }
		this.creator = params.creator || null;
		this.skipForm = params.skipForm;
		this.parent = params.dropParent && dojo.byId(params.dropParent);
		
		// class-specific variables
		this.map = {};
		this.current = null;

		// states
		this.containerState = "";
		dojo.addClass(this.node, "dojoDndContainer");
		
		// mark up children
		if(!(params && params._skipStartup)){
			this.startup();
		}

		// set up events
		this.events = [
			dojo.connect(this.node, "onmouseover", this, "onMouseOver"),
			dojo.connect(this.node, "onmouseout",  this, "onMouseOut"),
			// cancel text selection and text dragging
			dojo.connect(this.node, "ondragstart",   this, "onSelectStart"),
			dojo.connect(this.node, "onselectstart", this, "onSelectStart")
		];
	},
	
	// object attributes (for markup)
	creator: function(){
		// summary:
		//		creator function, dummy at the moment
	},
	
	// abstract access to the map
	getItem: function(/*String*/ key){
		// summary:
		//		returns a data item by its key (id)
		return this.map[key];	// dojo.dnd.Item
	},
	setItem: function(/*String*/ key, /*dojo.dnd.Item*/ data){
		// summary:
		//		associates a data item with its key (id)
		this.map[key] = data;
	},
	delItem: function(/*String*/ key){
		// summary:
		//		removes a data item from the map by its key (id)
		delete this.map[key];
	},
	forInItems: function(/*Function*/ f, /*Object?*/ o){
		// summary:
		//		iterates over a data map skipping members that
		//		are present in the empty object (IE and/or 3rd-party libraries).
		o = o || dojo.global;
		var m = this.map, e = dojo.dnd._empty;
		for(var i in m){
			if(i in e){ continue; }
			f.call(o, m[i], i, this);
		}
		return o;	// Object
	},
	clearItems: function(){
		// summary:
		//		removes all data items from the map
		this.map = {};
	},
	
	// methods
	getAllNodes: function(){
		// summary:
		//		returns a list (an array) of all valid child nodes
		return dojo.query("> .dojoDndItem", this.parent);	// NodeList
	},
	sync: function(){
		// summary:
		//		sync up the node list with the data map
		var map = {};
		this.getAllNodes().forEach(function(node){
			if(node.id){
				var item = this.getItem(node.id);
				if(item){
					map[node.id] = item;
					return;
				}
			}else{
				node.id = dojo.dnd.getUniqueId();
			}
			var type = node.getAttribute("dndType"),
				data = node.getAttribute("dndData");
			map[node.id] = {
				data: data || node.innerHTML,
				type: type ? type.split(/\s*,\s*/) : ["text"]
			};
		}, this);
		this.map = map;
		return this;	// self
	},
	insertNodes: function(data, before, anchor){
		// summary:
		//		inserts an array of new nodes before/after an anchor node
		// data: Array
		//		a list of data items, which should be processed by the creator function
		// before: Boolean
		//		insert before the anchor, if true, and after the anchor otherwise
		// anchor: Node
		//		the anchor node to be used as a point of insertion
		if(!this.parent.firstChild){
			anchor = null;
		}else if(before){
			if(!anchor){
				anchor = this.parent.firstChild;
			}
		}else{
			if(anchor){
				anchor = anchor.nextSibling;
			}
		}
		if(anchor){
			for(var i = 0; i < data.length; ++i){
				var t = this._normalizedCreator(data[i]);
				this.setItem(t.node.id, {data: t.data, type: t.type});
				this.parent.insertBefore(t.node, anchor);
			}
		}else{
			for(var i = 0; i < data.length; ++i){
				var t = this._normalizedCreator(data[i]);
				this.setItem(t.node.id, {data: t.data, type: t.type});
				this.parent.appendChild(t.node);
			}
		}
		return this;	// self
	},
	destroy: function(){
		// summary:
		//		prepares this object to be garbage-collected
		dojo.forEach(this.events, dojo.disconnect);
		this.clearItems();
		this.node = this.parent = this.current = null;
	},

	// markup methods
	markupFactory: function(params, node){
		params._skipStartup = true;
		return new dojo.dnd.Container(node, params);
	},
	startup: function(){
		// summary:
		//		collects valid child items and populate the map
		
		// set up the real parent node
		if(!this.parent){
			// use the standard algorithm, if not assigned
			this.parent = this.node;
			if(this.parent.tagName.toLowerCase() == "table"){
				var c = this.parent.getElementsByTagName("tbody");
				if(c && c.length){ this.parent = c[0]; }
			}
		}
		this.defaultCreator = dojo.dnd._defaultCreator(this.parent);

		// process specially marked children
		this.sync();
	},

	// mouse events
	onMouseOver: function(e){
		// summary:
		//		event processor for onmouseover
		// e: Event
		//		mouse event
		var n = e.relatedTarget;
		while(n){
			if(n == this.node){ break; }
			try{
				n = n.parentNode;
			}catch(x){
				n = null;
			}
		}
		if(!n){
			this._changeState("Container", "Over");
			this.onOverEvent();
		}
		n = this._getChildByEvent(e);
		if(this.current == n){ return; }
		if(this.current){ this._removeItemClass(this.current, "Over"); }
		if(n){ this._addItemClass(n, "Over"); }
		this.current = n;
	},
	onMouseOut: function(e){
		// summary:
		//		event processor for onmouseout
		// e: Event
		//		mouse event
		for(var n = e.relatedTarget; n;){
			if(n == this.node){ return; }
			try{
				n = n.parentNode;
			}catch(x){
				n = null;
			}
		}
		if(this.current){
			this._removeItemClass(this.current, "Over");
			this.current = null;
		}
		this._changeState("Container", "");
		this.onOutEvent();
	},
	onSelectStart: function(e){
		// summary:
		//		event processor for onselectevent and ondragevent
		// e: Event
		//		mouse event
		if(!this.skipForm || !dojo.dnd.isFormElement(e)){
			dojo.stopEvent(e);
		}
	},
	
	// utilities
	onOverEvent: function(){
		// summary:
		//		this function is called once, when mouse is over our container
	},
	onOutEvent: function(){
		// summary:
		//		this function is called once, when mouse is out of our container
	},
	_changeState: function(type, newState){
		// summary:
		//		changes a named state to new state value
		// type: String
		//		a name of the state to change
		// newState: String
		//		new state
		var prefix = "dojoDnd" + type;
		var state  = type.toLowerCase() + "State";
		//dojo.replaceClass(this.node, prefix + newState, prefix + this[state]);
		dojo.replaceClass(this.node, prefix + newState, prefix + this[state]);
		this[state] = newState;
	},
	_addItemClass: function(node, type){
		// summary:
		//		adds a class with prefix "dojoDndItem"
		// node: Node
		//		a node
		// type: String
		//		a variable suffix for a class name
		dojo.addClass(node, "dojoDndItem" + type);
	},
	_removeItemClass: function(node, type){
		// summary:
		//		removes a class with prefix "dojoDndItem"
		// node: Node
		//		a node
		// type: String
		//		a variable suffix for a class name
		dojo.removeClass(node, "dojoDndItem" + type);
	},
	_getChildByEvent: function(e){
		// summary:
		//		gets a child, which is under the mouse at the moment, or null
		// e: Event
		//		a mouse event
		var node = e.target;
		if(node){
			for(var parent = node.parentNode; parent; node = parent, parent = node.parentNode){
				if(parent == this.parent && dojo.hasClass(node, "dojoDndItem")){ return node; }
			}
		}
		return null;
	},
	_normalizedCreator: function(/*dojo.dnd.Item*/ item, /*String*/ hint){
		// summary:
		//		adds all necessary data to the output of the user-supplied creator function
		var t = (this.creator || this.defaultCreator).call(this, item, hint);
		if(!dojo.isArray(t.type)){ t.type = ["text"]; }
		if(!t.node.id){ t.node.id = dojo.dnd.getUniqueId(); }
		dojo.addClass(t.node, "dojoDndItem");
		return t;
	}
});

dojo.dnd._createNode = function(tag){
	// summary:
	//		returns a function, which creates an element of given tag
	//		(SPAN by default) and sets its innerHTML to given text
	// tag: String
	//		a tag name or empty for SPAN
	if(!tag){ return dojo.dnd._createSpan; }
	return function(text){	// Function
		return dojo.create(tag, {innerHTML: text});	// Node
	};
};

dojo.dnd._createTrTd = function(text){
	// summary:
	//		creates a TR/TD structure with given text as an innerHTML of TD
	// text: String
	//		a text for TD
	var tr = dojo.create("tr");
	dojo.create("td", {innerHTML: text}, tr);
	return tr;	// Node
};

dojo.dnd._createSpan = function(text){
	// summary:
	//		creates a SPAN element with given text as its innerHTML
	// text: String
	//		a text for SPAN
	return dojo.create("span", {innerHTML: text});	// Node
};

// dojo.dnd._defaultCreatorNodes: Object
//		a dictionary that maps container tag names to child tag names
dojo.dnd._defaultCreatorNodes = {ul: "li", ol: "li", div: "div", p: "div"};

dojo.dnd._defaultCreator = function(node){
	// summary:
	//		takes a parent node, and returns an appropriate creator function
	// node: Node
	//		a container node
	var tag = node.tagName.toLowerCase();
	var c = tag == "tbody" || tag == "thead" ? dojo.dnd._createTrTd :
			dojo.dnd._createNode(dojo.dnd._defaultCreatorNodes[tag]);
	return function(item, hint){	// Function
		var isObj = item && dojo.isObject(item), data, type, n;
		if(isObj && item.tagName && item.nodeType && item.getAttribute){
			// process a DOM node
			data = item.getAttribute("dndData") || item.innerHTML;
			type = item.getAttribute("dndType");
			type = type ? type.split(/\s*,\s*/) : ["text"];
			n = item;	// this node is going to be moved rather than copied
		}else{
			// process a DnD item object or a string
			data = (isObj && item.data) ? item.data : item;
			type = (isObj && item.type) ? item.type : ["text"];
			n = (hint == "avatar" ? dojo.dnd._createSpan : c)(String(data));
		}
		if(!n.id){
			n.id = dojo.dnd.getUniqueId();
		}
		return {node: n, data: data, type: type};
	};
};

}

if(!dojo._hasResource["dojo.dnd.Selector"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojo.dnd.Selector"] = true;
dojo.provide("dojo.dnd.Selector");




/*
	Container item states:
		""			- an item is not selected
		"Selected"	- an item is selected
		"Anchor"	- an item is selected, and is an anchor for a "shift" selection
*/

/*=====
dojo.declare("dojo.dnd.__SelectorArgs", [dojo.dnd.__ContainerArgs], {
	//	singular: Boolean
	//		allows selection of only one element, if true
	singular: false,

	//	autoSync: Boolean
	//		autosynchronizes the source with its list of DnD nodes,
	autoSync: false
});
=====*/

dojo.declare("dojo.dnd.Selector", dojo.dnd.Container, {
	// summary:
	//		a Selector object, which knows how to select its children
	
	/*=====
	// selection: Set<String>
	//		The set of id's that are currently selected, such that this.selection[id] == 1
	//		if the node w/that id is selected.  Can iterate over selected node's id's like:
	//	|		for(var id in this.selection)
	selection: {},
	=====*/

	constructor: function(node, params){
		// summary:
		//		constructor of the Selector
		// node: Node||String
		//		node or node's id to build the selector on
		// params: dojo.dnd.__SelectorArgs?
		//		a dictionary of parameters
		if(!params){ params = {}; }
		this.singular = params.singular;
		this.autoSync = params.autoSync;
		// class-specific variables
		this.selection = {};
		this.anchor = null;
		this.simpleSelection = false;
		// set up events
		this.events.push(
			dojo.connect(this.node, "onmousedown", this, "onMouseDown"),
			dojo.connect(this.node, "onmouseup",   this, "onMouseUp"));
	},
	
	// object attributes (for markup)
	singular: false,	// is singular property
	
	// methods
	getSelectedNodes: function(){
		// summary:
		//		returns a list (an array) of selected nodes
		var t = new dojo.NodeList();
		var e = dojo.dnd._empty;
		for(var i in this.selection){
			if(i in e){ continue; }
			t.push(dojo.byId(i));
		}
		return t;	// NodeList
	},
	selectNone: function(){
		// summary:
		//		unselects all items
		return this._removeSelection()._removeAnchor();	// self
	},
	selectAll: function(){
		// summary:
		//		selects all items
		this.forInItems(function(data, id){
			this._addItemClass(dojo.byId(id), "Selected");
			this.selection[id] = 1;
		}, this);
		return this._removeAnchor();	// self
	},
	deleteSelectedNodes: function(){
		// summary:
		//		deletes all selected items
		var e = dojo.dnd._empty;
		for(var i in this.selection){
			if(i in e){ continue; }
			var n = dojo.byId(i);
			this.delItem(i);
			dojo.destroy(n);
		}
		this.anchor = null;
		this.selection = {};
		return this;	// self
	},
	forInSelectedItems: function(/*Function*/ f, /*Object?*/ o){
		// summary:
		//		iterates over selected items;
		//		see `dojo.dnd.Container.forInItems()` for details
		o = o || dojo.global;
		var s = this.selection, e = dojo.dnd._empty;
		for(var i in s){
			if(i in e){ continue; }
			f.call(o, this.getItem(i), i, this);
		}
	},
	sync: function(){
		// summary:
		//		sync up the node list with the data map
		
		dojo.dnd.Selector.superclass.sync.call(this);
		
		// fix the anchor
		if(this.anchor){
			if(!this.getItem(this.anchor.id)){
				this.anchor = null;
			}
		}
		
		// fix the selection
		var t = [], e = dojo.dnd._empty;
		for(var i in this.selection){
			if(i in e){ continue; }
			if(!this.getItem(i)){
				t.push(i);
			}
		}
		dojo.forEach(t, function(i){
			delete this.selection[i];
		}, this);
		
		return this;	// self
	},
	insertNodes: function(addSelected, data, before, anchor){
		// summary:
		//		inserts new data items (see `dojo.dnd.Container.insertNodes()` method for details)
		// addSelected: Boolean
		//		all new nodes will be added to selected items, if true, no selection change otherwise
		// data: Array
		//		a list of data items, which should be processed by the creator function
		// before: Boolean
		//		insert before the anchor, if true, and after the anchor otherwise
		// anchor: Node
		//		the anchor node to be used as a point of insertion
		var oldCreator = this._normalizedCreator;
		this._normalizedCreator = function(item, hint){
			var t = oldCreator.call(this, item, hint);
			if(addSelected){
				if(!this.anchor){
					this.anchor = t.node;
					this._removeItemClass(t.node, "Selected");
					this._addItemClass(this.anchor, "Anchor");
				}else if(this.anchor != t.node){
					this._removeItemClass(t.node, "Anchor");
					this._addItemClass(t.node, "Selected");
				}
				this.selection[t.node.id] = 1;
			}else{
				this._removeItemClass(t.node, "Selected");
				this._removeItemClass(t.node, "Anchor");
			}
			return t;
		};
		dojo.dnd.Selector.superclass.insertNodes.call(this, data, before, anchor);
		this._normalizedCreator = oldCreator;
		return this;	// self
	},
	destroy: function(){
		// summary:
		//		prepares the object to be garbage-collected
		dojo.dnd.Selector.superclass.destroy.call(this);
		this.selection = this.anchor = null;
	},

	// markup methods
	markupFactory: function(params, node){
		params._skipStartup = true;
		return new dojo.dnd.Selector(node, params);
	},

	// mouse events
	onMouseDown: function(e){
		// summary:
		//		event processor for onmousedown
		// e: Event
		//		mouse event
		if(this.autoSync){ this.sync(); }
		if(!this.current){ return; }
		if(!this.singular && !dojo.isCopyKey(e) && !e.shiftKey && (this.current.id in this.selection)){
			this.simpleSelection = true;
			if(e.button === dojo.mouseButtons.LEFT){
				// accept the left button and stop the event
				// for IE we don't stop event when multiple buttons are pressed
				dojo.stopEvent(e);
			}
			return;
		}
		if(!this.singular && e.shiftKey){
			if(!dojo.isCopyKey(e)){
				this._removeSelection();
			}
			var c = this.getAllNodes();
			if(c.length){
				if(!this.anchor){
					this.anchor = c[0];
					this._addItemClass(this.anchor, "Anchor");
				}
				this.selection[this.anchor.id] = 1;
				if(this.anchor != this.current){
					var i = 0;
					for(; i < c.length; ++i){
						var node = c[i];
						if(node == this.anchor || node == this.current){ break; }
					}
					for(++i; i < c.length; ++i){
						var node = c[i];
						if(node == this.anchor || node == this.current){ break; }
						this._addItemClass(node, "Selected");
						this.selection[node.id] = 1;
					}
					this._addItemClass(this.current, "Selected");
					this.selection[this.current.id] = 1;
				}
			}
		}else{
			if(this.singular){
				if(this.anchor == this.current){
					if(dojo.isCopyKey(e)){
						this.selectNone();
					}
				}else{
					this.selectNone();
					this.anchor = this.current;
					this._addItemClass(this.anchor, "Anchor");
					this.selection[this.current.id] = 1;
				}
			}else{
				if(dojo.isCopyKey(e)){
					if(this.anchor == this.current){
						delete this.selection[this.anchor.id];
						this._removeAnchor();
					}else{
						if(this.current.id in this.selection){
							this._removeItemClass(this.current, "Selected");
							delete this.selection[this.current.id];
						}else{
							if(this.anchor){
								this._removeItemClass(this.anchor, "Anchor");
								this._addItemClass(this.anchor, "Selected");
							}
							this.anchor = this.current;
							this._addItemClass(this.current, "Anchor");
							this.selection[this.current.id] = 1;
						}
					}
				}else{
					if(!(this.current.id in this.selection)){
						this.selectNone();
						this.anchor = this.current;
						this._addItemClass(this.current, "Anchor");
						this.selection[this.current.id] = 1;
					}
				}
			}
		}
		dojo.stopEvent(e);
	},
	onMouseUp: function(e){
		// summary:
		//		event processor for onmouseup
		// e: Event
		//		mouse event
		if(!this.simpleSelection){ return; }
		this.simpleSelection = false;
		this.selectNone();
		if(this.current){
			this.anchor = this.current;
			this._addItemClass(this.anchor, "Anchor");
			this.selection[this.current.id] = 1;
		}
	},
	onMouseMove: function(e){
		// summary
		//		event processor for onmousemove
		// e: Event
		//		mouse event
		this.simpleSelection = false;
	},
	
	// utilities
	onOverEvent: function(){
		// summary:
		//		this function is called once, when mouse is over our container
		this.onmousemoveEvent = dojo.connect(this.node, "onmousemove", this, "onMouseMove");
	},
	onOutEvent: function(){
		// summary:
		//		this function is called once, when mouse is out of our container
		dojo.disconnect(this.onmousemoveEvent);
		delete this.onmousemoveEvent;
	},
	_removeSelection: function(){
		// summary:
		//		unselects all items
		var e = dojo.dnd._empty;
		for(var i in this.selection){
			if(i in e){ continue; }
			var node = dojo.byId(i);
			if(node){ this._removeItemClass(node, "Selected"); }
		}
		this.selection = {};
		return this;	// self
	},
	_removeAnchor: function(){
		if(this.anchor){
			this._removeItemClass(this.anchor, "Anchor");
			this.anchor = null;
		}
		return this;	// self
	}
});

}

if(!dojo._hasResource["dojo.window"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojo.window"] = true;
dojo.provide("dojo.window");

dojo.getObject("window", true, dojo);

dojo.window.getBox = function(){
	// summary:
	//		Returns the dimensions and scroll position of the viewable area of a browser window

	var scrollRoot = (dojo.doc.compatMode == 'BackCompat') ? dojo.body() : dojo.doc.documentElement;

	// get scroll position
	var scroll = dojo._docScroll(); // scrollRoot.scrollTop/Left should work
	return { w: scrollRoot.clientWidth, h: scrollRoot.clientHeight, l: scroll.x, t: scroll.y };
};

dojo.window.get = function(doc){
	// summary:
	// 		Get window object associated with document doc

	// In some IE versions (at least 6.0), document.parentWindow does not return a
	// reference to the real window object (maybe a copy), so we must fix it as well
	// We use IE specific execScript to attach the real window reference to
	// document._parentWindow for later use
	if(dojo.isIE && window !== document.parentWindow){
		/*
		In IE 6, only the variable "window" can be used to connect events (others
		may be only copies).
		*/
		doc.parentWindow.execScript("document._parentWindow = window;", "Javascript");
		//to prevent memory leak, unset it after use
		//another possibility is to add an onUnload handler which seems overkill to me (liucougar)
		var win = doc._parentWindow;
		doc._parentWindow = null;
		return win;	//	Window
	}

	return doc.parentWindow || doc.defaultView;	//	Window
};

dojo.window.scrollIntoView = function(/*DomNode*/ node, /*Object?*/ pos){
	// summary:
	//		Scroll the passed node into view, if it is not already.
	
	// don't rely on node.scrollIntoView working just because the function is there

	try{ // catch unexpected/unrecreatable errors (#7808) since we can recover using a semi-acceptable native method
		node = dojo.byId(node);
		var doc = node.ownerDocument || dojo.doc,
			body = doc.body || dojo.body(),
			html = doc.documentElement || body.parentNode,
			isIE = dojo.isIE, isWK = dojo.isWebKit;
		// if an untested browser, then use the native method
		if((!(dojo.isMoz || isIE || isWK || dojo.isOpera) || node == body || node == html) && (typeof node.scrollIntoView != "undefined")){
			node.scrollIntoView(false); // short-circuit to native if possible
			return;
		}
		var backCompat = doc.compatMode == 'BackCompat',
			clientAreaRoot = (isIE >= 9 && node.ownerDocument.parentWindow.frameElement)
				? ((html.clientHeight > 0 && html.clientWidth > 0 && (body.clientHeight == 0 || body.clientWidth == 0 || body.clientHeight > html.clientHeight || body.clientWidth > html.clientWidth)) ? html : body)
				: (backCompat ? body : html),
			scrollRoot = isWK ? body : clientAreaRoot,
			rootWidth = clientAreaRoot.clientWidth,
			rootHeight = clientAreaRoot.clientHeight,
			rtl = !dojo._isBodyLtr(),
			nodePos = pos || dojo.position(node),
			el = node.parentNode,
			isFixed = function(el){
				return ((isIE <= 6 || (isIE && backCompat))? false : (dojo.style(el, 'position').toLowerCase() == "fixed"));
			};
		if(isFixed(node)){ return; } // nothing to do

		while(el){
			if(el == body){ el = scrollRoot; }
			var elPos = dojo.position(el),
				fixedPos = isFixed(el);
	
			if(el == scrollRoot){
				elPos.w = rootWidth; elPos.h = rootHeight;
				if(scrollRoot == html && isIE && rtl){ elPos.x += scrollRoot.offsetWidth-elPos.w; } // IE workaround where scrollbar causes negative x
				if(elPos.x < 0 || !isIE){ elPos.x = 0; } // IE can have values > 0
				if(elPos.y < 0 || !isIE){ elPos.y = 0; }
			}else{
				var pb = dojo._getPadBorderExtents(el);
				elPos.w -= pb.w; elPos.h -= pb.h; elPos.x += pb.l; elPos.y += pb.t;
				var clientSize = el.clientWidth,
					scrollBarSize = elPos.w - clientSize;
				if(clientSize > 0 && scrollBarSize > 0){
					elPos.w = clientSize;
					elPos.x += (rtl && (isIE || el.clientLeft > pb.l/*Chrome*/)) ? scrollBarSize : 0;
				}
				clientSize = el.clientHeight;
				scrollBarSize = elPos.h - clientSize;
				if(clientSize > 0 && scrollBarSize > 0){
					elPos.h = clientSize;
				}
			}
			if(fixedPos){ // bounded by viewport, not parents
				if(elPos.y < 0){
					elPos.h += elPos.y; elPos.y = 0;
				}
				if(elPos.x < 0){
					elPos.w += elPos.x; elPos.x = 0;
				}
				if(elPos.y + elPos.h > rootHeight){
					elPos.h = rootHeight - elPos.y;
				}
				if(elPos.x + elPos.w > rootWidth){
					elPos.w = rootWidth - elPos.x;
				}
			}
			// calculate overflow in all 4 directions
			var l = nodePos.x - elPos.x, // beyond left: < 0
				t = nodePos.y - Math.max(elPos.y, 0), // beyond top: < 0
				r = l + nodePos.w - elPos.w, // beyond right: > 0
				bot = t + nodePos.h - elPos.h; // beyond bottom: > 0
			if(r * l > 0){
				var s = Math[l < 0? "max" : "min"](l, r);
				if(rtl && ((isIE == 8 && !backCompat) || isIE >= 9)){ s = -s; }
				nodePos.x += el.scrollLeft;
				el.scrollLeft += s;
				nodePos.x -= el.scrollLeft;
			}
			if(bot * t > 0){
				nodePos.y += el.scrollTop;
				el.scrollTop += Math[t < 0? "max" : "min"](t, bot);
				nodePos.y -= el.scrollTop;
			}
			el = (el != scrollRoot) && !fixedPos && el.parentNode;
		}
	}catch(error){
		console.error('scrollIntoView: ' + error);
		node.scrollIntoView(false);
	}
};

}

if(!dojo._hasResource["dojo.dnd.autoscroll"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojo.dnd.autoscroll"] = true;
dojo.provide("dojo.dnd.autoscroll");


dojo.getObject("dnd", true, dojo);

dojo.dnd.getViewport = dojo.window.getBox;

dojo.dnd.V_TRIGGER_AUTOSCROLL = 32;
dojo.dnd.H_TRIGGER_AUTOSCROLL = 32;

dojo.dnd.V_AUTOSCROLL_VALUE = 16;
dojo.dnd.H_AUTOSCROLL_VALUE = 16;

dojo.dnd.autoScroll = function(e){
	// summary:
	//		a handler for onmousemove event, which scrolls the window, if
	//		necesary
	// e: Event
	//		onmousemove event

	// FIXME: needs more docs!
	var v = dojo.window.getBox(), dx = 0, dy = 0;
	if(e.clientX < dojo.dnd.H_TRIGGER_AUTOSCROLL){
		dx = -dojo.dnd.H_AUTOSCROLL_VALUE;
	}else if(e.clientX > v.w - dojo.dnd.H_TRIGGER_AUTOSCROLL){
		dx = dojo.dnd.H_AUTOSCROLL_VALUE;
	}
	if(e.clientY < dojo.dnd.V_TRIGGER_AUTOSCROLL){
		dy = -dojo.dnd.V_AUTOSCROLL_VALUE;
	}else if(e.clientY > v.h - dojo.dnd.V_TRIGGER_AUTOSCROLL){
		dy = dojo.dnd.V_AUTOSCROLL_VALUE;
	}
	window.scrollBy(dx, dy);
};

dojo.dnd._validNodes = {"div": 1, "p": 1, "td": 1};
dojo.dnd._validOverflow = {"auto": 1, "scroll": 1};

dojo.dnd.autoScrollNodes = function(e){
	// summary:
	//		a handler for onmousemove event, which scrolls the first avaialble
	//		Dom element, it falls back to dojo.dnd.autoScroll()
	// e: Event
	//		onmousemove event

	// FIXME: needs more docs!
	for(var n = e.target; n;){
		if(n.nodeType == 1 && (n.tagName.toLowerCase() in dojo.dnd._validNodes)){
			var s = dojo.getComputedStyle(n);
			if(s.overflow.toLowerCase() in dojo.dnd._validOverflow){
				var b = dojo._getContentBox(n, s), t = dojo.position(n, true);
				//console.log(b.l, b.t, t.x, t.y, n.scrollLeft, n.scrollTop);
				var w = Math.min(dojo.dnd.H_TRIGGER_AUTOSCROLL, b.w / 2),
					h = Math.min(dojo.dnd.V_TRIGGER_AUTOSCROLL, b.h / 2),
					rx = e.pageX - t.x, ry = e.pageY - t.y, dx = 0, dy = 0;
				if(dojo.isWebKit || dojo.isOpera){
					// FIXME: this code should not be here, it should be taken into account
					// either by the event fixing code, or the dojo.position()
					// FIXME: this code doesn't work on Opera 9.5 Beta
					rx += dojo.body().scrollLeft;
					ry += dojo.body().scrollTop;
				}
				if(rx > 0 && rx < b.w){
					if(rx < w){
						dx = -w;
					}else if(rx > b.w - w){
						dx = w;
					}
				}
				//console.log("ry =", ry, "b.h =", b.h, "h =", h);
				if(ry > 0 && ry < b.h){
					if(ry < h){
						dy = -h;
					}else if(ry > b.h - h){
						dy = h;
					}
				}
				var oldLeft = n.scrollLeft, oldTop = n.scrollTop;
				n.scrollLeft = n.scrollLeft + dx;
				n.scrollTop  = n.scrollTop  + dy;
				if(oldLeft != n.scrollLeft || oldTop != n.scrollTop){ return; }
			}
		}
		try{
			n = n.parentNode;
		}catch(x){
			n = null;
		}
	}
	dojo.dnd.autoScroll(e);
};

}

if(!dojo._hasResource["dojo.dnd.Avatar"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojo.dnd.Avatar"] = true;
dojo.provide("dojo.dnd.Avatar");



dojo.declare("dojo.dnd.Avatar", null, {
	// summary:
	//		Object that represents transferred DnD items visually
	// manager: Object
	//		a DnD manager object

	constructor: function(manager){
		this.manager = manager;
		this.construct();
	},

	// methods
	construct: function(){
		// summary:
		//		constructor function;
		//		it is separate so it can be (dynamically) overwritten in case of need
		this.isA11y = dojo.hasClass(dojo.body(),"dijit_a11y");
		var a = dojo.create("table", {
				"class": "dojoDndAvatar",
				style: {
					position: "absolute",
					zIndex:   "1999",
					margin:   "0px"
				}
			}),
			source = this.manager.source, node,
			b = dojo.create("tbody", null, a),
			tr = dojo.create("tr", null, b),
			td = dojo.create("td", null, tr),
			icon = this.isA11y ? dojo.create("span", {
						id : "a11yIcon",
						innerHTML : this.manager.copy ? '+' : "<"
					}, td) : null,
			span = dojo.create("span", {
				innerHTML: source.generateText ? this._generateText() : ""
			}, td),
			k = Math.min(5, this.manager.nodes.length), i = 0;
		// we have to set the opacity on IE only after the node is live
		dojo.attr(tr, {
			"class": "dojoDndAvatarHeader",
			style: {opacity: 0.9}
		});
		for(; i < k; ++i){
			if(source.creator){
				// create an avatar representation of the node
				node = source._normalizedCreator(source.getItem(this.manager.nodes[i].id).data, "avatar").node;
			}else{
				// or just clone the node and hope it works
				node = this.manager.nodes[i].cloneNode(true);
				if(node.tagName.toLowerCase() == "tr"){
					// insert extra table nodes
					var table = dojo.create("table"),
						tbody = dojo.create("tbody", null, table);
					tbody.appendChild(node);
					node = table;
				}
			}
			node.id = "";
			tr = dojo.create("tr", null, b);
			td = dojo.create("td", null, tr);
			td.appendChild(node);
			dojo.attr(tr, {
				"class": "dojoDndAvatarItem",
				style: {opacity: (9 - i) / 10}
			});
		}
		this.node = a;
	},
	destroy: function(){
		// summary:
		//		destructor for the avatar; called to remove all references so it can be garbage-collected
		dojo.destroy(this.node);
		this.node = false;
	},
	update: function(){
		// summary:
		//		updates the avatar to reflect the current DnD state
		dojo[(this.manager.canDropFlag ? "add" : "remove") + "Class"](this.node, "dojoDndAvatarCanDrop");
		if (this.isA11y){
			var icon = dojo.byId("a11yIcon");
			var text = '+';   // assume canDrop && copy
			if (this.manager.canDropFlag && !this.manager.copy) {
				text = '< '; // canDrop && move
			}else if (!this.manager.canDropFlag && !this.manager.copy) {
				text = "o"; //!canDrop && move
			}else if(!this.manager.canDropFlag){
				text = 'x';  // !canDrop && copy
			}
			icon.innerHTML=text;
		}
		// replace text
		dojo.query(("tr.dojoDndAvatarHeader td span" +(this.isA11y ? " span" : "")), this.node).forEach(
			function(node){
				node.innerHTML = this._generateText();
			}, this);
	},
	_generateText: function(){
		// summary: generates a proper text to reflect copying or moving of items
		return this.manager.nodes.length.toString();
	}
});

}

if(!dojo._hasResource["dojo.dnd.Manager"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojo.dnd.Manager"] = true;
dojo.provide("dojo.dnd.Manager");





dojo.declare("dojo.dnd.Manager", null, {
	// summary:
	//		the manager of DnD operations (usually a singleton)
	constructor: function(){
		this.avatar  = null;
		this.source = null;
		this.nodes = [];
		this.copy  = true;
		this.target = null;
		this.canDropFlag = false;
		this.events = [];
	},

	// avatar's offset from the mouse
	OFFSET_X: 16,
	OFFSET_Y: 16,
	
	// methods
	overSource: function(source){
		// summary:
		//		called when a source detected a mouse-over condition
		// source: Object
		//		the reporter
		if(this.avatar){
			this.target = (source && source.targetState != "Disabled") ? source : null;
			this.canDropFlag = Boolean(this.target);
			this.avatar.update();
		}
		dojo.publish("/dnd/source/over", [source]);
	},
	outSource: function(source){
		// summary:
		//		called when a source detected a mouse-out condition
		// source: Object
		//		the reporter
		if(this.avatar){
			if(this.target == source){
				this.target = null;
				this.canDropFlag = false;
				this.avatar.update();
				dojo.publish("/dnd/source/over", [null]);
			}
		}else{
			dojo.publish("/dnd/source/over", [null]);
		}
	},
	startDrag: function(source, nodes, copy){
		// summary:
		//		called to initiate the DnD operation
		// source: Object
		//		the source which provides items
		// nodes: Array
		//		the list of transferred items
		// copy: Boolean
		//		copy items, if true, move items otherwise
		this.source = source;
		this.nodes  = nodes;
		this.copy   = Boolean(copy); // normalizing to true boolean
		this.avatar = this.makeAvatar();
		dojo.body().appendChild(this.avatar.node);
		dojo.publish("/dnd/start", [source, nodes, this.copy]);
		this.events = [
			dojo.connect(dojo.doc, "onmousemove", this, "onMouseMove"),
			dojo.connect(dojo.doc, "onmouseup",   this, "onMouseUp"),
			dojo.connect(dojo.doc, "onkeydown",   this, "onKeyDown"),
			dojo.connect(dojo.doc, "onkeyup",     this, "onKeyUp"),
			// cancel text selection and text dragging
			dojo.connect(dojo.doc, "ondragstart",   dojo.stopEvent),
			dojo.connect(dojo.body(), "onselectstart", dojo.stopEvent)
		];
		var c = "dojoDnd" + (copy ? "Copy" : "Move");
		dojo.addClass(dojo.body(), c);
	},
	canDrop: function(flag){
		// summary:
		//		called to notify if the current target can accept items
		var canDropFlag = Boolean(this.target && flag);
		if(this.canDropFlag != canDropFlag){
			this.canDropFlag = canDropFlag;
			this.avatar.update();
		}
	},
	stopDrag: function(){
		// summary:
		//		stop the DnD in progress
		dojo.removeClass(dojo.body(), ["dojoDndCopy", "dojoDndMove"]);
		dojo.forEach(this.events, dojo.disconnect);
		this.events = [];
		this.avatar.destroy();
		this.avatar = null;
		this.source = this.target = null;
		this.nodes = [];
	},
	makeAvatar: function(){
		// summary:
		//		makes the avatar; it is separate to be overwritten dynamically, if needed
		return new dojo.dnd.Avatar(this);
	},
	updateAvatar: function(){
		// summary:
		//		updates the avatar; it is separate to be overwritten dynamically, if needed
		this.avatar.update();
	},
	
	// mouse event processors
	onMouseMove: function(e){
		// summary:
		//		event processor for onmousemove
		// e: Event
		//		mouse event
		var a = this.avatar;
		if(a){
			dojo.dnd.autoScrollNodes(e);
			//dojo.dnd.autoScroll(e);
			var s = a.node.style;
			s.left = (e.pageX + this.OFFSET_X) + "px";
			s.top  = (e.pageY + this.OFFSET_Y) + "px";
			var copy = Boolean(this.source.copyState(dojo.isCopyKey(e)));
			if(this.copy != copy){
				this._setCopyStatus(copy);
			}
		}
	},
	onMouseUp: function(e){
		// summary:
		//		event processor for onmouseup
		// e: Event
		//		mouse event
		if(this.avatar){
			if(this.target && this.canDropFlag){
				var copy = Boolean(this.source.copyState(dojo.isCopyKey(e))),
				params = [this.source, this.nodes, copy, this.target, e];
				dojo.publish("/dnd/drop/before", params);
				dojo.publish("/dnd/drop", params);
			}else{
				dojo.publish("/dnd/cancel");
			}
			this.stopDrag();
		}
	},
	
	// keyboard event processors
	onKeyDown: function(e){
		// summary:
		//		event processor for onkeydown:
		//		watching for CTRL for copy/move status, watching for ESCAPE to cancel the drag
		// e: Event
		//		keyboard event
		if(this.avatar){
			switch(e.keyCode){
				case dojo.keys.CTRL:
					var copy = Boolean(this.source.copyState(true));
					if(this.copy != copy){
						this._setCopyStatus(copy);
					}
					break;
				case dojo.keys.ESCAPE:
					dojo.publish("/dnd/cancel");
					this.stopDrag();
					break;
			}
		}
	},
	onKeyUp: function(e){
		// summary:
		//		event processor for onkeyup, watching for CTRL for copy/move status
		// e: Event
		//		keyboard event
		if(this.avatar && e.keyCode == dojo.keys.CTRL){
			var copy = Boolean(this.source.copyState(false));
			if(this.copy != copy){
				this._setCopyStatus(copy);
			}
		}
	},
	
	// utilities
	_setCopyStatus: function(copy){
		// summary:
		//		changes the copy status
		// copy: Boolean
		//		the copy status
		this.copy = copy;
		this.source._markDndStatus(this.copy);
		this.updateAvatar();
		dojo.replaceClass(dojo.body(),
			"dojoDnd" + (this.copy ? "Copy" : "Move"),
			"dojoDnd" + (this.copy ? "Move" : "Copy"));
	}
});

// dojo.dnd._manager:
//		The manager singleton variable. Can be overwritten if needed.
dojo.dnd._manager = null;

dojo.dnd.manager = function(){
	// summary:
	//		Returns the current DnD manager.  Creates one if it is not created yet.
	if(!dojo.dnd._manager){
		dojo.dnd._manager = new dojo.dnd.Manager();
	}
	return dojo.dnd._manager;	// Object
};

}

if(!dojo._hasResource["dojo.dnd.Source"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojo.dnd.Source"] = true;
dojo.provide("dojo.dnd.Source");




/*
	Container property:
		"Horizontal"- if this is the horizontal container
	Source states:
		""			- normal state
		"Moved"		- this source is being moved
		"Copied"	- this source is being copied
	Target states:
		""			- normal state
		"Disabled"	- the target cannot accept an avatar
	Target anchor state:
		""			- item is not selected
		"Before"	- insert point is before the anchor
		"After"		- insert point is after the anchor
*/

/*=====
dojo.dnd.__SourceArgs = function(){
	//	summary:
	//		a dict of parameters for DnD Source configuration. Note that any
	//		property on Source elements may be configured, but this is the
	//		short-list
	//	isSource: Boolean?
	//		can be used as a DnD source. Defaults to true.
	//	accept: Array?
	//		list of accepted types (text strings) for a target; defaults to
	//		["text"]
	//	autoSync: Boolean
	//		if true refreshes the node list on every operation; false by default
	//	copyOnly: Boolean?
	//		copy items, if true, use a state of Ctrl key otherwise,
	//		see selfCopy and selfAccept for more details
	//	delay: Number
	//		the move delay in pixels before detecting a drag; 0 by default
	//	horizontal: Boolean?
	//		a horizontal container, if true, vertical otherwise or when omitted
	//	selfCopy: Boolean?
	//		copy items by default when dropping on itself,
	//		false by default, works only if copyOnly is true
	//	selfAccept: Boolean?
	//		accept its own items when copyOnly is true,
	//		true by default, works only if copyOnly is true
	//	withHandles: Boolean?
	//		allows dragging only by handles, false by default
	//  generateText: Boolean?
	//		generate text node for drag and drop, true by default
	this.isSource = isSource;
	this.accept = accept;
	this.autoSync = autoSync;
	this.copyOnly = copyOnly;
	this.delay = delay;
	this.horizontal = horizontal;
	this.selfCopy = selfCopy;
	this.selfAccept = selfAccept;
	this.withHandles = withHandles;
	this.generateText = true;
}
=====*/

dojo.declare("dojo.dnd.Source", dojo.dnd.Selector, {
	// summary:
	//		a Source object, which can be used as a DnD source, or a DnD target
	
	// object attributes (for markup)
	isSource: true,
	horizontal: false,
	copyOnly: false,
	selfCopy: false,
	selfAccept: true,
	skipForm: false,
	withHandles: false,
	autoSync: false,
	delay: 0, // pixels
	accept: ["text"],
	generateText: true,
	
	constructor: function(/*DOMNode|String*/node, /*dojo.dnd.__SourceArgs?*/params){
		// summary:
		//		a constructor of the Source
		// node:
		//		node or node's id to build the source on
		// params:
		//		any property of this class may be configured via the params
		//		object which is mixed-in to the `dojo.dnd.Source` instance
		dojo.mixin(this, dojo.mixin({}, params));
		var type = this.accept;
		if(type.length){
			this.accept = {};
			for(var i = 0; i < type.length; ++i){
				this.accept[type[i]] = 1;
			}
		}
		// class-specific variables
		this.isDragging = false;
		this.mouseDown = false;
		this.targetAnchor = null;
		this.targetBox = null;
		this.before = true;
		this._lastX = 0;
		this._lastY = 0;
		// states
		this.sourceState  = "";
		if(this.isSource){
			dojo.addClass(this.node, "dojoDndSource");
		}
		this.targetState  = "";
		if(this.accept){
			dojo.addClass(this.node, "dojoDndTarget");
		}
		if(this.horizontal){
			dojo.addClass(this.node, "dojoDndHorizontal");
		}
		// set up events
		this.topics = [
			dojo.subscribe("/dnd/source/over", this, "onDndSourceOver"),
			dojo.subscribe("/dnd/start",  this, "onDndStart"),
			dojo.subscribe("/dnd/drop",   this, "onDndDrop"),
			dojo.subscribe("/dnd/cancel", this, "onDndCancel")
		];
	},
	
	// methods
	checkAcceptance: function(source, nodes){
		// summary:
		//		checks if the target can accept nodes from this source
		// source: Object
		//		the source which provides items
		// nodes: Array
		//		the list of transferred items
		if(this == source){
			return !this.copyOnly || this.selfAccept;
		}
		for(var i = 0; i < nodes.length; ++i){
			var type = source.getItem(nodes[i].id).type;
			// type instanceof Array
			var flag = false;
			for(var j = 0; j < type.length; ++j){
				if(type[j] in this.accept){
					flag = true;
					break;
				}
			}
			if(!flag){
				return false;	// Boolean
			}
		}
		return true;	// Boolean
	},
	copyState: function(keyPressed, self){
		// summary:
		//		Returns true if we need to copy items, false to move.
		//		It is separated to be overwritten dynamically, if needed.
		// keyPressed: Boolean
		//		the "copy" key was pressed
		// self: Boolean?
		//		optional flag that means that we are about to drop on itself
		
		if(keyPressed){ return true; }
		if(arguments.length < 2){
			self = this == dojo.dnd.manager().target;
		}
		if(self){
			if(this.copyOnly){
				return this.selfCopy;
			}
		}else{
			return this.copyOnly;
		}
		return false;	// Boolean
	},
	destroy: function(){
		// summary:
		//		prepares the object to be garbage-collected
		dojo.dnd.Source.superclass.destroy.call(this);
		dojo.forEach(this.topics, dojo.unsubscribe);
		this.targetAnchor = null;
	},

	// markup methods
	markupFactory: function(params, node){
		params._skipStartup = true;
		return new dojo.dnd.Source(node, params);
	},

	// mouse event processors
	onMouseMove: function(e){
		// summary:
		//		event processor for onmousemove
		// e: Event
		//		mouse event
		if(this.isDragging && this.targetState == "Disabled"){ return; }
		dojo.dnd.Source.superclass.onMouseMove.call(this, e);
		var m = dojo.dnd.manager();
		if(!this.isDragging){
			if(this.mouseDown && this.isSource &&
					(Math.abs(e.pageX - this._lastX) > this.delay || Math.abs(e.pageY - this._lastY) > this.delay)){
				var nodes = this.getSelectedNodes();
				if(nodes.length){
					m.startDrag(this, nodes, this.copyState(dojo.isCopyKey(e), true));
				}
			}
		}
		if(this.isDragging){
			// calculate before/after
			var before = false;
			if(this.current){
				if(!this.targetBox || this.targetAnchor != this.current){
					this.targetBox = dojo.position(this.current, true);
				}
				if(this.horizontal){
					before = (e.pageX - this.targetBox.x) < (this.targetBox.w / 2);
				}else{
					before = (e.pageY - this.targetBox.y) < (this.targetBox.h / 2);
				}
			}
			if(this.current != this.targetAnchor || before != this.before){
				this._markTargetAnchor(before);
				m.canDrop(!this.current || m.source != this || !(this.current.id in this.selection));
			}
		}
	},
	onMouseDown: function(e){
		// summary:
		//		event processor for onmousedown
		// e: Event
		//		mouse event
		if(!this.mouseDown && this._legalMouseDown(e) && (!this.skipForm || !dojo.dnd.isFormElement(e))){
			this.mouseDown = true;
			this._lastX = e.pageX;
			this._lastY = e.pageY;
			dojo.dnd.Source.superclass.onMouseDown.call(this, e);
		}
	},
	onMouseUp: function(e){
		// summary:
		//		event processor for onmouseup
		// e: Event
		//		mouse event
		if(this.mouseDown){
			this.mouseDown = false;
			dojo.dnd.Source.superclass.onMouseUp.call(this, e);
		}
	},
	
	// topic event processors
	onDndSourceOver: function(source){
		// summary:
		//		topic event processor for /dnd/source/over, called when detected a current source
		// source: Object
		//		the source which has the mouse over it
		if(this != source){
			this.mouseDown = false;
			if(this.targetAnchor){
				this._unmarkTargetAnchor();
			}
		}else if(this.isDragging){
			var m = dojo.dnd.manager();
			m.canDrop(this.targetState != "Disabled" && (!this.current || m.source != this || !(this.current.id in this.selection)));
		}
	},
	onDndStart: function(source, nodes, copy){
		// summary:
		//		topic event processor for /dnd/start, called to initiate the DnD operation
		// source: Object
		//		the source which provides items
		// nodes: Array
		//		the list of transferred items
		// copy: Boolean
		//		copy items, if true, move items otherwise
		if(this.autoSync){ this.sync(); }
		if(this.isSource){
			this._changeState("Source", this == source ? (copy ? "Copied" : "Moved") : "");
		}
		var accepted = this.accept && this.checkAcceptance(source, nodes);
		this._changeState("Target", accepted ? "" : "Disabled");
		if(this == source){
			dojo.dnd.manager().overSource(this);
		}
		this.isDragging = true;
	},
	onDndDrop: function(source, nodes, copy, target){
		// summary:
		//		topic event processor for /dnd/drop, called to finish the DnD operation
		// source: Object
		//		the source which provides items
		// nodes: Array
		//		the list of transferred items
		// copy: Boolean
		//		copy items, if true, move items otherwise
		// target: Object
		//		the target which accepts items
		if(this == target){
			// this one is for us => move nodes!
			this.onDrop(source, nodes, copy);
		}
		this.onDndCancel();
	},
	onDndCancel: function(){
		// summary:
		//		topic event processor for /dnd/cancel, called to cancel the DnD operation
		if(this.targetAnchor){
			this._unmarkTargetAnchor();
			this.targetAnchor = null;
		}
		this.before = true;
		this.isDragging = false;
		this.mouseDown = false;
		this._changeState("Source", "");
		this._changeState("Target", "");
	},
	
	// local events
	onDrop: function(source, nodes, copy){
		// summary:
		//		called only on the current target, when drop is performed
		// source: Object
		//		the source which provides items
		// nodes: Array
		//		the list of transferred items
		// copy: Boolean
		//		copy items, if true, move items otherwise
		
		if(this != source){
			this.onDropExternal(source, nodes, copy);
		}else{
			this.onDropInternal(nodes, copy);
		}
	},
	onDropExternal: function(source, nodes, copy){
		// summary:
		//		called only on the current target, when drop is performed
		//		from an external source
		// source: Object
		//		the source which provides items
		// nodes: Array
		//		the list of transferred items
		// copy: Boolean
		//		copy items, if true, move items otherwise
		
		var oldCreator = this._normalizedCreator;
		// transferring nodes from the source to the target
		if(this.creator){
			// use defined creator
			this._normalizedCreator = function(node, hint){
				return oldCreator.call(this, source.getItem(node.id).data, hint);
			};
		}else{
			// we have no creator defined => move/clone nodes
			if(copy){
				// clone nodes
				this._normalizedCreator = function(node, hint){
					var t = source.getItem(node.id);
					var n = node.cloneNode(true);
					n.id = dojo.dnd.getUniqueId();
					return {node: n, data: t.data, type: t.type};
				};
			}else{
				// move nodes
				this._normalizedCreator = function(node, hint){
					var t = source.getItem(node.id);
					source.delItem(node.id);
					return {node: node, data: t.data, type: t.type};
				};
			}
		}
		this.selectNone();
		if(!copy && !this.creator){
			source.selectNone();
		}
		this.insertNodes(true, nodes, this.before, this.current);
		if(!copy && this.creator){
			source.deleteSelectedNodes();
		}
		this._normalizedCreator = oldCreator;
	},
	onDropInternal: function(nodes, copy){
		// summary:
		//		called only on the current target, when drop is performed
		//		from the same target/source
		// nodes: Array
		//		the list of transferred items
		// copy: Boolean
		//		copy items, if true, move items otherwise
		
		var oldCreator = this._normalizedCreator;
		// transferring nodes within the single source
		if(this.current && this.current.id in this.selection){
			// do nothing
			return;
		}
		if(copy){
			if(this.creator){
				// create new copies of data items
				this._normalizedCreator = function(node, hint){
					return oldCreator.call(this, this.getItem(node.id).data, hint);
				};
			}else{
				// clone nodes
				this._normalizedCreator = function(node, hint){
					var t = this.getItem(node.id);
					var n = node.cloneNode(true);
					n.id = dojo.dnd.getUniqueId();
					return {node: n, data: t.data, type: t.type};
				};
			}
		}else{
			// move nodes
			if(!this.current){
				// do nothing
				return;
			}
			this._normalizedCreator = function(node, hint){
				var t = this.getItem(node.id);
				return {node: node, data: t.data, type: t.type};
			};
		}
		this._removeSelection();
		this.insertNodes(true, nodes, this.before, this.current);
		this._normalizedCreator = oldCreator;
	},
	onDraggingOver: function(){
		// summary:
		//		called during the active DnD operation, when items
		//		are dragged over this target, and it is not disabled
	},
	onDraggingOut: function(){
		// summary:
		//		called during the active DnD operation, when items
		//		are dragged away from this target, and it is not disabled
	},
	
	// utilities
	onOverEvent: function(){
		// summary:
		//		this function is called once, when mouse is over our container
		dojo.dnd.Source.superclass.onOverEvent.call(this);
		dojo.dnd.manager().overSource(this);
		if(this.isDragging && this.targetState != "Disabled"){
			this.onDraggingOver();
		}
	},
	onOutEvent: function(){
		// summary:
		//		this function is called once, when mouse is out of our container
		dojo.dnd.Source.superclass.onOutEvent.call(this);
		dojo.dnd.manager().outSource(this);
		if(this.isDragging && this.targetState != "Disabled"){
			this.onDraggingOut();
		}
	},
	_markTargetAnchor: function(before){
		// summary:
		//		assigns a class to the current target anchor based on "before" status
		// before: Boolean
		//		insert before, if true, after otherwise
		if(this.current == this.targetAnchor && this.before == before){ return; }
		if(this.targetAnchor){
			this._removeItemClass(this.targetAnchor, this.before ? "Before" : "After");
		}
		this.targetAnchor = this.current;
		this.targetBox = null;
		this.before = before;
		if(this.targetAnchor){
			this._addItemClass(this.targetAnchor, this.before ? "Before" : "After");
		}
	},
	_unmarkTargetAnchor: function(){
		// summary:
		//		removes a class of the current target anchor based on "before" status
		if(!this.targetAnchor){ return; }
		this._removeItemClass(this.targetAnchor, this.before ? "Before" : "After");
		this.targetAnchor = null;
		this.targetBox = null;
		this.before = true;
	},
	_markDndStatus: function(copy){
		// summary:
		//		changes source's state based on "copy" status
		this._changeState("Source", copy ? "Copied" : "Moved");
	},
	_legalMouseDown: function(e){
		// summary:
		//		checks if user clicked on "approved" items
		// e: Event
		//		mouse event
		
		// accept only the left mouse button
		if(!dojo.mouseButtons.isLeft(e)){ return false; }
		
		if(!this.withHandles){ return true; }
		
		// check for handles
		for(var node = e.target; node && node !== this.node; node = node.parentNode){
			if(dojo.hasClass(node, "dojoDndHandle")){ return true; }
			if(dojo.hasClass(node, "dojoDndItem") || dojo.hasClass(node, "dojoDndIgnore")){ break; }
		}
		return false;	// Boolean
	}
});

dojo.declare("dojo.dnd.Target", dojo.dnd.Source, {
	// summary: a Target object, which can be used as a DnD target
	
	constructor: function(node, params){
		// summary:
		//		a constructor of the Target --- see the `dojo.dnd.Source.constructor` for details
		this.isSource = false;
		dojo.removeClass(this.node, "dojoDndSource");
	},

	// markup methods
	markupFactory: function(params, node){
		params._skipStartup = true;
		return new dojo.dnd.Target(node, params);
	}
});

dojo.declare("dojo.dnd.AutoSource", dojo.dnd.Source, {
	// summary:
	//		a source that syncs its DnD nodes by default
	
	constructor: function(node, params){
		// summary:
		//		constructor of the AutoSource --- see the Source constructor for details
		this.autoSync = true;
	},

	// markup methods
	markupFactory: function(params, node){
		params._skipStartup = true;
		return new dojo.dnd.AutoSource(node, params);
	}
});

}

if(!dojo._hasResource["dojo.i18n"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojo.i18n"] = true;
dojo.provide("dojo.i18n");

dojo.getObject("i18n", true, dojo);

/*=====
dojo.i18n = {
	// summary: Utility classes to enable loading of resources for internationalization (i18n)
};
=====*/

// when using a real AMD loader, dojo.i18n.getLocalization is already defined by dojo/lib/backCompat
dojo.i18n.getLocalization = dojo.i18n.getLocalization || function(/*String*/packageName, /*String*/bundleName, /*String?*/locale){
	//	summary:
	//		Returns an Object containing the localization for a given resource
	//		bundle in a package, matching the specified locale.
	//	description:
	//		Returns a hash containing name/value pairs in its prototypesuch
	//		that values can be easily overridden.  Throws an exception if the
	//		bundle is not found.  Bundle must have already been loaded by
	//		`dojo.requireLocalization()` or by a build optimization step.  NOTE:
	//		try not to call this method as part of an object property
	//		definition (`var foo = { bar: dojo.i18n.getLocalization() }`).  In
	//		some loading situations, the bundle may not be available in time
	//		for the object definition.  Instead, call this method inside a
	//		function that is run after all modules load or the page loads (like
	//		in `dojo.addOnLoad()`), or in a widget lifecycle method.
	//	packageName:
	//		package which is associated with this resource
	//	bundleName:
	//		the base filename of the resource bundle (without the ".js" suffix)
	//	locale:
	//		the variant to load (optional).  By default, the locale defined by
	//		the host environment: dojo.locale

	locale = dojo.i18n.normalizeLocale(locale);

	// look for nearest locale match
	var elements = locale.split('-');
	var module = [packageName,"nls",bundleName].join('.');
		var bundle = dojo._loadedModules[module];
	if(bundle){
		var localization;
		for(var i = elements.length; i > 0; i--){
			var loc = elements.slice(0, i).join('_');
			if(bundle[loc]){
				localization = bundle[loc];
				break;
			}
		}
		if(!localization){
			localization = bundle.ROOT;
		}

		// make a singleton prototype so that the caller won't accidentally change the values globally
		if(localization){
			var clazz = function(){};
			clazz.prototype = localization;
			return new clazz(); // Object
		}
	}

	throw new Error("Bundle not found: " + bundleName + " in " + packageName+" , locale=" + locale);
};

dojo.i18n.normalizeLocale = function(/*String?*/locale){
	//	summary:
	//		Returns canonical form of locale, as used by Dojo.
	//
	//  description:
	//		All variants are case-insensitive and are separated by '-' as specified in [RFC 3066](http://www.ietf.org/rfc/rfc3066.txt).
	//		If no locale is specified, the dojo.locale is returned.  dojo.locale is defined by
	//		the user agent's locale unless overridden by djConfig.

	var result = locale ? locale.toLowerCase() : dojo.locale;
	if(result == "root"){
		result = "ROOT";
	}
	return result; // String
};

dojo.i18n._requireLocalization = function(/*String*/moduleName, /*String*/bundleName, /*String?*/locale, /*String?*/availableFlatLocales){
	//	summary:
	//		See dojo.requireLocalization()
	//	description:
	// 		Called by the bootstrap, but factored out so that it is only
	// 		included in the build when needed.

	var targetLocale = dojo.i18n.normalizeLocale(locale);
 	var bundlePackage = [moduleName, "nls", bundleName].join(".");
	// NOTE:
	//		When loading these resources, the packaging does not match what is
	//		on disk.  This is an implementation detail, as this is just a
	//		private data structure to hold the loaded resources.  e.g.
	//		`tests/hello/nls/en-us/salutations.js` is loaded as the object
	//		`tests.hello.nls.salutations.en_us={...}` The structure on disk is
	//		intended to be most convenient for developers and translators, but
	//		in memory it is more logical and efficient to store in a different
	//		order.  Locales cannot use dashes, since the resulting path will
	//		not evaluate as valid JS, so we translate them to underscores.

	//Find the best-match locale to load if we have available flat locales.
	var bestLocale = "";
	if(availableFlatLocales){
		var flatLocales = availableFlatLocales.split(",");
		for(var i = 0; i < flatLocales.length; i++){
			//Locale must match from start of string.
			//Using ["indexOf"] so customBase builds do not see
			//this as a dojo._base.array dependency.
			if(targetLocale["indexOf"](flatLocales[i]) == 0){
				if(flatLocales[i].length > bestLocale.length){
					bestLocale = flatLocales[i];
				}
			}
		}
		if(!bestLocale){
			bestLocale = "ROOT";
		}
	}

	//See if the desired locale is already loaded.
	var tempLocale = availableFlatLocales ? bestLocale : targetLocale;
	var bundle = dojo._loadedModules[bundlePackage];
	var localizedBundle = null;
	if(bundle){
		if(dojo.config.localizationComplete && bundle._built){return;}
		var jsLoc = tempLocale.replace(/-/g, '_');
		var translationPackage = bundlePackage+"."+jsLoc;
		localizedBundle = dojo._loadedModules[translationPackage];
	}

	if(!localizedBundle){
		bundle = dojo["provide"](bundlePackage);
		var syms = dojo._getModuleSymbols(moduleName);
		var modpath = syms.concat("nls").join("/");
		var parent;

		dojo.i18n._searchLocalePath(tempLocale, availableFlatLocales, function(loc){
			var jsLoc = loc.replace(/-/g, '_');
			var translationPackage = bundlePackage + "." + jsLoc;
			var loaded = false;
			if(!dojo._loadedModules[translationPackage]){
				// Mark loaded whether it's found or not, so that further load attempts will not be made
				dojo["provide"](translationPackage);
				var module = [modpath];
				if(loc != "ROOT"){module.push(loc);}
				module.push(bundleName);
				var filespec = module.join("/") + '.js';
				loaded = dojo._loadPath(filespec, null, function(hash){
					hash = hash.root || hash;
					// Use singleton with prototype to point to parent bundle, then mix-in result from loadPath
					var clazz = function(){};
					clazz.prototype = parent;
					bundle[jsLoc] = new clazz();
					for(var j in hash){ bundle[jsLoc][j] = hash[j]; }
				});
			}else{
				loaded = true;
			}
			if(loaded && bundle[jsLoc]){
				parent = bundle[jsLoc];
			}else{
				bundle[jsLoc] = parent;
			}

			if(availableFlatLocales){
				//Stop the locale path searching if we know the availableFlatLocales, since
				//the first call to this function will load the only bundle that is needed.
				return true;
			}
		});
	}

	//Save the best locale bundle as the target locale bundle when we know the
	//the available bundles.
	if(availableFlatLocales && targetLocale != bestLocale){
		bundle[targetLocale.replace(/-/g, '_')] = bundle[bestLocale.replace(/-/g, '_')];
	}
};

(function(){
	// If other locales are used, dojo.requireLocalization should load them as
	// well, by default.
	//
	// Override dojo.requireLocalization to do load the default bundle, then
	// iterate through the extraLocale list and load those translations as
	// well, unless a particular locale was requested.

	var extra = dojo.config.extraLocale;
	if(extra){
		if(!extra instanceof Array){
			extra = [extra];
		}

		var req = dojo.i18n._requireLocalization;
		dojo.i18n._requireLocalization = function(m, b, locale, availableFlatLocales){
			req(m,b,locale, availableFlatLocales);
			if(locale){return;}
			for(var i=0; i<extra.length; i++){
				req(m,b,extra[i], availableFlatLocales);
			}
		};
	}
})();

dojo.i18n._searchLocalePath = function(/*String*/locale, /*Boolean*/down, /*Function*/searchFunc){
	//	summary:
	//		A helper method to assist in searching for locale-based resources.
	//		Will iterate through the variants of a particular locale, either up
	//		or down, executing a callback function.  For example, "en-us" and
	//		true will try "en-us" followed by "en" and finally "ROOT".

	locale = dojo.i18n.normalizeLocale(locale);

	var elements = locale.split('-');
	var searchlist = [];
	for(var i = elements.length; i > 0; i--){
		searchlist.push(elements.slice(0, i).join('-'));
	}
	searchlist.push(false);
	if(down){searchlist.reverse();}

	for(var j = searchlist.length - 1; j >= 0; j--){
		var loc = searchlist[j] || "ROOT";
		var stop = searchFunc(loc);
		if(stop){ break; }
	}
};

dojo.i18n._preloadLocalizations = function(/*String*/bundlePrefix, /*Array*/localesGenerated){
	//	summary:
	//		Load built, flattened resource bundles, if available for all
	//		locales used in the page. Only called by built layer files.

	function preload(locale){
		locale = dojo.i18n.normalizeLocale(locale);
		dojo.i18n._searchLocalePath(locale, true, function(loc){
			for(var i=0; i<localesGenerated.length;i++){
				if(localesGenerated[i] == loc){
					dojo["require"](bundlePrefix+"_"+loc);
					return true; // Boolean
				}
			}
			return false; // Boolean
		});
	}
	preload();
	var extra = dojo.config.extraLocale||[];
	for(var i=0; i<extra.length; i++){
		preload(extra[i]);
	}
};

}

if(!dojo._hasResource["dijit._base.manager"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dijit._base.manager"] = true;
dojo.provide("dijit._base.manager");


dojo.declare("dijit.WidgetSet", null, {
	// summary:
	//		A set of widgets indexed by id. A default instance of this class is
	//		available as `dijit.registry`
	//
	// example:
	//		Create a small list of widgets:
	//		|	var ws = new dijit.WidgetSet();
	//		|	ws.add(dijit.byId("one"));
	//		| 	ws.add(dijit.byId("two"));
	//		|	// destroy both:
	//		|	ws.forEach(function(w){ w.destroy(); });
	//
	// example:
	//		Using dijit.registry:
	//		|	dijit.registry.forEach(function(w){ /* do something */ });

	constructor: function(){
		this._hash = {};
		this.length = 0;
	},

	add: function(/*dijit._Widget*/ widget){
		// summary:
		//		Add a widget to this list. If a duplicate ID is detected, a error is thrown.
		//
		// widget: dijit._Widget
		//		Any dijit._Widget subclass.
		if(this._hash[widget.id]){
			throw new Error("Tried to register widget with id==" + widget.id + " but that id is already registered");
		}
		this._hash[widget.id] = widget;
		this.length++;
	},

	remove: function(/*String*/ id){
		// summary:
		//		Remove a widget from this WidgetSet. Does not destroy the widget; simply
		//		removes the reference.
		if(this._hash[id]){
			delete this._hash[id];
			this.length--;
		}
	},

	forEach: function(/*Function*/ func, /* Object? */thisObj){
		// summary:
		//		Call specified function for each widget in this set.
		//
		// func:
		//		A callback function to run for each item. Is passed the widget, the index
		//		in the iteration, and the full hash, similar to `dojo.forEach`.
		//
		// thisObj:
		//		An optional scope parameter
		//
		// example:
		//		Using the default `dijit.registry` instance:
		//		|	dijit.registry.forEach(function(widget){
		//		|		console.log(widget.declaredClass);
		//		|	});
		//
		// returns:
		//		Returns self, in order to allow for further chaining.

		thisObj = thisObj || dojo.global;
		var i = 0, id;
		for(id in this._hash){
			func.call(thisObj, this._hash[id], i++, this._hash);
		}
		return this;	// dijit.WidgetSet
	},

	filter: function(/*Function*/ filter, /* Object? */thisObj){
		// summary:
		//		Filter down this WidgetSet to a smaller new WidgetSet
		//		Works the same as `dojo.filter` and `dojo.NodeList.filter`
		//
		// filter:
		//		Callback function to test truthiness. Is passed the widget
		//		reference and the pseudo-index in the object.
		//
		// thisObj: Object?
		//		Option scope to use for the filter function.
		//
		// example:
		//		Arbitrary: select the odd widgets in this list
		//		|	dijit.registry.filter(function(w, i){
		//		|		return i % 2 == 0;
		//		|	}).forEach(function(w){ /* odd ones */ });

		thisObj = thisObj || dojo.global;
		var res = new dijit.WidgetSet(), i = 0, id;
		for(id in this._hash){
			var w = this._hash[id];
			if(filter.call(thisObj, w, i++, this._hash)){
				res.add(w);
			}
		}
		return res; // dijit.WidgetSet
	},

	byId: function(/*String*/ id){
		// summary:
		//		Find a widget in this list by it's id.
		// example:
		//		Test if an id is in a particular WidgetSet
		//		| var ws = new dijit.WidgetSet();
		//		| ws.add(dijit.byId("bar"));
		//		| var t = ws.byId("bar") // returns a widget
		//		| var x = ws.byId("foo"); // returns undefined

		return this._hash[id];	// dijit._Widget
	},

	byClass: function(/*String*/ cls){
		// summary:
		//		Reduce this widgetset to a new WidgetSet of a particular `declaredClass`
		//
		// cls: String
		//		The Class to scan for. Full dot-notated string.
		//
		// example:
		//		Find all `dijit.TitlePane`s in a page:
		//		|	dijit.registry.byClass("dijit.TitlePane").forEach(function(tp){ tp.close(); });

		var res = new dijit.WidgetSet(), id, widget;
		for(id in this._hash){
			widget = this._hash[id];
			if(widget.declaredClass == cls){
				res.add(widget);
			}
		 }
		 return res; // dijit.WidgetSet
},

	toArray: function(){
		// summary:
		//		Convert this WidgetSet into a true Array
		//
		// example:
		//		Work with the widget .domNodes in a real Array
		//		|	dojo.map(dijit.registry.toArray(), function(w){ return w.domNode; });

		var ar = [];
		for(var id in this._hash){
			ar.push(this._hash[id]);
		}
		return ar;	// dijit._Widget[]
},

	map: function(/* Function */func, /* Object? */thisObj){
		// summary:
		//		Create a new Array from this WidgetSet, following the same rules as `dojo.map`
		// example:
		//		|	var nodes = dijit.registry.map(function(w){ return w.domNode; });
		//
		// returns:
		//		A new array of the returned values.
		return dojo.map(this.toArray(), func, thisObj); // Array
	},

	every: function(func, thisObj){
		// summary:
		// 		A synthetic clone of `dojo.every` acting explicitly on this WidgetSet
		//
		// func: Function
		//		A callback function run for every widget in this list. Exits loop
		//		when the first false return is encountered.
		//
		// thisObj: Object?
		//		Optional scope parameter to use for the callback

		thisObj = thisObj || dojo.global;
		var x = 0, i;
		for(i in this._hash){
			if(!func.call(thisObj, this._hash[i], x++, this._hash)){
				return false; // Boolean
			}
		}
		return true; // Boolean
	},

	some: function(func, thisObj){
		// summary:
		// 		A synthetic clone of `dojo.some` acting explictly on this WidgetSet
		//
		// func: Function
		//		A callback function run for every widget in this list. Exits loop
		//		when the first true return is encountered.
		//
		// thisObj: Object?
		//		Optional scope parameter to use for the callback

		thisObj = thisObj || dojo.global;
		var x = 0, i;
		for(i in this._hash){
			if(func.call(thisObj, this._hash[i], x++, this._hash)){
				return true; // Boolean
			}
		}
		return false; // Boolean
	}

});

(function(){

	/*=====
	dijit.registry = {
		// summary:
		//		A list of widgets on a page.
		// description:
		//		Is an instance of `dijit.WidgetSet`
	};
	=====*/
	dijit.registry = new dijit.WidgetSet();

	var hash = dijit.registry._hash,
		attr = dojo.attr,
		hasAttr = dojo.hasAttr,
		style = dojo.style;

	dijit.byId = function(/*String|dijit._Widget*/ id){
		// summary:
		//		Returns a widget by it's id, or if passed a widget, no-op (like dojo.byId())
		return typeof id == "string" ? hash[id] : id; // dijit._Widget
	};

	var _widgetTypeCtr = {};
	dijit.getUniqueId = function(/*String*/widgetType){
		// summary:
		//		Generates a unique id for a given widgetType
	
		var id;
		do{
			id = widgetType + "_" +
				(widgetType in _widgetTypeCtr ?
					++_widgetTypeCtr[widgetType] : _widgetTypeCtr[widgetType] = 0);
		}while(hash[id]);
		return dijit._scopeName == "dijit" ? id : dijit._scopeName + "_" + id; // String
	};
	
	dijit.findWidgets = function(/*DomNode*/ root){
		// summary:
		//		Search subtree under root returning widgets found.
		//		Doesn't search for nested widgets (ie, widgets inside other widgets).
	
		var outAry = [];
	
		function getChildrenHelper(root){
			for(var node = root.firstChild; node; node = node.nextSibling){
				if(node.nodeType == 1){
					var widgetId = node.getAttribute("widgetId");
					if(widgetId){
						var widget = hash[widgetId];
						if(widget){	// may be null on page w/multiple dojo's loaded
							outAry.push(widget);
						}
					}else{
						getChildrenHelper(node);
					}
				}
			}
		}
	
		getChildrenHelper(root);
		return outAry;
	};
	
	dijit._destroyAll = function(){
		// summary:
		//		Code to destroy all widgets and do other cleanup on page unload
	
		// Clean up focus manager lingering references to widgets and nodes
		dijit._curFocus = null;
		dijit._prevFocus = null;
		dijit._activeStack = [];
	
		// Destroy all the widgets, top down
		dojo.forEach(dijit.findWidgets(dojo.body()), function(widget){
			// Avoid double destroy of widgets like Menu that are attached to <body>
			// even though they are logically children of other widgets.
			if(!widget._destroyed){
				if(widget.destroyRecursive){
					widget.destroyRecursive();
				}else if(widget.destroy){
					widget.destroy();
				}
			}
		});
	};
	
	if(dojo.isIE){
		// Only run _destroyAll() for IE because we think it's only necessary in that case,
		// and because it causes problems on FF.  See bug #3531 for details.
		dojo.addOnWindowUnload(function(){
			dijit._destroyAll();
		});
	}
	
	dijit.byNode = function(/*DOMNode*/ node){
		// summary:
		//		Returns the widget corresponding to the given DOMNode
		return hash[node.getAttribute("widgetId")]; // dijit._Widget
	};
	
	dijit.getEnclosingWidget = function(/*DOMNode*/ node){
		// summary:
		//		Returns the widget whose DOM tree contains the specified DOMNode, or null if
		//		the node is not contained within the DOM tree of any widget
		while(node){
			var id = node.getAttribute && node.getAttribute("widgetId");
			if(id){
				return hash[id];
			}
			node = node.parentNode;
		}
		return null;
	};

	var shown = (dijit._isElementShown = function(/*Element*/ elem){
		var s = style(elem);
		return (s.visibility != "hidden")
			&& (s.visibility != "collapsed")
			&& (s.display != "none")
			&& (attr(elem, "type") != "hidden");
	});
	
	dijit.hasDefaultTabStop = function(/*Element*/ elem){
		// summary:
		//		Tests if element is tab-navigable even without an explicit tabIndex setting
	
		// No explicit tabIndex setting, need to investigate node type
		switch(elem.nodeName.toLowerCase()){
			case "a":
				// An <a> w/out a tabindex is only navigable if it has an href
				return hasAttr(elem, "href");
			case "area":
			case "button":
			case "input":
			case "object":
			case "select":
			case "textarea":
				// These are navigable by default
				return true;
			case "iframe":
				// If it's an editor <iframe> then it's tab navigable.
				var body;
				try{
					// non-IE
					var contentDocument = elem.contentDocument;
					if("designMode" in contentDocument && contentDocument.designMode == "on"){
						return true;
					}
					body = contentDocument.body;
				}catch(e1){
					// contentWindow.document isn't accessible within IE7/8
					// if the iframe.src points to a foreign url and this
					// page contains an element, that could get focus
					try{
						body = elem.contentWindow.document.body;
					}catch(e2){
						return false;
					}
				}
				return body.contentEditable == 'true' || (body.firstChild && body.firstChild.contentEditable == 'true');
			default:
				return elem.contentEditable == 'true';
		}
	};
	
	var isTabNavigable = (dijit.isTabNavigable = function(/*Element*/ elem){
		// summary:
		//		Tests if an element is tab-navigable
	
		// TODO: convert (and rename method) to return effective tabIndex; will save time in _getTabNavigable()
		if(attr(elem, "disabled")){
			return false;
		}else if(hasAttr(elem, "tabIndex")){
			// Explicit tab index setting
			return attr(elem, "tabIndex") >= 0; // boolean
		}else{
			// No explicit tabIndex setting, so depends on node type
			return dijit.hasDefaultTabStop(elem);
		}
	});

	dijit._getTabNavigable = function(/*DOMNode*/ root){
		// summary:
		//		Finds descendants of the specified root node.
		//
		// description:
		//		Finds the following descendants of the specified root node:
		//		* the first tab-navigable element in document order
		//		  without a tabIndex or with tabIndex="0"
		//		* the last tab-navigable element in document order
		//		  without a tabIndex or with tabIndex="0"
		//		* the first element in document order with the lowest
		//		  positive tabIndex value
		//		* the last element in document order with the highest
		//		  positive tabIndex value
		var first, last, lowest, lowestTabindex, highest, highestTabindex, radioSelected = {};
		function radioName(node) {
			// If this element is part of a radio button group, return the name for that group.
			return node && node.tagName.toLowerCase() == "input" &&
				node.type && node.type.toLowerCase() == "radio" &&
				node.name && node.name.toLowerCase();
		}
		var walkTree = function(/*DOMNode*/parent){
			dojo.query("> *", parent).forEach(function(child){
				// Skip hidden elements, and also non-HTML elements (those in custom namespaces) in IE,
				// since show() invokes getAttribute("type"), which crash on VML nodes in IE.
				if((dojo.isIE && child.scopeName!=="HTML") || !shown(child)){
					return;
				}

				if(isTabNavigable(child)){
					var tabindex = attr(child, "tabIndex");
					if(!hasAttr(child, "tabIndex") || tabindex == 0){
						if(!first){ first = child; }
						last = child;
					}else if(tabindex > 0){
						if(!lowest || tabindex < lowestTabindex){
							lowestTabindex = tabindex;
							lowest = child;
						}
						if(!highest || tabindex >= highestTabindex){
							highestTabindex = tabindex;
							highest = child;
						}
					}
					var rn = radioName(child);
					if(dojo.attr(child, "checked") && rn) {
						radioSelected[rn] = child;
					}
				}
				if(child.nodeName.toUpperCase() != 'SELECT'){
					walkTree(child);
				}
			});
		};
		if(shown(root)){ walkTree(root) }
		function rs(node) {
			// substitute checked radio button for unchecked one, if there is a checked one with the same name.
			return radioSelected[radioName(node)] || node;
		}
		return { first: rs(first), last: rs(last), lowest: rs(lowest), highest: rs(highest) };
	}
	dijit.getFirstInTabbingOrder = function(/*String|DOMNode*/ root){
		// summary:
		//		Finds the descendant of the specified root node
		//		that is first in the tabbing order
		var elems = dijit._getTabNavigable(dojo.byId(root));
		return elems.lowest ? elems.lowest : elems.first; // DomNode
	};
	
	dijit.getLastInTabbingOrder = function(/*String|DOMNode*/ root){
		// summary:
		//		Finds the descendant of the specified root node
		//		that is last in the tabbing order
		var elems = dijit._getTabNavigable(dojo.byId(root));
		return elems.last ? elems.last : elems.highest; // DomNode
	};
	
	/*=====
	dojo.mixin(dijit, {
		// defaultDuration: Integer
		//		The default animation speed (in ms) to use for all Dijit
		//		transitional animations, unless otherwise specified
		//		on a per-instance basis. Defaults to 200, overrided by
		//		`djConfig.defaultDuration`
		defaultDuration: 200
	});
	=====*/
	
	dijit.defaultDuration = dojo.config["defaultDuration"] || 200;

})();

}

if(!dojo._hasResource["dojo.Stateful"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojo.Stateful"] = true;
dojo.provide("dojo.Stateful");


dojo.declare("dojo.Stateful", null, {
	// summary:
	//		Base class for objects that provide named properties with optional getter/setter
	//		control and the ability to watch for property changes
	// example:
	//	|	var obj = new dojo.Stateful();
	//	|	obj.watch("foo", function(){
	//	|		console.log("foo changed to " + this.get("foo"));
	//	|	});
	//	|	obj.set("foo","bar");
	postscript: function(mixin){
		if(mixin){
			dojo.mixin(this, mixin);
		}
	},
	
	get: function(/*String*/name){
		// summary:
		//		Get a property on a Stateful instance.
		//	name:
		//		The property to get.
		// description:
		//		Get a named property on a Stateful object. The property may
		//		potentially be retrieved via a getter method in subclasses. In the base class
		// 		this just retrieves the object's property.
		// 		For example:
		//	|	stateful = new dojo.Stateful({foo: 3});
		//	|	stateful.get("foo") // returns 3
		//	|	stateful.foo // returns 3
		
		return this[name];
	},
	set: function(/*String*/name, /*Object*/value){
		// summary:
		//		Set a property on a Stateful instance
		//	name:
		//		The property to set.
		//	value:
		//		The value to set in the property.
		// description:
		//		Sets named properties on a stateful object and notifies any watchers of
		// 		the property. A programmatic setter may be defined in subclasses.
		// 		For example:
		//	|	stateful = new dojo.Stateful();
		//	|	stateful.watch(function(name, oldValue, value){
		//	|		// this will be called on the set below
		//	|	}
		//	|	stateful.set(foo, 5);
		//
		//	set() may also be called with a hash of name/value pairs, ex:
		//	|	myObj.set({
		//	|		foo: "Howdy",
		//	|		bar: 3
		//	|	})
		//	This is equivalent to calling set(foo, "Howdy") and set(bar, 3)
		if(typeof name === "object"){
			for(var x in name){
				this.set(x, name[x]);
			}
			return this;
		}
		var oldValue = this[name];
		this[name] = value;
		if(this._watchCallbacks){
			this._watchCallbacks(name, oldValue, value);
		}
		return this;
	},
	watch: function(/*String?*/name, /*Function*/callback){
		// summary:
		//		Watches a property for changes
		//	name:
		//		Indicates the property to watch. This is optional (the callback may be the
		// 		only parameter), and if omitted, all the properties will be watched
		// returns:
		//		An object handle for the watch. The unwatch method of this object
		// 		can be used to discontinue watching this property:
		//		|	var watchHandle = obj.watch("foo", callback);
		//		|	watchHandle.unwatch(); // callback won't be called now
		//	callback:
		//		The function to execute when the property changes. This will be called after
		//		the property has been changed. The callback will be called with the |this|
		//		set to the instance, the first argument as the name of the property, the
		// 		second argument as the old value and the third argument as the new value.
		
		var callbacks = this._watchCallbacks;
		if(!callbacks){
			var self = this;
			callbacks = this._watchCallbacks = function(name, oldValue, value, ignoreCatchall){
				var notify = function(propertyCallbacks){
					if(propertyCallbacks){
                        propertyCallbacks = propertyCallbacks.slice();
						for(var i = 0, l = propertyCallbacks.length; i < l; i++){
							try{
								propertyCallbacks[i].call(self, name, oldValue, value);
							}catch(e){
								console.error(e);
							}
						}
					}
				};
				notify(callbacks['_' + name]);
				if(!ignoreCatchall){
					notify(callbacks["*"]); // the catch-all
				}
			}; // we use a function instead of an object so it will be ignored by JSON conversion
		}
		if(!callback && typeof name === "function"){
			callback = name;
			name = "*";
		}else{
			// prepend with dash to prevent name conflicts with function (like "name" property)
			name = '_' + name;
		}
		var propertyCallbacks = callbacks[name];
		if(typeof propertyCallbacks !== "object"){
			propertyCallbacks = callbacks[name] = [];
		}
		propertyCallbacks.push(callback);
		return {
			unwatch: function(){
				propertyCallbacks.splice(dojo.indexOf(propertyCallbacks, callback), 1);
			}
		};
	}
	
});

}

if(!dojo._hasResource["dijit._WidgetBase"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dijit._WidgetBase"] = true;
dojo.provide("dijit._WidgetBase");




(function(){

dojo.declare("dijit._WidgetBase", dojo.Stateful, {
	// summary:
	//		Future base class for all Dijit widgets.
	//		_Widget extends this class adding support for various features needed by desktop.

	// id: [const] String
	//		A unique, opaque ID string that can be assigned by users or by the
	//		system. If the developer passes an ID which is known not to be
	//		unique, the specified ID is ignored and the system-generated ID is
	//		used instead.
	id: "",

	// lang: [const] String
	//		Rarely used.  Overrides the default Dojo locale used to render this widget,
	//		as defined by the [HTML LANG](http://www.w3.org/TR/html401/struct/dirlang.html#adef-lang) attribute.
	//		Value must be among the list of locales specified during by the Dojo bootstrap,
	//		formatted according to [RFC 3066](http://www.ietf.org/rfc/rfc3066.txt) (like en-us).
	lang: "",

	// dir: [const] String
	//		Bi-directional support, as defined by the [HTML DIR](http://www.w3.org/TR/html401/struct/dirlang.html#adef-dir)
	//		attribute. Either left-to-right "ltr" or right-to-left "rtl".  If undefined, widgets renders in page's
	//		default direction.
	dir: "",

	// class: String
	//		HTML class attribute
	"class": "",

	// style: String||Object
	//		HTML style attributes as cssText string or name/value hash
	style: "",

	// title: String
	//		HTML title attribute.
	//
	//		For form widgets this specifies a tooltip to display when hovering over
	//		the widget (just like the native HTML title attribute).
	//
	//		For TitlePane or for when this widget is a child of a TabContainer, AccordionContainer,
	//		etc., it's used to specify the tab label, accordion pane title, etc.
	title: "",

	// tooltip: String
	//		When this widget's title attribute is used to for a tab label, accordion pane title, etc.,
	//		this specifies the tooltip to appear when the mouse is hovered over that text.
	tooltip: "",

	// baseClass: [protected] String
	//		Root CSS class of the widget (ex: dijitTextBox), used to construct CSS classes to indicate
	//		widget state.
	baseClass: "",

	// srcNodeRef: [readonly] DomNode
	//		pointer to original DOM node
	srcNodeRef: null,

	// domNode: [readonly] DomNode
	//		This is our visible representation of the widget! Other DOM
	//		Nodes may by assigned to other properties, usually through the
	//		template system's dojoAttachPoint syntax, but the domNode
	//		property is the canonical "top level" node in widget UI.
	domNode: null,

	// containerNode: [readonly] DomNode
	//		Designates where children of the source DOM node will be placed.
	//		"Children" in this case refers to both DOM nodes and widgets.
	//		For example, for myWidget:
	//
	//		|	<div dojoType=myWidget>
	//		|		<b> here's a plain DOM node
	//		|		<span dojoType=subWidget>and a widget</span>
	//		|		<i> and another plain DOM node </i>
	//		|	</div>
	//
	//		containerNode would point to:
	//
	//		|		<b> here's a plain DOM node
	//		|		<span dojoType=subWidget>and a widget</span>
	//		|		<i> and another plain DOM node </i>
	//
	//		In templated widgets, "containerNode" is set via a
	//		dojoAttachPoint assignment.
	//
	//		containerNode must be defined for any widget that accepts innerHTML
	//		(like ContentPane or BorderContainer or even Button), and conversely
	//		is null for widgets that don't, like TextBox.
	containerNode: null,

/*=====
	// _started: Boolean
	//		startup() has completed.
	_started: false,
=====*/

	// attributeMap: [protected] Object
	//		attributeMap sets up a "binding" between attributes (aka properties)
	//		of the widget and the widget's DOM.
	//		Changes to widget attributes listed in attributeMap will be
	//		reflected into the DOM.
	//
	//		For example, calling set('title', 'hello')
	//		on a TitlePane will automatically cause the TitlePane's DOM to update
	//		with the new title.
	//
	//		attributeMap is a hash where the key is an attribute of the widget,
	//		and the value reflects a binding to a:
	//
	//		- DOM node attribute
	// |		focus: {node: "focusNode", type: "attribute"}
	// 		Maps this.focus to this.focusNode.focus
	//
	//		- DOM node innerHTML
	//	|		title: { node: "titleNode", type: "innerHTML" }
	//		Maps this.title to this.titleNode.innerHTML
	//
	//		- DOM node innerText
	//	|		title: { node: "titleNode", type: "innerText" }
	//		Maps this.title to this.titleNode.innerText
	//
	//		- DOM node CSS class
	// |		myClass: { node: "domNode", type: "class" }
	//		Maps this.myClass to this.domNode.className
	//
	//		If the value is an array, then each element in the array matches one of the
	//		formats of the above list.
	//
	//		There are also some shorthands for backwards compatibility:
	//		- string --> { node: string, type: "attribute" }, for example:
	//	|	"focusNode" ---> { node: "focusNode", type: "attribute" }
	//		- "" --> { node: "domNode", type: "attribute" }
	attributeMap: {id:"", dir:"", lang:"", "class":"", style:"", title:""},

	// _blankGif: [protected] String
	//		Path to a blank 1x1 image.
	//		Used by <img> nodes in templates that really get their image via CSS background-image.
	_blankGif: (dojo.config.blankGif || dojo.moduleUrl("dojo", "resources/blank.gif")).toString(),

	//////////// INITIALIZATION METHODS ///////////////////////////////////////

	postscript: function(/*Object?*/params, /*DomNode|String*/srcNodeRef){
		// summary:
		//		Kicks off widget instantiation.  See create() for details.
		// tags:
		//		private
		this.create(params, srcNodeRef);
	},

	create: function(/*Object?*/params, /*DomNode|String?*/srcNodeRef){
		// summary:
		//		Kick off the life-cycle of a widget
		// params:
		//		Hash of initialization parameters for widget, including
		//		scalar values (like title, duration etc.) and functions,
		//		typically callbacks like onClick.
		// srcNodeRef:
		//		If a srcNodeRef (DOM node) is specified:
		//			- use srcNodeRef.innerHTML as my contents
		//			- if this is a behavioral widget then apply behavior
		//			  to that srcNodeRef
		//			- otherwise, replace srcNodeRef with my generated DOM
		//			  tree
		// description:
		//		Create calls a number of widget methods (postMixInProperties, buildRendering, postCreate,
		//		etc.), some of which of you'll want to override. See http://docs.dojocampus.org/dijit/_Widget
		//		for a discussion of the widget creation lifecycle.
		//
		//		Of course, adventurous developers could override create entirely, but this should
		//		only be done as a last resort.
		// tags:
		//		private

		// store pointer to original DOM tree
		this.srcNodeRef = dojo.byId(srcNodeRef);

		// For garbage collection.  An array of handles returned by Widget.connect()
		// Each handle returned from Widget.connect() is an array of handles from dojo.connect()
		this._connects = [];

		// For garbage collection.  An array of handles returned by Widget.subscribe()
		// The handle returned from Widget.subscribe() is the handle returned from dojo.subscribe()
		this._subscribes = [];

		// mix in our passed parameters
		if(this.srcNodeRef && (typeof this.srcNodeRef.id == "string")){ this.id = this.srcNodeRef.id; }
		if(params){
			this.params = params;
			dojo._mixin(this, params);
		}
		this.postMixInProperties();

		// generate an id for the widget if one wasn't specified
		// (be sure to do this before buildRendering() because that function might
		// expect the id to be there.)
		if(!this.id){
			this.id = dijit.getUniqueId(this.declaredClass.replace(/\./g,"_"));
		}
		dijit.registry.add(this);

		this.buildRendering();

		if(this.domNode){
			// Copy attributes listed in attributeMap into the [newly created] DOM for the widget.
			// Also calls custom setters for all attributes with custom setters.
			this._applyAttributes();

			// If srcNodeRef was specified, then swap out original srcNode for this widget's DOM tree.
			// For 2.0, move this after postCreate().  postCreate() shouldn't depend on the
			// widget being attached to the DOM since it isn't when a widget is created programmatically like
			// new MyWidget({}).   See #11635.
			var source = this.srcNodeRef;
			if(source && source.parentNode && this.domNode !== source){
				source.parentNode.replaceChild(this.domNode, source);
			}
		}

		if(this.domNode){
			// Note: for 2.0 may want to rename widgetId to dojo._scopeName + "_widgetId",
			// assuming that dojo._scopeName even exists in 2.0
			this.domNode.setAttribute("widgetId", this.id);
		}
		this.postCreate();

		// If srcNodeRef has been processed and removed from the DOM (e.g. TemplatedWidget) then delete it to allow GC.
		if(this.srcNodeRef && !this.srcNodeRef.parentNode){
			delete this.srcNodeRef;
		}

		this._created = true;
	},

	_applyAttributes: function(){
		// summary:
		//		Step during widget creation to copy all widget attributes to the
		//		DOM as per attributeMap and _setXXXAttr functions.
		// description:
		//		Skips over blank/false attribute values, unless they were explicitly specified
		//		as parameters to the widget, since those are the default anyway,
		//		and setting tabIndex="" is different than not setting tabIndex at all.
		//
		//		It processes the attributes in the attribute map first, and then
		//		it goes through and processes the attributes for the _setXXXAttr
		//		functions that have been specified
		// tags:
		//		private
		var condAttrApply = function(attr, scope){
			if((scope.params && attr in scope.params) || scope[attr]){
				scope.set(attr, scope[attr]);
			}
		};

		// Do the attributes in attributeMap
		for(var attr in this.attributeMap){
			condAttrApply(attr, this);
		}

		// And also any attributes with custom setters
		dojo.forEach(this._getSetterAttributes(), function(a){
			if(!(a in this.attributeMap)){
				condAttrApply(a, this);
			}
		}, this);
	},

	_getSetterAttributes: function(){
		// summary:
		//		Returns list of attributes with custom setters for this widget
		var ctor = this.constructor;
		if(!ctor._setterAttrs){
			var r = (ctor._setterAttrs = []),
				attrs,
				proto = ctor.prototype;
			for(var fxName in proto){
				if(dojo.isFunction(proto[fxName]) && (attrs = fxName.match(/^_set([a-zA-Z]*)Attr$/)) && attrs[1]){
					r.push(attrs[1].charAt(0).toLowerCase() + attrs[1].substr(1));
				}
			}
		}
		return ctor._setterAttrs;	// String[]
	},

	postMixInProperties: function(){
		// summary:
		//		Called after the parameters to the widget have been read-in,
		//		but before the widget template is instantiated. Especially
		//		useful to set properties that are referenced in the widget
		//		template.
		// tags:
		//		protected
	},

	buildRendering: function(){
		// summary:
		//		Construct the UI for this widget, setting this.domNode
		// description:
		//		Most widgets will mixin `dijit._Templated`, which implements this
		//		method.
		// tags:
		//		protected

		if(!this.domNode){
			// Create root node if it wasn't created by _Templated
			this.domNode = this.srcNodeRef || dojo.create('div');
		}

		// baseClass is a single class name or occasionally a space-separated list of names.
		// Add those classes to the DOMNode.  If RTL mode then also add with Rtl suffix.
		// TODO: make baseClass custom setter
		if(this.baseClass){
			var classes = this.baseClass.split(" ");
			if(!this.isLeftToRight()){
				classes = classes.concat( dojo.map(classes, function(name){ return name+"Rtl"; }));
			}
			dojo.addClass(this.domNode, classes);
		}
	},

	postCreate: function(){
		// summary:
		//		Processing after the DOM fragment is created
		// description:
		//		Called after the DOM fragment has been created, but not necessarily
		//		added to the document.  Do not include any operations which rely on
		//		node dimensions or placement.
		// tags:
		//		protected
	},

	startup: function(){
		// summary:
		//		Processing after the DOM fragment is added to the document
		// description:
		//		Called after a widget and its children have been created and added to the page,
		//		and all related widgets have finished their create() cycle, up through postCreate().
		//		This is useful for composite widgets that need to control or layout sub-widgets.
		//		Many layout widgets can use this as a wiring phase.
		this._started = true;
	},

	//////////// DESTROY FUNCTIONS ////////////////////////////////

	destroyRecursive: function(/*Boolean?*/ preserveDom){
		// summary:
		// 		Destroy this widget and its descendants
		// description:
		//		This is the generic "destructor" function that all widget users
		// 		should call to cleanly discard with a widget. Once a widget is
		// 		destroyed, it is removed from the manager object.
		// preserveDom:
		//		If true, this method will leave the original DOM structure
		//		alone of descendant Widgets. Note: This will NOT work with
		//		dijit._Templated widgets.

		this._beingDestroyed = true;
		this.destroyDescendants(preserveDom);
		this.destroy(preserveDom);
	},

	destroy: function(/*Boolean*/ preserveDom){
		// summary:
		// 		Destroy this widget, but not its descendants.
		//		This method will, however, destroy internal widgets such as those used within a template.
		// preserveDom: Boolean
		//		If true, this method will leave the original DOM structure alone.
		//		Note: This will not yet work with _Templated widgets

		this._beingDestroyed = true;
		this.uninitialize();
		var d = dojo,
			dfe = d.forEach,
			dun = d.unsubscribe;
		dfe(this._connects, function(array){
			dfe(array, d.disconnect);
		});
		dfe(this._subscribes, function(handle){
			dun(handle);
		});

		// destroy widgets created as part of template, etc.
		dfe(this._supportingWidgets || [], function(w){
			if(w.destroyRecursive){
				w.destroyRecursive();
			}else if(w.destroy){
				w.destroy();
			}
		});

		this.destroyRendering(preserveDom);
		dijit.registry.remove(this.id);
		this._destroyed = true;
	},

	destroyRendering: function(/*Boolean?*/ preserveDom){
		// summary:
		//		Destroys the DOM nodes associated with this widget
		// preserveDom:
		//		If true, this method will leave the original DOM structure alone
		//		during tear-down. Note: this will not work with _Templated
		//		widgets yet.
		// tags:
		//		protected

		if(this.bgIframe){
			this.bgIframe.destroy(preserveDom);
			delete this.bgIframe;
		}

		if(this.domNode){
			if(preserveDom){
				dojo.removeAttr(this.domNode, "widgetId");
			}else{
				dojo.destroy(this.domNode);
			}
			delete this.domNode;
		}

		if(this.srcNodeRef){
			if(!preserveDom){
				dojo.destroy(this.srcNodeRef);
			}
			delete this.srcNodeRef;
		}
	},

	destroyDescendants: function(/*Boolean?*/ preserveDom){
		// summary:
		//		Recursively destroy the children of this widget and their
		//		descendants.
		// preserveDom:
		//		If true, the preserveDom attribute is passed to all descendant
		//		widget's .destroy() method. Not for use with _Templated
		//		widgets.

		// get all direct descendants and destroy them recursively
		dojo.forEach(this.getChildren(), function(widget){
			if(widget.destroyRecursive){
				widget.destroyRecursive(preserveDom);
			}
		});
	},

	uninitialize: function(){
		// summary:
		//		Stub function. Override to implement custom widget tear-down
		//		behavior.
		// tags:
		//		protected
		return false;
	},

	////////////////// GET/SET, CUSTOM SETTERS, ETC. ///////////////////

	_setClassAttr: function(/*String*/ value){
		// summary:
		//		Custom setter for the CSS "class" attribute
		// tags:
		//		protected
		var mapNode = this[this.attributeMap["class"] || 'domNode'];
		dojo.replaceClass(mapNode, value, this["class"]);
		this._set("class", value);
	},

	_setStyleAttr: function(/*String||Object*/ value){
		// summary:
		//		Sets the style attribute of the widget according to value,
		//		which is either a hash like {height: "5px", width: "3px"}
		//		or a plain string
		// description:
		//		Determines which node to set the style on based on style setting
		//		in attributeMap.
		// tags:
		//		protected

		var mapNode = this[this.attributeMap.style || 'domNode'];

		// Note: technically we should revert any style setting made in a previous call
		// to his method, but that's difficult to keep track of.

		if(dojo.isObject(value)){
			dojo.style(mapNode, value);
		}else{
			if(mapNode.style.cssText){
				mapNode.style.cssText += "; " + value;
			}else{
				mapNode.style.cssText = value;
			}
		}

		this._set("style", value);
	},

	_attrToDom: function(/*String*/ attr, /*String*/ value){
		// summary:
		//		Reflect a widget attribute (title, tabIndex, duration etc.) to
		//		the widget DOM, as specified in attributeMap.
		//		Note some attributes like "type"
		//		cannot be processed this way as they are not mutable.
		//
		// tags:
		//		private

		var commands = this.attributeMap[attr];
		dojo.forEach(dojo.isArray(commands) ? commands : [commands], function(command){

			// Get target node and what we are doing to that node
			var mapNode = this[command.node || command || "domNode"];	// DOM node
			var type = command.type || "attribute";	// class, innerHTML, innerText, or attribute

			switch(type){
				case "attribute":
					if(dojo.isFunction(value)){ // functions execute in the context of the widget
						value = dojo.hitch(this, value);
					}

					// Get the name of the DOM node attribute; usually it's the same
					// as the name of the attribute in the widget (attr), but can be overridden.
					// Also maps handler names to lowercase, like onSubmit --> onsubmit
					var attrName = command.attribute ? command.attribute :
						(/^on[A-Z][a-zA-Z]*$/.test(attr) ? attr.toLowerCase() : attr);

					dojo.attr(mapNode, attrName, value);
					break;
				case "innerText":
					mapNode.innerHTML = "";
					mapNode.appendChild(dojo.doc.createTextNode(value));
					break;
				case "innerHTML":
					mapNode.innerHTML = value;
					break;
				case "class":
					dojo.replaceClass(mapNode, value, this[attr]);
					break;
			}
		}, this);
	},

	get: function(name){
		// summary:
		//		Get a property from a widget.
		//	name:
		//		The property to get.
		// description:
		//		Get a named property from a widget. The property may
		//		potentially be retrieved via a getter method. If no getter is defined, this
		// 		just retrieves the object's property.
		// 		For example, if the widget has a properties "foo"
		//		and "bar" and a method named "_getFooAttr", calling:
		//	|	myWidget.get("foo");
		//		would be equivalent to writing:
		//	|	widget._getFooAttr();
		//		and:
		//	|	myWidget.get("bar");
		//		would be equivalent to writing:
		//	|	widget.bar;
		var names = this._getAttrNames(name);
		return this[names.g] ? this[names.g]() : this[name];
	},
	
	set: function(name, value){
		// summary:
		//		Set a property on a widget
		//	name:
		//		The property to set.
		//	value:
		//		The value to set in the property.
		// description:
		//		Sets named properties on a widget which may potentially be handled by a
		// 		setter in the widget.
		// 		For example, if the widget has a properties "foo"
		//		and "bar" and a method named "_setFooAttr", calling:
		//	|	myWidget.set("foo", "Howdy!");
		//		would be equivalent to writing:
		//	|	widget._setFooAttr("Howdy!");
		//		and:
		//	|	myWidget.set("bar", 3);
		//		would be equivalent to writing:
		//	|	widget.bar = 3;
		//
		//	set() may also be called with a hash of name/value pairs, ex:
		//	|	myWidget.set({
		//	|		foo: "Howdy",
		//	|		bar: 3
		//	|	})
		//	This is equivalent to calling set(foo, "Howdy") and set(bar, 3)

		if(typeof name === "object"){
			for(var x in name){
				this.set(x, name[x]);
			}
			return this;
		}
		var names = this._getAttrNames(name);
		if(this[names.s]){
			// use the explicit setter
			var result = this[names.s].apply(this, Array.prototype.slice.call(arguments, 1));
		}else{
			// if param is specified as DOM node attribute, copy it
			if(name in this.attributeMap){
				this._attrToDom(name, value);
			}
			this._set(name, value);
		}
		return result || this;
	},
	
	_attrPairNames: {},		// shared between all widgets
	_getAttrNames: function(name){
		// summary:
		//		Helper function for get() and set().
		//		Caches attribute name values so we don't do the string ops every time.
		// tags:
		//		private

		var apn = this._attrPairNames;
		if(apn[name]){ return apn[name]; }
		var uc = name.charAt(0).toUpperCase() + name.substr(1);
		return (apn[name] = {
			n: name+"Node",
			s: "_set"+uc+"Attr",
			g: "_get"+uc+"Attr"
		});
	},

	_set: function(/*String*/ name, /*anything*/ value){
		// summary:
		//		Helper function to set new value for specified attribute, and call handlers
		//		registered with watch() if the value has changed.
		var oldValue = this[name];
		this[name] = value;
		if(this._watchCallbacks && this._created && value !== oldValue){
			this._watchCallbacks(name, oldValue, value);
		}
	},

	toString: function(){
		// summary:
		//		Returns a string that represents the widget
		// description:
		//		When a widget is cast to a string, this method will be used to generate the
		//		output. Currently, it does not implement any sort of reversible
		//		serialization.
		return '[Widget ' + this.declaredClass + ', ' + (this.id || 'NO ID') + ']'; // String
	},

	getDescendants: function(){
		// summary:
		//		Returns all the widgets contained by this, i.e., all widgets underneath this.containerNode.
		//		This method should generally be avoided as it returns widgets declared in templates, which are
		//		supposed to be internal/hidden, but it's left here for back-compat reasons.

		return this.containerNode ? dojo.query('[widgetId]', this.containerNode).map(dijit.byNode) : []; // dijit._Widget[]
	},

	getChildren: function(){
		// summary:
		//		Returns all the widgets contained by this, i.e., all widgets underneath this.containerNode.
		//		Does not return nested widgets, nor widgets that are part of this widget's template.
		return this.containerNode ? dijit.findWidgets(this.containerNode) : []; // dijit._Widget[]
	},

	connect: function(
			/*Object|null*/ obj,
			/*String|Function*/ event,
			/*String|Function*/ method){
		// summary:
		//		Connects specified obj/event to specified method of this object
		//		and registers for disconnect() on widget destroy.
		// description:
		//		Provide widget-specific analog to dojo.connect, except with the
		//		implicit use of this widget as the target object.
		//		Events connected with `this.connect` are disconnected upon
		//		destruction.
		// returns:
		//		A handle that can be passed to `disconnect` in order to disconnect before
		//		the widget is destroyed.
		// example:
		//	|	var btn = new dijit.form.Button();
		//	|	// when foo.bar() is called, call the listener we're going to
		//	|	// provide in the scope of btn
		//	|	btn.connect(foo, "bar", function(){
		//	|		console.debug(this.toString());
		//	|	});
		// tags:
		//		protected

		var handles = [dojo._connect(obj, event, this, method)];
		this._connects.push(handles);
		return handles;		// _Widget.Handle
	},

	disconnect: function(/* _Widget.Handle */ handles){
		// summary:
		//		Disconnects handle created by `connect`.
		//		Also removes handle from this widget's list of connects.
		// tags:
		//		protected
		for(var i=0; i<this._connects.length; i++){
			if(this._connects[i] == handles){
				dojo.forEach(handles, dojo.disconnect);
				this._connects.splice(i, 1);
				return;
			}
		}
	},

	subscribe: function(
			/*String*/ topic,
			/*String|Function*/ method){
		// summary:
		//		Subscribes to the specified topic and calls the specified method
		//		of this object and registers for unsubscribe() on widget destroy.
		// description:
		//		Provide widget-specific analog to dojo.subscribe, except with the
		//		implicit use of this widget as the target object.
		// example:
		//	|	var btn = new dijit.form.Button();
		//	|	// when /my/topic is published, this button changes its label to
		//	|   // be the parameter of the topic.
		//	|	btn.subscribe("/my/topic", function(v){
		//	|		this.set("label", v);
		//	|	});
		var handle = dojo.subscribe(topic, this, method);

		// return handles for Any widget that may need them
		this._subscribes.push(handle);
		return handle;
	},

	unsubscribe: function(/*Object*/ handle){
		// summary:
		//		Unsubscribes handle created by this.subscribe.
		//		Also removes handle from this widget's list of subscriptions
		for(var i=0; i<this._subscribes.length; i++){
			if(this._subscribes[i] == handle){
				dojo.unsubscribe(handle);
				this._subscribes.splice(i, 1);
				return;
			}
		}
	},

	isLeftToRight: function(){
		// summary:
		//		Return this widget's explicit or implicit orientation (true for LTR, false for RTL)
		// tags:
		//		protected
		return this.dir ? (this.dir == "ltr") : dojo._isBodyLtr(); //Boolean
	},

	placeAt: function(/* String|DomNode|_Widget */reference, /* String?|Int? */position){
		// summary:
		//		Place this widget's domNode reference somewhere in the DOM based
		//		on standard dojo.place conventions, or passing a Widget reference that
		//		contains and addChild member.
		//
		// description:
		//		A convenience function provided in all _Widgets, providing a simple
		//		shorthand mechanism to put an existing (or newly created) Widget
		//		somewhere in the dom, and allow chaining.
		//
		// reference:
		//		The String id of a domNode, a domNode reference, or a reference to a Widget posessing
		//		an addChild method.
		//
		// position:
		//		If passed a string or domNode reference, the position argument
		//		accepts a string just as dojo.place does, one of: "first", "last",
		//		"before", or "after".
		//
		//		If passed a _Widget reference, and that widget reference has an ".addChild" method,
		//		it will be called passing this widget instance into that method, supplying the optional
		//		position index passed.
		//
		// returns:
		//		dijit._Widget
		//		Provides a useful return of the newly created dijit._Widget instance so you
		//		can "chain" this function by instantiating, placing, then saving the return value
		//		to a variable.
		//
		// example:
		// | 	// create a Button with no srcNodeRef, and place it in the body:
		// | 	var button = new dijit.form.Button({ label:"click" }).placeAt(dojo.body());
		// | 	// now, 'button' is still the widget reference to the newly created button
		// | 	dojo.connect(button, "onClick", function(e){ console.log('click'); });
		//
		// example:
		// |	// create a button out of a node with id="src" and append it to id="wrapper":
		// | 	var button = new dijit.form.Button({},"src").placeAt("wrapper");
		//
		// example:
		// |	// place a new button as the first element of some div
		// |	var button = new dijit.form.Button({ label:"click" }).placeAt("wrapper","first");
		//
		// example:
		// |	// create a contentpane and add it to a TabContainer
		// |	var tc = dijit.byId("myTabs");
		// |	new dijit.layout.ContentPane({ href:"foo.html", title:"Wow!" }).placeAt(tc)

		if(reference.declaredClass && reference.addChild){
			reference.addChild(this, position);
		}else{
			dojo.place(this.domNode, reference, position);
		}
		return this;
	}
});

})();

}

if(!dojo._hasResource["dijit._base.focus"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dijit._base.focus"] = true;
dojo.provide("dijit._base.focus");




// summary:
//		These functions are used to query or set the focus and selection.
//
//		Also, they trace when widgets become activated/deactivated,
//		so that the widget can fire _onFocus/_onBlur events.
//		"Active" here means something similar to "focused", but
//		"focus" isn't quite the right word because we keep track of
//		a whole stack of "active" widgets.  Example: ComboButton --> Menu -->
//		MenuItem.  The onBlur event for ComboButton doesn't fire due to focusing
//		on the Menu or a MenuItem, since they are considered part of the
//		ComboButton widget.  It only happens when focus is shifted
//		somewhere completely different.

dojo.mixin(dijit, {
	// _curFocus: DomNode
	//		Currently focused item on screen
	_curFocus: null,

	// _prevFocus: DomNode
	//		Previously focused item on screen
	_prevFocus: null,

	isCollapsed: function(){
		// summary:
		//		Returns true if there is no text selected
		return dijit.getBookmark().isCollapsed;
	},

	getBookmark: function(){
		// summary:
		//		Retrieves a bookmark that can be used with moveToBookmark to return to the same range
		var bm, rg, tg, sel = dojo.doc.selection, cf = dijit._curFocus;

		if(dojo.global.getSelection){
			//W3C Range API for selections.
			sel = dojo.global.getSelection();
			if(sel){
				if(sel.isCollapsed){
					tg = cf? cf.tagName : "";
					if(tg){
						//Create a fake rangelike item to restore selections.
						tg = tg.toLowerCase();
						if(tg == "textarea" ||
								(tg == "input" && (!cf.type || cf.type.toLowerCase() == "text"))){
							sel = {
								start: cf.selectionStart,
								end: cf.selectionEnd,
								node: cf,
								pRange: true
							};
							return {isCollapsed: (sel.end <= sel.start), mark: sel}; //Object.
						}
					}
					bm = {isCollapsed:true};
					if(sel.rangeCount){
						bm.mark = sel.getRangeAt(0).cloneRange();
					}
				}else{
					rg = sel.getRangeAt(0);
					bm = {isCollapsed: false, mark: rg.cloneRange()};
				}
			}
		}else if(sel){
			// If the current focus was a input of some sort and no selection, don't bother saving
			// a native bookmark.  This is because it causes issues with dialog/page selection restore.
			// So, we need to create psuedo bookmarks to work with.
			tg = cf ? cf.tagName : "";
			tg = tg.toLowerCase();
			if(cf && tg && (tg == "button" || tg == "textarea" || tg == "input")){
				if(sel.type && sel.type.toLowerCase() == "none"){
					return {
						isCollapsed: true,
						mark: null
					}
				}else{
					rg = sel.createRange();
					return {
						isCollapsed: rg.text && rg.text.length?false:true,
						mark: {
							range: rg,
							pRange: true
						}
					};
				}
			}
			bm = {};

			//'IE' way for selections.
			try{
				// createRange() throws exception when dojo in iframe
				//and nothing selected, see #9632
				rg = sel.createRange();
				bm.isCollapsed = !(sel.type == 'Text' ? rg.htmlText.length : rg.length);
			}catch(e){
				bm.isCollapsed = true;
				return bm;
			}
			if(sel.type.toUpperCase() == 'CONTROL'){
				if(rg.length){
					bm.mark=[];
					var i=0,len=rg.length;
					while(i<len){
						bm.mark.push(rg.item(i++));
					}
				}else{
					bm.isCollapsed = true;
					bm.mark = null;
				}
			}else{
				bm.mark = rg.getBookmark();
			}
		}else{
			console.warn("No idea how to store the current selection for this browser!");
		}
		return bm; // Object
	},

	moveToBookmark: function(/*Object*/bookmark){
		// summary:
		//		Moves current selection to a bookmark
		// bookmark:
		//		This should be a returned object from dijit.getBookmark()

		var _doc = dojo.doc,
			mark = bookmark.mark;
		if(mark){
			if(dojo.global.getSelection){
				//W3C Rangi API (FF, WebKit, Opera, etc)
				var sel = dojo.global.getSelection();
				if(sel && sel.removeAllRanges){
					if(mark.pRange){
						var r = mark;
						var n = r.node;
						n.selectionStart = r.start;
						n.selectionEnd = r.end;
					}else{
						sel.removeAllRanges();
						sel.addRange(mark);
					}
				}else{
					console.warn("No idea how to restore selection for this browser!");
				}
			}else if(_doc.selection && mark){
				//'IE' way.
				var rg;
				if(mark.pRange){
					rg = mark.range;
				}else if(dojo.isArray(mark)){
					rg = _doc.body.createControlRange();
					//rg.addElement does not have call/apply method, so can not call it directly
					//rg is not available in "range.addElement(item)", so can't use that either
					dojo.forEach(mark, function(n){
						rg.addElement(n);
					});
				}else{
					rg = _doc.body.createTextRange();
					rg.moveToBookmark(mark);
				}
				rg.select();
			}
		}
	},

	getFocus: function(/*Widget?*/ menu, /*Window?*/ openedForWindow){
		// summary:
		//		Called as getFocus(), this returns an Object showing the current focus
		//		and selected text.
		//
		//		Called as getFocus(widget), where widget is a (widget representing) a button
		//		that was just pressed, it returns where focus was before that button
		//		was pressed.   (Pressing the button may have either shifted focus to the button,
		//		or removed focus altogether.)   In this case the selected text is not returned,
		//		since it can't be accurately determined.
		//
		// menu: dijit._Widget or {domNode: DomNode} structure
		//		The button that was just pressed.  If focus has disappeared or moved
		//		to this button, returns the previous focus.  In this case the bookmark
		//		information is already lost, and null is returned.
		//
		// openedForWindow:
		//		iframe in which menu was opened
		//
		// returns:
		//		A handle to restore focus/selection, to be passed to `dijit.focus`
		var node = !dijit._curFocus || (menu && dojo.isDescendant(dijit._curFocus, menu.domNode)) ? dijit._prevFocus : dijit._curFocus;
		return {
			node: node,
			bookmark: (node == dijit._curFocus) && dojo.withGlobal(openedForWindow || dojo.global, dijit.getBookmark),
			openedForWindow: openedForWindow
		}; // Object
	},

	focus: function(/*Object || DomNode */ handle){
		// summary:
		//		Sets the focused node and the selection according to argument.
		//		To set focus to an iframe's content, pass in the iframe itself.
		// handle:
		//		object returned by get(), or a DomNode

		if(!handle){ return; }

		var node = "node" in handle ? handle.node : handle,		// because handle is either DomNode or a composite object
			bookmark = handle.bookmark,
			openedForWindow = handle.openedForWindow,
			collapsed = bookmark ? bookmark.isCollapsed : false;

		// Set the focus
		// Note that for iframe's we need to use the <iframe> to follow the parentNode chain,
		// but we need to set focus to iframe.contentWindow
		if(node){
			var focusNode = (node.tagName.toLowerCase() == "iframe") ? node.contentWindow : node;
			if(focusNode && focusNode.focus){
				try{
					// Gecko throws sometimes if setting focus is impossible,
					// node not displayed or something like that
					focusNode.focus();
				}catch(e){/*quiet*/}
			}
			dijit._onFocusNode(node);
		}

		// set the selection
		// do not need to restore if current selection is not empty
		// (use keyboard to select a menu item) or if previous selection was collapsed
		// as it may cause focus shift (Esp in IE).
		if(bookmark && dojo.withGlobal(openedForWindow || dojo.global, dijit.isCollapsed) && !collapsed){
			if(openedForWindow){
				openedForWindow.focus();
			}
			try{
				dojo.withGlobal(openedForWindow || dojo.global, dijit.moveToBookmark, null, [bookmark]);
			}catch(e2){
				/*squelch IE internal error, see http://trac.dojotoolkit.org/ticket/1984 */
			}
		}
	},

	// _activeStack: dijit._Widget[]
	//		List of currently active widgets (focused widget and it's ancestors)
	_activeStack: [],

	registerIframe: function(/*DomNode*/ iframe){
		// summary:
		//		Registers listeners on the specified iframe so that any click
		//		or focus event on that iframe (or anything in it) is reported
		//		as a focus/click event on the <iframe> itself.
		// description:
		//		Currently only used by editor.
		// returns:
		//		Handle to pass to unregisterIframe()
		return dijit.registerWin(iframe.contentWindow, iframe);
	},

	unregisterIframe: function(/*Object*/ handle){
		// summary:
		//		Unregisters listeners on the specified iframe created by registerIframe.
		//		After calling be sure to delete or null out the handle itself.
		// handle:
		//		Handle returned by registerIframe()

		dijit.unregisterWin(handle);
	},

	registerWin: function(/*Window?*/targetWindow, /*DomNode?*/ effectiveNode){
		// summary:
		//		Registers listeners on the specified window (either the main
		//		window or an iframe's window) to detect when the user has clicked somewhere
		//		or focused somewhere.
		// description:
		//		Users should call registerIframe() instead of this method.
		// targetWindow:
		//		If specified this is the window associated with the iframe,
		//		i.e. iframe.contentWindow.
		// effectiveNode:
		//		If specified, report any focus events inside targetWindow as
		//		an event on effectiveNode, rather than on evt.target.
		// returns:
		//		Handle to pass to unregisterWin()

		// TODO: make this function private in 2.0; Editor/users should call registerIframe(),

		var mousedownListener = function(evt){
			dijit._justMouseDowned = true;
			setTimeout(function(){ dijit._justMouseDowned = false; }, 0);
			
			// workaround weird IE bug where the click is on an orphaned node
			// (first time clicking a Select/DropDownButton inside a TooltipDialog)
			if(dojo.isIE && evt && evt.srcElement && evt.srcElement.parentNode == null){
				return;
			}

			dijit._onTouchNode(effectiveNode || evt.target || evt.srcElement, "mouse");
		};
		//dojo.connect(targetWindow, "onscroll", ???);

		// Listen for blur and focus events on targetWindow's document.
		// IIRC, I'm using attachEvent() rather than dojo.connect() because focus/blur events don't bubble
		// through dojo.connect(), and also maybe to catch the focus events early, before onfocus handlers
		// fire.
		// Connect to <html> (rather than document) on IE to avoid memory leaks, but document on other browsers because
		// (at least for FF) the focus event doesn't fire on <html> or <body>.
		var doc = dojo.isIE ? targetWindow.document.documentElement : targetWindow.document;
		if(doc){
			if(dojo.isIE){
				targetWindow.document.body.attachEvent('onmousedown', mousedownListener);
				var activateListener = function(evt){
					// IE reports that nodes like <body> have gotten focus, even though they have tabIndex=-1,
					// Should consider those more like a mouse-click than a focus....
					if(evt.srcElement.tagName.toLowerCase() != "#document" &&
						dijit.isTabNavigable(evt.srcElement)){
						dijit._onFocusNode(effectiveNode || evt.srcElement);
					}else{
						dijit._onTouchNode(effectiveNode || evt.srcElement);
					}
				};
				doc.attachEvent('onactivate', activateListener);
				var deactivateListener =  function(evt){
					dijit._onBlurNode(effectiveNode || evt.srcElement);
				};
				doc.attachEvent('ondeactivate', deactivateListener);

				return function(){
					targetWindow.document.detachEvent('onmousedown', mousedownListener);
					doc.detachEvent('onactivate', activateListener);
					doc.detachEvent('ondeactivate', deactivateListener);
					doc = null;	// prevent memory leak (apparent circular reference via closure)
				};
			}else{
				doc.body.addEventListener('mousedown', mousedownListener, true);
				var focusListener = function(evt){
					dijit._onFocusNode(effectiveNode || evt.target);
				};
				doc.addEventListener('focus', focusListener, true);
				var blurListener = function(evt){
					dijit._onBlurNode(effectiveNode || evt.target);
				};
				doc.addEventListener('blur', blurListener, true);

				return function(){
					doc.body.removeEventListener('mousedown', mousedownListener, true);
					doc.removeEventListener('focus', focusListener, true);
					doc.removeEventListener('blur', blurListener, true);
					doc = null;	// prevent memory leak (apparent circular reference via closure)
				};
			}
		}
	},

	unregisterWin: function(/*Handle*/ handle){
		// summary:
		//		Unregisters listeners on the specified window (either the main
		//		window or an iframe's window) according to handle returned from registerWin().
		//		After calling be sure to delete or null out the handle itself.

		// Currently our handle is actually a function
		handle && handle();
	},

	_onBlurNode: function(/*DomNode*/ node){
		// summary:
		// 		Called when focus leaves a node.
		//		Usually ignored, _unless_ it *isn't* follwed by touching another node,
		//		which indicates that we tabbed off the last field on the page,
		//		in which case every widget is marked inactive
		dijit._prevFocus = dijit._curFocus;
		dijit._curFocus = null;

		if(dijit._justMouseDowned){
			// the mouse down caused a new widget to be marked as active; this blur event
			// is coming late, so ignore it.
			return;
		}

		// if the blur event isn't followed by a focus event then mark all widgets as inactive.
		if(dijit._clearActiveWidgetsTimer){
			clearTimeout(dijit._clearActiveWidgetsTimer);
		}
		dijit._clearActiveWidgetsTimer = setTimeout(function(){
			delete dijit._clearActiveWidgetsTimer;
			dijit._setStack([]);
			dijit._prevFocus = null;
		}, 100);
	},

	_onTouchNode: function(/*DomNode*/ node, /*String*/ by){
		// summary:
		//		Callback when node is focused or mouse-downed
		// node:
		//		The node that was touched.
		// by:
		//		"mouse" if the focus/touch was caused by a mouse down event

		// ignore the recent blurNode event
		if(dijit._clearActiveWidgetsTimer){
			clearTimeout(dijit._clearActiveWidgetsTimer);
			delete dijit._clearActiveWidgetsTimer;
		}

		// compute stack of active widgets (ex: ComboButton --> Menu --> MenuItem)
		var newStack=[];
		try{
			while(node){
				var popupParent = dojo.attr(node, "dijitPopupParent");
				if(popupParent){
					node=dijit.byId(popupParent).domNode;
				}else if(node.tagName && node.tagName.toLowerCase() == "body"){
					// is this the root of the document or just the root of an iframe?
					if(node === dojo.body()){
						// node is the root of the main document
						break;
					}
					// otherwise, find the iframe this node refers to (can't access it via parentNode,
					// need to do this trick instead). window.frameElement is supported in IE/FF/Webkit
					node=dojo.window.get(node.ownerDocument).frameElement;
				}else{
					// if this node is the root node of a widget, then add widget id to stack,
					// except ignore clicks on disabled widgets (actually focusing a disabled widget still works,
					// to support MenuItem)
					var id = node.getAttribute && node.getAttribute("widgetId"),
						widget = id && dijit.byId(id);
					if(widget && !(by == "mouse" && widget.get("disabled"))){
						newStack.unshift(id);
					}
					node=node.parentNode;
				}
			}
		}catch(e){ /* squelch */ }

		dijit._setStack(newStack, by);
	},

	_onFocusNode: function(/*DomNode*/ node){
		// summary:
		//		Callback when node is focused

		if(!node){
			return;
		}

		if(node.nodeType == 9){
			// Ignore focus events on the document itself.  This is here so that
			// (for example) clicking the up/down arrows of a spinner
			// (which don't get focus) won't cause that widget to blur. (FF issue)
			return;
		}

		dijit._onTouchNode(node);

		if(node == dijit._curFocus){ return; }
		if(dijit._curFocus){
			dijit._prevFocus = dijit._curFocus;
		}
		dijit._curFocus = node;
		dojo.publish("focusNode", [node]);
	},

	_setStack: function(/*String[]*/ newStack, /*String*/ by){
		// summary:
		//		The stack of active widgets has changed.  Send out appropriate events and records new stack.
		// newStack:
		//		array of widget id's, starting from the top (outermost) widget
		// by:
		//		"mouse" if the focus/touch was caused by a mouse down event

		var oldStack = dijit._activeStack;
		dijit._activeStack = newStack;

		// compare old stack to new stack to see how many elements they have in common
		for(var nCommon=0; nCommon<Math.min(oldStack.length, newStack.length); nCommon++){
			if(oldStack[nCommon] != newStack[nCommon]){
				break;
			}
		}

		var widget;
		// for all elements that have gone out of focus, send blur event
		for(var i=oldStack.length-1; i>=nCommon; i--){
			widget = dijit.byId(oldStack[i]);
			if(widget){
				widget._focused = false;
				widget.set("focused", false);
				widget._hasBeenBlurred = true;
				if(widget._onBlur){
					widget._onBlur(by);
				}
				dojo.publish("widgetBlur", [widget, by]);
			}
		}

		// for all element that have come into focus, send focus event
		for(i=nCommon; i<newStack.length; i++){
			widget = dijit.byId(newStack[i]);
			if(widget){
				widget._focused = true;
				widget.set("focused", true);
				if(widget._onFocus){
					widget._onFocus(by);
				}
				dojo.publish("widgetFocus", [widget, by]);
			}
		}
	}
});

// register top window and all the iframes it contains
dojo.addOnLoad(function(){
	var handle = dijit.registerWin(window);
	if(dojo.isIE){
		dojo.addOnWindowUnload(function(){
			dijit.unregisterWin(handle);
			handle = null;
		})
	}
});

}

if(!dojo._hasResource["dojo.AdapterRegistry"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojo.AdapterRegistry"] = true;
dojo.provide("dojo.AdapterRegistry");


dojo.AdapterRegistry = function(/*Boolean?*/ returnWrappers){
	//	summary:
	//		A registry to make contextual calling/searching easier.
	//	description:
	//		Objects of this class keep list of arrays in the form [name, check,
	//		wrap, directReturn] that are used to determine what the contextual
	//		result of a set of checked arguments is. All check/wrap functions
	//		in this registry should be of the same arity.
	//	example:
	//	|	// create a new registry
	//	|	var reg = new dojo.AdapterRegistry();
	//	|	reg.register("handleString",
	//	|		dojo.isString,
	//	|		function(str){
	//	|			// do something with the string here
	//	|		}
	//	|	);
	//	|	reg.register("handleArr",
	//	|		dojo.isArray,
	//	|		function(arr){
	//	|			// do something with the array here
	//	|		}
	//	|	);
	//	|
	//	|	// now we can pass reg.match() *either* an array or a string and
	//	|	// the value we pass will get handled by the right function
	//	|	reg.match("someValue"); // will call the first function
	//	|	reg.match(["someValue"]); // will call the second

	this.pairs = [];
	this.returnWrappers = returnWrappers || false; // Boolean
};

dojo.extend(dojo.AdapterRegistry, {
	register: function(/*String*/ name, /*Function*/ check, /*Function*/ wrap, /*Boolean?*/ directReturn, /*Boolean?*/ override){
		//	summary:
		//		register a check function to determine if the wrap function or
		//		object gets selected
		//	name:
		//		a way to identify this matcher.
		//	check:
		//		a function that arguments are passed to from the adapter's
		//		match() function.  The check function should return true if the
		//		given arguments are appropriate for the wrap function.
		//	directReturn:
		//		If directReturn is true, the value passed in for wrap will be
		//		returned instead of being called. Alternately, the
		//		AdapterRegistry can be set globally to "return not call" using
		//		the returnWrappers property. Either way, this behavior allows
		//		the registry to act as a "search" function instead of a
		//		function interception library.
		//	override:
		//		If override is given and true, the check function will be given
		//		highest priority. Otherwise, it will be the lowest priority
		//		adapter.
		this.pairs[((override) ? "unshift" : "push")]([name, check, wrap, directReturn]);
	},

	match: function(/* ... */){
		// summary:
		//		Find an adapter for the given arguments. If no suitable adapter
		//		is found, throws an exception. match() accepts any number of
		//		arguments, all of which are passed to all matching functions
		//		from the registered pairs.
		for(var i = 0; i < this.pairs.length; i++){
			var pair = this.pairs[i];
			if(pair[1].apply(this, arguments)){
				if((pair[3])||(this.returnWrappers)){
					return pair[2];
				}else{
					return pair[2].apply(this, arguments);
				}
			}
		}
		throw new Error("No match found");
	},

	unregister: function(name){
		// summary: Remove a named adapter from the registry

		// FIXME: this is kind of a dumb way to handle this. On a large
		// registry this will be slow-ish and we can use the name as a lookup
		// should we choose to trade memory for speed.
		for(var i = 0; i < this.pairs.length; i++){
			var pair = this.pairs[i];
			if(pair[0] == name){
				this.pairs.splice(i, 1);
				return true;
			}
		}
		return false;
	}
});

}

if(!dojo._hasResource["dijit._base.place"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dijit._base.place"] = true;
dojo.provide("dijit._base.place");




dijit.getViewport = function(){
	// summary:
	//		Returns the dimensions and scroll position of the viewable area of a browser window

	return dojo.window.getBox();
};

/*=====
dijit.__Position = function(){
	// x: Integer
	//		horizontal coordinate in pixels, relative to document body
	// y: Integer
	//		vertical coordinate in pixels, relative to document body

	thix.x = x;
	this.y = y;
}
=====*/


dijit.placeOnScreen = function(
	/* DomNode */			node,
	/* dijit.__Position */	pos,
	/* String[] */			corners,
	/* dijit.__Position? */	padding){
	// summary:
	//		Positions one of the node's corners at specified position
	//		such that node is fully visible in viewport.
	// description:
	//		NOTE: node is assumed to be absolutely or relatively positioned.
	//	pos:
	//		Object like {x: 10, y: 20}
	//	corners:
	//		Array of Strings representing order to try corners in, like ["TR", "BL"].
	//		Possible values are:
	//			* "BL" - bottom left
	//			* "BR" - bottom right
	//			* "TL" - top left
	//			* "TR" - top right
	//	padding:
	//		set padding to put some buffer around the element you want to position.
	// example:
	//		Try to place node's top right corner at (10,20).
	//		If that makes node go (partially) off screen, then try placing
	//		bottom left corner at (10,20).
	//	|	placeOnScreen(node, {x: 10, y: 20}, ["TR", "BL"])

	var choices = dojo.map(corners, function(corner){
		var c = { corner: corner, pos: {x:pos.x,y:pos.y} };
		if(padding){
			c.pos.x += corner.charAt(1) == 'L' ? padding.x : -padding.x;
			c.pos.y += corner.charAt(0) == 'T' ? padding.y : -padding.y;
		}
		return c;
	});

	return dijit._place(node, choices);
}

dijit._place = function(/*DomNode*/ node, choices, layoutNode, /*Object*/ aroundNodeCoords){
	// summary:
	//		Given a list of spots to put node, put it at the first spot where it fits,
	//		of if it doesn't fit anywhere then the place with the least overflow
	// choices: Array
	//		Array of elements like: {corner: 'TL', pos: {x: 10, y: 20} }
	//		Above example says to put the top-left corner of the node at (10,20)
	// layoutNode: Function(node, aroundNodeCorner, nodeCorner, size)
	//		for things like tooltip, they are displayed differently (and have different dimensions)
	//		based on their orientation relative to the parent.   This adjusts the popup based on orientation.
	//		It also passes in the available size for the popup, which is useful for tooltips to
	//		tell them that their width is limited to a certain amount.   layoutNode() may return a value expressing
	//		how much the popup had to be modified to fit into the available space.   This is used to determine
	//		what the best placement is.
	// aroundNodeCoords: Object
	//		Size of aroundNode, ex: {w: 200, h: 50}

	// get {x: 10, y: 10, w: 100, h:100} type obj representing position of
	// viewport over document
	var view = dojo.window.getBox();

	// This won't work if the node is inside a <div style="position: relative">,
	// so reattach it to dojo.doc.body.   (Otherwise, the positioning will be wrong
	// and also it might get cutoff)
	if(!node.parentNode || String(node.parentNode.tagName).toLowerCase() != "body"){
		dojo.body().appendChild(node);
	}

	var best = null;
	dojo.some(choices, function(choice){
		var corner = choice.corner;
		var pos = choice.pos;
		var overflow = 0;

		// calculate amount of space available given specified position of node
		var spaceAvailable = {
			w: corner.charAt(1) == 'L' ? (view.l + view.w) - pos.x : pos.x - view.l,
			h: corner.charAt(1) == 'T' ? (view.t + view.h) - pos.y : pos.y - view.t
		};

		// configure node to be displayed in given position relative to button
		// (need to do this in order to get an accurate size for the node, because
		// a tooltip's size changes based on position, due to triangle)
		if(layoutNode){
			var res = layoutNode(node, choice.aroundCorner, corner, spaceAvailable, aroundNodeCoords);
			overflow = typeof res == "undefined" ? 0 : res;
		}

		// get node's size
		var style = node.style;
		var oldDisplay = style.display;
		var oldVis = style.visibility;
		style.visibility = "hidden";
		style.display = "";
		var mb = dojo.marginBox(node);
		style.display = oldDisplay;
		style.visibility = oldVis;

		// coordinates and size of node with specified corner placed at pos,
		// and clipped by viewport
		var startX = Math.max(view.l, corner.charAt(1) == 'L' ? pos.x : (pos.x - mb.w)),
			startY = Math.max(view.t, corner.charAt(0) == 'T' ? pos.y : (pos.y - mb.h)),
			endX = Math.min(view.l + view.w, corner.charAt(1) == 'L' ? (startX + mb.w) : pos.x),
			endY = Math.min(view.t + view.h, corner.charAt(0) == 'T' ? (startY + mb.h) : pos.y),
			width = endX - startX,
			height = endY - startY;

		overflow += (mb.w - width) + (mb.h - height);

		if(best == null || overflow < best.overflow){
			best = {
				corner: corner,
				aroundCorner: choice.aroundCorner,
				x: startX,
				y: startY,
				w: width,
				h: height,
				overflow: overflow,
				spaceAvailable: spaceAvailable
			};
		}
		
		return !overflow;
	});

	// In case the best position is not the last one we checked, need to call
	// layoutNode() again.
	if(best.overflow && layoutNode){
		layoutNode(node, best.aroundCorner, best.corner, best.spaceAvailable, aroundNodeCoords);
	}

	// And then position the node.   Do this last, after the layoutNode() above
	// has sized the node, due to browser quirks when the viewport is scrolled
	// (specifically that a Tooltip will shrink to fit as though the window was
	// scrolled to the left).
	//
	// In RTL mode, set style.right rather than style.left so in the common case,
	// window resizes move the popup along with the aroundNode.
	var l = dojo._isBodyLtr(),
		s = node.style;
	s.top = best.y + "px";
	s[l ? "left" : "right"] = (l ? best.x : view.w - best.x - best.w) + "px";
	
	return best;
}

dijit.placeOnScreenAroundNode = function(
	/* DomNode */		node,
	/* DomNode */		aroundNode,
	/* Object */		aroundCorners,
	/* Function? */		layoutNode){

	// summary:
	//		Position node adjacent or kitty-corner to aroundNode
	//		such that it's fully visible in viewport.
	//
	// description:
	//		Place node such that corner of node touches a corner of
	//		aroundNode, and that node is fully visible.
	//
	// aroundCorners:
	//		Ordered list of pairs of corners to try matching up.
	//		Each pair of corners is represented as a key/value in the hash,
	//		where the key corresponds to the aroundNode's corner, and
	//		the value corresponds to the node's corner:
	//
	//	|	{ aroundNodeCorner1: nodeCorner1, aroundNodeCorner2: nodeCorner2, ...}
	//
	//		The following strings are used to represent the four corners:
	//			* "BL" - bottom left
	//			* "BR" - bottom right
	//			* "TL" - top left
	//			* "TR" - top right
	//
	// layoutNode: Function(node, aroundNodeCorner, nodeCorner)
	//		For things like tooltip, they are displayed differently (and have different dimensions)
	//		based on their orientation relative to the parent.   This adjusts the popup based on orientation.
	//
	// example:
	//	|	dijit.placeOnScreenAroundNode(node, aroundNode, {'BL':'TL', 'TR':'BR'});
	//		This will try to position node such that node's top-left corner is at the same position
	//		as the bottom left corner of the aroundNode (ie, put node below
	//		aroundNode, with left edges aligned).  If that fails it will try to put
	// 		the bottom-right corner of node where the top right corner of aroundNode is
	//		(ie, put node above aroundNode, with right edges aligned)
	//

	// get coordinates of aroundNode
	aroundNode = dojo.byId(aroundNode);
	var aroundNodePos = dojo.position(aroundNode, true);

	// place the node around the calculated rectangle
	return dijit._placeOnScreenAroundRect(node,
		aroundNodePos.x, aroundNodePos.y, aroundNodePos.w, aroundNodePos.h,	// rectangle
		aroundCorners, layoutNode);
};

/*=====
dijit.__Rectangle = function(){
	// x: Integer
	//		horizontal offset in pixels, relative to document body
	// y: Integer
	//		vertical offset in pixels, relative to document body
	// width: Integer
	//		width in pixels
	// height: Integer
	//		height in pixels

	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
}
=====*/


dijit.placeOnScreenAroundRectangle = function(
	/* DomNode */			node,
	/* dijit.__Rectangle */	aroundRect,
	/* Object */			aroundCorners,
	/* Function */			layoutNode){

	// summary:
	//		Like dijit.placeOnScreenAroundNode(), except that the "around"
	//		parameter is an arbitrary rectangle on the screen (x, y, width, height)
	//		instead of a dom node.

	return dijit._placeOnScreenAroundRect(node,
		aroundRect.x, aroundRect.y, aroundRect.width, aroundRect.height,	// rectangle
		aroundCorners, layoutNode);
};

dijit._placeOnScreenAroundRect = function(
	/* DomNode */		node,
	/* Number */		x,
	/* Number */		y,
	/* Number */		width,
	/* Number */		height,
	/* Object */		aroundCorners,
	/* Function */		layoutNode){

	// summary:
	//		Like dijit.placeOnScreenAroundNode(), except it accepts coordinates
	//		of a rectangle to place node adjacent to.

	// TODO: combine with placeOnScreenAroundRectangle()

	// Generate list of possible positions for node
	var choices = [];
	for(var nodeCorner in aroundCorners){
		choices.push( {
			aroundCorner: nodeCorner,
			corner: aroundCorners[nodeCorner],
			pos: {
				x: x + (nodeCorner.charAt(1) == 'L' ? 0 : width),
				y: y + (nodeCorner.charAt(0) == 'T' ? 0 : height)
			}
		});
	}

	return dijit._place(node, choices, layoutNode, {w: width, h: height});
};

dijit.placementRegistry= new dojo.AdapterRegistry();
dijit.placementRegistry.register("node",
	function(n, x){
		return typeof x == "object" &&
			typeof x.offsetWidth != "undefined" && typeof x.offsetHeight != "undefined";
	},
	dijit.placeOnScreenAroundNode);
dijit.placementRegistry.register("rect",
	function(n, x){
		return typeof x == "object" &&
			"x" in x && "y" in x && "width" in x && "height" in x;
	},
	dijit.placeOnScreenAroundRectangle);

dijit.placeOnScreenAroundElement = function(
	/* DomNode */		node,
	/* Object */		aroundElement,
	/* Object */		aroundCorners,
	/* Function */		layoutNode){

	// summary:
	//		Like dijit.placeOnScreenAroundNode(), except it accepts an arbitrary object
	//		for the "around" argument and finds a proper processor to place a node.

	return dijit.placementRegistry.match.apply(dijit.placementRegistry, arguments);
};

dijit.getPopupAroundAlignment = function(/*Array*/ position, /*Boolean*/ leftToRight){
	// summary:
	//		Transforms the passed array of preferred positions into a format suitable for passing as the aroundCorners argument to dijit.placeOnScreenAroundElement.
	//
	// position: String[]
	//		This variable controls the position of the drop down.
	//		It's an array of strings with the following values:
	//
	//			* before: places drop down to the left of the target node/widget, or to the right in
	//			  the case of RTL scripts like Hebrew and Arabic
	//			* after: places drop down to the right of the target node/widget, or to the left in
	//			  the case of RTL scripts like Hebrew and Arabic
	//			* above: drop down goes above target node
	//			* below: drop down goes below target node
	//
	//		The list is positions is tried, in order, until a position is found where the drop down fits
	//		within the viewport.
	//
	// leftToRight: Boolean
	//		Whether the popup will be displaying in leftToRight mode.
	//
	var align = {};
	dojo.forEach(position, function(pos){
		switch(pos){
			case "after":
				align[leftToRight ? "BR" : "BL"] = leftToRight ? "BL" : "BR";
				break;
			case "before":
				align[leftToRight ? "BL" : "BR"] = leftToRight ? "BR" : "BL";
				break;
			case "below-alt":
				leftToRight = !leftToRight;
				// fall through
			case "below":
				// first try to align left borders, next try to align right borders (or reverse for RTL mode)
				align[leftToRight ? "BL" : "BR"] = leftToRight ? "TL" : "TR";
				align[leftToRight ? "BR" : "BL"] = leftToRight ? "TR" : "TL";
				break;
			case "above-alt":
				leftToRight = !leftToRight;
				// fall through
			case "above":
			default:
				// first try to align left borders, next try to align right borders (or reverse for RTL mode)
				align[leftToRight ? "TL" : "TR"] = leftToRight ? "BL" : "BR";
				align[leftToRight ? "TR" : "TL"] = leftToRight ? "BR" : "BL";
				break;
		}
	});
	return align;
};

}

if(!dojo._hasResource["dijit._base.window"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dijit._base.window"] = true;
dojo.provide("dijit._base.window");



dijit.getDocumentWindow = function(doc){
	return dojo.window.get(doc);
};

}

if(!dojo._hasResource["dijit._base.popup"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dijit._base.popup"] = true;
dojo.provide("dijit._base.popup");





/*=====
dijit.popup.__OpenArgs = function(){
	// popup: Widget
	//		widget to display
	// parent: Widget
	//		the button etc. that is displaying this popup
	// around: DomNode
	//		DOM node (typically a button); place popup relative to this node.  (Specify this *or* "x" and "y" parameters.)
	// x: Integer
	//		Absolute horizontal position (in pixels) to place node at.  (Specify this *or* "around" parameter.)
	// y: Integer
	//		Absolute vertical position (in pixels) to place node at.  (Specify this *or* "around" parameter.)
	// orient: Object|String
	//		When the around parameter is specified, orient should be an
	//		ordered list of tuples of the form (around-node-corner, popup-node-corner).
	//		dijit.popup.open() tries to position the popup according to each tuple in the list, in order,
	//		until the popup appears fully within the viewport.
	//
	//		The default value is {BL:'TL', TL:'BL'}, which represents a list of two tuples:
	//			1. (BL, TL)
	//			2. (TL, BL)
	//		where BL means "bottom left" and "TL" means "top left".
	//		So by default, it first tries putting the popup below the around node, left-aligning them,
	//		and then tries to put it above the around node, still left-aligning them.   Note that the
	//		default is horizontally reversed when in RTL mode.
	//
	//		When an (x,y) position is specified rather than an around node, orient is either
	//		"R" or "L".  R (for right) means that it tries to put the popup to the right of the mouse,
	//		specifically positioning the popup's top-right corner at the mouse position, and if that doesn't
	//		fit in the viewport, then it tries, in order, the bottom-right corner, the top left corner,
	//		and the top-right corner.
	// onCancel: Function
	//		callback when user has canceled the popup by
	//			1. hitting ESC or
	//			2. by using the popup widget's proprietary cancel mechanism (like a cancel button in a dialog);
	//			   i.e. whenever popupWidget.onCancel() is called, args.onCancel is called
	// onClose: Function
	//		callback whenever this popup is closed
	// onExecute: Function
	//		callback when user "executed" on the popup/sub-popup by selecting a menu choice, etc. (top menu only)
	// padding: dijit.__Position
	//		adding a buffer around the opening position. This is only useful when around is not set.
	this.popup = popup;
	this.parent = parent;
	this.around = around;
	this.x = x;
	this.y = y;
	this.orient = orient;
	this.onCancel = onCancel;
	this.onClose = onClose;
	this.onExecute = onExecute;
	this.padding = padding;
}
=====*/

dijit.popup = {
	// summary:
	//		This singleton is used to show/hide widgets as popups.

	// _stack: dijit._Widget[]
	//		Stack of currently popped up widgets.
	//		(someone opened _stack[0], and then it opened _stack[1], etc.)
	_stack: [],
	
	// _beginZIndex: Number
	//		Z-index of the first popup.   (If first popup opens other
	//		popups they get a higher z-index.)
	_beginZIndex: 1000,

	_idGen: 1,

	_createWrapper: function(/*Widget || DomNode*/ widget){
		// summary:
		//		Initialization for widgets that will be used as popups.
		//		Puts widget inside a wrapper DIV (if not already in one),
		//		and returns pointer to that wrapper DIV.

		var wrapper = widget.declaredClass ? widget._popupWrapper : (widget.parentNode && dojo.hasClass(widget.parentNode, "dijitPopup")),
			node = widget.domNode || widget;

		if(!wrapper){
			// Create wrapper <div> for when this widget [in the future] will be used as a popup.
			// This is done early because of IE bugs where creating/moving DOM nodes causes focus
			// to go wonky, see tests/robot/Toolbar.html to reproduce
			wrapper = dojo.create("div",{
				"class":"dijitPopup",
				style:{ display: "none"},
				role: "presentation"
			}, dojo.body());
			wrapper.appendChild(node);

			var s = node.style;
			s.display = "";
			s.visibility = "";
			s.position = "";
			s.top = "0px";

			if(widget.declaredClass){		// TODO: in 2.0 change signature to always take widget, then remove if()
				widget._popupWrapper = wrapper;
				dojo.connect(widget, "destroy", function(){
					dojo.destroy(wrapper);
					delete widget._popupWrapper;
				});
			}
		}
		
		return wrapper;
	},

	moveOffScreen: function(/*Widget || DomNode*/ widget){
		// summary:
		//		Moves the popup widget off-screen.
		//		Do not use this method to hide popups when not in use, because
		//		that will create an accessibility issue: the offscreen popup is
		//		still in the tabbing order.

		// Create wrapper if not already there
		var wrapper = this._createWrapper(widget);

		dojo.style(wrapper, {
			visibility: "hidden",
			top: "-9999px",		// prevent transient scrollbar causing misalign (#5776), and initial flash in upper left (#10111)
			display: ""
		});
	},

	hide: function(/*dijit._Widget*/ widget){
		// summary:
		//		Hide this popup widget (until it is ready to be shown).
		//		Initialization for widgets that will be used as popups
		//
		// 		Also puts widget inside a wrapper DIV (if not already in one)
		//
		//		If popup widget needs to layout it should
		//		do so when it is made visible, and popup._onShow() is called.

		// Create wrapper if not already there
		var wrapper = this._createWrapper(widget);

		dojo.style(wrapper, "display", "none");
	},
		
	getTopPopup: function(){
		// summary:
		//		Compute the closest ancestor popup that's *not* a child of another popup.
		//		Ex: For a TooltipDialog with a button that spawns a tree of menus, find the popup of the button.
		var stack = this._stack;
		for(var pi=stack.length-1; pi > 0 && stack[pi].parent === stack[pi-1].widget; pi--){
			/* do nothing, just trying to get right value for pi */
		}
		return stack[pi];
	},

	open: function(/*dijit.popup.__OpenArgs*/ args){
		// summary:
		//		Popup the widget at the specified position
		//
		// example:
		//		opening at the mouse position
		//		|		dijit.popup.open({popup: menuWidget, x: evt.pageX, y: evt.pageY});
		//
		// example:
		//		opening the widget as a dropdown
		//		|		dijit.popup.open({parent: this, popup: menuWidget, around: this.domNode, onClose: function(){...}});
		//
		//		Note that whatever widget called dijit.popup.open() should also listen to its own _onBlur callback
		//		(fired from _base/focus.js) to know that focus has moved somewhere else and thus the popup should be closed.

		var stack = this._stack,
			widget = args.popup,
			orient = args.orient || (
				(args.parent ? args.parent.isLeftToRight() : dojo._isBodyLtr()) ?
				{'BL':'TL', 'BR':'TR', 'TL':'BL', 'TR':'BR'} :
				{'BR':'TR', 'BL':'TL', 'TR':'BR', 'TL':'BL'}
			),
			around = args.around,
			id = (args.around && args.around.id) ? (args.around.id+"_dropdown") : ("popup_"+this._idGen++);

		// If we are opening a new popup that isn't a child of a currently opened popup, then
		// close currently opened popup(s).   This should happen automatically when the old popups
		// gets the _onBlur() event, except that the _onBlur() event isn't reliable on IE, see [22198].
		while(stack.length && (!args.parent || !dojo.isDescendant(args.parent.domNode, stack[stack.length-1].widget.domNode))){
			dijit.popup.close(stack[stack.length-1].widget);
		}

		// Get pointer to popup wrapper, and create wrapper if it doesn't exist
		var wrapper = this._createWrapper(widget);


		dojo.attr(wrapper, {
			id: id,
			style: {
				zIndex: this._beginZIndex + stack.length
			},
			"class": "dijitPopup " + (widget.baseClass || widget["class"] || "").split(" ")[0] +"Popup",
			dijitPopupParent: args.parent ? args.parent.id : ""
		});

		if(dojo.isIE || dojo.isMoz){
			if(!widget.bgIframe){
				// setting widget.bgIframe triggers cleanup in _Widget.destroy()
				widget.bgIframe = new dijit.BackgroundIframe(wrapper);
			}
		}

		// position the wrapper node and make it visible
		var best = around ?
			dijit.placeOnScreenAroundElement(wrapper, around, orient, widget.orient ? dojo.hitch(widget, "orient") : null) :
			dijit.placeOnScreen(wrapper, args, orient == 'R' ? ['TR','BR','TL','BL'] : ['TL','BL','TR','BR'], args.padding);

		wrapper.style.display = "";
		wrapper.style.visibility = "visible";
		widget.domNode.style.visibility = "visible";	// counteract effects from _HasDropDown

		var handlers = [];

		// provide default escape and tab key handling
		// (this will work for any widget, not just menu)
		handlers.push(dojo.connect(wrapper, "onkeypress", this, function(evt){
			if(evt.charOrCode == dojo.keys.ESCAPE && args.onCancel){
				dojo.stopEvent(evt);
				args.onCancel();
			}else if(evt.charOrCode === dojo.keys.TAB){
				dojo.stopEvent(evt);
				var topPopup = this.getTopPopup();
				if(topPopup && topPopup.onCancel){
					topPopup.onCancel();
				}
			}
		}));

		// watch for cancel/execute events on the popup and notify the caller
		// (for a menu, "execute" means clicking an item)
		if(widget.onCancel){
			handlers.push(dojo.connect(widget, "onCancel", args.onCancel));
		}

		handlers.push(dojo.connect(widget, widget.onExecute ? "onExecute" : "onChange", this, function(){
			var topPopup = this.getTopPopup();
			if(topPopup && topPopup.onExecute){
				topPopup.onExecute();
			}
		}));

		stack.push({
			widget: widget,
			parent: args.parent,
			onExecute: args.onExecute,
			onCancel: args.onCancel,
 			onClose: args.onClose,
			handlers: handlers
		});

		if(widget.onOpen){
			// TODO: in 2.0 standardize onShow() (used by StackContainer) and onOpen() (used here)
			widget.onOpen(best);
		}

		return best;
	},

	close: function(/*dijit._Widget?*/ popup){
		// summary:
		//		Close specified popup and any popups that it parented.
		//		If no popup is specified, closes all popups.

		var stack = this._stack;

		// Basically work backwards from the top of the stack closing popups
		// until we hit the specified popup, but IIRC there was some issue where closing
		// a popup would cause others to close too.  Thus if we are trying to close B in [A,B,C]
		// closing C might close B indirectly and then the while() condition will run where stack==[A]...
		// so the while condition is constructed defensively.
		while((popup && dojo.some(stack, function(elem){return elem.widget == popup;})) ||
			(!popup && stack.length)){
			var top = stack.pop(),
				widget = top.widget,
				onClose = top.onClose;

			if(widget.onClose){
				// TODO: in 2.0 standardize onHide() (used by StackContainer) and onClose() (used here)
				widget.onClose();
			}
			dojo.forEach(top.handlers, dojo.disconnect);

			// Hide the widget and it's wrapper unless it has already been destroyed in above onClose() etc.
			if(widget && widget.domNode){
				this.hide(widget);
			}
                        
			if(onClose){
				onClose();
			}
		}
	}
};

// TODO: remove dijit._frames, it isn't being used much, since popups never release their
// iframes (see [22236])
dijit._frames = new function(){
	// summary:
	//		cache of iframes

	var queue = [];

	this.pop = function(){
		var iframe;
		if(queue.length){
			iframe = queue.pop();
			iframe.style.display="";
		}else{
			if(dojo.isIE < 9){
				var burl = dojo.config["dojoBlankHtmlUrl"] || (dojo.moduleUrl("dojo", "resources/blank.html")+"") || "javascript:\"\"";
				var html="<iframe src='" + burl + "'"
					+ " style='position: absolute; left: 0px; top: 0px;"
					+ "z-index: -1; filter:Alpha(Opacity=\"0\");'>";
				iframe = dojo.doc.createElement(html);
			}else{
			 	iframe = dojo.create("iframe");
				iframe.src = 'javascript:""';
				iframe.className = "dijitBackgroundIframe";
				dojo.style(iframe, "opacity", 0.1);
			}
			iframe.tabIndex = -1; // Magic to prevent iframe from getting focus on tab keypress - as style didn't work.
			dijit.setWaiRole(iframe,"presentation");
		}
		return iframe;
	};

	this.push = function(iframe){
		iframe.style.display="none";
		queue.push(iframe);
	}
}();


dijit.BackgroundIframe = function(/*DomNode*/ node){
	// summary:
	//		For IE/FF z-index schenanigans. id attribute is required.
	//
	// description:
	//		new dijit.BackgroundIframe(node)
	//			Makes a background iframe as a child of node, that fills
	//			area (and position) of node

	if(!node.id){ throw new Error("no id"); }
	if(dojo.isIE || dojo.isMoz){
		var iframe = (this.iframe = dijit._frames.pop());
		node.appendChild(iframe);
		if(dojo.isIE<7 || dojo.isQuirks){
			this.resize(node);
			this._conn = dojo.connect(node, 'onresize', this, function(){
				this.resize(node);
			});
		}else{
			dojo.style(iframe, {
				width: '100%',
				height: '100%'
			});
		}
	}
};

dojo.extend(dijit.BackgroundIframe, {
	resize: function(node){
		// summary:
		// 		Resize the iframe so it's the same size as node.
		//		Needed on IE6 and IE/quirks because height:100% doesn't work right.
		if(this.iframe){
			dojo.style(this.iframe, {
				width: node.offsetWidth + 'px',
				height: node.offsetHeight + 'px'
			});
		}
	},
	destroy: function(){
		// summary:
		//		destroy the iframe
		if(this._conn){
			dojo.disconnect(this._conn);
			this._conn = null;
		}
		if(this.iframe){
			dijit._frames.push(this.iframe);
			delete this.iframe;
		}
	}
});

}

if(!dojo._hasResource["dijit._base.scroll"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dijit._base.scroll"] = true;
dojo.provide("dijit._base.scroll");



dijit.scrollIntoView = function(/*DomNode*/ node, /*Object?*/ pos){
	// summary:
	//		Scroll the passed node into view, if it is not already.
	//		Deprecated, use `dojo.window.scrollIntoView` instead.
	
	dojo.window.scrollIntoView(node, pos);
};

}

if(!dojo._hasResource["dojo.uacss"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojo.uacss"] = true;
dojo.provide("dojo.uacss");


(function(){
	// summary:
	//		Applies pre-set CSS classes to the top-level HTML node, based on:
	// 			- browser (ex: dj_ie)
	//			- browser version (ex: dj_ie6)
	//			- box model (ex: dj_contentBox)
	//			- text direction (ex: dijitRtl)
	//
	//		In addition, browser, browser version, and box model are
	//		combined with an RTL flag when browser text is RTL.  ex: dj_ie-rtl.

	var d = dojo,
		html = d.doc.documentElement,
		ie = d.isIE,
		opera = d.isOpera,
		maj = Math.floor,
		ff = d.isFF,
		boxModel = d.boxModel.replace(/-/,''),

		classes = {
			dj_ie: ie,
			dj_ie6: maj(ie) == 6,
			dj_ie7: maj(ie) == 7,
			dj_ie8: maj(ie) == 8,
			dj_ie9: maj(ie) == 9,
			dj_quirks: d.isQuirks,
			dj_iequirks: ie && d.isQuirks,

			// NOTE: Opera not supported by dijit
			dj_opera: opera,

			dj_khtml: d.isKhtml,

			dj_webkit: d.isWebKit,
			dj_safari: d.isSafari,
			dj_chrome: d.isChrome,

			dj_gecko: d.isMozilla,
			dj_ff3: maj(ff) == 3
		}; // no dojo unsupported browsers

	classes["dj_" + boxModel] = true;

	// apply browser, browser version, and box model class names
	var classStr = "";
	for(var clz in classes){
		if(classes[clz]){
			classStr += clz + " ";
		}
	}
	html.className = d.trim(html.className + " " + classStr);

	// If RTL mode, then add dj_rtl flag plus repeat existing classes with -rtl extension.
	// We can't run the code below until the <body> tag has loaded (so we can check for dir=rtl).
	// Unshift() is to run sniff code before the parser.
	dojo._loaders.unshift(function(){
		if(!dojo._isBodyLtr()){
			var rtlClassStr = "dj_rtl dijitRtl " + classStr.replace(/ /g, "-rtl ")
			html.className = d.trim(html.className + " " + rtlClassStr);
		}
	});
})();

}

if(!dojo._hasResource["dijit._base.sniff"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dijit._base.sniff"] = true;
dojo.provide("dijit._base.sniff");



// summary:
//		Applies pre-set CSS classes to the top-level HTML node, see
//		`dojo.uacss` for details.
//
//		Simply doing a require on this module will
//		establish this CSS.  Modified version of Morris' CSS hack.

}

if(!dojo._hasResource["dijit._base.typematic"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dijit._base.typematic"] = true;
dojo.provide("dijit._base.typematic");


dijit.typematic = {
	// summary:
	//		These functions are used to repetitively call a user specified callback
	//		method when a specific key or mouse click over a specific DOM node is
	//		held down for a specific amount of time.
	//		Only 1 such event is allowed to occur on the browser page at 1 time.

	_fireEventAndReload: function(){
		this._timer = null;
		this._callback(++this._count, this._node, this._evt);
		
		// Schedule next event, timer is at most minDelay (default 10ms) to avoid
		// browser overload (particularly avoiding starving DOH robot so it never gets to send a mouseup)
		this._currentTimeout = Math.max(
			this._currentTimeout < 0 ? this._initialDelay :
				(this._subsequentDelay > 1 ? this._subsequentDelay : Math.round(this._currentTimeout * this._subsequentDelay)),
			this._minDelay);
		this._timer = setTimeout(dojo.hitch(this, "_fireEventAndReload"), this._currentTimeout);
	},

	trigger: function(/*Event*/ evt, /*Object*/ _this, /*DOMNode*/ node, /*Function*/ callback, /*Object*/ obj, /*Number*/ subsequentDelay, /*Number*/ initialDelay, /*Number?*/ minDelay){
		// summary:
		//		Start a timed, repeating callback sequence.
		//		If already started, the function call is ignored.
		//		This method is not normally called by the user but can be
		//		when the normal listener code is insufficient.
		// evt:
		//		key or mouse event object to pass to the user callback
		// _this:
		//		pointer to the user's widget space.
		// node:
		//		the DOM node object to pass the the callback function
		// callback:
		//		function to call until the sequence is stopped called with 3 parameters:
		// count:
		//		integer representing number of repeated calls (0..n) with -1 indicating the iteration has stopped
		// node:
		//		the DOM node object passed in
		// evt:
		//		key or mouse event object
		// obj:
		//		user space object used to uniquely identify each typematic sequence
		// subsequentDelay (optional):
		//		if > 1, the number of milliseconds until the 3->n events occur
		//		or else the fractional time multiplier for the next event's delay, default=0.9
		// initialDelay (optional):
		//		the number of milliseconds until the 2nd event occurs, default=500ms
		// minDelay (optional):
		//		the maximum delay in milliseconds for event to fire, default=10ms
		if(obj != this._obj){
			this.stop();
			this._initialDelay = initialDelay || 500;
			this._subsequentDelay = subsequentDelay || 0.90;
			this._minDelay = minDelay || 10;
			this._obj = obj;
			this._evt = evt;
			this._node = node;
			this._currentTimeout = -1;
			this._count = -1;
			this._callback = dojo.hitch(_this, callback);
			this._fireEventAndReload();
			this._evt = dojo.mixin({faux: true}, evt);
		}
	},

	stop: function(){
		// summary:
		//		Stop an ongoing timed, repeating callback sequence.
		if(this._timer){
			clearTimeout(this._timer);
			this._timer = null;
		}
		if(this._obj){
			this._callback(-1, this._node, this._evt);
			this._obj = null;
		}
	},

	addKeyListener: function(/*DOMNode*/ node, /*Object*/ keyObject, /*Object*/ _this, /*Function*/ callback, /*Number*/ subsequentDelay, /*Number*/ initialDelay, /*Number?*/ minDelay){
		// summary:
		//		Start listening for a specific typematic key.
		//		See also the trigger method for other parameters.
		// keyObject:
		//		an object defining the key to listen for:
		// 		charOrCode:
		//			the printable character (string) or keyCode (number) to listen for.
		// 		keyCode:
		//			(deprecated - use charOrCode) the keyCode (number) to listen for (implies charCode = 0).
		// 		charCode:
		//			(deprecated - use charOrCode) the charCode (number) to listen for.
		// 		ctrlKey:
		//			desired ctrl key state to initiate the callback sequence:
		//			- pressed (true)
		//			- released (false)
		//			- either (unspecified)
		// 		altKey:
		//			same as ctrlKey but for the alt key
		// 		shiftKey:
		//			same as ctrlKey but for the shift key
		// returns:
		//		an array of dojo.connect handles
		if(keyObject.keyCode){
			keyObject.charOrCode = keyObject.keyCode;
			dojo.deprecated("keyCode attribute parameter for dijit.typematic.addKeyListener is deprecated. Use charOrCode instead.", "", "2.0");
		}else if(keyObject.charCode){
			keyObject.charOrCode = String.fromCharCode(keyObject.charCode);
			dojo.deprecated("charCode attribute parameter for dijit.typematic.addKeyListener is deprecated. Use charOrCode instead.", "", "2.0");
		}
		return [
			dojo.connect(node, "onkeypress", this, function(evt){
				if(evt.charOrCode == keyObject.charOrCode &&
				(keyObject.ctrlKey === undefined || keyObject.ctrlKey == evt.ctrlKey) &&
				(keyObject.altKey === undefined || keyObject.altKey == evt.altKey) &&
				(keyObject.metaKey === undefined || keyObject.metaKey == (evt.metaKey || false)) && // IE doesn't even set metaKey
				(keyObject.shiftKey === undefined || keyObject.shiftKey == evt.shiftKey)){
					dojo.stopEvent(evt);
					dijit.typematic.trigger(evt, _this, node, callback, keyObject, subsequentDelay, initialDelay, minDelay);
				}else if(dijit.typematic._obj == keyObject){
					dijit.typematic.stop();
				}
			}),
			dojo.connect(node, "onkeyup", this, function(evt){
				if(dijit.typematic._obj == keyObject){
					dijit.typematic.stop();
				}
			})
		];
	},

	addMouseListener: function(/*DOMNode*/ node, /*Object*/ _this, /*Function*/ callback, /*Number*/ subsequentDelay, /*Number*/ initialDelay, /*Number?*/ minDelay){
		// summary:
		//		Start listening for a typematic mouse click.
		//		See the trigger method for other parameters.
		// returns:
		//		an array of dojo.connect handles
		var dc = dojo.connect;
		return [
			dc(node, "mousedown", this, function(evt){
				dojo.stopEvent(evt);
				dijit.typematic.trigger(evt, _this, node, callback, node, subsequentDelay, initialDelay, minDelay);
			}),
			dc(node, "mouseup", this, function(evt){
				dojo.stopEvent(evt);
				dijit.typematic.stop();
			}),
			dc(node, "mouseout", this, function(evt){
				dojo.stopEvent(evt);
				dijit.typematic.stop();
			}),
			dc(node, "mousemove", this, function(evt){
				evt.preventDefault();
			}),
			dc(node, "dblclick", this, function(evt){
				dojo.stopEvent(evt);
				if(dojo.isIE){
					dijit.typematic.trigger(evt, _this, node, callback, node, subsequentDelay, initialDelay, minDelay);
					setTimeout(dojo.hitch(this, dijit.typematic.stop), 50);
				}
			})
		];
	},

	addListener: function(/*Node*/ mouseNode, /*Node*/ keyNode, /*Object*/ keyObject, /*Object*/ _this, /*Function*/ callback, /*Number*/ subsequentDelay, /*Number*/ initialDelay, /*Number?*/ minDelay){
		// summary:
		//		Start listening for a specific typematic key and mouseclick.
		//		This is a thin wrapper to addKeyListener and addMouseListener.
		//		See the addMouseListener and addKeyListener methods for other parameters.
		// mouseNode:
		//		the DOM node object to listen on for mouse events.
		// keyNode:
		//		the DOM node object to listen on for key events.
		// returns:
		//		an array of dojo.connect handles
		return this.addKeyListener(keyNode, keyObject, _this, callback, subsequentDelay, initialDelay, minDelay).concat(
			this.addMouseListener(mouseNode, _this, callback, subsequentDelay, initialDelay, minDelay));
	}
};

}

if(!dojo._hasResource["dijit._base.wai"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dijit._base.wai"] = true;
dojo.provide("dijit._base.wai");


dijit.wai = {
	onload: function(){
		// summary:
		//		Detects if we are in high-contrast mode or not

		// This must be a named function and not an anonymous
		// function, so that the widget parsing code can make sure it
		// registers its onload function after this function.
		// DO NOT USE "this" within this function.

		// create div for testing if high contrast mode is on or images are turned off
		var div = dojo.create("div",{
			id: "a11yTestNode",
			style:{
				cssText:'border: 1px solid;'
					+ 'border-color:red green;'
					+ 'position: absolute;'
					+ 'height: 5px;'
					+ 'top: -999px;'
					+ 'background-image: url("' + (dojo.config.blankGif || dojo.moduleUrl("dojo", "resources/blank.gif")) + '");'
			}
		}, dojo.body());

		// test it
		var cs = dojo.getComputedStyle(div);
		if(cs){
			var bkImg = cs.backgroundImage;
			var needsA11y = (cs.borderTopColor == cs.borderRightColor) || (bkImg != null && (bkImg == "none" || bkImg == "url(invalid-url:)" ));
			dojo[needsA11y ? "addClass" : "removeClass"](dojo.body(), "dijit_a11y");
			if(dojo.isIE){
				div.outerHTML = "";		// prevent mixed-content warning, see http://support.microsoft.com/kb/925014
			}else{
				dojo.body().removeChild(div);
			}
		}
	}
};

// Test if computer is in high contrast mode.
// Make sure the a11y test runs first, before widgets are instantiated.
if(dojo.isIE || dojo.isMoz){	// NOTE: checking in Safari messes things up
	dojo._loaders.unshift(dijit.wai.onload);
}

dojo.mixin(dijit, {
	hasWaiRole: function(/*Element*/ elem, /*String?*/ role){
		// summary:
		//		Determines if an element has a particular role.
		// returns:
		//		True if elem has the specific role attribute and false if not.
		// 		For backwards compatibility if role parameter not provided,
		// 		returns true if has a role
		var waiRole = this.getWaiRole(elem);
		return role ? (waiRole.indexOf(role) > -1) : (waiRole.length > 0);
	},

	getWaiRole: function(/*Element*/ elem){
		// summary:
		//		Gets the role for an element (which should be a wai role).
		// returns:
		//		The role of elem or an empty string if elem
		//		does not have a role.
		 return dojo.trim((dojo.attr(elem, "role") || "").replace("wairole:",""));
	},

	setWaiRole: function(/*Element*/ elem, /*String*/ role){
		// summary:
		//		Sets the role on an element.
		// description:
		//		Replace existing role attribute with new role.

			dojo.attr(elem, "role", role);
	},

	removeWaiRole: function(/*Element*/ elem, /*String*/ role){
		// summary:
		//		Removes the specified role from an element.
		// 		Removes role attribute if no specific role provided (for backwards compat.)

		var roleValue = dojo.attr(elem, "role");
		if(!roleValue){ return; }
		if(role){
			var t = dojo.trim((" " + roleValue + " ").replace(" " + role + " ", " "));
			dojo.attr(elem, "role", t);
		}else{
			elem.removeAttribute("role");
		}
	},

	hasWaiState: function(/*Element*/ elem, /*String*/ state){
		// summary:
		//		Determines if an element has a given state.
		// description:
		//		Checks for an attribute called "aria-"+state.
		// returns:
		//		true if elem has a value for the given state and
		//		false if it does not.

		return elem.hasAttribute ? elem.hasAttribute("aria-"+state) : !!elem.getAttribute("aria-"+state);
	},

	getWaiState: function(/*Element*/ elem, /*String*/ state){
		// summary:
		//		Gets the value of a state on an element.
		// description:
		//		Checks for an attribute called "aria-"+state.
		// returns:
		//		The value of the requested state on elem
		//		or an empty string if elem has no value for state.

		return elem.getAttribute("aria-"+state) || "";
	},

	setWaiState: function(/*Element*/ elem, /*String*/ state, /*String*/ value){
		// summary:
		//		Sets a state on an element.
		// description:
		//		Sets an attribute called "aria-"+state.

		elem.setAttribute("aria-"+state, value);
	},

	removeWaiState: function(/*Element*/ elem, /*String*/ state){
		// summary:
		//		Removes a state from an element.
		// description:
		//		Sets an attribute called "aria-"+state.

		elem.removeAttribute("aria-"+state);
	}
});

}

if(!dojo._hasResource["dijit._base"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dijit._base"] = true;
dojo.provide("dijit._base");












}

if(!dojo._hasResource["dijit._Widget"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dijit._Widget"] = true;
dojo.provide("dijit._Widget");





////////////////// DEFERRED CONNECTS ///////////////////

// This code is to assist deferring dojo.connect() calls in widgets (connecting to events on the widgets'
// DOM nodes) until someone actually needs to monitor that event.
dojo.connect(dojo, "_connect",
	function(/*dijit._Widget*/ widget, /*String*/ event){
		if(widget && dojo.isFunction(widget._onConnect)){
			widget._onConnect(event);
		}
	});

dijit._connectOnUseEventHandler = function(/*Event*/ event){};

////////////////// ONDIJITCLICK SUPPORT ///////////////////

// Keep track of where the last keydown event was, to help avoid generating
// spurious ondijitclick events when:
// 1. focus is on a <button> or <a>
// 2. user presses then releases the ENTER key
// 3. onclick handler fires and shifts focus to another node, with an ondijitclick handler
// 4. onkeyup event fires, causing the ondijitclick handler to fire
dijit._lastKeyDownNode = null;
if(dojo.isIE){
	(function(){
		var keydownCallback = function(evt){
			dijit._lastKeyDownNode = evt.srcElement;
		};
		dojo.doc.attachEvent('onkeydown', keydownCallback);
		dojo.addOnWindowUnload(function(){
			dojo.doc.detachEvent('onkeydown', keydownCallback);
		});
	})();
}else{
	dojo.doc.addEventListener('keydown', function(evt){
		dijit._lastKeyDownNode = evt.target;
	}, true);
}

(function(){

dojo.declare("dijit._Widget", dijit._WidgetBase, {
	// summary:
	//		Base class for all Dijit widgets.
	//
	//		Extends _WidgetBase, adding support for:
	//			- deferred connections
	//				A call like dojo.connect(myWidget, "onMouseMove", func)
	//				will essentially do a dojo.connect(myWidget.domNode, "onMouseMove", func)
	//			- ondijitclick
	//				Support new dojoAttachEvent="ondijitclick: ..." that is triggered by a mouse click or a SPACE/ENTER keypress
	//			- focus related functions
	//				In particular, the onFocus()/onBlur() callbacks.   Driven internally by
	//				dijit/_base/focus.js.
	//			- deprecated methods
	//			- onShow(), onHide(), onClose()
	//
	//		Also, by loading code in dijit/_base, turns on:
	//			- browser sniffing (putting browser id like .dj_ie on <html> node)
	//			- high contrast mode sniffing (add .dijit_a11y class to <body> if machine is in high contrast mode)
	

	////////////////// DEFERRED CONNECTS ///////////////////

	// _deferredConnects: [protected] Object
	//		attributeMap addendum for event handlers that should be connected only on first use
	_deferredConnects: {
		onClick: "",
		onDblClick: "",
		onKeyDown: "",
		onKeyPress: "",
		onKeyUp: "",
		onMouseMove: "",
		onMouseDown: "",
		onMouseOut: "",
		onMouseOver: "",
		onMouseLeave: "",
		onMouseEnter: "",
		onMouseUp: ""
	},

	onClick: dijit._connectOnUseEventHandler,
	/*=====
	onClick: function(event){
		// summary:
		//		Connect to this function to receive notifications of mouse click events.
		// event:
		//		mouse Event
		// tags:
		//		callback
	},
	=====*/
	onDblClick: dijit._connectOnUseEventHandler,
	/*=====
	onDblClick: function(event){
		// summary:
		//		Connect to this function to receive notifications of mouse double click events.
		// event:
		//		mouse Event
		// tags:
		//		callback
	},
	=====*/
	onKeyDown: dijit._connectOnUseEventHandler,
	/*=====
	onKeyDown: function(event){
		// summary:
		//		Connect to this function to receive notifications of keys being pressed down.
		// event:
		//		key Event
		// tags:
		//		callback
	},
	=====*/
	onKeyPress: dijit._connectOnUseEventHandler,
	/*=====
	onKeyPress: function(event){
		// summary:
		//		Connect to this function to receive notifications of printable keys being typed.
		// event:
		//		key Event
		// tags:
		//		callback
	},
	=====*/
	onKeyUp: dijit._connectOnUseEventHandler,
	/*=====
	onKeyUp: function(event){
		// summary:
		//		Connect to this function to receive notifications of keys being released.
		// event:
		//		key Event
		// tags:
		//		callback
	},
	=====*/
	onMouseDown: dijit._connectOnUseEventHandler,
	/*=====
	onMouseDown: function(event){
		// summary:
		//		Connect to this function to receive notifications of when the mouse button is pressed down.
		// event:
		//		mouse Event
		// tags:
		//		callback
	},
	=====*/
	onMouseMove: dijit._connectOnUseEventHandler,
	/*=====
	onMouseMove: function(event){
		// summary:
		//		Connect to this function to receive notifications of when the mouse moves over nodes contained within this widget.
		// event:
		//		mouse Event
		// tags:
		//		callback
	},
	=====*/
	onMouseOut: dijit._connectOnUseEventHandler,
	/*=====
	onMouseOut: function(event){
		// summary:
		//		Connect to this function to receive notifications of when the mouse moves off of nodes contained within this widget.
		// event:
		//		mouse Event
		// tags:
		//		callback
	},
	=====*/
	onMouseOver: dijit._connectOnUseEventHandler,
	/*=====
	onMouseOver: function(event){
		// summary:
		//		Connect to this function to receive notifications of when the mouse moves onto nodes contained within this widget.
		// event:
		//		mouse Event
		// tags:
		//		callback
	},
	=====*/
	onMouseLeave: dijit._connectOnUseEventHandler,
	/*=====
	onMouseLeave: function(event){
		// summary:
		//		Connect to this function to receive notifications of when the mouse moves off of this widget.
		// event:
		//		mouse Event
		// tags:
		//		callback
	},
	=====*/
	onMouseEnter: dijit._connectOnUseEventHandler,
	/*=====
	onMouseEnter: function(event){
		// summary:
		//		Connect to this function to receive notifications of when the mouse moves onto this widget.
		// event:
		//		mouse Event
		// tags:
		//		callback
	},
	=====*/
	onMouseUp: dijit._connectOnUseEventHandler,
	/*=====
	onMouseUp: function(event){
		// summary:
		//		Connect to this function to receive notifications of when the mouse button is released.
		// event:
		//		mouse Event
		// tags:
		//		callback
	},
	=====*/

	create: function(/*Object?*/params, /*DomNode|String?*/srcNodeRef){
		// To avoid double-connects, remove entries from _deferredConnects
		// that have been setup manually by a subclass (ex, by dojoAttachEvent).
		// If a subclass has redefined a callback (ex: onClick) then assume it's being
		// connected to manually.
		this._deferredConnects = dojo.clone(this._deferredConnects);
		for(var attr in this.attributeMap){
			delete this._deferredConnects[attr]; // can't be in both attributeMap and _deferredConnects
		}
		for(attr in this._deferredConnects){
			if(this[attr] !== dijit._connectOnUseEventHandler){
				delete this._deferredConnects[attr];	// redefined, probably dojoAttachEvent exists
			}
		}

		this.inherited(arguments);

		if(this.domNode){
			// If the developer has specified a handler as a widget parameter
			// (ex: new Button({onClick: ...})
			// then naturally need to connect from DOM node to that handler immediately,
			for(attr in this.params){
				this._onConnect(attr);
			}
		}
	},

	_onConnect: function(/*String*/ event){
		// summary:
		//		Called when someone connects to one of my handlers.
		//		"Turn on" that handler if it isn't active yet.
		//
		//		This is also called for every single initialization parameter
		//		so need to do nothing for parameters like "id".
		// tags:
		//		private
		if(event in this._deferredConnects){
			var mapNode = this[this._deferredConnects[event] || 'domNode'];
			this.connect(mapNode, event.toLowerCase(), event);
			delete this._deferredConnects[event];
		}
	},

	////////////////// FOCUS RELATED ///////////////////
	// _onFocus() and _onBlur() are called by the focus manager

	// focused: [readonly] Boolean
	//		This widget or a widget it contains has focus, or is "active" because
	//		it was recently clicked.
	focused: false,

	isFocusable: function(){
		// summary:
		//		Return true if this widget can currently be focused
		//		and false if not
		return this.focus && (dojo.style(this.domNode, "display") != "none");
	},

	onFocus: function(){
		// summary:
		//		Called when the widget becomes "active" because
		//		it or a widget inside of it either has focus, or has recently
		//		been clicked.
		// tags:
		//		callback
	},

	onBlur: function(){
		// summary:
		//		Called when the widget stops being "active" because
		//		focus moved to something outside of it, or the user
		//		clicked somewhere outside of it, or the widget was
		//		hidden.
		// tags:
		//		callback
	},

	_onFocus: function(e){
		// summary:
		//		This is where widgets do processing for when they are active,
		//		such as changing CSS classes.  See onFocus() for more details.
		// tags:
		//		protected
		this.onFocus();
	},

	_onBlur: function(){
		// summary:
		//		This is where widgets do processing for when they stop being active,
		//		such as changing CSS classes.  See onBlur() for more details.
		// tags:
		//		protected
		this.onBlur();
	},

	////////////////// DEPRECATED METHODS ///////////////////

	setAttribute: function(/*String*/ attr, /*anything*/ value){
		// summary:
		//		Deprecated.  Use set() instead.
		// tags:
		//		deprecated
		dojo.deprecated(this.declaredClass+"::setAttribute(attr, value) is deprecated. Use set() instead.", "", "2.0");
		this.set(attr, value);
	},

	attr: function(/*String|Object*/name, /*Object?*/value){
		// summary:
		//		Set or get properties on a widget instance.
		//	name:
		//		The property to get or set. If an object is passed here and not
		//		a string, its keys are used as names of attributes to be set
		//		and the value of the object as values to set in the widget.
		//	value:
		//		Optional. If provided, attr() operates as a setter. If omitted,
		//		the current value of the named property is returned.
		// description:
		//		This method is deprecated, use get() or set() directly.

		// Print deprecation warning but only once per calling function
		if(dojo.config.isDebug){
			var alreadyCalledHash = arguments.callee._ach || (arguments.callee._ach = {}),
				caller = (arguments.callee.caller || "unknown caller").toString();
			if(!alreadyCalledHash[caller]){
				dojo.deprecated(this.declaredClass + "::attr() is deprecated. Use get() or set() instead, called from " +
				caller, "", "2.0");
				alreadyCalledHash[caller] = true;
			}
		}

		var args = arguments.length;
		if(args >= 2 || typeof name === "object"){ // setter
			return this.set.apply(this, arguments);
		}else{ // getter
			return this.get(name);
		}
	},
	
	////////////////// ONDIJITCLICK SUPPORT ///////////////////

	// nodesWithKeyClick: [private] String[]
	//		List of nodes that correctly handle click events via native browser support,
	//		and don't need dijit's help
	nodesWithKeyClick: ["input", "button"],

	connect: function(
			/*Object|null*/ obj,
			/*String|Function*/ event,
			/*String|Function*/ method){
		// summary:
		//		Connects specified obj/event to specified method of this object
		//		and registers for disconnect() on widget destroy.
		// description:
		//		Provide widget-specific analog to dojo.connect, except with the
		//		implicit use of this widget as the target object.
		//		This version of connect also provides a special "ondijitclick"
		//		event which triggers on a click or space or enter keyup.
		//		Events connected with `this.connect` are disconnected upon
		//		destruction.
		// returns:
		//		A handle that can be passed to `disconnect` in order to disconnect before
		//		the widget is destroyed.
		// example:
		//	|	var btn = new dijit.form.Button();
		//	|	// when foo.bar() is called, call the listener we're going to
		//	|	// provide in the scope of btn
		//	|	btn.connect(foo, "bar", function(){
		//	|		console.debug(this.toString());
		//	|	});
		// tags:
		//		protected

		var d = dojo,
			dc = d._connect,
			handles = this.inherited(arguments, [obj, event == "ondijitclick" ? "onclick" : event, method]);

		if(event == "ondijitclick"){
			// add key based click activation for unsupported nodes.
			// do all processing onkey up to prevent spurious clicks
			// for details see comments at top of this file where _lastKeyDownNode is defined
			if(d.indexOf(this.nodesWithKeyClick, obj.nodeName.toLowerCase()) == -1){ // is NOT input or button
				var m = d.hitch(this, method);
				handles.push(
					dc(obj, "onkeydown", this, function(e){
						//console.log(this.id + ": onkeydown, e.target = ", e.target, ", lastKeyDownNode was ", dijit._lastKeyDownNode, ", equality is ", (e.target === dijit._lastKeyDownNode));
						if((e.keyCode == d.keys.ENTER || e.keyCode == d.keys.SPACE) &&
							!e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey){
							// needed on IE for when focus changes between keydown and keyup - otherwise dropdown menus do not work
							dijit._lastKeyDownNode = e.target;
							
							// Stop event to prevent scrolling on space key in IE.
							// But don't do this for _HasDropDown because it surpresses the onkeypress
							// event needed to open the drop down when the user presses the SPACE key.
							if(!("openDropDown" in this && obj == this._buttonNode)){
								e.preventDefault();
							}
						}
			 		}),
					dc(obj, "onkeyup", this, function(e){
						//console.log(this.id + ": onkeyup, e.target = ", e.target, ", lastKeyDownNode was ", dijit._lastKeyDownNode, ", equality is ", (e.target === dijit._lastKeyDownNode));
						if( (e.keyCode == d.keys.ENTER || e.keyCode == d.keys.SPACE) &&
							e.target == dijit._lastKeyDownNode &&	// === breaks greasemonkey
							!e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey){
								//need reset here or have problems in FF when focus returns to trigger element after closing popup/alert
								dijit._lastKeyDownNode = null;
								return m(e);
						}
					})
				);
			}
		}

		return handles;		// _Widget.Handle
	},

	////////////////// MISCELLANEOUS METHODS ///////////////////

	_onShow: function(){
		// summary:
		//		Internal method called when this widget is made visible.
		//		See `onShow` for details.
		this.onShow();
	},

	onShow: function(){
		// summary:
		//		Called when this widget becomes the selected pane in a
		//		`dijit.layout.TabContainer`, `dijit.layout.StackContainer`,
		//		`dijit.layout.AccordionContainer`, etc.
		//
		//		Also called to indicate display of a `dijit.Dialog`, `dijit.TooltipDialog`, or `dijit.TitlePane`.
		// tags:
		//		callback
	},

	onHide: function(){
		// summary:
			//		Called when another widget becomes the selected pane in a
			//		`dijit.layout.TabContainer`, `dijit.layout.StackContainer`,
			//		`dijit.layout.AccordionContainer`, etc.
			//
			//		Also called to indicate hide of a `dijit.Dialog`, `dijit.TooltipDialog`, or `dijit.TitlePane`.
			// tags:
			//		callback
	},

	onClose: function(){
		// summary:
		//		Called when this widget is being displayed as a popup (ex: a Calendar popped
		//		up from a DateTextBox), and it is hidden.
		//		This is called from the dijit.popup code, and should not be called directly.
		//
		//		Also used as a parameter for children of `dijit.layout.StackContainer` or subclasses.
		//		Callback if a user tries to close the child.   Child will be closed if this function returns true.
		// tags:
		//		extension

		return true;		// Boolean
	}
});

})();

}

if(!dojo._hasResource["dijit._Container"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dijit._Container"] = true;
dojo.provide("dijit._Container");


dojo.declare("dijit._Container",
	null,
	{
		// summary:
		//		Mixin for widgets that contain a set of widget children.
		// description:
		//		Use this mixin for widgets that needs to know about and
		//		keep track of their widget children. Suitable for widgets like BorderContainer
		//		and TabContainer which contain (only) a set of child widgets.
		//
		//		It's not suitable for widgets like ContentPane
		//		which contains mixed HTML (plain DOM nodes in addition to widgets),
		//		and where contained widgets are not necessarily directly below
		//		this.containerNode.   In that case calls like addChild(node, position)
		//		wouldn't make sense.

		// isContainer: [protected] Boolean
		//		Indicates that this widget acts as a "parent" to the descendant widgets.
		//		When the parent is started it will call startup() on the child widgets.
		//		See also `isLayoutContainer`.
		isContainer: true,

		buildRendering: function(){
			this.inherited(arguments);
			if(!this.containerNode){
				// all widgets with descendants must set containerNode
	 				this.containerNode = this.domNode;
			}
		},

		addChild: function(/*dijit._Widget*/ widget, /*int?*/ insertIndex){
			// summary:
			//		Makes the given widget a child of this widget.
			// description:
			//		Inserts specified child widget's dom node as a child of this widget's
			//		container node, and possibly does other processing (such as layout).

			var refNode = this.containerNode;
			if(insertIndex && typeof insertIndex == "number"){
				var children = this.getChildren();
				if(children && children.length >= insertIndex){
					refNode = children[insertIndex-1].domNode;
					insertIndex = "after";
				}
			}
			dojo.place(widget.domNode, refNode, insertIndex);

			// If I've been started but the child widget hasn't been started,
			// start it now.  Make sure to do this after widget has been
			// inserted into the DOM tree, so it can see that it's being controlled by me,
			// so it doesn't try to size itself.
			if(this._started && !widget._started){
				widget.startup();
			}
		},

		removeChild: function(/*Widget or int*/ widget){
			// summary:
			//		Removes the passed widget instance from this widget but does
			//		not destroy it.  You can also pass in an integer indicating
			//		the index within the container to remove

			if(typeof widget == "number"){
				widget = this.getChildren()[widget];
			}

			if(widget){
				var node = widget.domNode;
				if(node && node.parentNode){
					node.parentNode.removeChild(node); // detach but don't destroy
				}
			}
		},

		hasChildren: function(){
			// summary:
			//		Returns true if widget has children, i.e. if this.containerNode contains something.
			return this.getChildren().length > 0;	// Boolean
		},

		destroyDescendants: function(/*Boolean*/ preserveDom){
			// summary:
			//      Destroys all the widgets inside this.containerNode,
			//      but not this widget itself
			dojo.forEach(this.getChildren(), function(child){ child.destroyRecursive(preserveDom); });
		},

		_getSiblingOfChild: function(/*dijit._Widget*/ child, /*int*/ dir){
			// summary:
			//		Get the next or previous widget sibling of child
			// dir:
			//		if 1, get the next sibling
			//		if -1, get the previous sibling
			// tags:
			//      private
			var node = child.domNode,
				which = (dir>0 ? "nextSibling" : "previousSibling");
			do{
				node = node[which];
			}while(node && (node.nodeType != 1 || !dijit.byNode(node)));
			return node && dijit.byNode(node);	// dijit._Widget
		},

		getIndexOfChild: function(/*dijit._Widget*/ child){
			// summary:
			//		Gets the index of the child in this container or -1 if not found
			return dojo.indexOf(this.getChildren(), child);	// int
		},

		startup: function(){
			// summary:
			//		Called after all the widgets have been instantiated and their
			//		dom nodes have been inserted somewhere under dojo.doc.body.
			//
			//		Widgets should override this method to do any initialization
			//		dependent on other widgets existing, and then call
			//		this superclass method to finish things off.
			//
			//		startup() in subclasses shouldn't do anything
			//		size related because the size of the widget hasn't been set yet.

			if(this._started){ return; }

			// Startup all children of this widget
			dojo.forEach(this.getChildren(), function(child){ child.startup(); });

			this.inherited(arguments);
		}
	}
);

}

if(!dojo._hasResource["dojo.string"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojo.string"] = true;
dojo.provide("dojo.string");

dojo.getObject("string", true, dojo);

/*=====
dojo.string = {
	// summary: String utilities for Dojo
};
=====*/

dojo.string.rep = function(/*String*/str, /*Integer*/num){
	//	summary:
	//		Efficiently replicate a string `n` times.
	//	str:
	//		the string to replicate
	//	num:
	//		number of times to replicate the string
	
	if(num <= 0 || !str){ return ""; }
	
	var buf = [];
	for(;;){
		if(num & 1){
			buf.push(str);
		}
		if(!(num >>= 1)){ break; }
		str += str;
	}
	return buf.join("");	// String
};

dojo.string.pad = function(/*String*/text, /*Integer*/size, /*String?*/ch, /*Boolean?*/end){
	//	summary:
	//		Pad a string to guarantee that it is at least `size` length by
	//		filling with the character `ch` at either the start or end of the
	//		string. Pads at the start, by default.
	//	text:
	//		the string to pad
	//	size:
	//		length to provide padding
	//	ch:
	//		character to pad, defaults to '0'
	//	end:
	//		adds padding at the end if true, otherwise pads at start
	//	example:
	//	|	// Fill the string to length 10 with "+" characters on the right.  Yields "Dojo++++++".
	//	|	dojo.string.pad("Dojo", 10, "+", true);

	if(!ch){
		ch = '0';
	}
	var out = String(text),
		pad = dojo.string.rep(ch, Math.ceil((size - out.length) / ch.length));
	return end ? out + pad : pad + out;	// String
};

dojo.string.substitute = function(	/*String*/		template,
									/*Object|Array*/map,
									/*Function?*/	transform,
									/*Object?*/		thisObject){
	//	summary:
	//		Performs parameterized substitutions on a string. Throws an
	//		exception if any parameter is unmatched.
	//	template:
	//		a string with expressions in the form `${key}` to be replaced or
	//		`${key:format}` which specifies a format function. keys are case-sensitive.
	//	map:
	//		hash to search for substitutions
	//	transform:
	//		a function to process all parameters before substitution takes
	//		place, e.g. mylib.encodeXML
	//	thisObject:
	//		where to look for optional format function; default to the global
	//		namespace
	//	example:
	//		Substitutes two expressions in a string from an Array or Object
	//	|	// returns "File 'foo.html' is not found in directory '/temp'."
	//	|	// by providing substitution data in an Array
	//	|	dojo.string.substitute(
	//	|		"File '${0}' is not found in directory '${1}'.",
	//	|		["foo.html","/temp"]
	//	|	);
	//	|
	//	|	// also returns "File 'foo.html' is not found in directory '/temp'."
	//	|	// but provides substitution data in an Object structure.  Dotted
	//	|	// notation may be used to traverse the structure.
	//	|	dojo.string.substitute(
	//	|		"File '${name}' is not found in directory '${info.dir}'.",
	//	|		{ name: "foo.html", info: { dir: "/temp" } }
	//	|	);
	//	example:
	//		Use a transform function to modify the values:
	//	|	// returns "file 'foo.html' is not found in directory '/temp'."
	//	|	dojo.string.substitute(
	//	|		"${0} is not found in ${1}.",
	//	|		["foo.html","/temp"],
	//	|		function(str){
	//	|			// try to figure out the type
	//	|			var prefix = (str.charAt(0) == "/") ? "directory": "file";
	//	|			return prefix + " '" + str + "'";
	//	|		}
	//	|	);
	//	example:
	//		Use a formatter
	//	|	// returns "thinger -- howdy"
	//	|	dojo.string.substitute(
	//	|		"${0:postfix}", ["thinger"], null, {
	//	|			postfix: function(value, key){
	//	|				return value + " -- howdy";
	//	|			}
	//	|		}
	//	|	);

	thisObject = thisObject || dojo.global;
	transform = transform ?
		dojo.hitch(thisObject, transform) : function(v){ return v; };

	return template.replace(/\$\{([^\s\:\}]+)(?:\:([^\s\:\}]+))?\}/g,
		function(match, key, format){
			var value = dojo.getObject(key, false, map);
			if(format){
				value = dojo.getObject(format, false, thisObject).call(thisObject, value, key);
			}
			return transform(value, key).toString();
		}); // String
};

/*=====
dojo.string.trim = function(str){
	//	summary:
	//		Trims whitespace from both sides of the string
	//	str: String
	//		String to be trimmed
	//	returns: String
	//		Returns the trimmed string
	//	description:
	//		This version of trim() was taken from [Steven Levithan's blog](http://blog.stevenlevithan.com/archives/faster-trim-javascript).
	//		The short yet performant version of this function is dojo.trim(),
	//		which is part of Dojo base.  Uses String.prototype.trim instead, if available.
	return "";	// String
}
=====*/

dojo.string.trim = String.prototype.trim ?
	dojo.trim : // aliasing to the native function
	function(str){
		str = str.replace(/^\s+/, '');
		for(var i = str.length - 1; i >= 0; i--){
			if(/\S/.test(str.charAt(i))){
				str = str.substring(0, i + 1);
				break;
			}
		}
		return str;
	};

}

if(!dojo._hasResource["dojo.cache"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojo.cache"] = true;
dojo.provide("dojo.cache");


/*=====
dojo.cache = {
	// summary:
	// 		A way to cache string content that is fetchable via `dojo.moduleUrl`.
};
=====*/

	var cache = {};
	dojo.cache = function(/*String||Object*/module, /*String*/url, /*String||Object?*/value){
		// summary:
		// 		A getter and setter for storing the string content associated with the
		// 		module and url arguments.
		// description:
		// 		module and url are used to call `dojo.moduleUrl()` to generate a module URL.
		// 		If value is specified, the cache value for the moduleUrl will be set to
		// 		that value. Otherwise, dojo.cache will fetch the moduleUrl and store it
		// 		in its internal cache and return that cached value for the URL. To clear
		// 		a cache value pass null for value. Since XMLHttpRequest (XHR) is used to fetch the
		// 		the URL contents, only modules on the same domain of the page can use this capability.
		// 		The build system can inline the cache values though, to allow for xdomain hosting.
		// module: String||Object
		// 		If a String, the module name to use for the base part of the URL, similar to module argument
		// 		to `dojo.moduleUrl`. If an Object, something that has a .toString() method that
		// 		generates a valid path for the cache item. For example, a dojo._Url object.
		// url: String
		// 		The rest of the path to append to the path derived from the module argument. If
		// 		module is an object, then this second argument should be the "value" argument instead.
		// value: String||Object?
		// 		If a String, the value to use in the cache for the module/url combination.
		// 		If an Object, it can have two properties: value and sanitize. The value property
		// 		should be the value to use in the cache, and sanitize can be set to true or false,
		// 		to indicate if XML declarations should be removed from the value and if the HTML
		// 		inside a body tag in the value should be extracted as the real value. The value argument
		// 		or the value property on the value argument are usually only used by the build system
		// 		as it inlines cache content.
		//	example:
		//		To ask dojo.cache to fetch content and store it in the cache (the dojo["cache"] style
		// 		of call is used to avoid an issue with the build system erroneously trying to intern
		// 		this example. To get the build system to intern your dojo.cache calls, use the
		// 		"dojo.cache" style of call):
		// 		|	//If template.html contains "<h1>Hello</h1>" that will be
		// 		|	//the value for the text variable.
		//		|	var text = dojo["cache"]("my.module", "template.html");
		//	example:
		//		To ask dojo.cache to fetch content and store it in the cache, and sanitize the input
		// 		 (the dojo["cache"] style of call is used to avoid an issue with the build system
		// 		erroneously trying to intern this example. To get the build system to intern your
		// 		dojo.cache calls, use the "dojo.cache" style of call):
		// 		|	//If template.html contains "<html><body><h1>Hello</h1></body></html>", the
		// 		|	//text variable will contain just "<h1>Hello</h1>".
		//		|	var text = dojo["cache"]("my.module", "template.html", {sanitize: true});
		//	example:
		//		Same example as previous, but demostrates how an object can be passed in as
		//		the first argument, then the value argument can then be the second argument.
		// 		|	//If template.html contains "<html><body><h1>Hello</h1></body></html>", the
		// 		|	//text variable will contain just "<h1>Hello</h1>".
		//		|	var text = dojo["cache"](new dojo._Url("my/module/template.html"), {sanitize: true});

		//Module could be a string, or an object that has a toString() method
		//that will return a useful path. If it is an object, then the "url" argument
		//will actually be the value argument.
		if(typeof module == "string"){
			var pathObj = dojo.moduleUrl(module, url);
		}else{
			pathObj = module;
			value = url;
		}
		var key = pathObj.toString();

		var val = value;
		if(value != undefined && !dojo.isString(value)){
			val = ("value" in value ? value.value : undefined);
		}

		var sanitize = value && value.sanitize ? true : false;

		if(typeof val == "string"){
			//We have a string, set cache value
			val = cache[key] = sanitize ? dojo.cache._sanitize(val) : val;
		}else if(val === null){
			//Remove cached value
			delete cache[key];
		}else{
			//Allow cache values to be empty strings. If key property does
			//not exist, fetch it.
			if(!(key in cache)){
				val = dojo._getText(key);
				cache[key] = sanitize ? dojo.cache._sanitize(val) : val;
			}
			val = cache[key];
		}
		return val; //String
	};

	dojo.cache._sanitize = function(/*String*/val){
		// summary:
		//		Strips <?xml ...?> declarations so that external SVG and XML
		// 		documents can be added to a document without worry. Also, if the string
		//		is an HTML document, only the part inside the body tag is returned.
		// description:
		// 		Copied from dijit._Templated._sanitizeTemplateString.
		if(val){
			val = val.replace(/^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im, "");
			var matches = val.match(/<body[^>]*>\s*([\s\S]+)\s*<\/body>/im);
			if(matches){
				val = matches[1];
			}
		}else{
			val = "";
		}
		return val; //String
	};

}

if(!dojo._hasResource["dijit._Templated"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dijit._Templated"] = true;
dojo.provide("dijit._Templated");






dojo.declare("dijit._Templated",
	null,
	{
		// summary:
		//		Mixin for widgets that are instantiated from a template

		// templateString: [protected] String
		//		A string that represents the widget template. Pre-empts the
		//		templatePath. In builds that have their strings "interned", the
		//		templatePath is converted to an inline templateString, thereby
		//		preventing a synchronous network call.
		//
		//		Use in conjunction with dojo.cache() to load from a file.
		templateString: null,

		// templatePath: [protected deprecated] String
		//		Path to template (HTML file) for this widget relative to dojo.baseUrl.
		//		Deprecated: use templateString with dojo.cache() instead.
		templatePath: null,

		// widgetsInTemplate: [protected] Boolean
		//		Should we parse the template to find widgets that might be
		//		declared in markup inside it?  False by default.
		widgetsInTemplate: false,

		// skipNodeCache: [protected] Boolean
		//		If using a cached widget template node poses issues for a
		//		particular widget class, it can set this property to ensure
		//		that its template is always re-built from a string
		_skipNodeCache: false,

		// _earlyTemplatedStartup: Boolean
		//		A fallback to preserve the 1.0 - 1.3 behavior of children in
		//		templates having their startup called before the parent widget
		//		fires postCreate. Defaults to 'false', causing child widgets to
		//		have their .startup() called immediately before a parent widget
		//		.startup(), but always after the parent .postCreate(). Set to
		//		'true' to re-enable to previous, arguably broken, behavior.
		_earlyTemplatedStartup: false,

/*=====
		// _attachPoints: [private] String[]
		//		List of widget attribute names associated with dojoAttachPoint=... in the
		//		template, ex: ["containerNode", "labelNode"]
 		_attachPoints: [],
 =====*/

/*=====
		// _attachEvents: [private] Handle[]
		//		List of connections associated with dojoAttachEvent=... in the
		//		template
 		_attachEvents: [],
 =====*/

		constructor: function(){
			this._attachPoints = [];
			this._attachEvents = [];
		},

		_stringRepl: function(tmpl){
			// summary:
			//		Does substitution of ${foo} type properties in template string
			// tags:
			//		private
			var className = this.declaredClass, _this = this;
			// Cache contains a string because we need to do property replacement
			// do the property replacement
			return dojo.string.substitute(tmpl, this, function(value, key){
				if(key.charAt(0) == '!'){ value = dojo.getObject(key.substr(1), false, _this); }
				if(typeof value == "undefined"){ throw new Error(className+" template:"+key); } // a debugging aide
				if(value == null){ return ""; }

				// Substitution keys beginning with ! will skip the transform step,
				// in case a user wishes to insert unescaped markup, e.g. ${!foo}
				return key.charAt(0) == "!" ? value :
					// Safer substitution, see heading "Attribute values" in
					// http://www.w3.org/TR/REC-html40/appendix/notes.html#h-B.3.2
					value.toString().replace(/"/g,"&quot;"); //TODO: add &amp? use encodeXML method?
			}, this);
		},

		buildRendering: function(){
			// summary:
			//		Construct the UI for this widget from a template, setting this.domNode.
			// tags:
			//		protected

			// Lookup cached version of template, and download to cache if it
			// isn't there already.  Returns either a DomNode or a string, depending on
			// whether or not the template contains ${foo} replacement parameters.
			var cached = dijit._Templated.getCachedTemplate(this.templatePath, this.templateString, this._skipNodeCache);

			var node;
			if(dojo.isString(cached)){
				node = dojo._toDom(this._stringRepl(cached));
				if(node.nodeType != 1){
					// Flag common problems such as templates with multiple top level nodes (nodeType == 11)
					throw new Error("Invalid template: " + cached);
				}
			}else{
				// if it's a node, all we have to do is clone it
				node = cached.cloneNode(true);
			}

			this.domNode = node;

			// Call down to _Widget.buildRendering() to get base classes assigned
			// TODO: change the baseClass assignment to attributeMap
			this.inherited(arguments);

			// recurse through the node, looking for, and attaching to, our
			// attachment points and events, which should be defined on the template node.
			this._attachTemplateNodes(node);

			if(this.widgetsInTemplate){
				// Store widgets that we need to start at a later point in time
				var cw = (this._startupWidgets = dojo.parser.parse(node, {
					noStart: !this._earlyTemplatedStartup,
					template: true,
					inherited: {dir: this.dir, lang: this.lang},
					propsThis: this,	// so data-dojo-props of widgets in the template can reference "this" to refer to me
					scope: "dojo"	// even in multi-version mode templates use dojoType/data-dojo-type
				}));

				this._supportingWidgets = dijit.findWidgets(node);

				this._attachTemplateNodes(cw, function(n,p){
					return n[p];
				});
			}

			this._fillContent(this.srcNodeRef);
		},

		_fillContent: function(/*DomNode*/ source){
			// summary:
			//		Relocate source contents to templated container node.
			//		this.containerNode must be able to receive children, or exceptions will be thrown.
			// tags:
			//		protected
			var dest = this.containerNode;
			if(source && dest){
				while(source.hasChildNodes()){
					dest.appendChild(source.firstChild);
				}
			}
		},

		_attachTemplateNodes: function(rootNode, getAttrFunc){
			// summary:
			//		Iterate through the template and attach functions and nodes accordingly.
			//		Alternately, if rootNode is an array of widgets, then will process dojoAttachPoint
			//		etc. for those widgets.
			// description:
			//		Map widget properties and functions to the handlers specified in
			//		the dom node and it's descendants. This function iterates over all
			//		nodes and looks for these properties:
			//			* dojoAttachPoint
			//			* dojoAttachEvent
			//			* waiRole
			//			* waiState
			// rootNode: DomNode|Array[Widgets]
			//		the node to search for properties. All children will be searched.
			// getAttrFunc: Function?
			//		a function which will be used to obtain property for a given
			//		DomNode/Widget
			// tags:
			//		private

			getAttrFunc = getAttrFunc || function(n,p){ return n.getAttribute(p); };

			var nodes = dojo.isArray(rootNode) ? rootNode : (rootNode.all || rootNode.getElementsByTagName("*"));
			var x = dojo.isArray(rootNode) ? 0 : -1;
			for(; x<nodes.length; x++){
				var baseNode = (x == -1) ? rootNode : nodes[x];
				if(this.widgetsInTemplate && (getAttrFunc(baseNode, "dojoType") || getAttrFunc(baseNode, "data-dojo-type"))){
					continue;
				}
				// Process dojoAttachPoint
				var attachPoint = getAttrFunc(baseNode, "dojoAttachPoint") || getAttrFunc(baseNode, "data-dojo-attach-point");
				if(attachPoint){
					var point, points = attachPoint.split(/\s*,\s*/);
					while((point = points.shift())){
						if(dojo.isArray(this[point])){
							this[point].push(baseNode);
						}else{
							this[point]=baseNode;
						}
						this._attachPoints.push(point);
					}
				}

				// Process dojoAttachEvent
				var attachEvent = getAttrFunc(baseNode, "dojoAttachEvent") || getAttrFunc(baseNode, "data-dojo-attach-event");;
				if(attachEvent){
					// NOTE: we want to support attributes that have the form
					// "domEvent: nativeEvent; ..."
					var event, events = attachEvent.split(/\s*,\s*/);
					var trim = dojo.trim;
					while((event = events.shift())){
						if(event){
							var thisFunc = null;
							if(event.indexOf(":") != -1){
								// oh, if only JS had tuple assignment
								var funcNameArr = event.split(":");
								event = trim(funcNameArr[0]);
								thisFunc = trim(funcNameArr[1]);
							}else{
								event = trim(event);
							}
							if(!thisFunc){
								thisFunc = event;
							}
							this._attachEvents.push(this.connect(baseNode, event, thisFunc));
						}
					}
				}

				// waiRole, waiState
				// TODO: remove this in 2.0, templates are now using role=... and aria-XXX=... attributes directicly
				var role = getAttrFunc(baseNode, "waiRole");
				if(role){
					dijit.setWaiRole(baseNode, role);
				}
				var values = getAttrFunc(baseNode, "waiState");
				if(values){
					dojo.forEach(values.split(/\s*,\s*/), function(stateValue){
						if(stateValue.indexOf('-') != -1){
							var pair = stateValue.split('-');
							dijit.setWaiState(baseNode, pair[0], pair[1]);
						}
					});
				}
			}
		},

		startup: function(){
			dojo.forEach(this._startupWidgets, function(w){
				if(w && !w._started && w.startup){
					w.startup();
				}
			});
			this.inherited(arguments);
		},

		destroyRendering: function(){
			// Delete all attach points to prevent IE6 memory leaks.
			dojo.forEach(this._attachPoints, function(point){
				delete this[point];
			}, this);
			this._attachPoints = [];

			// And same for event handlers
			dojo.forEach(this._attachEvents, this.disconnect, this);
			this._attachEvents = [];
			
			this.inherited(arguments);
		}
	}
);

// key is either templatePath or templateString; object is either string or DOM tree
dijit._Templated._templateCache = {};

dijit._Templated.getCachedTemplate = function(templatePath, templateString, alwaysUseString){
	// summary:
	//		Static method to get a template based on the templatePath or
	//		templateString key
	// templatePath: String||dojo.uri.Uri
	//		The URL to get the template from.
	// templateString: String?
	//		a string to use in lieu of fetching the template from a URL. Takes precedence
	//		over templatePath
	// returns: Mixed
	//		Either string (if there are ${} variables that need to be replaced) or just
	//		a DOM tree (if the node can be cloned directly)

	// is it already cached?
	var tmplts = dijit._Templated._templateCache;
	var key = templateString || templatePath;
	var cached = tmplts[key];
	if(cached){
		try{
			// if the cached value is an innerHTML string (no ownerDocument) or a DOM tree created within the current document, then use the current cached value
			if(!cached.ownerDocument || cached.ownerDocument == dojo.doc){
				// string or node of the same document
				return cached;
			}
		}catch(e){ /* squelch */ } // IE can throw an exception if cached.ownerDocument was reloaded
		dojo.destroy(cached);
	}

	// If necessary, load template string from template path
	if(!templateString){
		templateString = dojo.cache(templatePath, {sanitize: true});
	}
	templateString = dojo.string.trim(templateString);

	if(alwaysUseString || templateString.match(/\$\{([^\}]+)\}/g)){
		// there are variables in the template so all we can do is cache the string
		return (tmplts[key] = templateString); //String
	}else{
		// there are no variables in the template so we can cache the DOM tree
		var node = dojo._toDom(templateString);
		if(node.nodeType != 1){
			throw new Error("Invalid template: " + templateString);
		}
		return (tmplts[key] = node); //Node
	}
};

if(dojo.isIE){
	dojo.addOnWindowUnload(function(){
		var cache = dijit._Templated._templateCache;
		for(var key in cache){
			var value = cache[key];
			if(typeof value == "object"){ // value is either a string or a DOM node template
				dojo.destroy(value);
			}
			delete cache[key];
		}
	});
}

// These arguments can be specified for widgets which are used in templates.
// Since any widget can be specified as sub widgets in template, mix it
// into the base widget class.  (This is a hack, but it's effective.)
dojo.extend(dijit._Widget,{
	dojoAttachEvent: "",
	dojoAttachPoint: "",
	waiRole: "",
	waiState:""
});

}

if(!dojo._hasResource["dijit._CssStateMixin"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dijit._CssStateMixin"] = true;
dojo.provide("dijit._CssStateMixin");


dojo.declare("dijit._CssStateMixin", [], {
	// summary:
	//		Mixin for widgets to set CSS classes on the widget DOM nodes depending on hover/mouse press/focus
	//		state changes, and also higher-level state changes such becoming disabled or selected.
	//
	// description:
	//		By mixing this class into your widget, and setting the this.baseClass attribute, it will automatically
	//		maintain CSS classes on the widget root node (this.domNode) depending on hover,
	//		active, focus, etc. state.   Ex: with a baseClass of dijitButton, it will apply the classes
	//		dijitButtonHovered and dijitButtonActive, as the user moves the mouse over the widget and clicks it.
	//
	//		It also sets CSS like dijitButtonDisabled based on widget semantic state.
	//
	//		By setting the cssStateNodes attribute, a widget can also track events on subnodes (like buttons
	//		within the widget).

	// cssStateNodes: [protected] Object
	//		List of sub-nodes within the widget that need CSS classes applied on mouse hover/press and focus
	//.
	//		Each entry in the hash is a an attachpoint names (like "upArrowButton") mapped to a CSS class names
	//		(like "dijitUpArrowButton"). Example:
	//	|		{
	//	|			"upArrowButton": "dijitUpArrowButton",
	//	|			"downArrowButton": "dijitDownArrowButton"
	//	|		}
	//		The above will set the CSS class dijitUpArrowButton to the this.upArrowButton DOMNode when it
	//		is hovered, etc.
	cssStateNodes: {},

	// hovering: [readonly] Boolean
	//		True if cursor is over this widget
	hovering: false,
	
	// active: [readonly] Boolean
	//		True if mouse was pressed while over this widget, and hasn't been released yet
	active: false,

	_applyAttributes: function(){
		// This code would typically be in postCreate(), but putting in _applyAttributes() for
		// performance: so the class changes happen before DOM is inserted into the document.
		// Change back to postCreate() in 2.0.  See #11635.

		this.inherited(arguments);

		// Automatically monitor mouse events (essentially :hover and :active) on this.domNode
		dojo.forEach(["onmouseenter", "onmouseleave", "onmousedown"], function(e){
			this.connect(this.domNode, e, "_cssMouseEvent");
		}, this);
		
		// Monitoring changes to disabled, readonly, etc. state, and update CSS class of root node
		dojo.forEach(["disabled", "readOnly", "checked", "selected", "focused", "state", "hovering", "active"], function(attr){
			this.watch(attr, dojo.hitch(this, "_setStateClass"));
		}, this);

		// Events on sub nodes within the widget
		for(var ap in this.cssStateNodes){
			this._trackMouseState(this[ap], this.cssStateNodes[ap]);
		}
		// Set state initially; there's probably no hover/active/focus state but widget might be
		// disabled/readonly/checked/selected so we want to set CSS classes for those conditions.
		this._setStateClass();
	},

	_cssMouseEvent: function(/*Event*/ event){
		// summary:
		//	Sets hovering and active properties depending on mouse state,
		//	which triggers _setStateClass() to set appropriate CSS classes for this.domNode.

		if(!this.disabled){
			switch(event.type){
				case "mouseenter":
				case "mouseover":	// generated on non-IE browsers even though we connected to mouseenter
					this._set("hovering", true);
					this._set("active", this._mouseDown);
					break;

				case "mouseleave":
				case "mouseout":	// generated on non-IE browsers even though we connected to mouseleave
					this._set("hovering", false);
					this._set("active", false);
					break;

				case "mousedown" :
					this._set("active", true);
					this._mouseDown = true;
					// Set a global event to handle mouseup, so it fires properly
					// even if the cursor leaves this.domNode before the mouse up event.
					// Alternately could set active=false on mouseout.
					var mouseUpConnector = this.connect(dojo.body(), "onmouseup", function(){
						this._mouseDown = false;
						this._set("active", false);
						this.disconnect(mouseUpConnector);
					});
					break;
			}
		}
	},

	_setStateClass: function(){
		// summary:
		//		Update the visual state of the widget by setting the css classes on this.domNode
		//		(or this.stateNode if defined) by combining this.baseClass with
		//		various suffixes that represent the current widget state(s).
		//
		// description:
		//		In the case where a widget has multiple
		//		states, it sets the class based on all possible
		//	 	combinations.  For example, an invalid form widget that is being hovered
		//		will be "dijitInput dijitInputInvalid dijitInputHover dijitInputInvalidHover".
		//
		//		The widget may have one or more of the following states, determined
		//		by this.state, this.checked, this.valid, and this.selected:
		//			- Error - ValidationTextBox sets this.state to "Error" if the current input value is invalid
		//			- Incomplete - ValidationTextBox sets this.state to "Incomplete" if the current input value is not finished yet
		//			- Checked - ex: a checkmark or a ToggleButton in a checked state, will have this.checked==true
		//			- Selected - ex: currently selected tab will have this.selected==true
		//
		//		In addition, it may have one or more of the following states,
		//		based on this.disabled and flags set in _onMouse (this.active, this.hovering) and from focus manager (this.focused):
		//			- Disabled	- if the widget is disabled
		//			- Active		- if the mouse (or space/enter key?) is being pressed down
		//			- Focused		- if the widget has focus
		//			- Hover		- if the mouse is over the widget

		// Compute new set of classes
		var newStateClasses = this.baseClass.split(" ");

		function multiply(modifier){
			newStateClasses = newStateClasses.concat(dojo.map(newStateClasses, function(c){ return c+modifier; }), "dijit"+modifier);
		}

		if(!this.isLeftToRight()){
			// For RTL mode we need to set an addition class like dijitTextBoxRtl.
			multiply("Rtl");
		}

		if(this.checked){
			multiply("Checked");
		}
		if(this.state){
			multiply(this.state);
		}
		if(this.selected){
			multiply("Selected");
		}

		if(this.disabled){
			multiply("Disabled");
		}else if(this.readOnly){
			multiply("ReadOnly");
		}else{
			if(this.active){
				multiply("Active");
			}else if(this.hovering){
				multiply("Hover");
			}
		}

		if(this._focused){
			multiply("Focused");
		}

		// Remove old state classes and add new ones.
		// For performance concerns we only write into domNode.className once.
		var tn = this.stateNode || this.domNode,
			classHash = {};	// set of all classes (state and otherwise) for node

		dojo.forEach(tn.className.split(" "), function(c){ classHash[c] = true; });

		if("_stateClasses" in this){
			dojo.forEach(this._stateClasses, function(c){ delete classHash[c]; });
		}

		dojo.forEach(newStateClasses, function(c){ classHash[c] = true; });

		var newClasses = [];
		for(var c in classHash){
			newClasses.push(c);
		}
		tn.className = newClasses.join(" ");

		this._stateClasses = newStateClasses;
	},

	_trackMouseState: function(/*DomNode*/ node, /*String*/ clazz){
		// summary:
		//		Track mouse/focus events on specified node and set CSS class on that node to indicate
		//		current state.   Usually not called directly, but via cssStateNodes attribute.
		// description:
		//		Given class=foo, will set the following CSS class on the node
		//			- fooActive: if the user is currently pressing down the mouse button while over the node
		//			- fooHover: if the user is hovering the mouse over the node, but not pressing down a button
		//			- fooFocus: if the node is focused
		//
		//		Note that it won't set any classes if the widget is disabled.
		// node: DomNode
		//		Should be a sub-node of the widget, not the top node (this.domNode), since the top node
		//		is handled specially and automatically just by mixing in this class.
		// clazz: String
		//		CSS class name (ex: dijitSliderUpArrow).

		// Current state of node (initially false)
		// NB: setting specifically to false because dojo.toggleClass() needs true boolean as third arg
		var hovering=false, active=false, focused=false;

		var self = this,
			cn = dojo.hitch(this, "connect", node);

		function setClass(){
			var disabled = ("disabled" in self && self.disabled) || ("readonly" in self && self.readonly);
			dojo.toggleClass(node, clazz+"Hover", hovering && !active && !disabled);
			dojo.toggleClass(node, clazz+"Active", active && !disabled);
			dojo.toggleClass(node, clazz+"Focused", focused && !disabled);
		}

		// Mouse
		cn("onmouseenter", function(){
			hovering = true;
			setClass();
		});
		cn("onmouseleave", function(){
			hovering = false;
			active = false;
			setClass();
		});
		cn("onmousedown", function(){
			active = true;
			setClass();
		});
		cn("onmouseup", function(){
			active = false;
			setClass();
		});

		// Focus
		cn("onfocus", function(){
			focused = true;
			setClass();
		});
		cn("onblur", function(){
			focused = false;
			setClass();
		});

		// Just in case widget is enabled/disabled while it has focus/hover/active state.
		// Maybe this is overkill.
		this.watch("disabled", setClass);
		this.watch("readOnly", setClass);
	}
});

}

if(!dojo._hasResource["dijit.form._FormWidget"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dijit.form._FormWidget"] = true;
dojo.provide("dijit.form._FormWidget");






dojo.declare("dijit.form._FormWidget", [dijit._Widget, dijit._Templated, dijit._CssStateMixin],
	{
	// summary:
	//		Base class for widgets corresponding to native HTML elements such as <checkbox> or <button>,
	//		which can be children of a <form> node or a `dijit.form.Form` widget.
	//
	// description:
	//		Represents a single HTML element.
	//		All these widgets should have these attributes just like native HTML input elements.
	//		You can set them during widget construction or afterwards, via `dijit._Widget.attr`.
	//
	//		They also share some common methods.

	// name: [const] String
	//		Name used when submitting form; same as "name" attribute or plain HTML elements
	name: "",

	// alt: String
	//		Corresponds to the native HTML <input> element's attribute.
	alt: "",

	// value: String
	//		Corresponds to the native HTML <input> element's attribute.
	value: "",

	// type: String
	//		Corresponds to the native HTML <input> element's attribute.
	type: "text",

	// tabIndex: Integer
	//		Order fields are traversed when user hits the tab key
	tabIndex: "0",

	// disabled: Boolean
	//		Should this widget respond to user input?
	//		In markup, this is specified as "disabled='disabled'", or just "disabled".
	disabled: false,

	// intermediateChanges: Boolean
	//		Fires onChange for each value change or only on demand
	intermediateChanges: false,

	// scrollOnFocus: Boolean
	//		On focus, should this widget scroll into view?
	scrollOnFocus: true,

	// These mixins assume that the focus node is an INPUT, as many but not all _FormWidgets are.
	attributeMap: dojo.delegate(dijit._Widget.prototype.attributeMap, {
		value: "focusNode",
		id: "focusNode",
		tabIndex: "focusNode",
		alt: "focusNode",
		title: "focusNode"
	}),

	postMixInProperties: function(){
		// Setup name=foo string to be referenced from the template (but only if a name has been specified)
		// Unfortunately we can't use attributeMap to set the name due to IE limitations, see #8660
		// Regarding escaping, see heading "Attribute values" in
		// http://www.w3.org/TR/REC-html40/appendix/notes.html#h-B.3.2
		this.nameAttrSetting = this.name ? ('name="' + this.name.replace(/'/g, "&quot;") + '"') : '';
		this.inherited(arguments);
	},

	postCreate: function(){
		this.inherited(arguments);
		this.connect(this.domNode, "onmousedown", "_onMouseDown");
	},

	_setDisabledAttr: function(/*Boolean*/ value){
		this._set("disabled", value);
		dojo.attr(this.focusNode, 'disabled', value);
		if(this.valueNode){
			dojo.attr(this.valueNode, 'disabled', value);
		}
		dijit.setWaiState(this.focusNode, "disabled", value);

		if(value){
			// reset these, because after the domNode is disabled, we can no longer receive
			// mouse related events, see #4200
			this._set("hovering", false);
			this._set("active", false);

			// clear tab stop(s) on this widget's focusable node(s)  (ComboBox has two focusable nodes)
			var attachPointNames = "tabIndex" in this.attributeMap ? this.attributeMap.tabIndex : "focusNode";
			dojo.forEach(dojo.isArray(attachPointNames) ? attachPointNames : [attachPointNames], function(attachPointName){
				var node = this[attachPointName];
				// complex code because tabIndex=-1 on a <div> doesn't work on FF
				if(dojo.isWebKit || dijit.hasDefaultTabStop(node)){	// see #11064 about webkit bug
					node.setAttribute('tabIndex', "-1");
				}else{
					node.removeAttribute('tabIndex');
				}
			}, this);
		}else{
			if(this.tabIndex != ""){
				this.focusNode.setAttribute('tabIndex', this.tabIndex);
			}
		}
	},

	setDisabled: function(/*Boolean*/ disabled){
		// summary:
		//		Deprecated.  Use set('disabled', ...) instead.
		dojo.deprecated("setDisabled("+disabled+") is deprecated. Use set('disabled',"+disabled+") instead.", "", "2.0");
		this.set('disabled', disabled);
	},

	_onFocus: function(e){
		if(this.scrollOnFocus){
			dojo.window.scrollIntoView(this.domNode);
		}
		this.inherited(arguments);
	},

	isFocusable: function(){
		// summary:
		//		Tells if this widget is focusable or not.  Used internally by dijit.
		// tags:
		//		protected
		return !this.disabled && this.focusNode && (dojo.style(this.domNode, "display") != "none");
	},

	focus: function(){
		// summary:
		//		Put focus on this widget
		if(!this.disabled){
			dijit.focus(this.focusNode);
		}
	},

	compare: function(/*anything*/ val1, /*anything*/ val2){
		// summary:
		//		Compare 2 values (as returned by get('value') for this widget).
		// tags:
		//		protected
		if(typeof val1 == "number" && typeof val2 == "number"){
			return (isNaN(val1) && isNaN(val2)) ? 0 : val1 - val2;
		}else if(val1 > val2){
			return 1;
		}else if(val1 < val2){
			return -1;
		}else{
			return 0;
		}
	},

	onChange: function(newValue){
		// summary:
		//		Callback when this widget's value is changed.
		// tags:
		//		callback
	},

	// _onChangeActive: [private] Boolean
	//		Indicates that changes to the value should call onChange() callback.
	//		This is false during widget initialization, to avoid calling onChange()
	//		when the initial value is set.
	_onChangeActive: false,

	_handleOnChange: function(/*anything*/ newValue, /*Boolean?*/ priorityChange){
		// summary:
		//		Called when the value of the widget is set.  Calls onChange() if appropriate
		// newValue:
		//		the new value
		// priorityChange:
		//		For a slider, for example, dragging the slider is priorityChange==false,
		//		but on mouse up, it's priorityChange==true.  If intermediateChanges==false,
		//		onChange is only called form priorityChange=true events.
		// tags:
		//		private
		if(this._lastValueReported == undefined && (priorityChange === null || !this._onChangeActive)){
			// this block executes not for a change, but during initialization,
			// and is used to store away the original value (or for ToggleButton, the original checked state)
			this._resetValue = this._lastValueReported = newValue;
		}
		this._pendingOnChange = this._pendingOnChange
			|| (typeof newValue != typeof this._lastValueReported)
			|| (this.compare(newValue, this._lastValueReported) != 0);
		if((this.intermediateChanges || priorityChange || priorityChange === undefined) && this._pendingOnChange){
			this._lastValueReported = newValue;
			this._pendingOnChange = false;
			if(this._onChangeActive){
				if(this._onChangeHandle){
					clearTimeout(this._onChangeHandle);
				}
				// setTimout allows hidden value processing to run and
				// also the onChange handler can safely adjust focus, etc
				this._onChangeHandle = setTimeout(dojo.hitch(this,
					function(){
						this._onChangeHandle = null;
						this.onChange(newValue);
					}), 0); // try to collapse multiple onChange's fired faster than can be processed
			}
		}
	},

	create: function(){
		// Overrides _Widget.create()
		this.inherited(arguments);
		this._onChangeActive = true;
	},

	destroy: function(){
		if(this._onChangeHandle){ // destroy called before last onChange has fired
			clearTimeout(this._onChangeHandle);
			this.onChange(this._lastValueReported);
		}
		this.inherited(arguments);
	},

	setValue: function(/*String*/ value){
		// summary:
		//		Deprecated.  Use set('value', ...) instead.
		dojo.deprecated("dijit.form._FormWidget:setValue("+value+") is deprecated.  Use set('value',"+value+") instead.", "", "2.0");
		this.set('value', value);
	},

	getValue: function(){
		// summary:
		//		Deprecated.  Use get('value') instead.
		dojo.deprecated(this.declaredClass+"::getValue() is deprecated. Use get('value') instead.", "", "2.0");
		return this.get('value');
	},
	
	_onMouseDown: function(e){
		// If user clicks on the button, even if the mouse is released outside of it,
		// this button should get focus (to mimics native browser buttons).
		// This is also needed on chrome because otherwise buttons won't get focus at all,
		// which leads to bizarre focus restore on Dialog close etc.
		if(!e.ctrlKey && dojo.mouseButtons.isLeft(e) && this.isFocusable()){ // !e.ctrlKey to ignore right-click on mac
			// Set a global event to handle mouseup, so it fires properly
			// even if the cursor leaves this.domNode before the mouse up event.
			var mouseUpConnector = this.connect(dojo.body(), "onmouseup", function(){
				if (this.isFocusable()) {
					this.focus();
				}
				this.disconnect(mouseUpConnector);
			});
		}
	}
});

dojo.declare("dijit.form._FormValueWidget", dijit.form._FormWidget,
{
	// summary:
	//		Base class for widgets corresponding to native HTML elements such as <input> or <select> that have user changeable values.
	// description:
	//		Each _FormValueWidget represents a single input value, and has a (possibly hidden) <input> element,
	//		to which it serializes it's input value, so that form submission (either normal submission or via FormBind?)
	//		works as expected.

	// Don't attempt to mixin the 'type', 'name' attributes here programatically -- they must be declared
	// directly in the template as read by the parser in order to function. IE is known to specifically
	// require the 'name' attribute at element creation time.  See #8484, #8660.
	// TODO: unclear what that {value: ""} is for; FormWidget.attributeMap copies value to focusNode,
	// so maybe {value: ""} is so the value *doesn't* get copied to focusNode?
	// Seems like we really want value removed from attributeMap altogether
	// (although there's no easy way to do that now)

	// readOnly: Boolean
	//		Should this widget respond to user input?
	//		In markup, this is specified as "readOnly".
	//		Similar to disabled except readOnly form values are submitted.
	readOnly: false,

	attributeMap: dojo.delegate(dijit.form._FormWidget.prototype.attributeMap, {
		value: "",
		readOnly: "focusNode"
	}),

	_setReadOnlyAttr: function(/*Boolean*/ value){
		dojo.attr(this.focusNode, 'readOnly', value);
		dijit.setWaiState(this.focusNode, "readonly", value);
		this._set("readOnly", value);
	},

	postCreate: function(){
		this.inherited(arguments);

		if(dojo.isIE < 9 || (dojo.isIE && dojo.isQuirks)){ // IE won't stop the event with keypress
			this.connect(this.focusNode || this.domNode, "onkeydown", this._onKeyDown);
		}
		// Update our reset value if it hasn't yet been set (because this.set()
		// is only called when there *is* a value)
		if(this._resetValue === undefined){
			this._lastValueReported = this._resetValue = this.value;
		}
	},

	_setValueAttr: function(/*anything*/ newValue, /*Boolean?*/ priorityChange){
		// summary:
		//		Hook so set('value', value) works.
		// description:
		//		Sets the value of the widget.
		//		If the value has changed, then fire onChange event, unless priorityChange
		//		is specified as null (or false?)
		this._handleOnChange(newValue, priorityChange);
	},

	_handleOnChange: function(/*anything*/ newValue, /*Boolean?*/ priorityChange){
		// summary:
		//		Called when the value of the widget has changed.  Saves the new value in this.value,
		//		and calls onChange() if appropriate.   See _FormWidget._handleOnChange() for details.
		this._set("value", newValue);
		this.inherited(arguments);
	},

	undo: function(){
		// summary:
		//		Restore the value to the last value passed to onChange
		this._setValueAttr(this._lastValueReported, false);
	},

	reset: function(){
		// summary:
		//		Reset the widget's value to what it was at initialization time
		this._hasBeenBlurred = false;
		this._setValueAttr(this._resetValue, true);
	},

	_onKeyDown: function(e){
		if(e.keyCode == dojo.keys.ESCAPE && !(e.ctrlKey || e.altKey || e.metaKey)){
			var te;
			if(dojo.isIE){
				e.preventDefault(); // default behavior needs to be stopped here since keypress is too late
				te = document.createEventObject();
				te.keyCode = dojo.keys.ESCAPE;
				te.shiftKey = e.shiftKey;
				e.srcElement.fireEvent('onkeypress', te);
			}
		}
	},

	_layoutHackIE7: function(){
		// summary:
		//		Work around table sizing bugs on IE7 by forcing redraw

		if(dojo.isIE == 7){ // fix IE7 layout bug when the widget is scrolled out of sight
			var domNode = this.domNode;
			var parent = domNode.parentNode;
			var pingNode = domNode.firstChild || domNode; // target node most unlikely to have a custom filter
			var origFilter = pingNode.style.filter; // save custom filter, most likely nothing
			var _this = this;
			while(parent && parent.clientHeight == 0){ // search for parents that haven't rendered yet
				(function ping(){
					var disconnectHandle = _this.connect(parent, "onscroll",
						function(e){
							_this.disconnect(disconnectHandle); // only call once
							pingNode.style.filter = (new Date()).getMilliseconds(); // set to anything that's unique
							setTimeout(function(){ pingNode.style.filter = origFilter }, 0); // restore custom filter, if any
						}
					);
				})();
				parent = parent.parentNode;
			}
		}
	}
});

}

if(!dojo._hasResource["dijit._HasDropDown"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dijit._HasDropDown"] = true;
dojo.provide("dijit._HasDropDown");



dojo.declare("dijit._HasDropDown",
	null,
	{
		// summary:
		//		Mixin for widgets that need drop down ability.

		// _buttonNode: [protected] DomNode
		//		The button/icon/node to click to display the drop down.
		//		Can be set via a dojoAttachPoint assignment.
		//		If missing, then either focusNode or domNode (if focusNode is also missing) will be used.
		_buttonNode: null,

		// _arrowWrapperNode: [protected] DomNode
		//		Will set CSS class dijitUpArrow, dijitDownArrow, dijitRightArrow etc. on this node depending
		//		on where the drop down is set to be positioned.
		//		Can be set via a dojoAttachPoint assignment.
		//		If missing, then _buttonNode will be used.
		_arrowWrapperNode: null,

		// _popupStateNode: [protected] DomNode
		//		The node to set the popupActive class on.
		//		Can be set via a dojoAttachPoint assignment.
		//		If missing, then focusNode or _buttonNode (if focusNode is missing) will be used.
		_popupStateNode: null,

		// _aroundNode: [protected] DomNode
		//		The node to display the popup around.
		//		Can be set via a dojoAttachPoint assignment.
		//		If missing, then domNode will be used.
		_aroundNode: null,

		// dropDown: [protected] Widget
		//		The widget to display as a popup.  This widget *must* be
		//		defined before the startup function is called.
		dropDown: null,

		// autoWidth: [protected] Boolean
		//		Set to true to make the drop down at least as wide as this
		//		widget.  Set to false if the drop down should just be its
		//		default width
		autoWidth: true,

		// forceWidth: [protected] Boolean
		//		Set to true to make the drop down exactly as wide as this
		//		widget.  Overrides autoWidth.
		forceWidth: false,

		// maxHeight: [protected] Integer
		//		The max height for our dropdown.
		//		Any dropdown taller than this will have scrollbars.
		//		Set to 0 for no max height, or -1 to limit height to available space in viewport
		maxHeight: 0,

		// dropDownPosition: [const] String[]
		//		This variable controls the position of the drop down.
		//		It's an array of strings with the following values:
		//
		//			* before: places drop down to the left of the target node/widget, or to the right in
		//			  the case of RTL scripts like Hebrew and Arabic
		//			* after: places drop down to the right of the target node/widget, or to the left in
		//			  the case of RTL scripts like Hebrew and Arabic
		//			* above: drop down goes above target node
		//			* below: drop down goes below target node
		//
		//		The list is positions is tried, in order, until a position is found where the drop down fits
		//		within the viewport.
		//
		dropDownPosition: ["below","above"],

		// _stopClickEvents: Boolean
		//		When set to false, the click events will not be stopped, in
		//		case you want to use them in your subwidget
		_stopClickEvents: true,

		_onDropDownMouseDown: function(/*Event*/ e){
			// summary:
			//		Callback when the user mousedown's on the arrow icon

			if(this.disabled || this.readOnly){ return; }

			dojo.stopEvent(e);

			this._docHandler = this.connect(dojo.doc, "onmouseup", "_onDropDownMouseUp");

			this.toggleDropDown();
		},

		_onDropDownMouseUp: function(/*Event?*/ e){
			// summary:
			//		Callback when the user lifts their mouse after mouse down on the arrow icon.
			//		If the drop is a simple menu and the mouse is over the menu, we execute it, otherwise, we focus our
			//		dropDown node.  If the event is missing, then we are not
			//		a mouseup event.
			//
			//		This is useful for the common mouse movement pattern
			//		with native browser <select> nodes:
			//			1. mouse down on the select node (probably on the arrow)
			//			2. move mouse to a menu item while holding down the mouse button
			//			3. mouse up.  this selects the menu item as though the user had clicked it.
			if(e && this._docHandler){
				this.disconnect(this._docHandler);
			}
			var dropDown = this.dropDown, overMenu = false;

			if(e && this._opened){
				// This code deals with the corner-case when the drop down covers the original widget,
				// because it's so large.  In that case mouse-up shouldn't select a value from the menu.
				// Find out if our target is somewhere in our dropdown widget,
				// but not over our _buttonNode (the clickable node)
				var c = dojo.position(this._buttonNode, true);
				if(!(e.pageX >= c.x && e.pageX <= c.x + c.w) ||
					!(e.pageY >= c.y && e.pageY <= c.y + c.h)){
					var t = e.target;
					while(t && !overMenu){
						if(dojo.hasClass(t, "dijitPopup")){
							overMenu = true;
						}else{
							t = t.parentNode;
						}
					}
					if(overMenu){
						t = e.target;
						if(dropDown.onItemClick){
							var menuItem;
							while(t && !(menuItem = dijit.byNode(t))){
								t = t.parentNode;
							}
							if(menuItem && menuItem.onClick && menuItem.getParent){
								menuItem.getParent().onItemClick(menuItem, e);
							}
						}
						return;
					}
				}
			}
			if(this._opened && dropDown.focus && dropDown.autoFocus !== false){
				// Focus the dropdown widget - do it on a delay so that we
				// don't steal our own focus.
				window.setTimeout(dojo.hitch(dropDown, "focus"), 1);
			}
		},

		_onDropDownClick: function(/*Event*/ e){
			// the drop down was already opened on mousedown/keydown; just need to call stopEvent()
			if(this._stopClickEvents){
				dojo.stopEvent(e);
			}
		},

		buildRendering: function(){
			this.inherited(arguments);

			this._buttonNode = this._buttonNode || this.focusNode || this.domNode;
			this._popupStateNode = this._popupStateNode || this.focusNode || this._buttonNode;

			// Add a class to the "dijitDownArrowButton" type class to _buttonNode so theme can set direction of arrow
			// based on where drop down will normally appear
			var defaultPos = {
					"after" : this.isLeftToRight() ? "Right" : "Left",
					"before" : this.isLeftToRight() ? "Left" : "Right",
					"above" : "Up",
					"below" : "Down",
					"left" : "Left",
					"right" : "Right"
			}[this.dropDownPosition[0]] || this.dropDownPosition[0] || "Down";
			dojo.addClass(this._arrowWrapperNode || this._buttonNode, "dijit" + defaultPos + "ArrowButton");
		},

		postCreate: function(){
			// summary:
			//		set up nodes and connect our mouse and keypress events

			this.inherited(arguments);

			this.connect(this._buttonNode, "onmousedown", "_onDropDownMouseDown");
			this.connect(this._buttonNode, "onclick", "_onDropDownClick");
			this.connect(this.focusNode, "onkeypress", "_onKey");
			this.connect(this.focusNode, "onkeyup", "_onKeyUp");
		},

		destroy: function(){
			if(this.dropDown){
				// Destroy the drop down, unless it's already been destroyed.  This can happen because
				// the drop down is a direct child of <body> even though it's logically my child.
				if(!this.dropDown._destroyed){
					this.dropDown.destroyRecursive();
				}
				delete this.dropDown;
			}
			this.inherited(arguments);
		},

		_onKey: function(/*Event*/ e){
			// summary:
			//		Callback when the user presses a key while focused on the button node

			if(this.disabled || this.readOnly){ return; }

			var d = this.dropDown, target = e.target;
			if(d && this._opened && d.handleKey){
				if(d.handleKey(e) === false){
					/* false return code means that the drop down handled the key */
					dojo.stopEvent(e);
					return;
				}
			}
			if(d && this._opened && e.charOrCode == dojo.keys.ESCAPE){
				this.closeDropDown();
				dojo.stopEvent(e);
			}else if(!this._opened &&
					(e.charOrCode == dojo.keys.DOWN_ARROW ||
						( (e.charOrCode == dojo.keys.ENTER || e.charOrCode == " ") &&
						  //ignore enter and space if the event is for a text input
						  ((target.tagName || "").toLowerCase() !== 'input' ||
						     (target.type && target.type.toLowerCase() !== 'text'))))){
				// Toggle the drop down, but wait until keyup so that the drop down doesn't
				// get a stray keyup event, or in the case of key-repeat (because user held
				// down key for too long), stray keydown events
				this._toggleOnKeyUp = true;
				dojo.stopEvent(e);
			}
		},

		_onKeyUp: function(){
			if(this._toggleOnKeyUp){
				delete this._toggleOnKeyUp;
				this.toggleDropDown();
				var d = this.dropDown;	// drop down may not exist until toggleDropDown() call
				if(d && d.focus){
					setTimeout(dojo.hitch(d, "focus"), 1);
				}
			}
		},

		_onBlur: function(){
			// summary:
			//		Called magically when focus has shifted away from this widget and it's dropdown

			// Don't focus on button if the user has explicitly focused on something else (happens
			// when user clicks another control causing the current popup to close)..
			// But if focus is inside of the drop down then reset focus to me, because IE doesn't like
			// it when you display:none a node with focus.
			var focusMe = dijit._curFocus && this.dropDown && dojo.isDescendant(dijit._curFocus, this.dropDown.domNode);

			this.closeDropDown(focusMe);

			this.inherited(arguments);
		},

		isLoaded: function(){
			// summary:
			//		Returns whether or not the dropdown is loaded.  This can
			//		be overridden in order to force a call to loadDropDown().
			// tags:
			//		protected

			return true;
		},

		loadDropDown: function(/* Function */ loadCallback){
			// summary:
			//		Loads the data for the dropdown, and at some point, calls
			//		the given callback.   This is basically a callback when the
			//		user presses the down arrow button to open the drop down.
			// tags:
			//		protected

			loadCallback();
		},

		toggleDropDown: function(){
			// summary:
			//		Callback when the user presses the down arrow button or presses
			//		the down arrow key to open/close the drop down.
			//		Toggle the drop-down widget; if it is up, close it, if not, open it
			// tags:
			//		protected

			if(this.disabled || this.readOnly){ return; }
			if(!this._opened){
				// If we aren't loaded, load it first so there isn't a flicker
				if(!this.isLoaded()){
					this.loadDropDown(dojo.hitch(this, "openDropDown"));
					return;
				}else{
					this.openDropDown();
				}
			}else{
				this.closeDropDown();
			}
		},

		openDropDown: function(){
			// summary:
			//		Opens the dropdown for this widget.   To be called only when this.dropDown
			//		has been created and is ready to display (ie, it's data is loaded).
			// returns:
			//		return value of dijit.popup.open()
			// tags:
			//		protected

			var dropDown = this.dropDown,
				ddNode = dropDown.domNode,
				aroundNode = this._aroundNode || this.domNode,
				self = this;

			// Prepare our popup's height and honor maxHeight if it exists.

			// TODO: isn't maxHeight dependent on the return value from dijit.popup.open(),
			// ie, dependent on how much space is available (BK)

			if(!this._preparedNode){
				this._preparedNode = true;
				// Check if we have explicitly set width and height on the dropdown widget dom node
				if(ddNode.style.width){
					this._explicitDDWidth = true;
				}
				if(ddNode.style.height){
					this._explicitDDHeight = true;
				}
			}

			// Code for resizing dropdown (height limitation, or increasing width to match my width)
			if(this.maxHeight || this.forceWidth || this.autoWidth){
				var myStyle = {
					display: "",
					visibility: "hidden"
				};
				if(!this._explicitDDWidth){
					myStyle.width = "";
				}
				if(!this._explicitDDHeight){
					myStyle.height = "";
				}
				dojo.style(ddNode, myStyle);
				
				// Figure out maximum height allowed (if there is a height restriction)
				var maxHeight = this.maxHeight;
				if(maxHeight == -1){
					// limit height to space available in viewport either above or below my domNode
					// (whichever side has more room)
					var viewport = dojo.window.getBox(),
						position = dojo.position(aroundNode, false);
					maxHeight = Math.floor(Math.max(position.y, viewport.h - (position.y + position.h)));
				}

				// Attach dropDown to DOM and make make visibility:hidden rather than display:none
				// so we call startup() and also get the size
				if(dropDown.startup && !dropDown._started){
					dropDown.startup();
				}

				dijit.popup.moveOffScreen(dropDown);
				// Get size of drop down, and determine if vertical scroll bar needed
				var mb = dojo._getMarginSize(ddNode);
				var overHeight = (maxHeight && mb.h > maxHeight);
				dojo.style(ddNode, {
					overflowX: "hidden",
					overflowY: overHeight ? "auto" : "hidden"
				});
				if(overHeight){
					mb.h = maxHeight;
					if("w" in mb){
						mb.w += 16;	// room for vertical scrollbar
					}
				}else{
					delete mb.h;
				}

				// Adjust dropdown width to match or be larger than my width
				if(this.forceWidth){
					mb.w = aroundNode.offsetWidth;
				}else if(this.autoWidth){
					mb.w = Math.max(mb.w, aroundNode.offsetWidth);
				}else{
					delete mb.w;
				}
				
				// And finally, resize the dropdown to calculated height and width
				if(dojo.isFunction(dropDown.resize)){
					dropDown.resize(mb);
				}else{
					dojo.marginBox(ddNode, mb);
				}
			}

			var retVal = dijit.popup.open({
				parent: this,
				popup: dropDown,
				around: aroundNode,
				orient: dijit.getPopupAroundAlignment((this.dropDownPosition && this.dropDownPosition.length) ? this.dropDownPosition : ["below"],this.isLeftToRight()),
				onExecute: function(){
					self.closeDropDown(true);
				},
				onCancel: function(){
					self.closeDropDown(true);
				},
				onClose: function(){
					dojo.attr(self._popupStateNode, "popupActive", false);
					dojo.removeClass(self._popupStateNode, "dijitHasDropDownOpen");
					self._opened = false;
				}
			});
			dojo.attr(this._popupStateNode, "popupActive", "true");
			dojo.addClass(self._popupStateNode, "dijitHasDropDownOpen");
			this._opened=true;

			// TODO: set this.checked and call setStateClass(), to affect button look while drop down is shown
			return retVal;
		},

		closeDropDown: function(/*Boolean*/ focus){
			// summary:
			//		Closes the drop down on this widget
			// focus:
			//		If true, refocuses the button widget
			// tags:
			//		protected

			if(this._opened){
				if(focus){ this.focus(); }
				dijit.popup.close(this.dropDown);
				this._opened = false;
			}
		}

	}
);

}

if(!dojo._hasResource["dijit.form.Button"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dijit.form.Button"] = true;
dojo.provide("dijit.form.Button");





dojo.declare("dijit.form.Button",
	dijit.form._FormWidget,
	{
	// summary:
	//		Basically the same thing as a normal HTML button, but with special styling.
	// description:
	//		Buttons can display a label, an icon, or both.
	//		A label should always be specified (through innerHTML) or the label
	//		attribute.  It can be hidden via showLabel=false.
	// example:
	// |	<button dojoType="dijit.form.Button" onClick="...">Hello world</button>
	//
	// example:
	// |	var button1 = new dijit.form.Button({label: "hello world", onClick: foo});
	// |	dojo.body().appendChild(button1.domNode);

	// label: HTML String
	//		Text to display in button.
	//		If the label is hidden (showLabel=false) then and no title has
	//		been specified, then label is also set as title attribute of icon.
	label: "",

	// showLabel: Boolean
	//		Set this to true to hide the label text and display only the icon.
	//		(If showLabel=false then iconClass must be specified.)
	//		Especially useful for toolbars.
	//		If showLabel=true, the label will become the title (a.k.a. tooltip/hint) of the icon.
	//
	//		The exception case is for computers in high-contrast mode, where the label
	//		will still be displayed, since the icon doesn't appear.
	showLabel: true,

	// iconClass: String
	//		Class to apply to DOMNode in button to make it display an icon
	iconClass: "",

	// type: String
	//		Defines the type of button.  "button", "submit", or "reset".
	type: "button",

	baseClass: "dijitButton",

	templateString: dojo.cache("dijit.form", "templates/Button.html", "<span class=\"dijit dijitReset dijitInline\"\n\t><span class=\"dijitReset dijitInline dijitButtonNode\"\n\t\tdojoAttachEvent=\"ondijitclick:_onButtonClick\"\n\t\t><span class=\"dijitReset dijitStretch dijitButtonContents\"\n\t\t\tdojoAttachPoint=\"titleNode,focusNode\"\n\t\t\trole=\"button\" aria-labelledby=\"${id}_label\"\n\t\t\t><span class=\"dijitReset dijitInline dijitIcon\" dojoAttachPoint=\"iconNode\"></span\n\t\t\t><span class=\"dijitReset dijitToggleButtonIconChar\">&#x25CF;</span\n\t\t\t><span class=\"dijitReset dijitInline dijitButtonText\"\n\t\t\t\tid=\"${id}_label\"\n\t\t\t\tdojoAttachPoint=\"containerNode\"\n\t\t\t></span\n\t\t></span\n\t></span\n\t><input ${!nameAttrSetting} type=\"${type}\" value=\"${value}\" class=\"dijitOffScreen\" tabIndex=\"-1\"\n\t\tdojoAttachPoint=\"valueNode\"\n/></span>\n"),

	attributeMap: dojo.delegate(dijit.form._FormWidget.prototype.attributeMap, {
		value: "valueNode"
	}),

	_onClick: function(/*Event*/ e){
		// summary:
		//		Internal function to handle click actions
		if(this.disabled){
			return false;
		}
		this._clicked(); // widget click actions
		return this.onClick(e); // user click actions
	},

	_onButtonClick: function(/*Event*/ e){
		// summary:
		//		Handler when the user activates the button portion.
		if(this._onClick(e) === false){ // returning nothing is same as true
			e.preventDefault(); // needed for checkbox
		}else if(this.type == "submit" && !(this.valueNode||this.focusNode).form){ // see if a nonform widget needs to be signalled
			for(var node=this.domNode; node.parentNode/*#5935*/; node=node.parentNode){
				var widget=dijit.byNode(node);
				if(widget && typeof widget._onSubmit == "function"){
					widget._onSubmit(e);
					break;
				}
			}
		}else if(this.valueNode){
			this.valueNode.click();
			e.preventDefault(); // cancel BUTTON click and continue with hidden INPUT click
		}
	},

	buildRendering: function(){
		this.inherited(arguments);
		dojo.setSelectable(this.focusNode, false);
	},

	_fillContent: function(/*DomNode*/ source){
		// Overrides _Templated._fillContent().
		// If button label is specified as srcNodeRef.innerHTML rather than
		// this.params.label, handle it here.
		// TODO: remove the method in 2.0, parser will do it all for me
		if(source && (!this.params || !("label" in this.params))){
			this.set('label', source.innerHTML);
		}
	},

	_setShowLabelAttr: function(val){
		if(this.containerNode){
			dojo.toggleClass(this.containerNode, "dijitDisplayNone", !val);
		}
		this._set("showLabel", val);
	},

	onClick: function(/*Event*/ e){
		// summary:
		//		Callback for when button is clicked.
		//		If type="submit", return true to perform submit, or false to cancel it.
		// type:
		//		callback
		return true;		// Boolean
	},

	_clicked: function(/*Event*/ e){
		// summary:
		//		Internal overridable function for when the button is clicked
	},

	setLabel: function(/*String*/ content){
		// summary:
		//		Deprecated.  Use set('label', ...) instead.
		dojo.deprecated("dijit.form.Button.setLabel() is deprecated.  Use set('label', ...) instead.", "", "2.0");
		this.set("label", content);
	},

	_setLabelAttr: function(/*String*/ content){
		// summary:
		//		Hook for set('label', ...) to work.
		// description:
		//		Set the label (text) of the button; takes an HTML string.
		this._set("label", content);
		this.containerNode.innerHTML = content;
		if(this.showLabel == false && !this.params.title){
			this.titleNode.title = dojo.trim(this.containerNode.innerText || this.containerNode.textContent || '');
		}
	},

	_setIconClassAttr: function(/*String*/ val){
		// Custom method so that icon node is hidden when not in use, to avoid excess padding/margin
		// appearing around it (even if it's a 0x0 sized <img> node)

		var oldVal = this.iconClass || "dijitNoIcon",
			newVal = val || "dijitNoIcon";
		dojo.replaceClass(this.iconNode, newVal, oldVal);
		this._set("iconClass", val);
	}
});


dojo.declare("dijit.form.DropDownButton", [dijit.form.Button, dijit._Container, dijit._HasDropDown], {
	// summary:
	//		A button with a drop down
	//
	// example:
	// |	<button dojoType="dijit.form.DropDownButton" label="Hello world">
	// |		<div dojotype="dijit.Menu">...</div>
	// |	</button>
	//
	// example:
	// |	var button1 = new dijit.form.DropDownButton({ label: "hi", dropDown: new dijit.Menu(...) });
	// |	dojo.body().appendChild(button1);
	//

	baseClass : "dijitDropDownButton",

	templateString: dojo.cache("dijit.form", "templates/DropDownButton.html", "<span class=\"dijit dijitReset dijitInline\"\n\t><span class='dijitReset dijitInline dijitButtonNode'\n\t\tdojoAttachEvent=\"ondijitclick:_onButtonClick\" dojoAttachPoint=\"_buttonNode\"\n\t\t><span class=\"dijitReset dijitStretch dijitButtonContents\"\n\t\t\tdojoAttachPoint=\"focusNode,titleNode,_arrowWrapperNode\"\n\t\t\trole=\"button\" aria-haspopup=\"true\" aria-labelledby=\"${id}_label\"\n\t\t\t><span class=\"dijitReset dijitInline dijitIcon\"\n\t\t\t\tdojoAttachPoint=\"iconNode\"\n\t\t\t></span\n\t\t\t><span class=\"dijitReset dijitInline dijitButtonText\"\n\t\t\t\tdojoAttachPoint=\"containerNode,_popupStateNode\"\n\t\t\t\tid=\"${id}_label\"\n\t\t\t></span\n\t\t\t><span class=\"dijitReset dijitInline dijitArrowButtonInner\"></span\n\t\t\t><span class=\"dijitReset dijitInline dijitArrowButtonChar\">&#9660;</span\n\t\t></span\n\t></span\n\t><input ${!nameAttrSetting} type=\"${type}\" value=\"${value}\" class=\"dijitOffScreen\" tabIndex=\"-1\"\n\t\tdojoAttachPoint=\"valueNode\"\n/></span>\n"),

	_fillContent: function(){
		// Overrides Button._fillContent().
		//
		// My inner HTML contains both the button contents and a drop down widget, like
		// <DropDownButton>  <span>push me</span>  <Menu> ... </Menu> </DropDownButton>
		// The first node is assumed to be the button content. The widget is the popup.

		if(this.srcNodeRef){ // programatically created buttons might not define srcNodeRef
			//FIXME: figure out how to filter out the widget and use all remaining nodes as button
			//	content, not just nodes[0]
			var nodes = dojo.query("*", this.srcNodeRef);
			dijit.form.DropDownButton.superclass._fillContent.call(this, nodes[0]);

			// save pointer to srcNode so we can grab the drop down widget after it's instantiated
			this.dropDownContainer = this.srcNodeRef;
		}
	},

	startup: function(){
		if(this._started){ return; }

		// the child widget from srcNodeRef is the dropdown widget.  Insert it in the page DOM,
		// make it invisible, and store a reference to pass to the popup code.
		if(!this.dropDown && this.dropDownContainer){
			var dropDownNode = dojo.query("[widgetId]", this.dropDownContainer)[0];
			this.dropDown = dijit.byNode(dropDownNode);
			delete this.dropDownContainer;
		}
		if(this.dropDown){
			dijit.popup.hide(this.dropDown);
		}

		this.inherited(arguments);
	},

	isLoaded: function(){
		// Returns whether or not we are loaded - if our dropdown has an href,
		// then we want to check that.
		var dropDown = this.dropDown;
		return (!!dropDown && (!dropDown.href || dropDown.isLoaded));
	},

	loadDropDown: function(){
		// Loads our dropdown
		var dropDown = this.dropDown;
		if(!dropDown){ return; }
		if(!this.isLoaded()){
			var handler = dojo.connect(dropDown, "onLoad", this, function(){
				dojo.disconnect(handler);
				this.openDropDown();
			});
			dropDown.refresh();
		}else{
			this.openDropDown();
		}
	},

	isFocusable: function(){
		// Overridden so that focus is handled by the _HasDropDown mixin, not by
		// the _FormWidget mixin.
		return this.inherited(arguments) && !this._mouseDown;
	}
});

dojo.declare("dijit.form.ComboButton", dijit.form.DropDownButton, {
	// summary:
	//		A combination button and drop-down button.
	//		Users can click one side to "press" the button, or click an arrow
	//		icon to display the drop down.
	//
	// example:
	// |	<button dojoType="dijit.form.ComboButton" onClick="...">
	// |		<span>Hello world</span>
	// |		<div dojoType="dijit.Menu">...</div>
	// |	</button>
	//
	// example:
	// |	var button1 = new dijit.form.ComboButton({label: "hello world", onClick: foo, dropDown: "myMenu"});
	// |	dojo.body().appendChild(button1.domNode);
	//

	templateString: dojo.cache("dijit.form", "templates/ComboButton.html", "<table class=\"dijit dijitReset dijitInline dijitLeft\"\n\tcellspacing='0' cellpadding='0' role=\"presentation\"\n\t><tbody role=\"presentation\"><tr role=\"presentation\"\n\t\t><td class=\"dijitReset dijitStretch dijitButtonNode\" dojoAttachPoint=\"buttonNode\" dojoAttachEvent=\"ondijitclick:_onButtonClick,onkeypress:_onButtonKeyPress\"\n\t\t><div id=\"${id}_button\" class=\"dijitReset dijitButtonContents\"\n\t\t\tdojoAttachPoint=\"titleNode\"\n\t\t\trole=\"button\" aria-labelledby=\"${id}_label\"\n\t\t\t><div class=\"dijitReset dijitInline dijitIcon\" dojoAttachPoint=\"iconNode\" role=\"presentation\"></div\n\t\t\t><div class=\"dijitReset dijitInline dijitButtonText\" id=\"${id}_label\" dojoAttachPoint=\"containerNode\" role=\"presentation\"></div\n\t\t></div\n\t\t></td\n\t\t><td id=\"${id}_arrow\" class='dijitReset dijitRight dijitButtonNode dijitArrowButton'\n\t\t\tdojoAttachPoint=\"_popupStateNode,focusNode,_buttonNode\"\n\t\t\tdojoAttachEvent=\"onkeypress:_onArrowKeyPress\"\n\t\t\ttitle=\"${optionsTitle}\"\n\t\t\trole=\"button\" aria-haspopup=\"true\"\n\t\t\t><div class=\"dijitReset dijitArrowButtonInner\" role=\"presentation\"></div\n\t\t\t><div class=\"dijitReset dijitArrowButtonChar\" role=\"presentation\">&#9660;</div\n\t\t></td\n\t\t><td style=\"display:none !important;\"\n\t\t\t><input ${!nameAttrSetting} type=\"${type}\" value=\"${value}\" dojoAttachPoint=\"valueNode\"\n\t\t/></td></tr></tbody\n></table>\n"),

	attributeMap: dojo.mixin(dojo.clone(dijit.form.Button.prototype.attributeMap), {
		id: "",
		tabIndex: ["focusNode", "titleNode"],
		title: "titleNode"
	}),

	// optionsTitle: String
	//		Text that describes the options menu (accessibility)
	optionsTitle: "",

	baseClass: "dijitComboButton",

	// Set classes like dijitButtonContentsHover or dijitArrowButtonActive depending on
	// mouse action over specified node
	cssStateNodes: {
		"buttonNode": "dijitButtonNode",
		"titleNode": "dijitButtonContents",
		"_popupStateNode": "dijitDownArrowButton"
	},

	_focusedNode: null,

	_onButtonKeyPress: function(/*Event*/ evt){
		// summary:
		//		Handler for right arrow key when focus is on left part of button
		if(evt.charOrCode == dojo.keys[this.isLeftToRight() ? "RIGHT_ARROW" : "LEFT_ARROW"]){
			dijit.focus(this._popupStateNode);
			dojo.stopEvent(evt);
		}
	},

	_onArrowKeyPress: function(/*Event*/ evt){
		// summary:
		//		Handler for left arrow key when focus is on right part of button
		if(evt.charOrCode == dojo.keys[this.isLeftToRight() ? "LEFT_ARROW" : "RIGHT_ARROW"]){
			dijit.focus(this.titleNode);
			dojo.stopEvent(evt);
		}
	},
	
	focus: function(/*String*/ position){
		// summary:
		//		Focuses this widget to according to position, if specified,
		//		otherwise on arrow node
		// position:
		//		"start" or "end"
		if(!this.disabled){
			dijit.focus(position == "start" ? this.titleNode : this._popupStateNode);
		}
	}
});

dojo.declare("dijit.form.ToggleButton", dijit.form.Button, {
	// summary:
	//		A button that can be in two states (checked or not).
	//		Can be base class for things like tabs or checkbox or radio buttons

	baseClass: "dijitToggleButton",

	// checked: Boolean
	//		Corresponds to the native HTML <input> element's attribute.
	//		In markup, specified as "checked='checked'" or just "checked".
	//		True if the button is depressed, or the checkbox is checked,
	//		or the radio button is selected, etc.
	checked: false,

	attributeMap: dojo.mixin(dojo.clone(dijit.form.Button.prototype.attributeMap), {
		checked:"focusNode"
	}),

	_clicked: function(/*Event*/ evt){
		this.set('checked', !this.checked);
	},

	_setCheckedAttr: function(/*Boolean*/ value, /*Boolean?*/ priorityChange){
		this._set("checked", value);
		dojo.attr(this.focusNode || this.domNode, "checked", value);
		dijit.setWaiState(this.focusNode || this.domNode, "pressed", value);
		this._handleOnChange(value, priorityChange);
	},

	setChecked: function(/*Boolean*/ checked){
		// summary:
		//		Deprecated.  Use set('checked', true/false) instead.
		dojo.deprecated("setChecked("+checked+") is deprecated. Use set('checked',"+checked+") instead.", "", "2.0");
		this.set('checked', checked);
	},

	reset: function(){
		// summary:
		//		Reset the widget's value to what it was at initialization time

		this._hasBeenBlurred = false;

		// set checked state to original setting
		this.set('checked', this.params.checked || false);
	}
});

}

if(!dojo._hasResource["dijit.form.TextBox"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dijit.form.TextBox"] = true;
dojo.provide("dijit.form.TextBox");



dojo.declare(
	"dijit.form.TextBox",
	dijit.form._FormValueWidget,
	{
		// summary:
		//		A base class for textbox form inputs

		// trim: Boolean
		//		Removes leading and trailing whitespace if true.  Default is false.
		trim: false,

		// uppercase: Boolean
		//		Converts all characters to uppercase if true.  Default is false.
		uppercase: false,

		// lowercase: Boolean
		//		Converts all characters to lowercase if true.  Default is false.
		lowercase: false,

		// propercase: Boolean
		//		Converts the first character of each word to uppercase if true.
		propercase: false,

		// maxLength: String
		//		HTML INPUT tag maxLength declaration.
		maxLength: "",

		// selectOnClick: [const] Boolean
		//		If true, all text will be selected when focused with mouse
		selectOnClick: false,

		// placeHolder: String
		//		Defines a hint to help users fill out the input field (as defined in HTML 5).
		//		This should only contain plain text (no html markup).
		placeHolder: "",
		
		templateString: dojo.cache("dijit.form", "templates/TextBox.html", "<div class=\"dijit dijitReset dijitInline dijitLeft\" id=\"widget_${id}\" role=\"presentation\"\n\t><div class=\"dijitReset dijitInputField dijitInputContainer\"\n\t\t><input class=\"dijitReset dijitInputInner\" dojoAttachPoint='textbox,focusNode' autocomplete=\"off\"\n\t\t\t${!nameAttrSetting} type='${type}'\n\t/></div\n></div>\n"),
		_singleNodeTemplate: '<input class="dijit dijitReset dijitLeft dijitInputField" dojoAttachPoint="textbox,focusNode" autocomplete="off" type="${type}" ${!nameAttrSetting} />',

		_buttonInputDisabled: dojo.isIE ? "disabled" : "", // allows IE to disallow focus, but Firefox cannot be disabled for mousedown events

		baseClass: "dijitTextBox",

		attributeMap: dojo.delegate(dijit.form._FormValueWidget.prototype.attributeMap, {
			maxLength: "focusNode"
		}),
		
		postMixInProperties: function(){
			var type = this.type.toLowerCase();
			if(this.templateString && this.templateString.toLowerCase() == "input" || ((type == "hidden" || type == "file") && this.templateString == dijit.form.TextBox.prototype.templateString)){
				this.templateString = this._singleNodeTemplate;
			}
			this.inherited(arguments);
		},

		_setPlaceHolderAttr: function(v){
			this._set("placeHolder", v);
			if(!this._phspan){
				this._attachPoints.push('_phspan');
				/* dijitInputField class gives placeHolder same padding as the input field
				 * parent node already has dijitInputField class but it doesn't affect this <span>
				 * since it's position: absolute.
				 */
				this._phspan = dojo.create('span',{className:'dijitPlaceHolder dijitInputField'},this.textbox,'after');
			}
			this._phspan.innerHTML="";
			this._phspan.appendChild(document.createTextNode(v));
			
			this._updatePlaceHolder();
		},
		
		_updatePlaceHolder: function(){
			if(this._phspan){
				this._phspan.style.display=(this.placeHolder&&!this._focused&&!this.textbox.value)?"":"none";
			}
		},

		_getValueAttr: function(){
			// summary:
			//		Hook so get('value') works as we like.
			// description:
			//		For `dijit.form.TextBox` this basically returns the value of the <input>.
			//
			//		For `dijit.form.MappedTextBox` subclasses, which have both
			//		a "displayed value" and a separate "submit value",
			//		This treats the "displayed value" as the master value, computing the
			//		submit value from it via this.parse().
			return this.parse(this.get('displayedValue'), this.constraints);
		},

		_setValueAttr: function(value, /*Boolean?*/ priorityChange, /*String?*/ formattedValue){
			// summary:
			//		Hook so set('value', ...) works.
			//
			// description:
			//		Sets the value of the widget to "value" which can be of
			//		any type as determined by the widget.
			//
			// value:
			//		The visual element value is also set to a corresponding,
			//		but not necessarily the same, value.
			//
			// formattedValue:
			//		If specified, used to set the visual element value,
			//		otherwise a computed visual value is used.
			//
			// priorityChange:
			//		If true, an onChange event is fired immediately instead of
			//		waiting for the next blur event.

			var filteredValue;
			if(value !== undefined){
				// TODO: this is calling filter() on both the display value and the actual value.
				// I added a comment to the filter() definition about this, but it should be changed.
				filteredValue = this.filter(value);
				if(typeof formattedValue != "string"){
					if(filteredValue !== null && ((typeof filteredValue != "number") || !isNaN(filteredValue))){
						formattedValue = this.filter(this.format(filteredValue, this.constraints));
					}else{ formattedValue = ''; }
				}
			}
			if(formattedValue != null && formattedValue != undefined && ((typeof formattedValue) != "number" || !isNaN(formattedValue)) && this.textbox.value != formattedValue){
				this.textbox.value = formattedValue;
				this._set("displayedValue", this.get("displayedValue"));
			}

			this._updatePlaceHolder();

			this.inherited(arguments, [filteredValue, priorityChange]);
		},

		// displayedValue: String
		//		For subclasses like ComboBox where the displayed value
		//		(ex: Kentucky) and the serialized value (ex: KY) are different,
		//		this represents the displayed value.
		//
		//		Setting 'displayedValue' through set('displayedValue', ...)
		//		updates 'value', and vice-versa.  Otherwise 'value' is updated
		//		from 'displayedValue' periodically, like onBlur etc.
		//
		//		TODO: move declaration to MappedTextBox?
		//		Problem is that ComboBox references displayedValue,
		//		for benefit of FilteringSelect.
		displayedValue: "",

		getDisplayedValue: function(){
			// summary:
			//		Deprecated.  Use get('displayedValue') instead.
			// tags:
			//		deprecated
			dojo.deprecated(this.declaredClass+"::getDisplayedValue() is deprecated. Use set('displayedValue') instead.", "", "2.0");
			return this.get('displayedValue');
		},

		_getDisplayedValueAttr: function(){
			// summary:
			//		Hook so get('displayedValue') works.
			// description:
			//		Returns the displayed value (what the user sees on the screen),
			// 		after filtering (ie, trimming spaces etc.).
			//
			//		For some subclasses of TextBox (like ComboBox), the displayed value
			//		is different from the serialized value that's actually
			//		sent to the server (see dijit.form.ValidationTextBox.serialize)

			// TODO: maybe we should update this.displayedValue on every keystroke so that we don't need
			// this method
			// TODO: this isn't really the displayed value when the user is typing
			return this.filter(this.textbox.value);
		},

		setDisplayedValue: function(/*String*/ value){
			// summary:
			//		Deprecated.  Use set('displayedValue', ...) instead.
			// tags:
			//		deprecated
			dojo.deprecated(this.declaredClass+"::setDisplayedValue() is deprecated. Use set('displayedValue', ...) instead.", "", "2.0");
			this.set('displayedValue', value);
		},

		_setDisplayedValueAttr: function(/*String*/ value){
			// summary:
			//		Hook so set('displayedValue', ...) works.
			// description:
			//		Sets the value of the visual element to the string "value".
			//		The widget value is also set to a corresponding,
			//		but not necessarily the same, value.

			if(value === null || value === undefined){ value = '' }
			else if(typeof value != "string"){ value = String(value) }

			this.textbox.value = value;

			// sets the serialized value to something corresponding to specified displayedValue
			// (if possible), and also updates the textbox.value, for example converting "123"
			// to "123.00"
			this._setValueAttr(this.get('value'), undefined);

			this._set("displayedValue", this.get('displayedValue'));
		},

		format: function(/*String*/ value, /*Object*/ constraints){
			// summary:
			//		Replacable function to convert a value to a properly formatted string.
			// tags:
			//		protected extension
			return ((value == null || value == undefined) ? "" : (value.toString ? value.toString() : value));
		},

		parse: function(/*String*/ value, /*Object*/ constraints){
			// summary:
			//		Replacable function to convert a formatted string to a value
			// tags:
			//		protected extension

			return value;	// String
		},

		_refreshState: function(){
			// summary:
			//		After the user types some characters, etc., this method is
			//		called to check the field for validity etc.  The base method
			//		in `dijit.form.TextBox` does nothing, but subclasses override.
			// tags:
			//		protected
		},

		_onInput: function(e){
			if(e && e.type && /key/i.test(e.type) && e.keyCode){
				switch(e.keyCode){
					case dojo.keys.SHIFT:
					case dojo.keys.ALT:
					case dojo.keys.CTRL:
					case dojo.keys.TAB:
						return;
				}
			}
			if(this.intermediateChanges){
				var _this = this;
				// the setTimeout allows the key to post to the widget input box
				setTimeout(function(){ _this._handleOnChange(_this.get('value'), false); }, 0);
			}
			this._refreshState();

			// In case someone is watch()'ing for changes to displayedValue
			this._set("displayedValue", this.get("displayedValue"));
		},

		postCreate: function(){
			if(dojo.isIE){ // IE INPUT tag fontFamily has to be set directly using STYLE
				// the setTimeout gives IE a chance to render the TextBox and to deal with font inheritance
				setTimeout(dojo.hitch(this, function(){
				var s = dojo.getComputedStyle(this.domNode);
				if(s){
					var ff = s.fontFamily;
					if(ff){
						var inputs = this.domNode.getElementsByTagName("INPUT");
						if(inputs){
							for(var i=0; i < inputs.length; i++){
								inputs[i].style.fontFamily = ff;
							}
						}
					}
				}
				}), 0);
			}

			// setting the value here is needed since value="" in the template causes "undefined"
			// and setting in the DOM (instead of the JS object) helps with form reset actions
			this.textbox.setAttribute("value", this.textbox.value); // DOM and JS values should be the same

			this.inherited(arguments);

			if(dojo.isMoz || dojo.isOpera){
				this.connect(this.textbox, "oninput", "_onInput");
			}else{
				this.connect(this.textbox, "onkeydown", "_onInput");
				this.connect(this.textbox, "onkeyup", "_onInput");
				this.connect(this.textbox, "onpaste", "_onInput");
				this.connect(this.textbox, "oncut", "_onInput");
			}
		},

		_blankValue: '', // if the textbox is blank, what value should be reported
		filter: function(val){
			// summary:
			//		Auto-corrections (such as trimming) that are applied to textbox
			//		value on blur or form submit.
			// description:
			//		For MappedTextBox subclasses, this is called twice
			// 			- once with the display value
			//			- once the value as set/returned by set('value', ...)
			//		and get('value'), ex: a Number for NumberTextBox.
			//
			//		In the latter case it does corrections like converting null to NaN.  In
			//		the former case the NumberTextBox.filter() method calls this.inherited()
			//		to execute standard trimming code in TextBox.filter().
			//
			//		TODO: break this into two methods in 2.0
			//
			// tags:
			//		protected extension
			if(val === null){ return this._blankValue; }
			if(typeof val != "string"){ return val; }
			if(this.trim){
				val = dojo.trim(val);
			}
			if(this.uppercase){
				val = val.toUpperCase();
			}
			if(this.lowercase){
				val = val.toLowerCase();
			}
			if(this.propercase){
				val = val.replace(/[^\s]+/g, function(word){
					return word.substring(0,1).toUpperCase() + word.substring(1);
				});
			}
			return val;
		},

		_setBlurValue: function(){
			this._setValueAttr(this.get('value'), true);
		},

		_onBlur: function(e){
			if(this.disabled){ return; }
			this._setBlurValue();
			this.inherited(arguments);

			if(this._selectOnClickHandle){
				this.disconnect(this._selectOnClickHandle);
			}
			if(this.selectOnClick && dojo.isMoz){
				this.textbox.selectionStart = this.textbox.selectionEnd = undefined; // clear selection so that the next mouse click doesn't reselect
			}
			
			this._updatePlaceHolder();
		},

		_onFocus: function(/*String*/ by){
			if(this.disabled || this.readOnly){ return; }

			// Select all text on focus via click if nothing already selected.
			// Since mouse-up will clear the selection need to defer selection until after mouse-up.
			// Don't do anything on focus by tabbing into the widget since there's no associated mouse-up event.
			if(this.selectOnClick && by == "mouse"){
				this._selectOnClickHandle = this.connect(this.domNode, "onmouseup", function(){
					// Only select all text on first click; otherwise users would have no way to clear
					// the selection.
					this.disconnect(this._selectOnClickHandle);

					// Check if the user selected some text manually (mouse-down, mouse-move, mouse-up)
					// and if not, then select all the text
					var textIsNotSelected;
					if(dojo.isIE){
						var range = dojo.doc.selection.createRange();
						var parent = range.parentElement();
						textIsNotSelected = parent == this.textbox && range.text.length == 0;
					}else{
						textIsNotSelected = this.textbox.selectionStart == this.textbox.selectionEnd;
					}
					if(textIsNotSelected){
						dijit.selectInputText(this.textbox);
					}
				});
			}

			this._updatePlaceHolder();
			
			// call this.inherited() before refreshState(), since this.inherited() will possibly scroll the viewport
			// (to scroll the TextBox into view), which will affect how _refreshState() positions the tooltip
			this.inherited(arguments);

			this._refreshState();
		},

		reset: function(){
			// Overrides dijit._FormWidget.reset().
			// Additionally resets the displayed textbox value to ''
			this.textbox.value = '';
			this.inherited(arguments);
		}
	}
);

dijit.selectInputText = function(/*DomNode*/ element, /*Number?*/ start, /*Number?*/ stop){
	// summary:
	//		Select text in the input element argument, from start (default 0), to stop (default end).

	// TODO: use functions in _editor/selection.js?
	var _window = dojo.global;
	var _document = dojo.doc;
	element = dojo.byId(element);
	if(isNaN(start)){ start = 0; }
	if(isNaN(stop)){ stop = element.value ? element.value.length : 0; }
	dijit.focus(element);
	if(_document["selection"] && dojo.body()["createTextRange"]){ // IE
		if(element.createTextRange){
			var r = element.createTextRange();
			r.collapse(true);
			r.moveStart("character", -99999); // move to 0
			r.moveStart("character", start); // delta from 0 is the correct position
			r.moveEnd("character", stop-start);
			r.select();
		}
	}else if(_window["getSelection"]){
		if(element.setSelectionRange){
			element.setSelectionRange(start, stop);
		}
	}
};

}

if(!dojo._hasResource["dijit.InlineEditBox"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dijit.InlineEditBox"] = true;
dojo.provide("dijit.InlineEditBox");








dojo.declare("dijit.InlineEditBox",
	dijit._Widget,
	{
	// summary:
	//		An element with in-line edit capabilites
	//
	// description:
	//		Behavior for an existing node (`<p>`, `<div>`, `<span>`, etc.) so that
	// 		when you click it, an editor shows up in place of the original
	//		text.  Optionally, Save and Cancel button are displayed below the edit widget.
	//		When Save is clicked, the text is pulled from the edit
	//		widget and redisplayed and the edit widget is again hidden.
	//		By default a plain Textarea widget is used as the editor (or for
	//		inline values a TextBox), but you can specify an editor such as
	//		dijit.Editor (for editing HTML) or a Slider (for adjusting a number).
	//		An edit widget must support the following API to be used:
	//			- displayedValue or value as initialization parameter,
	//			and available through set('displayedValue') / set('value')
	//			- void focus()
	//			- DOM-node focusNode = node containing editable text

	// editing: [readonly] Boolean
	//		Is the node currently in edit mode?
	editing: false,

	// autoSave: Boolean
	//		Changing the value automatically saves it; don't have to push save button
	//		(and save button isn't even displayed)
	autoSave: true,

	// buttonSave: String
	//		Save button label
	buttonSave: "",

	// buttonCancel: String
	//		Cancel button label
	buttonCancel: "",

	// renderAsHtml: Boolean
	//		Set this to true if the specified Editor's value should be interpreted as HTML
	//		rather than plain text (ex: `dijit.Editor`)
	renderAsHtml: false,

	// editor: String|Function
	//		Class name (or reference to the Class) for Editor widget
	editor: "dijit.form.TextBox",

	// editorWrapper: String|Function
	//		Class name (or reference to the Class) for widget that wraps the editor widget, displaying save/cancel
	//		buttons.
	editorWrapper: "dijit._InlineEditor",

	// editorParams: Object
	//		Set of parameters for editor, like {required: true}
	editorParams: {},

	// disabled: Boolean
	//		If true, clicking the InlineEditBox to edit it will have no effect.
	disabled: false,

	onChange: function(value){
		// summary:
		//		Set this handler to be notified of changes to value.
		// tags:
		//		callback
	},

	onCancel: function(){
		// summary:
		//		Set this handler to be notified when editing is cancelled.
		// tags:
		//		callback
	},

	// width: String
	//		Width of editor.  By default it's width=100% (ie, block mode).
	width: "100%",

	// value: String
	//		The display value of the widget in read-only mode
	value: "",

	// noValueIndicator: [const] String
	//		The text that gets displayed when there is no value (so that the user has a place to click to edit)
	noValueIndicator: dojo.isIE <= 6 ?	// font-family needed on IE6 but it messes up IE8
		"<span style='font-family: wingdings; text-decoration: underline;'>&nbsp;&nbsp;&nbsp;&nbsp;&#x270d;&nbsp;&nbsp;&nbsp;&nbsp;</span>" :
		"<span style='text-decoration: underline;'>&nbsp;&nbsp;&nbsp;&nbsp;&#x270d;&nbsp;&nbsp;&nbsp;&nbsp;</span>",

	constructor: function(){
		// summary:
		//		Sets up private arrays etc.
		// tags:
		//		private
		this.editorParams = {};
	},

	postMixInProperties: function(){
		this.inherited(arguments);

		// save pointer to original source node, since Widget nulls-out srcNodeRef
		this.displayNode = this.srcNodeRef;

		// connect handlers to the display node
		var events = {
			ondijitclick: "_onClick",
			onmouseover: "_onMouseOver",
			onmouseout: "_onMouseOut",
			onfocus: "_onMouseOver",
			onblur: "_onMouseOut"
		};
		for(var name in events){
			this.connect(this.displayNode, name, events[name]);
		}
		dijit.setWaiRole(this.displayNode, "button");
		if(!this.displayNode.getAttribute("tabIndex")){
			this.displayNode.setAttribute("tabIndex", 0);
		}

		if(!this.value && !("value" in this.params)){ // "" is a good value if specified directly so check params){
		   this.value = dojo.trim(this.renderAsHtml ? this.displayNode.innerHTML :
		      (this.displayNode.innerText||this.displayNode.textContent||""));
		}
		if(!this.value){
		    this.displayNode.innerHTML = this.noValueIndicator;
		}

		dojo.addClass(this.displayNode, 'dijitInlineEditBoxDisplayMode');
	},

	setDisabled: function(/*Boolean*/ disabled){
		// summary:
		//		Deprecated.   Use set('disabled', ...) instead.
		// tags:
		//		deprecated
		dojo.deprecated("dijit.InlineEditBox.setDisabled() is deprecated.  Use set('disabled', bool) instead.", "", "2.0");
		this.set('disabled', disabled);
	},

	_setDisabledAttr: function(/*Boolean*/ disabled){
		// summary:
		//		Hook to make set("disabled", ...) work.
		//		Set disabled state of widget.
		dijit.setWaiState(this.domNode, "disabled", disabled);
		if(disabled){
			this.displayNode.removeAttribute("tabIndex");
		}else{
			this.displayNode.setAttribute("tabIndex", 0);
		}
		dojo.toggleClass(this.displayNode, "dijitInlineEditBoxDisplayModeDisabled", disabled);
		this._set("disabled", disabled);
	},

	_onMouseOver: function(){
		// summary:
		//		Handler for onmouseover and onfocus event.
		// tags:
		//		private
		if(!this.disabled){
			dojo.addClass(this.displayNode, "dijitInlineEditBoxDisplayModeHover");
		}
	},

	_onMouseOut: function(){
		// summary:
		//		Handler for onmouseout and onblur event.
		// tags:
		//		private
		dojo.removeClass(this.displayNode, "dijitInlineEditBoxDisplayModeHover");
	},

	_onClick: function(/*Event*/ e){
		// summary:
		//		Handler for onclick event.
		// tags:
		//		private
		if(this.disabled){ return; }
		if(e){ dojo.stopEvent(e); }
		this._onMouseOut();

		// Since FF gets upset if you move a node while in an event handler for that node...
		setTimeout(dojo.hitch(this, "edit"), 0);
	},

	edit: function(){
		// summary:
		//		Display the editor widget in place of the original (read only) markup.
		// tags:
		//		private

		if(this.disabled || this.editing){ return; }
		this.editing = true;

		// save some display node values that can be restored later
		this._savedPosition = dojo.style(this.displayNode, "position") || "static";
		this._savedOpacity = dojo.style(this.displayNode, "opacity") || "1";
		this._savedTabIndex = dojo.attr(this.displayNode, "tabIndex") || "0";

		if(this.wrapperWidget){
			var ew = this.wrapperWidget.editWidget;
			ew.set("displayedValue" in ew ? "displayedValue" : "value", this.value);
		}else{
			// Placeholder for edit widget
			// Put place holder (and eventually editWidget) before the display node so that it's positioned correctly
			// when Calendar dropdown appears, which happens automatically on focus.
			var placeholder = dojo.create("span", null, this.domNode, "before");

			// Create the editor wrapper (the thing that holds the editor widget and the save/cancel buttons)
			var ewc = typeof this.editorWrapper == "string" ? dojo.getObject(this.editorWrapper) : this.editorWrapper;
			this.wrapperWidget = new ewc({
				value: this.value,
				buttonSave: this.buttonSave,
				buttonCancel: this.buttonCancel,
				dir: this.dir,
				lang: this.lang,
				tabIndex: this._savedTabIndex,
				editor: this.editor,
				inlineEditBox: this,
				sourceStyle: dojo.getComputedStyle(this.displayNode),
				save: dojo.hitch(this, "save"),
				cancel: dojo.hitch(this, "cancel")
			}, placeholder);
			if(!this._started){
				this.startup();
			}
		}
		var ww = this.wrapperWidget;

		if(dojo.isIE){
			dijit.focus(dijit.getFocus()); // IE (at least 8) needs help with tab order changes
		}
		// to avoid screen jitter, we first create the editor with position:absolute, visibility:hidden,
		// and then when it's finished rendering, we switch from display mode to editor
		// position:absolute releases screen space allocated to the display node
		// opacity:0 is the same as visibility:hidden but is still focusable
		// visiblity:hidden removes focus outline

		dojo.style(this.displayNode, { position: "absolute", opacity: "0", display: "none" }); // makes display node invisible, display style used for focus-ability
		dojo.style(ww.domNode, { position: this._savedPosition, visibility: "visible", opacity: "1" });
		dojo.attr(this.displayNode, "tabIndex", "-1"); // needed by WebKit for TAB from editor to skip displayNode

		// Replace the display widget with edit widget, leaving them both displayed for a brief time so that
		// focus can be shifted without incident.  (browser may needs some time to render the editor.)
		setTimeout(dojo.hitch(this, function(){
			ww.focus(); // both nodes are showing, so we can switch focus safely
			ww._resetValue = ww.getValue();
		}), 0);
	},

	_onBlur: function(){
		// summary:
		//		Called when focus moves outside the InlineEditBox.
		//		Performs garbage collection.
		// tags:
		//		private

		this.inherited(arguments);
		if(!this.editing){
			/* causes IE focus problems, see TooltipDialog_a11y.html...
			setTimeout(dojo.hitch(this, function(){
				if(this.wrapperWidget){
					this.wrapperWidget.destroy();
					delete this.wrapperWidget;
				}
			}), 0);
			*/
		}
	},

	destroy: function(){
		if(this.wrapperWidget && !this.wrapperWidget._destroyed){
			this.wrapperWidget.destroy();
			delete this.wrapperWidget;
		}
		this.inherited(arguments);
	},

	_showText: function(/*Boolean*/ focus){
		// summary:
		//		Revert to display mode, and optionally focus on display node
		// tags:
		//		private

		var ww = this.wrapperWidget;
		dojo.style(ww.domNode, { position: "absolute", visibility: "hidden", opacity: "0" }); // hide the editor from mouse/keyboard events
		dojo.style(this.displayNode, { position: this._savedPosition, opacity: this._savedOpacity, display: "" }); // make the original text visible
		dojo.attr(this.displayNode, "tabIndex", this._savedTabIndex);
		if(focus){
			dijit.focus(this.displayNode);
		}
	},

	save: function(/*Boolean*/ focus){
		// summary:
		//		Save the contents of the editor and revert to display mode.
		// focus: Boolean
		//		Focus on the display mode text
		// tags:
		//		private

		if(this.disabled || !this.editing){ return; }
		this.editing = false;

		var ww = this.wrapperWidget;
		var value = ww.getValue();
		this.set('value', value); // display changed, formatted value

		this._showText(focus); // set focus as needed
	},

	setValue: function(/*String*/ val){
		// summary:
		//		Deprecated.   Use set('value', ...) instead.
		// tags:
		//		deprecated
		dojo.deprecated("dijit.InlineEditBox.setValue() is deprecated.  Use set('value', ...) instead.", "", "2.0");
		return this.set("value", val);
	},

	_setValueAttr: function(/*String*/ val){
		// summary:
		// 		Hook to make set("value", ...) work.
		//		Inserts specified HTML value into this node, or an "input needed" character if node is blank.

		val = dojo.trim(val);
		var renderVal = this.renderAsHtml ? val : val.replace(/&/gm, "&amp;").replace(/</gm, "&lt;").replace(/>/gm, "&gt;").replace(/"/gm, "&quot;").replace(/\n/g, "<br>");
		this.displayNode.innerHTML = renderVal || this.noValueIndicator;
		this._set("value", val);

		if(this._started){
			// tell the world that we have changed
			setTimeout(dojo.hitch(this, "onChange", val), 0); // setTimeout prevents browser freeze for long-running event handlers
		}
	},

	getValue: function(){
		// summary:
		//		Deprecated.   Use get('value') instead.
		// tags:
		//		deprecated
		dojo.deprecated("dijit.InlineEditBox.getValue() is deprecated.  Use get('value') instead.", "", "2.0");
		return this.get("value");
	},

	cancel: function(/*Boolean*/ focus){
		// summary:
		//		Revert to display mode, discarding any changes made in the editor
		// tags:
		//		private

		if(this.disabled || !this.editing){ return; }
		this.editing = false;

		// tell the world that we have no changes
		setTimeout(dojo.hitch(this, "onCancel"), 0); // setTimeout prevents browser freeze for long-running event handlers

		this._showText(focus);
	}
});

dojo.declare(
	"dijit._InlineEditor",
	 [dijit._Widget, dijit._Templated],
{
	// summary:
	// 		Internal widget used by InlineEditBox, displayed when in editing mode
	//		to display the editor and maybe save/cancel buttons.  Calling code should
	//		connect to save/cancel methods to detect when editing is finished
	//
	//		Has mainly the same parameters as InlineEditBox, plus these values:
	//
	// style: Object
	//		Set of CSS attributes of display node, to replicate in editor
	//
	// value: String
	//		Value as an HTML string or plain text string, depending on renderAsHTML flag

	templateString: dojo.cache("dijit", "templates/InlineEditBox.html", "<span data-dojo-attach-point=\"editNode\" role=\"presentation\" style=\"position: absolute; visibility:hidden\" class=\"dijitReset dijitInline\"\n\tdata-dojo-attach-event=\"onkeypress: _onKeyPress\"\n\t><span data-dojo-attach-point=\"editorPlaceholder\"></span\n\t><span data-dojo-attach-point=\"buttonContainer\"\n\t\t><button data-dojo-type=\"dijit.form.Button\" data-dojo-props=\"label: '${buttonSave}', 'class': 'saveButton'\"\n\t\t\tdata-dojo-attach-point=\"saveButton\" data-dojo-attach-event=\"onClick:save\"></button\n\t\t><button data-dojo-type=\"dijit.form.Button\"  data-dojo-props=\"label: '${buttonCancel}', 'class': 'cancelButton'\"\n\t\t\tdata-dojo-attach-point=\"cancelButton\" data-dojo-attach-event=\"onClick:cancel\"></button\n\t></span\n></span>\n"),
	widgetsInTemplate: true,

	postMixInProperties: function(){
		this.inherited(arguments);
		this.messages = dojo.i18n.getLocalization("dijit", "common", this.lang);
		dojo.forEach(["buttonSave", "buttonCancel"], function(prop){
			if(!this[prop]){ this[prop] = this.messages[prop]; }
		}, this);
	},

	buildRendering: function(){
		this.inherited(arguments);

		// Create edit widget in place in the template
		var cls = typeof this.editor == "string" ? dojo.getObject(this.editor) : this.editor;

		// Copy the style from the source
		// Don't copy ALL properties though, just the necessary/applicable ones.
		// wrapperStyle/destStyle code is to workaround IE bug where getComputedStyle().fontSize
		// is a relative value like 200%, rather than an absolute value like 24px, and
		// the 200% can refer *either* to a setting on the node or it's ancestor (see #11175)
		var srcStyle = this.sourceStyle,
			editStyle = "line-height:" + srcStyle.lineHeight + ";",
			destStyle = dojo.getComputedStyle(this.domNode);
		dojo.forEach(["Weight","Family","Size","Style"], function(prop){
			var textStyle = srcStyle["font"+prop],
				wrapperStyle = destStyle["font"+prop];
			if(wrapperStyle != textStyle){
				editStyle += "font-"+prop+":"+srcStyle["font"+prop]+";";
			}
		}, this);
		dojo.forEach(["marginTop","marginBottom","marginLeft", "marginRight"], function(prop){
			this.domNode.style[prop] = srcStyle[prop];
		}, this);
		var width = this.inlineEditBox.width;
		if(width == "100%"){
			// block mode
			editStyle += "width:100%;";
			this.domNode.style.display = "block";
		}else{
			// inline-block mode
			editStyle += "width:" + (width + (Number(width) == width ? "px" : "")) + ";";
		}
		var editorParams = dojo.delegate(this.inlineEditBox.editorParams, {
			style: editStyle,
			dir: this.dir,
			lang: this.lang
		});
		editorParams[ "displayedValue" in cls.prototype ? "displayedValue" : "value"] = this.value;
		this.editWidget = new cls(editorParams, this.editorPlaceholder);

		if(this.inlineEditBox.autoSave){
			// Remove the save/cancel buttons since saving is done by simply tabbing away or
			// selecting a value from the drop down list
			dojo.destroy(this.buttonContainer);
		}
	},

	postCreate: function(){
		this.inherited(arguments);

		var ew = this.editWidget;

		if(this.inlineEditBox.autoSave){
			// Selecting a value from a drop down list causes an onChange event and then we save
			this.connect(ew, "onChange", "_onChange");

			// ESC and TAB should cancel and save.  Note that edit widgets do a stopEvent() on ESC key (to
			// prevent Dialog from closing when the user just wants to revert the value in the edit widget),
			// so this is the only way we can see the key press event.
			this.connect(ew, "onKeyPress", "_onKeyPress");
		}else{
			// If possible, enable/disable save button based on whether the user has changed the value
			if("intermediateChanges" in ew){
				ew.set("intermediateChanges", true);
				this.connect(ew, "onChange", "_onIntermediateChange");
				this.saveButton.set("disabled", true);
			}
		}
	},

	_onIntermediateChange: function(val){
		// summary:
		//		Called for editor widgets that support the intermediateChanges=true flag as a way
		//		to detect when to enable/disabled the save button
		this.saveButton.set("disabled", (this.getValue() == this._resetValue) || !this.enableSave());
	},

	destroy: function(){
		this.editWidget.destroy(true); // let the parent wrapper widget clean up the DOM
		this.inherited(arguments);
	},

	getValue: function(){
		// summary:
		//		Return the [display] value of the edit widget
		var ew = this.editWidget;
		return String(ew.get("displayedValue" in ew ? "displayedValue" : "value"));
	},

	_onKeyPress: function(e){
		// summary:
		//		Handler for keypress in the edit box in autoSave mode.
		// description:
		//		For autoSave widgets, if Esc/Enter, call cancel/save.
		// tags:
		//		private

		if(this.inlineEditBox.autoSave && this.inlineEditBox.editing){
			if(e.altKey || e.ctrlKey){ return; }
			// If Enter/Esc pressed, treat as save/cancel.
			if(e.charOrCode == dojo.keys.ESCAPE){
				dojo.stopEvent(e);
				this.cancel(true); // sets editing=false which short-circuits _onBlur processing
			}else if(e.charOrCode == dojo.keys.ENTER && e.target.tagName == "INPUT"){
				dojo.stopEvent(e);
				this._onChange(); // fire _onBlur and then save
			}

			// _onBlur will handle TAB automatically by allowing
			// the TAB to change focus before we mess with the DOM: #6227
			// Expounding by request:
			// 	The current focus is on the edit widget input field.
			//	save() will hide and destroy this widget.
			//	We want the focus to jump from the currently hidden
			//	displayNode, but since it's hidden, it's impossible to
			//	unhide it, focus it, and then have the browser focus
			//	away from it to the next focusable element since each
			//	of these events is asynchronous and the focus-to-next-element
			//	is already queued.
			//	So we allow the browser time to unqueue the move-focus event
			//	before we do all the hide/show stuff.
		}
	},

	_onBlur: function(){
		// summary:
		//		Called when focus moves outside the editor
		// tags:
		//		private

		this.inherited(arguments);
		if(this.inlineEditBox.autoSave && this.inlineEditBox.editing){
			if(this.getValue() == this._resetValue){
				this.cancel(false);
			}else if(this.enableSave()){
				this.save(false);
			}
		}
	},

	_onChange: function(){
		// summary:
		//		Called when the underlying widget fires an onChange event,
		//		such as when the user selects a value from the drop down list of a ComboBox,
		//		which means that the user has finished entering the value and we should save.
		// tags:
		//		private

		if(this.inlineEditBox.autoSave && this.inlineEditBox.editing && this.enableSave()){
			dojo.style(this.inlineEditBox.displayNode, { display: "" });
			dijit.focus(this.inlineEditBox.displayNode); // fires _onBlur which will save the formatted value
		}
	},

	enableSave: function(){
		// summary:
		//		User overridable function returning a Boolean to indicate
		// 		if the Save button should be enabled or not - usually due to invalid conditions
		// tags:
		//		extension
		return (
			this.editWidget.isValid
			? this.editWidget.isValid()
			: true
		);
	},

	focus: function(){
		// summary:
		//		Focus the edit widget.
		// tags:
		//		protected

		this.editWidget.focus();
		setTimeout(dojo.hitch(this, function(){
			if(this.editWidget.focusNode && this.editWidget.focusNode.tagName == "INPUT"){
				dijit.selectInputText(this.editWidget.focusNode);
			}
		}), 0);
	}
});

}

if(!dojo._hasResource["dojo.fx.Toggler"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojo.fx.Toggler"] = true;
dojo.provide("dojo.fx.Toggler");


dojo.declare("dojo.fx.Toggler", null, {
	// summary:
	//		A simple `dojo.Animation` toggler API.
	//
	// description:
	//		class constructor for an animation toggler. It accepts a packed
	//		set of arguments about what type of animation to use in each
	//		direction, duration, etc. All available members are mixed into
	//		these animations from the constructor (for example, `node`,
	//		`showDuration`, `hideDuration`).
	//
	// example:
	//	|	var t = new dojo.fx.Toggler({
	//	|		node: "nodeId",
	//	|		showDuration: 500,
	//	|		// hideDuration will default to "200"
	//	|		showFunc: dojo.fx.wipeIn,
	//	|		// hideFunc will default to "fadeOut"
	//	|	});
	//	|	t.show(100); // delay showing for 100ms
	//	|	// ...time passes...
	//	|	t.hide();

	// node: DomNode
	//		the node to target for the showing and hiding animations
	node: null,

	// showFunc: Function
	//		The function that returns the `dojo.Animation` to show the node
	showFunc: dojo.fadeIn,

	// hideFunc: Function
	//		The function that returns the `dojo.Animation` to hide the node
	hideFunc: dojo.fadeOut,

	// showDuration:
	//		Time in milliseconds to run the show Animation
	showDuration: 200,

	// hideDuration:
	//		Time in milliseconds to run the hide Animation
	hideDuration: 200,

	// FIXME: need a policy for where the toggler should "be" the next
	// time show/hide are called if we're stopped somewhere in the
	// middle.
	// FIXME: also would be nice to specify individual showArgs/hideArgs mixed into
	// each animation individually.
	// FIXME: also would be nice to have events from the animations exposed/bridged

	/*=====
	_showArgs: null,
	_showAnim: null,

	_hideArgs: null,
	_hideAnim: null,

	_isShowing: false,
	_isHiding: false,
	=====*/

	constructor: function(args){
		var _t = this;

		dojo.mixin(_t, args);
		_t.node = args.node;
		_t._showArgs = dojo.mixin({}, args);
		_t._showArgs.node = _t.node;
		_t._showArgs.duration = _t.showDuration;
		_t.showAnim = _t.showFunc(_t._showArgs);

		_t._hideArgs = dojo.mixin({}, args);
		_t._hideArgs.node = _t.node;
		_t._hideArgs.duration = _t.hideDuration;
		_t.hideAnim = _t.hideFunc(_t._hideArgs);

		dojo.connect(_t.showAnim, "beforeBegin", dojo.hitch(_t.hideAnim, "stop", true));
		dojo.connect(_t.hideAnim, "beforeBegin", dojo.hitch(_t.showAnim, "stop", true));
	},

	show: function(delay){
		// summary: Toggle the node to showing
		// delay: Integer?
		//		Ammount of time to stall playing the show animation
		return this.showAnim.play(delay || 0);
	},

	hide: function(delay){
		// summary: Toggle the node to hidden
		// delay: Integer?
		//		Ammount of time to stall playing the hide animation
		return this.hideAnim.play(delay || 0);
	}
});

}

if(!dojo._hasResource["scorll.stage.Menu"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.stage.Menu"] = true;
dojo.provide("scorll.stage.Menu");






dojo.declare("scorll.stage.Menu", [
    dijit._Widget,
    dijit._Templated
    ], {
    widgetsInTemplate: true,
    templateString:"<div style=\"position: absolute;opacity: 0; width: 150px;\">\n\t<!--<div type=\"button\" dojoType=\"dijit.form.Button\" dojoAttachPoint=\"addBeforeButton\" dojoAttachEvent=\"onClick:edit\">Add Before</div>-->\n\t<div type=\"button\" dojoType=\"dijit.form.Button\" dojoAttachPoint=\"editButton\" dojoAttachEvent=\"onClick:edit\">Edit</div>\n\t<div dojoType=\"dijit.form.Button\" dojoAttachPoint=\"deleteButton\" dojoAttachEvent=\"onClick:_delete\">Delete</div>\n\t<div type=\"button\" dojoType=\"dijit.form.Button\" dojoAttachPoint=\"statsButton\" dojoAttachEvent=\"onClick:stats\">Stats</div>\n</div>\n",
    widget: null,
    _toggler: null,
    _timeout: null,
    postCreate: function () {
        this._toggler = new dojo.fx.Toggler({
            node: this.domNode
        });
        this._toggler.hideDuration = 100;
        dojo.connect(this, "onMouseOver", function () {
            clearTimeout(this._timeout);
        });
        dojo.connect(this, "onMouseOut", function () {
            this.hide();
        });
    },
    onEdit: function (widget) {},
    onDelete: function (widget) {},
    edit: function () {
        this.onEdit(this.widget);
    },
    _delete: function () {
        this.onDelete(this.widget);
    },
    stats: function () {
        this.hide(true);
        this.widget.showStats();
    },
    show: function (node) {
        clearTimeout(this._timeout);
        this.widget = dijit.byNode(node);
        if (this.widget.isInstanceOf(scorll.asset.Tracking)) {
            this.statsButton.domNode.style.display = "inline";
        } else {
            this.statsButton.domNode.style.display = "none";
        }
        var position = dojo.position(node, {
            includeScroll: true
        });
        this.domNode.style.left = position.x + position.w;
        this.domNode.style.top = position.y;
        this._toggler.show();
    },
    hide: function (immediately) {
        var toggler = this._toggler;
        if (immediately) {
            toggler.hide();
        } else {
            this._timeout = setTimeout(function () {
                toggler.hide();
            }, 300);
        }
    }
});

}

if(!dojo._hasResource["dijit._Contained"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dijit._Contained"] = true;
dojo.provide("dijit._Contained");


dojo.declare("dijit._Contained",
		null,
		{
			// summary:
			//		Mixin for widgets that are children of a container widget
			//
			// example:
			// | 	// make a basic custom widget that knows about it's parents
			// |	dojo.declare("my.customClass",[dijit._Widget,dijit._Contained],{});

			getParent: function(){
				// summary:
				//		Returns the parent widget of this widget, assuming the parent
				//		specifies isContainer
				var parent = dijit.getEnclosingWidget(this.domNode.parentNode);
				return parent && parent.isContainer ? parent : null;
			},

			_getSibling: function(/*String*/ which){
				// summary:
				//      Returns next or previous sibling
				// which:
				//      Either "next" or "previous"
				// tags:
				//      private
				var node = this.domNode;
				do{
					node = node[which+"Sibling"];
				}while(node && node.nodeType != 1);
				return node && dijit.byNode(node);	// dijit._Widget
			},

			getPreviousSibling: function(){
				// summary:
				//		Returns null if this is the first child of the parent,
				//		otherwise returns the next element sibling to the "left".

				return this._getSibling("previous"); // dijit._Widget
			},

			getNextSibling: function(){
				// summary:
				//		Returns null if this is the last child of the parent,
				//		otherwise returns the next element sibling to the "right".

				return this._getSibling("next"); // dijit._Widget
			},

			getIndexInParent: function(){
				// summary:
				//		Returns the index of this widget within its container parent.
				//		It returns -1 if the parent does not exist, or if the parent
				//		is not a dijit._Container

				var p = this.getParent();
				if(!p || !p.getIndexOfChild){
					return -1; // int
				}
				return p.getIndexOfChild(this); // int
			}
		}
	);

}

if(!dojo._hasResource["dijit.layout._LayoutWidget"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dijit.layout._LayoutWidget"] = true;
dojo.provide("dijit.layout._LayoutWidget");





dojo.declare("dijit.layout._LayoutWidget",
	[dijit._Widget, dijit._Container, dijit._Contained],
	{
		// summary:
		//		Base class for a _Container widget which is responsible for laying out its children.
		//		Widgets which mixin this code must define layout() to manage placement and sizing of the children.

		// baseClass: [protected extension] String
		//		This class name is applied to the widget's domNode
		//		and also may be used to generate names for sub nodes,
		//		for example dijitTabContainer-content.
		baseClass: "dijitLayoutContainer",

		// isLayoutContainer: [protected] Boolean
		//		Indicates that this widget is going to call resize() on its
		//		children widgets, setting their size, when they become visible.
		isLayoutContainer: true,

		buildRendering: function(){
			this.inherited(arguments);
			dojo.addClass(this.domNode, "dijitContainer");
		},

		startup: function(){
			// summary:
			//		Called after all the widgets have been instantiated and their
			//		dom nodes have been inserted somewhere under dojo.doc.body.
			//
			//		Widgets should override this method to do any initialization
			//		dependent on other widgets existing, and then call
			//		this superclass method to finish things off.
			//
			//		startup() in subclasses shouldn't do anything
			//		size related because the size of the widget hasn't been set yet.

			if(this._started){ return; }

			// Need to call inherited first - so that child widgets get started
			// up correctly
			this.inherited(arguments);

			// If I am a not being controlled by a parent layout widget...
			var parent = this.getParent && this.getParent()
			if(!(parent && parent.isLayoutContainer)){
				// Do recursive sizing and layout of all my descendants
				// (passing in no argument to resize means that it has to glean the size itself)
				this.resize();

				// Since my parent isn't a layout container, and my style *may be* width=height=100%
				// or something similar (either set directly or via a CSS class),
				// monitor when my size changes so that I can re-layout.
				// For browsers where I can't directly monitor when my size changes,
				// monitor when the viewport changes size, which *may* indicate a size change for me.
				this.connect(dojo.isIE ? this.domNode : dojo.global, 'onresize', function(){
					// Using function(){} closure to ensure no arguments to resize.
					this.resize();
				});
			}
		},

		resize: function(changeSize, resultSize){
			// summary:
			//		Call this to resize a widget, or after its size has changed.
			// description:
			//		Change size mode:
			//			When changeSize is specified, changes the marginBox of this widget
			//			and forces it to relayout its contents accordingly.
			//			changeSize may specify height, width, or both.
			//
			//			If resultSize is specified it indicates the size the widget will
			//			become after changeSize has been applied.
			//
			//		Notification mode:
			//			When changeSize is null, indicates that the caller has already changed
			//			the size of the widget, or perhaps it changed because the browser
			//			window was resized.  Tells widget to relayout its contents accordingly.
			//
			//			If resultSize is also specified it indicates the size the widget has
			//			become.
			//
			//		In either mode, this method also:
			//			1. Sets this._borderBox and this._contentBox to the new size of
			//				the widget.  Queries the current domNode size if necessary.
			//			2. Calls layout() to resize contents (and maybe adjust child widgets).
			//
			// changeSize: Object?
			//		Sets the widget to this margin-box size and position.
			//		May include any/all of the following properties:
			//	|	{w: int, h: int, l: int, t: int}
			//
			// resultSize: Object?
			//		The margin-box size of this widget after applying changeSize (if
			//		changeSize is specified).  If caller knows this size and
			//		passes it in, we don't need to query the browser to get the size.
			//	|	{w: int, h: int}

			var node = this.domNode;

			// set margin box size, unless it wasn't specified, in which case use current size
			if(changeSize){
				dojo.marginBox(node, changeSize);

				// set offset of the node
				if(changeSize.t){ node.style.top = changeSize.t + "px"; }
				if(changeSize.l){ node.style.left = changeSize.l + "px"; }
			}

			// If either height or width wasn't specified by the user, then query node for it.
			// But note that setting the margin box and then immediately querying dimensions may return
			// inaccurate results, so try not to depend on it.
			var mb = resultSize || {};
			dojo.mixin(mb, changeSize || {});	// changeSize overrides resultSize
			if( !("h" in mb) || !("w" in mb) ){
				mb = dojo.mixin(dojo.marginBox(node), mb);	// just use dojo.marginBox() to fill in missing values
			}

			// Compute and save the size of my border box and content box
			// (w/out calling dojo.contentBox() since that may fail if size was recently set)
			var cs = dojo.getComputedStyle(node);
			var me = dojo._getMarginExtents(node, cs);
			var be = dojo._getBorderExtents(node, cs);
			var bb = (this._borderBox = {
				w: mb.w - (me.w + be.w),
				h: mb.h - (me.h + be.h)
			});
			var pe = dojo._getPadExtents(node, cs);
			this._contentBox = {
				l: dojo._toPixelValue(node, cs.paddingLeft),
				t: dojo._toPixelValue(node, cs.paddingTop),
				w: bb.w - pe.w,
				h: bb.h - pe.h
			};

			// Callback for widget to adjust size of its children
			this.layout();
		},

		layout: function(){
			// summary:
			//		Widgets override this method to size and position their contents/children.
			//		When this is called this._contentBox is guaranteed to be set (see resize()).
			//
			//		This is called after startup(), and also when the widget's size has been
			//		changed.
			// tags:
			//		protected extension
		},

		_setupChild: function(/*dijit._Widget*/child){
			// summary:
			//		Common setup for initial children and children which are added after startup
			// tags:
			//		protected extension

			var cls = this.baseClass + "-child "
				+ (child.baseClass ? this.baseClass + "-" + child.baseClass : "");
			dojo.addClass(child.domNode, cls);
		},

		addChild: function(/*dijit._Widget*/ child, /*Integer?*/ insertIndex){
			// Overrides _Container.addChild() to call _setupChild()
			this.inherited(arguments);
			if(this._started){
				this._setupChild(child);
			}
		},

		removeChild: function(/*dijit._Widget*/ child){
			// Overrides _Container.removeChild() to remove class added by _setupChild()
			var cls = this.baseClass + "-child"
					+ (child.baseClass ?
						" " + this.baseClass + "-" + child.baseClass : "");
			dojo.removeClass(child.domNode, cls);
			
			this.inherited(arguments);
		}
	}
);

dijit.layout.marginBox2contentBox = function(/*DomNode*/ node, /*Object*/ mb){
	// summary:
	//		Given the margin-box size of a node, return its content box size.
	//		Functions like dojo.contentBox() but is more reliable since it doesn't have
	//		to wait for the browser to compute sizes.
	var cs = dojo.getComputedStyle(node);
	var me = dojo._getMarginExtents(node, cs);
	var pb = dojo._getPadBorderExtents(node, cs);
	return {
		l: dojo._toPixelValue(node, cs.paddingLeft),
		t: dojo._toPixelValue(node, cs.paddingTop),
		w: mb.w - (me.w + pb.w),
		h: mb.h - (me.h + pb.h)
	};
};

(function(){
	var capitalize = function(word){
		return word.substring(0,1).toUpperCase() + word.substring(1);
	};

	var size = function(widget, dim){
		// size the child
		var newSize = widget.resize ? widget.resize(dim) : dojo.marginBox(widget.domNode, dim);

		// record child's size
		if(newSize){
			// if the child returned it's new size then use that
			dojo.mixin(widget, newSize);
		}else{
			// otherwise, call marginBox(), but favor our own numbers when we have them.
			// the browser lies sometimes
			dojo.mixin(widget, dojo.marginBox(widget.domNode));
			dojo.mixin(widget, dim);
		}
	};

	dijit.layout.layoutChildren = function(/*DomNode*/ container, /*Object*/ dim, /*Widget[]*/ children,
			/*String?*/ changedRegionId, /*Number?*/ changedRegionSize){
		// summary
		//		Layout a bunch of child dom nodes within a parent dom node
		// container:
		//		parent node
		// dim:
		//		{l, t, w, h} object specifying dimensions of container into which to place children
		// children:
		//		an array of Widgets or at least objects containing:
		//			* domNode: pointer to DOM node to position
		//			* region or layoutAlign: position to place DOM node
		//			* resize(): (optional) method to set size of node
		//			* id: (optional) Id of widgets, referenced from resize object, below.
		// changedRegionId:
		//		If specified, the slider for the region with the specified id has been dragged, and thus
		//		the region's height or width should be adjusted according to changedRegionSize
		// changedRegionSize:
		//		See changedRegionId.

		// copy dim because we are going to modify it
		dim = dojo.mixin({}, dim);

		dojo.addClass(container, "dijitLayoutContainer");

		// Move "client" elements to the end of the array for layout.  a11y dictates that the author
		// needs to be able to put them in the document in tab-order, but this algorithm requires that
		// client be last.    TODO: move these lines to LayoutContainer?   Unneeded other places I think.
		children = dojo.filter(children, function(item){ return item.region != "center" && item.layoutAlign != "client"; })
			.concat(dojo.filter(children, function(item){ return item.region == "center" || item.layoutAlign == "client"; }));

		// set positions/sizes
		dojo.forEach(children, function(child){
			var elm = child.domNode,
				pos = (child.region || child.layoutAlign);

			// set elem to upper left corner of unused space; may move it later
			var elmStyle = elm.style;
			elmStyle.left = dim.l+"px";
			elmStyle.top = dim.t+"px";
			elmStyle.position = "absolute";

			dojo.addClass(elm, "dijitAlign" + capitalize(pos));

			// Size adjustments to make to this child widget
			var sizeSetting = {};

			// Check for optional size adjustment due to splitter drag (height adjustment for top/bottom align
			// panes and width adjustment for left/right align panes.
			if(changedRegionId && changedRegionId == child.id){
				sizeSetting[child.region == "top" || child.region == "bottom" ? "h" : "w"] = changedRegionSize;
			}

			// set size && adjust record of remaining space.
			// note that setting the width of a <div> may affect its height.
			if(pos == "top" || pos == "bottom"){
				sizeSetting.w = dim.w;
				size(child, sizeSetting);
				dim.h -= child.h;
				if(pos == "top"){
					dim.t += child.h;
				}else{
					elmStyle.top = dim.t + dim.h + "px";
				}
			}else if(pos == "left" || pos == "right"){
				sizeSetting.h = dim.h;
				size(child, sizeSetting);
				dim.w -= child.w;
				if(pos == "left"){
					dim.l += child.w;
				}else{
					elmStyle.left = dim.l + dim.w + "px";
				}
			}else if(pos == "client" || pos == "center"){
				size(child, dim);
			}
		});
	};

})();

}

if(!dojo._hasResource["dojox.layout.TableContainer"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojox.layout.TableContainer"] = true;
dojo.experimental("dojox.layout.TableContainer");
dojo.provide("dojox.layout.TableContainer");


dojo.declare("dojox.layout.TableContainer",
	dijit.layout._LayoutWidget,
	{
	// summary:
	//		A container that lays out its child widgets in a table layout.
	//
	// description:
	//		The TableContainer lays out child widgets in a Table layout.
	//		Each widget can specify a "label" or a "title" parameter.
	//		This label is displayed either above or to the left of
	//		a widget depending on whether the "orientation" attribute
	//		is "horiz" or "vert", for horizontal and vertical respectively.
	//		The number of columns is configured using the "cols" attribute.
	//		The width of labels can be configured using the "labelWidth" parameter.
	//
	// example:
	// |	<div dojoType="dojox.layout.TableContainer" orientation="vert" cols="3>
	// |		<div dojoType="dijit.form.TextInput" value="John" label="First Name:"></div>
	// |		<div dojoType="dijit.form.CheckBox" label="Is Student?:"></div>
	// |		<div dojoType="dojox.form.DateTextBox" label="Date Of Birth:"></div>
	// |	</div>
	//

	cols: 1,
	
	// labelWidth: Number|String
	//		Defines the width of a label.  If the value is a number, it is
	//		treated as a pixel value.  The other valid value is a percentage,
	//		e.g. "50%"
	labelWidth: "100",

	// showLabels: Boolean
	//		True if labels should be displayed, false otherwise.
	showLabels: true,

	// orientation: String
	//		Either "horiz" or "vert" for label orientation.
	orientation: "horiz",
	
	// spacing: Number
	//		The cell spacing to apply to the table.
	spacing: 1,

	// customClass: String
	//		A CSS class that will be applied to child elements.  For example, if
	//		the class is "myClass", the table will have "myClass-table" applied to it,
	//		each label TD will have "myClass-labelCell" applied, and each
	//		widget TD will have "myClass-valueCell" applied.
	customClass: "",

	postCreate: function(){
		this.inherited(arguments);
		this._children = [];
		
		// If the orientation, customClass or cols attributes are changed,
		// layout the widgets again.
		this.connect(this, "set", function(name, value){
			if(value && (name == "orientation" || name == "customClass" || name == "cols")) {
				this.layout();
			}
		})
	},

	startup: function() {
		if(this._started) {
			return;
		}
		this.inherited(arguments);
		if(this._initialized) {
			return;
		}
		var children = this.getChildren();
		if(children.length < 1) {
			return;
		}
		this._initialized = true;

		dojo.addClass(this.domNode, "dijitTableLayout");

		// Call startup on all child widgets
		dojo.forEach(children, function(child){
			if(!child.started && !child._started) {
				child.startup();
			}
		});
		this.resize();
		this.layout();
	},

	resize: function(){
		// summary:
		//		Resizes all children.  This widget itself
		//		does not resize, as it takes up 100% of the
		//		available width.
		dojo.forEach(this.getChildren(), function(child){
			if(typeof child.resize == "function") {
				child.resize();
			}
		});
	},

	layout: function(){
		// summary:
		//		Lays out the child widgets.
		if(!this._initialized){
			return;
		}

		var children = this.getChildren();

		var childIds = {};
		var _this = this;

		function addCustomClass(node, type, count) {
			if(_this.customClass != "") {
				var clazz = _this.customClass+ "-" + (type || node.tagName.toLowerCase());
				dojo.addClass(node, clazz);

				if(arguments.length > 2) {
					dojo.addClass(node, clazz + "-" + count);
				}
			}
		}

		// Find any new children that have been added since the last layout() call
		dojo.forEach(this._children, dojo.hitch(this, function(child){
			childIds[child.id] = child;
		}));

		dojo.forEach(children, dojo.hitch(this, function(child, index){
			if(!childIds[child.id]) {
				// Add pre-existing children to the start of the array
				this._children.push(child);
			}
		}));

		// Create the table.  It fills the width of it's container.
		var table = dojo.create("table", {
			"width": "100%",
			 "class": "tableContainer-table tableContainer-table-" + this.orientation,
			 "cellspacing" : this.spacing
			},
			this.domNode);

		var tbody = dojo.create("tbody");
		table.appendChild(tbody);

		addCustomClass(table, "table", this.orientation);

		var width = Math.floor(100 / this.cols) + "%";

		var labelRow = dojo.create("tr", {}, tbody);
		var childRow = (!this.showLabels || this.orientation == "horiz")
											? labelRow : dojo.create("tr", {}, tbody);
		var maxCols = this.cols * (this.showLabels ? 2 : 1);
		var numCols = 0;

		// Iterate over the children, adding them to the table.
		dojo.forEach(this._children, dojo.hitch(this, function(child, index){
			
			var colspan = child.colspan || 1;
			
			if(colspan > 1) {
				colspan = this.showLabels ?
					Math.min(maxCols - 1, colspan * 2 -1): Math.min(maxCols, colspan);
			}

			// Create a new row if we need one
			if(numCols + colspan - 1 + (this.showLabels ? 1 : 0)>= maxCols) {
				numCols = 0;
				labelRow = dojo.create("tr", {}, tbody);
				childRow = this.orientation == "horiz" ? labelRow : dojo.create("tr", {}, tbody);
			}
			var labelCell;
			
			// If labels should be visible, add them
			if(this.showLabels) {
				labelCell = dojo.create("td", {"class": "tableContainer-labelCell"}, labelRow);

				// If the widget should take up both the label and value,
				// then just set the class on it.
				if(child.spanLabel) {
					dojo.attr(labelCell, this.orientation == "vert" ? "rowspan" : "colspan", 2);
				}
				else {
					// Add the custom label class to the label cell
					addCustomClass(labelCell, "labelCell");
					var labelProps = {"for": child.get("id")};
					var label = dojo.create("label", labelProps, labelCell);

					if(Number(this.labelWidth) > -1 ||
						String(this.labelWidth).indexOf("%") > -1) {
							
						// Set the width of the label cell with either a pixel or percentage value
						dojo.style(labelCell, "width",
							String(this.labelWidth).indexOf("%") < 0
								? this.labelWidth + "px" : this.labelWidth);
					}

					label.innerHTML = child.get("label") || child.get("title");
				}
			}
			var childCell;

			if(child.spanLabel && labelCell) {
				childCell = labelCell;
			} else {
				 childCell = dojo.create("td", {
				 	"class" : "tableContainer-valueCell"
				}, childRow);
			}
			if(colspan > 1) {
				dojo.attr(childCell, "colspan", colspan);
			}
			
			// Add the widget cell's custom class, if one exists.
			addCustomClass(childCell, "valueCell", index);

			childCell.appendChild(child.domNode);
			numCols += colspan + (this.showLabels ? 1 : 0);
		}));

		if(this.table)	 {
			this.table.parentNode.removeChild(this.table);
		}
		// Refresh the layout of any child widgets, allowing them to resize
		// to their new parent.
		dojo.forEach(children, function(child){
			if(typeof child.layout == "function") {
				child.layout();
			}
		});
		this.table = table;
		this.resize();
	},
	
	destroyDescendants: function(/*Boolean*/ preserveDom){
		// summary:
		//      Destroys all the widgets inside this.containerNode,
		//      but not this widget itself
		dojo.forEach(this._children, function(child){ child.destroyRecursive(preserveDom); });
	},
	
	_setSpacingAttr: function(value) {
		// summary:
		//		Sets the spacing attribute.
		this.spacing = value;
		if(this.table) {
			this.table.cellspacing = Number(value);
		}
	}
});

// Extend the default widget with both label and title elements, as
// well as a "spanLabel" attribute.  If a widget
dojo.extend(dijit._Widget, {
	// label: String
	//		The label to display for a given widget
	label: "",
	
	// title: String
	//		The label to display for a given widget.  This is interchangeable
	//		with the 'label' parameter, as some widgets already have a use
	//		for the 'label', and this can be used instead to avoid conflicts.
	title: "",
	
	// spanLabel: Boolean
	//		Setting spanLabel to true makes the widget take up both the
	//		label and value cells. Defaults to false.
	spanLabel: false,
	
	// colspan: Number
	//		The number of columns this widget should span.
	colspan: 1
});

}

if(!dojo._hasResource["scorll.stage.Login"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.stage.Login"] = true;
dojo.provide("scorll.stage.Login");






dojo.declare("scorll.stage.Login", [
    dijit._Widget,
    dijit._Templated
    ], {
    widgetsInTemplate: true,
    templateString:"<div>\n\t<div style=\"width: 500px;\">\n\t\t<div dojoType=\"dojox.layout.TableContainer\" cols=\"1\" labelWidth=\"120\" height=\"300px\">\n\t\t\t<div dojoType=\"dijit.form.TextBox\" dojoAttachPoint=\"username\" title=\"Email\"></div>\n\t\t\t<div dojoType=\"dijit.form.TextBox\" dojoAttachPoint=\"password\" title=\"Password\"></div>\n\t\t</div>\n\t\t<div style=\"text-align: left; float: left;\">\n\t\t\t<div dojoType=\"dijit.form.Button\" dojoAttachEvent=\"onClick:register\">Register</div>\n\t\t</div>\n\t\t<div style=\"text-align: right;\">\n\t\t\t<div dojoType=\"dijit.form.Button\" dojoAttachEvent=\"onClick:submit\">Submit</div>\n\t\t\t<div dojoType=\"dijit.form.Button\" dojoAttachEvent=\"onClick:cancel\">Cancel</div>\n\t\t</div>\n\t</div>\n",
    postCreate: function () {},
    onSubmit: function (item) {},
    onCancel: function () {},
    onRegister: function () {},
    submit: function () {
        var username = this.username.attr('value').trim();
        var password = this.password.attr('value').trim();
        this.onSubmit(username, password);
    },
    cancel: function () {
        this.onCancel();
    },
    register: function () {
        this.onRegister();
    },
    showError: function (err) {
        console.error(err);
    }
});

}

if(!dojo._hasResource["scorll.stage.Register"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.stage.Register"] = true;
dojo.provide("scorll.stage.Register");






dojo.declare("scorll.stage.Register", [
    dijit._Widget,
    dijit._Templated
    ], {
    widgetsInTemplate: true,
    templateString:"<div>\n\t<div style=\"width: 500px;\">\n\t\t<div dojoType=\"dojox.layout.TableContainer\" cols=\"1\" labelWidth=\"120\" height=\"300px\">\n\t\t\t<div dojoType=\"dijit.form.TextBox\" dojoAttachPoint=\"email\" title=\"Email\"></div>\n\t\t\t<div dojoType=\"dijit.form.TextBox\" dojoAttachPoint=\"password\" title=\"Password\"></div>\n\t\t\t<div dojoType=\"dijit.form.TextBox\" dojoAttachPoint=\"password2\" title=\"Password Repeat\"></div>\n\t\t</div>\n\t\t<div style=\"text-align: right;\">\n\t\t\t<div dojoType=\"dijit.form.Button\" dojoAttachEvent=\"onClick:submit\">Submit</div>\n\t\t\t<div dojoType=\"dijit.form.Button\" dojoAttachEvent=\"onClick:cancel\">Cancel</div>\n\t\t</div>\n\t</div>\n",
    postCreate: function () {},
    onSubmit: function (item) {},
    onCancel: function () {},
    submit: function () {
        var email = this.email.attr('value').trim();
        var password = this.password.attr('value').trim();
        this.onSubmit(email, password);
    },
    cancel: function () {
        this.onCancel();
    },
    showError: function (err) {
        console.error(err);
    }
});

}

if(!dojo._hasResource["scorll.asset.AssetManager"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.asset.AssetManager"] = true;
dojo.provide("scorll.asset.AssetManager");

dojo.declare("scorll.asset.AssetManager", null, {
    assets: {
        "text": {
            label: "Text",
            renderer: "scorll.asset.Text",
            form: "scorll.asset.TextForm"
        },
        "image": {
            label: "Image",
            renderer: "scorll.asset.Image",
            form: "scorll.asset.ImageForm"
        },
        "multiplechoice": {
            label: "Multiple Choice",
            renderer: "scorll.asset.MultipleChoice",
            form: "scorll.asset.MultipleChoiceForm"
        },
        "youtube": {
            label: "YouTube Video",
            renderer: "scorll.asset.YouTube",
            form: "scorll.asset.YouTubeForm"
        },
        "slideshare": {
            label: "SlideShare Presentation",
            renderer: "scorll.asset.SlideShare",
            form: "scorll.asset.SlideShareForm"
        },
        "scribd": {
            label: "Scribd Document",
            renderer: "scorll.asset.Scribd",
            form: "scorll.asset.ScribdForm"
        },
        "vimeo": {
            label: "Vimeo Video",
            renderer: "scorll.asset.Vimeo",
            form: "scorll.asset.VimeoForm"
        }

    },
    getAssetRenderer: function(stage, item) {
        if (!this.assets[item.type]) {
            console.error("Undefined asset type: " + item.type);
            return null;
        }
        var className = this.assets[item.type].renderer;
        try {
            dojo['require'](className);
        } catch (e) {
            console.error(e);
            return null;
        }
        var ctor = dojo.getObject(className, true);
        var args = {};
        args.item = item;
        args.user = stage.user;
        args.client = stage.client;
        args.content = stage.content;
        args.id = "asset-" + item.id; // Used by the Memory Store
        var asset = new ctor(args);
        return asset;
    },
    getAssetForm: function(item) {
        if (!this.assets[item.type]) {
            console.error("Undefined asset type: " + item.type);
            return null;
        }
        var className = this.assets[item.type].form;
        try {
            dojo['require'](className);
        } catch (e) {
            console.error(e);
            return null;
        }
        var ctor = dojo.getObject(className, true);
        return new ctor({
            item: item
        });
    }
});

}

if(!dojo._hasResource["scorll.asset.AssetWrapper"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.asset.AssetWrapper"] = true;
dojo.provide("scorll.asset.AssetWrapper");




dojo.declare("scorll.asset.AssetWrapper", [
    dijit._Widget, dijit._Templated
    ], {
    widgetsInTemplate: true,
    templateString:"<div class=\"dojoDndItem asset-wrapper\">\n",
    menu: null,
    stage: null,
    assetManager: null,
    asset: null,
    widget: null,
    postCreate: function () {
        this.menu && dojo.place(this.menu.domNode, this.domNode);
        if(this.asset) {
            this.widget = this.assetManager.getAssetRenderer(this.stage, this.asset);
        }
        this.widget && dojo.place(this.widget.domNode, this.domNode);
    },
    updateAsset: function (asset) {
        this.asset = asset;
        this.widget && this.widget.destroyRecursive();
        this.widget = this.assetManager.getAssetRenderer(this.stage, this.asset);
        this.widget && dojo.place(this.widget.domNode, this.domNode);
        this.stage.registerAsset(this.widget);
    }
});

}

if(!dojo._hasResource["dojo.dnd.Mover"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojo.dnd.Mover"] = true;
dojo.provide("dojo.dnd.Mover");




dojo.declare("dojo.dnd.Mover", null, {
	constructor: function(node, e, host){
		// summary:
		//		an object which makes a node follow the mouse, or touch-drag on touch devices.
		//		Used as a default mover, and as a base class for custom movers.
		// node: Node
		//		a node (or node's id) to be moved
		// e: Event
		//		a mouse event, which started the move;
		//		only pageX and pageY properties are used
		// host: Object?
		//		object which implements the functionality of the move,
		//	 	and defines proper events (onMoveStart and onMoveStop)
		this.node = dojo.byId(node);
		var pos = e.touches ? e.touches[0] : e;
		this.marginBox = {l: pos.pageX, t: pos.pageY};
		this.mouseButton = e.button;
		var h = (this.host = host), d = node.ownerDocument;
		this.events = [
			// At the start of a drag, onFirstMove is called, and then the following two
			// connects are disconnected
			dojo.connect(d, "onmousemove", this, "onFirstMove"),
			dojo.connect(d, "ontouchmove", this, "onFirstMove"),

			// These are called continually during the drag
			dojo.connect(d, "onmousemove", this, "onMouseMove"),
			dojo.connect(d, "ontouchmove", this, "onMouseMove"),

			// And these are called at the end of the drag
			dojo.connect(d, "onmouseup",   this, "onMouseUp"),
			dojo.connect(d, "ontouchend", this, "onMouseUp"),

			// cancel text selection and text dragging
			dojo.connect(d, "ondragstart",   dojo.stopEvent),
			dojo.connect(d.body, "onselectstart", dojo.stopEvent)
		];
		// notify that the move has started
		if(h && h.onMoveStart){
			h.onMoveStart(this);
		}
	},
	// mouse event processors
	onMouseMove: function(e){
		// summary:
		//		event processor for onmousemove/ontouchmove
		// e: Event
		//		mouse/touch event
		dojo.dnd.autoScroll(e);
		var m = this.marginBox,
			pos = e.touches ? e.touches[0] : e;
		this.host.onMove(this, {l: m.l + pos.pageX, t: m.t + pos.pageY}, e);
		dojo.stopEvent(e);
	},
	onMouseUp: function(e){
		if(dojo.isWebKit && dojo.isMac && this.mouseButton == 2 ?
				e.button == 0 : this.mouseButton == e.button){ // TODO Should condition be met for touch devices, too?
			this.destroy();
		}
		dojo.stopEvent(e);
	},
	// utilities
	onFirstMove: function(e){
		// summary:
		//		makes the node absolute; it is meant to be called only once.
		// 		relative and absolutely positioned nodes are assumed to use pixel units
		var s = this.node.style, l, t, h = this.host;
		switch(s.position){
			case "relative":
			case "absolute":
				// assume that left and top values are in pixels already
				l = Math.round(parseFloat(s.left)) || 0;
				t = Math.round(parseFloat(s.top)) || 0;
				break;
			default:
				s.position = "absolute";	// enforcing the absolute mode
				var m = dojo.marginBox(this.node);
				// event.pageX/pageY (which we used to generate the initial
				// margin box) includes padding and margin set on the body.
				// However, setting the node's position to absolute and then
				// doing dojo.marginBox on it *doesn't* take that additional
				// space into account - so we need to subtract the combined
				// padding and margin.  We use getComputedStyle and
				// _getMarginBox/_getContentBox to avoid the extra lookup of
				// the computed style.
				var b = dojo.doc.body;
				var bs = dojo.getComputedStyle(b);
				var bm = dojo._getMarginBox(b, bs);
				var bc = dojo._getContentBox(b, bs);
				l = m.l - (bc.l - bm.l);
				t = m.t - (bc.t - bm.t);
				break;
		}
		this.marginBox.l = l - this.marginBox.l;
		this.marginBox.t = t - this.marginBox.t;
		if(h && h.onFirstMove){
			h.onFirstMove(this, e);
		}
		
		// Disconnect onmousemove and ontouchmove events that call this function
		dojo.disconnect(this.events.shift());
		dojo.disconnect(this.events.shift());
	},
	destroy: function(){
		// summary:
		//		stops the move, deletes all references, so the object can be garbage-collected
		dojo.forEach(this.events, dojo.disconnect);
		// undo global settings
		var h = this.host;
		if(h && h.onMoveStop){
			h.onMoveStop(this);
		}
		// destroy objects
		this.events = this.node = this.host = null;
	}
});

}

if(!dojo._hasResource["dojo.dnd.Moveable"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojo.dnd.Moveable"] = true;
dojo.provide("dojo.dnd.Moveable");



/*=====
dojo.declare("dojo.dnd.__MoveableArgs", [], {
	// handle: Node||String
	//		A node (or node's id), which is used as a mouse handle.
	//		If omitted, the node itself is used as a handle.
	handle: null,

	// delay: Number
	//		delay move by this number of pixels
	delay: 0,

	// skip: Boolean
	//		skip move of form elements
	skip: false,

	// mover: Object
	//		a constructor of custom Mover
	mover: dojo.dnd.Mover
});
=====*/

dojo.declare("dojo.dnd.Moveable", null, {
	// object attributes (for markup)
	handle: "",
	delay: 0,
	skip: false,
	
	constructor: function(node, params){
		// summary:
		//		an object, which makes a node moveable
		// node: Node
		//		a node (or node's id) to be moved
		// params: dojo.dnd.__MoveableArgs?
		//		optional parameters
		this.node = dojo.byId(node);
		if(!params){ params = {}; }
		this.handle = params.handle ? dojo.byId(params.handle) : null;
		if(!this.handle){ this.handle = this.node; }
		this.delay = params.delay > 0 ? params.delay : 0;
		this.skip  = params.skip;
		this.mover = params.mover ? params.mover : dojo.dnd.Mover;
		this.events = [
			dojo.connect(this.handle, "onmousedown", this, "onMouseDown"),
			dojo.connect(this.handle, "ontouchstart", this, "onMouseDown"),
			// cancel text selection and text dragging
			dojo.connect(this.handle, "ondragstart",   this, "onSelectStart"),
			dojo.connect(this.handle, "onselectstart", this, "onSelectStart")
		];
	},

	// markup methods
	markupFactory: function(params, node){
		return new dojo.dnd.Moveable(node, params);
	},

	// methods
	destroy: function(){
		// summary:
		//		stops watching for possible move, deletes all references, so the object can be garbage-collected
		dojo.forEach(this.events, dojo.disconnect);
		this.events = this.node = this.handle = null;
	},
	
	// mouse event processors
	onMouseDown: function(e){
		// summary:
		//		event processor for onmousedown/ontouchstart, creates a Mover for the node
		// e: Event
		//		mouse/touch event
		if(this.skip && dojo.dnd.isFormElement(e)){ return; }
		if(this.delay){
			this.events.push(
				dojo.connect(this.handle, "onmousemove", this, "onMouseMove"),
				dojo.connect(this.handle, "ontouchmove", this, "onMouseMove"),
				dojo.connect(this.handle, "onmouseup", this, "onMouseUp"),
				dojo.connect(this.handle, "ontouchend", this, "onMouseUp")
			);
			var pos = e.touches ? e.touches[0] : e;
			this._lastX = pos.pageX;
			this._lastY = pos.pageY;
		}else{
			this.onDragDetected(e);
		}
		dojo.stopEvent(e);
	},
	onMouseMove: function(e){
		// summary:
		//		event processor for onmousemove/ontouchmove, used only for delayed drags
		// e: Event
		//		mouse/touch event
		var pos = e.touches ? e.touches[0] : e;
		if(Math.abs(pos.pageX - this._lastX) > this.delay || Math.abs(pos.pageY - this._lastY) > this.delay){
			this.onMouseUp(e);
			this.onDragDetected(e);
		}
		dojo.stopEvent(e);
	},
	onMouseUp: function(e){
		// summary:
		//		event processor for onmouseup, used only for delayed drags
		// e: Event
		//		mouse event
		for(var i = 0; i < 2; ++i){
			dojo.disconnect(this.events.pop());
		}
		dojo.stopEvent(e);
	},
	onSelectStart: function(e){
		// summary:
		//		event processor for onselectevent and ondragevent
		// e: Event
		//		mouse event
		if(!this.skip || !dojo.dnd.isFormElement(e)){
			dojo.stopEvent(e);
		}
	},
	
	// local events
	onDragDetected: function(/* Event */ e){
		// summary:
		//		called when the drag is detected;
		//		responsible for creation of the mover
		new this.mover(this.node, e, this);
	},
	onMoveStart: function(/* dojo.dnd.Mover */ mover){
		// summary:
		//		called before every move operation
		dojo.publish("/dnd/move/start", [mover]);
		dojo.addClass(dojo.body(), "dojoMove");
		dojo.addClass(this.node, "dojoMoveItem");
	},
	onMoveStop: function(/* dojo.dnd.Mover */ mover){
		// summary:
		//		called after every move operation
		dojo.publish("/dnd/move/stop", [mover]);
		dojo.removeClass(dojo.body(), "dojoMove");
		dojo.removeClass(this.node, "dojoMoveItem");
	},
	onFirstMove: function(/* dojo.dnd.Mover */ mover, /* Event */ e){
		// summary:
		//		called during the very first move notification;
		//		can be used to initialize coordinates, can be overwritten.
		
		// default implementation does nothing
	},
	onMove: function(/* dojo.dnd.Mover */ mover, /* Object */ leftTop, /* Event */ e){
		// summary:
		//		called during every move notification;
		//		should actually move the node; can be overwritten.
		this.onMoving(mover, leftTop);
		var s = mover.node.style;
		s.left = leftTop.l + "px";
		s.top  = leftTop.t + "px";
		this.onMoved(mover, leftTop);
	},
	onMoving: function(/* dojo.dnd.Mover */ mover, /* Object */ leftTop){
		// summary:
		//		called before every incremental move; can be overwritten.
		
		// default implementation does nothing
	},
	onMoved: function(/* dojo.dnd.Mover */ mover, /* Object */ leftTop){
		// summary:
		//		called after every incremental move; can be overwritten.
		
		// default implementation does nothing
	}
});

}

if(!dojo._hasResource["dojo.dnd.move"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojo.dnd.move"] = true;
dojo.provide("dojo.dnd.move");




/*=====
dojo.declare("dojo.dnd.move.__constrainedMoveableArgs", [dojo.dnd.__MoveableArgs], {
	// constraints: Function
	//		Calculates a constraint box.
	//		It is called in a context of the moveable object.
	constraints: function(){},

	// within: Boolean
	//		restrict move within boundaries.
	within: false
});
=====*/

dojo.declare("dojo.dnd.move.constrainedMoveable", dojo.dnd.Moveable, {
	// object attributes (for markup)
	constraints: function(){},
	within: false,
	
	// markup methods
	markupFactory: function(params, node){
		return new dojo.dnd.move.constrainedMoveable(node, params);
	},

	constructor: function(node, params){
		// summary:
		//		an object that makes a node moveable
		// node: Node
		//		a node (or node's id) to be moved
		// params: dojo.dnd.move.__constrainedMoveableArgs?
		//		an optional object with additional parameters;
		//		the rest is passed to the base class
		if(!params){ params = {}; }
		this.constraints = params.constraints;
		this.within = params.within;
	},
	onFirstMove: function(/* dojo.dnd.Mover */ mover){
		// summary:
		//		called during the very first move notification;
		//		can be used to initialize coordinates, can be overwritten.
		var c = this.constraintBox = this.constraints.call(this, mover);
		c.r = c.l + c.w;
		c.b = c.t + c.h;
		if(this.within){
			var mb = dojo._getMarginSize(mover.node);
			c.r -= mb.w;
			c.b -= mb.h;
		}
	},
	onMove: function(/* dojo.dnd.Mover */ mover, /* Object */ leftTop){
		// summary:
		//		called during every move notification;
		//		should actually move the node; can be overwritten.
		var c = this.constraintBox, s = mover.node.style;
		this.onMoving(mover, leftTop);
		leftTop.l = leftTop.l < c.l ? c.l : c.r < leftTop.l ? c.r : leftTop.l;
		leftTop.t = leftTop.t < c.t ? c.t : c.b < leftTop.t ? c.b : leftTop.t;
		s.left = leftTop.l + "px";
		s.top  = leftTop.t + "px";
		this.onMoved(mover, leftTop);
	}
});

/*=====
dojo.declare("dojo.dnd.move.__boxConstrainedMoveableArgs", [dojo.dnd.move.__constrainedMoveableArgs], {
	// box: Object
	//		a constraint box
	box: {}
});
=====*/

dojo.declare("dojo.dnd.move.boxConstrainedMoveable", dojo.dnd.move.constrainedMoveable, {
	// box:
	//		object attributes (for markup)
	box: {},
	
	// markup methods
	markupFactory: function(params, node){
		return new dojo.dnd.move.boxConstrainedMoveable(node, params);
	},

	constructor: function(node, params){
		// summary:
		//		an object, which makes a node moveable
		// node: Node
		//		a node (or node's id) to be moved
		// params: dojo.dnd.move.__boxConstrainedMoveableArgs?
		//		an optional object with parameters
		var box = params && params.box;
		this.constraints = function(){ return box; };
	}
});

/*=====
dojo.declare("dojo.dnd.move.__parentConstrainedMoveableArgs", [dojo.dnd.move.__constrainedMoveableArgs], {
	// area: String
	//		A parent's area to restrict the move.
	//		Can be "margin", "border", "padding", or "content".
	area: ""
});
=====*/

dojo.declare("dojo.dnd.move.parentConstrainedMoveable", dojo.dnd.move.constrainedMoveable, {
	// area:
	//		object attributes (for markup)
	area: "content",

	// markup methods
	markupFactory: function(params, node){
		return new dojo.dnd.move.parentConstrainedMoveable(node, params);
	},

	constructor: function(node, params){
		// summary:
		//		an object, which makes a node moveable
		// node: Node
		//		a node (or node's id) to be moved
		// params: dojo.dnd.move.__parentConstrainedMoveableArgs?
		//		an optional object with parameters
		var area = params && params.area;
		this.constraints = function(){
			var n = this.node.parentNode,
				s = dojo.getComputedStyle(n),
				mb = dojo._getMarginBox(n, s);
			if(area == "margin"){
				return mb;	// Object
			}
			var t = dojo._getMarginExtents(n, s);
			mb.l += t.l, mb.t += t.t, mb.w -= t.w, mb.h -= t.h;
			if(area == "border"){
				return mb;	// Object
			}
			t = dojo._getBorderExtents(n, s);
			mb.l += t.l, mb.t += t.t, mb.w -= t.w, mb.h -= t.h;
			if(area == "padding"){
				return mb;	// Object
			}
			t = dojo._getPadExtents(n, s);
			mb.l += t.l, mb.t += t.t, mb.w -= t.w, mb.h -= t.h;
			return mb;	// Object
		};
	}
});

// patching functions one level up for compatibility

dojo.dnd.constrainedMover = dojo.dnd.move.constrainedMover;
dojo.dnd.boxConstrainedMover = dojo.dnd.move.boxConstrainedMover;
dojo.dnd.parentConstrainedMover = dojo.dnd.move.parentConstrainedMover;

}

if(!dojo._hasResource["dojo.dnd.TimedMoveable"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojo.dnd.TimedMoveable"] = true;
dojo.provide("dojo.dnd.TimedMoveable");



/*=====
dojo.declare("dojo.dnd.__TimedMoveableArgs", [dojo.dnd.__MoveableArgs], {
	// timeout: Number
	//		delay move by this number of ms,
	//		accumulating position changes during the timeout
	timeout: 0
});
=====*/

(function(){
	// precalculate long expressions
	var oldOnMove = dojo.dnd.Moveable.prototype.onMove;
		
	dojo.declare("dojo.dnd.TimedMoveable", dojo.dnd.Moveable, {
		// summary:
		//		A specialized version of Moveable to support an FPS throttling.
		//		This class puts an upper restriction on FPS, which may reduce
		//		the CPU load. The additional parameter "timeout" regulates
		//		the delay before actually moving the moveable object.
		
		// object attributes (for markup)
		timeout: 40,	// in ms, 40ms corresponds to 25 fps
	
		constructor: function(node, params){
			// summary:
			//		an object that makes a node moveable with a timer
			// node: Node||String
			//		a node (or node's id) to be moved
			// params: dojo.dnd.__TimedMoveableArgs
			//		object with additional parameters.
			
			// sanitize parameters
			if(!params){ params = {}; }
			if(params.timeout && typeof params.timeout == "number" && params.timeout >= 0){
				this.timeout = params.timeout;
			}
		},
	
		// markup methods
		markupFactory: function(params, node){
			return new dojo.dnd.TimedMoveable(node, params);
		},
	
		onMoveStop: function(/* dojo.dnd.Mover */ mover){
			if(mover._timer){
				// stop timer
				clearTimeout(mover._timer)
				// reflect the last received position
				oldOnMove.call(this, mover, mover._leftTop)
			}
			dojo.dnd.Moveable.prototype.onMoveStop.apply(this, arguments);
		},
		onMove: function(/* dojo.dnd.Mover */ mover, /* Object */ leftTop){
			mover._leftTop = leftTop;
			if(!mover._timer){
				var _t = this;	// to avoid using dojo.hitch()
				mover._timer = setTimeout(function(){
					// we don't have any pending requests
					mover._timer = null;
					// reflect the last received position
					oldOnMove.call(_t, mover, mover._leftTop);
				}, this.timeout);
			}
		}
	});
})();

}

if(!dojo._hasResource["dojo.fx"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojo.fx"] = true;
dojo.provide("dojo.fx");



/*=====
dojo.fx = {
	// summary: Effects library on top of Base animations
};
=====*/
(function(){
	
	var d = dojo,
		_baseObj = {
			_fire: function(evt, args){
				if(this[evt]){
					this[evt].apply(this, args||[]);
				}
				return this;
			}
		};

	var _chain = function(animations){
		this._index = -1;
		this._animations = animations||[];
		this._current = this._onAnimateCtx = this._onEndCtx = null;

		this.duration = 0;
		d.forEach(this._animations, function(a){
			this.duration += a.duration;
			if(a.delay){ this.duration += a.delay; }
		}, this);
	};
	d.extend(_chain, {
		_onAnimate: function(){
			this._fire("onAnimate", arguments);
		},
		_onEnd: function(){
			d.disconnect(this._onAnimateCtx);
			d.disconnect(this._onEndCtx);
			this._onAnimateCtx = this._onEndCtx = null;
			if(this._index + 1 == this._animations.length){
				this._fire("onEnd");
			}else{
				// switch animations
				this._current = this._animations[++this._index];
				this._onAnimateCtx = d.connect(this._current, "onAnimate", this, "_onAnimate");
				this._onEndCtx = d.connect(this._current, "onEnd", this, "_onEnd");
				this._current.play(0, true);
			}
		},
		play: function(/*int?*/ delay, /*Boolean?*/ gotoStart){
			if(!this._current){ this._current = this._animations[this._index = 0]; }
			if(!gotoStart && this._current.status() == "playing"){ return this; }
			var beforeBegin = d.connect(this._current, "beforeBegin", this, function(){
					this._fire("beforeBegin");
				}),
				onBegin = d.connect(this._current, "onBegin", this, function(arg){
					this._fire("onBegin", arguments);
				}),
				onPlay = d.connect(this._current, "onPlay", this, function(arg){
					this._fire("onPlay", arguments);
					d.disconnect(beforeBegin);
					d.disconnect(onBegin);
					d.disconnect(onPlay);
				});
			if(this._onAnimateCtx){
				d.disconnect(this._onAnimateCtx);
			}
			this._onAnimateCtx = d.connect(this._current, "onAnimate", this, "_onAnimate");
			if(this._onEndCtx){
				d.disconnect(this._onEndCtx);
			}
			this._onEndCtx = d.connect(this._current, "onEnd", this, "_onEnd");
			this._current.play.apply(this._current, arguments);
			return this;
		},
		pause: function(){
			if(this._current){
				var e = d.connect(this._current, "onPause", this, function(arg){
						this._fire("onPause", arguments);
						d.disconnect(e);
					});
				this._current.pause();
			}
			return this;
		},
		gotoPercent: function(/*Decimal*/percent, /*Boolean?*/ andPlay){
			this.pause();
			var offset = this.duration * percent;
			this._current = null;
			d.some(this._animations, function(a){
				if(a.duration <= offset){
					this._current = a;
					return true;
				}
				offset -= a.duration;
				return false;
			});
			if(this._current){
				this._current.gotoPercent(offset / this._current.duration, andPlay);
			}
			return this;
		},
		stop: function(/*boolean?*/ gotoEnd){
			if(this._current){
				if(gotoEnd){
					for(; this._index + 1 < this._animations.length; ++this._index){
						this._animations[this._index].stop(true);
					}
					this._current = this._animations[this._index];
				}
				var e = d.connect(this._current, "onStop", this, function(arg){
						this._fire("onStop", arguments);
						d.disconnect(e);
					});
				this._current.stop();
			}
			return this;
		},
		status: function(){
			return this._current ? this._current.status() : "stopped";
		},
		destroy: function(){
			if(this._onAnimateCtx){ d.disconnect(this._onAnimateCtx); }
			if(this._onEndCtx){ d.disconnect(this._onEndCtx); }
		}
	});
	d.extend(_chain, _baseObj);

	dojo.fx.chain = function(/*dojo.Animation[]*/ animations){
		// summary:
		//		Chain a list of `dojo.Animation`s to run in sequence
		//
		// description:
		//		Return a `dojo.Animation` which will play all passed
		//		`dojo.Animation` instances in sequence, firing its own
		//		synthesized events simulating a single animation. (eg:
		//		onEnd of this animation means the end of the chain,
		//		not the individual animations within)
		//
		// example:
		//	Once `node` is faded out, fade in `otherNode`
		//	|	dojo.fx.chain([
		//	|		dojo.fadeIn({ node:node }),
		//	|		dojo.fadeOut({ node:otherNode })
		//	|	]).play();
		//
		return new _chain(animations) // dojo.Animation
	};

	var _combine = function(animations){
		this._animations = animations||[];
		this._connects = [];
		this._finished = 0;

		this.duration = 0;
		d.forEach(animations, function(a){
			var duration = a.duration;
			if(a.delay){ duration += a.delay; }
			if(this.duration < duration){ this.duration = duration; }
			this._connects.push(d.connect(a, "onEnd", this, "_onEnd"));
		}, this);
		
		this._pseudoAnimation = new d.Animation({curve: [0, 1], duration: this.duration});
		var self = this;
		d.forEach(["beforeBegin", "onBegin", "onPlay", "onAnimate", "onPause", "onStop", "onEnd"],
			function(evt){
				self._connects.push(d.connect(self._pseudoAnimation, evt,
					function(){ self._fire(evt, arguments); }
				));
			}
		);
	};
	d.extend(_combine, {
		_doAction: function(action, args){
			d.forEach(this._animations, function(a){
				a[action].apply(a, args);
			});
			return this;
		},
		_onEnd: function(){
			if(++this._finished > this._animations.length){
				this._fire("onEnd");
			}
		},
		_call: function(action, args){
			var t = this._pseudoAnimation;
			t[action].apply(t, args);
		},
		play: function(/*int?*/ delay, /*Boolean?*/ gotoStart){
			this._finished = 0;
			this._doAction("play", arguments);
			this._call("play", arguments);
			return this;
		},
		pause: function(){
			this._doAction("pause", arguments);
			this._call("pause", arguments);
			return this;
		},
		gotoPercent: function(/*Decimal*/percent, /*Boolean?*/ andPlay){
			var ms = this.duration * percent;
			d.forEach(this._animations, function(a){
				a.gotoPercent(a.duration < ms ? 1 : (ms / a.duration), andPlay);
			});
			this._call("gotoPercent", arguments);
			return this;
		},
		stop: function(/*boolean?*/ gotoEnd){
			this._doAction("stop", arguments);
			this._call("stop", arguments);
			return this;
		},
		status: function(){
			return this._pseudoAnimation.status();
		},
		destroy: function(){
			d.forEach(this._connects, dojo.disconnect);
		}
	});
	d.extend(_combine, _baseObj);

	dojo.fx.combine = function(/*dojo.Animation[]*/ animations){
		// summary:
		//		Combine a list of `dojo.Animation`s to run in parallel
		//
		// description:
		//		Combine an array of `dojo.Animation`s to run in parallel,
		//		providing a new `dojo.Animation` instance encompasing each
		//		animation, firing standard animation events.
		//
		// example:
		//	Fade out `node` while fading in `otherNode` simultaneously
		//	|	dojo.fx.combine([
		//	|		dojo.fadeIn({ node:node }),
		//	|		dojo.fadeOut({ node:otherNode })
		//	|	]).play();
		//
		// example:
		//	When the longest animation ends, execute a function:
		//	|	var anim = dojo.fx.combine([
		//	|		dojo.fadeIn({ node: n, duration:700 }),
		//	|		dojo.fadeOut({ node: otherNode, duration: 300 })
		//	|	]);
		//	|	dojo.connect(anim, "onEnd", function(){
		//	|		// overall animation is done.
		//	|	});
		//	|	anim.play(); // play the animation
		//
		return new _combine(animations); // dojo.Animation
	};

	dojo.fx.wipeIn = function(/*Object*/ args){
		// summary:
		//		Expand a node to it's natural height.
		//
		// description:
		//		Returns an animation that will expand the
		//		node defined in 'args' object from it's current height to
		//		it's natural height (with no scrollbar).
		//		Node must have no margin/border/padding.
		//
		// args: Object
		//		A hash-map of standard `dojo.Animation` constructor properties
		//		(such as easing: node: duration: and so on)
		//
		// example:
		//	|	dojo.fx.wipeIn({
		//	|		node:"someId"
		//	|	}).play()
		var node = args.node = d.byId(args.node), s = node.style, o;

		var anim = d.animateProperty(d.mixin({
			properties: {
				height: {
					// wrapped in functions so we wait till the last second to query (in case value has changed)
					start: function(){
						// start at current [computed] height, but use 1px rather than 0
						// because 0 causes IE to display the whole panel
						o = s.overflow;
						s.overflow = "hidden";
						if(s.visibility == "hidden" || s.display == "none"){
							s.height = "1px";
							s.display = "";
							s.visibility = "";
							return 1;
						}else{
							var height = d.style(node, "height");
							return Math.max(height, 1);
						}
					},
					end: function(){
						return node.scrollHeight;
					}
				}
			}
		}, args));

		d.connect(anim, "onEnd", function(){
			s.height = "auto";
			s.overflow = o;
		});

		return anim; // dojo.Animation
	};

	dojo.fx.wipeOut = function(/*Object*/ args){
		// summary:
		//		Shrink a node to nothing and hide it.
		//
		// description:
		//		Returns an animation that will shrink node defined in "args"
		//		from it's current height to 1px, and then hide it.
		//
		// args: Object
		//		A hash-map of standard `dojo.Animation` constructor properties
		//		(such as easing: node: duration: and so on)
		//
		// example:
		//	|	dojo.fx.wipeOut({ node:"someId" }).play()
		
		var node = args.node = d.byId(args.node), s = node.style, o;
		
		var anim = d.animateProperty(d.mixin({
			properties: {
				height: {
					end: 1 // 0 causes IE to display the whole panel
				}
			}
		}, args));

		d.connect(anim, "beforeBegin", function(){
			o = s.overflow;
			s.overflow = "hidden";
			s.display = "";
		});
		d.connect(anim, "onEnd", function(){
			s.overflow = o;
			s.height = "auto";
			s.display = "none";
		});

		return anim; // dojo.Animation
	};

	dojo.fx.slideTo = function(/*Object*/ args){
		// summary:
		//		Slide a node to a new top/left position
		//
		// description:
		//		Returns an animation that will slide "node"
		//		defined in args Object from its current position to
		//		the position defined by (args.left, args.top).
		//
		// args: Object
		//		A hash-map of standard `dojo.Animation` constructor properties
		//		(such as easing: node: duration: and so on). Special args members
		//		are `top` and `left`, which indicate the new position to slide to.
		//
		// example:
		//	|	dojo.fx.slideTo({ node: node, left:"40", top:"50", units:"px" }).play()

		var node = args.node = d.byId(args.node),
			top = null, left = null;

		var init = (function(n){
			return function(){
				var cs = d.getComputedStyle(n);
				var pos = cs.position;
				top = (pos == 'absolute' ? n.offsetTop : parseInt(cs.top) || 0);
				left = (pos == 'absolute' ? n.offsetLeft : parseInt(cs.left) || 0);
				if(pos != 'absolute' && pos != 'relative'){
					var ret = d.position(n, true);
					top = ret.y;
					left = ret.x;
					n.style.position="absolute";
					n.style.top=top+"px";
					n.style.left=left+"px";
				}
			};
		})(node);
		init();

		var anim = d.animateProperty(d.mixin({
			properties: {
				top: args.top || 0,
				left: args.left || 0
			}
		}, args));
		d.connect(anim, "beforeBegin", anim, init);

		return anim; // dojo.Animation
	};

})();

}

if(!dojo._hasResource["dijit.form._FormMixin"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dijit.form._FormMixin"] = true;
dojo.provide("dijit.form._FormMixin");



dojo.declare("dijit.form._FormMixin", null, {
	// summary:
	//		Mixin for containers of form widgets (i.e. widgets that represent a single value
	//		and can be children of a <form> node or dijit.form.Form widget)
	// description:
	//		Can extract all the form widgets
	//		values and combine them into a single javascript object, or alternately
	//		take such an object and set the values for all the contained
	//		form widgets

/*=====
	// value: Object
	//		Name/value hash for each child widget with a name and value.
	//		Child widgets without names are not part of the hash.
	//
	//		If there are multiple child widgets w/the same name, value is an array,
	//		unless they are radio buttons in which case value is a scalar (since only
	//		one radio button can be checked at a time).
	//
	//		If a child widget's name is a dot separated list (like a.b.c.d), it's a nested structure.
	//
	//		Example:
	//	|	{ name: "John Smith", interests: ["sports", "movies"] }
=====*/

	// state: [readonly] String
	//		Will be "Error" if one or more of the child widgets has an invalid value,
	//		"Incomplete" if not all of the required child widgets are filled in.  Otherwise, "",
	//		which indicates that the form is ready to be submitted.
	state: "",

	//	TODO:
	//	* Repeater
	//	* better handling for arrays.  Often form elements have names with [] like
	//	* people[3].sex (for a list of people [{name: Bill, sex: M}, ...])
	//
	//

		reset: function(){
			dojo.forEach(this.getDescendants(), function(widget){
				if(widget.reset){
					widget.reset();
				}
			});
		},

		validate: function(){
			// summary:
			//		returns if the form is valid - same as isValid - but
			//		provides a few additional (ui-specific) features.
			//		1 - it will highlight any sub-widgets that are not
			//			valid
			//		2 - it will call focus() on the first invalid
			//			sub-widget
			var didFocus = false;
			return dojo.every(dojo.map(this.getDescendants(), function(widget){
				// Need to set this so that "required" widgets get their
				// state set.
				widget._hasBeenBlurred = true;
				var valid = widget.disabled || !widget.validate || widget.validate();
				if(!valid && !didFocus){
					// Set focus of the first non-valid widget
					dojo.window.scrollIntoView(widget.containerNode || widget.domNode);
					widget.focus();
					didFocus = true;
				}
	 			return valid;
	 		}), function(item){ return item; });
		},

		setValues: function(val){
			dojo.deprecated(this.declaredClass+"::setValues() is deprecated. Use set('value', val) instead.", "", "2.0");
			return this.set('value', val);
		},
		_setValueAttr: function(/*Object*/ obj){
			// summary:
			//		Fill in form values from according to an Object (in the format returned by get('value'))

			// generate map from name --> [list of widgets with that name]
			var map = { };
			dojo.forEach(this.getDescendants(), function(widget){
				if(!widget.name){ return; }
				var entry = map[widget.name] || (map[widget.name] = [] );
				entry.push(widget);
			});

			for(var name in map){
				if(!map.hasOwnProperty(name)){
					continue;
				}
				var widgets = map[name],						// array of widgets w/this name
					values = dojo.getObject(name, false, obj);	// list of values for those widgets

				if(values === undefined){
					continue;
				}
				if(!dojo.isArray(values)){
					values = [ values ];
				}
				if(typeof widgets[0].checked == 'boolean'){
					// for checkbox/radio, values is a list of which widgets should be checked
					dojo.forEach(widgets, function(w, i){
						w.set('value', dojo.indexOf(values, w.value) != -1);
					});
				}else if(widgets[0].multiple){
					// it takes an array (e.g. multi-select)
					widgets[0].set('value', values);
				}else{
					// otherwise, values is a list of values to be assigned sequentially to each widget
					dojo.forEach(widgets, function(w, i){
						w.set('value', values[i]);
					});
				}
			}

			/***
			 * 	TODO: code for plain input boxes (this shouldn't run for inputs that are part of widgets)

			dojo.forEach(this.containerNode.elements, function(element){
				if(element.name == ''){return};	// like "continue"
				var namePath = element.name.split(".");
				var myObj=obj;
				var name=namePath[namePath.length-1];
				for(var j=1,len2=namePath.length;j<len2;++j){
					var p=namePath[j - 1];
					// repeater support block
					var nameA=p.split("[");
					if(nameA.length > 1){
						if(typeof(myObj[nameA[0]]) == "undefined"){
							myObj[nameA[0]]=[ ];
						} // if

						nameIndex=parseInt(nameA[1]);
						if(typeof(myObj[nameA[0]][nameIndex]) == "undefined"){
							myObj[nameA[0]][nameIndex] = { };
						}
						myObj=myObj[nameA[0]][nameIndex];
						continue;
					} // repeater support ends

					if(typeof(myObj[p]) == "undefined"){
						myObj=undefined;
						break;
					};
					myObj=myObj[p];
				}

				if(typeof(myObj) == "undefined"){
					return;		// like "continue"
				}
				if(typeof(myObj[name]) == "undefined" && this.ignoreNullValues){
					return;		// like "continue"
				}

				// TODO: widget values (just call set('value', ...) on the widget)

				// TODO: maybe should call dojo.getNodeProp() instead
				switch(element.type){
					case "checkbox":
						element.checked = (name in myObj) &&
							dojo.some(myObj[name], function(val){ return val == element.value; });
						break;
					case "radio":
						element.checked = (name in myObj) && myObj[name] == element.value;
						break;
					case "select-multiple":
						element.selectedIndex=-1;
						dojo.forEach(element.options, function(option){
							option.selected = dojo.some(myObj[name], function(val){ return option.value == val; });
						});
						break;
					case "select-one":
						element.selectedIndex="0";
						dojo.forEach(element.options, function(option){
							option.selected = option.value == myObj[name];
						});
						break;
					case "hidden":
					case "text":
					case "textarea":
					case "password":
						element.value = myObj[name] || "";
						break;
				}
	  		});
	  		*/
			
			// Note: no need to call this._set("value", ...) as the child updates will trigger onChange events
			// which I am monitoring.
		},

		getValues: function(){
			dojo.deprecated(this.declaredClass+"::getValues() is deprecated. Use get('value') instead.", "", "2.0");
			return this.get('value');
		},
		_getValueAttr: function(){
			// summary:
			// 		Returns Object representing form values.   See description of `value` for details.
			// description:

			// The value is updated into this.value every time a child has an onChange event,
			// so in the common case this function could just return this.value.   However,
			// that wouldn't work when:
			//
			// 1. User presses return key to submit a form.  That doesn't fire an onchange event,
			// and even if it did it would come too late due to the setTimout(..., 0) in _handleOnChange()
			//
			// 2. app for some reason calls this.get("value") while the user is typing into a
			// form field.   Not sure if that case needs to be supported or not.

			// get widget values
			var obj = { };
			dojo.forEach(this.getDescendants(), function(widget){
				var name = widget.name;
				if(!name || widget.disabled){ return; }

				// Single value widget (checkbox, radio, or plain <input> type widget)
				var value = widget.get('value');

				// Store widget's value(s) as a scalar, except for checkboxes which are automatically arrays
				if(typeof widget.checked == 'boolean'){
					if(/Radio/.test(widget.declaredClass)){
						// radio button
						if(value !== false){
							dojo.setObject(name, value, obj);
						}else{
							// give radio widgets a default of null
							value = dojo.getObject(name, false, obj);
							if(value === undefined){
								dojo.setObject(name, null, obj);
							}
						}
					}else{
						// checkbox/toggle button
						var ary=dojo.getObject(name, false, obj);
						if(!ary){
							ary=[];
							dojo.setObject(name, ary, obj);
						}
						if(value !== false){
							ary.push(value);
						}
					}
				}else{
					var prev=dojo.getObject(name, false, obj);
					if(typeof prev != "undefined"){
						if(dojo.isArray(prev)){
							prev.push(value);
						}else{
							dojo.setObject(name, [prev, value], obj);
						}
					}else{
						// unique name
						dojo.setObject(name, value, obj);
					}
				}
			});

			/***
			 * code for plain input boxes (see also dojo.formToObject, can we use that instead of this code?
			 * but it doesn't understand [] notation, presumably)
			var obj = { };
			dojo.forEach(this.containerNode.elements, function(elm){
				if(!elm.name)	{
					return;		// like "continue"
				}
				var namePath = elm.name.split(".");
				var myObj=obj;
				var name=namePath[namePath.length-1];
				for(var j=1,len2=namePath.length;j<len2;++j){
					var nameIndex = null;
					var p=namePath[j - 1];
					var nameA=p.split("[");
					if(nameA.length > 1){
						if(typeof(myObj[nameA[0]]) == "undefined"){
							myObj[nameA[0]]=[ ];
						} // if
						nameIndex=parseInt(nameA[1]);
						if(typeof(myObj[nameA[0]][nameIndex]) == "undefined"){
							myObj[nameA[0]][nameIndex] = { };
						}
					} else if(typeof(myObj[nameA[0]]) == "undefined"){
						myObj[nameA[0]] = { }
					} // if

					if(nameA.length == 1){
						myObj=myObj[nameA[0]];
					} else{
						myObj=myObj[nameA[0]][nameIndex];
					} // if
				} // for

				if((elm.type != "select-multiple" && elm.type != "checkbox" && elm.type != "radio") || (elm.type == "radio" && elm.checked)){
					if(name == name.split("[")[0]){
						myObj[name]=elm.value;
					} else{
						// can not set value when there is no name
					}
				} else if(elm.type == "checkbox" && elm.checked){
					if(typeof(myObj[name]) == 'undefined'){
						myObj[name]=[ ];
					}
					myObj[name].push(elm.value);
				} else if(elm.type == "select-multiple"){
					if(typeof(myObj[name]) == 'undefined'){
						myObj[name]=[ ];
					}
					for(var jdx=0,len3=elm.options.length; jdx<len3; ++jdx){
						if(elm.options[jdx].selected){
							myObj[name].push(elm.options[jdx].value);
						}
					}
				} // if
				name=undefined;
			}); // forEach
			***/
			return obj;
		},

	 	isValid: function(){
	 		// summary:
	 		//		Returns true if all of the widgets are valid.
			//		Deprecated, will be removed in 2.0.  Use get("state") instead.

			return this.state == "";
		},

		onValidStateChange: function(isValid){
			// summary:
			//		Stub function to connect to if you want to do something
			//		(like disable/enable a submit button) when the valid
			//		state changes on the form as a whole.
			//
			//		Deprecated.  Will be removed in 2.0.  Use watch("state", ...) instead.
		},

		_getState: function(){
			// summary:
			//		Compute what this.state should be based on state of children
			var states = dojo.map(this._descendants, function(w){
				return w.get("state") || "";
			});

			return dojo.indexOf(states, "Error") >= 0 ? "Error" :
				dojo.indexOf(states, "Incomplete") >= 0 ? "Incomplete" : "";
		},

		disconnectChildren: function(){
			// summary:
			//		Remove connections to monitor changes to children's value, error state, and disabled state,
			//		in order to update Form.value and Form.state.
			dojo.forEach(this._childConnections || [], dojo.hitch(this, "disconnect"));
			dojo.forEach(this._childWatches || [], function(w){ w.unwatch(); });
		},

		connectChildren: function(/*Boolean*/ inStartup){
			// summary:
			//		Setup connections to monitor changes to children's value, error state, and disabled state,
			//		in order to update Form.value and Form.state.
			//
			//		You can call this function directly, ex. in the event that you
			//		programmatically add a widget to the form *after* the form has been
			//		initialized.

			var _this = this;

			// Remove old connections, if any
			this.disconnectChildren();

			this._descendants = this.getDescendants();

			// (Re)set this.value and this.state.   Send watch() notifications but not on startup.
			var set = inStartup ? function(name, val){ _this[name] = val; } : dojo.hitch(this, "_set");
			set("value", this.get("value"));
			set("state", this._getState());

			// Monitor changes to error state and disabled state in order to update
			// Form.state
			var conns = (this._childConnections = []),
				watches = (this._childWatches = []);
			dojo.forEach(dojo.filter(this._descendants,
				function(item){ return item.validate; }
			),
			function(widget){
				// We are interested in whenever the widget changes validity state - or
				// whenever the disabled attribute on that widget is changed.
				dojo.forEach(["state", "disabled"], function(attr){
					watches.push(widget.watch(attr, function(attr, oldVal, newVal){
						_this.set("state", _this._getState());
					}));
				});
			});

			// And monitor calls to child.onChange so we can update this.value
			var onChange = function(){
				// summary:
				//		Called when child's value or disabled state changes
				
				// Use setTimeout() to collapse value changes in multiple children into a single
				// update to my value.   Multiple updates will occur on:
				//	1. Form.set()
				//	2. Form.reset()
				//	3. user selecting a radio button (which will de-select another radio button,
				//		 causing two onChange events)
				if(_this._onChangeDelayTimer){
					clearTimeout(_this._onChangeDelayTimer);
				}
				_this._onChangeDelayTimer = setTimeout(function(){
					delete _this._onChangeDelayTimer;
					_this._set("value", _this.get("value"));
				}, 10);
			};
			dojo.forEach(
				dojo.filter(this._descendants, function(item){ return item.onChange; } ),
				function(widget){
					// When a child widget's value changes,
					// the efficient thing to do is to just update that one attribute in this.value,
					// but that gets a little complicated when a checkbox is checked/unchecked
					// since this.value["checkboxName"] contains an array of all the checkboxes w/the same name.
					// Doing simple thing for now.
					conns.push(_this.connect(widget, "onChange", onChange));

					// Disabling/enabling a child widget should remove it's value from this.value.
					// Again, this code could be more efficient, doing simple thing for now.
					watches.push(widget.watch("disabled", onChange));
				}
			);
		},

		startup: function(){
			this.inherited(arguments);

			// Initialize value and valid/invalid state tracking.  Needs to be done in startup()
			// so that children are initialized.
			this.connectChildren(true);

			// Make state change call onValidStateChange(), will be removed in 2.0
			this.watch("state", function(attr, oldVal, newVal){ this.onValidStateChange(newVal == ""); });
		},

		destroy: function(){
			this.disconnectChildren();
			this.inherited(arguments);
		}

	});

}

if(!dojo._hasResource["dijit._DialogMixin"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dijit._DialogMixin"] = true;
dojo.provide("dijit._DialogMixin");



dojo.declare("dijit._DialogMixin", null,
	{
		// summary:
		//		This provides functions useful to Dialog and TooltipDialog

		attributeMap: dijit._Widget.prototype.attributeMap,

		execute: function(/*Object*/ formContents){
			// summary:
			//		Callback when the user hits the submit button.
			//		Override this method to handle Dialog execution.
			// description:
			//		After the user has pressed the submit button, the Dialog
			//		first calls onExecute() to notify the container to hide the
			//		dialog and restore focus to wherever it used to be.
			//
			//		*Then* this method is called.
			// type:
			//		callback
		},

		onCancel: function(){
			// summary:
			//	    Called when user has pressed the Dialog's cancel button, to notify container.
			// description:
			//	    Developer shouldn't override or connect to this method;
			//		it's a private communication device between the TooltipDialog
			//		and the thing that opened it (ex: `dijit.form.DropDownButton`)
			// type:
			//		protected
		},

		onExecute: function(){
			// summary:
			//	    Called when user has pressed the dialog's OK button, to notify container.
			// description:
			//	    Developer shouldn't override or connect to this method;
			//		it's a private communication device between the TooltipDialog
			//		and the thing that opened it (ex: `dijit.form.DropDownButton`)
			// type:
			//		protected
		},

		_onSubmit: function(){
			// summary:
			//		Callback when user hits submit button
			// type:
			//		protected
			this.onExecute();	// notify container that we are about to execute
			this.execute(this.get('value'));
		},

		_getFocusItems: function(){
			// summary:
			//		Finds focusable items in dialog,
			//		and sets this._firstFocusItem and this._lastFocusItem
			// tags:
			//		protected

			var elems = dijit._getTabNavigable(this.containerNode);
			this._firstFocusItem = elems.lowest || elems.first || this.closeButtonNode || this.domNode;
			this._lastFocusItem = elems.last || elems.highest || this._firstFocusItem;
		}
	}
);

}

if(!dojo._hasResource["dijit.DialogUnderlay"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dijit.DialogUnderlay"] = true;
dojo.provide("dijit.DialogUnderlay");





dojo.declare(
	"dijit.DialogUnderlay",
	[dijit._Widget, dijit._Templated],
	{
		// summary:
		//		The component that blocks the screen behind a `dijit.Dialog`
		//
		// description:
		// 		A component used to block input behind a `dijit.Dialog`. Only a single
		//		instance of this widget is created by `dijit.Dialog`, and saved as
		//		a reference to be shared between all Dialogs as `dijit._underlay`
		//
		//		The underlay itself can be styled based on and id:
		//	|	#myDialog_underlay { background-color:red; }
		//
		//		In the case of `dijit.Dialog`, this id is based on the id of the Dialog,
		//		suffixed with _underlay.

		// Template has two divs; outer div is used for fade-in/fade-out, and also to hold background iframe.
		// Inner div has opacity specified in CSS file.
		templateString: "<div class='dijitDialogUnderlayWrapper'><div class='dijitDialogUnderlay' dojoAttachPoint='node'></div></div>",

		// Parameters on creation or updatable later

		// dialogId: String
		//		Id of the dialog.... DialogUnderlay's id is based on this id
		dialogId: "",

		// class: String
		//		This class name is used on the DialogUnderlay node, in addition to dijitDialogUnderlay
		"class": "",

		attributeMap: { id: "domNode" },

		_setDialogIdAttr: function(id){
			dojo.attr(this.node, "id", id + "_underlay");
			this._set("dialogId", id);
		},

		_setClassAttr: function(clazz){
			this.node.className = "dijitDialogUnderlay " + clazz;
			this._set("class", clazz);
		},

		postCreate: function(){
			// summary:
			//		Append the underlay to the body
			dojo.body().appendChild(this.domNode);
		},

		layout: function(){
			// summary:
			//		Sets the background to the size of the viewport
			//
			// description:
			//		Sets the background to the size of the viewport (rather than the size
			//		of the document) since we need to cover the whole browser window, even
			//		if the document is only a few lines long.
			// tags:
			//		private

			var is = this.node.style,
				os = this.domNode.style;

			// hide the background temporarily, so that the background itself isn't
			// causing scrollbars to appear (might happen when user shrinks browser
			// window and then we are called to resize)
			os.display = "none";

			// then resize and show
			var viewport = dojo.window.getBox();
			os.top = viewport.t + "px";
			os.left = viewport.l + "px";
			is.width = viewport.w + "px";
			is.height = viewport.h + "px";
			os.display = "block";
		},

		show: function(){
			// summary:
			//		Show the dialog underlay
			this.domNode.style.display = "block";
			this.layout();
			this.bgIframe = new dijit.BackgroundIframe(this.domNode);
		},

		hide: function(){
			// summary:
			//		Hides the dialog underlay
			this.bgIframe.destroy();
			delete this.bgIframe;
			this.domNode.style.display = "none";
		}
	}
);

}

if(!dojo._hasResource["dijit.layout._ContentPaneResizeMixin"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dijit.layout._ContentPaneResizeMixin"] = true;
dojo.provide("dijit.layout._ContentPaneResizeMixin");




dojo.declare("dijit.layout._ContentPaneResizeMixin", null, {
	// summary:
	//		Resize() functionality of ContentPane.   If there's a single layout widget
	//		child then it will call resize() with the same dimensions as the ContentPane.
	//		Otherwise just calls resize on each child.
	//
	//		Also implements basic startup() functionality, where starting the parent
	//		will start the children

	// doLayout: Boolean
	//		- false - don't adjust size of children
	//		- true - if there is a single visible child widget, set it's size to
	//				however big the ContentPane is
	doLayout: true,

	// isContainer: [protected] Boolean
	//		Indicates that this widget acts as a "parent" to the descendant widgets.
	//		When the parent is started it will call startup() on the child widgets.
	//		See also `isLayoutContainer`.
	isContainer: true,

	// isLayoutContainer: [protected] Boolean
	//		Indicates that this widget will call resize() on it's child widgets
	//		when they become visible.
	isLayoutContainer: true,

	_startChildren: function(){
		// summary:
		//		Call startup() on all children including non _Widget ones like dojo.dnd.Source objects

		// This starts all the widgets
		dojo.forEach(this.getChildren(), function(child){
			child.startup();
			child._started = true;
		});
	},

	startup: function(){
		// summary:
		//		See `dijit.layout._LayoutWidget.startup` for description.
		//		Although ContentPane doesn't extend _LayoutWidget, it does implement
		//		the same API.

		if(this._started){ return; }

		var parent = dijit._Contained.prototype.getParent.call(this);
		this._childOfLayoutWidget = parent && parent.isLayoutContainer;

		// I need to call resize() on my child/children (when I become visible), unless
		// I'm the child of a layout widget in which case my parent will call resize() on me and I'll do it then.
		this._needLayout = !this._childOfLayoutWidget;

		this.inherited(arguments);

		this._startChildren();

		if(this._isShown()){
			this._onShow();
		}

		if(!this._childOfLayoutWidget){
			// If my parent isn't a layout container, since my style *may be* width=height=100%
			// or something similar (either set directly or via a CSS class),
			// monitor when my size changes so that I can re-layout.
			// For browsers where I can't directly monitor when my size changes,
			// monitor when the viewport changes size, which *may* indicate a size change for me.
			this.connect(dojo.isIE ? this.domNode : dojo.global, 'onresize', function(){
				// Using function(){} closure to ensure no arguments to resize.
				this._needLayout = !this._childOfLayoutWidget;
				this.resize();
			});
		}
	},

	_checkIfSingleChild: function(){
		// summary:
		//		Test if we have exactly one visible widget as a child,
		//		and if so assume that we are a container for that widget,
		//		and should propagate startup() and resize() calls to it.
		//		Skips over things like data stores since they aren't visible.

		var childNodes = dojo.query("> *", this.containerNode).filter(function(node){
				return node.tagName !== "SCRIPT"; // or a regexp for hidden elements like script|area|map|etc..
			}),
			childWidgetNodes = childNodes.filter(function(node){
				return dojo.hasAttr(node, "data-dojo-type") || dojo.hasAttr(node, "dojoType") || dojo.hasAttr(node, "widgetId");
			}),
			candidateWidgets = dojo.filter(childWidgetNodes.map(dijit.byNode), function(widget){
				return widget && widget.domNode && widget.resize;
			});

		if(
			// all child nodes are widgets
			childNodes.length == childWidgetNodes.length &&

			// all but one are invisible (like dojo.data)
			candidateWidgets.length == 1
		){
			this._singleChild = candidateWidgets[0];
		}else{
			delete this._singleChild;
		}

		// So we can set overflow: hidden to avoid a safari bug w/scrollbars showing up (#9449)
		dojo.toggleClass(this.containerNode, this.baseClass + "SingleChild", !!this._singleChild);
	},

	resize: function(changeSize, resultSize){
		// summary:
		//		See `dijit.layout._LayoutWidget.resize` for description.
		//		Although ContentPane doesn't extend _LayoutWidget, it does implement
		//		the same API.

		// For the TabContainer --> BorderContainer --> ContentPane case, _onShow() is
		// never called, so resize() is our trigger to do the initial href download (see [20099]).
		// However, don't load href for closed TitlePanes.
		if(!this._wasShown && this.open !== false){
			this._onShow();
		}

		this._resizeCalled = true;

		this._scheduleLayout(changeSize, resultSize);
	},

	_scheduleLayout: function(changeSize, resultSize){
		// summary:
		//		Resize myself, and call resize() on each of my child layout widgets, either now
		//		(if I'm currently visible) or when I become visible
		if(this._isShown()){
			this._layout(changeSize, resultSize);
		}else{
			this._needLayout = true;
			this._changeSize = changeSize;
			this._resultSize = resultSize;
		}
	},

	_layout: function(changeSize, resultSize){
		// summary:
		//		Resize myself according to optional changeSize/resultSize parameters, like a layout widget.
		//		Also, since I am a Container widget, each of my children expects me to
		//		call resize() or layout() on them.
		//
		//		Should be called on initialization and also whenever we get new content
		//		(from an href, or from set('content', ...))... but deferred until
		//		the ContentPane is visible

		// Set margin box size, unless it wasn't specified, in which case use current size.
		if(changeSize){
			dojo.marginBox(this.domNode, changeSize);
		}

		// Compute content box size of containerNode in case we [later] need to size our single child.
		var cn = this.containerNode;
		if(cn === this.domNode){
			// If changeSize or resultSize was passed to this method and this.containerNode ==
			// this.domNode then we can compute the content-box size without querying the node,
			// which is more reliable (similar to LayoutWidget.resize) (see for example #9449).
			var mb = resultSize || {};
			dojo.mixin(mb, changeSize || {}); // changeSize overrides resultSize
			if(!("h" in mb) || !("w" in mb)){
				mb = dojo.mixin(dojo.marginBox(cn), mb); // just use dojo.marginBox() to fill in missing values
			}
			this._contentBox = dijit.layout.marginBox2contentBox(cn, mb);
		}else{
			this._contentBox = dojo.contentBox(cn);
		}

		this._layoutChildren();

		delete this._needLayout;
	},
	
	_layoutChildren: function(){
		// Call _checkIfSingleChild() again in case app has manually mucked w/the content
		// of the ContentPane (rather than changing it through the set("content", ...) API.
		if(this.doLayout){
			this._checkIfSingleChild();
		}

		if(this._singleChild && this._singleChild.resize){
			var cb = this._contentBox || dojo.contentBox(this.containerNode);

			// note: if widget has padding this._contentBox will have l and t set,
			// but don't pass them to resize() or it will doubly-offset the child
			this._singleChild.resize({w: cb.w, h: cb.h});
		}else{
			// All my child widgets are independently sized (rather than matching my size),
			// but I still need to call resize() on each child to make it layout.
			dojo.forEach(this.getChildren(), function(widget){
				if(widget.resize){
					widget.resize();
				}
			});
		}
	},

	_isShown: function(){
		// summary:
		//		Returns true if the content is currently shown.
		// description:
		//		If I am a child of a layout widget then it actually returns true if I've ever been visible,
		//		not whether I'm currently visible, since that's much faster than tracing up the DOM/widget
		//		tree every call, and at least solves the performance problem on page load by deferring loading
		//		hidden ContentPanes until they are first shown

		if(this._childOfLayoutWidget){
			// If we are TitlePane, etc - we return that only *IF* we've been resized
			if(this._resizeCalled && "open" in this){
				return this.open;
			}
			return this._resizeCalled;
		}else if("open" in this){
			return this.open;		// for TitlePane, etc.
		}else{
			var node = this.domNode, parent = this.domNode.parentNode;
			return (node.style.display != 'none') && (node.style.visibility != 'hidden') && !dojo.hasClass(node, "dijitHidden") &&
					parent && parent.style && (parent.style.display != 'none');
		}
	},

	_onShow: function(){
		// summary:
		//		Called when the ContentPane is made visible
		// description:
		//		For a plain ContentPane, this is called on initialization, from startup().
		//		If the ContentPane is a hidden pane of a TabContainer etc., then it's
		//		called whenever the pane is made visible.
		//
		//		Does layout/resize of child widget(s)

		if(this._needLayout){
			// If a layout has been scheduled for when we become visible, do it now
			this._layout(this._changeSize, this._resultSize);
		}

		this.inherited(arguments);

		// Need to keep track of whether ContentPane has been shown (which is different than
		// whether or not it's currently visible).
		this._wasShown = true;
	}
});

}

if(!dojo._hasResource["dojo.html"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojo.html"] = true;
dojo.provide("dojo.html");


dojo.getObject("html", true, dojo);

// the parser might be needed..
(function(){ // private scope, sort of a namespace

	// idCounter is incremented with each instantiation to allow asignment of a unique id for tracking, logging purposes
	var idCounter = 0,
		d = dojo;
	
	dojo.html._secureForInnerHtml = function(/*String*/ cont){
		// summary:
		//		removes !DOCTYPE and title elements from the html string.
		//
		//		khtml is picky about dom faults, you can't attach a style or <title> node as child of body
		//		must go into head, so we need to cut out those tags
		//	cont:
		//		An html string for insertion into the dom
		//
		return cont.replace(/(?:\s*<!DOCTYPE\s[^>]+>|<title[^>]*>[\s\S]*?<\/title>)/ig, ""); // String
	};

/*====
	dojo.html._emptyNode = function(node){
		// summary:
		//		removes all child nodes from the given node
		//	node: DOMNode
		//		the parent element
	};
=====*/
	dojo.html._emptyNode = dojo.empty;

	dojo.html._setNodeContent = function(/* DomNode */ node, /* String|DomNode|NodeList */ cont){
		// summary:
		//		inserts the given content into the given node
		//	node:
		//		the parent element
		//	content:
		//		the content to be set on the parent element.
		//		This can be an html string, a node reference or a NodeList, dojo.NodeList, Array or other enumerable list of nodes
		
		// always empty
		d.empty(node);

		if(cont) {
			if(typeof cont == "string") {
				cont = d._toDom(cont, node.ownerDocument);
			}
			if(!cont.nodeType && d.isArrayLike(cont)) {
				// handle as enumerable, but it may shrink as we enumerate it
				for(var startlen=cont.length, i=0; i<cont.length; i=startlen==cont.length ? i+1 : 0) {
					d.place( cont[i], node, "last");
				}
			} else {
				// pass nodes, documentFragments and unknowns through to dojo.place
				d.place(cont, node, "last");
			}
		}

		// return DomNode
		return node;
	};

	// we wrap up the content-setting operation in a object
	dojo.declare("dojo.html._ContentSetter", null,
		{
			// node: DomNode|String
			//		An node which will be the parent element that we set content into
			node: "",

			// content: String|DomNode|DomNode[]
			//		The content to be placed in the node. Can be an HTML string, a node reference, or a enumerable list of nodes
			content: "",
			
			// id: String?
			//		Usually only used internally, and auto-generated with each instance
			id: "",

			// cleanContent: Boolean
			//		Should the content be treated as a full html document,
			//		and the real content stripped of <html>, <body> wrapper before injection
			cleanContent: false,
			
			// extractContent: Boolean
			//		Should the content be treated as a full html document, and the real content stripped of <html>, <body> wrapper before injection
			extractContent: false,

			// parseContent: Boolean
			//		Should the node by passed to the parser after the new content is set
			parseContent: false,

			// parserScope: String
			//		Flag passed to parser.  Root for attribute names to search for.   If scopeName is dojo,
			//		will search for data-dojo-type (or dojoType).  For backwards compatibility
			//		reasons defaults to dojo._scopeName (which is "dojo" except when
			//		multi-version support is used, when it will be something like dojo16, dojo20, etc.)
			parserScope: dojo._scopeName,

			// startup: Boolean
			//		Start the child widgets after parsing them.   Only obeyed if parseContent is true.
			startup: true,
			
			// lifecyle methods
			constructor: function(/* Object */params, /* String|DomNode */node){
				//	summary:
				//		Provides a configurable, extensible object to wrap the setting on content on a node
				//		call the set() method to actually set the content..
 
				// the original params are mixed directly into the instance "this"
				dojo.mixin(this, params || {});

				// give precedence to params.node vs. the node argument
				// and ensure its a node, not an id string
				node = this.node = dojo.byId( this.node || node );
	
				if(!this.id){
					this.id = [
						"Setter",
						(node) ? node.id || node.tagName : "",
						idCounter++
					].join("_");
				}
			},
			set: function(/* String|DomNode|NodeList? */ cont, /* Object? */ params){
				// summary:
				//		front-end to the set-content sequence
				//	cont:
				//		An html string, node or enumerable list of nodes for insertion into the dom
				//		If not provided, the object's content property will be used
				if(undefined !== cont){
					this.content = cont;
				}
				// in the re-use scenario, set needs to be able to mixin new configuration
				if(params){
					this._mixin(params);
				}

				this.onBegin();
				this.setContent();
				this.onEnd();

				return this.node;
			},
			setContent: function(){
				// summary:
				//		sets the content on the node

				var node = this.node;
				if(!node) {
				    // can't proceed
					throw new Error(this.declaredClass + ": setContent given no node");
				}
				try{
					node = dojo.html._setNodeContent(node, this.content);
				}catch(e){
					// check if a domfault occurs when we are appending this.errorMessage
					// like for instance if domNode is a UL and we try append a DIV
	
					// FIXME: need to allow the user to provide a content error message string
					var errMess = this.onContentError(e);
					try{
						node.innerHTML = errMess;
					}catch(e){
						console.error('Fatal ' + this.declaredClass + '.setContent could not change content due to '+e.message, e);
					}
				}
				// always put back the node for the next method
				this.node = node; // DomNode
			},
			
			empty: function() {
				// summary
				//	cleanly empty out existing content

				// destroy any widgets from a previous run
				// NOTE: if you dont want this you'll need to empty
				// the parseResults array property yourself to avoid bad things happenning
				if(this.parseResults && this.parseResults.length) {
					dojo.forEach(this.parseResults, function(w) {
						if(w.destroy){
							w.destroy();
						}
					});
					delete this.parseResults;
				}
				// this is fast, but if you know its already empty or safe, you could
				// override empty to skip this step
				dojo.html._emptyNode(this.node);
			},
	
			onBegin: function(){
				// summary
				//		Called after instantiation, but before set();
				//		It allows modification of any of the object properties
				//		- including the node and content provided - before the set operation actually takes place
				//		This default implementation checks for cleanContent and extractContent flags to
				//		optionally pre-process html string content
				var cont = this.content;
	
				if(dojo.isString(cont)){
					if(this.cleanContent){
						cont = dojo.html._secureForInnerHtml(cont);
					}
  
					if(this.extractContent){
						var match = cont.match(/<body[^>]*>\s*([\s\S]+)\s*<\/body>/im);
						if(match){ cont = match[1]; }
					}
				}

				// clean out the node and any cruft associated with it - like widgets
				this.empty();
				
				this.content = cont;
				return this.node; /* DomNode */
			},
	
			onEnd: function(){
				// summary
				//		Called after set(), when the new content has been pushed into the node
				//		It provides an opportunity for post-processing before handing back the node to the caller
				//		This default implementation checks a parseContent flag to optionally run the dojo parser over the new content
				if(this.parseContent){
					// populates this.parseResults if you need those..
					this._parse();
				}
				return this.node; /* DomNode */
			},
	
			tearDown: function(){
				// summary
				//		manually reset the Setter instance if its being re-used for example for another set()
				// description
				//		tearDown() is not called automatically.
				//		In normal use, the Setter instance properties are simply allowed to fall out of scope
				//		but the tearDown method can be called to explicitly reset this instance.
				delete this.parseResults;
				delete this.node;
				delete this.content;
			},
  
			onContentError: function(err){
				return "Error occured setting content: " + err;
			},
			
			_mixin: function(params){
				// mix properties/methods into the instance
				// TODO: the intention with tearDown is to put the Setter's state
				// back to that of the original constructor (vs. deleting/resetting everything regardless of ctor params)
				// so we could do something here to move the original properties aside for later restoration
				var empty = {}, key;
				for(key in params){
					if(key in empty){ continue; }
					// TODO: here's our opportunity to mask the properties we dont consider configurable/overridable
					// .. but history shows we'll almost always guess wrong
					this[key] = params[key];
				}
			},
			_parse: function(){
				// summary:
				//		runs the dojo parser over the node contents, storing any results in this.parseResults
				//		Any errors resulting from parsing are passed to _onError for handling

				var rootNode = this.node;
				try{
					// store the results (widgets, whatever) for potential retrieval
					var inherited = {};
					dojo.forEach(["dir", "lang", "textDir"], function(name){
						if(this[name]){
							inherited[name] = this[name];
						}
					}, this);
					this.parseResults = dojo.parser.parse({
						rootNode: rootNode,
						noStart: !this.startup,
						inherited: inherited,
						scope: this.parserScope
					});
				}catch(e){
					this._onError('Content', e, "Error parsing in _ContentSetter#"+this.id);
				}
			},
  
			_onError: function(type, err, consoleText){
				// summary:
				//		shows user the string that is returned by on[type]Error
				//		overide/implement on[type]Error and return your own string to customize
				var errText = this['on' + type + 'Error'].call(this, err);
				if(consoleText){
					console.error(consoleText, err);
				}else if(errText){ // a empty string won't change current content
					dojo.html._setNodeContent(this.node, errText, true);
				}
			}
	}); // end dojo.declare()

	dojo.html.set = function(/* DomNode */ node, /* String|DomNode|NodeList */ cont, /* Object? */ params){
			// summary:
			//		inserts (replaces) the given content into the given node. dojo.place(cont, node, "only")
			//		may be a better choice for simple HTML insertion.
			// description:
			//		Unless you need to use the params capabilities of this method, you should use
			//		dojo.place(cont, node, "only"). dojo.place() has more robust support for injecting
			//		an HTML string into the DOM, but it only handles inserting an HTML string as DOM
			//		elements, or inserting a DOM node. dojo.place does not handle NodeList insertions
			//		or the other capabilities as defined by the params object for this method.
			//	node:
			//		the parent element that will receive the content
			//	cont:
			//		the content to be set on the parent element.
			//		This can be an html string, a node reference or a NodeList, dojo.NodeList, Array or other enumerable list of nodes
			//	params:
			//		Optional flags/properties to configure the content-setting. See dojo.html._ContentSetter
			//	example:
			//		A safe string/node/nodelist content replacement/injection with hooks for extension
			//		Example Usage:
			//		dojo.html.set(node, "some string");
			//		dojo.html.set(node, contentNode, {options});
			//		dojo.html.set(node, myNode.childNodes, {options});
		if(undefined == cont){
			console.warn("dojo.html.set: no cont argument provided, using empty string");
			cont = "";
		}
		if(!params){
			// simple and fast
			return dojo.html._setNodeContent(node, cont, true);
		}else{
			// more options but slower
			// note the arguments are reversed in order, to match the convention for instantiation via the parser
			var op = new dojo.html._ContentSetter(dojo.mixin(
					params,
					{ content: cont, node: node }
			));
			return op.set();
		}
	};
})();

}

if(!dojo._hasResource["dijit.layout.ContentPane"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dijit.layout.ContentPane"] = true;
dojo.provide("dijit.layout.ContentPane");







dojo.declare(
	"dijit.layout.ContentPane", [dijit._Widget, dijit.layout._ContentPaneResizeMixin],
{
	// summary:
	//		A widget containing an HTML fragment, specified inline
	//		or by uri.  Fragment may include widgets.
	//
	// description:
	//		This widget embeds a document fragment in the page, specified
	//		either by uri, javascript generated markup or DOM reference.
	//		Any widgets within this content are instantiated and managed,
	//		but laid out according to the HTML structure.  Unlike IFRAME,
	//		ContentPane embeds a document fragment as would be found
	//		inside the BODY tag of a full HTML document.  It should not
	//		contain the HTML, HEAD, or BODY tags.
	//		For more advanced functionality with scripts and
	//		stylesheets, see dojox.layout.ContentPane.  This widget may be
	//		used stand alone or as a base class for other widgets.
	//		ContentPane is useful as a child of other layout containers
	//		such as BorderContainer or TabContainer, but note that those
	//		widgets can contain any widget as a child.
	//
	// example:
	//		Some quick samples:
	//		To change the innerHTML: cp.set('content', '<b>new content</b>')
	//
	//		Or you can send it a NodeList: cp.set('content', dojo.query('div [class=selected]', userSelection))
	//
	//		To do an ajax update: cp.set('href', url)

	// href: String
	//		The href of the content that displays now.
	//		Set this at construction if you want to load data externally when the
	//		pane is shown.  (Set preload=true to load it immediately.)
	//		Changing href after creation doesn't have any effect; Use set('href', ...);
	href: "",

/*=====
	// content: String || DomNode || NodeList || dijit._Widget
	//		The innerHTML of the ContentPane.
	//		Note that the initialization parameter / argument to set("content", ...)
	//		can be a String, DomNode, Nodelist, or _Widget.
	content: "",
=====*/

	// extractContent: Boolean
	//		Extract visible content from inside of <body> .... </body>.
	//		I.e., strip <html> and <head> (and it's contents) from the href
	extractContent: false,

	// parseOnLoad: Boolean
	//		Parse content and create the widgets, if any.
	parseOnLoad: true,

	// parserScope: String
	//		Flag passed to parser.  Root for attribute names to search for.   If scopeName is dojo,
	//		will search for data-dojo-type (or dojoType).  For backwards compatibility
	//		reasons defaults to dojo._scopeName (which is "dojo" except when
	//		multi-version support is used, when it will be something like dojo16, dojo20, etc.)
	parserScope: dojo._scopeName,

	// preventCache: Boolean
	//		Prevent caching of data from href's by appending a timestamp to the href.
	preventCache: false,

	// preload: Boolean
	//		Force load of data on initialization even if pane is hidden.
	preload: false,

	// refreshOnShow: Boolean
	//		Refresh (re-download) content when pane goes from hidden to shown
	refreshOnShow: false,

	// loadingMessage: String
	//		Message that shows while downloading
	loadingMessage: "<span class='dijitContentPaneLoading'>${loadingState}</span>",

	// errorMessage: String
	//		Message that shows if an error occurs
	errorMessage: "<span class='dijitContentPaneError'>${errorState}</span>",

	// isLoaded: [readonly] Boolean
	//		True if the ContentPane has data in it, either specified
	//		during initialization (via href or inline content), or set
	//		via set('content', ...) / set('href', ...)
	//
	//		False if it doesn't have any content, or if ContentPane is
	//		still in the process of downloading href.
	isLoaded: false,

	baseClass: "dijitContentPane",

	// ioArgs: Object
	//		Parameters to pass to xhrGet() request, for example:
	// |	<div dojoType="dijit.layout.ContentPane" href="./bar" ioArgs="{timeout: 500}">
	ioArgs: {},

	// onLoadDeferred: [readonly] dojo.Deferred
	//		This is the `dojo.Deferred` returned by set('href', ...) and refresh().
	//		Calling onLoadDeferred.addCallback() or addErrback() registers your
	//		callback to be called only once, when the prior set('href', ...) call or
	//		the initial href parameter to the constructor finishes loading.
	//
	//		This is different than an onLoad() handler which gets called any time any href
	//		or content is loaded.
	onLoadDeferred: null,

	// Override _Widget's attributeMap because we don't want the title attribute (used to specify
	// tab labels) to be copied to ContentPane.domNode... otherwise a tooltip shows up over the
	// entire pane.
	attributeMap: dojo.delegate(dijit._Widget.prototype.attributeMap, {
		title: []
	}),

	// Flag to parser that I'll parse my contents, so it shouldn't.
	stopParser: true,

	// template: [private] Boolean
	//		Flag from the parser that this ContentPane is inside a template
	//		so the contents are pre-parsed.
	// (TODO: this declaration can be commented out in 2.0)
	template: false,

	create: function(params, srcNodeRef){
		// Convert a srcNodeRef argument into a content parameter, so that the original contents are
		// processed in the same way as contents set via set("content", ...), calling the parser etc.
		// Avoid modifying original params object since that breaks NodeList instantiation, see #11906.
		if((!params || !params.template) && srcNodeRef && !("href" in params) && !("content" in params)){
			var df = dojo.doc.createDocumentFragment();
			srcNodeRef = dojo.byId(srcNodeRef)
			while(srcNodeRef.firstChild){
				df.appendChild(srcNodeRef.firstChild);
			}
			params = dojo.delegate(params, {content: df});
		}
		this.inherited(arguments, [params, srcNodeRef]);
	},

	postMixInProperties: function(){
		this.inherited(arguments);
		var messages = dojo.i18n.getLocalization("dijit", "loading", this.lang);
		this.loadingMessage = dojo.string.substitute(this.loadingMessage, messages);
		this.errorMessage = dojo.string.substitute(this.errorMessage, messages);
	},

	buildRendering: function(){
		this.inherited(arguments);

		// Since we have no template we need to set this.containerNode ourselves, to make getChildren() work.
		// For subclasses of ContentPane that do have a template, does nothing.
		if(!this.containerNode){
			this.containerNode = this.domNode;
		}

		// remove the title attribute so it doesn't show up when hovering
		// over a node  (TODO: remove in 2.0, no longer needed after #11490)
		this.domNode.title = "";

		if(!dojo.attr(this.domNode,"role")){
			dijit.setWaiRole(this.domNode, "group");
		}
	},

	_startChildren: function(){
		// summary:
		//		Call startup() on all children including non _Widget ones like dojo.dnd.Source objects

		// This starts all the widgets
		this.inherited(arguments);

		// And this catches stuff like dojo.dnd.Source
		if(this._contentSetter){
			dojo.forEach(this._contentSetter.parseResults, function(obj){
				if(!obj._started && !obj._destroyed && dojo.isFunction(obj.startup)){
					obj.startup();
					obj._started = true;
				}
			}, this);
		}
	},

	setHref: function(/*String|Uri*/ href){
		// summary:
		//		Deprecated.   Use set('href', ...) instead.
		dojo.deprecated("dijit.layout.ContentPane.setHref() is deprecated. Use set('href', ...) instead.", "", "2.0");
		return this.set("href", href);
	},
	_setHrefAttr: function(/*String|Uri*/ href){
		// summary:
		//		Hook so set("href", ...) works.
		// description:
		//		Reset the (external defined) content of this pane and replace with new url
		//		Note: It delays the download until widget is shown if preload is false.
		//	href:
		//		url to the page you want to get, must be within the same domain as your mainpage

		// Cancel any in-flight requests (a set('href', ...) will cancel any in-flight set('href', ...))
		this.cancel();

		this.onLoadDeferred = new dojo.Deferred(dojo.hitch(this, "cancel"));
		this.onLoadDeferred.addCallback(dojo.hitch(this, "onLoad"));

		this._set("href", href);

		// _setHrefAttr() is called during creation and by the user, after creation.
		// Assuming preload == false, only in the second case do we actually load the URL;
		// otherwise it's done in startup(), and only if this widget is shown.
		if(this.preload || (this._created && this._isShown())){
			this._load();
		}else{
			// Set flag to indicate that href needs to be loaded the next time the
			// ContentPane is made visible
			this._hrefChanged = true;
		}

		return this.onLoadDeferred;		// dojo.Deferred
	},

	setContent: function(/*String|DomNode|Nodelist*/data){
		// summary:
		//		Deprecated.   Use set('content', ...) instead.
		dojo.deprecated("dijit.layout.ContentPane.setContent() is deprecated.  Use set('content', ...) instead.", "", "2.0");
		this.set("content", data);
	},
	_setContentAttr: function(/*String|DomNode|Nodelist*/data){
		// summary:
		//		Hook to make set("content", ...) work.
		//		Replaces old content with data content, include style classes from old content
		//	data:
		//		the new Content may be String, DomNode or NodeList
		//
		//		if data is a NodeList (or an array of nodes) nodes are copied
		//		so you can import nodes from another document implicitly

		// clear href so we can't run refresh and clear content
		// refresh should only work if we downloaded the content
		this._set("href", "");

		// Cancel any in-flight requests (a set('content', ...) will cancel any in-flight set('href', ...))
		this.cancel();

		// Even though user is just setting content directly, still need to define an onLoadDeferred
		// because the _onLoadHandler() handler is still getting called from setContent()
		this.onLoadDeferred = new dojo.Deferred(dojo.hitch(this, "cancel"));
		if(this._created){
			// For back-compat reasons, call onLoad() for set('content', ...)
			// calls but not for content specified in srcNodeRef (ie: <div dojoType=ContentPane>...</div>)
			// or as initialization parameter (ie: new ContentPane({content: ...})
			this.onLoadDeferred.addCallback(dojo.hitch(this, "onLoad"));
		}

		this._setContent(data || "");

		this._isDownloaded = false; // mark that content is from a set('content') not a set('href')

		return this.onLoadDeferred; 	// dojo.Deferred
	},
	_getContentAttr: function(){
		// summary:
		//		Hook to make get("content") work
		return this.containerNode.innerHTML;
	},

	cancel: function(){
		// summary:
		//		Cancels an in-flight download of content
		if(this._xhrDfd && (this._xhrDfd.fired == -1)){
			this._xhrDfd.cancel();
		}
		delete this._xhrDfd; // garbage collect

		this.onLoadDeferred = null;
	},

	uninitialize: function(){
		if(this._beingDestroyed){
			this.cancel();
		}
		this.inherited(arguments);
	},

	destroyRecursive: function(/*Boolean*/ preserveDom){
		// summary:
		//		Destroy the ContentPane and its contents

		// if we have multiple controllers destroying us, bail after the first
		if(this._beingDestroyed){
			return;
		}
		this.inherited(arguments);
	},

	_onShow: function(){
		// summary:
		//		Called when the ContentPane is made visible
		// description:
		//		For a plain ContentPane, this is called on initialization, from startup().
		//		If the ContentPane is a hidden pane of a TabContainer etc., then it's
		//		called whenever the pane is made visible.
		//
		//		Does necessary processing, including href download and layout/resize of
		//		child widget(s)

		this.inherited(arguments);

		if(this.href){
			if(!this._xhrDfd && // if there's an href that isn't already being loaded
				(!this.isLoaded || this._hrefChanged || this.refreshOnShow)
			){
				return this.refresh();	// If child has an href, promise that fires when the load is complete
			}
		}
	},

	refresh: function(){
		// summary:
		//		[Re]download contents of href and display
		// description:
		//		1. cancels any currently in-flight requests
		//		2. posts "loading..." message
		//		3. sends XHR to download new data

		// Cancel possible prior in-flight request
		this.cancel();

		this.onLoadDeferred = new dojo.Deferred(dojo.hitch(this, "cancel"));
		this.onLoadDeferred.addCallback(dojo.hitch(this, "onLoad"));
		this._load();
		return this.onLoadDeferred;		// If child has an href, promise that fires when refresh is complete
	},

	_load: function(){
		// summary:
		//		Load/reload the href specified in this.href

		// display loading message
		this._setContent(this.onDownloadStart(), true);

		var self = this;
		var getArgs = {
			preventCache: (this.preventCache || this.refreshOnShow),
			url: this.href,
			handleAs: "text"
		};
		if(dojo.isObject(this.ioArgs)){
			dojo.mixin(getArgs, this.ioArgs);
		}

		var hand = (this._xhrDfd = (this.ioMethod || dojo.xhrGet)(getArgs));

		hand.addCallback(function(html){
			try{
				self._isDownloaded = true;
				self._setContent(html, false);
				self.onDownloadEnd();
			}catch(err){
				self._onError('Content', err); // onContentError
			}
			delete self._xhrDfd;
			return html;
		});

		hand.addErrback(function(err){
			if(!hand.canceled){
				// show error message in the pane
				self._onError('Download', err); // onDownloadError
			}
			delete self._xhrDfd;
			return err;
		});

		// Remove flag saying that a load is needed
		delete this._hrefChanged;
	},

	_onLoadHandler: function(data){
		// summary:
		//		This is called whenever new content is being loaded
		this._set("isLoaded", true);
		try{
			this.onLoadDeferred.callback(data);
		}catch(e){
			console.error('Error '+this.widgetId+' running custom onLoad code: ' + e.message);
		}
	},

	_onUnloadHandler: function(){
		// summary:
		//		This is called whenever the content is being unloaded
		this._set("isLoaded", false);
		try{
			this.onUnload();
		}catch(e){
			console.error('Error '+this.widgetId+' running custom onUnload code: ' + e.message);
		}
	},

	destroyDescendants: function(){
		// summary:
		//		Destroy all the widgets inside the ContentPane and empty containerNode

		// Make sure we call onUnload (but only when the ContentPane has real content)
		if(this.isLoaded){
			this._onUnloadHandler();
		}

		// Even if this.isLoaded == false there might still be a "Loading..." message
		// to erase, so continue...

		// For historical reasons we need to delete all widgets under this.containerNode,
		// even ones that the user has created manually.
		var setter = this._contentSetter;
		dojo.forEach(this.getChildren(), function(widget){
			if(widget.destroyRecursive){
				widget.destroyRecursive();
			}
		});
		if(setter){
			// Most of the widgets in setter.parseResults have already been destroyed, but
			// things like Menu that have been moved to <body> haven't yet
			dojo.forEach(setter.parseResults, function(widget){
				if(widget.destroyRecursive && widget.domNode && widget.domNode.parentNode == dojo.body()){
					widget.destroyRecursive();
				}
			});
			delete setter.parseResults;
		}

		// And then clear away all the DOM nodes
		dojo.html._emptyNode(this.containerNode);

		// Delete any state information we have about current contents
		delete this._singleChild;
	},

	_setContent: function(/*String|DocumentFragment*/ cont, /*Boolean*/ isFakeContent){
		// summary:
		//		Insert the content into the container node

		// first get rid of child widgets
		this.destroyDescendants();

		// dojo.html.set will take care of the rest of the details
		// we provide an override for the error handling to ensure the widget gets the errors
		// configure the setter instance with only the relevant widget instance properties
		// NOTE: unless we hook into attr, or provide property setters for each property,
		// we need to re-configure the ContentSetter with each use
		var setter = this._contentSetter;
		if(! (setter && setter instanceof dojo.html._ContentSetter)){
			setter = this._contentSetter = new dojo.html._ContentSetter({
				node: this.containerNode,
				_onError: dojo.hitch(this, this._onError),
				onContentError: dojo.hitch(this, function(e){
					// fires if a domfault occurs when we are appending this.errorMessage
					// like for instance if domNode is a UL and we try append a DIV
					var errMess = this.onContentError(e);
					try{
						this.containerNode.innerHTML = errMess;
					}catch(e){
						console.error('Fatal '+this.id+' could not change content due to '+e.message, e);
					}
				})/*,
				_onError */
			});
		};

		var setterParams = dojo.mixin({
			cleanContent: this.cleanContent,
			extractContent: this.extractContent,
			parseContent: this.parseOnLoad,
			parserScope: this.parserScope,
			startup: false,
			dir: this.dir,
			lang: this.lang
		}, this._contentSetterParams || {});

		setter.set( (dojo.isObject(cont) && cont.domNode) ? cont.domNode : cont, setterParams );

		// setter params must be pulled afresh from the ContentPane each time
		delete this._contentSetterParams;

		if(this.doLayout){
			this._checkIfSingleChild();
		}

		if(!isFakeContent){
			if(this._started){
				// Startup each top level child widget (and they will start their children, recursively)
				this._startChildren();
	
				// Call resize() on each of my child layout widgets,
				// or resize() on my single child layout widget...
				// either now (if I'm currently visible) or when I become visible
				this._scheduleLayout();
			}

			this._onLoadHandler(cont);
		}
	},

	_onError: function(type, err, consoleText){
		this.onLoadDeferred.errback(err);

		// shows user the string that is returned by on[type]Error
		// override on[type]Error and return your own string to customize
		var errText = this['on' + type + 'Error'].call(this, err);
		if(consoleText){
			console.error(consoleText, err);
		}else if(errText){// a empty string won't change current content
			this._setContent(errText, true);
		}
	},

	// EVENT's, should be overide-able
	onLoad: function(data){
		// summary:
		//		Event hook, is called after everything is loaded and widgetified
		// tags:
		//		callback
	},

	onUnload: function(){
		// summary:
		//		Event hook, is called before old content is cleared
		// tags:
		//		callback
	},

	onDownloadStart: function(){
		// summary:
		//		Called before download starts.
		// description:
		//		The string returned by this function will be the html
		//		that tells the user we are loading something.
		//		Override with your own function if you want to change text.
		// tags:
		//		extension
		return this.loadingMessage;
	},

	onContentError: function(/*Error*/ error){
		// summary:
		//		Called on DOM faults, require faults etc. in content.
		//
		//		In order to display an error message in the pane, return
		//		the error message from this method, as an HTML string.
		//
		//		By default (if this method is not overriden), it returns
		//		nothing, so the error message is just printed to the console.
		// tags:
		//		extension
	},

	onDownloadError: function(/*Error*/ error){
		// summary:
		//		Called when download error occurs.
		//
		//		In order to display an error message in the pane, return
		//		the error message from this method, as an HTML string.
		//
		//		Default behavior (if this method is not overriden) is to display
		//		the error message inside the pane.
		// tags:
		//		extension
		return this.errorMessage;
	},

	onDownloadEnd: function(){
		// summary:
		//		Called when download is finished.
		// tags:
		//		callback
	}
});

}

if(!dojo._hasResource["dijit.TooltipDialog"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dijit.TooltipDialog"] = true;
dojo.provide("dijit.TooltipDialog");






dojo.declare(
		"dijit.TooltipDialog",
		[dijit.layout.ContentPane, dijit._Templated, dijit.form._FormMixin, dijit._DialogMixin],
		{
			// summary:
			//		Pops up a dialog that appears like a Tooltip

			// title: String
			// 		Description of tooltip dialog (required for a11y)
			title: "",

			// doLayout: [protected] Boolean
			//		Don't change this parameter from the default value.
			//		This ContentPane parameter doesn't make sense for TooltipDialog, since TooltipDialog
			//		is never a child of a layout container, nor can you specify the size of
			//		TooltipDialog in order to control the size of an inner widget.
			doLayout: false,

			// autofocus: Boolean
			// 		A Toggle to modify the default focus behavior of a Dialog, which
			// 		is to focus on the first dialog element after opening the dialog.
			//		False will disable autofocusing. Default: true
			autofocus: true,

			// baseClass: [protected] String
			//		The root className to use for the various states of this widget
			baseClass: "dijitTooltipDialog",

			// _firstFocusItem: [private] [readonly] DomNode
			//		The pointer to the first focusable node in the dialog.
			//		Set by `dijit._DialogMixin._getFocusItems`.
			_firstFocusItem: null,

			// _lastFocusItem: [private] [readonly] DomNode
			//		The pointer to which node has focus prior to our dialog.
			//		Set by `dijit._DialogMixin._getFocusItems`.
			_lastFocusItem: null,

			templateString: dojo.cache("dijit", "templates/TooltipDialog.html", "<div role=\"presentation\" tabIndex=\"-1\">\n\t<div class=\"dijitTooltipContainer\" role=\"presentation\">\n\t\t<div class =\"dijitTooltipContents dijitTooltipFocusNode\" dojoAttachPoint=\"containerNode\" role=\"dialog\"></div>\n\t</div>\n\t<div class=\"dijitTooltipConnector\" role=\"presentation\"></div>\n</div>\n"),

			_setTitleAttr: function(/*String*/ title){
				this.containerNode.title = title;
				this._set("title", title)
			},

			postCreate: function(){
				this.inherited(arguments);
				this.connect(this.containerNode, "onkeypress", "_onKey");
			},

			orient: function(/*DomNode*/ node, /*String*/ aroundCorner, /*String*/ corner){
				// summary:
				//		Configure widget to be displayed in given position relative to the button.
				//		This is called from the dijit.popup code, and should not be called
				//		directly.
				// tags:
				//		protected
				var newC = "dijitTooltipAB" + (corner.charAt(1) == 'L' ? "Left" : "Right")
						+ " dijitTooltip"
						+ (corner.charAt(0) == 'T' ? "Below" : "Above");
				
				dojo.replaceClass(this.domNode, newC, this._currentOrientClass || "");
				this._currentOrientClass = newC;
			},

			focus: function(){
				// summary:
				//		Focus on first field
				this._getFocusItems(this.containerNode);
				dijit.focus(this._firstFocusItem);
			},

			onOpen: function(/*Object*/ pos){
				// summary:
				//		Called when dialog is displayed.
				//		This is called from the dijit.popup code, and should not be called directly.
				// tags:
				//		protected

				this.orient(this.domNode,pos.aroundCorner, pos.corner);
				this._onShow(); // lazy load trigger
			},

			onClose: function(){
				// summary:
				//		Called when dialog is hidden.
				//		This is called from the dijit.popup code, and should not be called directly.
				// tags:
				//		protected
				this.onHide();
			},

			_onKey: function(/*Event*/ evt){
				// summary:
				//		Handler for keyboard events
				// description:
				//		Keep keyboard focus in dialog; close dialog on escape key
				// tags:
				//		private

				var node = evt.target;
				var dk = dojo.keys;
				if(evt.charOrCode === dk.TAB){
					this._getFocusItems(this.containerNode);
				}
				var singleFocusItem = (this._firstFocusItem == this._lastFocusItem);
				if(evt.charOrCode == dk.ESCAPE){
					// Use setTimeout to avoid crash on IE, see #10396.
					setTimeout(dojo.hitch(this, "onCancel"), 0);
					dojo.stopEvent(evt);
				}else if(node == this._firstFocusItem && evt.shiftKey && evt.charOrCode === dk.TAB){
					if(!singleFocusItem){
						dijit.focus(this._lastFocusItem); // send focus to last item in dialog
					}
					dojo.stopEvent(evt);
				}else if(node == this._lastFocusItem && evt.charOrCode === dk.TAB && !evt.shiftKey){
					if(!singleFocusItem){
						dijit.focus(this._firstFocusItem); // send focus to first item in dialog
					}
					dojo.stopEvent(evt);
				}else if(evt.charOrCode === dk.TAB){
					// we want the browser's default tab handling to move focus
					// but we don't want the tab to propagate upwards
					evt.stopPropagation();
				}
			}
		}
	);

}

if(!dojo._hasResource["dijit.Dialog"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dijit.Dialog"] = true;
dojo.provide("dijit.Dialog");















// dijit/TooltipDialog required for back-compat.  TODO: remove in 2.0

/*=====
dijit._underlay = function(kwArgs){
	// summary:
	//		A shared instance of a `dijit.DialogUnderlay`
	//
	// description:
	//		A shared instance of a `dijit.DialogUnderlay` created and
	//		used by `dijit.Dialog`, though never created until some Dialog
	//		or subclass thereof is shown.
};
=====*/
dojo.declare(
	"dijit._DialogBase",
	[dijit._Templated, dijit.form._FormMixin, dijit._DialogMixin, dijit._CssStateMixin],
	{
		// summary:
		//		A modal dialog Widget
		//
		// description:
		//		Pops up a modal dialog window, blocking access to the screen
		//		and also graying out the screen Dialog is extended from
		//		ContentPane so it supports all the same parameters (href, etc.)
		//
		// example:
		// |	<div dojoType="dijit.Dialog" href="test.html"></div>
		//
		// example:
		// |	var foo = new dijit.Dialog({ title: "test dialog", content: "test content" };
		// |	dojo.body().appendChild(foo.domNode);
		// |	foo.startup();

		templateString: dojo.cache("dijit", "templates/Dialog.html", "<div class=\"dijitDialog\" role=\"dialog\" aria-labelledby=\"${id}_title\">\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\">\n\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\" id=\"${id}_title\"></span>\n\t<span dojoAttachPoint=\"closeButtonNode\" class=\"dijitDialogCloseIcon\" dojoAttachEvent=\"ondijitclick: onCancel\" title=\"${buttonCancel}\" role=\"button\" tabIndex=\"-1\">\n\t\t<span dojoAttachPoint=\"closeText\" class=\"closeText\" title=\"${buttonCancel}\">x</span>\n\t</span>\n\t</div>\n\t\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\"></div>\n</div>\n"),
		
		baseClass: "dijitDialog",
		
		cssStateNodes: {
			closeButtonNode: "dijitDialogCloseIcon"
		},

		attributeMap: dojo.delegate(dijit._Widget.prototype.attributeMap, {
			title: [
				{ node: "titleNode", type: "innerHTML" },
				{ node: "titleBar", type: "attribute" }
			],
			"aria-describedby":""
		}),

		// open: [readonly] Boolean
		//		True if Dialog is currently displayed on screen.
		open: false,

		// duration: Integer
		//		The time in milliseconds it takes the dialog to fade in and out
		duration: dijit.defaultDuration,

		// refocus: Boolean
		// 		A Toggle to modify the default focus behavior of a Dialog, which
		// 		is to re-focus the element which had focus before being opened.
		//		False will disable refocusing. Default: true
		refocus: true,

		// autofocus: Boolean
		// 		A Toggle to modify the default focus behavior of a Dialog, which
		// 		is to focus on the first dialog element after opening the dialog.
		//		False will disable autofocusing. Default: true
		autofocus: true,

		// _firstFocusItem: [private readonly] DomNode
		//		The pointer to the first focusable node in the dialog.
		//		Set by `dijit._DialogMixin._getFocusItems`.
		_firstFocusItem: null,

		// _lastFocusItem: [private readonly] DomNode
		//		The pointer to which node has focus prior to our dialog.
		//		Set by `dijit._DialogMixin._getFocusItems`.
		_lastFocusItem: null,

		// doLayout: [protected] Boolean
		//		Don't change this parameter from the default value.
		//		This ContentPane parameter doesn't make sense for Dialog, since Dialog
		//		is never a child of a layout container, nor can you specify the size of
		//		Dialog in order to control the size of an inner widget.
		doLayout: false,

		// draggable: Boolean
		//		Toggles the moveable aspect of the Dialog. If true, Dialog
		//		can be dragged by it's title. If false it will remain centered
		//		in the viewport.
		draggable: true,

		//aria-describedby: String
		//		Allows the user to add an aria-describedby attribute onto the dialog.   The value should
		//		be the id of the container element of text that describes the dialog purpose (usually
		//		the first text in the dialog).
		//		<div dojoType="dijit.Dialog" aria-describedby="intro" .....>
		//			<div id="intro">Introductory text</div>
		//			<div>rest of dialog contents</div>
		//		</div>
		"aria-describedby":"",

		postMixInProperties: function(){
			var _nlsResources = dojo.i18n.getLocalization("dijit", "common");
			dojo.mixin(this, _nlsResources);
			this.inherited(arguments);
		},

		postCreate: function(){
			dojo.style(this.domNode, {
				display: "none",
				position:"absolute"
			});
			dojo.body().appendChild(this.domNode);

			this.inherited(arguments);

			this.connect(this, "onExecute", "hide");
			this.connect(this, "onCancel", "hide");
			this._modalconnects = [];
		},

		onLoad: function(){
			// summary:
			//		Called when data has been loaded from an href.
			//		Unlike most other callbacks, this function can be connected to (via `dojo.connect`)
			//		but should *not* be overridden.
			// tags:
			//		callback

			// when href is specified we need to reposition the dialog after the data is loaded
			// and find the focusable elements
			this._position();
			if(this.autofocus && dijit._DialogLevelManager.isTop(this)){
				this._getFocusItems(this.domNode);
				dijit.focus(this._firstFocusItem);
			}
			this.inherited(arguments);
		},

		_endDrag: function(e){
			// summary:
			//		Called after dragging the Dialog. Saves the position of the dialog in the viewport.
			// tags:
			//		private
			if(e && e.node && e.node === this.domNode){
				this._relativePosition = dojo.position(e.node);
			}
		},

		_setup: function(){
			// summary:
			//		Stuff we need to do before showing the Dialog for the first
			//		time (but we defer it until right beforehand, for
			//		performance reasons).
			// tags:
			//		private

			var node = this.domNode;

			if(this.titleBar && this.draggable){
				this._moveable = (dojo.isIE == 6) ?
					new dojo.dnd.TimedMoveable(node, { handle: this.titleBar }) :	// prevent overload, see #5285
					new dojo.dnd.Moveable(node, { handle: this.titleBar, timeout: 0 });
				this._dndListener = dojo.subscribe("/dnd/move/stop",this,"_endDrag");
			}else{
				dojo.addClass(node,"dijitDialogFixed");
			}

			this.underlayAttrs = {
				dialogId: this.id,
				"class": dojo.map(this["class"].split(/\s/), function(s){ return s+"_underlay"; }).join(" ")
			};
		},

		_size: function(){
			// summary:
			// 		If necessary, shrink dialog contents so dialog fits in viewport
			// tags:
			//		private

			this._checkIfSingleChild();

			// If we resized the dialog contents earlier, reset them back to original size, so
			// that if the user later increases the viewport size, the dialog can display w/out a scrollbar.
			// Need to do this before the dojo.marginBox(this.domNode) call below.
			if(this._singleChild){
				if(this._singleChildOriginalStyle){
					this._singleChild.domNode.style.cssText = this._singleChildOriginalStyle;
				}
				delete this._singleChildOriginalStyle;
			}else{
				dojo.style(this.containerNode, {
					width:"auto",
					height:"auto"
				});
			}

			var mb = dojo._getMarginSize(this.domNode);
			var viewport = dojo.window.getBox();
			if(mb.w >= viewport.w || mb.h >= viewport.h){
				// Reduce size of dialog contents so that dialog fits in viewport

				var w = Math.min(mb.w, Math.floor(viewport.w * 0.75)),
					h = Math.min(mb.h, Math.floor(viewport.h * 0.75));

				if(this._singleChild && this._singleChild.resize){
					this._singleChildOriginalStyle = this._singleChild.domNode.style.cssText;
					this._singleChild.resize({w: w, h: h});
				}else{
					dojo.style(this.containerNode, {
						width: w + "px",
						height: h + "px",
						overflow: "auto",
						position: "relative"	// workaround IE bug moving scrollbar or dragging dialog
					});
				}
			}else{
				if(this._singleChild && this._singleChild.resize){
					this._singleChild.resize();
				}
			}
		},

		_position: function(){
			// summary:
			//		Position modal dialog in the viewport. If no relative offset
			//		in the viewport has been determined (by dragging, for instance),
			//		center the node. Otherwise, use the Dialog's stored relative offset,
			//		and position the node to top: left: values based on the viewport.
			// tags:
			//		private
			if(!dojo.hasClass(dojo.body(),"dojoMove")){
				var node = this.domNode,
					viewport = dojo.window.getBox(),
					p = this._relativePosition,
					bb = p ? null : dojo._getBorderBox(node),
					l = Math.floor(viewport.l + (p ? p.x : (viewport.w - bb.w) / 2)),
					t = Math.floor(viewport.t + (p ? p.y : (viewport.h - bb.h) / 2))
				;
				dojo.style(node,{
					left: l + "px",
					top: t + "px"
				});
			}
		},

		_onKey: function(/*Event*/ evt){
			// summary:
			//		Handles the keyboard events for accessibility reasons
			// tags:
			//		private

			if(evt.charOrCode){
				var dk = dojo.keys;
				var node = evt.target;
				if(evt.charOrCode === dk.TAB){
					this._getFocusItems(this.domNode);
				}
				var singleFocusItem = (this._firstFocusItem == this._lastFocusItem);
				// see if we are shift-tabbing from first focusable item on dialog
				if(node == this._firstFocusItem && evt.shiftKey && evt.charOrCode === dk.TAB){
					if(!singleFocusItem){
						dijit.focus(this._lastFocusItem); // send focus to last item in dialog
					}
					dojo.stopEvent(evt);
				}else if(node == this._lastFocusItem && evt.charOrCode === dk.TAB && !evt.shiftKey){
					if(!singleFocusItem){
						dijit.focus(this._firstFocusItem); // send focus to first item in dialog
					}
					dojo.stopEvent(evt);
				}else{
					// see if the key is for the dialog
					while(node){
						if(node == this.domNode || dojo.hasClass(node, "dijitPopup")){
							if(evt.charOrCode == dk.ESCAPE){
								this.onCancel();
							}else{
								return; // just let it go
							}
						}
						node = node.parentNode;
					}
					// this key is for the disabled document window
					if(evt.charOrCode !== dk.TAB){ // allow tabbing into the dialog for a11y
						dojo.stopEvent(evt);
					// opera won't tab to a div
					}else if(!dojo.isOpera){
						try{
							this._firstFocusItem.focus();
						}catch(e){ /*squelch*/ }
					}
				}
			}
		},

		show: function(){
			// summary:
			//		Display the dialog
			// returns: dojo.Deferred
			//		Deferred object that resolves when the display animation is complete

			if(this.open){ return; }

			if(!this._started){
				this.startup();
			}

			// first time we show the dialog, there's some initialization stuff to do
			if(!this._alreadyInitialized){
				this._setup();
				this._alreadyInitialized=true;
			}

			if(this._fadeOutDeferred){
				this._fadeOutDeferred.cancel();
			}

			this._modalconnects.push(dojo.connect(window, "onscroll", this, "layout"));
			this._modalconnects.push(dojo.connect(window, "onresize", this, function(){
				// IE gives spurious resize events and can actually get stuck
				// in an infinite loop if we don't ignore them
				var viewport = dojo.window.getBox();
				if(!this._oldViewport ||
						viewport.h != this._oldViewport.h ||
						viewport.w != this._oldViewport.w){
					this.layout();
					this._oldViewport = viewport;
				}
			}));
			this._modalconnects.push(dojo.connect(this.domNode, "onkeypress", this, "_onKey"));

			dojo.style(this.domNode, {
				opacity:0,
				display:""
			});

			this._set("open", true);
			this._onShow(); // lazy load trigger

			this._size();
			this._position();

			// fade-in Animation object, setup below
			var fadeIn;

			this._fadeInDeferred = new dojo.Deferred(dojo.hitch(this, function(){
				fadeIn.stop();
				delete this._fadeInDeferred;
			}));

			fadeIn = dojo.fadeIn({
				node: this.domNode,
				duration: this.duration,
				beforeBegin: dojo.hitch(this, function(){
					dijit._DialogLevelManager.show(this, this.underlayAttrs);
				}),
				onEnd: dojo.hitch(this, function(){
					if(this.autofocus && dijit._DialogLevelManager.isTop(this)){
						// find focusable items each time dialog is shown since if dialog contains a widget the
						// first focusable items can change
						this._getFocusItems(this.domNode);
						dijit.focus(this._firstFocusItem);
					}
					this._fadeInDeferred.callback(true);
					delete this._fadeInDeferred;
				})
			}).play();
			
			return this._fadeInDeferred;
		},

		hide: function(){
			// summary:
			//		Hide the dialog
			// returns: dojo.Deferred
			//		Deferred object that resolves when the hide animation is complete

			// if we haven't been initialized yet then we aren't showing and we can just return
			if(!this._alreadyInitialized){
				return;
			}
			if(this._fadeInDeferred){
				this._fadeInDeferred.cancel();
			}

			// fade-in Animation object, setup below
			var fadeOut;

			this._fadeOutDeferred = new dojo.Deferred(dojo.hitch(this, function(){
				fadeOut.stop();
				delete this._fadeOutDeferred;
			}));

			fadeOut = dojo.fadeOut({
				node: this.domNode,
				duration: this.duration,
				onEnd: dojo.hitch(this, function(){
					this.domNode.style.display = "none";
					dijit._DialogLevelManager.hide(this);
					this.onHide();
					this._fadeOutDeferred.callback(true);
					delete this._fadeOutDeferred;
				})
			 }).play();

			if(this._scrollConnected){
				this._scrollConnected = false;
			}
			dojo.forEach(this._modalconnects, dojo.disconnect);
			this._modalconnects = [];

			if(this._relativePosition){
				delete this._relativePosition;
			}
			this._set("open", false);

			return this._fadeOutDeferred;
		},

		layout: function(){
			// summary:
			//		Position the Dialog and the underlay
			// tags:
			//		private
			if(this.domNode.style.display != "none"){
				if(dijit._underlay){	// avoid race condition during show()
					dijit._underlay.layout();
				}
				this._position();
			}
		},

		destroy: function(){
			if(this._fadeInDeferred){
				this._fadeInDeferred.cancel();
			}
			if(this._fadeOutDeferred){
				this._fadeOutDeferred.cancel();
			}
			if(this._moveable){
				this._moveable.destroy();
			}
			if(this._dndListener){
				dojo.unsubscribe(this._dndListener);
			}
			dojo.forEach(this._modalconnects, dojo.disconnect);

			dijit._DialogLevelManager.hide(this);

			this.inherited(arguments);
		}
	}
);

dojo.declare(
	"dijit.Dialog",
	[dijit.layout.ContentPane, dijit._DialogBase],
	{}
);

dijit._DialogLevelManager = {
	// summary:
	//		Controls the various active "levels" on the page, starting with the
	//		stuff initially visible on the page (at z-index 0), and then having an entry for
	//		each Dialog shown.

	show: function(/*dijit._Widget*/ dialog, /*Object*/ underlayAttrs){
		// summary:
		//		Call right before fade-in animation for new dialog.
		//		Saves current focus, displays/adjusts underlay for new dialog,
		//		and sets the z-index of the dialog itself.
		//
		//		New dialog will be displayed on top of all currently displayed dialogs.
		//
		//		Caller is responsible for setting focus in new dialog after the fade-in
		//		animation completes.

		var ds = dijit._dialogStack;

		// Save current focus
		ds[ds.length-1].focus = dijit.getFocus(dialog);

		// Display the underlay, or if already displayed then adjust for this new dialog
		var underlay = dijit._underlay;
		if(!underlay || underlay._destroyed){
			underlay = dijit._underlay = new dijit.DialogUnderlay(underlayAttrs);
		}else{
			underlay.set(dialog.underlayAttrs);
		}

		// Set z-index a bit above previous dialog
		var zIndex = ds[ds.length-1].dialog ? ds[ds.length-1].zIndex + 2 : 950;
		if(ds.length == 1){	// first dialog
			underlay.show();
		}
		dojo.style(dijit._underlay.domNode, 'zIndex', zIndex - 1);

		// Dialog
		dojo.style(dialog.domNode, 'zIndex', zIndex);

		ds.push({dialog: dialog, underlayAttrs: underlayAttrs, zIndex: zIndex});
	},

	hide: function(/*dijit._Widget*/ dialog){
		// summary:
		//		Called when the specified dialog is hidden/destroyed, after the fade-out
		//		animation ends, in order to reset page focus, fix the underlay, etc.
		//		If the specified dialog isn't open then does nothing.
		//
		//		Caller is responsible for either setting display:none on the dialog domNode,
		//		or calling dijit.popup.hide(), or removing it from the page DOM.

		var ds = dijit._dialogStack;

		if(ds[ds.length-1].dialog == dialog){
			// Removing the top (or only) dialog in the stack, return focus
			// to previous dialog

			ds.pop();

			var pd = ds[ds.length-1];	// the new active dialog (or the base page itself)

			// Adjust underlay
			if(ds.length == 1){
				// Returning to original page.
				// Hide the underlay, unless the underlay widget has already been destroyed
				// because we are being called during page unload (when all widgets are destroyed)
				if(!dijit._underlay._destroyed){
					dijit._underlay.hide();
				}
			}else{
				// Popping back to previous dialog, adjust underlay
				dojo.style(dijit._underlay.domNode, 'zIndex', pd.zIndex - 1);
				dijit._underlay.set(pd.underlayAttrs);
			}

			// Adjust focus
			if(dialog.refocus){
				// If we are returning control to a previous dialog but for some reason
				// that dialog didn't have a focused field, set focus to first focusable item.
				// This situation could happen if two dialogs appeared at nearly the same time,
				// since a dialog doesn't set it's focus until the fade-in is finished.
				var focus = pd.focus;
				if(!focus || (pd.dialog && !dojo.isDescendant(focus.node, pd.dialog.domNode))){
					pd.dialog._getFocusItems(pd.dialog.domNode);
					focus = pd.dialog._firstFocusItem;
				}
	
				try{
					dijit.focus(focus);
				}catch(e){
					/* focus() will fail if user opened the dialog by clicking a non-focusable element */
				}
			}
		}else{
			// Removing a dialog out of order (#9944, #10705).
			// Don't need to mess with underlay or z-index or anything.
			var idx = dojo.indexOf(dojo.map(ds, function(elem){return elem.dialog}), dialog);
			if(idx != -1){
				ds.splice(idx, 1);
			}
		}
	},

	isTop: function(/*dijit._Widget*/ dialog){
		// summary:
		//		Returns true if specified Dialog is the top in the task
		var ds = dijit._dialogStack;
		return ds[ds.length-1].dialog == dialog;
	}
};

// Stack representing the various active "levels" on the page, starting with the
// stuff initially visible on the page (at z-index 0), and then having an entry for
// each Dialog shown.
// Each element in stack has form {
//		dialog: dialogWidget,
//		focus: returnFromGetFocus(),
//		underlayAttrs: attributes to set on underlay (when this widget is active)
// }
dijit._dialogStack = [
	{dialog: null, focus: null, underlayAttrs: null}	// entry for stuff at z-index: 0
];

}

if(!dojo._hasResource["scorll.asset.Dialog"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.asset.Dialog"] = true;
dojo.provide("scorll.asset.Dialog");



dojo.declare("scorll.asset.Dialog", [dijit.Dialog], {
    _isPositioned: false,
    _position: function () {
        if(this._isPositioned == false) {
            this.inherited(arguments);
            this._isPositioned = true;
        }
    }
});

}

if(!dojo._hasResource["scorll.stage.Stage"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.stage.Stage"] = true;
dojo.provide("scorll.stage.Stage");













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
        // MENU
        var menu = stage.menu = new scorll.stage.Menu();
        stage.menu = menu;
        menu.placeAt(dojo.body());
        menu.hide();
        dojo.connect(menu, "onEdit", function (widget) {
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
            container.domNode.scrollIntoView();
            dojo.connect(form, "onSubmit", function (item) {
                container.destroyRecursive();
                stage.content.update(item);
            });
            dojo.connect(form, "onCancel", function () {
                container.destroyRecursive();
                widget.domNode.style.display = "block";
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

}

if(!dojo._hasResource["scorll.asset.Shared"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.asset.Shared"] = true;
dojo.provide("scorll.asset.Shared");

dojo.declare("scorll.asset.Shared", null, {
    call: function(methodName) {
        var params = Array.prototype.slice.call(arguments, 1);
        this.client.call(this, 'call', methodName, params);
    },
    receive: function(methodName, args) {
        if (typeof(this[methodName]) == "function") {
            this[methodName].apply(this, args);
        }
    }
});

}

if(!dojo._hasResource["dijit.dijit"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dijit.dijit"] = true;
dojo.provide("dijit.dijit");









/*=====
dijit.dijit = {
	// summary:
	//		A roll-up for common dijit methods
	// description:
	//	A rollup file for the build system including the core and common
	//	dijit files.
	//
	// example:
	// | <script type="text/javascript" src="js/dojo/dijit/dijit.js"></script>
	//
};
=====*/

// All the stuff in _base (these are the function that are guaranteed available without an explicit dojo.require)

// And some other stuff that we tend to pull in all the time anyway

}

if(!dojo._hasResource["dijit._KeyNavContainer"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dijit._KeyNavContainer"] = true;
dojo.provide("dijit._KeyNavContainer");



dojo.declare("dijit._KeyNavContainer",
	dijit._Container,
	{

		// summary:
		//		A _Container with keyboard navigation of its children.
		// description:
		//		To use this mixin, call connectKeyNavHandlers() in
		//		postCreate() and call startupKeyNavChildren() in startup().
		//		It provides normalized keyboard and focusing code for Container
		//		widgets.
/*=====
		// focusedChild: [protected] Widget
		//		The currently focused child widget, or null if there isn't one
		focusedChild: null,
=====*/

		// tabIndex: Integer
		//		Tab index of the container; same as HTML tabIndex attribute.
		//		Note then when user tabs into the container, focus is immediately
		//		moved to the first item in the container.
		tabIndex: "0",

		_keyNavCodes: {},

		connectKeyNavHandlers: function(/*dojo.keys[]*/ prevKeyCodes, /*dojo.keys[]*/ nextKeyCodes){
			// summary:
			//		Call in postCreate() to attach the keyboard handlers
			//		to the container.
			// preKeyCodes: dojo.keys[]
			//		Key codes for navigating to the previous child.
			// nextKeyCodes: dojo.keys[]
			//		Key codes for navigating to the next child.
			// tags:
			//		protected

			var keyCodes = (this._keyNavCodes = {});
			var prev = dojo.hitch(this, this.focusPrev);
			var next = dojo.hitch(this, this.focusNext);
			dojo.forEach(prevKeyCodes, function(code){ keyCodes[code] = prev; });
			dojo.forEach(nextKeyCodes, function(code){ keyCodes[code] = next; });
			keyCodes[dojo.keys.HOME] = dojo.hitch(this, "focusFirstChild");
			keyCodes[dojo.keys.END] = dojo.hitch(this, "focusLastChild");
			this.connect(this.domNode, "onkeypress", "_onContainerKeypress");
			this.connect(this.domNode, "onfocus", "_onContainerFocus");
		},

		startupKeyNavChildren: function(){
			// summary:
			//		Call in startup() to set child tabindexes to -1
			// tags:
			//		protected
			dojo.forEach(this.getChildren(), dojo.hitch(this, "_startupChild"));
		},

		addChild: function(/*dijit._Widget*/ widget, /*int?*/ insertIndex){
			// summary:
			//		Add a child to our _Container
			dijit._KeyNavContainer.superclass.addChild.apply(this, arguments);
			this._startupChild(widget);
		},

		focus: function(){
			// summary:
			//		Default focus() implementation: focus the first child.
			this.focusFirstChild();
		},

		focusFirstChild: function(){
			// summary:
			//		Focus the first focusable child in the container.
			// tags:
			//		protected
			var child = this._getFirstFocusableChild();
			if(child){ // edge case: Menu could be empty or hidden
				this.focusChild(child);
			}
		},

		focusLastChild: function(){
			// summary:
			//		Focus the last focusable child in the container.
			// tags:
			//		protected
			var child = this._getLastFocusableChild();
			if(child){ // edge case: Menu could be empty or hidden
				this.focusChild(child);
			}
		},

		focusNext: function(){
			// summary:
			//		Focus the next widget
			// tags:
			//		protected
			var child = this._getNextFocusableChild(this.focusedChild, 1);
			this.focusChild(child);
		},

		focusPrev: function(){
			// summary:
			//		Focus the last focusable node in the previous widget
			//		(ex: go to the ComboButton icon section rather than button section)
			// tags:
			//		protected
			var child = this._getNextFocusableChild(this.focusedChild, -1);
			this.focusChild(child, true);
		},

		focusChild: function(/*dijit._Widget*/ widget, /*Boolean*/ last){
			// summary:
			//		Focus widget.
			// widget:
			//		Reference to container's child widget
			// last:
			//		If true and if widget has multiple focusable nodes, focus the
			//		last one instead of the first one
			// tags:
			//		protected
			
			if(this.focusedChild && widget !== this.focusedChild){
				this._onChildBlur(this.focusedChild);
			}
			widget.set("tabIndex", this.tabIndex);	// for IE focus outline to appear, must set tabIndex before focs
			widget.focus(last ? "end" : "start");
			this._set("focusedChild", widget);
		},

		_startupChild: function(/*dijit._Widget*/ widget){
			// summary:
			//		Setup for each child widget
			// description:
			//		Sets tabIndex=-1 on each child, so that the tab key will
			//		leave the container rather than visiting each child.
			// tags:
			//		private
			
			widget.set("tabIndex", "-1");
			
			this.connect(widget, "_onFocus", function(){
				// Set valid tabIndex so tabbing away from widget goes to right place, see #10272
				widget.set("tabIndex", this.tabIndex);
			});
			this.connect(widget, "_onBlur", function(){
				widget.set("tabIndex", "-1");
			});
		},

		_onContainerFocus: function(evt){
			// summary:
			//		Handler for when the container gets focus
			// description:
			//		Initially the container itself has a tabIndex, but when it gets
			//		focus, switch focus to first child...
			// tags:
			//		private

			// Note that we can't use _onFocus() because switching focus from the
			// _onFocus() handler confuses the focus.js code
			// (because it causes _onFocusNode() to be called recursively)

			// focus bubbles on Firefox,
			// so just make sure that focus has really gone to the container
			if(evt.target !== this.domNode){ return; }

			this.focusFirstChild();

			// and then set the container's tabIndex to -1,
			// (don't remove as that breaks Safari 4)
			// so that tab or shift-tab will go to the fields after/before
			// the container, rather than the container itself
			dojo.attr(this.domNode, "tabIndex", "-1");
		},

		_onBlur: function(evt){
			// When focus is moved away the container, and its descendant (popup) widgets,
			// then restore the container's tabIndex so that user can tab to it again.
			// Note that using _onBlur() so that this doesn't happen when focus is shifted
			// to one of my child widgets (typically a popup)
			if(this.tabIndex){
				dojo.attr(this.domNode, "tabIndex", this.tabIndex);
			}
			this.inherited(arguments);
		},

		_onContainerKeypress: function(evt){
			// summary:
			//		When a key is pressed, if it's an arrow key etc. then
			//		it's handled here.
			// tags:
			//		private
			if(evt.ctrlKey || evt.altKey){ return; }
			var func = this._keyNavCodes[evt.charOrCode];
			if(func){
				func();
				dojo.stopEvent(evt);
			}
		},

		_onChildBlur: function(/*dijit._Widget*/ widget){
			// summary:
			//		Called when focus leaves a child widget to go
			//		to a sibling widget.
			// tags:
			//		protected
		},

		_getFirstFocusableChild: function(){
			// summary:
			//		Returns first child that can be focused
			return this._getNextFocusableChild(null, 1);	// dijit._Widget
		},

		_getLastFocusableChild: function(){
			// summary:
			//		Returns last child that can be focused
			return this._getNextFocusableChild(null, -1);	// dijit._Widget
		},

		_getNextFocusableChild: function(child, dir){
			// summary:
			//		Returns the next or previous focusable child, compared
			//		to "child"
			// child: Widget
			//		The current widget
			// dir: Integer
			//		* 1 = after
			//		* -1 = before
			if(child){
				child = this._getSiblingOfChild(child, dir);
			}
			var children = this.getChildren();
			for(var i=0; i < children.length; i++){
				if(!child){
					child = children[(dir>0) ? 0 : (children.length-1)];
				}
				if(child.isFocusable()){
					return child;	// dijit._Widget
				}
				child = this._getSiblingOfChild(child, dir);
			}
			// no focusable child found
			return null;	// dijit._Widget
		}
	}
);

}

if(!dojo._hasResource["dijit.MenuItem"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dijit.MenuItem"] = true;
dojo.provide("dijit.MenuItem");






dojo.declare("dijit.MenuItem",
		[dijit._Widget, dijit._Templated, dijit._Contained, dijit._CssStateMixin],
		{
		// summary:
		//		A line item in a Menu Widget

		// Make 3 columns
		// icon, label, and expand arrow (BiDi-dependent) indicating sub-menu
		templateString: dojo.cache("dijit", "templates/MenuItem.html", "<tr class=\"dijitReset dijitMenuItem\" dojoAttachPoint=\"focusNode\" role=\"menuitem\" tabIndex=\"-1\"\n\t\tdojoAttachEvent=\"onmouseenter:_onHover,onmouseleave:_onUnhover,ondijitclick:_onClick\">\n\t<td class=\"dijitReset dijitMenuItemIconCell\" role=\"presentation\">\n\t\t<img src=\"${_blankGif}\" alt=\"\" class=\"dijitIcon dijitMenuItemIcon\" dojoAttachPoint=\"iconNode\"/>\n\t</td>\n\t<td class=\"dijitReset dijitMenuItemLabel\" colspan=\"2\" dojoAttachPoint=\"containerNode\"></td>\n\t<td class=\"dijitReset dijitMenuItemAccelKey\" style=\"display: none\" dojoAttachPoint=\"accelKeyNode\"></td>\n\t<td class=\"dijitReset dijitMenuArrowCell\" role=\"presentation\">\n\t\t<div dojoAttachPoint=\"arrowWrapper\" style=\"visibility: hidden\">\n\t\t\t<img src=\"${_blankGif}\" alt=\"\" class=\"dijitMenuExpand\"/>\n\t\t\t<span class=\"dijitMenuExpandA11y\">+</span>\n\t\t</div>\n\t</td>\n</tr>\n"),

		attributeMap: dojo.delegate(dijit._Widget.prototype.attributeMap, {
			label: { node: "containerNode", type: "innerHTML" },
			iconClass: { node: "iconNode", type: "class" }
		}),

		baseClass: "dijitMenuItem",

		// label: String
		//		Menu text
		label: '',

		// iconClass: String
		//		Class to apply to DOMNode to make it display an icon.
		iconClass: "",

		// accelKey: String
		//		Text for the accelerator (shortcut) key combination.
		//		Note that although Menu can display accelerator keys there
		//		is no infrastructure to actually catch and execute these
		//		accelerators.
		accelKey: "",

		// disabled: Boolean
		//		If true, the menu item is disabled.
		//		If false, the menu item is enabled.
		disabled: false,

		_fillContent: function(/*DomNode*/ source){
			// If button label is specified as srcNodeRef.innerHTML rather than
			// this.params.label, handle it here.
			if(source && !("label" in this.params)){
				this.set('label', source.innerHTML);
			}
		},

		buildRendering: function(){
			this.inherited(arguments);
			var label = this.id+"_text";
			dojo.attr(this.containerNode, "id", label);
			if(this.accelKeyNode){
				dojo.attr(this.accelKeyNode, "id", this.id + "_accel");
				label += " " + this.id + "_accel";
			}
			dijit.setWaiState(this.domNode, "labelledby", label);
			dojo.setSelectable(this.domNode, false);
		},

		_onHover: function(){
			// summary:
			//		Handler when mouse is moved onto menu item
			// tags:
			//		protected
			this.getParent().onItemHover(this);
		},

		_onUnhover: function(){
			// summary:
			//		Handler when mouse is moved off of menu item,
			//		possibly to a child menu, or maybe to a sibling
			//		menuitem or somewhere else entirely.
			// tags:
			//		protected

			// if we are unhovering the currently selected item
			// then unselect it
			this.getParent().onItemUnhover(this);

			// When menu is hidden (collapsed) due to clicking a MenuItem and having it execute,
			// FF and IE don't generate an onmouseout event for the MenuItem.
			// So, help out _CssStateMixin in this case.
			this._set("hovering", false);
		},

		_onClick: function(evt){
			// summary:
			//		Internal handler for click events on MenuItem.
			// tags:
			//		private
			this.getParent().onItemClick(this, evt);
			dojo.stopEvent(evt);
		},

		onClick: function(/*Event*/ evt){
			// summary:
			//		User defined function to handle clicks
			// tags:
			//		callback
		},

		focus: function(){
			// summary:
			//		Focus on this MenuItem
			try{
				if(dojo.isIE == 8){
					// needed for IE8 which won't scroll TR tags into view on focus yet calling scrollIntoView creates flicker (#10275)
					this.containerNode.focus();
				}
				dijit.focus(this.focusNode);
			}catch(e){
				// this throws on IE (at least) in some scenarios
			}
		},

		_onFocus: function(){
			// summary:
			//		This is called by the focus manager when focus
			//		goes to this MenuItem or a child menu.
			// tags:
			//		protected
			this._setSelected(true);
			this.getParent()._onItemFocus(this);

			this.inherited(arguments);
		},

		_setSelected: function(selected){
			// summary:
			//		Indicate that this node is the currently selected one
			// tags:
			//		private

			/***
			 * TODO: remove this method and calls to it, when _onBlur() is working for MenuItem.
			 * Currently _onBlur() gets called when focus is moved from the MenuItem to a child menu.
			 * That's not supposed to happen, but the problem is:
			 * In order to allow dijit.popup's getTopPopup() to work,a sub menu's popupParent
			 * points to the parent Menu, bypassing the parent MenuItem... thus the
			 * MenuItem is not in the chain of active widgets and gets a premature call to
			 * _onBlur()
			 */

			dojo.toggleClass(this.domNode, "dijitMenuItemSelected", selected);
		},

		setLabel: function(/*String*/ content){
			// summary:
			//		Deprecated.   Use set('label', ...) instead.
			// tags:
			//		deprecated
			dojo.deprecated("dijit.MenuItem.setLabel() is deprecated.  Use set('label', ...) instead.", "", "2.0");
			this.set("label", content);
		},

		setDisabled: function(/*Boolean*/ disabled){
			// summary:
			//		Deprecated.   Use set('disabled', bool) instead.
			// tags:
			//		deprecated
			dojo.deprecated("dijit.Menu.setDisabled() is deprecated.  Use set('disabled', bool) instead.", "", "2.0");
			this.set('disabled', disabled);
		},
		_setDisabledAttr: function(/*Boolean*/ value){
			// summary:
			//		Hook for attr('disabled', ...) to work.
			//		Enable or disable this menu item.

			dijit.setWaiState(this.focusNode, 'disabled', value ? 'true' : 'false');
			this._set("disabled", value);
		},
		_setAccelKeyAttr: function(/*String*/ value){
			// summary:
			//		Hook for attr('accelKey', ...) to work.
			//		Set accelKey on this menu item.

			this.accelKeyNode.style.display=value?"":"none";
			this.accelKeyNode.innerHTML=value;
			//have to use colSpan to make it work in IE
			dojo.attr(this.containerNode,'colSpan',value?"1":"2");
			
			this._set("accelKey", value);
		}
	});

}

if(!dojo._hasResource["dijit.PopupMenuItem"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dijit.PopupMenuItem"] = true;
dojo.provide("dijit.PopupMenuItem");



dojo.declare("dijit.PopupMenuItem",
		dijit.MenuItem,
		{
		_fillContent: function(){
			// summary:
			//		When Menu is declared in markup, this code gets the menu label and
			//		the popup widget from the srcNodeRef.
			// description:
			//		srcNodeRefinnerHTML contains both the menu item text and a popup widget
			//		The first part holds the menu item text and the second part is the popup
			// example:
			// |	<div dojoType="dijit.PopupMenuItem">
			// |		<span>pick me</span>
			// |		<popup> ... </popup>
			// |	</div>
			// tags:
			//		protected

			if(this.srcNodeRef){
				var nodes = dojo.query("*", this.srcNodeRef);
				dijit.PopupMenuItem.superclass._fillContent.call(this, nodes[0]);

				// save pointer to srcNode so we can grab the drop down widget after it's instantiated
				this.dropDownContainer = this.srcNodeRef;
			}
		},

		startup: function(){
			if(this._started){ return; }
			this.inherited(arguments);

			// we didn't copy the dropdown widget from the this.srcNodeRef, so it's in no-man's
			// land now.  move it to dojo.doc.body.
			if(!this.popup){
				var node = dojo.query("[widgetId]", this.dropDownContainer)[0];
				this.popup = dijit.byNode(node);
			}
			dojo.body().appendChild(this.popup.domNode);
			this.popup.startup();

			this.popup.domNode.style.display="none";
			if(this.arrowWrapper){
				dojo.style(this.arrowWrapper, "visibility", "");
			}
			dijit.setWaiState(this.focusNode, "haspopup", "true");
		},

		destroyDescendants: function(){
			if(this.popup){
				// Destroy the popup, unless it's already been destroyed.  This can happen because
				// the popup is a direct child of <body> even though it's logically my child.
				if(!this.popup._destroyed){
					this.popup.destroyRecursive();
				}
				delete this.popup;
			}
			this.inherited(arguments);
		}
	});

}

if(!dojo._hasResource["dijit.CheckedMenuItem"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dijit.CheckedMenuItem"] = true;
dojo.provide("dijit.CheckedMenuItem");



dojo.declare("dijit.CheckedMenuItem",
		dijit.MenuItem,
		{
		// summary:
		//		A checkbox-like menu item for toggling on and off

		templateString: dojo.cache("dijit", "templates/CheckedMenuItem.html", "<tr class=\"dijitReset dijitMenuItem\" dojoAttachPoint=\"focusNode\" role=\"menuitemcheckbox\" tabIndex=\"-1\"\n\t\tdojoAttachEvent=\"onmouseenter:_onHover,onmouseleave:_onUnhover,ondijitclick:_onClick\">\n\t<td class=\"dijitReset dijitMenuItemIconCell\" role=\"presentation\">\n\t\t<img src=\"${_blankGif}\" alt=\"\" class=\"dijitMenuItemIcon dijitCheckedMenuItemIcon\" dojoAttachPoint=\"iconNode\"/>\n\t\t<span class=\"dijitCheckedMenuItemIconChar\">&#10003;</span>\n\t</td>\n\t<td class=\"dijitReset dijitMenuItemLabel\" colspan=\"2\" dojoAttachPoint=\"containerNode,labelNode\"></td>\n\t<td class=\"dijitReset dijitMenuItemAccelKey\" style=\"display: none\" dojoAttachPoint=\"accelKeyNode\"></td>\n\t<td class=\"dijitReset dijitMenuArrowCell\" role=\"presentation\">&nbsp;</td>\n</tr>\n"),

		// checked: Boolean
		//		Our checked state
		checked: false,
		_setCheckedAttr: function(/*Boolean*/ checked){
			// summary:
			//		Hook so attr('checked', bool) works.
			//		Sets the class and state for the check box.
			dojo.toggleClass(this.domNode, "dijitCheckedMenuItemChecked", checked);
			dijit.setWaiState(this.domNode, "checked", checked);
			this._set("checked", checked);
		},

		onChange: function(/*Boolean*/ checked){
			// summary:
			//		User defined function to handle check/uncheck events
			// tags:
			//		callback
		},

		_onClick: function(/*Event*/ e){
			// summary:
			//		Clicking this item just toggles its state
			// tags:
			//		private
			if(!this.disabled){
				this.set("checked", !this.checked);
				this.onChange(this.checked);
			}
			this.inherited(arguments);
		}
	});

}

if(!dojo._hasResource["dijit.MenuSeparator"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dijit.MenuSeparator"] = true;
dojo.provide("dijit.MenuSeparator");





dojo.declare("dijit.MenuSeparator",
		[dijit._Widget, dijit._Templated, dijit._Contained],
		{
		// summary:
		//		A line between two menu items

		templateString: dojo.cache("dijit", "templates/MenuSeparator.html", "<tr class=\"dijitMenuSeparator\">\n\t<td class=\"dijitMenuSeparatorIconCell\">\n\t\t<div class=\"dijitMenuSeparatorTop\"></div>\n\t\t<div class=\"dijitMenuSeparatorBottom\"></div>\n\t</td>\n\t<td colspan=\"3\" class=\"dijitMenuSeparatorLabelCell\">\n\t\t<div class=\"dijitMenuSeparatorTop dijitMenuSeparatorLabel\"></div>\n\t\t<div class=\"dijitMenuSeparatorBottom\"></div>\n\t</td>\n</tr>\n"),

		buildRendering: function(){
			this.inherited(arguments);
			dojo.setSelectable(this.domNode, false);
		},

		isFocusable: function(){
			// summary:
			//		Override to always return false
			// tags:
			//		protected

			return false; // Boolean
		}
	});

}

if(!dojo._hasResource["dijit.Menu"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dijit.Menu"] = true;
dojo.provide("dijit.Menu");










// "dijit/MenuItem", "dijit/PopupMenuItem", "dijit/CheckedMenuItem", "dijit/MenuSeparator" for Back-compat (TODO: remove in 2.0)

dojo.declare("dijit._MenuBase",
	[dijit._Widget, dijit._Templated, dijit._KeyNavContainer],
{
	// summary:
	//		Base class for Menu and MenuBar

	// parentMenu: [readonly] Widget
	//		pointer to menu that displayed me
	parentMenu: null,

	// popupDelay: Integer
	//		number of milliseconds before hovering (without clicking) causes the popup to automatically open.
	popupDelay: 500,

	startup: function(){
		if(this._started){ return; }

		dojo.forEach(this.getChildren(), function(child){ child.startup(); });
		this.startupKeyNavChildren();

		this.inherited(arguments);
	},

	onExecute: function(){
		// summary:
		//		Attach point for notification about when a menu item has been executed.
		//		This is an internal mechanism used for Menus to signal to their parent to
		//		close them, because they are about to execute the onClick handler.   In
		//		general developers should not attach to or override this method.
		// tags:
		//		protected
	},

	onCancel: function(/*Boolean*/ closeAll){
		// summary:
		//		Attach point for notification about when the user cancels the current menu
		//		This is an internal mechanism used for Menus to signal to their parent to
		//		close them.  In general developers should not attach to or override this method.
		// tags:
		//		protected
	},

	_moveToPopup: function(/*Event*/ evt){
		// summary:
		//		This handles the right arrow key (left arrow key on RTL systems),
		//		which will either open a submenu, or move to the next item in the
		//		ancestor MenuBar
		// tags:
		//		private

		if(this.focusedChild && this.focusedChild.popup && !this.focusedChild.disabled){
			this.focusedChild._onClick(evt);
		}else{
			var topMenu = this._getTopMenu();
			if(topMenu && topMenu._isMenuBar){
				topMenu.focusNext();
			}
		}
	},

	_onPopupHover: function(/*Event*/ evt){
		// summary:
		//		This handler is called when the mouse moves over the popup.
		// tags:
		//		private

		// if the mouse hovers over a menu popup that is in pending-close state,
		// then stop the close operation.
		// This can't be done in onItemHover since some popup targets don't have MenuItems (e.g. ColorPicker)
		if(this.currentPopup && this.currentPopup._pendingClose_timer){
			var parentMenu = this.currentPopup.parentMenu;
			// highlight the parent menu item pointing to this popup
			if(parentMenu.focusedChild){
				parentMenu.focusedChild._setSelected(false);
			}
			parentMenu.focusedChild = this.currentPopup.from_item;
			parentMenu.focusedChild._setSelected(true);
			// cancel the pending close
			this._stopPendingCloseTimer(this.currentPopup);
		}
	},

	onItemHover: function(/*MenuItem*/ item){
		// summary:
		//		Called when cursor is over a MenuItem.
		// tags:
		//		protected

		// Don't do anything unless user has "activated" the menu by:
		//		1) clicking it
		//		2) opening it from a parent menu (which automatically focuses it)
		if(this.isActive){
			this.focusChild(item);
			if(this.focusedChild.popup && !this.focusedChild.disabled && !this.hover_timer){
				this.hover_timer = setTimeout(dojo.hitch(this, "_openPopup"), this.popupDelay);
			}
		}
		// if the user is mixing mouse and keyboard navigation,
		// then the menu may not be active but a menu item has focus,
		// but it's not the item that the mouse just hovered over.
		// To avoid both keyboard and mouse selections, use the latest.
		if(this.focusedChild){
			this.focusChild(item);
		}
		this._hoveredChild = item;
	},

	_onChildBlur: function(item){
		// summary:
		//		Called when a child MenuItem becomes inactive because focus
		//		has been removed from the MenuItem *and* it's descendant menus.
		// tags:
		//		private
		this._stopPopupTimer();
		item._setSelected(false);
		// Close all popups that are open and descendants of this menu
		var itemPopup = item.popup;
		if(itemPopup){
			this._stopPendingCloseTimer(itemPopup);
			itemPopup._pendingClose_timer = setTimeout(function(){
				itemPopup._pendingClose_timer = null;
				if(itemPopup.parentMenu){
					itemPopup.parentMenu.currentPopup = null;
				}
				dijit.popup.close(itemPopup); // this calls onClose
			}, this.popupDelay);
		}
	},

	onItemUnhover: function(/*MenuItem*/ item){
		// summary:
		//		Callback fires when mouse exits a MenuItem
		// tags:
		//		protected

		if(this.isActive){
			this._stopPopupTimer();
		}
		if(this._hoveredChild == item){ this._hoveredChild = null; }
	},

	_stopPopupTimer: function(){
		// summary:
		//		Cancels the popup timer because the user has stop hovering
		//		on the MenuItem, etc.
		// tags:
		//		private
		if(this.hover_timer){
			clearTimeout(this.hover_timer);
			this.hover_timer = null;
		}
	},

	_stopPendingCloseTimer: function(/*dijit._Widget*/ popup){
		// summary:
		//		Cancels the pending-close timer because the close has been preempted
		// tags:
		//		private
		if(popup._pendingClose_timer){
			clearTimeout(popup._pendingClose_timer);
			popup._pendingClose_timer = null;
		}
	},

	_stopFocusTimer: function(){
		// summary:
		//		Cancels the pending-focus timer because the menu was closed before focus occured
		// tags:
		//		private
		if(this._focus_timer){
			clearTimeout(this._focus_timer);
			this._focus_timer = null;
		}
	},

	_getTopMenu: function(){
		// summary:
		//		Returns the top menu in this chain of Menus
		// tags:
		//		private
		for(var top=this; top.parentMenu; top=top.parentMenu);
		return top;
	},

	onItemClick: function(/*dijit._Widget*/ item, /*Event*/ evt){
		// summary:
		//		Handle clicks on an item.
		// tags:
		//		private

		// this can't be done in _onFocus since the _onFocus events occurs asynchronously
		if(typeof this.isShowingNow == 'undefined'){ // non-popup menu
			this._markActive();
		}

		this.focusChild(item);

		if(item.disabled){ return false; }

		if(item.popup){
			this._openPopup();
		}else{
			// before calling user defined handler, close hierarchy of menus
			// and restore focus to place it was when menu was opened
			this.onExecute();

			// user defined handler for click
			item.onClick(evt);
		}
	},

	_openPopup: function(){
		// summary:
		//		Open the popup to the side of/underneath the current menu item
		// tags:
		//		protected

		this._stopPopupTimer();
		var from_item = this.focusedChild;
		if(!from_item){ return; } // the focused child lost focus since the timer was started
		var popup = from_item.popup;
		if(popup.isShowingNow){ return; }
		if(this.currentPopup){
			this._stopPendingCloseTimer(this.currentPopup);
			dijit.popup.close(this.currentPopup);
		}
		popup.parentMenu = this;
		popup.from_item = from_item; // helps finding the parent item that should be focused for this popup
		var self = this;
		dijit.popup.open({
			parent: this,
			popup: popup,
			around: from_item.domNode,
			orient: this._orient || (this.isLeftToRight() ?
									{'TR': 'TL', 'TL': 'TR', 'BR': 'BL', 'BL': 'BR'} :
									{'TL': 'TR', 'TR': 'TL', 'BL': 'BR', 'BR': 'BL'}),
			onCancel: function(){ // called when the child menu is canceled
				// set isActive=false (_closeChild vs _cleanUp) so that subsequent hovering will NOT open child menus
				// which seems aligned with the UX of most applications (e.g. notepad, wordpad, paint shop pro)
				self.focusChild(from_item);	// put focus back on my node
				self._cleanUp();			// close the submenu (be sure this is done _after_ focus is moved)
				from_item._setSelected(true); // oops, _cleanUp() deselected the item
				self.focusedChild = from_item;	// and unset focusedChild
			},
			onExecute: dojo.hitch(this, "_cleanUp")
		});

		this.currentPopup = popup;
		// detect mouseovers to handle lazy mouse movements that temporarily focus other menu items
		popup.connect(popup.domNode, "onmouseenter", dojo.hitch(self, "_onPopupHover")); // cleaned up when the popped-up widget is destroyed on close

		if(popup.focus){
			// If user is opening the popup via keyboard (right arrow, or down arrow for MenuBar),
			// if the cursor happens to collide with the popup, it will generate an onmouseover event
			// even though the mouse wasn't moved.   Use a setTimeout() to call popup.focus so that
			// our focus() call overrides the onmouseover event, rather than vice-versa.  (#8742)
			popup._focus_timer = setTimeout(dojo.hitch(popup, function(){
				this._focus_timer = null;
				this.focus();
			}), 0);
		}
	},

	_markActive: function(){
		// summary:
		//              Mark this menu's state as active.
		//		Called when this Menu gets focus from:
		//			1) clicking it (mouse or via space/arrow key)
		//			2) being opened by a parent menu.
		//		This is not called just from mouse hover.
		//		Focusing a menu via TAB does NOT automatically set isActive
		//		since TAB is a navigation operation and not a selection one.
		//		For Windows apps, pressing the ALT key focuses the menubar
		//		menus (similar to TAB navigation) but the menu is not active
		//		(ie no dropdown) until an item is clicked.
		this.isActive = true;
		dojo.replaceClass(this.domNode, "dijitMenuActive", "dijitMenuPassive");
	},

	onOpen: function(/*Event*/ e){
		// summary:
		//		Callback when this menu is opened.
		//		This is called by the popup manager as notification that the menu
		//		was opened.
		// tags:
		//		private

		this.isShowingNow = true;
		this._markActive();
	},

	_markInactive: function(){
		// summary:
		//		Mark this menu's state as inactive.
		this.isActive = false; // don't do this in _onBlur since the state is pending-close until we get here
		dojo.replaceClass(this.domNode, "dijitMenuPassive", "dijitMenuActive");
	},

	onClose: function(){
		// summary:
		//		Callback when this menu is closed.
		//		This is called by the popup manager as notification that the menu
		//		was closed.
		// tags:
		//		private

		this._stopFocusTimer();
		this._markInactive();
		this.isShowingNow = false;
		this.parentMenu = null;
	},

	_closeChild: function(){
		// summary:
		//		Called when submenu is clicked or focus is lost.  Close hierarchy of menus.
		// tags:
		//		private
		this._stopPopupTimer();

		var fromItem = this.focusedChild && this.focusedChild.from_item;

		if(this.currentPopup){
			// If focus is on my child menu then move focus to me,
			// because IE doesn't like it when you display:none a node with focus
			if(dijit._curFocus && dojo.isDescendant(dijit._curFocus, this.currentPopup.domNode)){
				this.focusedChild.focusNode.focus();
			}
			// Close all popups that are open and descendants of this menu
			dijit.popup.close(this.currentPopup);
			this.currentPopup = null;
		}

		if(this.focusedChild){ // unhighlight the focused item
			this.focusedChild._setSelected(false);
			this.focusedChild._onUnhover();
			this.focusedChild = null;
		}
	},

	_onItemFocus: function(/*MenuItem*/ item){
		// summary:
		//		Called when child of this Menu gets focus from:
		//			1) clicking it
		//			2) tabbing into it
		//			3) being opened by a parent menu.
		//		This is not called just from mouse hover.
		if(this._hoveredChild && this._hoveredChild != item){
			this._hoveredChild._onUnhover(); // any previous mouse movement is trumped by focus selection
		}
	},

	_onBlur: function(){
		// summary:
		//		Called when focus is moved away from this Menu and it's submenus.
		// tags:
		//		protected
		this._cleanUp();
		this.inherited(arguments);
	},

	_cleanUp: function(){
		// summary:
		//		Called when the user is done with this menu.  Closes hierarchy of menus.
		// tags:
		//		private

		this._closeChild(); // don't call this.onClose since that's incorrect for MenuBar's that never close
		if(typeof this.isShowingNow == 'undefined'){ // non-popup menu doesn't call onClose
			this._markInactive();
		}
	}
});

dojo.declare("dijit.Menu",
	dijit._MenuBase,
	{
	// summary
	//		A context menu you can assign to multiple elements

	// TODO: most of the code in here is just for context menu (right-click menu)
	// support.  In retrospect that should have been a separate class (dijit.ContextMenu).
	// Split them for 2.0

	constructor: function(){
		this._bindings = [];
	},

	templateString: dojo.cache("dijit", "templates/Menu.html", "<table class=\"dijit dijitMenu dijitMenuPassive dijitReset dijitMenuTable\" role=\"menu\" tabIndex=\"${tabIndex}\" dojoAttachEvent=\"onkeypress:_onKeyPress\" cellspacing=\"0\">\n\t<tbody class=\"dijitReset\" dojoAttachPoint=\"containerNode\"></tbody>\n</table>\n"),

	baseClass: "dijitMenu",

	// targetNodeIds: [const] String[]
	//		Array of dom node ids of nodes to attach to.
	//		Fill this with nodeIds upon widget creation and it becomes context menu for those nodes.
	targetNodeIds: [],

	// contextMenuForWindow: [const] Boolean
	//		If true, right clicking anywhere on the window will cause this context menu to open.
	//		If false, must specify targetNodeIds.
	contextMenuForWindow: false,

	// leftClickToOpen: [const] Boolean
	//		If true, menu will open on left click instead of right click, similiar to a file menu.
	leftClickToOpen: false,

	// refocus: Boolean
	// 		When this menu closes, re-focus the element which had focus before it was opened.
	refocus: true,

	postCreate: function(){
		if(this.contextMenuForWindow){
			this.bindDomNode(dojo.body());
		}else{
			// TODO: should have _setTargetNodeIds() method to handle initialization and a possible
			// later set('targetNodeIds', ...) call.   There's also a problem that targetNodeIds[]
			// gets stale after calls to bindDomNode()/unBindDomNode() as it still is just the original list (see #9610)
			dojo.forEach(this.targetNodeIds, this.bindDomNode, this);
		}
		var k = dojo.keys, l = this.isLeftToRight();
		this._openSubMenuKey = l ? k.RIGHT_ARROW : k.LEFT_ARROW;
		this._closeSubMenuKey = l ? k.LEFT_ARROW : k.RIGHT_ARROW;
		this.connectKeyNavHandlers([k.UP_ARROW], [k.DOWN_ARROW]);
	},

	_onKeyPress: function(/*Event*/ evt){
		// summary:
		//		Handle keyboard based menu navigation.
		// tags:
		//		protected

		if(evt.ctrlKey || evt.altKey){ return; }

		switch(evt.charOrCode){
			case this._openSubMenuKey:
				this._moveToPopup(evt);
				dojo.stopEvent(evt);
				break;
			case this._closeSubMenuKey:
				if(this.parentMenu){
					if(this.parentMenu._isMenuBar){
						this.parentMenu.focusPrev();
					}else{
						this.onCancel(false);
					}
				}else{
					dojo.stopEvent(evt);
				}
				break;
		}
	},

	// thanks burstlib!
	_iframeContentWindow: function(/* HTMLIFrameElement */iframe_el){
		// summary:
		//		Returns the window reference of the passed iframe
		// tags:
		//		private
		var win = dojo.window.get(this._iframeContentDocument(iframe_el)) ||
			// Moz. TODO: is this available when defaultView isn't?
			this._iframeContentDocument(iframe_el)['__parent__'] ||
			(iframe_el.name && dojo.doc.frames[iframe_el.name]) || null;
		return win;	//	Window
	},

	_iframeContentDocument: function(/* HTMLIFrameElement */iframe_el){
		// summary:
		//		Returns a reference to the document object inside iframe_el
		// tags:
		//		protected
		var doc = iframe_el.contentDocument // W3
			|| (iframe_el.contentWindow && iframe_el.contentWindow.document) // IE
			|| (iframe_el.name && dojo.doc.frames[iframe_el.name] && dojo.doc.frames[iframe_el.name].document)
			|| null;
		return doc;	//	HTMLDocument
	},

	bindDomNode: function(/*String|DomNode*/ node){
		// summary:
		//		Attach menu to given node
		node = dojo.byId(node);

		var cn;	// Connect node

		// Support context menus on iframes.   Rather than binding to the iframe itself we need
		// to bind to the <body> node inside the iframe.
		if(node.tagName.toLowerCase() == "iframe"){
			var iframe = node,
				win = this._iframeContentWindow(iframe);
			cn = dojo.withGlobal(win, dojo.body);
		}else{
			
			// To capture these events at the top level, attach to <html>, not <body>.
			// Otherwise right-click context menu just doesn't work.
			cn = (node == dojo.body() ? dojo.doc.documentElement : node);
		}


		// "binding" is the object to track our connection to the node (ie, the parameter to bindDomNode())
		var binding = {
			node: node,
			iframe: iframe
		};

		// Save info about binding in _bindings[], and make node itself record index(+1) into
		// _bindings[] array.   Prefix w/_dijitMenu to avoid setting an attribute that may
		// start with a number, which fails on FF/safari.
		dojo.attr(node, "_dijitMenu" + this.id, this._bindings.push(binding));

		// Setup the connections to monitor click etc., unless we are connecting to an iframe which hasn't finished
		// loading yet, in which case we need to wait for the onload event first, and then connect
		// On linux Shift-F10 produces the oncontextmenu event, but on Windows it doesn't, so
		// we need to monitor keyboard events in addition to the oncontextmenu event.
		var doConnects = dojo.hitch(this, function(cn){
			return [
				// TODO: when leftClickToOpen is true then shouldn't space/enter key trigger the menu,
				// rather than shift-F10?
				dojo.connect(cn, this.leftClickToOpen ? "onclick" : "oncontextmenu", this, function(evt){
					// Schedule context menu to be opened unless it's already been scheduled from onkeydown handler
					dojo.stopEvent(evt);
					this._scheduleOpen(evt.target, iframe, {x: evt.pageX, y: evt.pageY});
				}),
				dojo.connect(cn, "onkeydown", this, function(evt){
					if(evt.shiftKey && evt.keyCode == dojo.keys.F10){
						dojo.stopEvent(evt);
						this._scheduleOpen(evt.target, iframe);	// no coords - open near target node
					}
				})
			];
		});
		binding.connects = cn ? doConnects(cn) : [];

		if(iframe){
			// Setup handler to [re]bind to the iframe when the contents are initially loaded,
			// and every time the contents change.
			// Need to do this b/c we are actually binding to the iframe's <body> node.
			// Note: can't use dojo.connect(), see #9609.

			binding.onloadHandler = dojo.hitch(this, function(){
				// want to remove old connections, but IE throws exceptions when trying to
				// access the <body> node because it's already gone, or at least in a state of limbo

				var win = this._iframeContentWindow(iframe);
					cn = dojo.withGlobal(win, dojo.body);
				binding.connects = doConnects(cn);
			});
			if(iframe.addEventListener){
				iframe.addEventListener("load", binding.onloadHandler, false);
			}else{
				iframe.attachEvent("onload", binding.onloadHandler);
			}
		}
	},

	unBindDomNode: function(/*String|DomNode*/ nodeName){
		// summary:
		//		Detach menu from given node

		var node;
		try{
			node = dojo.byId(nodeName);
		}catch(e){
			// On IE the dojo.byId() call will get an exception if the attach point was
			// the <body> node of an <iframe> that has since been reloaded (and thus the
			// <body> node is in a limbo state of destruction.
			return;
		}

		// node["_dijitMenu" + this.id] contains index(+1) into my _bindings[] array
		var attrName = "_dijitMenu" + this.id;
		if(node && dojo.hasAttr(node, attrName)){
			var bid = dojo.attr(node, attrName)-1, b = this._bindings[bid];
			dojo.forEach(b.connects, dojo.disconnect);

			// Remove listener for iframe onload events
			var iframe = b.iframe;
			if(iframe){
				if(iframe.removeEventListener){
					iframe.removeEventListener("load", b.onloadHandler, false);
				}else{
					iframe.detachEvent("onload", b.onloadHandler);
				}
			}

			dojo.removeAttr(node, attrName);
			delete this._bindings[bid];
		}
	},

	_scheduleOpen: function(/*DomNode?*/ target, /*DomNode?*/ iframe, /*Object?*/ coords){
		// summary:
		//		Set timer to display myself.  Using a timer rather than displaying immediately solves
		//		two problems:
		//
		//		1. IE: without the delay, focus work in "open" causes the system
		//		context menu to appear in spite of stopEvent.
		//
		//		2. Avoid double-shows on linux, where shift-F10 generates an oncontextmenu event
		//		even after a dojo.stopEvent(e).  (Shift-F10 on windows doesn't generate the
		//		oncontextmenu event.)

		if(!this._openTimer){
			this._openTimer = setTimeout(dojo.hitch(this, function(){
				delete this._openTimer;
				this._openMyself({
					target: target,
					iframe: iframe,
					coords: coords
				});
			}), 1);
		}
	},

	_openMyself: function(args){
		// summary:
		//		Internal function for opening myself when the user does a right-click or something similar.
		// args:
		//		This is an Object containing:
		//		* target:
		//			The node that is being clicked
		//		* iframe:
		//			If an <iframe> is being clicked, iframe points to that iframe
		//		* coords:
		//			Put menu at specified x/y position in viewport, or if iframe is
		//			specified, then relative to iframe.
		//
		//		_openMyself() formerly took the event object, and since various code references
		//		evt.target (after connecting to _openMyself()), using an Object for parameters
		//		(so that old code still works).

		var target = args.target,
			iframe = args.iframe,
			coords = args.coords;

		// Get coordinates to open menu, either at specified (mouse) position or (if triggered via keyboard)
		// then near the node the menu is assigned to.
		if(coords){
			if(iframe){
				// Specified coordinates are on <body> node of an <iframe>, convert to match main document
				var od = target.ownerDocument,
					ifc = dojo.position(iframe, true),
					win = this._iframeContentWindow(iframe),
					scroll = dojo.withGlobal(win, "_docScroll", dojo);
	
				var cs = dojo.getComputedStyle(iframe),
					tp = dojo._toPixelValue,
					left = (dojo.isIE && dojo.isQuirks ? 0 : tp(iframe, cs.paddingLeft)) + (dojo.isIE && dojo.isQuirks ? tp(iframe, cs.borderLeftWidth) : 0),
					top = (dojo.isIE && dojo.isQuirks ? 0 : tp(iframe, cs.paddingTop)) + (dojo.isIE && dojo.isQuirks ? tp(iframe, cs.borderTopWidth) : 0);

				coords.x += ifc.x + left - scroll.x;
				coords.y += ifc.y + top - scroll.y;
			}
		}else{
			coords = dojo.position(target, true);
			coords.x += 10;
			coords.y += 10;
		}

		var self=this;
		var savedFocus = dijit.getFocus(this);
		function closeAndRestoreFocus(){
			// user has clicked on a menu or popup
			if(self.refocus){
				dijit.focus(savedFocus);
			}
			dijit.popup.close(self);
		}
		dijit.popup.open({
			popup: this,
			x: coords.x,
			y: coords.y,
			onExecute: closeAndRestoreFocus,
			onCancel: closeAndRestoreFocus,
			orient: this.isLeftToRight() ? 'L' : 'R'
		});
		this.focus();

		this._onBlur = function(){
			this.inherited('_onBlur', arguments);
			// Usually the parent closes the child widget but if this is a context
			// menu then there is no parent
			dijit.popup.close(this);
			// don't try to restore focus; user has clicked another part of the screen
			// and set focus there
		};
	},

	uninitialize: function(){
 		dojo.forEach(this._bindings, function(b){ if(b){ this.unBindDomNode(b.node); } }, this);
 		this.inherited(arguments);
	}
}
);

}

if(!dojo._hasResource["dojox.html.metrics"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojox.html.metrics"] = true;
dojo.provide("dojox.html.metrics");

(function(){
	var dhm = dojox.html.metrics;

	//	derived from Morris John's emResized measurer
	dhm.getFontMeasurements = function(){
		//	summary
		//	Returns an object that has pixel equivilents of standard font size values.
		var heights = {
			'1em':0, '1ex':0, '100%':0, '12pt':0, '16px':0, 'xx-small':0, 'x-small':0,
			'small':0, 'medium':0, 'large':0, 'x-large':0, 'xx-large':0
		};
	
		if(dojo.isIE){
			//	we do a font-size fix if and only if one isn't applied already.
			//	NOTE: If someone set the fontSize on the HTML Element, this will kill it.
			dojo.doc.documentElement.style.fontSize="100%";
		}
	
		//	set up the measuring node.
		var div=dojo.doc.createElement("div");
		var ds = div.style;
		ds.position="absolute";
		ds.left="-100px";
		ds.top="0";
		ds.width="30px";
		ds.height="1000em";
		ds.borderWidth="0";
		ds.margin="0";
		ds.padding="0";
		ds.outline="0";
		ds.lineHeight="1";
		ds.overflow="hidden";
		dojo.body().appendChild(div);
	
		//	do the measurements.
		for(var p in heights){
			ds.fontSize = p;
			heights[p] = Math.round(div.offsetHeight * 12/16) * 16/12 / 1000;
		}
		
		dojo.body().removeChild(div);
		div = null;
		return heights; 	//	object
	};

	var fontMeasurements = null;
	
	dhm.getCachedFontMeasurements = function(recalculate){
		if(recalculate || !fontMeasurements){
			fontMeasurements = dhm.getFontMeasurements();
		}
		return fontMeasurements;
	};

	var measuringNode = null, empty = {};
	dhm.getTextBox = function(/* String */ text, /* Object */ style, /* String? */ className){
		var m, s;
		if(!measuringNode){
			m = measuringNode = dojo.doc.createElement("div");
			// Container that we can set contraints on so that it doesn't
			// trigger a scrollbar.
			var c = dojo.doc.createElement("div");
			c.appendChild(m);
			s = c.style;
			s.overflow='scroll';
			s.position = "absolute";
			s.left = "0px";
			s.top = "-10000px";
			s.width = "1px";
			s.height = "1px";
			s.visibility = "hidden";
			s.borderWidth = "0";
			s.margin = "0";
			s.padding = "0";
			s.outline = "0";
			dojo.body().appendChild(c);
		}else{
			m = measuringNode;
		}
		// reset styles
		m.className = "";
		s = m.style;
		s.borderWidth = "0";
		s.margin = "0";
		s.padding = "0";
		s.outline = "0";
		// set new style
		if(arguments.length > 1 && style){
			for(var i in style){
				if(i in empty){ continue; }
				s[i] = style[i];
			}
		}
		// set classes
		if(arguments.length > 2 && className){
			m.className = className;
		}
		// take a measure
		m.innerHTML = text;
		var box = dojo.position(m);
		// position doesn't report right (reports 1, since parent is 1)
		// So we have to look at the scrollWidth to get the real width
		// Height is right.
		box.w = m.parentNode.scrollWidth;
		return box;
	};

	//	determine the scrollbar sizes on load.
	var scroll={ w:16, h:16 };
	dhm.getScrollbar=function(){ return { w:scroll.w, h:scroll.h }; };

	dhm._fontResizeNode = null;

	dhm.initOnFontResize = function(interval){
		var f = dhm._fontResizeNode = dojo.doc.createElement("iframe");
		var fs = f.style;
		fs.position = "absolute";
		fs.width = "5em";
		fs.height = "10em";
		fs.top = "-10000px";
		if(dojo.isIE){
			f.onreadystatechange = function(){
				if(f.contentWindow.document.readyState == "complete"){
					f.onresize = f.contentWindow.parent[dojox._scopeName].html.metrics._fontresize;
				}
			};
		}else{
			f.onload = function(){
				f.contentWindow.onresize = f.contentWindow.parent[dojox._scopeName].html.metrics._fontresize;
			};
		}
		//The script tag is to work around a known firebug race condition.  See comments in bug #9046
		f.setAttribute("src", "javascript:'<html><head><script>if(\"loadFirebugConsole\" in window){window.loadFirebugConsole();}</script></head><body></body></html>'");
		dojo.body().appendChild(f);
		dhm.initOnFontResize = function(){};
	};

	dhm.onFontResize = function(){};
	dhm._fontresize = function(){
		dhm.onFontResize();
	}

	dojo.addOnUnload(function(){
		// destroy our font resize iframe if we have one
		var f = dhm._fontResizeNode;
		if(f){
			if(dojo.isIE && f.onresize){
				f.onresize = null;
			}else if(f.contentWindow && f.contentWindow.onresize){
				f.contentWindow.onresize = null;
			}
			dhm._fontResizeNode = null;
		}
	});

	dojo.addOnLoad(function(){
		// getScrollbar metrics node
		try{
			var n=dojo.doc.createElement("div");
			n.style.cssText = "top:0;left:0;width:100px;height:100px;overflow:scroll;position:absolute;visibility:hidden;";
			dojo.body().appendChild(n);
			scroll.w = n.offsetWidth - n.clientWidth;
			scroll.h = n.offsetHeight - n.clientHeight;
			dojo.body().removeChild(n);
			//console.log("Scroll bar dimensions: ", scroll);
			delete n;
		}catch(e){}

		// text size poll setup
		if("fontSizeWatch" in dojo.config && !!dojo.config.fontSizeWatch){
			dhm.initOnFontResize();
		}
	});
})();

}

if(!dojo._hasResource["dojox.grid.util"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojox.grid.util"] = true;
dojo.provide("dojox.grid.util");

// summary: grid utility library
(function(){
	var dgu = dojox.grid.util;

	dgu.na = '...';
	dgu.rowIndexTag = "gridRowIndex";
	dgu.gridViewTag = "gridView";


	dgu.fire = function(ob, ev, args){
		var fn = ob && ev && ob[ev];
		return fn && (args ? fn.apply(ob, args) : ob[ev]());
	};
	
	dgu.setStyleHeightPx = function(inElement, inHeight){
		if(inHeight >= 0){
			var s = inElement.style;
			var v = inHeight + 'px';
			if(inElement && s['height'] != v){
				s['height'] = v;
			}
		}
	};
	
	dgu.mouseEvents = [ 'mouseover', 'mouseout', /*'mousemove',*/ 'mousedown', 'mouseup', 'click', 'dblclick', 'contextmenu' ];

	dgu.keyEvents = [ 'keyup', 'keydown', 'keypress' ];

	dgu.funnelEvents = function(inNode, inObject, inMethod, inEvents){
		var evts = (inEvents ? inEvents : dgu.mouseEvents.concat(dgu.keyEvents));
		for (var i=0, l=evts.length; i<l; i++){
			inObject.connect(inNode, 'on' + evts[i], inMethod);
		}
	};

	dgu.removeNode = function(inNode){
		inNode = dojo.byId(inNode);
		inNode && inNode.parentNode && inNode.parentNode.removeChild(inNode);
		return inNode;
	};
	
	dgu.arrayCompare = function(inA, inB){
		for(var i=0,l=inA.length; i<l; i++){
			if(inA[i] != inB[i]){return false;}
		}
		return (inA.length == inB.length);
	};
	
	dgu.arrayInsert = function(inArray, inIndex, inValue){
		if(inArray.length <= inIndex){
			inArray[inIndex] = inValue;
		}else{
			inArray.splice(inIndex, 0, inValue);
		}
	};
	
	dgu.arrayRemove = function(inArray, inIndex){
		inArray.splice(inIndex, 1);
	};
	
	dgu.arraySwap = function(inArray, inI, inJ){
		var cache = inArray[inI];
		inArray[inI] = inArray[inJ];
		inArray[inJ] = cache;
	};
})();

}

if(!dojo._hasResource["dojox.grid._Scroller"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojox.grid._Scroller"] = true;
dojo.provide("dojox.grid._Scroller");

(function(){
	var indexInParent = function(inNode){
		var i=0, n, p=inNode.parentNode;
		while((n = p.childNodes[i++])){
			if(n == inNode){
				return i - 1;
			}
		}
		return -1;
	};
	
	var cleanNode = function(inNode){
		if(!inNode){
			return;
		}
		var filter = function(inW){
			return inW.domNode && dojo.isDescendant(inW.domNode, inNode, true);
		};
		var ws = dijit.registry.filter(filter);
		for(var i=0, w; (w=ws[i]); i++){
			w.destroy();
		}
		delete ws;
	};

	var getTagName = function(inNodeOrId){
		var node = dojo.byId(inNodeOrId);
		return (node && node.tagName ? node.tagName.toLowerCase() : '');
	};
	
	var nodeKids = function(inNode, inTag){
		var result = [];
		var i=0, n;
		while((n = inNode.childNodes[i])){
			i++;
			if(getTagName(n) == inTag){
				result.push(n);
			}
		}
		return result;
	};
	
	var divkids = function(inNode){
		return nodeKids(inNode, 'div');
	};

	dojo.declare("dojox.grid._Scroller", null, {
		constructor: function(inContentNodes){
			this.setContentNodes(inContentNodes);
			this.pageHeights = [];
			this.pageNodes = [];
			this.stack = [];
		},
		// specified
		rowCount: 0, // total number of rows to manage
		defaultRowHeight: 32, // default height of a row
		keepRows: 100, // maximum number of rows that should exist at one time
		contentNode: null, // node to contain pages
		scrollboxNode: null, // node that controls scrolling
		// calculated
		defaultPageHeight: 0, // default height of a page
		keepPages: 10, // maximum number of pages that should exists at one time
		pageCount: 0,
		windowHeight: 0,
		firstVisibleRow: 0,
		lastVisibleRow: 0,
		averageRowHeight: 0, // the average height of a row
		// private
		page: 0,
		pageTop: 0,
		// init
		init: function(inRowCount, inKeepRows, inRowsPerPage){
			switch(arguments.length){
				case 3: this.rowsPerPage = inRowsPerPage;
				case 2: this.keepRows = inKeepRows;
				case 1: this.rowCount = inRowCount;
				default: break;
			}
			this.defaultPageHeight = this.defaultRowHeight * this.rowsPerPage;
			this.pageCount = this._getPageCount(this.rowCount, this.rowsPerPage);
			this.setKeepInfo(this.keepRows);
			this.invalidate();
			if(this.scrollboxNode){
				this.scrollboxNode.scrollTop = 0;
				this.scroll(0);
				this.scrollboxNode.onscroll = dojo.hitch(this, 'onscroll');
			}
		},
		_getPageCount: function(rowCount, rowsPerPage){
			return rowCount ? (Math.ceil(rowCount / rowsPerPage) || 1) : 0;
		},
		destroy: function(){
			this.invalidateNodes();
			delete this.contentNodes;
			delete this.contentNode;
			delete this.scrollboxNode;
		},
		setKeepInfo: function(inKeepRows){
			this.keepRows = inKeepRows;
			this.keepPages = !this.keepRows ? this.keepPages : Math.max(Math.ceil(this.keepRows / this.rowsPerPage), 2);
		},
		// nodes
		setContentNodes: function(inNodes){
			this.contentNodes = inNodes;
			this.colCount = (this.contentNodes ? this.contentNodes.length : 0);
			this.pageNodes = [];
			for(var i=0; i<this.colCount; i++){
				this.pageNodes[i] = [];
			}
		},
		getDefaultNodes: function(){
			return this.pageNodes[0] || [];
		},
		// updating
		invalidate: function(){
			this._invalidating = true;
			this.invalidateNodes();
			this.pageHeights = [];
			this.height = (this.pageCount ? (this.pageCount - 1)* this.defaultPageHeight + this.calcLastPageHeight() : 0);
			this.resize();
			this._invalidating = false;
		},
		updateRowCount: function(inRowCount){
			this.invalidateNodes();
			this.rowCount = inRowCount;
			// update page count, adjust document height
			var oldPageCount = this.pageCount;
			if(oldPageCount === 0){
				//We want to have at least 1px in height to keep scroller.  Otherwise with an
				//empty grid you can't scroll to see the header.
				this.height = 1;
			}
			this.pageCount = this._getPageCount(this.rowCount, this.rowsPerPage);
			if(this.pageCount < oldPageCount){
				for(var i=oldPageCount-1; i>=this.pageCount; i--){
					this.height -= this.getPageHeight(i);
					delete this.pageHeights[i];
				}
			}else if(this.pageCount > oldPageCount){
				this.height += this.defaultPageHeight * (this.pageCount - oldPageCount - 1) + this.calcLastPageHeight();
			}
			this.resize();
		},
		// implementation for page manager
		pageExists: function(inPageIndex){
			return Boolean(this.getDefaultPageNode(inPageIndex));
		},
		measurePage: function(inPageIndex){
			if(this.grid.rowHeight){
				var height = this.grid.rowHeight + 1;
				return ((inPageIndex + 1) * this.rowsPerPage > this.rowCount ?
					this.rowCount - inPageIndex * this.rowsPerPage :
					this.rowsPerPage) * height;
					 
			}
			var n = this.getDefaultPageNode(inPageIndex);
			return (n && n.innerHTML) ? n.offsetHeight : undefined;
		},
		positionPage: function(inPageIndex, inPos){
			for(var i=0; i<this.colCount; i++){
				this.pageNodes[i][inPageIndex].style.top = inPos + 'px';
			}
		},
		repositionPages: function(inPageIndex){
			var nodes = this.getDefaultNodes();
			var last = 0;

			for(var i=0; i<this.stack.length; i++){
				last = Math.max(this.stack[i], last);
			}
			//
			var n = nodes[inPageIndex];
			var y = (n ? this.getPageNodePosition(n) + this.getPageHeight(inPageIndex) : 0);
			for(var p=inPageIndex+1; p<=last; p++){
				n = nodes[p];
				if(n){
					if(this.getPageNodePosition(n) == y){
						return;
					}
					this.positionPage(p, y);
				}
				y += this.getPageHeight(p);
			}
		},
		installPage: function(inPageIndex){
			for(var i=0; i<this.colCount; i++){
				this.contentNodes[i].appendChild(this.pageNodes[i][inPageIndex]);
			}
		},
		preparePage: function(inPageIndex, inReuseNode){
			var p = (inReuseNode ? this.popPage() : null);
			for(var i=0; i<this.colCount; i++){
				var nodes = this.pageNodes[i];
				var new_p = (p === null ? this.createPageNode() : this.invalidatePageNode(p, nodes));
				new_p.pageIndex = inPageIndex;
				nodes[inPageIndex] = new_p;
			}
		},
		// rendering implementation
		renderPage: function(inPageIndex){
			var nodes = [];
			var i, j;
			for(i=0; i<this.colCount; i++){
				nodes[i] = this.pageNodes[i][inPageIndex];
			}
			for(i=0, j=inPageIndex*this.rowsPerPage; (i<this.rowsPerPage)&&(j<this.rowCount); i++, j++){
				this.renderRow(j, nodes);
			}
		},
		removePage: function(inPageIndex){
			for(var i=0, j=inPageIndex*this.rowsPerPage; i<this.rowsPerPage; i++, j++){
				this.removeRow(j);
			}
		},
		destroyPage: function(inPageIndex){
			for(var i=0; i<this.colCount; i++){
				var n = this.invalidatePageNode(inPageIndex, this.pageNodes[i]);
				if(n){
					dojo.destroy(n);
				}
			}
		},
		pacify: function(inShouldPacify){
		},
		// pacification
		pacifying: false,
		pacifyTicks: 200,
		setPacifying: function(inPacifying){
			if(this.pacifying != inPacifying){
				this.pacifying = inPacifying;
				this.pacify(this.pacifying);
			}
		},
		startPacify: function(){
			this.startPacifyTicks = new Date().getTime();
		},
		doPacify: function(){
			var result = (new Date().getTime() - this.startPacifyTicks) > this.pacifyTicks;
			this.setPacifying(true);
			this.startPacify();
			return result;
		},
		endPacify: function(){
			this.setPacifying(false);
		},
		// default sizing implementation
		resize: function(){
			if(this.scrollboxNode){
				this.windowHeight = this.scrollboxNode.clientHeight;
			}
			for(var i=0; i<this.colCount; i++){
				//We want to have 1px in height min to keep scroller.  Otherwise can't scroll
				//and see header in empty grid.
				dojox.grid.util.setStyleHeightPx(this.contentNodes[i], Math.max(1,this.height));
			}
			
			// Calculate the average row height and update the defaults (row and page).
			var needPage = (!this._invalidating);
			if(!needPage){
				var ah = this.grid.get("autoHeight");
				if(typeof ah == "number" && ah <= Math.min(this.rowsPerPage, this.rowCount)){
					needPage = true;
				}
			}
			if(needPage){
				this.needPage(this.page, this.pageTop);
			}
			var rowsOnPage = (this.page < this.pageCount - 1) ? this.rowsPerPage : ((this.rowCount % this.rowsPerPage) || this.rowsPerPage);
			var pageHeight = this.getPageHeight(this.page);
			this.averageRowHeight = (pageHeight > 0 && rowsOnPage > 0) ? (pageHeight / rowsOnPage) : 0;
		},
		calcLastPageHeight: function(){
			if(!this.pageCount){
				return 0;
			}
			var lastPage = this.pageCount - 1;
			var lastPageHeight = ((this.rowCount % this.rowsPerPage)||(this.rowsPerPage)) * this.defaultRowHeight;
			this.pageHeights[lastPage] = lastPageHeight;
			return lastPageHeight;
		},
		updateContentHeight: function(inDh){
			this.height += inDh;
			this.resize();
		},
		updatePageHeight: function(inPageIndex, fromBuild, fromAsynRendering){
			if(this.pageExists(inPageIndex)){
				var oh = this.getPageHeight(inPageIndex);
				var h = (this.measurePage(inPageIndex));
				if(h === undefined){
					h = oh;
				}
				this.pageHeights[inPageIndex] = h;
				if(oh != h){
					this.updateContentHeight(h - oh);
					var ah = this.grid.get("autoHeight");
					if((typeof ah == "number" && ah > this.rowCount)||(ah === true && !fromBuild)){
						if(!fromAsynRendering){
							this.grid.sizeChange();
						}else{//fix #11101 by using fromAsynRendering to avoid deadlock
							var ns = this.grid.viewsNode.style;
							ns.height = parseInt(ns.height) + h - oh + 'px';
							this.repositionPages(inPageIndex);
						}
					}else{
						this.repositionPages(inPageIndex);
					}
				}
				return h;
			}
			return 0;
		},
		rowHeightChanged: function(inRowIndex, fromAsynRendering){
			this.updatePageHeight(Math.floor(inRowIndex / this.rowsPerPage), false, fromAsynRendering);
		},
		// scroller core
		invalidateNodes: function(){
			while(this.stack.length){
				this.destroyPage(this.popPage());
			}
		},
		createPageNode: function(){
			var p = document.createElement('div');
			dojo.attr(p,"role","presentation");
			p.style.position = 'absolute';
			//p.style.width = '100%';
			p.style[dojo._isBodyLtr() ? "left" : "right"] = '0';
			return p;
		},
		getPageHeight: function(inPageIndex){
			var ph = this.pageHeights[inPageIndex];
			return (ph !== undefined ? ph : this.defaultPageHeight);
		},
		// FIXME: this is not a stack, it's a FIFO list
		pushPage: function(inPageIndex){
			return this.stack.push(inPageIndex);
		},
		popPage: function(){
			return this.stack.shift();
		},
		findPage: function(inTop){
			var i = 0, h = 0;
			for(var ph = 0; i<this.pageCount; i++, h += ph){
				ph = this.getPageHeight(i);
				if(h + ph >= inTop){
					break;
				}
			}
			this.page = i;
			this.pageTop = h;
		},
		buildPage: function(inPageIndex, inReuseNode, inPos){
			this.preparePage(inPageIndex, inReuseNode);
			this.positionPage(inPageIndex, inPos);
			// order of operations is key below
			this.installPage(inPageIndex);
			this.renderPage(inPageIndex);
			// order of operations is key above
			this.pushPage(inPageIndex);
		},
		needPage: function(inPageIndex, inPos){
			var h = this.getPageHeight(inPageIndex), oh = h;
			if(!this.pageExists(inPageIndex)){
				this.buildPage(inPageIndex, (!this.grid._autoHeight/*fix #10543*/ && this.keepPages&&(this.stack.length >= this.keepPages)), inPos);
				h = this.updatePageHeight(inPageIndex, true);
			}else{
				this.positionPage(inPageIndex, inPos);
			}
			return h;
		},
		onscroll: function(){
			this.scroll(this.scrollboxNode.scrollTop);
		},
		scroll: function(inTop){
			this.grid.scrollTop = inTop;
			if(this.colCount){
				this.startPacify();
				this.findPage(inTop);
				var h = this.height;
				var b = this.getScrollBottom(inTop);
				for(var p=this.page, y=this.pageTop; (p<this.pageCount)&&((b<0)||(y<b)); p++){
					y += this.needPage(p, y);
				}
				this.firstVisibleRow = this.getFirstVisibleRow(this.page, this.pageTop, inTop);
				this.lastVisibleRow = this.getLastVisibleRow(p - 1, y, b);
				// indicates some page size has been updated
				if(h != this.height){
					this.repositionPages(p-1);
				}
				this.endPacify();
			}
		},
		getScrollBottom: function(inTop){
			return (this.windowHeight >= 0 ? inTop + this.windowHeight : -1);
		},
		// events
		processNodeEvent: function(e, inNode){
			var t = e.target;
			while(t && (t != inNode) && t.parentNode && (t.parentNode.parentNode != inNode)){
				t = t.parentNode;
			}
			if(!t || !t.parentNode || (t.parentNode.parentNode != inNode)){
				return false;
			}
			var page = t.parentNode;
			e.topRowIndex = page.pageIndex * this.rowsPerPage;
			e.rowIndex = e.topRowIndex + indexInParent(t);
			e.rowTarget = t;
			return true;
		},
		processEvent: function(e){
			return this.processNodeEvent(e, this.contentNode);
		},
		// virtual rendering interface
		renderRow: function(inRowIndex, inPageNode){
		},
		removeRow: function(inRowIndex){
		},
		// page node operations
		getDefaultPageNode: function(inPageIndex){
			return this.getDefaultNodes()[inPageIndex];
		},
		positionPageNode: function(inNode, inPos){
		},
		getPageNodePosition: function(inNode){
			return inNode.offsetTop;
		},
		invalidatePageNode: function(inPageIndex, inNodes){
			var p = inNodes[inPageIndex];
			if(p){
				delete inNodes[inPageIndex];
				this.removePage(inPageIndex, p);
				cleanNode(p);
				p.innerHTML = '';
			}
			return p;
		},
		// scroll control
		getPageRow: function(inPage){
			return inPage * this.rowsPerPage;
		},
		getLastPageRow: function(inPage){
			return Math.min(this.rowCount, this.getPageRow(inPage + 1)) - 1;
		},
		getFirstVisibleRow: function(inPage, inPageTop, inScrollTop){
			if(!this.pageExists(inPage)){
				return 0;
			}
			var row = this.getPageRow(inPage);
			var nodes = this.getDefaultNodes();
			var rows = divkids(nodes[inPage]);
			for(var i=0,l=rows.length; i<l && inPageTop<inScrollTop; i++, row++){
				inPageTop += rows[i].offsetHeight;
			}
			return (row ? row - 1 : row);
		},
		getLastVisibleRow: function(inPage, inBottom, inScrollBottom){
			if(!this.pageExists(inPage)){
				return 0;
			}
			var nodes = this.getDefaultNodes();
			var row = this.getLastPageRow(inPage);
			var rows = divkids(nodes[inPage]);
			for(var i=rows.length-1; i>=0 && inBottom>inScrollBottom; i--, row--){
				inBottom -= rows[i].offsetHeight;
			}
			return row + 1;
		},
		findTopRow: function(inScrollTop){
			var nodes = this.getDefaultNodes();
			var rows = divkids(nodes[this.page]);
			for(var i=0,l=rows.length,t=this.pageTop,h; i<l; i++){
				h = rows[i].offsetHeight;
				t += h;
				if(t >= inScrollTop){
					this.offset = h - (t - inScrollTop);
					return i + this.page * this.rowsPerPage;
				}
			}
			return -1;
		},
		findScrollTop: function(inRow){
			var rowPage = Math.floor(inRow / this.rowsPerPage);
			var t = 0;
			var i, l;
			for(i=0; i<rowPage; i++){
				t += this.getPageHeight(i);
			}
			this.pageTop = t;
			this.page = rowPage;//fix #10543
			this.needPage(rowPage, this.pageTop);

			var nodes = this.getDefaultNodes();
			var rows = divkids(nodes[rowPage]);
			var r = inRow - this.rowsPerPage * rowPage;
			for(i=0,l=rows.length; i<l && i<r; i++){
				t += rows[i].offsetHeight;
			}
			return t;
		},
		dummy: 0
	});
})();

}

if(!dojo._hasResource["dojox.grid.cells._base"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojox.grid.cells._base"] = true;
dojo.provide("dojox.grid.cells._base");




dojo.declare("dojox.grid._DeferredTextWidget", dijit._Widget, {
	deferred: null,
	_destroyOnRemove: true,
	postCreate: function(){
		if(this.deferred){
			this.deferred.addBoth(dojo.hitch(this, function(text){
				if(this.domNode){
					this.domNode.innerHTML = text;
				}
			}));
		}
	}
});

(function(){
	var focusSelectNode = function(inNode){
		try{
			dojox.grid.util.fire(inNode, "focus");
			dojox.grid.util.fire(inNode, "select");
		}catch(e){// IE sux bad
		}
	};
	
	var whenIdle = function(/*inContext, inMethod, args ...*/){
		setTimeout(dojo.hitch.apply(dojo, arguments), 0);
	};

	var dgc = dojox.grid.cells;

	dojo.declare("dojox.grid.cells._Base", null, {
		// summary:
		//	Respresents a grid cell and contains information about column options and methods
		//	for retrieving cell related information.
		//	Each column in a grid layout has a cell object and most events and many methods
		//	provide access to these objects.
		styles: '',
		classes: '',
		editable: false,
		alwaysEditing: false,
		formatter: null,
		defaultValue: '...',
		value: null,
		hidden: false,
		noresize: false,
		draggable: true,
		//private
		_valueProp: "value",
		_formatPending: false,

		constructor: function(inProps){
			this._props = inProps || {};
			dojo.mixin(this, inProps);
			if(this.draggable === undefined){
				this.draggable = true;
			}
		},

		_defaultFormat: function(inValue, callArgs){
			var s = this.grid.formatterScope || this;
			var f = this.formatter;
			if(f && s && typeof f == "string"){
				f = this.formatter = s[f];
			}
			var v = (inValue != this.defaultValue && f) ? f.apply(s, callArgs) : inValue;
			if(typeof v == "undefined"){
				return this.defaultValue;
			}
			if(v && v.addBoth){
				// Check if it's a deferred
				v = new dojox.grid._DeferredTextWidget({deferred: v},
									dojo.create("span", {innerHTML: this.defaultValue}));
			}
			if(v && v.declaredClass && v.startup){
				return "<div class='dojoxGridStubNode' linkWidget='" +
						v.id +
						"' cellIdx='" +
						this.index +
						"'>" +
						this.defaultValue +
						"</div>";
			}
			return v;
		},
		
		// data source
		format: function(inRowIndex, inItem){
			// summary:
			//	provides the html for a given grid cell.
			// inRowIndex: int
			// grid row index
			// returns: html for a given grid cell
			var f, i=this.grid.edit.info, d=this.get ? this.get(inRowIndex, inItem) : (this.value || this.defaultValue);
			d = (d && d.replace && this.grid.escapeHTMLInData) ? d.replace(/&/g, '&amp;').replace(/</g, '&lt;') : d;
			if(this.editable && (this.alwaysEditing || (i.rowIndex==inRowIndex && i.cell==this))){
				return this.formatEditing(d, inRowIndex);
			}else{
				return this._defaultFormat(d, [d, inRowIndex, this]);
			}
		},
		formatEditing: function(inDatum, inRowIndex){
			// summary:
			//	formats the cell for editing
			// inDatum: anything
			//	cell data to edit
			// inRowIndex: int
			//	grid row index
			// returns: string of html to place in grid cell
		},
		// utility
		getNode: function(inRowIndex){
			// summary:
			//	gets the dom node for a given grid cell.
			// inRowIndex: int
			// grid row index
			// returns: dom node for a given grid cell
			return this.view.getCellNode(inRowIndex, this.index);
		},
		getHeaderNode: function(){
			return this.view.getHeaderCellNode(this.index);
		},
		getEditNode: function(inRowIndex){
			return (this.getNode(inRowIndex) || 0).firstChild || 0;
		},
		canResize: function(){
			var uw = this.unitWidth;
			return uw && (uw!=='auto');
		},
		isFlex: function(){
			var uw = this.unitWidth;
			return uw && dojo.isString(uw) && (uw=='auto' || uw.slice(-1)=='%');
		},
		// edit support
		applyEdit: function(inValue, inRowIndex){
			this.grid.edit.applyCellEdit(inValue, this, inRowIndex);
		},
		cancelEdit: function(inRowIndex){
			this.grid.doCancelEdit(inRowIndex);
		},
		_onEditBlur: function(inRowIndex){
			if(this.grid.edit.isEditCell(inRowIndex, this.index)){
				//console.log('editor onblur', e);
				this.grid.edit.apply();
			}
		},
		registerOnBlur: function(inNode, inRowIndex){
			if(this.commitOnBlur){
				dojo.connect(inNode, "onblur", function(e){
					// hack: if editor still thinks this editor is current some ms after it blurs, assume we've focused away from grid
					setTimeout(dojo.hitch(this, "_onEditBlur", inRowIndex), 250);
				});
			}
		},
		//protected
		needFormatNode: function(inDatum, inRowIndex){
			this._formatPending = true;
			whenIdle(this, "_formatNode", inDatum, inRowIndex);
		},
		cancelFormatNode: function(){
			this._formatPending = false;
		},
		//private
		_formatNode: function(inDatum, inRowIndex){
			if(this._formatPending){
				this._formatPending = false;
				// make cell selectable
				dojo.setSelectable(this.grid.domNode, true);
				this.formatNode(this.getEditNode(inRowIndex), inDatum, inRowIndex);
			}
		},
		//protected
		formatNode: function(inNode, inDatum, inRowIndex){
			// summary:
			//	format the editing dom node. Use when editor is a widget.
			// inNode: dom node
			// dom node for the editor
			// inDatum: anything
			//	cell data to edit
			// inRowIndex: int
			//	grid row index
			if(dojo.isIE){
				// IE sux bad
				whenIdle(this, "focus", inRowIndex, inNode);
			}else{
				this.focus(inRowIndex, inNode);
			}
		},
		dispatchEvent: function(m, e){
			if(m in this){
				return this[m](e);
			}
		},
		//public
		getValue: function(inRowIndex){
			// summary:
			//	returns value entered into editor
			// inRowIndex: int
			// grid row index
			// returns:
			//	value of editor
			return this.getEditNode(inRowIndex)[this._valueProp];
		},
		setValue: function(inRowIndex, inValue){
			// summary:
			//	set the value of the grid editor
			// inRowIndex: int
			// grid row index
			// inValue: anything
			//	value of editor
			var n = this.getEditNode(inRowIndex);
			if(n){
				n[this._valueProp] = inValue;
			}
		},
		focus: function(inRowIndex, inNode){
			// summary:
			//	focus the grid editor
			// inRowIndex: int
			// grid row index
			// inNode: dom node
			//	editor node
			focusSelectNode(inNode || this.getEditNode(inRowIndex));
		},
		save: function(inRowIndex){
			// summary:
			//	save editor state
			// inRowIndex: int
			// grid row index
			this.value = this.value || this.getValue(inRowIndex);
			//console.log("save", this.value, inCell.index, inRowIndex);
		},
		restore: function(inRowIndex){
			// summary:
			//	restore editor state
			// inRowIndex: int
			// grid row index
			this.setValue(inRowIndex, this.value);
			//console.log("restore", this.value, inCell.index, inRowIndex);
		},
		//protected
		_finish: function(inRowIndex){
			// summary:
			//	called when editing is completed to clean up editor
			// inRowIndex: int
			// grid row index
			dojo.setSelectable(this.grid.domNode, false);
			this.cancelFormatNode();
		},
		//public
		apply: function(inRowIndex){
			// summary:
			//	apply edit from cell editor
			// inRowIndex: int
			// grid row index
			this.applyEdit(this.getValue(inRowIndex), inRowIndex);
			this._finish(inRowIndex);
		},
		cancel: function(inRowIndex){
			// summary:
			//	cancel cell edit
			// inRowIndex: int
			// grid row index
			this.cancelEdit(inRowIndex);
			this._finish(inRowIndex);
		}
	});
	dgc._Base.markupFactory = function(node, cellDef){
		var d = dojo;
		var formatter = d.trim(d.attr(node, "formatter")||"");
		if(formatter){
			cellDef.formatter = dojo.getObject(formatter)||formatter;
		}
		var get = d.trim(d.attr(node, "get")||"");
		if(get){
			cellDef.get = dojo.getObject(get);
		}
		var getBoolAttr = function(attr, cell, cellAttr){
			var value = d.trim(d.attr(node, attr)||"");
			if(value){ cell[cellAttr||attr] = !(value.toLowerCase()=="false"); }
		};
		getBoolAttr("sortDesc", cellDef);
		getBoolAttr("editable", cellDef);
		getBoolAttr("alwaysEditing", cellDef);
		getBoolAttr("noresize", cellDef);
		getBoolAttr("draggable", cellDef);

		var value = d.trim(d.attr(node, "loadingText")||d.attr(node, "defaultValue")||"");
		if(value){
			cellDef.defaultValue = value;
		}

		var getStrAttr = function(attr, cell, cellAttr){
			var value = d.trim(d.attr(node, attr)||"")||undefined;
			if(value){ cell[cellAttr||attr] = value; }
		};
		getStrAttr("styles", cellDef);
		getStrAttr("headerStyles", cellDef);
		getStrAttr("cellStyles", cellDef);
		getStrAttr("classes", cellDef);
		getStrAttr("headerClasses", cellDef);
		getStrAttr("cellClasses", cellDef);
	};

	dojo.declare("dojox.grid.cells.Cell", dgc._Base, {
		// summary
		// grid cell that provides a standard text input box upon editing
		constructor: function(){
			this.keyFilter = this.keyFilter;
		},
		// keyFilter: RegExp
		//		optional regex for disallowing keypresses
		keyFilter: null,
		formatEditing: function(inDatum, inRowIndex){
			this.needFormatNode(inDatum, inRowIndex);
			return '<input class="dojoxGridInput" type="text" value="' + inDatum + '">';
		},
		formatNode: function(inNode, inDatum, inRowIndex){
			this.inherited(arguments);
			// FIXME: feels too specific for this interface
			this.registerOnBlur(inNode, inRowIndex);
		},
		doKey: function(e){
			if(this.keyFilter){
				var key = String.fromCharCode(e.charCode);
				if(key.search(this.keyFilter) == -1){
					dojo.stopEvent(e);
				}
			}
		},
		_finish: function(inRowIndex){
			this.inherited(arguments);
			var n = this.getEditNode(inRowIndex);
			try{
				dojox.grid.util.fire(n, "blur");
			}catch(e){}
		}
	});
	dgc.Cell.markupFactory = function(node, cellDef){
		dgc._Base.markupFactory(node, cellDef);
		var d = dojo;
		var keyFilter = d.trim(d.attr(node, "keyFilter")||"");
		if(keyFilter){
			cellDef.keyFilter = new RegExp(keyFilter);
		}
	};

	dojo.declare("dojox.grid.cells.RowIndex", dgc.Cell, {
		name: 'Row',

		postscript: function(){
			this.editable = false;
		},
		get: function(inRowIndex){
			return inRowIndex + 1;
		}
	});
	dgc.RowIndex.markupFactory = function(node, cellDef){
		dgc.Cell.markupFactory(node, cellDef);
	};

	dojo.declare("dojox.grid.cells.Select", dgc.Cell, {
		// summary:
		// grid cell that provides a standard select for editing

		// options: Array
		// 		text of each item
		options: null,

		// values: Array
		//		value for each item
		values: null,

		// returnIndex: Integer
		// 		editor returns only the index of the selected option and not the value
		returnIndex: -1,

		constructor: function(inCell){
			this.values = this.values || this.options;
		},
		formatEditing: function(inDatum, inRowIndex){
			this.needFormatNode(inDatum, inRowIndex);
			var h = [ '<select class="dojoxGridSelect">' ];
			for (var i=0, o, v; ((o=this.options[i]) !== undefined)&&((v=this.values[i]) !== undefined); i++){
				h.push("<option", (inDatum==v ? ' selected' : ''), ' value="' + v + '"', ">", o, "</option>");
			}
			h.push('</select>');
			return h.join('');
		},
		getValue: function(inRowIndex){
			var n = this.getEditNode(inRowIndex);
			if(n){
				var i = n.selectedIndex, o = n.options[i];
				return this.returnIndex > -1 ? i : o.value || o.innerHTML;
			}
		}
	});
	dgc.Select.markupFactory = function(node, cell){
		dgc.Cell.markupFactory(node, cell);
		var d=dojo;
		var options = d.trim(d.attr(node, "options")||"");
		if(options){
			var o = options.split(',');
			if(o[0] != options){
				cell.options = o;
			}
		}
		var values = d.trim(d.attr(node, "values")||"");
		if(values){
			var v = values.split(',');
			if(v[0] != values){
				cell.values = v;
			}
		}
	};

	dojo.declare("dojox.grid.cells.AlwaysEdit", dgc.Cell, {
		// summary:
		// grid cell that is always in an editable state, regardless of grid editing state
		alwaysEditing: true,
		_formatNode: function(inDatum, inRowIndex){
			this.formatNode(this.getEditNode(inRowIndex), inDatum, inRowIndex);
		},
		applyStaticValue: function(inRowIndex){
			var e = this.grid.edit;
			e.applyCellEdit(this.getValue(inRowIndex), this, inRowIndex);
			e.start(this, inRowIndex, true);
		}
	});
	dgc.AlwaysEdit.markupFactory = function(node, cell){
		dgc.Cell.markupFactory(node, cell);
	};

	dojo.declare("dojox.grid.cells.Bool", dgc.AlwaysEdit, {
		// summary:
		// grid cell that provides a standard checkbox that is always on for editing
		_valueProp: "checked",
		formatEditing: function(inDatum, inRowIndex){
			return '<input class="dojoxGridInput" type="checkbox"' + (inDatum ? ' checked="checked"' : '') + ' style="width: auto" />';
		},
		doclick: function(e){
			if(e.target.tagName == 'INPUT'){
				this.applyStaticValue(e.rowIndex);
			}
		}
	});
	dgc.Bool.markupFactory = function(node, cell){
		dgc.AlwaysEdit.markupFactory(node, cell);
	};
})();

}

if(!dojo._hasResource["dojox.grid.cells"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojox.grid.cells"] = true;
dojo.provide("dojox.grid.cells");


}

if(!dojo._hasResource["dojox.grid._Builder"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojox.grid._Builder"] = true;
dojo.provide("dojox.grid._Builder");




(function(){
	var dg = dojox.grid;

	var getTdIndex = function(td){
		return td.cellIndex >=0 ? td.cellIndex : dojo.indexOf(td.parentNode.cells, td);
	};
	
	var getTrIndex = function(tr){
		return tr.rowIndex >=0 ? tr.rowIndex : dojo.indexOf(tr.parentNode.childNodes, tr);
	};
	
	var getTr = function(rowOwner, index){
		return rowOwner && ((rowOwner.rows||0)[index] || rowOwner.childNodes[index]);
	};

	var findTable = function(node){
		for(var n=node; n && n.tagName!='TABLE'; n=n.parentNode){}
		return n;
	};
	
	var ascendDom = function(inNode, inWhile){
		for(var n=inNode; n && inWhile(n); n=n.parentNode){}
		return n;
	};
	
	var makeNotTagName = function(inTagName){
		var name = inTagName.toUpperCase();
		return function(node){ return node.tagName != name; };
	};

	var rowIndexTag = dojox.grid.util.rowIndexTag;
	var gridViewTag = dojox.grid.util.gridViewTag;

	// base class for generating markup for the views
	dg._Builder = dojo.extend(function(view){
		if(view){
			this.view = view;
			this.grid = view.grid;
		}
	},{
		view: null,
		// boilerplate HTML
		_table: '<table class="dojoxGridRowTable" border="0" cellspacing="0" cellpadding="0" role="presentation"',

		// Returns the table variable as an array - and with the view width, if specified
		getTableArray: function(){
			var html = [this._table];
			if(this.view.viewWidth){
				html.push([' style="width:', this.view.viewWidth, ';"'].join(''));
			}
			html.push('>');
			return html;
		},
		
		// generate starting tags for a cell
		generateCellMarkup: function(inCell, inMoreStyles, inMoreClasses, isHeader){
			var result = [], html;
			if(isHeader){
				var sortInfo = inCell.index != inCell.grid.getSortIndex() ? "" : inCell.grid.sortInfo > 0 ? 'aria-sort="ascending"' : 'aria-sort="descending"';
				if (!inCell.id){
					inCell.id = this.grid.id + "Hdr" + inCell.index;
				}
				// column headers are not editable, mark as aria-readonly=true
				html = ['<th tabIndex="-1" aria-readonly="true" role="columnheader"', sortInfo, 'id="', inCell.id, '"'];
			}else{
				// cells inherit grid aria-readonly property; default value for aria-readonly is false(grid is editable)
				// if grid is editable (had any editable cells), mark non editable cells as aria-readonly=true
				// if no editable cells, grid's aria-readonly value will have been set to true and cells will inherit
				var editInfo = this.grid.editable && !inCell.editable ? 'aria-readonly="true"' : "";
				html = ['<td tabIndex="-1" role="gridcell"', editInfo];
			}
			if(inCell.colSpan){
				html.push(' colspan="', inCell.colSpan, '"');
			}
			if(inCell.rowSpan){
				html.push(' rowspan="', inCell.rowSpan, '"');
			}
			html.push(' class="dojoxGridCell ');
			if(inCell.classes){
				html.push(inCell.classes, ' ');
			}
			if(inMoreClasses){
				html.push(inMoreClasses, ' ');
			}
			// result[0] => td opener, style
			result.push(html.join(''));
			// SLOT: result[1] => td classes
			result.push('');
			html = ['" idx="', inCell.index, '" style="'];
			if(inMoreStyles && inMoreStyles[inMoreStyles.length-1] != ';'){
				inMoreStyles += ';';
			}
			html.push(inCell.styles, inMoreStyles||'', inCell.hidden?'display:none;':'');
			if(inCell.unitWidth){
				html.push('width:', inCell.unitWidth, ';');
			}
			// result[2] => markup
			result.push(html.join(''));
			// SLOT: result[3] => td style
			result.push('');
			html = [ '"' ];
			if(inCell.attrs){
				html.push(" ", inCell.attrs);
			}
			html.push('>');
			// result[4] => td postfix
			result.push(html.join(''));
			// SLOT: result[5] => content
			result.push('');
			// result[6] => td closes
			result.push(isHeader?'</th>':'</td>');
			return result; // Array
		},

		// cell finding
		isCellNode: function(inNode){
			return Boolean(inNode && inNode!=dojo.doc && dojo.attr(inNode, "idx"));
		},
		
		getCellNodeIndex: function(inCellNode){
			return inCellNode ? Number(dojo.attr(inCellNode, "idx")) : -1;
		},
		
		getCellNode: function(inRowNode, inCellIndex){
			for(var i=0, row; ((row = getTr(inRowNode.firstChild, i)) && row.cells); i++){
				for(var j=0, cell; (cell = row.cells[j]); j++){
					if(this.getCellNodeIndex(cell) == inCellIndex){
						return cell;
					}
				}
			}
			return null;
		},
		
		findCellTarget: function(inSourceNode, inTopNode){
			var n = inSourceNode;
			while(n && (!this.isCellNode(n) || (n.offsetParent && gridViewTag in n.offsetParent.parentNode && n.offsetParent.parentNode[gridViewTag] != this.view.id)) && (n!=inTopNode)){
				n = n.parentNode;
			}
			return n!=inTopNode ? n : null;
		},
		
		// event decoration
		baseDecorateEvent: function(e){
			e.dispatch = 'do' + e.type;
			e.grid = this.grid;
			e.sourceView = this.view;
			e.cellNode = this.findCellTarget(e.target, e.rowNode);
			e.cellIndex = this.getCellNodeIndex(e.cellNode);
			e.cell = (e.cellIndex >= 0 ? this.grid.getCell(e.cellIndex) : null);
		},
		
		// event dispatch
		findTarget: function(inSource, inTag){
			var n = inSource;
			while(n && (n!=this.domNode) && (!(inTag in n) || (gridViewTag in n && n[gridViewTag] != this.view.id))){
				n = n.parentNode;
			}
			return (n != this.domNode) ? n : null;
		},

		findRowTarget: function(inSource){
			return this.findTarget(inSource, rowIndexTag);
		},

		isIntraNodeEvent: function(e){
			try{
				return (e.cellNode && e.relatedTarget && dojo.isDescendant(e.relatedTarget, e.cellNode));
			}catch(x){
				// e.relatedTarget has permission problem in FF if it's an input: https://bugzilla.mozilla.org/show_bug.cgi?id=208427
				return false;
			}
		},

		isIntraRowEvent: function(e){
			try{
				var row = e.relatedTarget && this.findRowTarget(e.relatedTarget);
				return !row && (e.rowIndex==-1) || row && (e.rowIndex==row.gridRowIndex);
			}catch(x){
				// e.relatedTarget on INPUT has permission problem in FF: https://bugzilla.mozilla.org/show_bug.cgi?id=208427
				return false;
			}
		},

		dispatchEvent: function(e){
			if(e.dispatch in this){
				return this[e.dispatch](e);
			}
			return false;
		},

		// dispatched event handlers
		domouseover: function(e){
			if(e.cellNode && (e.cellNode!=this.lastOverCellNode)){
				this.lastOverCellNode = e.cellNode;
				this.grid.onMouseOver(e);
			}
			this.grid.onMouseOverRow(e);
		},

		domouseout: function(e){
			if(e.cellNode && (e.cellNode==this.lastOverCellNode) && !this.isIntraNodeEvent(e, this.lastOverCellNode)){
				this.lastOverCellNode = null;
				this.grid.onMouseOut(e);
				if(!this.isIntraRowEvent(e)){
					this.grid.onMouseOutRow(e);
				}
			}
		},
		
		domousedown: function(e){
			if (e.cellNode)
				this.grid.onMouseDown(e);
			this.grid.onMouseDownRow(e);
		}
	});

	// Produces html for grid data content. Owned by grid and used internally
	// for rendering data. Override to implement custom rendering.
	dg._ContentBuilder = dojo.extend(function(view){
		dg._Builder.call(this, view);
	},dg._Builder.prototype,{
		update: function(){
			this.prepareHtml();
		},

		// cache html for rendering data rows
		prepareHtml: function(){
			var defaultGet=this.grid.get, cells=this.view.structure.cells;
			for(var j=0, row; (row=cells[j]); j++){
				for(var i=0, cell; (cell=row[i]); i++){
					cell.get = cell.get || (cell.value == undefined) && defaultGet;
					cell.markup = this.generateCellMarkup(cell, cell.cellStyles, cell.cellClasses, false);
					if (!this.grid.editable && cell.editable){
						this.grid.editable = true;
					}
				}
			}
		},

		// time critical: generate html using cache and data source
		generateHtml: function(inDataIndex, inRowIndex){
			var
				html = this.getTableArray(),
				v = this.view,
				cells = v.structure.cells,
				item = this.grid.getItem(inRowIndex);

			dojox.grid.util.fire(this.view, "onBeforeRow", [inRowIndex, cells]);
			for(var j=0, row; (row=cells[j]); j++){
				if(row.hidden || row.header){
					continue;
				}
				html.push(!row.invisible ? '<tr>' : '<tr class="dojoxGridInvisible">');
				for(var i=0, cell, m, cc, cs; (cell=row[i]); i++){
					m = cell.markup; cc = cell.customClasses = []; cs = cell.customStyles = [];
					// content (format can fill in cc and cs as side-effects)
					m[5] = cell.format(inRowIndex, item);
					// classes
					m[1] = cc.join(' ');
					// styles
					m[3] = cs.join(';');
					// in-place concat
					html.push.apply(html, m);
				}
				html.push('</tr>');
			}
			html.push('</table>');
			return html.join(''); // String
		},

		decorateEvent: function(e){
			e.rowNode = this.findRowTarget(e.target);
			if(!e.rowNode){return false;}
			e.rowIndex = e.rowNode[rowIndexTag];
			this.baseDecorateEvent(e);
			e.cell = this.grid.getCell(e.cellIndex);
			return true; // Boolean
		}
	});

	// Produces html for grid header content. Owned by grid and used internally
	// for rendering data. Override to implement custom rendering.
	dg._HeaderBuilder = dojo.extend(function(view){
		this.moveable = null;
		dg._Builder.call(this, view);
	},dg._Builder.prototype,{
		_skipBogusClicks: false,
		overResizeWidth: 4,
		minColWidth: 1,
		
		update: function(){
			if(this.tableMap){
				this.tableMap.mapRows(this.view.structure.cells);
			}else{
				this.tableMap = new dg._TableMap(this.view.structure.cells);
			}
		},

		generateHtml: function(inGetValue, inValue){
			var html = this.getTableArray(), cells = this.view.structure.cells;
			
			dojox.grid.util.fire(this.view, "onBeforeRow", [-1, cells]);
			for(var j=0, row; (row=cells[j]); j++){
				if(row.hidden){
					continue;
				}
				html.push(!row.invisible ? '<tr>' : '<tr class="dojoxGridInvisible">');
				for(var i=0, cell, markup; (cell=row[i]); i++){
					cell.customClasses = [];
					cell.customStyles = [];
					if(this.view.simpleStructure){
						if(cell.draggable){
							if(cell.headerClasses){
								if(cell.headerClasses.indexOf('dojoDndItem') == -1){
									cell.headerClasses += ' dojoDndItem';
								}
							}else{
								cell.headerClasses = 'dojoDndItem';
							}
						}
						if(cell.attrs){
							if(cell.attrs.indexOf("dndType='gridColumn_") == -1){
								cell.attrs += " dndType='gridColumn_" + this.grid.id + "'";
							}
						}else{
							cell.attrs = "dndType='gridColumn_" + this.grid.id + "'";
						}
					}
					markup = this.generateCellMarkup(cell, cell.headerStyles, cell.headerClasses, true);
					// content
					markup[5] = (inValue != undefined ? inValue : inGetValue(cell));
					// styles
					markup[3] = cell.customStyles.join(';');
					// classes
					markup[1] = cell.customClasses.join(' '); //(cell.customClasses ? ' ' + cell.customClasses : '');
					html.push(markup.join(''));
				}
				html.push('</tr>');
			}
			html.push('</table>');
			return html.join('');
		},

		// event helpers
		getCellX: function(e){
			var n, x = e.layerX;
			if(dojo.isMoz || dojo.isIE >= 9){
				n = ascendDom(e.target, makeNotTagName("th"));
				x -= (n && n.offsetLeft) || 0;
				var t = e.sourceView.getScrollbarWidth();
				if(!dojo._isBodyLtr()/*&& e.sourceView.headerNode.scrollLeft < t*/){
					//fix #11253
					table = ascendDom(n,makeNotTagName("table"));
					x -= (table && table.offsetLeft) || 0;
				}
				//x -= getProp(ascendDom(e.target, mkNotTagName("td")), "offsetLeft") || 0;
			}
			n = ascendDom(e.target, function(){
				if(!n || n == e.cellNode){
					return false;
				}
				// Mozilla 1.8 (FF 1.5) has a bug that makes offsetLeft = -parent border width
				// when parent has border, overflow: hidden, and is positioned
				// handle this problem here ... not a general solution!
				x += (n.offsetLeft < 0 ? 0 : n.offsetLeft);
				return true;
			});
			return x;
		},

		// event decoration
		decorateEvent: function(e){
			this.baseDecorateEvent(e);
			e.rowIndex = -1;
			e.cellX = this.getCellX(e);
			return true;
		},

		// event handlers
		// resizing
		prepareResize: function(e, mod){
			do{
				var i = getTdIndex(e.cellNode);
				e.cellNode = (i ? e.cellNode.parentNode.cells[i+mod] : null);
				e.cellIndex = (e.cellNode ? this.getCellNodeIndex(e.cellNode) : -1);
			}while(e.cellNode && e.cellNode.style.display == "none");
			return Boolean(e.cellNode);
		},

		canResize: function(e){
			if(!e.cellNode || e.cellNode.colSpan > 1){
				return false;
			}
			var cell = this.grid.getCell(e.cellIndex);
			return !cell.noresize && cell.canResize();
		},

		overLeftResizeArea: function(e){
			// We are never over a resize area if we are in the process of moving
			if(dojo.hasClass(dojo.body(), "dojoDndMove")){
				return false;
			}
			//Bugfix for crazy IE problem (#8807).  IE returns position information for the icon and text arrow divs
			//as if they were still on the left instead of returning the position they were 'float: right' to.
			//So, the resize check ends up checking the wrong adjacent cell.  This checks to see if the hover was over
			//the image or text nodes, then just ignored them/treat them not in scale range.
			if(dojo.isIE){
				var tN = e.target;
				if(dojo.hasClass(tN, "dojoxGridArrowButtonNode") ||
					dojo.hasClass(tN, "dojoxGridArrowButtonChar")){
					return false;
				}
			}

			if(dojo._isBodyLtr()){
				return (e.cellIndex>0) && (e.cellX > 0 && e.cellX < this.overResizeWidth) && this.prepareResize(e, -1);
			}
			var t = e.cellNode && (e.cellX > 0 && e.cellX < this.overResizeWidth);
			return t;
		},

		overRightResizeArea: function(e){
			// We are never over a resize area if we are in the process of moving
			if(dojo.hasClass(dojo.body(), "dojoDndMove")){
				return false;
			}
			//Bugfix for crazy IE problem (#8807).  IE returns position information for the icon and text arrow divs
			//as if they were still on the left instead of returning the position they were 'float: right' to.
			//So, the resize check ends up checking the wrong adjacent cell.  This checks to see if the hover was over
			//the image or text nodes, then just ignored them/treat them not in scale range.
			if(dojo.isIE){
				var tN = e.target;
				if(dojo.hasClass(tN, "dojoxGridArrowButtonNode") ||
					dojo.hasClass(tN, "dojoxGridArrowButtonChar")){
					return false;
				}
			}

			if(dojo._isBodyLtr()){
				return e.cellNode && (e.cellX >= e.cellNode.offsetWidth - this.overResizeWidth);
			}
			return (e.cellIndex>0) && (e.cellX >= e.cellNode.offsetWidth - this.overResizeWidth) && this.prepareResize(e, -1);
		},

		domousemove: function(e){
			//console.log(e.cellIndex, e.cellX, e.cellNode.offsetWidth);
			if(!this.moveable){
				var c = (this.overRightResizeArea(e) ? 'dojoxGridColResize' : (this.overLeftResizeArea(e) ? 'dojoxGridColResize' : ''));
				if(c && !this.canResize(e)){
					c = 'dojoxGridColNoResize';
				}
				dojo.toggleClass(e.sourceView.headerNode, "dojoxGridColNoResize", (c == "dojoxGridColNoResize"));
				dojo.toggleClass(e.sourceView.headerNode, "dojoxGridColResize", (c == "dojoxGridColResize"));
				if(dojo.isIE){
					var t = e.sourceView.headerNode.scrollLeft;
					e.sourceView.headerNode.scrollLeft = t;
				}
				if(c){
					dojo.stopEvent(e);
				}
			}
		},

		domousedown: function(e){
			if(!this.moveable){
				if((this.overRightResizeArea(e) || this.overLeftResizeArea(e)) && this.canResize(e)){
					this.beginColumnResize(e);
				}else{
					this.grid.onMouseDown(e);
					this.grid.onMouseOverRow(e);
				}
				//else{
				//	this.beginMoveColumn(e);
				//}
			}
		},

		doclick: function(e) {
			if(this._skipBogusClicks){
				dojo.stopEvent(e);
				return true;
			}
			return false;
		},

		// column resizing
		colResizeSetup: function(/*Event Object*/e, /*boolean*/ isMouse ){
			//Set up the drag object for column resizing
			// Called with mouse event in case of drag and drop,
			// Also called from keyboard shift-arrow event when focus is on a header
			var headContentBox = dojo.contentBox(e.sourceView.headerNode);
			
			if(isMouse){  //IE draws line even with no mouse down so separate from keyboard
				this.lineDiv = document.createElement('div');

				// NOTE: this is for backwards compatibility with Dojo 1.3
				var vw = (dojo.position||dojo._abs)(e.sourceView.headerNode, true);
				var bodyContentBox = dojo.contentBox(e.sourceView.domNode);
				//fix #11340
				var l = e.pageX;
				if(!dojo._isBodyLtr() && dojo.isIE < 8){
					l -= dojox.html.metrics.getScrollbar().w;
				}
				dojo.style(this.lineDiv, {
					top: vw.y + "px",
					left: l + "px",
					height: (bodyContentBox.h + headContentBox.h) + "px"
				});
				dojo.addClass(this.lineDiv, "dojoxGridResizeColLine");
				this.lineDiv._origLeft = l;
				dojo.body().appendChild(this.lineDiv);
			}
			var spanners = [], nodes = this.tableMap.findOverlappingNodes(e.cellNode);
			for(var i=0, cell; (cell=nodes[i]); i++){
				spanners.push({ node: cell, index: this.getCellNodeIndex(cell), width: cell.offsetWidth });
				//console.log("spanner: " + this.getCellNodeIndex(cell));
			}

			var view = e.sourceView;
			var adj = dojo._isBodyLtr() ? 1 : -1;
			var views = e.grid.views.views;
			var followers = [];
			for(var j=view.idx+adj, cView; (cView=views[j]); j=j+adj){
				followers.push({ node: cView.headerNode, left: window.parseInt(cView.headerNode.style.left) });
			}
			var table = view.headerContentNode.firstChild;
			var drag = {
				scrollLeft: e.sourceView.headerNode.scrollLeft,
				view: view,
				node: e.cellNode,
				index: e.cellIndex,
				w: dojo.contentBox(e.cellNode).w,
				vw: headContentBox.w,
				table: table,
				tw: dojo.contentBox(table).w,
				spanners: spanners,
				followers: followers
			};
			return drag;
		},
		beginColumnResize: function(e){
			this.moverDiv = document.createElement("div");
			dojo.style(this.moverDiv,{position: "absolute", left:0}); // to make DnD work with dir=rtl
			dojo.body().appendChild(this.moverDiv);
			dojo.addClass(this.grid.domNode, "dojoxGridColumnResizing");
			var m = (this.moveable = new dojo.dnd.Moveable(this.moverDiv));

			var drag = this.colResizeSetup(e,true);

			m.onMove = dojo.hitch(this, "doResizeColumn", drag);

			dojo.connect(m, "onMoveStop", dojo.hitch(this, function(){
				this.endResizeColumn(drag);
				if(drag.node.releaseCapture){
					drag.node.releaseCapture();
				}
				this.moveable.destroy();
				delete this.moveable;
				this.moveable = null;
				dojo.removeClass(this.grid.domNode, "dojoxGridColumnResizing");
			}));

			if(e.cellNode.setCapture){
				e.cellNode.setCapture();
			}
			m.onMouseDown(e);
		},

		doResizeColumn: function(inDrag, mover, leftTop){
			var changeX = leftTop.l;
			var data = {
				deltaX: changeX,
				w: inDrag.w + (dojo._isBodyLtr() ? changeX : -changeX),//fix #11341
				vw: inDrag.vw + changeX,
				tw: inDrag.tw + changeX
			};
			
			this.dragRecord = {inDrag: inDrag, mover: mover, leftTop:leftTop};
			
			if(data.w >= this.minColWidth){
				if (!mover) { // we are using keyboard do immediate resize
					this.doResizeNow(inDrag, data);
				}
				else{
					dojo.style(this.lineDiv, "left", (this.lineDiv._origLeft + data.deltaX) + "px");
				}
			}
		},

		endResizeColumn: function(inDrag){
			if(this.dragRecord){
				var leftTop = this.dragRecord.leftTop;
				var changeX = dojo._isBodyLtr() ? leftTop.l : -leftTop.l;
				// Make sure we are not under our minimum
				// http://bugs.dojotoolkit.org/ticket/9390
				changeX += Math.max(inDrag.w + changeX, this.minColWidth) - (inDrag.w + changeX);
				if(dojo.isWebKit && inDrag.spanners.length){
					// Webkit needs the pad border extents back in
					changeX += dojo._getPadBorderExtents(inDrag.spanners[0].node).w;
				}
				var data = {
					deltaX: changeX,
					w: inDrag.w + changeX,
					vw: inDrag.vw + changeX,
					tw: inDrag.tw + changeX
				};
				// Only resize the columns when the drag has finished
				this.doResizeNow(inDrag, data);
				delete this.dragRecord;
			}
			
			dojo.destroy(this.lineDiv);
 			dojo.destroy(this.moverDiv);
			dojo.destroy(this.moverDiv);
			delete this.moverDiv;
			this._skipBogusClicks = true;
			inDrag.view.update();
			this._skipBogusClicks = false;
			this.grid.onResizeColumn(inDrag.index);
		},
		doResizeNow: function(inDrag, data){
			inDrag.view.convertColPctToFixed();
			if(inDrag.view.flexCells && !inDrag.view.testFlexCells()){
				var t = findTable(inDrag.node);
				if(t){
					(t.style.width = '');
				}
			}
			var i, s, sw, f, fl;
			for(i=0; (s=inDrag.spanners[i]); i++){
				sw = s.width + data.deltaX;
				if(sw > 0){
					s.node.style.width = sw + 'px';
					inDrag.view.setColWidth(s.index, sw);
				}
			}
			if(dojo._isBodyLtr() || !dojo.isIE){//fix #11339
				for(i=0; (f=inDrag.followers[i]); i++){
					fl = f.left + data.deltaX;
					f.node.style.left = fl + 'px';
				}
			}
			inDrag.node.style.width = data.w + 'px';
			inDrag.view.setColWidth(inDrag.index, data.w);
			inDrag.view.headerNode.style.width = data.vw + 'px';
			inDrag.view.setColumnsWidth(data.tw);
			if(!dojo._isBodyLtr()){
				inDrag.view.headerNode.scrollLeft = inDrag.scrollLeft + data.deltaX;
			}
		}
	});

	// Maps an html table into a structure parsable for information about cell row and col spanning.
	// Used by HeaderBuilder.
	dg._TableMap = dojo.extend(function(rows){
		this.mapRows(rows);
	},{
		map: null,

		mapRows: function(inRows){
			// summary: Map table topography

			//console.log('mapRows');
			// # of rows
			var rowCount = inRows.length;
			if(!rowCount){
				return;
			}
			// map which columns and rows fill which cells
			this.map = [];
			var row;
			for(var k=0; (row=inRows[k]); k++){
				this.map[k] = [];
			}
			for(var j=0; (row=inRows[j]); j++){
				for(var i=0, x=0, cell, colSpan, rowSpan; (cell=row[i]); i++){
					while(this.map[j][x]){x++;}
					this.map[j][x] = { c: i, r: j };
					rowSpan = cell.rowSpan || 1;
					colSpan = cell.colSpan || 1;
					for(var y=0; y<rowSpan; y++){
						for(var s=0; s<colSpan; s++){
							this.map[j+y][x+s] = this.map[j][x];
						}
					}
					x += colSpan;
				}
			}
			//this.dumMap();
		},

		dumpMap: function(){
			for(var j=0, row, h=''; (row=this.map[j]); j++,h=''){
				for(var i=0, cell; (cell=row[i]); i++){
					h += cell.r + ',' + cell.c + '   ';
				}
			}
		},

		getMapCoords: function(inRow, inCol){
			// summary: Find node's map coords by it's structure coords
			for(var j=0, row; (row=this.map[j]); j++){
				for(var i=0, cell; (cell=row[i]); i++){
					if(cell.c==inCol && cell.r == inRow){
						return { j: j, i: i };
					}
					//else{console.log(inRow, inCol, ' : ', i, j, " : ", cell.r, cell.c); };
				}
			}
			return { j: -1, i: -1 };
		},
		
		getNode: function(inTable, inRow, inCol){
			// summary: Find a node in inNode's table with the given structure coords
			var row = inTable && inTable.rows[inRow];
			return row && row.cells[inCol];
		},
		
		_findOverlappingNodes: function(inTable, inRow, inCol){
			var nodes = [];
			var m = this.getMapCoords(inRow, inCol);
			//console.log("node j: %d, i: %d", m.j, m.i);
			for(var j=0, row; (row=this.map[j]); j++){
				if(j == m.j){ continue; }
				var rw = row[m.i];
				//console.log("overlaps: r: %d, c: %d", rw.r, rw.c);
				var n = (rw?this.getNode(inTable, rw.r, rw.c):null);
				if(n){ nodes.push(n); }
			}
			//console.log(nodes);
			return nodes;
		},
		
		findOverlappingNodes: function(inNode){
			return this._findOverlappingNodes(findTable(inNode), getTrIndex(inNode.parentNode), getTdIndex(inNode));
		}
	});
})();

}

if(!dojo._hasResource["dojox.grid._View"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojox.grid._View"] = true;
dojo.provide("dojox.grid._View");










(function(){
	// a private function
	var getStyleText = function(inNode, inStyleText){
		return inNode.style.cssText == undefined ? inNode.getAttribute("style") : inNode.style.cssText;
	};

	// some public functions
	dojo.declare('dojox.grid._View', [dijit._Widget, dijit._Templated], {
		// summary:
		//		A collection of grid columns. A grid is comprised of a set of views that stack horizontally.
		//		Grid creates views automatically based on grid's layout structure.
		//		Users should typically not need to access individual views directly.
		//
		// defaultWidth: String
		//		Default width of the view
		defaultWidth: "18em",

		// viewWidth: String
		// 		Width for the view, in valid css unit
		viewWidth: "",

		templateString:"<div class=\"dojoxGridView\" role=\"presentation\">\n\t<div class=\"dojoxGridHeader\" dojoAttachPoint=\"headerNode\" role=\"presentation\">\n\t\t<div dojoAttachPoint=\"headerNodeContainer\" style=\"width:9000em\" role=\"presentation\">\n\t\t\t<div dojoAttachPoint=\"headerContentNode\" role=\"row\"></div>\n\t\t</div>\n\t</div>\n\t<input type=\"checkbox\" class=\"dojoxGridHiddenFocus\" dojoAttachPoint=\"hiddenFocusNode\" role=\"presentation\" />\n\t<input type=\"checkbox\" class=\"dojoxGridHiddenFocus\" role=\"presentation\" />\n\t<div class=\"dojoxGridScrollbox\" dojoAttachPoint=\"scrollboxNode\" role=\"presentation\">\n\t\t<div class=\"dojoxGridContent\" dojoAttachPoint=\"contentNode\" hidefocus=\"hidefocus\" role=\"presentation\"></div>\n\t</div>\n</div>\n",
		
		themeable: false,
		classTag: 'dojoxGrid',
		marginBottom: 0,
		rowPad: 2,

		// _togglingColumn: int
		//		Width of the column being toggled (-1 for none)
		_togglingColumn: -1,
		
		// _headerBuilderClass: Object
		//		The class to use for our header builder
		_headerBuilderClass: dojox.grid._HeaderBuilder,
		
		// _contentBuilderClass: Object
		//		The class to use for our content builder
		_contentBuilderClass: dojox.grid._ContentBuilder,
		
		postMixInProperties: function(){
			this.rowNodes = {};
		},

		postCreate: function(){
			this.connect(this.scrollboxNode,"onscroll","doscroll");
			dojox.grid.util.funnelEvents(this.contentNode, this, "doContentEvent", [ 'mouseover', 'mouseout', 'click', 'dblclick', 'contextmenu', 'mousedown' ]);
			dojox.grid.util.funnelEvents(this.headerNode, this, "doHeaderEvent", [ 'dblclick', 'mouseover', 'mouseout', 'mousemove', 'mousedown', 'click', 'contextmenu' ]);
			this.content = new this._contentBuilderClass(this);
			this.header = new this._headerBuilderClass(this);
			//BiDi: in RTL case, style width='9000em' causes scrolling problem in head node
			if(!dojo._isBodyLtr()){
				this.headerNodeContainer.style.width = "";
			}
		},

		destroy: function(){
			dojo.destroy(this.headerNode);
			delete this.headerNode;
			for(var i in this.rowNodes){
				dojo.destroy(this.rowNodes[i]);
			}
			this.rowNodes = {};
			if(this.source){
				this.source.destroy();
			}
			this.inherited(arguments);
		},

		// focus
		focus: function(){
			if(dojo.isIE || dojo.isWebKit || dojo.isOpera){
				this.hiddenFocusNode.focus();
			}else{
				this.scrollboxNode.focus();
			}
		},

		setStructure: function(inStructure){
			var vs = (this.structure = inStructure);
			// FIXME: similar logic is duplicated in layout
			if(vs.width && !isNaN(vs.width)){
				this.viewWidth = vs.width + 'em';
			}else{
				this.viewWidth = vs.width || (vs.noscroll ? 'auto' : this.viewWidth); //|| this.defaultWidth;
			}
			this._onBeforeRow = vs.onBeforeRow||function(){};
			this._onAfterRow = vs.onAfterRow||function(){};
			this.noscroll = vs.noscroll;
			if(this.noscroll){
				this.scrollboxNode.style.overflow = "hidden";
			}
			this.simpleStructure = Boolean(vs.cells.length == 1);
			// bookkeeping
			this.testFlexCells();
			// accomodate new structure
			this.updateStructure();
		},
		
		_cleanupRowWidgets: function(inRowNode){
			// Summary:
			//		Cleans up the widgets for the given row node so that
			//		we can reattach them if needed
			if(inRowNode){
				dojo.forEach(dojo.query("[widgetId]", inRowNode).map(dijit.byNode), function(w){
					if(w._destroyOnRemove){
						w.destroy();
						delete w;
					}else if(w.domNode && w.domNode.parentNode){
						w.domNode.parentNode.removeChild(w.domNode);
					}
				});
			}
		},
		
		onBeforeRow: function(inRowIndex, cells){
			this._onBeforeRow(inRowIndex, cells);
			if(inRowIndex >= 0){
				this._cleanupRowWidgets(this.getRowNode(inRowIndex));
			}
		},
		
		onAfterRow: function(inRowIndex, cells, inRowNode){
			this._onAfterRow(inRowIndex, cells, inRowNode);
			var g = this.grid;
			dojo.forEach(dojo.query(".dojoxGridStubNode", inRowNode), function(n){
				if(n && n.parentNode){
					var lw = n.getAttribute("linkWidget");
					var cellIdx = window.parseInt(dojo.attr(n, "cellIdx"), 10);
					var cellDef = g.getCell(cellIdx);
					var w = dijit.byId(lw);
					if(w){
						n.parentNode.replaceChild(w.domNode, n);
						if(!w._started){
							w.startup();
						}
					}else{
						n.innerHTML = "";
					}
				}
			}, this);
		},

		testFlexCells: function(){
			// FIXME: cheater, this function does double duty as initializer and tester
			this.flexCells = false;
			for(var j=0, row; (row=this.structure.cells[j]); j++){
				for(var i=0, cell; (cell=row[i]); i++){
					cell.view = this;
					this.flexCells = this.flexCells || cell.isFlex();
				}
			}
			return this.flexCells;
		},

		updateStructure: function(){
			// header builder needs to update table map
			this.header.update();
			// content builder needs to update markup cache
			this.content.update();
		},

		getScrollbarWidth: function(){
			var hasScrollSpace = this.hasVScrollbar();
			var overflow = dojo.style(this.scrollboxNode, "overflow");
			if(this.noscroll || !overflow || overflow == "hidden"){
				hasScrollSpace = false;
			}else if(overflow == "scroll"){
				hasScrollSpace = true;
			}
			return (hasScrollSpace ? dojox.html.metrics.getScrollbar().w : 0); // Integer
		},

		getColumnsWidth: function(){
			var h = this.headerContentNode;
			return h && h.firstChild ? h.firstChild.offsetWidth : 0; // Integer
		},

		setColumnsWidth: function(width){
			this.headerContentNode.firstChild.style.width = width + 'px';
			if(this.viewWidth){
				this.viewWidth = width + 'px';
			}
		},

		getWidth: function(){
			return this.viewWidth || (this.getColumnsWidth()+this.getScrollbarWidth()) +'px'; // String
		},

		getContentWidth: function(){
			return Math.max(0, dojo._getContentBox(this.domNode).w - this.getScrollbarWidth()) + 'px'; // String
		},

		render: function(){
			this.scrollboxNode.style.height = '';
			this.renderHeader();
			if(this._togglingColumn >= 0){
				this.setColumnsWidth(this.getColumnsWidth() - this._togglingColumn);
				this._togglingColumn = -1;
			}
			var cells = this.grid.layout.cells;
			var getSibling = dojo.hitch(this, function(node, before){
				!dojo._isBodyLtr() && (before = !before);
				var inc = before?-1:1;
				var idx = this.header.getCellNodeIndex(node) + inc;
				var cell = cells[idx];
				while(cell && cell.getHeaderNode() && cell.getHeaderNode().style.display == "none"){
					idx += inc;
					cell = cells[idx];
				}
				if(cell){
					return cell.getHeaderNode();
				}
				return null;
			});
			if(this.grid.columnReordering && this.simpleStructure){
				if(this.source){
					this.source.destroy();
				}
				
				// Create the top and bottom markers
				var bottomMarkerId = "dojoxGrid_bottomMarker";
				var topMarkerId = "dojoxGrid_topMarker";
				if(this.bottomMarker){
					dojo.destroy(this.bottomMarker);
				}
				this.bottomMarker = dojo.byId(bottomMarkerId);
				if(this.topMarker){
					dojo.destroy(this.topMarker);
				}
				this.topMarker = dojo.byId(topMarkerId);
				if (!this.bottomMarker) {
					this.bottomMarker = dojo.create("div", {
						"id": bottomMarkerId,
						"class": "dojoxGridColPlaceBottom"
					}, dojo.body());
					this._hide(this.bottomMarker);

					
					this.topMarker = dojo.create("div", {
						"id": topMarkerId,
						"class": "dojoxGridColPlaceTop"
					}, dojo.body());
					this._hide(this.topMarker);
				}
				this.arrowDim = dojo.contentBox(this.bottomMarker);

				var headerHeight = dojo.contentBox(this.headerContentNode.firstChild.rows[0]).h;
				
				this.source = new dojo.dnd.Source(this.headerContentNode.firstChild.rows[0], {
					horizontal: true,
					accept: [ "gridColumn_" + this.grid.id ],
					viewIndex: this.index,
					generateText: false,
					onMouseDown: dojo.hitch(this, function(e){
						this.header.decorateEvent(e);
						if((this.header.overRightResizeArea(e) || this.header.overLeftResizeArea(e)) &&
							this.header.canResize(e) && !this.header.moveable){
							this.header.beginColumnResize(e);
						}else{
							if(this.grid.headerMenu){
								this.grid.headerMenu.onCancel(true);
							}
							// IE reports a left click as 1, where everything else reports 0
							if(e.button === (dojo.isIE ? 1 : 0)){
								dojo.dnd.Source.prototype.onMouseDown.call(this.source, e);
							}
						}
					}),
					onMouseOver: dojo.hitch(this, function(e){
						var src = this.source;
						if(src._getChildByEvent(e)){
							dojo.dnd.Source.prototype.onMouseOver.apply(src, arguments);
						}
					}),
					_markTargetAnchor: dojo.hitch(this, function(before){
						var src = this.source;
						if(src.current == src.targetAnchor && src.before == before){ return; }
						if(src.targetAnchor && getSibling(src.targetAnchor, src.before)){
							src._removeItemClass(getSibling(src.targetAnchor, src.before), src.before ? "After" : "Before");
						}
						dojo.dnd.Source.prototype._markTargetAnchor.call(src, before);
						
						var target = before ? src.targetAnchor : getSibling(src.targetAnchor, src.before);
						var endAdd = 0;

						if (!target) {
							target = src.targetAnchor;
							endAdd = dojo.contentBox(target).w + this.arrowDim.w/2 + 2;
						}

						// NOTE: this is for backwards compatibility with Dojo 1.3
						var pos = (dojo.position||dojo._abs)(target, true);
						var left = Math.floor(pos.x - this.arrowDim.w/2 + endAdd);

						dojo.style(this.bottomMarker, "visibility", "visible");
						dojo.style(this.topMarker, "visibility", "visible");
						dojo.style(this.bottomMarker, {
							"left": left + "px",
							"top" : (headerHeight + pos.y) + "px"
						});

						dojo.style(this.topMarker, {
							"left": left + "px",
							"top" : (pos.y - this.arrowDim.h) + "px"
						});

						if(src.targetAnchor && getSibling(src.targetAnchor, src.before)){
							src._addItemClass(getSibling(src.targetAnchor, src.before), src.before ? "After" : "Before");
						}
					}),
					_unmarkTargetAnchor: dojo.hitch(this, function(){
						var src = this.source;
						if(!src.targetAnchor){ return; }
						if(src.targetAnchor && getSibling(src.targetAnchor, src.before)){
							src._removeItemClass(getSibling(src.targetAnchor, src.before), src.before ? "After" : "Before");
						}
						this._hide(this.bottomMarker);
						this._hide(this.topMarker);
						dojo.dnd.Source.prototype._unmarkTargetAnchor.call(src);
					}),
					destroy: dojo.hitch(this, function(){
						dojo.disconnect(this._source_conn);
						dojo.unsubscribe(this._source_sub);
						dojo.dnd.Source.prototype.destroy.call(this.source);
						if(this.bottomMarker){
							dojo.destroy(this.bottomMarker);
							delete this.bottomMarker;
						}
						if(this.topMarker){
							dojo.destroy(this.topMarker);
							delete this.topMarker;
						}
					}),
					onDndCancel: dojo.hitch(this, function(){
						dojo.dnd.Source.prototype.onDndCancel.call(this.source);
						this._hide(this.bottomMarker);
						this._hide(this.topMarker);
					})
				});

				this._source_conn = dojo.connect(this.source, "onDndDrop", this, "_onDndDrop");
				this._source_sub = dojo.subscribe("/dnd/drop/before", this, "_onDndDropBefore");
				this.source.startup();
			}
		},
		
		_hide: function(node){
			dojo.style(node, {
				left: "-10000px",
				top: "-10000px",
				"visibility": "hidden"
			});
		},

		_onDndDropBefore: function(source, nodes, copy){
			if(dojo.dnd.manager().target !== this.source){
				return;
			}
			this.source._targetNode = this.source.targetAnchor;
			this.source._beforeTarget = this.source.before;
			var views = this.grid.views.views;
			var srcView = views[source.viewIndex];
			var tgtView = views[this.index];
			if(tgtView != srcView){
				srcView.convertColPctToFixed();
				tgtView.convertColPctToFixed();
			}
		},

		_onDndDrop: function(source, nodes, copy){
			if(dojo.dnd.manager().target !== this.source){
				if(dojo.dnd.manager().source === this.source){
					this._removingColumn = true;
				}
				return;
			}
			this._hide(this.bottomMarker);
			this._hide(this.topMarker);

			var getIdx = function(n){
				return n ? dojo.attr(n, "idx") : null;
			};
			var w = dojo.marginBox(nodes[0]).w;
			if(source.viewIndex !== this.index){
				var views = this.grid.views.views;
				var srcView = views[source.viewIndex];
				var tgtView = views[this.index];
				if(srcView.viewWidth && srcView.viewWidth != "auto"){
					srcView.setColumnsWidth(srcView.getColumnsWidth() - w);
				}
				if(tgtView.viewWidth && tgtView.viewWidth != "auto"){
					tgtView.setColumnsWidth(tgtView.getColumnsWidth());
				}
			}
			var stn = this.source._targetNode;
			var stb = this.source._beforeTarget;
			!dojo._isBodyLtr() && (stb = !stb);
			var layout = this.grid.layout;
			var idx = this.index;
			delete this.source._targetNode;
			delete this.source._beforeTarget;
			
			layout.moveColumn(
				source.viewIndex,
				idx,
				getIdx(nodes[0]),
				getIdx(stn),
				stb);
		},

		renderHeader: function(){
			this.headerContentNode.innerHTML = this.header.generateHtml(this._getHeaderContent);
			if(this.flexCells){
				this.contentWidth = this.getContentWidth();
				this.headerContentNode.firstChild.style.width = this.contentWidth;
			}
			dojox.grid.util.fire(this, "onAfterRow", [-1, this.structure.cells, this.headerContentNode]);
		},

		// note: not called in 'view' context
		_getHeaderContent: function(inCell){
			var n = inCell.name || inCell.grid.getCellName(inCell);
			var ret = [ '<div class="dojoxGridSortNode' ];
			
			if(inCell.index != inCell.grid.getSortIndex()){
				ret.push('">');
			}else{
				ret = ret.concat([ ' ',
							inCell.grid.sortInfo > 0 ? 'dojoxGridSortUp' : 'dojoxGridSortDown',
							'"><div class="dojoxGridArrowButtonChar">',
							inCell.grid.sortInfo > 0 ? '&#9650;' : '&#9660;',
							'</div><div class="dojoxGridArrowButtonNode" role="presentation"></div>',
							'<div class="dojoxGridColCaption">']);
			}
			ret = ret.concat([n, '</div></div>']);
			return ret.join('');
		},

		resize: function(){
			this.adaptHeight();
			this.adaptWidth();
		},

		hasHScrollbar: function(reset){
			var hadScroll = this._hasHScroll||false;
			if(this._hasHScroll == undefined || reset){
				if(this.noscroll){
					this._hasHScroll = false;
				}else{
					var style = dojo.style(this.scrollboxNode, "overflow");
					if(style == "hidden"){
						this._hasHScroll = false;
					}else if(style == "scroll"){
						this._hasHScroll = true;
					}else{
						this._hasHScroll = (this.scrollboxNode.offsetWidth - this.getScrollbarWidth() < this.contentNode.offsetWidth );
					}
				}
			}
			if(hadScroll !== this._hasHScroll){
				this.grid.update();
			}
			return this._hasHScroll; // Boolean
		},

		hasVScrollbar: function(reset){
			var hadScroll = this._hasVScroll||false;
			if(this._hasVScroll == undefined || reset){
				if(this.noscroll){
					this._hasVScroll = false;
				}else{
					var style = dojo.style(this.scrollboxNode, "overflow");
					if(style == "hidden"){
						this._hasVScroll = false;
					}else if(style == "scroll"){
						this._hasVScroll = true;
					}else{
						this._hasVScroll = (this.scrollboxNode.scrollHeight > this.scrollboxNode.clientHeight);
					}
				}
			}
			if(hadScroll !== this._hasVScroll){
				this.grid.update();
			}
			return this._hasVScroll; // Boolean
		},
		
		convertColPctToFixed: function(){
			// Fix any percentage widths to be pixel values
			var hasPct = false;
			this.grid.initialWidth = "";
			var cellNodes = dojo.query("th", this.headerContentNode);
			var fixedWidths = dojo.map(cellNodes, function(c, vIdx){
				var w = c.style.width;
				dojo.attr(c, "vIdx", vIdx);
				if(w && w.slice(-1) == "%"){
					hasPct = true;
				}else if(w && w.slice(-2) == "px"){
					return window.parseInt(w, 10);
				}
				return dojo.contentBox(c).w;
			});
			if(hasPct){
				dojo.forEach(this.grid.layout.cells, function(cell, idx){
					if(cell.view == this){
						var cellNode = cell.view.getHeaderCellNode(cell.index);
						if(cellNode && dojo.hasAttr(cellNode, "vIdx")){
							var vIdx = window.parseInt(dojo.attr(cellNode, "vIdx"));
							this.setColWidth(idx, fixedWidths[vIdx]);
							dojo.removeAttr(cellNode, "vIdx");
						}
					}
				}, this);
				return true;
			}
			return false;
		},

		adaptHeight: function(minusScroll){
			if(!this.grid._autoHeight){
				var h = (this.domNode.style.height && parseInt(this.domNode.style.height.replace(/px/,''), 10)) || this.domNode.clientHeight;
				var self = this;
				var checkOtherViewScrollers = function(){
					var v;
					for(var i in self.grid.views.views){
						v = self.grid.views.views[i];
						if(v !== self && v.hasHScrollbar()){
							return true;
						}
					}
					return false;
				};
				if(minusScroll || (this.noscroll && checkOtherViewScrollers())){
					h -= dojox.html.metrics.getScrollbar().h;
				}
				dojox.grid.util.setStyleHeightPx(this.scrollboxNode, h);
			}
			this.hasVScrollbar(true);
		},

		adaptWidth: function(){
			if(this.flexCells){
				// the view content width
				this.contentWidth = this.getContentWidth();
				this.headerContentNode.firstChild.style.width = this.contentWidth;
			}
			// FIXME: it should be easier to get w from this.scrollboxNode.clientWidth,
			// but clientWidth seemingly does not include scrollbar width in some cases
			var w = this.scrollboxNode.offsetWidth - this.getScrollbarWidth();
			if(!this._removingColumn){
				w = Math.max(w, this.getColumnsWidth()) + 'px';
			}else{
				w = Math.min(w, this.getColumnsWidth()) + 'px';
				this._removingColumn = false;
			}
			var cn = this.contentNode;
			cn.style.width = w;
			this.hasHScrollbar(true);
		},

		setSize: function(w, h){
			var ds = this.domNode.style;
			var hs = this.headerNode.style;

			if(w){
				ds.width = w;
				hs.width = w;
			}
			ds.height = (h >= 0 ? h + 'px' : '');
		},

		renderRow: function(inRowIndex){
			var rowNode = this.createRowNode(inRowIndex);
			this.buildRow(inRowIndex, rowNode);
			this.grid.edit.restore(this, inRowIndex);
			return rowNode;
		},

		createRowNode: function(inRowIndex){
			var node = document.createElement("div");
			node.className = this.classTag + 'Row';
			if (this instanceof dojox.grid._RowSelector){
				dojo.attr(node,"role","presentation");
			}else{
				dojo.attr(node,"role","row");
				if (this.grid.selectionMode != "none") {
					dojo.attr(node, "aria-selected", "false"); //rows can be selected so add aria-selected prop
				}
			}
			node[dojox.grid.util.gridViewTag] = this.id;
			node[dojox.grid.util.rowIndexTag] = inRowIndex;
			this.rowNodes[inRowIndex] = node;
			return node;
		},

		buildRow: function(inRowIndex, inRowNode){
			
			this.buildRowContent(inRowIndex, inRowNode);
		  	
			this.styleRow(inRowIndex, inRowNode);
		  
		 
		},

		buildRowContent: function(inRowIndex, inRowNode){
			inRowNode.innerHTML = this.content.generateHtml(inRowIndex, inRowIndex);
			if(this.flexCells && this.contentWidth){
				// FIXME: accessing firstChild here breaks encapsulation
				inRowNode.firstChild.style.width = this.contentWidth;
			}
			dojox.grid.util.fire(this, "onAfterRow", [inRowIndex, this.structure.cells, inRowNode]);
		},

		rowRemoved:function(inRowIndex){
			if(inRowIndex >= 0){
				this._cleanupRowWidgets(this.getRowNode(inRowIndex));
			}
			this.grid.edit.save(this, inRowIndex);
			delete this.rowNodes[inRowIndex];
		},

		getRowNode: function(inRowIndex){
			return this.rowNodes[inRowIndex];
		},

		getCellNode: function(inRowIndex, inCellIndex){
			var row = this.getRowNode(inRowIndex);
			if(row){
				return this.content.getCellNode(row, inCellIndex);
			}
		},

		getHeaderCellNode: function(inCellIndex){
			if(this.headerContentNode){
				return this.header.getCellNode(this.headerContentNode, inCellIndex);
			}
		},

		// styling
		styleRow: function(inRowIndex, inRowNode){
			inRowNode._style = getStyleText(inRowNode);
			this.styleRowNode(inRowIndex, inRowNode);
		},

		styleRowNode: function(inRowIndex, inRowNode){
			if(inRowNode){
				this.doStyleRowNode(inRowIndex, inRowNode);
			}
		},

		doStyleRowNode: function(inRowIndex, inRowNode){
			this.grid.styleRowNode(inRowIndex, inRowNode);
		},

		// updating
		updateRow: function(inRowIndex){
			var rowNode = this.getRowNode(inRowIndex);
			if(rowNode){
				rowNode.style.height = '';
				this.buildRow(inRowIndex, rowNode);
			}
			return rowNode;
		},

		updateRowStyles: function(inRowIndex){
			this.styleRowNode(inRowIndex, this.getRowNode(inRowIndex));
		},

		// scrolling
		lastTop: 0,
		firstScroll:0,

		doscroll: function(inEvent){
			//var s = dojo.marginBox(this.headerContentNode.firstChild);
			var isLtr = dojo._isBodyLtr();
			if(this.firstScroll < 2){
				if((!isLtr && this.firstScroll == 1) || (isLtr && this.firstScroll === 0)){
					var s = dojo.marginBox(this.headerNodeContainer);
					if(dojo.isIE){
						this.headerNodeContainer.style.width = s.w + this.getScrollbarWidth() + 'px';
					}else if(dojo.isMoz){
						//TODO currently only for FF, not sure for safari and opera
						this.headerNodeContainer.style.width = s.w - this.getScrollbarWidth() + 'px';
						//this.headerNodeContainer.style.width = s.w + 'px';
						//set scroll to right in FF
						this.scrollboxNode.scrollLeft = isLtr ?
							this.scrollboxNode.clientWidth - this.scrollboxNode.scrollWidth :
							this.scrollboxNode.scrollWidth - this.scrollboxNode.clientWidth;
					}
				}
				this.firstScroll++;
			}
			this.headerNode.scrollLeft = this.scrollboxNode.scrollLeft;
			// 'lastTop' is a semaphore to prevent feedback-loop with setScrollTop below
			var top = this.scrollboxNode.scrollTop;
			if(top !== this.lastTop){
				this.grid.scrollTo(top);
			}
		},

		setScrollTop: function(inTop){
			// 'lastTop' is a semaphore to prevent feedback-loop with doScroll above
			this.lastTop = inTop;
			this.scrollboxNode.scrollTop = inTop;
			return this.scrollboxNode.scrollTop;
		},

		// event handlers (direct from DOM)
		doContentEvent: function(e){
			if(this.content.decorateEvent(e)){
				this.grid.onContentEvent(e);
			}
		},

		doHeaderEvent: function(e){
			if(this.header.decorateEvent(e)){
				this.grid.onHeaderEvent(e);
			}
		},

		// event dispatch(from Grid)
		dispatchContentEvent: function(e){
			return this.content.dispatchEvent(e);
		},

		dispatchHeaderEvent: function(e){
			return this.header.dispatchEvent(e);
		},

		// column resizing
		setColWidth: function(inIndex, inWidth){
			this.grid.setCellWidth(inIndex, inWidth + 'px');
		},

		update: function(){
			if(!this.domNode){
				return;
			}
			this.content.update();
			this.grid.update();
			//get scroll after update or scroll left setting goes wrong on IE.
			//See trac: #8040
			var left = this.scrollboxNode.scrollLeft;
			this.scrollboxNode.scrollLeft = left;
			this.headerNode.scrollLeft = left;
		}
	});

	dojo.declare("dojox.grid._GridAvatar", dojo.dnd.Avatar, {
		construct: function(){
			var dd = dojo.doc;

			var a = dd.createElement("table");
			a.cellPadding = a.cellSpacing = "0";
			a.className = "dojoxGridDndAvatar";
			a.style.position = "absolute";
			a.style.zIndex = 1999;
			a.style.margin = "0px"; // to avoid dojo.marginBox() problems with table's margins
			var b = dd.createElement("tbody");
			var tr = dd.createElement("tr");
			var td = dd.createElement("td");
			var img = dd.createElement("td");
			tr.className = "dojoxGridDndAvatarItem";
			img.className = "dojoxGridDndAvatarItemImage";
			img.style.width = "16px";
			var source = this.manager.source, node;
			if(source.creator){
				// create an avatar representation of the node
				node = source._normalizedCreator(source.getItem(this.manager.nodes[0].id).data, "avatar").node;
			}else{
				// or just clone the node and hope it works
				node = this.manager.nodes[0].cloneNode(true);
				var table, tbody;
				if(node.tagName.toLowerCase() == "tr"){
					// insert extra table nodes
					table = dd.createElement("table");
					tbody = dd.createElement("tbody");
					tbody.appendChild(node);
					table.appendChild(tbody);
					node = table;
				}else if(node.tagName.toLowerCase() == "th"){
					// insert extra table nodes
					table = dd.createElement("table");
					tbody = dd.createElement("tbody");
					var r = dd.createElement("tr");
					table.cellPadding = table.cellSpacing = "0";
					r.appendChild(node);
					tbody.appendChild(r);
					table.appendChild(tbody);
					node = table;
				}
			}
			node.id = "";
			td.appendChild(node);
			tr.appendChild(img);
			tr.appendChild(td);
			dojo.style(tr, "opacity", 0.9);
			b.appendChild(tr);

			a.appendChild(b);
			this.node = a;

			var m = dojo.dnd.manager();
			this.oldOffsetY = m.OFFSET_Y;
			m.OFFSET_Y = 1;
		},
		destroy: function(){
			dojo.dnd.manager().OFFSET_Y = this.oldOffsetY;
			this.inherited(arguments);
		}
	});

	var oldMakeAvatar = dojo.dnd.manager().makeAvatar;
	dojo.dnd.manager().makeAvatar = function(){
		var src = this.source;
		if(src.viewIndex !== undefined && !dojo.hasClass(dojo.body(),"dijit_a11y")){
			return new dojox.grid._GridAvatar(this);
		}
		return oldMakeAvatar.call(dojo.dnd.manager());
	};
})();

}

if(!dojo._hasResource["dojox.grid._RowSelector"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojox.grid._RowSelector"] = true;
dojo.provide("dojox.grid._RowSelector");


dojo.declare('dojox.grid._RowSelector', dojox.grid._View, {
	// summary:
	//	Custom grid view. If used in a grid structure, provides a small selectable region for grid rows.
	defaultWidth: "2em",
	noscroll: true,
	padBorderWidth: 2,
	buildRendering: function(){
		this.inherited('buildRendering', arguments);
		this.scrollboxNode.style.overflow = "hidden";
		this.headerNode.style.visibility = "hidden";
	},
	getWidth: function(){
		return this.viewWidth || this.defaultWidth;
	},
	buildRowContent: function(inRowIndex, inRowNode){
		var w = this.contentWidth || 0;
		inRowNode.innerHTML = '<table class="dojoxGridRowbarTable" style="width:' + w + 'px;height:1px;" border="0" cellspacing="0" cellpadding="0" role="presentation"><tr><td class="dojoxGridRowbarInner">&nbsp;</td></tr></table>';
	},
	renderHeader: function(){
	},
	updateRow: function(){
	},
	resize: function(){
		this.adaptHeight();
	},
	adaptWidth: function(){
		// Only calculate this here - rather than every call to buildRowContent
		if(!("contentWidth" in this) && this.contentNode){
			this.contentWidth = this.contentNode.offsetWidth - this.padBorderWidth;
		}
	},
	// styling
	doStyleRowNode: function(inRowIndex, inRowNode){
		var n = [ "dojoxGridRowbar dojoxGridNonNormalizedCell" ];
		if(this.grid.rows.isOver(inRowIndex)){
			n.push("dojoxGridRowbarOver");
		}
		if(this.grid.selection.isSelected(inRowIndex)){
			n.push("dojoxGridRowbarSelected");
		}
		inRowNode.className = n.join(" ");
	},
	// event handlers
	domouseover: function(e){
		this.grid.onMouseOverRow(e);
	},
	domouseout: function(e){
		if(!this.isIntraRowEvent(e)){
			this.grid.onMouseOutRow(e);
		}
	}
});

}

if(!dojo._hasResource["dojox.grid._Layout"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojox.grid._Layout"] = true;
dojo.provide("dojox.grid._Layout");



dojo.declare("dojox.grid._Layout", null, {
	// summary:
	//	Controls grid cell layout. Owned by grid and used internally.
	constructor: function(inGrid){
		this.grid = inGrid;
	},
	// flat array of grid cells
	cells: [],
	// structured array of grid cells
	structure: null,
	// default cell width
	defaultWidth: '6em',

	// methods
	moveColumn: function(sourceViewIndex, destViewIndex, cellIndex, targetIndex, before){
		var source_cells = this.structure[sourceViewIndex].cells[0];
		var dest_cells = this.structure[destViewIndex].cells[0];

		var cell = null;
		var cell_ri = 0;
		var target_ri = 0;

		for(var i=0, c; c=source_cells[i]; i++){
			if(c.index == cellIndex){
				cell_ri = i;
				break;
			}
		}
		cell = source_cells.splice(cell_ri, 1)[0];
		cell.view = this.grid.views.views[destViewIndex];

		for(i=0, c=null; c=dest_cells[i]; i++){
			if(c.index == targetIndex){
				target_ri = i;
				break;
			}
		}
		if(!before){
			target_ri += 1;
		}
		dest_cells.splice(target_ri, 0, cell);

		var sortedCell = this.grid.getCell(this.grid.getSortIndex());
		if(sortedCell){
			sortedCell._currentlySorted = this.grid.getSortAsc();
		}

		this.cells = [];
		cellIndex = 0;
		var v;
		for(i=0; v=this.structure[i]; i++){
			for(var j=0, cs; cs=v.cells[j]; j++){
				for(var k=0; c=cs[k]; k++){
					c.index = cellIndex;
					this.cells.push(c);
					if("_currentlySorted" in c){
						var si = cellIndex + 1;
						si *= c._currentlySorted ? 1 : -1;
						this.grid.sortInfo = si;
						delete c._currentlySorted;
					}
					cellIndex++;
				}
			}
		}
		
		//Fix #9481 - reset idx in cell markup
		dojo.forEach(this.cells, function(c){
			var marks = c.markup[2].split(" ");
			var oldIdx = parseInt(marks[1].substring(5));//get old "idx"
			if(oldIdx != c.index){
				marks[1] = "idx=\"" + c.index + "\"";
				c.markup[2] = marks.join(" ");
			}
		});
		
		this.grid.setupHeaderMenu();
		//this.grid.renderOnIdle();
	},

	setColumnVisibility: function(columnIndex, visible){
		var cell = this.cells[columnIndex];
		if(cell.hidden == visible){
			cell.hidden = !visible;
			var v = cell.view, w = v.viewWidth;
			if(w && w != "auto"){
				v._togglingColumn = dojo.marginBox(cell.getHeaderNode()).w || 0;
			}
			v.update();
			return true;
		}else{
			return false;
		}
	},
	
	addCellDef: function(inRowIndex, inCellIndex, inDef){
		var self = this;
		var getCellWidth = function(inDef){
			var w = 0;
			if(inDef.colSpan > 1){
				w = 0;
			}else{
				w = inDef.width || self._defaultCellProps.width || self.defaultWidth;

				if(!isNaN(w)){
					w = w + "em";
				}
			}
			return w;
		};

		var props = {
			grid: this.grid,
			subrow: inRowIndex,
			layoutIndex: inCellIndex,
			index: this.cells.length
		};

		if(inDef && inDef instanceof dojox.grid.cells._Base){
			var new_cell = dojo.clone(inDef);
			props.unitWidth = getCellWidth(new_cell._props);
			new_cell = dojo.mixin(new_cell, this._defaultCellProps, inDef._props, props);
			return new_cell;
		}

		var cell_type = inDef.type || inDef.cellType || this._defaultCellProps.type || this._defaultCellProps.cellType || dojox.grid.cells.Cell;

		props.unitWidth = getCellWidth(inDef);
		return new cell_type(dojo.mixin({}, this._defaultCellProps, inDef, props));
	},
	
	addRowDef: function(inRowIndex, inDef){
		var result = [];
		var relSum = 0, pctSum = 0, doRel = true;
		for(var i=0, def, cell; (def=inDef[i]); i++){
			cell = this.addCellDef(inRowIndex, i, def);
			result.push(cell);
			this.cells.push(cell);
			// Check and calculate the sum of all relative widths
			if(doRel && cell.relWidth){
				relSum += cell.relWidth;
			}else if(cell.width){
				var w = cell.width;
				if(typeof w == "string" && w.slice(-1) == "%"){
					pctSum += window.parseInt(w, 10);
				}else if(w == "auto"){
					// relative widths doesn't play nice with auto - since we
					// don't have a way of knowing how much space the auto is
					// supposed to take up.
					doRel = false;
				}
			}
		}
		if(relSum && doRel){
			// We have some kind of relWidths specified - so change them to %
			dojo.forEach(result, function(cell){
				if(cell.relWidth){
					cell.width = cell.unitWidth = ((cell.relWidth / relSum) * (100 - pctSum)) + "%";
				}
			});
		}
		return result;
	
	},

	addRowsDef: function(inDef){
		var result = [];
		if(dojo.isArray(inDef)){
			if(dojo.isArray(inDef[0])){
				for(var i=0, row; inDef && (row=inDef[i]); i++){
					result.push(this.addRowDef(i, row));
				}
			}else{
				result.push(this.addRowDef(0, inDef));
			}
		}
		return result;
	},
	
	addViewDef: function(inDef){
		this._defaultCellProps = inDef.defaultCell || {};
		if(inDef.width && inDef.width == "auto"){
			delete inDef.width;
		}
		return dojo.mixin({}, inDef, {cells: this.addRowsDef(inDef.rows || inDef.cells)});
	},
	
	setStructure: function(inStructure){
		this.fieldIndex = 0;
		this.cells = [];
		var s = this.structure = [];

		if(this.grid.rowSelector){
			var sel = { type: dojox._scopeName + ".grid._RowSelector" };

			if(dojo.isString(this.grid.rowSelector)){
				var width = this.grid.rowSelector;

				if(width == "false"){
					sel = null;
				}else if(width != "true"){
					sel['width'] = width;
				}
			}else{
				if(!this.grid.rowSelector){
					sel = null;
				}
			}

			if(sel){
				s.push(this.addViewDef(sel));
			}
		}

		var isCell = function(def){
			return ("name" in def || "field" in def || "get" in def);
		};

		var isRowDef = function(def){
			if(dojo.isArray(def)){
				if(dojo.isArray(def[0]) || isCell(def[0])){
					return true;
				}
			}
			return false;
		};

		var isView = function(def){
			return (def !== null && dojo.isObject(def) &&
					("cells" in def || "rows" in def || ("type" in def && !isCell(def))));
		};

		if(dojo.isArray(inStructure)){
			var hasViews = false;
			for(var i=0, st; (st=inStructure[i]); i++){
				if(isView(st)){
					hasViews = true;
					break;
				}
			}
			if(!hasViews){
				s.push(this.addViewDef({ cells: inStructure }));
			}else{
				for(i=0; (st=inStructure[i]); i++){
					if(isRowDef(st)){
						s.push(this.addViewDef({ cells: st }));
					}else if(isView(st)){
						s.push(this.addViewDef(st));
					}
				}
			}
		}else if(isView(inStructure)){
			// it's a view object
			s.push(this.addViewDef(inStructure));
		}

		this.cellCount = this.cells.length;
		this.grid.setupHeaderMenu();
	}
});

}

if(!dojo._hasResource["dojox.grid._ViewManager"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojox.grid._ViewManager"] = true;
dojo.provide("dojox.grid._ViewManager");

dojo.declare('dojox.grid._ViewManager', null, {
	// summary:
	//		A collection of grid views. Owned by grid and used internally for managing grid views.
	// description:
	//		Grid creates views automatically based on grid's layout structure.
	//		Users should typically not need to access individual views or the views collection directly.
	constructor: function(inGrid){
		this.grid = inGrid;
	},

	defaultWidth: 200,

	views: [],

	// operations
	resize: function(){
		this.onEach("resize");
	},

	render: function(){
		this.onEach("render");
	},

	// views
	addView: function(inView){
		inView.idx = this.views.length;
		this.views.push(inView);
	},

	destroyViews: function(){
		for(var i=0, v; v=this.views[i]; i++){
			v.destroy();
		}
		this.views = [];
	},

	getContentNodes: function(){
		var nodes = [];
		for(var i=0, v; v=this.views[i]; i++){
			nodes.push(v.contentNode);
		}
		return nodes;
	},

	forEach: function(inCallback){
		for(var i=0, v; v=this.views[i]; i++){
			inCallback(v, i);
		}
	},

	onEach: function(inMethod, inArgs){
		inArgs = inArgs || [];
		for(var i=0, v; v=this.views[i]; i++){
			if(inMethod in v){
				v[inMethod].apply(v, inArgs);
			}
		}
	},

	// layout
	normalizeHeaderNodeHeight: function(){
		var rowNodes = [];
		for(var i=0, v; (v=this.views[i]); i++){
			if(v.headerContentNode.firstChild){
				rowNodes.push(v.headerContentNode);
			}
		}
		this.normalizeRowNodeHeights(rowNodes);
	},

	normalizeRowNodeHeights: function(inRowNodes){
		var h = 0;
		var currHeights = [];
		if(this.grid.rowHeight){
			h = this.grid.rowHeight;
		}else{
			if(inRowNodes.length <= 1){
				// no need to normalize if we are the only one...
				return;
			}
			for(var i=0, n; (n=inRowNodes[i]); i++){
				// We only care about the height - so don't use marginBox.  This
				// depends on the container not having any margin (which it shouldn't)
				// Also - we only look up the height if the cell doesn't have the
				// dojoxGridNonNormalizedCell class (like for row selectors)
				if(!dojo.hasClass(n, "dojoxGridNonNormalizedCell")){
					currHeights[i] = n.firstChild.offsetHeight;
					h =  Math.max(h, currHeights[i]);
				}
			}
			h = (h >= 0 ? h : 0);
	
			//Work around odd FF3 rendering bug: #8864.
			//A one px increase fixes FireFox 3's rounding bug for fractional font sizes.
			if(dojo.isMoz && h){h++;}
		}
		for(i=0; (n=inRowNodes[i]); i++){
			if(currHeights[i] != h){
				n.firstChild.style.height = h + "px";
			}
		}
	},
	
	resetHeaderNodeHeight: function(){
		for(var i=0, v, n; (v=this.views[i]); i++){
			n = v.headerContentNode.firstChild;
			if(n){
				n.style.height = "";
			}
		}
	},

	renormalizeRow: function(inRowIndex){
		var rowNodes = [];
		for(var i=0, v, n; (v=this.views[i])&&(n=v.getRowNode(inRowIndex)); i++){
			n.firstChild.style.height = '';
			rowNodes.push(n);
		}
		this.normalizeRowNodeHeights(rowNodes);
	},

	getViewWidth: function(inIndex){
		return this.views[inIndex].getWidth() || this.defaultWidth;
	},

	// must be called after view widths are properly set or height can be miscalculated
	// if there are flex columns
	measureHeader: function(){
		// need to reset view header heights so they are properly measured.
		this.resetHeaderNodeHeight();
		this.forEach(function(inView){
			inView.headerContentNode.style.height = '';
		});
		var h = 0;
		// calculate maximum view header height
		this.forEach(function(inView){
			h = Math.max(inView.headerNode.offsetHeight, h);
		});
		return h;
	},

	measureContent: function(){
		var h = 0;
		this.forEach(function(inView){
			h = Math.max(inView.domNode.offsetHeight, h);
		});
		return h;
	},

	findClient: function(inAutoWidth){
		// try to use user defined client
		var c = this.grid.elasticView || -1;
		// attempt to find implicit client
		if(c < 0){
			for(var i=1, v; (v=this.views[i]); i++){
				if(v.viewWidth){
					for(i=1; (v=this.views[i]); i++){
						if(!v.viewWidth){
							c = i;
							break;
						}
					}
					break;
				}
			}
		}
		// client is in the middle by default
		if(c < 0){
			c = Math.floor(this.views.length / 2);
		}
		return c;
	},

	arrange: function(l, w){
		var i, v, vw, len = this.views.length;
		// find the client
		var c = (w <= 0 ? len : this.findClient());
		// layout views
		var setPosition = function(v, l){
			var ds = v.domNode.style;
			var hs = v.headerNode.style;

			if(!dojo._isBodyLtr()){
				ds.right = l + 'px';
				// fixed rtl, the scrollbar is on the right side in FF
				if (dojo.isMoz) {
					hs.right = l + v.getScrollbarWidth() + 'px';
					hs.width = parseInt(hs.width, 10) - v.getScrollbarWidth() + 'px';
				}else{
					hs.right = l + 'px';
				}
			}else{
				ds.left = l + 'px';
				hs.left = l + 'px';
			}
			ds.top = 0 + 'px';
			hs.top = 0;
		};
		// for views left of the client
		//BiDi TODO: The left and right should not appear in BIDI environment. Should be replaced with
		//leading and tailing concept.
		for(i=0; (v=this.views[i])&&(i<c); i++){
			// get width
			vw = this.getViewWidth(i);
			// process boxes
			v.setSize(vw, 0);
			setPosition(v, l);
			if(v.headerContentNode && v.headerContentNode.firstChild){
				vw = v.getColumnsWidth()+v.getScrollbarWidth();
			}else{
				vw = v.domNode.offsetWidth;
			}
			// update position
			l += vw;
		}
		// next view (is the client, i++ == c)
		i++;
		// start from the right edge
		var r = w;
		// for views right of the client (iterated from the right)
		for(var j=len-1; (v=this.views[j])&&(i<=j); j--){
			// get width
			vw = this.getViewWidth(j);
			// set size
			v.setSize(vw, 0);
			// measure in pixels
			vw = v.domNode.offsetWidth;
			// update position
			r -= vw;
			// set position
			setPosition(v, r);
		}
		if(c<len){
			v = this.views[c];
			// position the client box between left and right boxes
			vw = Math.max(1, r-l);
			// set size
			v.setSize(vw + 'px', 0);
			setPosition(v, l);
		}
		return l;
	},

	// rendering
	renderRow: function(inRowIndex, inNodes, skipRenorm){
		var rowNodes = [];
		for(var i=0, v, n, rowNode; (v=this.views[i])&&(n=inNodes[i]); i++){
			rowNode = v.renderRow(inRowIndex);
			n.appendChild(rowNode);
			rowNodes.push(rowNode);
		}
		if(!skipRenorm){
			this.normalizeRowNodeHeights(rowNodes);
		}
	},
	
	rowRemoved: function(inRowIndex){
		this.onEach("rowRemoved", [ inRowIndex ]);
	},
	
	// updating
	updateRow: function(inRowIndex, skipRenorm){
		for(var i=0, v; v=this.views[i]; i++){
			v.updateRow(inRowIndex);
		}
		if(!skipRenorm){
			this.renormalizeRow(inRowIndex);
		}
	},
	
	updateRowStyles: function(inRowIndex){
		this.onEach("updateRowStyles", [ inRowIndex ]);
	},
	
	// scrolling
	setScrollTop: function(inTop){
		var top = inTop;
		for(var i=0, v; v=this.views[i]; i++){
			top = v.setScrollTop(inTop);
			// Work around IE not firing scroll events that cause header offset
			// issues to occur.
			if(dojo.isIE && v.headerNode && v.scrollboxNode){
				v.headerNode.scrollLeft = v.scrollboxNode.scrollLeft;
			}
		}
		return top;
		//this.onEach("setScrollTop", [ inTop ]);
	},
	
	getFirstScrollingView: function(){
		// summary: Returns the first grid view with a scroll bar
		for(var i=0, v; (v=this.views[i]); i++){
			if(v.hasHScrollbar() || v.hasVScrollbar()){
				return v;
			}
		}
		return null;
	}
	
});

}

if(!dojo._hasResource["dojox.grid._RowManager"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojox.grid._RowManager"] = true;
dojo.provide("dojox.grid._RowManager");

(function(){
	var setStyleText = function(inNode, inStyleText){
		if(inNode.style.cssText == undefined){
			inNode.setAttribute("style", inStyleText);
		}else{
			inNode.style.cssText = inStyleText;
		}
	};

	dojo.declare("dojox.grid._RowManager", null, {
		//	Stores information about grid rows. Owned by grid and used internally.
		constructor: function(inGrid){
			this.grid = inGrid;
		},
		linesToEms: 2,
		overRow: -2,
		// styles
		prepareStylingRow: function(inRowIndex, inRowNode){
			return {
				index: inRowIndex,
				node: inRowNode,
				odd: Boolean(inRowIndex&1),
				selected: !!this.grid.selection.isSelected(inRowIndex),
				over: this.isOver(inRowIndex),
				customStyles: "",
				customClasses: "dojoxGridRow"
			};
		},
		styleRowNode: function(inRowIndex, inRowNode){
			var row = this.prepareStylingRow(inRowIndex, inRowNode);
			this.grid.onStyleRow(row);
			this.applyStyles(row);
		},
		applyStyles: function(inRow){
			var i = inRow;

			i.node.className = i.customClasses;
			var h = i.node.style.height;
			setStyleText(i.node, i.customStyles + ';' + (i.node._style||''));
			i.node.style.height = h;
		},
		updateStyles: function(inRowIndex){
			this.grid.updateRowStyles(inRowIndex);
		},
		// states and events
		setOverRow: function(inRowIndex){
			var last = this.overRow;
			this.overRow = inRowIndex;
			if((last!=this.overRow)&&(dojo.isString(last) || last >= 0)){
				this.updateStyles(last);
			}
			this.updateStyles(this.overRow);
		},
		isOver: function(inRowIndex){
			return (this.overRow == inRowIndex && !dojo.hasClass(this.grid.domNode, "dojoxGridColumnResizing"));
		}
	});
})();

}

if(!dojo._hasResource["dojox.grid._FocusManager"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojox.grid._FocusManager"] = true;
dojo.provide("dojox.grid._FocusManager");



// focus management
dojo.declare("dojox.grid._FocusManager", null, {
	// summary:
	//	Controls grid cell focus. Owned by grid and used internally for focusing.
	//	Note: grid cell actually receives keyboard input only when cell is being edited.
	constructor: function(inGrid){
		this.grid = inGrid;
		this.cell = null;
		this.rowIndex = -1;
		this._connects = [];
		this._headerConnects = [];
		this.headerMenu = this.grid.headerMenu;
		this._connects.push(dojo.connect(this.grid.domNode, "onfocus", this, "doFocus"));
		this._connects.push(dojo.connect(this.grid.domNode, "onblur", this, "doBlur"));
		this._connects.push(dojo.connect(this.grid.domNode, "oncontextmenu", this, "doContextMenu"));
		this._connects.push(dojo.connect(this.grid.lastFocusNode, "onfocus", this, "doLastNodeFocus"));
		this._connects.push(dojo.connect(this.grid.lastFocusNode, "onblur", this, "doLastNodeBlur"));
		this._connects.push(dojo.connect(this.grid,"_onFetchComplete", this, "_delayedCellFocus"));
		this._connects.push(dojo.connect(this.grid,"postrender", this, "_delayedHeaderFocus"));
	},
	destroy: function(){
		dojo.forEach(this._connects, dojo.disconnect);
		dojo.forEach(this._headerConnects, dojo.disconnect);
		delete this.grid;
		delete this.cell;
	},
	_colHeadNode: null,
	_colHeadFocusIdx: null,
	_contextMenuBindNode: null,
	tabbingOut: false,
	focusClass: "dojoxGridCellFocus",
	focusView: null,
	initFocusView: function(){
		this.focusView = this.grid.views.getFirstScrollingView() || this.focusView || this.grid.views.views[0];
		this._initColumnHeaders();
	},
	isFocusCell: function(inCell, inRowIndex){
		// summary:
		//	states if the given cell is focused
		// inCell: object
		//	grid cell object
		// inRowIndex: int
		//	grid row index
		// returns:
		//	true of the given grid cell is focused
		return (this.cell == inCell) && (this.rowIndex == inRowIndex);
	},
	isLastFocusCell: function(){
		if(this.cell){
			return (this.rowIndex == this.grid.rowCount-1) && (this.cell.index == this.grid.layout.cellCount-1);
		}
		return false;
	},
	isFirstFocusCell: function(){
		if(this.cell){
			return (this.rowIndex === 0) && (this.cell.index === 0);
		}
		return false;
	},
	isNoFocusCell: function(){
		return (this.rowIndex < 0) || !this.cell;
	},
	isNavHeader: function(){
		// summary:
		//	states whether currently navigating among column headers.
		// returns:
		//	true if focus is on a column header; false otherwise.
		return (!!this._colHeadNode);
	},
	getHeaderIndex: function(){
		// summary:
		//	if one of the column headers currently has focus, return its index.
		// returns:
		//	index of the focused column header, or -1 if none have focus.
		if(this._colHeadNode){
			return dojo.indexOf(this._findHeaderCells(), this._colHeadNode);
		}else{
			return -1;
		}
	},
	_focusifyCellNode: function(inBork){
		var n = this.cell && this.cell.getNode(this.rowIndex);
		if(n){
			dojo.toggleClass(n, this.focusClass, inBork);
			if(inBork){
				var sl = this.scrollIntoView();
				try{
					if(!this.grid.edit.isEditing()){
						dojox.grid.util.fire(n, "focus");
						if(sl){ this.cell.view.scrollboxNode.scrollLeft = sl; }
					}
				}catch(e){}
			}
		}
	},
	_delayedCellFocus: function(){
		if(this.isNavHeader()||!this.grid._focused){
				return;
		}
		var n = this.cell && this.cell.getNode(this.rowIndex);
		if(n){
			try{
				if(!this.grid.edit.isEditing()){
					dojo.toggleClass(n, this.focusClass, true);
					this.blurHeader();
					dojox.grid.util.fire(n, "focus");
				}
			}
			catch(e){}
		}
	},
	_delayedHeaderFocus: function(){
		if(this.isNavHeader()){
			this.focusHeader();
			this.grid.domNode.focus();
		}
	},
	_initColumnHeaders: function(){
		dojo.forEach(this._headerConnects, dojo.disconnect);
		this._headerConnects = [];
		var headers = this._findHeaderCells();
		for(var i = 0; i < headers.length; i++){
			this._headerConnects.push(dojo.connect(headers[i], "onfocus", this, "doColHeaderFocus"));
			this._headerConnects.push(dojo.connect(headers[i], "onblur", this, "doColHeaderBlur"));
		}
	},
	_findHeaderCells: function(){
		// This should be a one liner:
		//	dojo.query("th[tabindex=-1]", this.grid.viewsHeaderNode);
		// But there is a bug in dojo.query() for IE -- see trac #7037.
		var allHeads = dojo.query("th", this.grid.viewsHeaderNode);
		var headers = [];
		for (var i = 0; i < allHeads.length; i++){
			var aHead = allHeads[i];
			var hasTabIdx = dojo.hasAttr(aHead, "tabIndex");
			var tabindex = dojo.attr(aHead, "tabIndex");
			if (hasTabIdx && tabindex < 0) {
				headers.push(aHead);
			}
		}
		return headers;
	},
	_setActiveColHeader: function(/*Node*/colHeaderNode, /*Integer*/colFocusIdx, /*Integer*/ prevColFocusIdx){
		//console.log("setActiveColHeader() - colHeaderNode:colFocusIdx:prevColFocusIdx = " + colHeaderNode + ":" + colFocusIdx + ":" + prevColFocusIdx);
		dojo.attr(this.grid.domNode, "aria-activedescendant",colHeaderNode.id);
		if (prevColFocusIdx != null && prevColFocusIdx >= 0 && prevColFocusIdx != colFocusIdx){
			dojo.toggleClass(this._findHeaderCells()[prevColFocusIdx],this.focusClass,false);
		}
		dojo.toggleClass(colHeaderNode,this.focusClass, true);
		this._colHeadNode = colHeaderNode;
		this._colHeadFocusIdx = colFocusIdx;
		this._scrollHeader(this._colHeadFocusIdx);
	},
	scrollIntoView: function(){
		var info = (this.cell ? this._scrollInfo(this.cell) : null);
		if(!info || !info.s){
			return null;
		}
		var rt = this.grid.scroller.findScrollTop(this.rowIndex);
		// place cell within horizontal view
		if(info.n && info.sr){
			if(info.n.offsetLeft + info.n.offsetWidth > info.sr.l + info.sr.w){
				info.s.scrollLeft = info.n.offsetLeft + info.n.offsetWidth - info.sr.w;
			}else if(info.n.offsetLeft < info.sr.l){
				info.s.scrollLeft = info.n.offsetLeft;
			}
		}
		// place cell within vertical view
		if(info.r && info.sr){
			if(rt + info.r.offsetHeight > info.sr.t + info.sr.h){
				this.grid.setScrollTop(rt + info.r.offsetHeight - info.sr.h);
			}else if(rt < info.sr.t){
				this.grid.setScrollTop(rt);
			}
		}

		return info.s.scrollLeft;
	},
	_scrollInfo: function(cell, domNode){
		if(cell){
			var cl = cell,
				sbn = cl.view.scrollboxNode,
				sbnr = {
					w: sbn.clientWidth,
					l: sbn.scrollLeft,
					t: sbn.scrollTop,
					h: sbn.clientHeight
				},
				rn = cl.view.getRowNode(this.rowIndex);
			return {
				c: cl,
				s: sbn,
				sr: sbnr,
				n: (domNode ? domNode : cell.getNode(this.rowIndex)),
				r: rn
			};
		}
		return null;
	},
	_scrollHeader: function(currentIdx){
		var info = null;
		if(this._colHeadNode){
			var cell = this.grid.getCell(currentIdx);
			info = this._scrollInfo(cell, cell.getNode(0));
		}
		if(info && info.s && info.sr && info.n){
			// scroll horizontally as needed.
			var scroll = info.sr.l + info.sr.w;
			if(info.n.offsetLeft + info.n.offsetWidth > scroll){
				info.s.scrollLeft = info.n.offsetLeft + info.n.offsetWidth - info.sr.w;
			}else if(info.n.offsetLeft < info.sr.l){
				info.s.scrollLeft = info.n.offsetLeft;
			}else if(dojo.isIE <= 7 && cell && cell.view.headerNode){
				// Trac 7158: scroll dojoxGridHeader for IE7 and lower
				cell.view.headerNode.scrollLeft = info.s.scrollLeft;
			}
		}
	},
	_isHeaderHidden: function(){
		// summary:
		//		determine if the grid headers are hidden
		//		relies on documented technique of setting .dojoxGridHeader { display:none; }
		// returns: Boolean
		//		true if headers are hidden
		//		false if headers are not hidden
		
		var curView = this.focusView;
		if (!curView){
			// find one so we can determine if headers are hidden
			// there is no focusView after adding items to empty grid (test_data_grid_empty.html)
			for (var i = 0, cView; (cView = this.grid.views.views[i]); i++) {
				if(cView.headerNode ){
					curView=cView;
					break;
				}
			}
		}
		return (curView && dojo.getComputedStyle(curView.headerNode).display == "none");
	},
	colSizeAdjust: function (e, colIdx, delta){ // adjust the column specified by colIdx by the specified delta px
		var headers = this._findHeaderCells();
		var view = this.focusView;
		if (!view) {
			for (var i = 0, cView; (cView = this.grid.views.views[i]); i++) {
				// find first view with a tableMap in order to work with empty grid
				if(cView.header.tableMap.map ){
					view=cView;
					break;
				}
			}
		}
		var curHeader = headers[colIdx];
		if (!view || (colIdx == headers.length-1 && colIdx === 0)){
			return; // can't adjust single col. grid
		}
		view.content.baseDecorateEvent(e);
		// need to adjust event with header cell info since focus is no longer on header cell
		e.cellNode = curHeader; //this.findCellTarget(e.target, e.rowNode);
		e.cellIndex = view.content.getCellNodeIndex(e.cellNode);
		e.cell = (e.cellIndex >= 0 ? this.grid.getCell(e.cellIndex) : null);
		if (view.header.canResize(e)){
			var deltaObj = {
				l: delta
			};
			var drag = view.header.colResizeSetup(e,false);
			view.header.doResizeColumn(drag, null, deltaObj);
			view.update();
		}
	},
	styleRow: function(inRow){
		return;
	},
	setFocusIndex: function(inRowIndex, inCellIndex){
		// summary:
		//	focuses the given grid cell
		// inRowIndex: int
		//	grid row index
		// inCellIndex: int
		//	grid cell index
		this.setFocusCell(this.grid.getCell(inCellIndex), inRowIndex);
	},
	setFocusCell: function(inCell, inRowIndex){
		// summary:
		//	focuses the given grid cell
		// inCell: object
		//	grid cell object
		// inRowIndex: int
		//	grid row index
		if(inCell && !this.isFocusCell(inCell, inRowIndex)){
			this.tabbingOut = false;
			if (this._colHeadNode){
				this.blurHeader();
			}
			this._colHeadNode = this._colHeadFocusIdx = null;
			this.focusGridView();
			this._focusifyCellNode(false);
			this.cell = inCell;
			this.rowIndex = inRowIndex;
			this._focusifyCellNode(true);
		}
		// even if this cell isFocusCell, the document focus may need to be rejiggered
		// call opera on delay to prevent keypress from altering focus
		if(dojo.isOpera){
			setTimeout(dojo.hitch(this.grid, 'onCellFocus', this.cell, this.rowIndex), 1);
		}else{
			this.grid.onCellFocus(this.cell, this.rowIndex);
		}
	},
	next: function(){
		// summary:
		//	focus next grid cell
		if(this.cell){
			var row=this.rowIndex, col=this.cell.index+1, cc=this.grid.layout.cellCount-1, rc=this.grid.rowCount-1;
			if(col > cc){
				col = 0;
				row++;
			}
			if(row > rc){
				col = cc;
				row = rc;
			}
			if(this.grid.edit.isEditing()){ //when editing, only navigate to editable cells
				var nextCell = this.grid.getCell(col);
				if (!this.isLastFocusCell() && (!nextCell.editable ||
					this.grid.canEdit && !this.grid.canEdit(nextCell, row))){
					this.cell=nextCell;
					this.rowIndex=row;
					this.next();
					return;
				}
			}
			this.setFocusIndex(row, col);
		}
	},
	previous: function(){
		// summary:
		//	focus previous grid cell
		if(this.cell){
			var row=(this.rowIndex || 0), col=(this.cell.index || 0) - 1;
			if(col < 0){
				col = this.grid.layout.cellCount-1;
				row--;
			}
			if(row < 0){
				row = 0;
				col = 0;
			}
			if(this.grid.edit.isEditing()){ //when editing, only navigate to editable cells
				var prevCell = this.grid.getCell(col);
				if (!this.isFirstFocusCell() && !prevCell.editable){
					this.cell=prevCell;
					this.rowIndex=row;
					this.previous();
					return;
				}
			}
			this.setFocusIndex(row, col);
		}
	},
	move: function(inRowDelta, inColDelta) {
		// summary:
		//	focus grid cell or  simulate focus to column header based on position relative to current focus
		// inRowDelta: int
		// vertical distance from current focus
		// inColDelta: int
		// horizontal distance from current focus

		var colDir = inColDelta < 0 ? -1 : 1;
		// Handle column headers.
		if(this.isNavHeader()){
			var headers = this._findHeaderCells();
			var savedIdx = currentIdx = dojo.indexOf(headers, this._colHeadNode);
			currentIdx += inColDelta;
			while(currentIdx >=0 && currentIdx < headers.length && headers[currentIdx].style.display == "none"){
				// skip over hidden column headers
				currentIdx += colDir;
			}
			if((currentIdx >= 0) && (currentIdx < headers.length)){
				this._setActiveColHeader(headers[currentIdx],currentIdx, savedIdx);
			}
		}else{
			if(this.cell){
				// Handle grid proper.
				var sc = this.grid.scroller,
					r = this.rowIndex,
					rc = this.grid.rowCount-1,
					row = Math.min(rc, Math.max(0, r+inRowDelta));
				if(inRowDelta){
					if(inRowDelta>0){
						if(row > sc.getLastPageRow(sc.page)){
							//need to load additional data, let scroller do that
							this.grid.setScrollTop(this.grid.scrollTop+sc.findScrollTop(row)-sc.findScrollTop(r));
						}
					}else if(inRowDelta<0){
						if(row <= sc.getPageRow(sc.page)){
							//need to load additional data, let scroller do that
							this.grid.setScrollTop(this.grid.scrollTop-sc.findScrollTop(r)-sc.findScrollTop(row));
						}
					}
				}
				var cc = this.grid.layout.cellCount-1,
				i = this.cell.index,
				col = Math.min(cc, Math.max(0, i+inColDelta));
				var cell = this.grid.getCell(col);
				while(col>=0 && col < cc && cell && cell.hidden === true){
					// skip hidden cells
					col += colDir;
					cell = this.grid.getCell(col);
				}
				if (!cell || cell.hidden === true){
					// don't change col if would move to hidden
					col = i;
				}
				//skip hidden row|cell
				var n = cell.getNode(row);
				if(!n && inRowDelta){
					if((row + inRowDelta) >= 0 && (row + inRowDelta) <= rc){
						this.move(inRowDelta > 0 ? ++inRowDelta : --inRowDelta, inColDelta);
					}
					return;
				}else if((!n || dojo.style(n, "display") === "none") && inColDelta){
					if((col + inRowDelta) >= 0 && (col + inRowDelta) <= cc){
						this.move(inRowDelta, inColDelta > 0 ? ++inColDelta : --inColDelta);
					}
					return;
				}
				this.setFocusIndex(row, col);
				if(inRowDelta){
					this.grid.updateRow(r);
				}
			}
		}
	},
	previousKey: function(e){
		if(this.grid.edit.isEditing()){
			dojo.stopEvent(e);
			this.previous();
		}else if(!this.isNavHeader() && !this._isHeaderHidden()) {
			this.grid.domNode.focus(); // will call doFocus and set focus into header.
			dojo.stopEvent(e);
		}else{
			this.tabOut(this.grid.domNode);
			if (this._colHeadFocusIdx != null) { // clear grid header focus
				dojo.toggleClass(this._findHeaderCells()[this._colHeadFocusIdx], this.focusClass, false);
				this._colHeadFocusIdx = null;
			}
			this._focusifyCellNode(false);
		}
	},
	nextKey: function(e) {
		var isEmpty = (this.grid.rowCount === 0);
		if(e.target === this.grid.domNode && this._colHeadFocusIdx == null){
			this.focusHeader();
			dojo.stopEvent(e);
		}else if(this.isNavHeader()){
			// if tabbing from col header, then go to grid proper.
			this.blurHeader();
			if(!this.findAndFocusGridCell()){
				this.tabOut(this.grid.lastFocusNode);
			}
			this._colHeadNode = this._colHeadFocusIdx= null;
		}else if(this.grid.edit.isEditing()){
			dojo.stopEvent(e);
			this.next();
		}else{
			this.tabOut(this.grid.lastFocusNode);
		}
	},
	tabOut: function(inFocusNode){
		this.tabbingOut = true;
		inFocusNode.focus();
	},
	focusGridView: function(){
		dojox.grid.util.fire(this.focusView, "focus");
	},
	focusGrid: function(inSkipFocusCell){
		this.focusGridView();
		this._focusifyCellNode(true);
	},
	findAndFocusGridCell: function(){
		// summary:
		//		find the first focusable grid cell
		// returns: Boolean
		//		true if focus was set to a cell
		//		false if no cell found to set focus onto
		
		var didFocus = true;
		var isEmpty = (this.grid.rowCount === 0); // If grid is empty this.grid.rowCount == 0
		if (this.isNoFocusCell() && !isEmpty){
			var cellIdx = 0;
			var cell = this.grid.getCell(cellIdx);
			if (cell.hidden) {
				// if first cell isn't visible, use _colHeadFocusIdx
				// could also use a while loop to find first visible cell - not sure that is worth it
				cellIdx = this.isNavHeader() ? this._colHeadFocusIdx : 0;
			}
			this.setFocusIndex(0, cellIdx);
		}
		else if (this.cell && !isEmpty){
			if (this.focusView && !this.focusView.rowNodes[this.rowIndex]){
				// if rowNode for current index is undefined (likely as a result of a sort and because of #7304)
				// scroll to that row
				this.grid.scrollToRow(this.rowIndex);
			}
			this.focusGrid();
		}else {
			didFocus = false;
		}
		this._colHeadNode = this._colHeadFocusIdx= null;
		return didFocus;
	},
	focusHeader: function(){
		var headerNodes = this._findHeaderCells();
		var saveColHeadFocusIdx = this._colHeadFocusIdx;
		if (this._isHeaderHidden()){
			// grid header is hidden, focus a cell
			this.findAndFocusGridCell();
		}
		else if (!this._colHeadFocusIdx) {
			if (this.isNoFocusCell()) {
				this._colHeadFocusIdx = 0;
			}
			else {
				this._colHeadFocusIdx = this.cell.index;
			}
		}
		this._colHeadNode = headerNodes[this._colHeadFocusIdx];
		while(this._colHeadNode && this._colHeadFocusIdx >=0 && this._colHeadFocusIdx < headerNodes.length &&
				this._colHeadNode.style.display == "none"){
			// skip over hidden column headers
			this._colHeadFocusIdx++;
			this._colHeadNode = headerNodes[this._colHeadFocusIdx];
		}
		if(this._colHeadNode && this._colHeadNode.style.display != "none"){
			// Column header cells know longer receive actual focus.  So, for keyboard invocation of
			// contextMenu to work, the contextMenu must be bound to the grid.domNode rather than the viewsHeaderNode.
			// unbind the contextmenu from the viewsHeaderNode and to the grid when header cells are active.  Reset
			// the binding back to the viewsHeaderNode when header cells are no longer acive (in blurHeader) #10483
			if (this.headerMenu && this._contextMenuBindNode != this.grid.domNode){
				this.headerMenu.unBindDomNode(this.grid.viewsHeaderNode);
				this.headerMenu.bindDomNode(this.grid.domNode);
				this._contextMenuBindNode = this.grid.domNode;
			}
			this._setActiveColHeader(this._colHeadNode, this._colHeadFocusIdx, saveColHeadFocusIdx);
			this._scrollHeader(this._colHeadFocusIdx);
			this._focusifyCellNode(false);
		}else {
			// all col head nodes are hidden - focus the grid
			this.findAndFocusGridCell();
		}
	},
	blurHeader: function(){
		dojo.removeClass(this._colHeadNode, this.focusClass);
		dojo.removeAttr(this.grid.domNode,"aria-activedescendant");
		// reset contextMenu onto viewsHeaderNode so right mouse on header will invoke (see focusHeader)
		if (this.headerMenu && this._contextMenuBindNode == this.grid.domNode) {
			var viewsHeader = this.grid.viewsHeaderNode;
			this.headerMenu.unBindDomNode(this.grid.domNode);
			this.headerMenu.bindDomNode(viewsHeader);
			this._contextMenuBindNode = viewsHeader;
		}
	},
	doFocus: function(e){
		// trap focus only for grid dom node
		if(e && e.target != e.currentTarget){
			dojo.stopEvent(e);
			return;
		}
		// do not focus for scrolling if grid is about to blur
		if(!this.tabbingOut){
			this.focusHeader();
		}
		this.tabbingOut = false;
		dojo.stopEvent(e);
	},
	doBlur: function(e){
		dojo.stopEvent(e);	// FF2
	},
	doContextMenu: function(e){
	//stop contextMenu event if no header Menu to prevent default/browser contextMenu
		if (!this.headerMenu){
			dojo.stopEvent(e);
		}
	},
	doLastNodeFocus: function(e){
		if (this.tabbingOut){
			this._focusifyCellNode(false);
		}else if(this.grid.rowCount >0){
			if (this.isNoFocusCell()){
				this.setFocusIndex(0,0);
			}
			this._focusifyCellNode(true);
		}else {
			this.focusHeader();
		}
		this.tabbingOut = false;
		dojo.stopEvent(e);	 // FF2
	},
	doLastNodeBlur: function(e){
		dojo.stopEvent(e);	 // FF2
	},
	doColHeaderFocus: function(e){
		this._setActiveColHeader(e.target,dojo.attr(e.target, "idx"),this._colHeadFocusIdx);
		this._scrollHeader(this.getHeaderIndex());
		dojo.stopEvent(e);
	},
	doColHeaderBlur: function(e){
		dojo.toggleClass(e.target, this.focusClass, false);
	}
});

}

if(!dojo._hasResource["dojox.grid._EditManager"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojox.grid._EditManager"] = true;
dojo.provide("dojox.grid._EditManager");



dojo.declare("dojox.grid._EditManager", null, {
	// summary:
	//		Controls grid cell editing process. Owned by grid and used internally for editing.
	constructor: function(inGrid){
		// inGrid: dojox.Grid
		//		The dojox.Grid this editor should be attached to
		this.grid = inGrid;
		if(dojo.isIE){
			this.connections = [dojo.connect(document.body, "onfocus", dojo.hitch(this, "_boomerangFocus"))];
		}else{
			this.connections = [dojo.connect(this.grid, 'onBlur', this, 'apply')];
		}
	},
	
	info: {},

	destroy: function(){
		dojo.forEach(this.connections,dojo.disconnect);
	},

	cellFocus: function(inCell, inRowIndex){
		// summary:
		//		Invoke editing when cell is focused
		// inCell: cell object
		//		Grid cell object
		// inRowIndex: Integer
		//		Grid row index
		if(this.grid.singleClickEdit || this.isEditRow(inRowIndex)){
			// if same row or quick editing, edit
			this.setEditCell(inCell, inRowIndex);
		}else{
			// otherwise, apply any pending row edits
			this.apply();
		}
		// if dynamic or static editing...
		if(this.isEditing() || (inCell && inCell.editable && inCell.alwaysEditing)){
			// let the editor focus itself as needed
			this._focusEditor(inCell, inRowIndex);
		}
	},

	rowClick: function(e){
		if(this.isEditing() && !this.isEditRow(e.rowIndex)){
			this.apply();
		}
	},

	styleRow: function(inRow){
		if(inRow.index == this.info.rowIndex){
			inRow.customClasses += ' dojoxGridRowEditing';
		}
	},

	dispatchEvent: function(e){
		var c = e.cell, ed = (c && c["editable"]) ? c : 0;
		return ed && ed.dispatchEvent(e.dispatch, e);
	},

	// Editing
	isEditing: function(){
		// summary:
		//		Indicates editing state of the grid.
		// returns: Boolean
		//	 	True if grid is actively editing
		return this.info.rowIndex !== undefined;
	},

	isEditCell: function(inRowIndex, inCellIndex){
		// summary:
		//		Indicates if the given cell is being edited.
		// inRowIndex: Integer
		//		Grid row index
		// inCellIndex: Integer
		//		Grid cell index
		// returns: Boolean
		//	 	True if given cell is being edited
		return (this.info.rowIndex === inRowIndex) && (this.info.cell.index == inCellIndex);
	},

	isEditRow: function(inRowIndex){
		// summary:
		//		Indicates if the given row is being edited.
		// inRowIndex: Integer
		//		Grid row index
		// returns: Boolean
		//	 	True if given row is being edited
		return this.info.rowIndex === inRowIndex;
	},

	setEditCell: function(inCell, inRowIndex){
		// summary:
		//		Set the given cell to be edited
		// inRowIndex: Integer
		//		Grid row index
		// inCell: Object
		//		Grid cell object
		if(!this.isEditCell(inRowIndex, inCell.index) && this.grid.canEdit && this.grid.canEdit(inCell, inRowIndex)){
			this.start(inCell, inRowIndex, this.isEditRow(inRowIndex) || inCell.editable);
		}
	},

	_focusEditor: function(inCell, inRowIndex){
		dojox.grid.util.fire(inCell, "focus", [inRowIndex]);
	},

	focusEditor: function(){
		if(this.isEditing()){
			this._focusEditor(this.info.cell, this.info.rowIndex);
		}
	},

	// implement fix for focus boomerang effect on IE
	_boomerangWindow: 500,
	_shouldCatchBoomerang: function(){
		return this._catchBoomerang > new Date().getTime();
	},
	_boomerangFocus: function(){
		//console.log("_boomerangFocus");
		if(this._shouldCatchBoomerang()){
			// make sure we don't utterly lose focus
			this.grid.focus.focusGrid();
			// let the editor focus itself as needed
			this.focusEditor();
			// only catch once
			this._catchBoomerang = 0;
		}
	},
	_doCatchBoomerang: function(){
		// give ourselves a few ms to boomerang IE focus effects
		if(dojo.isIE){this._catchBoomerang = new Date().getTime() + this._boomerangWindow;}
	},
	// end boomerang fix API

	start: function(inCell, inRowIndex, inEditing){
		this.grid.beginUpdate();
		this.editorApply();
		if(this.isEditing() && !this.isEditRow(inRowIndex)){
			this.applyRowEdit();
			this.grid.updateRow(inRowIndex);
		}
		if(inEditing){
			this.info = { cell: inCell, rowIndex: inRowIndex };
			this.grid.doStartEdit(inCell, inRowIndex);
			this.grid.updateRow(inRowIndex);
		}else{
			this.info = {};
		}
		this.grid.endUpdate();
		// make sure we don't utterly lose focus
		this.grid.focus.focusGrid();
		// let the editor focus itself as needed
		this._focusEditor(inCell, inRowIndex);
		// give ourselves a few ms to boomerang IE focus effects
		this._doCatchBoomerang();
	},

	_editorDo: function(inMethod){
		var c = this.info.cell;
		//c && c.editor && c.editor[inMethod](c, this.info.rowIndex);
		if(c && c.editable){
			c[inMethod](this.info.rowIndex);
		}
	},

	editorApply: function(){
		this._editorDo("apply");
	},

	editorCancel: function(){
		this._editorDo("cancel");
	},

	applyCellEdit: function(inValue, inCell, inRowIndex){
		if(this.grid.canEdit(inCell, inRowIndex)){
			this.grid.doApplyCellEdit(inValue, inRowIndex, inCell.field);
		}
	},

	applyRowEdit: function(){
		this.grid.doApplyEdit(this.info.rowIndex, this.info.cell.field);
	},

	apply: function(){
		// summary:
		//		Apply a grid edit
		if(this.isEditing()){
			this.grid.beginUpdate();
			this.editorApply();
			this.applyRowEdit();
			this.info = {};
			this.grid.endUpdate();
			this.grid.focus.focusGrid();
			this._doCatchBoomerang();
		}
	},

	cancel: function(){
		// summary:
		//		Cancel a grid edit
		if(this.isEditing()){
			this.grid.beginUpdate();
			this.editorCancel();
			this.info = {};
			this.grid.endUpdate();
			this.grid.focus.focusGrid();
			this._doCatchBoomerang();
		}
	},

	save: function(inRowIndex, inView){
		// summary:
		//		Save the grid editing state
		// inRowIndex: Integer
		//		Grid row index
		// inView: Object
		//		Grid view
		var c = this.info.cell;
		if(this.isEditRow(inRowIndex) && (!inView || c.view==inView) && c.editable){
			c.save(c, this.info.rowIndex);
		}
	},

	restore: function(inView, inRowIndex){
		// summary:
		//		Restores the grid editing state
		// inRowIndex: Integer
		//		Grid row index
		// inView: Object
		//		Grid view
		var c = this.info.cell;
		if(this.isEditRow(inRowIndex) && c.view == inView && c.editable){
			c.restore(c, this.info.rowIndex);
		}
	}
});

}

if(!dojo._hasResource['dojox.grid.Selection']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['dojox.grid.Selection'] = true;
dojo.provide('dojox.grid.Selection');

dojo.declare("dojox.grid.Selection", null, {
	// summary:
	//		Manages row selection for grid. Owned by grid and used internally
	//		for selection. Override to implement custom selection.

	constructor: function(inGrid){
		this.grid = inGrid;
		this.selected = [];

		this.setMode(inGrid.selectionMode);
	},

	mode: 'extended',

	selected: null,
	updating: 0,
	selectedIndex: -1,

	setMode: function(mode){
		if(this.selected.length){
			this.deselectAll();
		}
		if(mode != 'extended' && mode != 'multiple' && mode != 'single' && mode != 'none'){
			this.mode = 'extended';
		}else{
			this.mode = mode;
		}
	},

	onCanSelect: function(inIndex){
		return this.grid.onCanSelect(inIndex);
	},

	onCanDeselect: function(inIndex){
		return this.grid.onCanDeselect(inIndex);
	},

	onSelected: function(inIndex){
	},

	onDeselected: function(inIndex){
	},

	//onSetSelected: function(inIndex, inSelect) { };
	onChanging: function(){
	},

	onChanged: function(){
	},

	isSelected: function(inIndex){
		if(this.mode == 'none'){
			return false;
		}
		return this.selected[inIndex];
	},

	getFirstSelected: function(){
		if(!this.selected.length||this.mode == 'none'){ return -1; }
		for(var i=0, l=this.selected.length; i<l; i++){
			if(this.selected[i]){
				return i;
			}
		}
		return -1;
	},

	getNextSelected: function(inPrev){
		if(this.mode == 'none'){ return -1; }
		for(var i=inPrev+1, l=this.selected.length; i<l; i++){
			if(this.selected[i]){
				return i;
			}
		}
		return -1;
	},

	getSelected: function(){
		var result = [];
		for(var i=0, l=this.selected.length; i<l; i++){
			if(this.selected[i]){
				result.push(i);
			}
		}
		return result;
	},

	getSelectedCount: function(){
		var c = 0;
		for(var i=0; i<this.selected.length; i++){
			if(this.selected[i]){
				c++;
			}
		}
		return c;
	},

	_beginUpdate: function(){
		if(this.updating === 0){
			this.onChanging();
		}
		this.updating++;
	},

	_endUpdate: function(){
		this.updating--;
		if(this.updating === 0){
			this.onChanged();
		}
	},

	select: function(inIndex){
		if(this.mode == 'none'){ return; }
		if(this.mode != 'multiple'){
			this.deselectAll(inIndex);
			this.addToSelection(inIndex);
		}else{
			this.toggleSelect(inIndex);
		}
	},

	addToSelection: function(inIndex){
		if(this.mode == 'none'){ return; }
		if(dojo.isArray(inIndex)){
			dojo.forEach(inIndex, this.addToSelection, this);
			return;
		}
		inIndex = Number(inIndex);
		if(this.selected[inIndex]){
			this.selectedIndex = inIndex;
		}else{
			if(this.onCanSelect(inIndex) !== false){
				this.selectedIndex = inIndex;
				var rowNode = this.grid.getRowNode(inIndex);
				if(rowNode){
					dojo.attr(rowNode,"aria-selected","true");
				}
				this._beginUpdate();
				this.selected[inIndex] = true;
				//this.grid.onSelected(inIndex);
				this.onSelected(inIndex);
				//this.onSetSelected(inIndex, true);
				this._endUpdate();
			}
		}
	},

	deselect: function(inIndex){
		if(this.mode == 'none'){ return; }
		if(dojo.isArray(inIndex)){
			dojo.forEach(inIndex, this.deselect, this);
			return;
		}
		inIndex = Number(inIndex);
		if(this.selectedIndex == inIndex){
			this.selectedIndex = -1;
		}
		if(this.selected[inIndex]){
			if(this.onCanDeselect(inIndex) === false){
				return;
			}
			var rowNode = this.grid.getRowNode(inIndex);
			if(rowNode){
				dojo.attr(rowNode,"aria-selected","false");
			}
			this._beginUpdate();
			delete this.selected[inIndex];
			//this.grid.onDeselected(inIndex);
			this.onDeselected(inIndex);
			//this.onSetSelected(inIndex, false);
			this._endUpdate();
		}
	},

	setSelected: function(inIndex, inSelect){
		this[(inSelect ? 'addToSelection' : 'deselect')](inIndex);
	},

	toggleSelect: function(inIndex){
		if(dojo.isArray(inIndex)){
			dojo.forEach(inIndex, this.toggleSelect, this);
			return;
		}
		this.setSelected(inIndex, !this.selected[inIndex]);
	},

	_range: function(inFrom, inTo, func){
		var s = (inFrom >= 0 ? inFrom : inTo), e = inTo;
		if(s > e){
			e = s;
			s = inTo;
		}
		for(var i=s; i<=e; i++){
			func(i);
		}
	},

	selectRange: function(inFrom, inTo){
		this._range(inFrom, inTo, dojo.hitch(this, "addToSelection"));
	},

	deselectRange: function(inFrom, inTo){
		this._range(inFrom, inTo, dojo.hitch(this, "deselect"));
	},

	insert: function(inIndex){
		this.selected.splice(inIndex, 0, false);
		if(this.selectedIndex >= inIndex){
			this.selectedIndex++;
		}
	},

	remove: function(inIndex){
		this.selected.splice(inIndex, 1);
		if(this.selectedIndex >= inIndex){
			this.selectedIndex--;
		}
	},

	deselectAll: function(inExcept){
		for(var i in this.selected){
			if((i!=inExcept)&&(this.selected[i]===true)){
				this.deselect(i);
			}
		}
	},

	clickSelect: function(inIndex, inCtrlKey, inShiftKey){
		if(this.mode == 'none'){ return; }
		this._beginUpdate();
		if(this.mode != 'extended'){
			this.select(inIndex);
		}else{
			var lastSelected = this.selectedIndex;
			if(!inCtrlKey){
				this.deselectAll(inIndex);
			}
			if(inShiftKey){
				this.selectRange(lastSelected, inIndex);
			}else if(inCtrlKey){
				this.toggleSelect(inIndex);
			}else{
				this.addToSelection(inIndex);
			}
		}
		this._endUpdate();
	},

	clickSelectEvent: function(e){
		this.clickSelect(e.rowIndex, dojo.isCopyKey(e), e.shiftKey);
	},

	clear: function(){
		this._beginUpdate();
		this.deselectAll();
		this._endUpdate();
	}
});

}

if(!dojo._hasResource["dojox.grid._Events"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojox.grid._Events"] = true;
dojo.provide("dojox.grid._Events");

dojo.declare("dojox.grid._Events", null, {
	// summary:
	//		_Grid mixin that provides default implementations for grid events.
	// description:
	//		Default synthetic events dispatched for _Grid. dojo.connect to events to
	//		retain default implementation or override them for custom handling.
	
	// cellOverClass: String
	// 		css class to apply to grid cells over which the cursor is placed.
	cellOverClass: "dojoxGridCellOver",
	
	onKeyEvent: function(e){
		// summary: top level handler for Key Events
		this.dispatchKeyEvent(e);
	},

	onContentEvent: function(e){
		// summary: Top level handler for Content events
		this.dispatchContentEvent(e);
	},

	onHeaderEvent: function(e){
		// summary: Top level handler for header events
		this.dispatchHeaderEvent(e);
	},

	onStyleRow: function(inRow){
		// summary:
		//		Perform row styling on a given row. Called whenever row styling is updated.
		//
		// inRow: Object
		// 		Object containing row state information: selected, true if the row is selcted; over:
		// 		true of the mouse is over the row; odd: true if the row is odd. Use customClasses and
		// 		customStyles to control row css classes and styles; both properties are strings.
		//
		// example: onStyleRow({ selected: true, over:true, odd:false })
		var i = inRow;
		i.customClasses += (i.odd?" dojoxGridRowOdd":"") + (i.selected?" dojoxGridRowSelected":"") + (i.over?" dojoxGridRowOver":"");
		this.focus.styleRow(inRow);
		this.edit.styleRow(inRow);
	},
	
	onKeyDown: function(e){
		// summary:
		// 		Grid key event handler. By default enter begins editing and applies edits, escape cancels an edit,
		// 		tab, shift-tab, and arrow keys move grid cell focus.
		if(e.altKey || e.metaKey){
			return;
		}
		var dk = dojo.keys;
		var colIdx;
		switch(e.keyCode){
			case dk.ESCAPE:
				this.edit.cancel();
				break;
			case dk.ENTER:
				if(!this.edit.isEditing()){
					colIdx = this.focus.getHeaderIndex();
					if(colIdx >= 0) {
						this.setSortIndex(colIdx);
						break;
					}else {
						this.selection.clickSelect(this.focus.rowIndex, dojo.isCopyKey(e), e.shiftKey);
					}
					dojo.stopEvent(e);
				}
				if(!e.shiftKey){
					var isEditing = this.edit.isEditing();
					this.edit.apply();
					if(!isEditing){
						this.edit.setEditCell(this.focus.cell, this.focus.rowIndex);
					}
				}
				if (!this.edit.isEditing()){
					var curView = this.focus.focusView || this.views.views[0];  //if no focusView than only one view
					curView.content.decorateEvent(e);
					this.onRowClick(e);
					dojo.stopEvent(e);
				}
				break;
			case dk.SPACE:
				if(!this.edit.isEditing()){
					colIdx = this.focus.getHeaderIndex();
					if(colIdx >= 0) {
						this.setSortIndex(colIdx);
						break;
					}else {
						this.selection.clickSelect(this.focus.rowIndex, dojo.isCopyKey(e), e.shiftKey);
					}
					dojo.stopEvent(e);
				}
				break;
			case dk.TAB:
				this.focus[e.shiftKey ? 'previousKey' : 'nextKey'](e);
				break;
			case dk.LEFT_ARROW:
			case dk.RIGHT_ARROW:
				if(!this.edit.isEditing()){
					var keyCode = e.keyCode;  // IE seems to lose after stopEvent when modifier keys
					dojo.stopEvent(e);
					colIdx = this.focus.getHeaderIndex();
					if (colIdx >= 0 && (e.shiftKey && e.ctrlKey)){
						this.focus.colSizeAdjust(e, colIdx, (keyCode == dk.LEFT_ARROW ? -1 : 1)*5);
					}
					else{
						var offset = (keyCode == dk.LEFT_ARROW) ? 1 : -1;
						if(dojo._isBodyLtr()){ offset *= -1; }
						this.focus.move(0, offset);
					}
				}
				break;
			case dk.UP_ARROW:
				if(!this.edit.isEditing() && this.focus.rowIndex !== 0){
					dojo.stopEvent(e);
					this.focus.move(-1, 0);
				}
				break;
			case dk.DOWN_ARROW:
				if(!this.edit.isEditing() && this.focus.rowIndex+1 != this.rowCount){
					dojo.stopEvent(e);
					this.focus.move(1, 0);
				}
				break;
			case dk.PAGE_UP:
				if(!this.edit.isEditing() && this.focus.rowIndex !== 0){
					dojo.stopEvent(e);
					if(this.focus.rowIndex != this.scroller.firstVisibleRow+1){
						this.focus.move(this.scroller.firstVisibleRow-this.focus.rowIndex, 0);
					}else{
						this.setScrollTop(this.scroller.findScrollTop(this.focus.rowIndex-1));
						this.focus.move(this.scroller.firstVisibleRow-this.scroller.lastVisibleRow+1, 0);
					}
				}
				break;
			case dk.PAGE_DOWN:
				if(!this.edit.isEditing() && this.focus.rowIndex+1 != this.rowCount){
					dojo.stopEvent(e);
					if(this.focus.rowIndex != this.scroller.lastVisibleRow-1){
						this.focus.move(this.scroller.lastVisibleRow-this.focus.rowIndex-1, 0);
					}else{
						this.setScrollTop(this.scroller.findScrollTop(this.focus.rowIndex+1));
						this.focus.move(this.scroller.lastVisibleRow-this.scroller.firstVisibleRow-1, 0);
					}
				}
				break;
			default:
				break;
		}
	},
	
	onMouseOver: function(e){
		// summary:
		//		Event fired when mouse is over the grid.
		// e: Event
		//		Decorated event object contains reference to grid, cell, and rowIndex
		e.rowIndex == -1 ? this.onHeaderCellMouseOver(e) : this.onCellMouseOver(e);
	},
	
	onMouseOut: function(e){
		// summary:
		//		Event fired when mouse moves out of the grid.
		// e: Event
		//		Decorated event object that contains reference to grid, cell, and rowIndex
		e.rowIndex == -1 ? this.onHeaderCellMouseOut(e) : this.onCellMouseOut(e);
	},
	
	onMouseDown: function(e){
		// summary:
		//		Event fired when mouse is down inside grid.
		// e: Event
		//		Decorated event object that contains reference to grid, cell, and rowIndex
		e.rowIndex == -1 ? this.onHeaderCellMouseDown(e) : this.onCellMouseDown(e);
	},
	
	onMouseOverRow: function(e){
		// summary:
		//		Event fired when mouse is over any row (data or header).
		// e: Event
		//		Decorated event object contains reference to grid, cell, and rowIndex
		if(!this.rows.isOver(e.rowIndex)){
			this.rows.setOverRow(e.rowIndex);
			e.rowIndex == -1 ? this.onHeaderMouseOver(e) : this.onRowMouseOver(e);
		}
	},
	onMouseOutRow: function(e){
		// summary:
		//		Event fired when mouse moves out of any row (data or header).
		// e: Event
		//		Decorated event object contains reference to grid, cell, and rowIndex
		if(this.rows.isOver(-1)){
			this.onHeaderMouseOut(e);
		}else if(!this.rows.isOver(-2)){
			this.rows.setOverRow(-2);
			this.onRowMouseOut(e);
		}
	},
	
	onMouseDownRow: function(e){
		// summary:
		//		Event fired when mouse is down inside grid row
		// e: Event
		//		Decorated event object that contains reference to grid, cell, and rowIndex
		if(e.rowIndex != -1)
			this.onRowMouseDown(e);
	},

	// cell events
	onCellMouseOver: function(e){
		// summary:
		//		Event fired when mouse is over a cell.
		// e: Event
		//		Decorated event object contains reference to grid, cell, and rowIndex
		if(e.cellNode){
			dojo.addClass(e.cellNode, this.cellOverClass);
		}
	},
	
	onCellMouseOut: function(e){
		// summary:
		//		Event fired when mouse moves out of a cell.
		// e: Event
		//		Decorated event object which contains reference to grid, cell, and rowIndex
		if(e.cellNode){
			dojo.removeClass(e.cellNode, this.cellOverClass);
		}
	},
	
	onCellMouseDown: function(e){
		// summary:
		//		Event fired when mouse is down in a header cell.
		// e: Event
		// 		Decorated event object which contains reference to grid, cell, and rowIndex
	},

	onCellClick: function(e){
		// summary:
		//		Event fired when a cell is clicked.
		// e: Event
		//		Decorated event object which contains reference to grid, cell, and rowIndex
		this._click[0] = this._click[1];
		this._click[1] = e;
		if(!this.edit.isEditCell(e.rowIndex, e.cellIndex)){
			this.focus.setFocusCell(e.cell, e.rowIndex);
		}
		this.onRowClick(e);
	},

	onCellDblClick: function(e){
		// summary:
		//		Event fired when a cell is double-clicked.
		// e: Event
		//		Decorated event object contains reference to grid, cell, and rowIndex
		if(this._click.length > 1 && dojo.isIE){
			this.edit.setEditCell(this._click[1].cell, this._click[1].rowIndex);
		}else if(this._click.length > 1 && this._click[0].rowIndex != this._click[1].rowIndex){
			this.edit.setEditCell(this._click[0].cell, this._click[0].rowIndex);
		}else{
			this.edit.setEditCell(e.cell, e.rowIndex);
		}
		this.onRowDblClick(e);
	},

	onCellContextMenu: function(e){
		// summary:
		//		Event fired when a cell context menu is accessed via mouse right click.
		// e: Event
		//		Decorated event object which contains reference to grid, cell, and rowIndex
		this.onRowContextMenu(e);
	},

	onCellFocus: function(inCell, inRowIndex){
		// summary:
		//		Event fired when a cell receives focus.
		// inCell: Object
		//		Cell object containing properties of the grid column.
		// inRowIndex: Integer
		//		Index of the grid row
		this.edit.cellFocus(inCell, inRowIndex);
	},

	// row events
	onRowClick: function(e){
		// summary:
		//		Event fired when a row is clicked.
		// e: Event
		//		Decorated event object which contains reference to grid, cell, and rowIndex
		this.edit.rowClick(e);
		this.selection.clickSelectEvent(e);
	},

	onRowDblClick: function(e){
		// summary:
		//		Event fired when a row is double clicked.
		// e: Event
		//		decorated event object which contains reference to grid, cell, and rowIndex
	},

	onRowMouseOver: function(e){
		// summary:
		//		Event fired when mouse moves over a data row.
		// e: Event
		//		Decorated event object which contains reference to grid, cell, and rowIndex
	},

	onRowMouseOut: function(e){
		// summary:
		//		Event fired when mouse moves out of a data row.
		// e: Event
		// 		Decorated event object contains reference to grid, cell, and rowIndex
	},
	
	onRowMouseDown: function(e){
		// summary:
		//		Event fired when mouse is down in a row.
		// e: Event
		// 		Decorated event object which contains reference to grid, cell, and rowIndex
	},

	onRowContextMenu: function(e){
		// summary:
		//		Event fired when a row context menu is accessed via mouse right click.
		// e: Event
		// 		Decorated event object which contains reference to grid, cell, and rowIndex
		dojo.stopEvent(e);
	},

	// header events
	onHeaderMouseOver: function(e){
		// summary:
		//		Event fired when mouse moves over the grid header.
		// e: Event
		// 		Decorated event object contains reference to grid, cell, and rowIndex
	},

	onHeaderMouseOut: function(e){
		// summary:
		//		Event fired when mouse moves out of the grid header.
		// e: Event
		// 		Decorated event object which contains reference to grid, cell, and rowIndex
	},

	onHeaderCellMouseOver: function(e){
		// summary:
		//		Event fired when mouse moves over a header cell.
		// e: Event
		// 		Decorated event object which contains reference to grid, cell, and rowIndex
		if(e.cellNode){
			dojo.addClass(e.cellNode, this.cellOverClass);
		}
	},

	onHeaderCellMouseOut: function(e){
		// summary:
		//		Event fired when mouse moves out of a header cell.
		// e: Event
		// 		Decorated event object which contains reference to grid, cell, and rowIndex
		if(e.cellNode){
			dojo.removeClass(e.cellNode, this.cellOverClass);
		}
	},
	
	onHeaderCellMouseDown: function(e) {
		// summary:
		//		Event fired when mouse is down in a header cell.
		// e: Event
		// 		Decorated event object which contains reference to grid, cell, and rowIndex
	},

	onHeaderClick: function(e){
		// summary:
		//		Event fired when the grid header is clicked.
		// e: Event
		// Decorated event object which contains reference to grid, cell, and rowIndex
	},

	onHeaderCellClick: function(e){
		// summary:
		//		Event fired when a header cell is clicked.
		// e: Event
		//		Decorated event object which contains reference to grid, cell, and rowIndex
		this.setSortIndex(e.cell.index);
		this.onHeaderClick(e);
	},

	onHeaderDblClick: function(e){
		// summary:
		//		Event fired when the grid header is double clicked.
		// e: Event
		//		Decorated event object which contains reference to grid, cell, and rowIndex
	},

	onHeaderCellDblClick: function(e){
		// summary:
		//		Event fired when a header cell is double clicked.
		// e: Event
		//		Decorated event object which contains reference to grid, cell, and rowIndex
		this.onHeaderDblClick(e);
	},

	onHeaderCellContextMenu: function(e){
		// summary:
		//		Event fired when a header cell context menu is accessed via mouse right click.
		// e: Event
		//		Decorated event object which contains reference to grid, cell, and rowIndex
		this.onHeaderContextMenu(e);
	},

	onHeaderContextMenu: function(e){
		// summary:
		//		Event fired when the grid header context menu is accessed via mouse right click.
		// e: Event
		//		Decorated event object which contains reference to grid, cell, and rowIndex
		if(!this.headerMenu){
			dojo.stopEvent(e);
		}
	},

	// editing
	onStartEdit: function(inCell, inRowIndex){
		// summary:
		//		Event fired when editing is started for a given grid cell
		// inCell: Object
		//		Cell object containing properties of the grid column.
		// inRowIndex: Integer
		//		Index of the grid row
	},

	onApplyCellEdit: function(inValue, inRowIndex, inFieldIndex){
		// summary:
		//		Event fired when editing is applied for a given grid cell
		// inValue: String
		//		Value from cell editor
		// inRowIndex: Integer
		//		Index of the grid row
		// inFieldIndex: Integer
		//		Index in the grid's data store
	},

	onCancelEdit: function(inRowIndex){
		// summary:
		//		Event fired when editing is cancelled for a given grid cell
		// inRowIndex: Integer
		//		Index of the grid row
	},

	onApplyEdit: function(inRowIndex){
		// summary:
		//		Event fired when editing is applied for a given grid row
		// inRowIndex: Integer
		//		Index of the grid row
	},

	onCanSelect: function(inRowIndex){
		// summary:
		//		Event to determine if a grid row may be selected
		// inRowIndex: Integer
		//		Index of the grid row
		// returns: Boolean
		//		true if the row can be selected
		return true;
	},

	onCanDeselect: function(inRowIndex){
		// summary:
		//		Event to determine if a grid row may be deselected
		// inRowIndex: Integer
		//		Index of the grid row
		// returns: Boolean
		//		true if the row can be deselected
		return true;
	},

	onSelected: function(inRowIndex){
		// summary:
		//		Event fired when a grid row is selected
		// inRowIndex: Integer
		//		Index of the grid row
		this.updateRowStyles(inRowIndex);
	},

	onDeselected: function(inRowIndex){
		// summary:
		//		Event fired when a grid row is deselected
		// inRowIndex: Integer
		//		Index of the grid row
		this.updateRowStyles(inRowIndex);
	},

	onSelectionChanged: function(){
	}
});

}

if(!dojo._hasResource["dojox.grid._Grid"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojox.grid._Grid"] = true;
dojo.provide("dojox.grid._Grid");




















(function(){
	// NOTE: this is for backwards compatibility with Dojo 1.3
	if(!dojo.isCopyKey){
		dojo.isCopyKey = dojo.dnd.getCopyKeyState;
	}
	/*=====
	dojox.grid.__CellDef = function(){
		//	name: String?
		//		The text to use in the header of the grid for this cell.
		//	get: Function?
		//		function(rowIndex){} rowIndex is of type Integer.  This
		//		function will be called when a cell	requests data.  Returns the
		//		unformatted data for the cell.
		//	value: String?
		//		If "get" is not specified, this is used as the data for the cell.
		//	defaultValue: String?
		//		If "get" and "value" aren't specified or if "get" returns an undefined
		//		value, this is used as the data for the cell.  "formatter" is not run
		//		on this if "get" returns an undefined value.
		//	formatter: Function?
		//		function(data, rowIndex){} data is of type anything, rowIndex
		//		is of type Integer.  This function will be called after the cell
		//		has its data but before it passes it back to the grid to render.
		//		Returns the formatted version of the cell's data.
		//	type: dojox.grid.cells._Base|Function?
		//		TODO
		//	editable: Boolean?
		//		Whether this cell should be editable or not.
		//	hidden: Boolean?
		//		If true, the cell will not be displayed.
		//	noresize: Boolean?
		//		If true, the cell will not be able to be resized.
		//	width: Integer|String?
		//		A CSS size.  If it's an Integer, the width will be in em's.
		//	colSpan: Integer?
		//		How many columns to span this cell.  Will not work in the first
		//		sub-row of cells.
		//	rowSpan: Integer?
		//		How many sub-rows to span this cell.
		//	styles: String?
		//		A string of styles to apply to both the header cell and main
		//		grid cells.  Must end in a ';'.
		//	headerStyles: String?
		//		A string of styles to apply to just the header cell.  Must end
		//		in a ';'
		//	cellStyles: String?
		//		A string of styles to apply to just the main grid cells.  Must
		//		end in a ';'
		//	classes: String?
		//		A space separated list of classes to apply to both the header
		//		cell and the main grid cells.
		//	headerClasses: String?
		//		A space separated list of classes to apply to just the header
		//		cell.
		//	cellClasses: String?
		//		A space separated list of classes to apply to just the main
		//		grid cells.
		//	attrs: String?
		//		A space separated string of attribute='value' pairs to add to
		//		the header cell element and main grid cell elements.
		this.name = name;
		this.value = value;
		this.get = get;
		this.formatter = formatter;
		this.type = type;
		this.editable = editable;
		this.hidden = hidden;
		this.width = width;
		this.colSpan = colSpan;
		this.rowSpan = rowSpan;
		this.styles = styles;
		this.headerStyles = headerStyles;
		this.cellStyles = cellStyles;
		this.classes = classes;
		this.headerClasses = headerClasses;
		this.cellClasses = cellClasses;
		this.attrs = attrs;
	}
	=====*/

	/*=====
	dojox.grid.__ViewDef = function(){
		//	noscroll: Boolean?
		//		If true, no scrollbars will be rendered without scrollbars.
		//	width: Integer|String?
		//		A CSS size.  If it's an Integer, the width will be in em's. If
		//		"noscroll" is true, this value is ignored.
		//	cells: dojox.grid.__CellDef[]|Array[dojox.grid.__CellDef[]]?
		//		The structure of the cells within this grid.
		//	type: String?
		//		A string containing the constructor of a subclass of
		//		dojox.grid._View.  If this is not specified, dojox.grid._View
		//		is used.
		//	defaultCell: dojox.grid.__CellDef?
		//		A cell definition with default values for all cells in this view.  If
		//		a property is defined in a cell definition in the "cells" array and
		//		this property, the cell definition's property will override this
		//		property's property.
		//	onBeforeRow: Function?
		//		function(rowIndex, cells){} rowIndex is of type Integer, cells
		//		is of type Array[dojox.grid.__CellDef[]].  This function is called
		//		before each row of data is rendered.  Before the header is
		//		rendered, rowIndex will be -1.  "cells" is a reference to the
		//		internal structure of this view's cells so any changes you make to
		//		it will persist between calls.
		//	onAfterRow: Function?
		//		function(rowIndex, cells, rowNode){} rowIndex is of type Integer, cells
		//		is of type Array[dojox.grid.__CellDef[]], rowNode is of type DOMNode.
		//		This function is called	after each row of data is rendered.  After the
		//		header is rendered, rowIndex will be -1.  "cells" is a reference to the
		//		internal structure of this view's cells so any changes you make to
		//		it will persist between calls.
		this.noscroll = noscroll;
		this.width = width;
		this.cells = cells;
		this.type = type;
		this.defaultCell = defaultCell;
		this.onBeforeRow = onBeforeRow;
		this.onAfterRow = onAfterRow;
	}
	=====*/

	dojo.declare('dojox.grid._Grid',
		[ dijit._Widget, dijit._Templated, dojox.grid._Events ],
		{
		// summary:
		// 		A grid widget with virtual scrolling, cell editing, complex rows,
		// 		sorting, fixed columns, sizeable columns, etc.
		//
		//	description:
		//		_Grid provides the full set of grid features without any
		//		direct connection to a data store.
		//
		//		The grid exposes a get function for the grid, or optionally
		//		individual columns, to populate cell contents.
		//
		//		The grid is rendered based on its structure, an object describing
		//		column and cell layout.
		//
		//	example:
		//		A quick sample:
		//
		//		define a get function
		//	|	function get(inRowIndex){ // called in cell context
		//	|		return [this.index, inRowIndex].join(', ');
		//	|	}
		//
		//		define the grid structure:
		//	|	var structure = [ // array of view objects
		//	|		{ cells: [// array of rows, a row is an array of cells
		//	|			[
		//	|				{ name: "Alpha", width: 6 },
		//	|				{ name: "Beta" },
		//	|				{ name: "Gamma", get: get }]
		//	|		]}
		//	|	];
		//
		//	|	<div id="grid"
		//	|		rowCount="100" get="get"
		//	|		structure="structure"
		//	|		dojoType="dojox.grid._Grid"></div>

		templateString:"<div hidefocus=\"hidefocus\" role=\"grid\" dojoAttachEvent=\"onmouseout:_mouseOut\">\n\t<div class=\"dojoxGridMasterHeader\" dojoAttachPoint=\"viewsHeaderNode\" role=\"presentation\"></div>\n\t<div class=\"dojoxGridMasterView\" dojoAttachPoint=\"viewsNode\" role=\"presentation\"></div>\n\t<div class=\"dojoxGridMasterMessages\" style=\"display: none;\" dojoAttachPoint=\"messagesNode\"></div>\n\t<span dojoAttachPoint=\"lastFocusNode\" tabindex=\"0\"></span>\n</div>\n",

		// classTag: String
		// 		CSS class applied to the grid's domNode
		classTag: 'dojoxGrid',

		// settings
		// rowCount: Integer
		//		Number of rows to display.
		rowCount: 5,

		// keepRows: Integer
		//		Number of rows to keep in the rendering cache.
		keepRows: 75,

		// rowsPerPage: Integer
		//		Number of rows to render at a time.
		rowsPerPage: 25,

		// autoWidth: Boolean
		//		If autoWidth is true, grid width is automatically set to fit the data.
		autoWidth: false,
		
		// initialWidth: String
		//		A css string to use to set our initial width (only used if autoWidth
		//		is true).  The first rendering of the grid will be this width, any
		//		resizing of columns, etc will result in the grid switching to
		//		autoWidth mode.  Note, this width will override any styling in a
		//		stylesheet or directly on the node.
		initialWidth: "",

		// autoHeight: Boolean|Integer
		//		If autoHeight is true, grid height is automatically set to fit the data.
		//		If it is an integer, the height will be automatically set to fit the data
		//		if there are fewer than that many rows - and the height will be set to show
		//		that many rows if there are more
		autoHeight: '',

		// rowHeight: Integer
		//		If rowHeight is set to a positive number, it will define the height of the rows
		//		in pixels. This can provide a significant performance advantage, since it
		//		eliminates the need to measure row sizes during rendering, which is one
		// 		the primary bottlenecks in the DataGrid's performance.
		rowHeight: 0,
		
		// autoRender: Boolean
		//		If autoRender is true, grid will render itself after initialization.
		autoRender: true,

		// defaultHeight: String
		//		default height of the grid, measured in any valid css unit.
		defaultHeight: '15em',
		
		// height: String
		//		explicit height of the grid, measured in any valid css unit.  This will be populated (and overridden)
		//		if the height: css attribute exists on the source node.
		height: '',

		// structure: dojox.grid.__ViewDef|dojox.grid.__ViewDef[]|dojox.grid.__CellDef[]|Array[dojox.grid.__CellDef[]]
		//		View layout defintion.
		structure: null,

		// elasticView: Integer
		//	Override defaults and make the indexed grid view elastic, thus filling available horizontal space.
		elasticView: -1,

		// singleClickEdit: boolean
		//		Single-click starts editing. Default is double-click
		singleClickEdit: false,

		// selectionMode: String
		//		Set the selection mode of grid's Selection.  Value must be 'single', 'multiple',
		//		or 'extended'.  Default is 'extended'.
		selectionMode: 'extended',

		// rowSelector: Boolean|String
		// 		If set to true, will add a row selector view to this grid.  If set to a CSS width, will add
		// 		a row selector of that width to this grid.
		rowSelector: '',

		// columnReordering: Boolean
		// 		If set to true, will add drag and drop reordering to views with one row of columns.
		columnReordering: false,

		// headerMenu: dijit.Menu
		// 		If set to a dijit.Menu, will use this as a context menu for the grid headers.
		headerMenu: null,

		// placeholderLabel: String
		// 		Label of placeholders to search for in the header menu to replace with column toggling
		// 		menu items.
		placeholderLabel: "GridColumns",
		
		// selectable: Boolean
		//		Set to true if you want to be able to select the text within the grid.
		selectable: false,
		
		// Used to store the last two clicks, to ensure double-clicking occurs based on the intended row
		_click: null,
		
		// loadingMessage: String
		//  Message that shows while the grid is loading
		loadingMessage: "<span class='dojoxGridLoading'>${loadingState}</span>",

		// errorMessage: String
		//  Message that shows when the grid encounters an error loading
		errorMessage: "<span class='dojoxGridError'>${errorState}</span>",

		// noDataMessage: String
		//  Message that shows if the grid has no data - wrap it in a
		//  span with class 'dojoxGridNoData' if you want it to be
		//  styled similar to the loading and error messages
		noDataMessage: "",
		
		// escapeHTMLInData: Boolean
		//		This will escape HTML brackets from the data to prevent HTML from
		// 		user-inputted data being rendered with may contain JavaScript and result in
		// 		XSS attacks. This is true by default, and it is recommended that it remain
		// 		true. Setting this to false will allow data to be displayed in the grid without
		// 		filtering, and should be only used if it is known that the data won't contain
		// 		malicious scripts. If HTML is needed in grid cells, it is recommended that
		// 		you use the formatter function to generate the HTML (the output of
		// 		formatter functions is not filtered, even with escapeHTMLInData set to true).
		escapeHTMLInData: true,
		
		// formatterScope: Object
		//		An object to execute format functions within.  If not set, the
		//		format functions will execute within the scope of the cell that
		//		has a format function.
		formatterScope: null,
		
		// editable: boolean
		// indicates if the grid contains editable cells, default is false
		// set to true if editable cell encountered during rendering
		editable: false,
		
		// private
		sortInfo: 0,
		themeable: true,
		_placeholders: null,

		// _layoutClass: Object
		//	The class to use for our layout - can be overridden by grid subclasses
		_layoutClass: dojox.grid._Layout,

		// initialization
		buildRendering: function(){
			this.inherited(arguments);
			if(!this.domNode.getAttribute('tabIndex')){
				this.domNode.tabIndex = "0";
			}
			this.createScroller();
			this.createLayout();
			this.createViews();
			this.createManagers();

			this.createSelection();

			this.connect(this.selection, "onSelected", "onSelected");
			this.connect(this.selection, "onDeselected", "onDeselected");
			this.connect(this.selection, "onChanged", "onSelectionChanged");

			dojox.html.metrics.initOnFontResize();
			this.connect(dojox.html.metrics, "onFontResize", "textSizeChanged");
			dojox.grid.util.funnelEvents(this.domNode, this, 'doKeyEvent', dojox.grid.util.keyEvents);
			if (this.selectionMode != "none") {
				dojo.attr(this.domNode, "aria-multiselectable", this.selectionMode == "single" ? "false" : "true");
			}

			dojo.addClass(this.domNode, this.classTag);
			if(!this.isLeftToRight()){
				dojo.addClass(this.domNode, this.classTag+"Rtl");
			}
		},
		
		postMixInProperties: function(){
			this.inherited(arguments);
			var messages = dojo.i18n.getLocalization("dijit", "loading", this.lang);
			this.loadingMessage = dojo.string.substitute(this.loadingMessage, messages);
			this.errorMessage = dojo.string.substitute(this.errorMessage, messages);
			if(this.srcNodeRef && this.srcNodeRef.style.height){
				this.height = this.srcNodeRef.style.height;
			}
			// Call this to update our autoheight to start out
			this._setAutoHeightAttr(this.autoHeight, true);
			this.lastScrollTop = this.scrollTop = 0;
		},
		
		postCreate: function(){
			this._placeholders = [];
			this._setHeaderMenuAttr(this.headerMenu);
			this._setStructureAttr(this.structure);
			this._click = [];
			this.inherited(arguments);
			if(this.domNode && this.autoWidth && this.initialWidth){
				this.domNode.style.width = this.initialWidth;
			}
			if (this.domNode && !this.editable){
				// default value for aria-readonly is false, set to true if grid is not editable
				dojo.attr(this.domNode,"aria-readonly", "true");
			}
		},

		destroy: function(){
			this.domNode.onReveal = null;
			this.domNode.onSizeChange = null;

			// Fixes IE domNode leak
			delete this._click;

			this.edit.destroy();
			delete this.edit;

			this.views.destroyViews();
			if(this.scroller){
				this.scroller.destroy();
				delete this.scroller;
			}
			if(this.focus){
				this.focus.destroy();
				delete this.focus;
			}
			if(this.headerMenu&&this._placeholders.length){
				dojo.forEach(this._placeholders, function(p){ p.unReplace(true); });
				this.headerMenu.unBindDomNode(this.viewsHeaderNode);
			}
			this.inherited(arguments);
		},

		_setAutoHeightAttr: function(ah, skipRender){
			// Calculate our autoheight - turn it into a boolean or an integer
			if(typeof ah == "string"){
				if(!ah || ah == "false"){
					ah = false;
				}else if (ah == "true"){
					ah = true;
				}else{
					ah = window.parseInt(ah, 10);
				}
			}
			if(typeof ah == "number"){
				if(isNaN(ah)){
					ah = false;
				}
				// Autoheight must be at least 1, if it's a number.  If it's
				// less than 0, we'll take that to mean "all" rows (same as
				// autoHeight=true - if it is equal to zero, we'll take that
				// to mean autoHeight=false
				if(ah < 0){
					ah = true;
				}else if (ah === 0){
					ah = false;
				}
			}
			this.autoHeight = ah;
			if(typeof ah == "boolean"){
				this._autoHeight = ah;
			}else if(typeof ah == "number"){
				this._autoHeight = (ah >= this.get('rowCount'));
			}else{
				this._autoHeight = false;
			}
			if(this._started && !skipRender){
				this.render();
			}
		},

		_getRowCountAttr: function(){
			return this.updating && this.invalidated && this.invalidated.rowCount != undefined ?
				this.invalidated.rowCount : this.rowCount;
		},
		
		textSizeChanged: function(){
			this.render();
		},

		sizeChange: function(){
			this.update();
		},

		createManagers: function(){
			// summary:
			//		create grid managers for various tasks including rows, focus, selection, editing

			// row manager
			this.rows = new dojox.grid._RowManager(this);
			// focus manager
			this.focus = new dojox.grid._FocusManager(this);
			// edit manager
			this.edit = new dojox.grid._EditManager(this);
		},

		createSelection: function(){
			// summary:	Creates a new Grid selection manager.

			// selection manager
			this.selection = new dojox.grid.Selection(this);
		},

		createScroller: function(){
			// summary: Creates a new virtual scroller
			this.scroller = new dojox.grid._Scroller();
			this.scroller.grid = this;
			this.scroller.renderRow = dojo.hitch(this, "renderRow");
			this.scroller.removeRow = dojo.hitch(this, "rowRemoved");
		},

		createLayout: function(){
			// summary: Creates a new Grid layout
			this.layout = new this._layoutClass(this);
			this.connect(this.layout, "moveColumn", "onMoveColumn");
		},

		onMoveColumn: function(){
			this.render();
		},
		
		onResizeColumn: function(/*int*/ cellIdx){
			// Called when a column is resized.
		},

		// views
		createViews: function(){
			this.views = new dojox.grid._ViewManager(this);
			this.views.createView = dojo.hitch(this, "createView");
		},

		createView: function(inClass, idx){
			var c = dojo.getObject(inClass);
			var view = new c({ grid: this, index: idx });
			this.viewsNode.appendChild(view.domNode);
			this.viewsHeaderNode.appendChild(view.headerNode);
			this.views.addView(view);
			dojo.attr(this.domNode, "align", dojo._isBodyLtr() ? 'left' : 'right');
			return view;
		},

		buildViews: function(){
			for(var i=0, vs; (vs=this.layout.structure[i]); i++){
				this.createView(vs.type || dojox._scopeName + ".grid._View", i).setStructure(vs);
			}
			this.scroller.setContentNodes(this.views.getContentNodes());
		},

		_setStructureAttr: function(structure){
			var s = structure;
			if(s && dojo.isString(s)){
				dojo.deprecated("dojox.grid._Grid.set('structure', 'objVar')", "use dojox.grid._Grid.set('structure', objVar) instead", "2.0");
				s=dojo.getObject(s);
			}
			this.structure = s;
			if(!s){
				if(this.layout.structure){
					s = this.layout.structure;
				}else{
					return;
				}
			}
			this.views.destroyViews();
			this.focus.focusView = null;
			if(s !== this.layout.structure){
				this.layout.setStructure(s);
			}
			this._structureChanged();
		},

		setStructure: function(/* dojox.grid.__ViewDef|dojox.grid.__ViewDef[]|dojox.grid.__CellDef[]|Array[dojox.grid.__CellDef[]] */ inStructure){
			// summary:
			//		Install a new structure and rebuild the grid.
			dojo.deprecated("dojox.grid._Grid.setStructure(obj)", "use dojox.grid._Grid.set('structure', obj) instead.", "2.0");
			this._setStructureAttr(inStructure);
		},
		
		getColumnTogglingItems: function(){
			// Summary: returns an array of dijit.CheckedMenuItem widgets that can be
			//		added to a menu for toggling columns on and off.
			return dojo.map(this.layout.cells, function(cell){
				if(!cell.menuItems){ cell.menuItems = []; }

				var self = this;
				var item = new dijit.CheckedMenuItem({
					label: cell.name,
					checked: !cell.hidden,
					_gridCell: cell,
					onChange: function(checked){
						if(self.layout.setColumnVisibility(this._gridCell.index, checked)){
							var items = this._gridCell.menuItems;
							if(items.length > 1){
								dojo.forEach(items, function(item){
									if(item !== this){
										item.setAttribute("checked", checked);
									}
								}, this);
							}
							checked = dojo.filter(self.layout.cells, function(c){
								if(c.menuItems.length > 1){
									dojo.forEach(c.menuItems, "item.set('disabled', false);");
								}else{
									c.menuItems[0].set('disabled', false);
								}
								return !c.hidden;
							});
							if(checked.length == 1){
								dojo.forEach(checked[0].menuItems, "item.set('disabled', true);");
							}
						}
					},
					destroy: function(){
						var index = dojo.indexOf(this._gridCell.menuItems, this);
						this._gridCell.menuItems.splice(index, 1);
						delete this._gridCell;
						dijit.CheckedMenuItem.prototype.destroy.apply(this, arguments);
					}
				});
				cell.menuItems.push(item);
				return item;
			}, this); // dijit.CheckedMenuItem[]
		},

		_setHeaderMenuAttr: function(menu){
			if(this._placeholders && this._placeholders.length){
				dojo.forEach(this._placeholders, function(p){
					p.unReplace(true);
				});
				this._placeholders = [];
			}
			if(this.headerMenu){
				this.headerMenu.unBindDomNode(this.viewsHeaderNode);
			}
			this.headerMenu = menu;
			if(!menu){ return; }

			this.headerMenu.bindDomNode(this.viewsHeaderNode);
			if(this.headerMenu.getPlaceholders){
				this._placeholders = this.headerMenu.getPlaceholders(this.placeholderLabel);
			}
		},

		setHeaderMenu: function(/* dijit.Menu */ menu){
			dojo.deprecated("dojox.grid._Grid.setHeaderMenu(obj)", "use dojox.grid._Grid.set('headerMenu', obj) instead.", "2.0");
			this._setHeaderMenuAttr(menu);
		},
		
		setupHeaderMenu: function(){
			if(this._placeholders && this._placeholders.length){
				dojo.forEach(this._placeholders, function(p){
					if(p._replaced){
						p.unReplace(true);
					}
					p.replace(this.getColumnTogglingItems());
				}, this);
			}
		},

		_fetch: function(start){
			this.setScrollTop(0);
		},

		getItem: function(inRowIndex){
			return null;
		},
		
		showMessage: function(message){
			if(message){
				this.messagesNode.innerHTML = message;
				this.messagesNode.style.display = "";
			}else{
				this.messagesNode.innerHTML = "";
				this.messagesNode.style.display = "none";
			}
		},

		_structureChanged: function() {
			this.buildViews();
			if(this.autoRender && this._started){
				this.render();
			}
		},

		hasLayout: function() {
			return this.layout.cells.length;
		},

		// sizing
		resize: function(changeSize, resultSize){
			// summary:
			//		Update the grid's rendering dimensions and resize it
			
			// Calling sizeChange calls update() which calls _resize...so let's
			// save our input values, if any, and use them there when it gets
			// called.  This saves us an extra call to _resize(), which can
			// get kind of heavy.
			this._pendingChangeSize = changeSize;
			this._pendingResultSize = resultSize;
			this.sizeChange();
		},

		_getPadBorder: function() {
			this._padBorder = this._padBorder || dojo._getPadBorderExtents(this.domNode);
			return this._padBorder;
		},

		_getHeaderHeight: function(){
			var vns = this.viewsHeaderNode.style, t = vns.display == "none" ? 0 : this.views.measureHeader();
			vns.height = t + 'px';
			// header heights are reset during measuring so must be normalized after measuring.
			this.views.normalizeHeaderNodeHeight();
			return t;
		},
		
		_resize: function(changeSize, resultSize){
			// Restore our pending values, if any
			changeSize = changeSize || this._pendingChangeSize;
			resultSize = resultSize || this._pendingResultSize;
			delete this._pendingChangeSize;
			delete this._pendingResultSize;
			// if we have set up everything except the DOM, we cannot resize
			if(!this.domNode){ return; }
			var pn = this.domNode.parentNode;
			if(!pn || pn.nodeType != 1 || !this.hasLayout() || pn.style.visibility == "hidden" || pn.style.display == "none"){
				return;
			}
			// useful measurement
			var padBorder = this._getPadBorder();
			var hh = undefined;
			var h;
			// grid height
			if(this._autoHeight){
				this.domNode.style.height = 'auto';
			}else if(typeof this.autoHeight == "number"){
				h = hh = this._getHeaderHeight();
				h += (this.scroller.averageRowHeight * this.autoHeight);
				this.domNode.style.height = h + "px";
			}else if(this.domNode.clientHeight <= padBorder.h){
				if(pn == document.body){
					this.domNode.style.height = this.defaultHeight;
				}else if(this.height){
					this.domNode.style.height = this.height;
				}else{
					this.fitTo = "parent";
				}
			}
			// if we are given dimensions, size the grid's domNode to those dimensions
			if(resultSize){
				changeSize = resultSize;
			}
			if(changeSize){
				dojo.marginBox(this.domNode, changeSize);
				this.height = this.domNode.style.height;
				delete this.fitTo;
			}else if(this.fitTo == "parent"){
				h = this._parentContentBoxHeight = this._parentContentBoxHeight || dojo._getContentBox(pn).h;
				this.domNode.style.height = Math.max(0, h) + "px";
			}
			
			var hasFlex = dojo.some(this.views.views, function(v){ return v.flexCells; });

			if(!this._autoHeight && (h || dojo._getContentBox(this.domNode).h) === 0){
				// We need to hide the header, since the Grid is essentially hidden.
				this.viewsHeaderNode.style.display = "none";
			}else{
				// Otherwise, show the header and give it an appropriate height.
				this.viewsHeaderNode.style.display = "block";
				if(!hasFlex && hh === undefined){
					hh = this._getHeaderHeight();
				}
			}
			if(hasFlex){
				hh = undefined;
			}

			// NOTE: it is essential that width be applied before height
			// Header height can only be calculated properly after view widths have been set.
			// This is because flex column width is naturally 0 in Firefox.
			// Therefore prior to width sizing flex columns with spaces are maximally wrapped
			// and calculated to be too tall.
			this.adaptWidth();
			this.adaptHeight(hh);

			this.postresize();
		},

		adaptWidth: function() {
			// private: sets width and position for views and update grid width if necessary
			var doAutoWidth = (!this.initialWidth && this.autoWidth);
			var w = doAutoWidth ? 0 : this.domNode.clientWidth || (this.domNode.offsetWidth - this._getPadBorder().w),
				vw = this.views.arrange(1, w);
			this.views.onEach("adaptWidth");
			if(doAutoWidth){
				this.domNode.style.width = vw + "px";
			}
		},

		adaptHeight: function(inHeaderHeight){
			// private: measures and normalizes header height, then sets view heights, and then updates scroller
			// content extent
			var t = inHeaderHeight === undefined ? this._getHeaderHeight() : inHeaderHeight;
			var h = (this._autoHeight ? -1 : Math.max(this.domNode.clientHeight - t, 0) || 0);
			this.views.onEach('setSize', [0, h]);
			this.views.onEach('adaptHeight');
			if(!this._autoHeight){
				var numScroll = 0, numNoScroll = 0;
				var noScrolls = dojo.filter(this.views.views, function(v){
					var has = v.hasHScrollbar();
					if(has){ numScroll++; }else{ numNoScroll++; }
					return (!has);
				});
				if(numScroll > 0 && numNoScroll > 0){
					dojo.forEach(noScrolls, function(v){
						v.adaptHeight(true);
					});
				}
			}
			if(this.autoHeight === true || h != -1 || (typeof this.autoHeight == "number" && this.autoHeight >= this.get('rowCount'))){
				this.scroller.windowHeight = h;
			}else{
				this.scroller.windowHeight = Math.max(this.domNode.clientHeight - t, 0);
			}
		},

		// startup
		startup: function(){
			if(this._started){return;}
			this.inherited(arguments);
			if(this.autoRender){
				this.render();
			}
		},

		// render
		render: function(){
			// summary:
			//	Render the grid, headers, and views. Edit and scrolling states are reset. To retain edit and
			// scrolling states, see Update.

			if(!this.domNode){return;}
			if(!this._started){return;}

			if(!this.hasLayout()) {
				this.scroller.init(0, this.keepRows, this.rowsPerPage);
				return;
			}
			//
			this.update = this.defaultUpdate;
			this._render();
		},

		_render: function(){
			this.scroller.init(this.get('rowCount'), this.keepRows, this.rowsPerPage);
			this.prerender();
			this.setScrollTop(0);
			this.postrender();
		},

		prerender: function(){
			// if autoHeight, make sure scroller knows not to virtualize; everything must be rendered.
			this.keepRows = this._autoHeight ? 0 : this.keepRows;
			this.scroller.setKeepInfo(this.keepRows);
			this.views.render();
			this._resize();
		},

		postrender: function(){
			this.postresize();
			this.focus.initFocusView();
			// make rows unselectable
			dojo.setSelectable(this.domNode, this.selectable);
		},

		postresize: function(){
			// views are position absolute, so they do not inflate the parent
			if(this._autoHeight){
				var size = Math.max(this.views.measureContent()) + 'px';
				
				this.viewsNode.style.height = size;
			}
		},

		renderRow: function(inRowIndex, inNodes){
			// summary: private, used internally to render rows
			this.views.renderRow(inRowIndex, inNodes, this._skipRowRenormalize);
		},

		rowRemoved: function(inRowIndex){
			// summary: private, used internally to remove rows
			this.views.rowRemoved(inRowIndex);
		},

		invalidated: null,

		updating: false,

		beginUpdate: function(){
			// summary:
			//		Use to make multiple changes to rows while queueing row updating.
			// NOTE: not currently supporting nested begin/endUpdate calls
			this.invalidated = [];
			this.updating = true;
		},

		endUpdate: function(){
			// summary:
			//		Use after calling beginUpdate to render any changes made to rows.
			this.updating = false;
			var i = this.invalidated, r;
			if(i.all){
				this.update();
			}else if(i.rowCount != undefined){
				this.updateRowCount(i.rowCount);
			}else{
				for(r in i){
					this.updateRow(Number(r));
				}
			}
			this.invalidated = [];
		},

		// update
		defaultUpdate: function(){
			// note: initial update calls render and subsequently this function.
			if(!this.domNode){return;}
			if(this.updating){
				this.invalidated.all = true;
				return;
			}
			//this.edit.saveState(inRowIndex);
			this.lastScrollTop = this.scrollTop;
			this.prerender();
			this.scroller.invalidateNodes();
			this.setScrollTop(this.lastScrollTop);
			this.postrender();
			//this.edit.restoreState(inRowIndex);
		},

		update: function(){
			// summary:
			//		Update the grid, retaining edit and scrolling states.
			this.render();
		},

		updateRow: function(inRowIndex){
			// summary:
			//		Render a single row.
			// inRowIndex: Integer
			//		Index of the row to render
			inRowIndex = Number(inRowIndex);
			if(this.updating){
				this.invalidated[inRowIndex]=true;
			}else{
				this.views.updateRow(inRowIndex);
				this.scroller.rowHeightChanged(inRowIndex);
			}
		},

		updateRows: function(startIndex, howMany){
			// summary:
			//		Render consecutive rows at once.
			// startIndex: Integer
			//		Index of the starting row to render
			// howMany: Integer
			//		How many rows to update.
			startIndex = Number(startIndex);
			howMany = Number(howMany);
			var i;
			if(this.updating){
				for(i=0; i<howMany; i++){
					this.invalidated[i+startIndex]=true;
				}
			}else{
				for(i=0; i<howMany; i++){
					this.views.updateRow(i+startIndex, this._skipRowRenormalize);
				}
				this.scroller.rowHeightChanged(startIndex);
			}
		},

		updateRowCount: function(inRowCount){
			//summary:
			//	Change the number of rows.
			// inRowCount: int
			//	Number of rows in the grid.
			if(this.updating){
				this.invalidated.rowCount = inRowCount;
			}else{
				this.rowCount = inRowCount;
				this._setAutoHeightAttr(this.autoHeight, true);
				if(this.layout.cells.length){
					this.scroller.updateRowCount(inRowCount);
				}
				this._resize();
				if(this.layout.cells.length){
					this.setScrollTop(this.scrollTop);
				}
			}
		},

		updateRowStyles: function(inRowIndex){
			// summary:
			//		Update the styles for a row after it's state has changed.
			this.views.updateRowStyles(inRowIndex);
		},
		getRowNode: function(inRowIndex){
			// summary:
			//		find the rowNode that is not a rowSelector
			if (this.focus.focusView && !(this.focus.focusView instanceof dojox.grid._RowSelector)){
					return this.focus.focusView.rowNodes[inRowIndex];
			}else{ // search through views
				for (var i = 0, cView; (cView = this.views.views[i]); i++) {
					if (!(cView instanceof dojox.grid._RowSelector)) {
						return cView.rowNodes[inRowIndex];
					}
				}
			}
			return null;
		},
		rowHeightChanged: function(inRowIndex){
			// summary:
			//		Update grid when the height of a row has changed. Row height is handled automatically as rows
			//		are rendered. Use this function only to update a row's height outside the normal rendering process.
			// inRowIndex: Integer
			// 		index of the row that has changed height

			this.views.renormalizeRow(inRowIndex);
			this.scroller.rowHeightChanged(inRowIndex);
		},

		// fastScroll: Boolean
		//		flag modifies vertical scrolling behavior. Defaults to true but set to false for slower
		//		scroll performance but more immediate scrolling feedback
		fastScroll: true,

		delayScroll: false,

		// scrollRedrawThreshold: int
		//	pixel distance a user must scroll vertically to trigger grid scrolling.
		scrollRedrawThreshold: (dojo.isIE ? 100 : 50),

		// scroll methods
		scrollTo: function(inTop){
			// summary:
			//		Vertically scroll the grid to a given pixel position
			// inTop: Integer
			//		vertical position of the grid in pixels
			if(!this.fastScroll){
				this.setScrollTop(inTop);
				return;
			}
			var delta = Math.abs(this.lastScrollTop - inTop);
			this.lastScrollTop = inTop;
			if(delta > this.scrollRedrawThreshold || this.delayScroll){
				this.delayScroll = true;
				this.scrollTop = inTop;
				this.views.setScrollTop(inTop);
				if(this._pendingScroll){
					window.clearTimeout(this._pendingScroll);
				}
				var _this = this;
				this._pendingScroll = window.setTimeout(function(){
					delete _this._pendingScroll;
					_this.finishScrollJob();
				}, 200);
			}else{
				this.setScrollTop(inTop);
			}
		},

		finishScrollJob: function(){
			this.delayScroll = false;
			this.setScrollTop(this.scrollTop);
		},

		setScrollTop: function(inTop){
			this.scroller.scroll(this.views.setScrollTop(inTop));
		},

		scrollToRow: function(inRowIndex){
			// summary:
			//		Scroll the grid to a specific row.
			// inRowIndex: Integer
			// 		grid row index
			this.setScrollTop(this.scroller.findScrollTop(inRowIndex) + 1);
		},

		// styling (private, used internally to style individual parts of a row)
		styleRowNode: function(inRowIndex, inRowNode){
			if(inRowNode){
				this.rows.styleRowNode(inRowIndex, inRowNode);
			}
		},
		
		// called when the mouse leaves the grid so we can deselect all hover rows
		_mouseOut: function(e){
			this.rows.setOverRow(-2);
		},
	
		// cells
		getCell: function(inIndex){
			// summary:
			//		Retrieves the cell object for a given grid column.
			// inIndex: Integer
			// 		Grid column index of cell to retrieve
			// returns:
			//		a grid cell
			return this.layout.cells[inIndex];
		},

		setCellWidth: function(inIndex, inUnitWidth){
			this.getCell(inIndex).unitWidth = inUnitWidth;
		},

		getCellName: function(inCell){
			// summary: Returns the cell name of a passed cell
			return "Cell " + inCell.index; // String
		},

		// sorting
		canSort: function(inSortInfo){
			// summary:
			//		Determines if the grid can be sorted
			// inSortInfo: Integer
			//		Sort information, 1-based index of column on which to sort, positive for an ascending sort
			// 		and negative for a descending sort
			// returns: Boolean
			//		True if grid can be sorted on the given column in the given direction
		},

		sort: function(){
		},

		getSortAsc: function(inSortInfo){
			// summary:
			//		Returns true if grid is sorted in an ascending direction.
			inSortInfo = inSortInfo == undefined ? this.sortInfo : inSortInfo;
			return Boolean(inSortInfo > 0); // Boolean
		},

		getSortIndex: function(inSortInfo){
			// summary:
			//		Returns the index of the column on which the grid is sorted
			inSortInfo = inSortInfo == undefined ? this.sortInfo : inSortInfo;
			return Math.abs(inSortInfo) - 1; // Integer
		},

		setSortIndex: function(inIndex, inAsc){
			// summary:
			// 		Sort the grid on a column in a specified direction
			// inIndex: Integer
			// 		Column index on which to sort.
			// inAsc: Boolean
			// 		If true, sort the grid in ascending order, otherwise in descending order
			var si = inIndex +1;
			if(inAsc != undefined){
				si *= (inAsc ? 1 : -1);
			} else if(this.getSortIndex() == inIndex){
				si = -this.sortInfo;
			}
			this.setSortInfo(si);
		},

		setSortInfo: function(inSortInfo){
			if(this.canSort(inSortInfo)){
				this.sortInfo = inSortInfo;
				this.sort();
				this.update();
			}
		},

		// DOM event handler
		doKeyEvent: function(e){
			e.dispatch = 'do' + e.type;
			this.onKeyEvent(e);
		},

		// event dispatch
		//: protected
		_dispatch: function(m, e){
			if(m in this){
				return this[m](e);
			}
			return false;
		},

		dispatchKeyEvent: function(e){
			this._dispatch(e.dispatch, e);
		},

		dispatchContentEvent: function(e){
			this.edit.dispatchEvent(e) || e.sourceView.dispatchContentEvent(e) || this._dispatch(e.dispatch, e);
		},

		dispatchHeaderEvent: function(e){
			e.sourceView.dispatchHeaderEvent(e) || this._dispatch('doheader' + e.type, e);
		},

		dokeydown: function(e){
			this.onKeyDown(e);
		},

		doclick: function(e){
			if(e.cellNode){
				this.onCellClick(e);
			}else{
				this.onRowClick(e);
			}
		},

		dodblclick: function(e){
			if(e.cellNode){
				this.onCellDblClick(e);
			}else{
				this.onRowDblClick(e);
			}
		},

		docontextmenu: function(e){
			if(e.cellNode){
				this.onCellContextMenu(e);
			}else{
				this.onRowContextMenu(e);
			}
		},

		doheaderclick: function(e){
			if(e.cellNode){
				this.onHeaderCellClick(e);
			}else{
				this.onHeaderClick(e);
			}
		},

		doheaderdblclick: function(e){
			if(e.cellNode){
				this.onHeaderCellDblClick(e);
			}else{
				this.onHeaderDblClick(e);
			}
		},

		doheadercontextmenu: function(e){
			if(e.cellNode){
				this.onHeaderCellContextMenu(e);
			}else{
				this.onHeaderContextMenu(e);
			}
		},

		// override to modify editing process
		doStartEdit: function(inCell, inRowIndex){
			this.onStartEdit(inCell, inRowIndex);
		},

		doApplyCellEdit: function(inValue, inRowIndex, inFieldIndex){
			this.onApplyCellEdit(inValue, inRowIndex, inFieldIndex);
		},

		doCancelEdit: function(inRowIndex){
			this.onCancelEdit(inRowIndex);
		},

		doApplyEdit: function(inRowIndex){
			this.onApplyEdit(inRowIndex);
		},

		// row editing
		addRow: function(){
			// summary:
			//		Add a row to the grid.
			this.updateRowCount(this.get('rowCount')+1);
		},

		removeSelectedRows: function(){
			// summary:
			//		Remove the selected rows from the grid.
			if(this.allItemsSelected){
				this.updateRowCount(0);
			}else{
				this.updateRowCount(Math.max(0, this.get('rowCount') - this.selection.getSelected().length));
			}
			this.selection.clear();
		}

	});

	dojox.grid._Grid.markupFactory = function(props, node, ctor, cellFunc){
		var d = dojo;
		var widthFromAttr = function(n){
			var w = d.attr(n, "width")||"auto";
			if((w != "auto")&&(w.slice(-2) != "em")&&(w.slice(-1) != "%")){
				w = parseInt(w, 10)+"px";
			}
			return w;
		};
		// if(!props.store){ console.debug("no store!"); }
		// if a structure isn't referenced, do we have enough
		// data to try to build one automatically?
		if(	!props.structure &&
			node.nodeName.toLowerCase() == "table"){

			// try to discover a structure
			props.structure = d.query("> colgroup", node).map(function(cg){
				var sv = d.attr(cg, "span");
				var v = {
					noscroll: (d.attr(cg, "noscroll") == "true") ? true : false,
					__span: (!!sv ? parseInt(sv, 10) : 1),
					cells: []
				};
				if(d.hasAttr(cg, "width")){
					v.width = widthFromAttr(cg);
				}
				return v; // for vendetta
			});
			if(!props.structure.length){
				props.structure.push({
					__span: Infinity,
					cells: [] // catch-all view
				});
			}
			// check to see if we're gonna have more than one view

			// for each tr in our th, create a row of cells
			d.query("thead > tr", node).forEach(function(tr, tr_idx){
				var cellCount = 0;
				var viewIdx = 0;
				var lastViewIdx;
				var cView = null;
				d.query("> th", tr).map(function(th){
					// what view will this cell go into?

					// NOTE:
					//		to prevent extraneous iteration, we start counters over
					//		for each row, incrementing over the surface area of the
					//		structure that colgroup processing generates and
					//		creating cell objects for each <th> to place into those
					//		cell groups.  There's a lot of state-keepking logic
					//		here, but it is what it has to be.
					if(!cView){ // current view book keeping
						lastViewIdx = 0;
						cView = props.structure[0];
					}else if(cellCount >= (lastViewIdx+cView.__span)){
						viewIdx++;
						// move to allocating things into the next view
						lastViewIdx += cView.__span;
						var lastView = cView;
						cView = props.structure[viewIdx];
					}

					// actually define the cell from what markup hands us
					var cell = {
						name: d.trim(d.attr(th, "name")||th.innerHTML),
						colSpan: parseInt(d.attr(th, "colspan")||1, 10),
						type: d.trim(d.attr(th, "cellType")||""),
						id: d.trim(d.attr(th,"id")||"")
					};
					cellCount += cell.colSpan;
					var rowSpan = d.attr(th, "rowspan");
					if(rowSpan){
						cell.rowSpan = rowSpan;
					}
					if(d.hasAttr(th, "width")){
						cell.width = widthFromAttr(th);
					}
					if(d.hasAttr(th, "relWidth")){
						cell.relWidth = window.parseInt(dojo.attr(th, "relWidth"), 10);
					}
					if(d.hasAttr(th, "hidden")){
						cell.hidden = (d.attr(th, "hidden") == "true" || d.attr(th, "hidden") === true/*always boolean true in Chrome*/);
					}

					if(cellFunc){
						cellFunc(th, cell);
					}

					cell.type = cell.type ? dojo.getObject(cell.type) : dojox.grid.cells.Cell;

					if(cell.type && cell.type.markupFactory){
						cell.type.markupFactory(th, cell);
					}

					if(!cView.cells[tr_idx]){
						cView.cells[tr_idx] = [];
					}
					cView.cells[tr_idx].push(cell);
				});
			});
		}

		return new ctor(props, node);
	};
})();

}

if(!dojo._hasResource["dojox.grid.DataSelection"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojox.grid.DataSelection"] = true;
dojo.provide("dojox.grid.DataSelection");


dojo.declare("dojox.grid.DataSelection", dojox.grid.Selection, {
	getFirstSelected: function(){
		var idx = dojox.grid.Selection.prototype.getFirstSelected.call(this);

		if(idx == -1){ return null; }
		return this.grid.getItem(idx);
	},

	getNextSelected: function(inPrev){
		var old_idx = this.grid.getItemIndex(inPrev);
		var idx = dojox.grid.Selection.prototype.getNextSelected.call(this, old_idx);

		if(idx == -1){ return null; }
		return this.grid.getItem(idx);
	},

	getSelected: function(){
		var result = [];
		for(var i=0, l=this.selected.length; i<l; i++){
			if(this.selected[i]){
				result.push(this.grid.getItem(i));
			}
		}
		return result;
	},

	addToSelection: function(inItemOrIndex){
		if(this.mode == 'none'){ return; }
		var idx = null;
		if(typeof inItemOrIndex == "number" || typeof inItemOrIndex == "string"){
			idx = inItemOrIndex;
		}else{
			idx = this.grid.getItemIndex(inItemOrIndex);
		}
		dojox.grid.Selection.prototype.addToSelection.call(this, idx);
	},

	deselect: function(inItemOrIndex){
		if(this.mode == 'none'){ return; }
		var idx = null;
		if(typeof inItemOrIndex == "number" || typeof inItemOrIndex == "string"){
			idx = inItemOrIndex;
		}else{
			idx = this.grid.getItemIndex(inItemOrIndex);
		}
		dojox.grid.Selection.prototype.deselect.call(this, idx);
	},

	deselectAll: function(inItemOrIndex){
		var idx = null;
		if(inItemOrIndex || typeof inItemOrIndex == "number"){
			if(typeof inItemOrIndex == "number" || typeof inItemOrIndex == "string"){
				idx = inItemOrIndex;
			}else{
				idx = this.grid.getItemIndex(inItemOrIndex);
			}
			dojox.grid.Selection.prototype.deselectAll.call(this, idx);
		}else{
			this.inherited(arguments);
		}
	}
});

}

if(!dojo._hasResource["dojox.grid.DataGrid"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojox.grid.DataGrid"] = true;
dojo.provide("dojox.grid.DataGrid");




/*=====
dojo.declare("dojox.grid.__DataCellDef", dojox.grid.__CellDef, {
	constructor: function(){
		//	field: String?
		//		The attribute to read from the dojo.data item for the row.
		//  fields: String[]?
		//		An array of fields to grab the values of and pass as an array to the grid
		//	get: Function?
		//		function(rowIndex, item?){} rowIndex is of type Integer, item is of type
		//		Object.  This function will be called when a cell requests data.  Returns
		//		the unformatted data for the cell.
	}
});
=====*/

/*=====
dojo.declare("dojox.grid.__DataViewDef", dojox.grid.__ViewDef, {
	constructor: function(){
		//	cells: dojox.grid.__DataCellDef[]|Array[dojox.grid.__DataCellDef[]]?
		//		The structure of the cells within this grid.
		//	defaultCell: dojox.grid.__DataCellDef?
		//		A cell definition with default values for all cells in this view.  If
		//		a property is defined in a cell definition in the "cells" array and
		//		this property, the cell definition's property will override this
		//		property's property.
	}
});
=====*/

dojo.declare("dojox.grid.DataGrid", dojox.grid._Grid, {
	store: null,
	query: null,
	queryOptions: null,
	fetchText: '...',
	sortFields: null,
	
	// updateDelay: int
	//		Time, in milliseconds, to delay updates automatically so that multiple
	//		calls to onSet/onNew/onDelete don't keep rerendering the grid.  Set
	//		to 0 to immediately cause updates.  A higher value will result in
	//		better performance at the expense of responsiveness of the grid.
	updateDelay: 1,

/*=====
	// structure: dojox.grid.__DataViewDef|dojox.grid.__DataViewDef[]|dojox.grid.__DataCellDef[]|Array[dojox.grid.__DataCellDef[]]
	//		View layout defintion.
	structure: '',
=====*/

	// You can specify items instead of a query, if you like.  They do not need
	// to be loaded - but the must be items in the store
	items: null,
	
	_store_connects: null,
	_by_idty: null,
	_by_idx: null,
	_cache: null,
	_pages: null,
	_pending_requests: null,
	_bop: -1,
	_eop: -1,
	_requests: 0,
	rowCount: 0,

	_isLoaded: false,
	_isLoading: false,
	
	postCreate: function(){
		this._pages = [];
		this._store_connects = [];
		this._by_idty = {};
		this._by_idx = [];
		this._cache = [];
		this._pending_requests = {};

		this._setStore(this.store);
		this.inherited(arguments);
	},

	createSelection: function(){
		this.selection = new dojox.grid.DataSelection(this);
	},

	get: function(inRowIndex, inItem){
		// summary: Default data getter.
		// description:
		//		Provides data to display in a grid cell. Called in grid cell context.
		//		So this.cell.index is the column index.
		// inRowIndex: Integer
		//		Row for which to provide data
		// returns:
		//		Data to display for a given grid cell.
		
		if(inItem && this.field == "_item" && !this.fields){
			return inItem;
		}else if(inItem && this.fields){
			var ret = [];
			var s = this.grid.store;
			dojo.forEach(this.fields, function(f){
				ret = ret.concat(s.getValues(inItem, f));
			});
			return ret;
		}else if(!inItem && typeof inRowIndex === "string"){
			return this.inherited(arguments);
		}
		return (!inItem ? this.defaultValue : (!this.field ? this.value : (this.field == "_item" ? inItem : this.grid.store.getValue(inItem, this.field))));
	},

	_checkUpdateStatus: function(){
		if(this.updateDelay > 0){
			var iStarted = false;
			if(this._endUpdateDelay){
				clearTimeout(this._endUpdateDelay);
				delete this._endUpdateDelay;
				iStarted = true;
			}
			if(!this.updating){
				this.beginUpdate();
				iStarted = true;
			}
			if(iStarted){
				var _this = this;
				this._endUpdateDelay = setTimeout(function(){
					delete _this._endUpdateDelay;
					_this.endUpdate();
				}, this.updateDelay);
			}
		}
	},
	
	_onSet: function(item, attribute, oldValue, newValue){
		this._checkUpdateStatus();
		var idx = this.getItemIndex(item);
		if(idx>-1){
			this.updateRow(idx);
		}
	},
	
	_createItem: function(item, index){
		var idty = this._hasIdentity ? this.store.getIdentity(item) : dojo.toJson(this.query) + ":idx:" + index + ":sort:" + dojo.toJson(this.getSortProps());
		var o = this._by_idty[idty] = { idty: idty, item: item };
		return o;
	},

	_addItem: function(item, index, noUpdate){
		this._by_idx[index] = this._createItem(item, index);
		if(!noUpdate){
			this.updateRow(index);
		}
	},

	_onNew: function(item, parentInfo){
		this._checkUpdateStatus();
		var rowCount = this.get('rowCount');
		this._addingItem = true;
		this.updateRowCount(rowCount+1);
		this._addingItem = false;
		this._addItem(item, rowCount);
		this.showMessage();
	},

	_onDelete: function(item){
		this._checkUpdateStatus();
		var idx = this._getItemIndex(item, true);

		if(idx >= 0){
			// When a row is deleted, all rest rows are shifted down,
			// and migrate from page to page. If some page is not
			// loaded yet empty rows can migrate to initialized pages
			// without refreshing. It causes empty rows in some pages, see:
			// http://bugs.dojotoolkit.org/ticket/6818
			// this code fix this problem by reseting loaded page info
			this._pages = [];
			this._bop = -1;
			this._eop = -1;

			var o = this._by_idx[idx];
			this._by_idx.splice(idx, 1);
			delete this._by_idty[o.idty];
			this.updateRowCount(this.get('rowCount')-1);
			if(this.get('rowCount') === 0){
				this.showMessage(this.noDataMessage);
			}
		}
	},

	_onRevert: function(){
		this._refresh();
	},

	setStore: function(store, query, queryOptions){
		this._setQuery(query, queryOptions);
		this._setStore(store);
		this._refresh(true);
	},
	
	setQuery: function(query, queryOptions){
		this._setQuery(query, queryOptions);
		this._refresh(true);
	},
	
	setItems: function(items){
		this.items = items;
		this._setStore(this.store);
		this._refresh(true);
	},
	
	_setQuery: function(query, queryOptions){
		this.query = query;
		this.queryOptions = queryOptions || this.queryOptions;
	},

	_setStore: function(store){
		if(this.store && this._store_connects){
			dojo.forEach(this._store_connects, this.disconnect, this);
		}
		this.store = store;

		if(this.store){
			var f = this.store.getFeatures();
			var h = [];

			this._canEdit = !!f["dojo.data.api.Write"] && !!f["dojo.data.api.Identity"];
			this._hasIdentity = !!f["dojo.data.api.Identity"];

			if(!!f["dojo.data.api.Notification"] && !this.items){
				h.push(this.connect(this.store, "onSet", "_onSet"));
				h.push(this.connect(this.store, "onNew", "_onNew"));
				h.push(this.connect(this.store, "onDelete", "_onDelete"));
			}
			if(this._canEdit){
				h.push(this.connect(this.store, "revert", "_onRevert"));
			}

			this._store_connects = h;
		}
	},

	_onFetchBegin: function(size, req){
		if(!this.scroller){ return; }
		if(this.rowCount != size){
			if(req.isRender){
				this.scroller.init(size, this.keepRows, this.rowsPerPage);
				this.rowCount = size;
				this._setAutoHeightAttr(this.autoHeight, true);
				this._skipRowRenormalize = true;
				this.prerender();
				this._skipRowRenormalize = false;
			}else{
				this.updateRowCount(size);
			}
		}
		if(!size){
			this.views.render();
			this._resize();
			this.showMessage(this.noDataMessage);
			this.focus.initFocusView();
		}else{
			this.showMessage();
		}
	},

	_onFetchComplete: function(items, req){
		if(!this.scroller){ return; }
		if(items && items.length > 0){
			//console.log(items);
			dojo.forEach(items, function(item, idx){
				this._addItem(item, req.start+idx, true);
			}, this);
			this.updateRows(req.start, items.length);
			if(req.isRender){
				this.setScrollTop(0);
				this.postrender();
			}else if(this._lastScrollTop){
				this.setScrollTop(this._lastScrollTop);
			}
		}
		delete this._lastScrollTop;
		if(!this._isLoaded){
			this._isLoading = false;
			this._isLoaded = true;
		}
		this._pending_requests[req.start] = false;
	},

	_onFetchError: function(err, req){
		console.log(err);
		delete this._lastScrollTop;
		if(!this._isLoaded){
			this._isLoading = false;
			this._isLoaded = true;
			this.showMessage(this.errorMessage);
		}
		this._pending_requests[req.start] = false;
		this.onFetchError(err, req);
	},

	onFetchError: function(err, req){
	},

	_fetch: function(start, isRender){
		start = start || 0;
		if(this.store && !this._pending_requests[start]){
			if(!this._isLoaded && !this._isLoading){
				this._isLoading = true;
				this.showMessage(this.loadingMessage);
			}
			this._pending_requests[start] = true;
			//console.log("fetch: ", start);
			try{
				if(this.items){
					var items = this.items;
					var store = this.store;
					this.rowsPerPage = items.length;
					var req = {
						start: start,
						count: this.rowsPerPage,
						isRender: isRender
					};
					this._onFetchBegin(items.length, req);
					
					// Load them if we need to
					var waitCount = 0;
					dojo.forEach(items, function(i){
						if(!store.isItemLoaded(i)){ waitCount++; }
					});
					if(waitCount === 0){
						this._onFetchComplete(items, req);
					}else{
						var onItem = function(item){
							waitCount--;
							if(waitCount === 0){
								this._onFetchComplete(items, req);
							}
						};
						dojo.forEach(items, function(i){
							if(!store.isItemLoaded(i)){
								store.loadItem({item: i, onItem: onItem, scope: this});
							}
						}, this);
					}
				}else{
					this.store.fetch({
						start: start,
						count: this.rowsPerPage,
						query: this.query,
						sort: this.getSortProps(),
						queryOptions: this.queryOptions,
						isRender: isRender,
						onBegin: dojo.hitch(this, "_onFetchBegin"),
						onComplete: dojo.hitch(this, "_onFetchComplete"),
						onError: dojo.hitch(this, "_onFetchError")
					});
				}
			}catch(e){
				this._onFetchError(e, {start: start, count: this.rowsPerPage});
			}
		}
	},

	_clearData: function(){
		this.updateRowCount(0);
		this._by_idty = {};
		this._by_idx = [];
		this._pages = [];
		this._bop = this._eop = -1;
		this._isLoaded = false;
		this._isLoading = false;
	},

	getItem: function(idx){
		var data = this._by_idx[idx];
		if(!data||(data&&!data.item)){
			this._preparePage(idx);
			return null;
		}
		return data.item;
	},

	getItemIndex: function(item){
		return this._getItemIndex(item, false);
	},
	
	_getItemIndex: function(item, isDeleted){
		if(!isDeleted && !this.store.isItem(item)){
			return -1;
		}

		var idty = this._hasIdentity ? this.store.getIdentity(item) : null;

		for(var i=0, l=this._by_idx.length; i<l; i++){
			var d = this._by_idx[i];
			if(d && ((idty && d.idty == idty) || (d.item === item))){
				return i;
			}
		}
		return -1;
	},

	filter: function(query, reRender){
		this.query = query;
		if(reRender){
			this._clearData();
		}
		this._fetch();
	},

	_getItemAttr: function(idx, attr){
		var item = this.getItem(idx);
		return (!item ? this.fetchText : this.store.getValue(item, attr));
	},

	// rendering
	_render: function(){
		if(this.domNode.parentNode){
			this.scroller.init(this.get('rowCount'), this.keepRows, this.rowsPerPage);
			this.prerender();
			this._fetch(0, true);
		}
	},

	// paging
	_requestsPending: function(inRowIndex){
		return this._pending_requests[inRowIndex];
	},

	_rowToPage: function(inRowIndex){
		return (this.rowsPerPage ? Math.floor(inRowIndex / this.rowsPerPage) : inRowIndex);
	},

	_pageToRow: function(inPageIndex){
		return (this.rowsPerPage ? this.rowsPerPage * inPageIndex : inPageIndex);
	},

	_preparePage: function(inRowIndex){
		if((inRowIndex < this._bop || inRowIndex >= this._eop) && !this._addingItem){
			var pageIndex = this._rowToPage(inRowIndex);
			this._needPage(pageIndex);
			this._bop = pageIndex * this.rowsPerPage;
			this._eop = this._bop + (this.rowsPerPage || this.get('rowCount'));
		}
	},

	_needPage: function(inPageIndex){
		if(!this._pages[inPageIndex]){
			this._pages[inPageIndex] = true;
			this._requestPage(inPageIndex);
		}
	},

	_requestPage: function(inPageIndex){
		var row = this._pageToRow(inPageIndex);
		var count = Math.min(this.rowsPerPage, this.get('rowCount') - row);
		if(count > 0){
			this._requests++;
			if(!this._requestsPending(row)){
				setTimeout(dojo.hitch(this, "_fetch", row, false), 1);
				//this.requestRows(row, count);
			}
		}
	},

	getCellName: function(inCell){
		return inCell.field;
		//console.log(inCell);
	},

	_refresh: function(isRender){
		this._clearData();
		this._fetch(0, isRender);
	},

	sort: function(){
		this.edit.apply();
		this._lastScrollTop = this.scrollTop;
		this._refresh();
	},

	canSort: function(){
		return (!this._isLoading);
	},

	getSortProps: function(){
		var c = this.getCell(this.getSortIndex());
		if(!c){
			if(this.sortFields){
				return this.sortFields;
			}
			return null;
		}else{
			var desc = c["sortDesc"];
			var si = !(this.sortInfo>0);
			if(typeof desc == "undefined"){
				desc = si;
			}else{
				desc = si ? !desc : desc;
			}
			return [{ attribute: c.field, descending: desc }];
		}
	},

	styleRowState: function(inRow){
		// summary: Perform row styling
		if(this.store && this.store.getState){
			var states=this.store.getState(inRow.index), c='';
			for(var i=0, ss=["inflight", "error", "inserting"], s; s=ss[i]; i++){
				if(states[s]){
					c = ' dojoxGridRow-' + s;
					break;
				}
			}
			inRow.customClasses += c;
		}
	},

	onStyleRow: function(inRow){
		this.styleRowState(inRow);
		this.inherited(arguments);
	},

	// editing
	canEdit: function(inCell, inRowIndex){
		return this._canEdit;
	},

	_copyAttr: function(idx, attr){
		var row = {};
		var backstop = {};
		var src = this.getItem(idx);
		return this.store.getValue(src, attr);
	},

	doStartEdit: function(inCell, inRowIndex){
		if(!this._cache[inRowIndex]){
			this._cache[inRowIndex] = this._copyAttr(inRowIndex, inCell.field);
		}
		this.onStartEdit(inCell, inRowIndex);
	},

	doApplyCellEdit: function(inValue, inRowIndex, inAttrName){
		this.store.fetchItemByIdentity({
			identity: this._by_idx[inRowIndex].idty,
			onItem: dojo.hitch(this, function(item){
				var oldValue = this.store.getValue(item, inAttrName);
				if(typeof oldValue == 'number'){
					inValue = isNaN(inValue) ? inValue : parseFloat(inValue);
				}else if(typeof oldValue == 'boolean'){
					inValue = inValue == 'true' ? true : inValue == 'false' ? false : inValue;
				}else if(oldValue instanceof Date){
					var asDate = new Date(inValue);
					inValue = isNaN(asDate.getTime()) ? inValue : asDate;
				}
				this.store.setValue(item, inAttrName, inValue);
				this.onApplyCellEdit(inValue, inRowIndex, inAttrName);
			})
		});
	},

	doCancelEdit: function(inRowIndex){
		var cache = this._cache[inRowIndex];
		if(cache){
			this.updateRow(inRowIndex);
			delete this._cache[inRowIndex];
		}
		this.onCancelEdit.apply(this, arguments);
	},

	doApplyEdit: function(inRowIndex, inDataAttr){
		var cache = this._cache[inRowIndex];
		/*if(cache){
			var data = this.getItem(inRowIndex);
			if(this.store.getValue(data, inDataAttr) != cache){
				this.update(cache, data, inRowIndex);
			}
			delete this._cache[inRowIndex];
		}*/
		this.onApplyEdit(inRowIndex);
	},

	removeSelectedRows: function(){
		// summary:
		//		Remove the selected rows from the grid.
		if(this._canEdit){
			this.edit.apply();
			var fx = dojo.hitch(this, function(items){
				if(items.length){
					dojo.forEach(items, this.store.deleteItem, this.store);
					this.selection.clear();
				}
			});
			if(this.allItemsSelected){
				this.store.fetch({
							query: this.query,
							queryOptions: this.queryOptions,
							onComplete: fx});
			}else{
				fx(this.selection.getSelected());
			}
		}
	}
});

dojox.grid.DataGrid.cell_markupFactory = function(cellFunc, node, cellDef){
	var field = dojo.trim(dojo.attr(node, "field")||"");
	if(field){
		cellDef.field = field;
	}
	cellDef.field = cellDef.field||cellDef.name;
	var fields = dojo.trim(dojo.attr(node, "fields")||"");
	if(fields){
		cellDef.fields = fields.split(",");
	}
	if(cellFunc){
		cellFunc(node, cellDef);
	}
};

dojox.grid.DataGrid.markupFactory = function(props, node, ctor, cellFunc){
	return dojox.grid._Grid.markupFactory(props, node, ctor,
					dojo.partial(dojox.grid.DataGrid.cell_markupFactory, cellFunc));
};

}

if(!dojo._hasResource["scorll.asset.TrackingStats"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.asset.TrackingStats"] = true;
dojo.provide("scorll.asset.TrackingStats");



dojo.declare("scorll.asset.TrackingStats", [
    dijit._Widget, dijit._Templated
    ], {
    widgetsInTemplate: true,
    templateString:"<div>\n    <style type=\"text/css\">\n        @import \"dojox/grid/resources/Grid.css\";\n        @import \"dojox/grid/resources/claroGrid.css\";\n        .dojoxGrid table { margin: 0; } html, body { width: 100%; height: 100%;\n        margin: 0; }\n    </style>\n\t<div style=\"width: 500px; height:300px;\">\n        <table dojoType=\"dojox.grid.DataGrid\" dojoAttachPoint=\"resultsGrid\" style=\"width: 100%; height: 100%;\">\n          <thead width=\"100%\">\n            <tr>\n              <th field=\"username\" width=\"40%\">Username</th>\n              <th field=\"response\" width=\"40%\">Response</th>\n              <th field=\"result\" width=\"20%\">Result</th>\n            </tr>\n          </thead>\n        </table>\n\t</div>\n",
    dialog: null,
    postCreate: function() {
        this.resultsGrid.formatterScope = this;
        console.log(this.resultsGrid);
    }
});

}

if(!dojo._hasResource["dojo.store.util.QueryResults"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojo.store.util.QueryResults"] = true;
dojo.provide("dojo.store.util.QueryResults");

dojo.getObject("store.util", true, dojo);

dojo.store.util.QueryResults = function(results){
	// summary:
	//		A function that wraps the results of a store query with additional
	//		methods.
	//
	// description:
	//		QueryResults is a basic wrapper that allows for array-like iteration
	//		over any kind of returned data from a query.  While the simplest store
	//		will return a plain array of data, other stores may return deferreds or
	//		promises; this wrapper makes sure that *all* results can be treated
	//		the same.
	//
	//		Additional methods include `forEach`, `filter` and `map`.
	//
	// returns: Object
	//		An array-like object that can be used for iterating over.
	//
	// example:
	//		Query a store and iterate over the results.
	//
	//	|	store.query({ prime: true }).forEach(function(item){
	//	|		//	do something
	//	|	});
	
	if(!results){
		return results;
	}
	// if it is a promise it may be frozen
	if(results.then){
		results = dojo.delegate(results);
	}
	function addIterativeMethod(method){
		if(!results[method]){
			results[method] = function(){
				var args = arguments;
				return dojo.when(results, function(results){
					Array.prototype.unshift.call(args, results);
					return dojo.store.util.QueryResults(dojo[method].apply(dojo, args));
				});
			};
		}
	}
	addIterativeMethod("forEach");
	addIterativeMethod("filter");
	addIterativeMethod("map");
	if(!results.total){
		results.total = dojo.when(results, function(results){
			return results.length;
		});
	}
	return results;
};

}

if(!dojo._hasResource["dojo.store.util.SimpleQueryEngine"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojo.store.util.SimpleQueryEngine"] = true;
dojo.provide("dojo.store.util.SimpleQueryEngine");

dojo.getObject("store.util", true, dojo);

dojo.store.util.SimpleQueryEngine = function(query, options){
	// summary:
	//		Simple query engine that matches using filter functions, named filter
	//		functions or objects by name-value on a query object hash
	//
	// description:
	//		The SimpleQueryEngine provides a way of getting a QueryResults through
	//		the use of a simple object hash as a filter.  The hash will be used to
	//		match properties on data objects with the corresponding value given. In
	//		other words, only exact matches will be returned.
	//
	//		This function can be used as a template for more complex query engines;
	//		for example, an engine can be created that accepts an object hash that
	//		contains filtering functions, or a string that gets evaluated, etc.
	//
	//		When creating a new dojo.store, simply set the store's queryEngine
	//		field as a reference to this function.
	//
	// query: Object
	//		An object hash with fields that may match fields of items in the store.
	//		Values in the hash will be compared by normal == operator, but regular expressions
	//		or any object that provides a test() method are also supported and can be
	// 		used to match strings by more complex expressions
	// 		(and then the regex's or object's test() method will be used to match values).
	//
	// options: dojo.store.util.SimpleQueryEngine.__queryOptions?
	//		An object that contains optional information such as sort, start, and count.
	//
	// returns: Function
	//		A function that caches the passed query under the field "matches".  See any
	//		of the "query" methods on dojo.stores.
	//
	// example:
	//		Define a store with a reference to this engine, and set up a query method.
	//
	//	|	var myStore = function(options){
	//	|		//	...more properties here
	//	|		this.queryEngine = dojo.store.util.SimpleQueryEngine;
	//	|		//	define our query method
	//	|		this.query = function(query, options){
	//	|			return dojo.store.util.QueryResults(this.queryEngine(query, options)(this.data));
	//	|		};
	//	|	};

	// create our matching query function
	switch(typeof query){
		default:
			throw new Error("Can not query with a " + typeof query);
		case "object": case "undefined":
			var queryObject = query;
			query = function(object){
				for(var key in queryObject){
					var required = queryObject[key];
					if(required && required.test){
						if(!required.test(object[key])){
							return false;
						}
					}else if(required != object[key]){
						return false;
					}
				}
				return true;
			};
			break;
		case "string":
			// named query
			if(!this[query]){
				throw new Error("No filter function " + query + " was found in store");
			}
			query = this[query];
			// fall through
		case "function":
			// fall through
	}
	function execute(array){
		// execute the whole query, first we filter
		var results = dojo.filter(array, query);
		// next we sort
		if(options && options.sort){
			results.sort(function(a, b){
				for(var sort, i=0; sort = options.sort[i]; i++){
					var aValue = a[sort.attribute];
					var bValue = b[sort.attribute];
					if (aValue != bValue) {
						return !!sort.descending == aValue > bValue ? -1 : 1;
					}
				}
				return 0;
			});
		}
		// now we paginate
		if(options && (options.start || options.count)){
			var total = results.length;
			results = results.slice(options.start || 0, (options.start || 0) + (options.count || Infinity));
			results.total = total;
		}
		return results;
	}
	execute.matches = query;
	return execute;
};

}

if(!dojo._hasResource["dojo.store.Memory"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojo.store.Memory"] = true;
dojo.provide("dojo.store.Memory");




dojo.declare("dojo.store.Memory", null, {
	// summary:
	//		This is a basic in-memory object store. It implements dojo.store.api.Store.
	constructor: function(/*dojo.store.Memory*/ options){
		// summary:
		//		Creates a memory object store.
		// options:
		//		This provides any configuration information that will be mixed into the store.
		// 		This should generally include the data property to provide the starting set of data.
		this.index = {};
		dojo.mixin(this, options);
		this.setData(this.data || []);
	},
	// data: Array
	//		The array of all the objects in the memory store
	data:null,

	// idProperty: String
	//		Indicates the property to use as the identity property. The values of this
	//		property should be unique.
	idProperty: "id",

	// index: Object
	//		An index of data by id
	index:null,

	// queryEngine: Function
	//		Defines the query engine to use for querying the data store
	queryEngine: dojo.store.util.SimpleQueryEngine,
	get: function(id){
		//	summary:
		//		Retrieves an object by its identity
		//	id: Number
		//		The identity to use to lookup the object
		//	returns: Object
		//		The object in the store that matches the given id.
		return this.index[id];
	},
	getIdentity: function(object){
		// 	summary:
		//		Returns an object's identity
		// 	object: Object
		//		The object to get the identity from
		//	returns: Number
		return object[this.idProperty];
	},
	put: function(object, options){
		// 	summary:
		//		Stores an object
		// 	object: Object
		//		The object to store.
		// 	options: dojo.store.api.Store.PutDirectives??
		//		Additional metadata for storing the data.  Includes an "id"
		//		property if a specific id is to be used.
		//	returns: Number
		var id = options && options.id || object[this.idProperty] || Math.random();
		this.index[id] = object;
		var data = this.data,
			idProperty = this.idProperty;
		for(var i = 0, l = data.length; i < l; i++){
			if(data[i][idProperty] == id){
				data[i] = object;
				return id;
			}
		}
		this.data.push(object);
		return id;
	},
	add: function(object, options){
		// 	summary:
		//		Creates an object, throws an error if the object already exists
		// 	object: Object
		//		The object to store.
		// 	options: dojo.store.api.Store.PutDirectives??
		//		Additional metadata for storing the data.  Includes an "id"
		//		property if a specific id is to be used.
		//	returns: Number
		if(this.index[options && options.id || object[this.idProperty]]){
			throw new Error("Object already exists");
		}
		return this.put(object, options);
	},
	remove: function(id){
		// 	summary:
		//		Deletes an object by its identity
		// 	id: Number
		//		The identity to use to delete the object
		delete this.index[id];
		var data = this.data,
			idProperty = this.idProperty;
		for(var i = 0, l = data.length; i < l; i++){
			if(data[i][idProperty] == id){
				data.splice(i, 1);
				return;
			}
		}
	},
	query: function(query, options){
		// 	summary:
		//		Queries the store for objects.
		// 	query: Object
		//		The query to use for retrieving objects from the store.
		//	options: dojo.store.api.Store.QueryOptions?
		//		The optional arguments to apply to the resultset.
		//	returns: dojo.store.api.Store.QueryResults
		//		The results of the query, extended with iterative methods.
		//
		// 	example:
		// 		Given the following store:
		//
		// 	|	var store = new dojo.store.Memory({
		// 	|		data: [
		// 	|			{id: 1, name: "one", prime: false },
		//	|			{id: 2, name: "two", even: true, prime: true},
		//	|			{id: 3, name: "three", prime: true},
		//	|			{id: 4, name: "four", even: true, prime: false},
		//	|			{id: 5, name: "five", prime: true}
		//	|		]
		//	|	});
		//
		//	...find all items where "prime" is true:
		//
		//	|	var results = store.query({ prime: true });
		//
		//	...or find all items where "even" is true:
		//
		//	|	var results = store.query({ even: true });
		return dojo.store.util.QueryResults(this.queryEngine(query, options)(this.data));
	},
	setData: function(data){
		// 	summary:
		//		Sets the given data as the source for this store, and indexes it
		//	data: Object[]
		//		An array of objects to use as the source of data.
		if(data.items){
			// just for convenience with the data format IFRS expects
			this.idProperty = data.identifier;
			data = this.data = data.items;
		}else{
			this.data = data;
		}

		for(var i = 0, l = data.length; i < l; i++){
			var object = data[i];
			this.index[object[this.idProperty]] = object;
		}
	}
});

}

if(!dojo._hasResource["dojo.data.ObjectStore"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojo.data.ObjectStore"] = true;
dojo.provide("dojo.data.ObjectStore");




dojo.declare("dojo.data.ObjectStore", null,{
		objectStore: null,
		constructor: function(options){
			// summary:
			//		A Dojo Data implementation that wraps Dojo object stores for backwards
			//		compatibility.
			//	options:
			//		The configuration information to pass into the data store.
			//	options.objectStore:
			//		The object store to use as the source provider for this data store
			dojo.mixin(this, options);
		},
		labelProperty: "label",

		getValue: function(/*Object*/ item, /*String*/property, /*value?*/defaultValue){
			// summary:
			//	Gets the value of an item's 'property'
			//
			//	item:
			//		The item to get the value from
			//	property:
			//		property to look up value for
			//	defaultValue:
			//		the default value
			
			return typeof item.get === "function" ? item.get(property) :
				property in item ?
					item[property] : defaultValue;
		},
		getValues: function(item, property){
			// summary:
			//		Gets the value of an item's 'property' and returns
			//		it.	If this value is an array it is just returned,
			//		if not, the value is added to an array and that is returned.
			//
			//	item: /* object */
			//	property: /* string */
			//		property to look up value for

			var val = this.getValue(item,property);
			return val instanceof Array ? val : val === undefined ? [] : [val];
		},

		getAttributes: function(item){
			// summary:
			//	Gets the available attributes of an item's 'property' and returns
			//	it as an array.
			//
			//	item: /* object */

			var res = [];
			for(var i in item){
				if(item.hasOwnProperty(i) && !(i.charAt(0) == '_' && i.charAt(1) == '_')){
					res.push(i);
				}
			}
			return res;
		},

		hasAttribute: function(item,attribute){
			// summary:
			//		Checks to see if item has attribute
			//
			//	item: /* object */
			//	attribute: /* string */
			return attribute in item;
		},

		containsValue: function(item, attribute, value){
			// summary:
			//		Checks to see if 'item' has 'value' at 'attribute'
			//
			//	item: /* object */
			//	attribute: /* string */
			//	value: /* anything */
			return dojo.indexOf(this.getValues(item,attribute),value) > -1;
		},


		isItem: function(item){
			// summary:
			//		Checks to see if the argument is an item
			//
			//	item: /* object */
			//	attribute: /* string */

			// we have no way of determining if it belongs, we just have object returned from
			// 	service queries
			return (typeof item == 'object') && item && !(item instanceof Date);
		},

		isItemLoaded: function(item){
			// summary:
			//		Checks to see if the item is loaded.
			//
			//		item: /* object */

			return item && typeof item.load !== "function";
		},

		loadItem: function(args){
			// summary:
			// 		Loads an item and calls the callback handler. Note, that this will call the callback
			// 		handler even if the item is loaded. Consequently, you can use loadItem to ensure
			// 		that an item is loaded is situations when the item may or may not be loaded yet.
			// 		If you access a value directly through property access, you can use this to load
			// 		a lazy value as well (doesn't need to be an item).
			//
			//	example:
			//		store.loadItem({
			//			item: item, // this item may or may not be loaded
			//			onItem: function(item){
			// 				// do something with the item
			//			}
			//		});

			var item;
			if(typeof args.item.load === "function"){
				dojo.when(args.item.load(), function(result){
					item = result; // in synchronous mode this can allow loadItem to return the value
					var func = result instanceof Error ? args.onError : args.onItem;
					if(func){
						func.call(args.scope, result);
					}
				});
			}else if(args.onItem){
				// even if it is already loaded, we will use call the callback, this makes it easier to
				// use when it is not known if the item is loaded (you can always safely call loadItem).
				args.onItem.call(args.scope, args.item);
			}
			return item;
		},
		close: function(request){
			return request && request.abort && request.abort();
		},
		fetch: function(args){
			// summary:
			//		See dojo.data.api.Read.fetch
			//
			
			args = args || {};
			var self = this;
			var scope = args.scope || self;
			var query = args.query;
			if(typeof query == "object"){ // can be null, but that is ignore by for-in
				query = dojo.delegate(query); // don't modify the original
				for(var i in query){
					// find any strings and convert them to regular expressions for wildcard support
					var required = query[i];
					if(typeof required == "string"){
						query[i] = RegExp("^" + dojo.regexp.escapeString(required, "*?").replace(/\*/g, '.*').replace(/\?/g, '.') + "$", args.queryOptions && args.queryOptions.ignoreCase ? "mi" : "m");
						query[i].toString = (function(original){
							return function(){
								return original;
							}
						})(required);
					}
				}
			}
			
			var results = this.objectStore.query(query, args);
			dojo.when(results.total, function(totalCount){
				dojo.when(results, function(results){
					if(args.onBegin){
						args.onBegin.call(scope, totalCount || results.length, args);
					}
					if(args.onItem){
						for(var i=0; i<results.length;i++){
							args.onItem.call(scope, results[i], args);
						}
					}
					if(args.onComplete){
						args.onComplete.call(scope, args.onItem ? null : results, args);
					}
					return results;
				}, errorHandler);
			}, errorHandler);
			function errorHandler(error){
				if(args.onError){
					args.onError.call(scope, error, args);
				}
			}
			args.abort = function(){
				// abort the request
				if(results.cancel){
					results.cancel();
				}
			};
			args.store = this;
			return args;
		},
		getFeatures: function(){
			// summary:
			// 		return the store feature set

			return {
				"dojo.data.api.Read": !!this.objectStore.get,
				"dojo.data.api.Identity": true,
				"dojo.data.api.Write": !!this.objectStore.put,
				"dojo.data.api.Notification": true
			};
		},

		getLabel: function(/* item */ item){
			//	summary:
			//		See dojo.data.api.Read.getLabel()
			if(this.isItem(item)){
				return this.getValue(item,this.labelProperty); //String
			}
			return undefined; //undefined
		},

		getLabelAttributes: function(/* item */ item){
			//	summary:
			//		See dojo.data.api.Read.getLabelAttributes()
			return [this.labelProperty]; //array
		},

		//Identity API Support


		getIdentity: function(item){
			return item.getId ? item.getId() : item[this.objectStore.idProperty || "id"];
		},

		getIdentityAttributes: function(item){
			// summary:
			//		returns the attributes which are used to make up the
			//		identity of an item.	Basically returns this.objectStore.idProperty

			return [this.objectStore.idProperty];
		},

		fetchItemByIdentity: function(args){
			// summary:
			//		fetch an item by its identity, by looking in our index of what we have loaded
			var item;
			dojo.when(this.objectStore.get(args.identity),
				function(result){
					item = result;
					args.onItem.call(args.scope, result);
				},
				function(error){
					args.onError.call(args.scope, error);
				}
			);
			return item;
		},
		
		newItem: function(data, parentInfo){
			// summary:
			//		adds a new item to the store at the specified point.
			//		Takes two parameters, data, and options.
			//
			//	data: /* object */
			//		The data to be added in as an item.
			if(parentInfo){
				// get the previous value or any empty array
				var values = this.getValue(parentInfo.parent,parentInfo.attribute,[]);
				// set the new value
				values = values.concat([data]);
				data.__parent = values;
				this.setValue(parentInfo.parent, parentInfo.attribute, values);
			}
			this._dirtyObjects.push({object:data, save: true});
			this.onNew(data);
			return data;
		},
		deleteItem: function(item){
			// summary:
			//		deletes item and any references to that item from the store.
			//
			//	item:
			//		item to delete
			//

			//	If the desire is to delete only one reference, unsetAttribute or
			//	setValue is the way to go.
			this.changing(item, true);

			this.onDelete(item);
		},
		setValue: function(item, attribute, value){
			// summary:
			//		sets 'attribute' on 'item' to 'value'

			var old = item[attribute];
			this.changing(item);
			item[attribute]=value;
			this.onSet(item,attribute,old,value);
		},
		setValues: function(item, attribute, values){
			// summary:
			//	sets 'attribute' on 'item' to 'value' value
			//	must be an array.


			if(!dojo.isArray(values)){
				throw new Error("setValues expects to be passed an Array object as its value");
			}
			this.setValue(item,attribute,values);
		},

		unsetAttribute: function(item, attribute){
			// summary:
			//		unsets 'attribute' on 'item'

			this.changing(item);
			var old = item[attribute];
			delete item[attribute];
			this.onSet(item,attribute,old,undefined);
		},
		
		_dirtyObjects: [],
		
		changing: function(object,_deleting){
			// summary:
			//		adds an object to the list of dirty objects.  This object
			//		contains a reference to the object itself as well as a
			//		cloned and trimmed version of old object for use with
			//		revert.
			object.__isDirty = true;
			//if an object is already in the list of dirty objects, don't add it again
			//or it will overwrite the premodification data set.
			for(var i=0; i<this._dirtyObjects.length; i++){
				var dirty = this._dirtyObjects[i];
				if(object==dirty.object){
					if(_deleting){
						// we are deleting, no object is an indicator of deletiong
						dirty.object = false;
						if(!this._saveNotNeeded){
							dirty.save = true;
						}
					}
					return;
				}
			}
			var old = object instanceof Array ? [] : {};
			for(i in object){
				if(object.hasOwnProperty(i)){
					old[i] = object[i];
				}
			}
			this._dirtyObjects.push({object: !_deleting && object, old: old, save: !this._saveNotNeeded});
		},
		
		save: function(kwArgs){
			// summary:
			//		Saves the dirty data using object store provider. See dojo.data.api.Write for API.
			//
			//	kwArgs.global:
			//		This will cause the save to commit the dirty data for all
			// 		ObjectStores as a single transaction.
			//
			//	kwArgs.revertOnError
			//		This will cause the changes to be reverted if there is an
			//		error on the save. By default a revert is executed unless
			//		a value of false is provide for this parameter.

			kwArgs = kwArgs || {};
			var result, actions = [];
			var alreadyRecorded = {};
			var savingObjects = [];
			var self;
			var dirtyObjects = this._dirtyObjects;
			var left = dirtyObjects.length;// this is how many changes are remaining to be received from the server
			try{
				dojo.connect(kwArgs,"onError",function(){
					if(kwArgs.revertOnError !== false){
						var postCommitDirtyObjects = dirtyObjects;
						dirtyObjects = savingObjects;
						var numDirty = 0; // make sure this does't do anything if it is called again
						jr.revert(); // revert if there was an error
						self._dirtyObjects = postCommitDirtyObjects;
					}
					else{
						self._dirtyObjects = dirtyObject.concat(savingObjects);
					}
				});
				if(this.objectStore.transaction){
					var transaction = this.objectStore.transaction();
				}
				for(var i = 0; i < dirtyObjects.length; i++){
					var dirty = dirtyObjects[i];
					var object = dirty.object;
					var old = dirty.old;
					delete object.__isDirty;
					if(object){
						result = this.objectStore.put(object, {overwrite: !!old});
					}
					else{
						result = this.objectStore.remove(this.getIdentity(old));
					}
					savingObjects.push(dirty);
					dirtyObjects.splice(i--,1);
					dojo.when(result, function(value){
						if(!(--left)){
							if(kwArgs.onComplete){
								kwArgs.onComplete.call(kwArgs.scope, actions);
							}
						}
					},function(value){
						
						// on an error we want to revert, first we want to separate any changes that were made since the commit
						left = -1; // first make sure that success isn't called
						kwArgs.onError.call(kwArgs.scope, value);
					});
					
				}
				if(transaction){
					transaction.commit();
				}
			}catch(e){
				kwArgs.onError.call(kwArgs.scope, value);
			}
			
			
		},

		revert: function(kwArgs){
			// summary
			//		returns any modified data to its original state prior to a save();
			//
			var dirtyObjects = this._dirtyObjects;
			for(var i = dirtyObjects.length; i > 0;){
				i--;
				var dirty = dirtyObjects[i];
				var object = dirty.object;
				var old = dirty.old;
				if(object && old){
					// changed
					for(var j in old){
						if(old.hasOwnProperty(j) && object[j] !== old[j]){
							this.onSet(object, j, object[j], old[j]);
							object[j] = old[j];
						}
					}
					for(j in object){
						if(!old.hasOwnProperty(j)){
							this.onSet(object, j, object[j]);
							delete object[j];
						}
					}
				}else if(!old){
					// was an addition, remove it
					this.onDelete(object);
				}else{
					// was a deletion, we will add it back
					this.onNew(old);
				}
				delete (object || old).__isDirty;
				dirtyObjects.splice(i, 1);
			}
			
			
		},
		isDirty: function(item){
			// summary
			//		returns true if the item is marked as dirty or true if there are any dirty items
			if(!item){
				return !!this._dirtyObjects.length;
			}
			return item.__isDirty;
		},
		//Notifcation Support

		onSet: function(){},
		onNew: function(){},
		onDelete: 	function(){}
	}
);

}

if(!dojo._hasResource["scorll.asset.Tracking"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.asset.Tracking"] = true;
dojo.provide("scorll.asset.Tracking");







dojo.declare("scorll.asset.Tracking", null, {
    userTrackingData: new dojo.store.Memory(),
    userTrackingDataHistory: {},
    statsForm: null,
    track: function(params, callback) {
        var asset = this;
        params.assetId = asset.item.id;
        if (!asset.user.authenticated) {
            asset.stage.userLogin(function(err) {
                if (err) {
                    callback("The user is not authenticated");
                } else {
                    asset.client.call(asset, "track", params, callback);
                }
            });
        } else {
            asset.client.call(asset, "track", params, callback);
        }
    },
    getTrackingResult: function(callback) {
        var asset = this;
        var params = {
            assetId: asset.item.id,
            userId: asset.user.id
        };
        asset.client.call(asset, "getTrackingResults", params, callback);
    },
    collect: function(userId, username, response, result) {
        var asset = this;
        asset.userTrackingData.put({
            id: userId,
            username: username,
            response: response,
            result: result
        });
        asset.statsForm && asset.statsForm.resultsGrid._refresh();
        var history = asset.userTrackingDataHistory[userId] || [];
        history.push({
            response: response,
            result: result
        });
        asset.userTrackingDataHistory[userId] = history;
    },
    showStats: function() {
        var asset = this;
        var params = {
            assetId: asset.item.id
        };
        asset.client.call(asset, "getTrackingResults", params, function(err, results) {
            for (var userId in results) {
                var username = results[userId].username;
                var response = results[userId].response;
                var result = results[userId].result;
                asset.userTrackingData.put({
                    id: userId,
                    username: username,
                    response: response,
                    result: result
                });
            }
            var form = new scorll.asset.TrackingStats();
            var dialog = new scorll.asset.Dialog();
            form.placeAt(dialog.containerNode);
            dialog.show();
            var data = new dojo.data.ObjectStore({
                objectStore: asset.userTrackingData
            });
            form.resultsGrid.setStore(data);
            asset.statsForm = form;
            dojo.connect(form, "onCancel", function() {
                tracking.statsForm = null;
                dialog.hide();
            });
        });
    }
    // Override this function to show a user friendly label
    // in TrackingStats
    ,
    getLearnerResponseAsString: function(learnerResponse) {
        return "test";
    },
    TRACKING_TYPE: {
        TRUE_FALSE: "true-false",
        CHOICE: "choice",
        FILL_IN: "fill-in",
        LIKERT: "likert",
        MATCHING: "matching",
        PERFORMANCE: "performance",
        SEQUENCING: "sequencing",
        NUMERIC: "numeric",
        OTHER: "other"
    }
});

}

if(!dojo._hasResource["scorll.asset.Persistent"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.asset.Persistent"] = true;
dojo.provide("scorll.asset.Persistent");

dojo.declare("scorll.asset.Persistent", null, {
    save: function(objects, callback) {
        this.client.call(this, 'save', objects, callback);
    },
    search: function(conditions, callback) {
        this.client.call(this, 'search', conditions, callback);
    },
    del: function(objects, callback) {
        this.client.call(this, 'delete', conditions, callback);
    },
});

}

if(!dojo._hasResource["scorll.asset.Asset"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.asset.Asset"] = true;
dojo.provide("scorll.asset.Asset");









dojo.declare("scorll.asset.Asset", [
    dijit._Widget, dijit._Templated,
    scorll.net.ClientComponent
    ], {
    user: null,
    client: null,
    content: null,
    stage: null,
    item: null,

    // scorll.net.ClientComponent functions
    getComponentType: function () {
        return "asset";
    },
    getComponentId: function () {
        return this.item.id;
    }
});

}

if(!dojo._hasResource["scorll.asset.Text"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.asset.Text"] = true;
dojo.provide("scorll.asset.Text");




dojo.declare("scorll.asset.Text", [
    scorll.asset.Asset,
    scorll.asset.Shared
    ], {
    templateString:"<div>\n\t<h2 dojoAttachPoint=\"titleText\"></h2>\n\t<p dojoAttachPoint=\"bodyText\"></p>\n",
    postCreate: function() {
        var data = this.item.data;
        if (data.text) {
            this.bodyText.innerHTML = this.parseText(data.text);
        }
        if (data.title) {
            this.titleText.innerHTML = data.title;
        } else {
            dojo.destroy(this.titleText);
        }
        var userid = this.user ? this.user.id : "unknown";
        this.call("test", "Test Message From User " + userid);
    },
    test: function(message) {
        console.log("Message to Test: " + message);
    },
    parseText: function(text) {
        // Clear Empty chars
        text = text.trim(text);
        // Clean HTML
        text = text.replace(/<\/?([^>])*>/gm, "");
        // Italic
        text = text.replace(/([^:])\/\/(.+?)\/\//gm, "$1<i>$2</i>");
        // Underline
        text = text.replace(/__(.+?)__/gm, "<u>$1</u>");
        // Bold
        text = text.replace(/\*\*(.+?)\*\*/gm, "<strong>$1</strong>");
        // Link
        text = text.replace(/\[\[(http:\/\/[^ ]+?)\]\]/gm, '<a href="$1" target="_blank">$1</a>');
        // Link with Label
        text = text.replace(/\[\[(http:\/\/[^ ]+?)( .+?)\]\]/gm, '<a href="$1" target="_blank">$2</a>');
        // List Item
        text = text.replace(/^\* (.+?)$/gm, "<li>$1</li>");
        // New Line
        text = "<p>" + text.replace(/\n+/gm, "</p><p>") + "</p>";
        return text;
    }
});

}

if(!dojo._hasResource["scorll.asset.AssetForm"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.asset.AssetForm"] = true;
dojo.provide("scorll.asset.AssetForm");




dojo.declare("scorll.asset.AssetForm", [
    dijit._Widget,
    dijit._Templated
    ], {
    widgetsInTemplate: true,
    item: {},
    onSubmit: function(item) {},
    onCancel: function() {},
    submit: function() {
        throw new Error("Implement add function");
    },
    cancel: function() {
        throw new Error("Implement cancel function");
    }
});

}

if(!dojo._hasResource["dijit.form.SimpleTextarea"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dijit.form.SimpleTextarea"] = true;
dojo.provide("dijit.form.SimpleTextarea");



dojo.declare("dijit.form.SimpleTextarea",
	dijit.form.TextBox,
	{
	// summary:
	//		A simple textarea that degrades, and responds to
	// 		minimal LayoutContainer usage, and works with dijit.form.Form.
	//		Doesn't automatically size according to input, like Textarea.
	//
	// example:
	//	|	<textarea dojoType="dijit.form.SimpleTextarea" name="foo" value="bar" rows=30 cols=40></textarea>
	//
	// example:
	//	|	new dijit.form.SimpleTextarea({ rows:20, cols:30 }, "foo");

	baseClass: "dijitTextBox dijitTextArea",

	attributeMap: dojo.delegate(dijit.form._FormValueWidget.prototype.attributeMap, {
		rows:"textbox", cols: "textbox"
	}),

	// rows: Number
	//		The number of rows of text.
	rows: "3",

	// rows: Number
	//		The number of characters per line.
	cols: "20",

	templateString: "<textarea ${!nameAttrSetting} dojoAttachPoint='focusNode,containerNode,textbox' autocomplete='off'></textarea>",

	postMixInProperties: function(){
		// Copy value from srcNodeRef, unless user specified a value explicitly (or there is no srcNodeRef)
		// TODO: parser will handle this in 2.0
		if(!this.value && this.srcNodeRef){
			this.value = this.srcNodeRef.value;
		}
		this.inherited(arguments);
	},

	buildRendering: function(){
		this.inherited(arguments);
		if(dojo.isIE && this.cols){ // attribute selectors is not supported in IE6
			dojo.addClass(this.textbox, "dijitTextAreaCols");
		}
	},

	filter: function(/*String*/ value){
		// Override TextBox.filter to deal with newlines... specifically (IIRC) this is for IE which writes newlines
		// as \r\n instead of just \n
		if(value){
			value = value.replace(/\r/g,"");
		}
		return this.inherited(arguments);
	},

	_previousValue: "",
	_onInput: function(/*Event?*/ e){
		// Override TextBox._onInput() to enforce maxLength restriction
		if(this.maxLength){
			var maxLength = parseInt(this.maxLength);
			var value = this.textbox.value.replace(/\r/g,'');
			var overflow = value.length - maxLength;
			if(overflow > 0){
				if(e){ dojo.stopEvent(e); }
				var textarea = this.textbox;
				if(textarea.selectionStart){
					var pos = textarea.selectionStart;
					var cr = 0;
					if(dojo.isOpera){
						cr = (this.textbox.value.substring(0,pos).match(/\r/g) || []).length;
					}
					this.textbox.value = value.substring(0,pos-overflow-cr)+value.substring(pos-cr);
					textarea.setSelectionRange(pos-overflow, pos-overflow);
				}else if(dojo.doc.selection){ //IE
					textarea.focus();
					var range = dojo.doc.selection.createRange();
					// delete overflow characters
					range.moveStart("character", -overflow);
					range.text = '';
					// show cursor
					range.select();
				}
			}
			this._previousValue = this.textbox.value;
		}
		this.inherited(arguments);
	}
});

}

if(!dojo._hasResource["dijit.form.Textarea"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dijit.form.Textarea"] = true;
dojo.provide("dijit.form.Textarea");



dojo.declare(
	"dijit.form.Textarea",
	dijit.form.SimpleTextarea,
	{
	// summary:
	//		A textarea widget that adjusts it's height according to the amount of data.
	//
	// description:
	//		A textarea that dynamically expands/contracts (changing it's height) as
	//		the user types, to display all the text without requiring a scroll bar.
	//
	//		Takes nearly all the parameters (name, value, etc.) that a vanilla textarea takes.
	//		Rows is not supported since this widget adjusts the height.
	//
	// example:
	// |	<textarea dojoType="dijit.form.TextArea">...</textarea>


	// TODO: for 2.0, rename this to ExpandingTextArea, and rename SimpleTextarea to Textarea

	baseClass: "dijitTextBox dijitTextArea dijitExpandingTextArea",

	// Override SimpleTextArea.cols to default to width:100%, for backward compatibility
	cols: "",

	_previousNewlines: 0,
	_strictMode: (dojo.doc.compatMode != 'BackCompat'), // not the same as !dojo.isQuirks

	_getHeight: function(textarea){
		var newH = textarea.scrollHeight;
		if(dojo.isIE){
			newH += textarea.offsetHeight - textarea.clientHeight - ((dojo.isIE < 8 && this._strictMode) ? dojo._getPadBorderExtents(textarea).h : 0);
		}else if(dojo.isMoz){
			newH += textarea.offsetHeight - textarea.clientHeight; // creates room for horizontal scrollbar
		}else if(dojo.isWebKit){
			newH += dojo._getBorderExtents(textarea).h;
		}else{ // Opera 9.6 (TODO: test if this is still needed)
			newH += dojo._getPadBorderExtents(textarea).h;
		}
		return newH;
	},

	_estimateHeight: function(textarea){
		// summary:
		// 		Approximate the height when the textarea is invisible with the number of lines in the text.
		// 		Fails when someone calls setValue with a long wrapping line, but the layout fixes itself when the user clicks inside so . . .
		// 		In IE, the resize event is supposed to fire when the textarea becomes visible again and that will correct the size automatically.
		//
		textarea.style.maxHeight = "";
		textarea.style.height = "auto";
		// #rows = #newlines+1
		// Note: on Moz, the following #rows appears to be 1 too many.
		// Actually, Moz is reserving room for the scrollbar.
		// If you increase the font size, this behavior becomes readily apparent as the last line gets cut off without the +1.
		textarea.rows = (textarea.value.match(/\n/g) || []).length + 1;
	},

	_needsHelpShrinking: dojo.isMoz || dojo.isWebKit,

	_onInput: function(){
		// Override SimpleTextArea._onInput() to deal with height adjustment
		this.inherited(arguments);
		if(this._busyResizing){ return; }
		this._busyResizing = true;
		var textarea = this.textbox;
		if(textarea.scrollHeight && textarea.offsetHeight && textarea.clientHeight){
			var newH = this._getHeight(textarea) + "px";
			if(textarea.style.height != newH){
				textarea.style.maxHeight = textarea.style.height = newH;
			}
			if(this._needsHelpShrinking){
				if(this._setTimeoutHandle){
					clearTimeout(this._setTimeoutHandle);
				}
				this._setTimeoutHandle = setTimeout(dojo.hitch(this, "_shrink"), 0); // try to collapse multiple shrinks into 1
			}
		}else{
			// hidden content of unknown size
			this._estimateHeight(textarea);
		}
		this._busyResizing = false;
	},

	_busyResizing: false,
	_shrink: function(){
		// grow paddingBottom to see if scrollHeight shrinks (when it is unneccesarily big)
		this._setTimeoutHandle = null;
		if(this._needsHelpShrinking && !this._busyResizing){
			this._busyResizing = true;
			var textarea = this.textbox;
			var empty = false;
			if(textarea.value == ''){
				textarea.value = ' '; // prevent collapse all the way back to 0
				empty = true;
			}
			var scrollHeight = textarea.scrollHeight;
			if(!scrollHeight){
				this._estimateHeight(textarea);
			}else{
				var oldPadding = textarea.style.paddingBottom;
				var newPadding = dojo._getPadExtents(textarea);
				newPadding = newPadding.h - newPadding.t;
				textarea.style.paddingBottom = newPadding + 1 + "px"; // tweak padding to see if height can be reduced
				var newH = this._getHeight(textarea) - 1 + "px"; // see if the height changed by the 1px added
				if(textarea.style.maxHeight != newH){ // if can be reduced, so now try a big chunk
					textarea.style.paddingBottom = newPadding + scrollHeight + "px";
					textarea.scrollTop = 0;
					textarea.style.maxHeight = this._getHeight(textarea) - scrollHeight + "px"; // scrollHeight is the added padding
				}
				textarea.style.paddingBottom = oldPadding;
			}
			if(empty){
				textarea.value = '';
			}
			this._busyResizing = false;
		}
	},

	resize: function(){
		// summary:
		//		Resizes the textarea vertically (should be called after a style/value change)
		this._onInput();
	},

	_setValueAttr: function(){
		this.inherited(arguments);
		this.resize();
	},

	buildRendering: function(){
		this.inherited(arguments);

		// tweak textarea style to reduce browser differences
		dojo.style(this.textbox, { overflowY: 'hidden', overflowX: 'auto', boxSizing: 'border-box', MsBoxSizing: 'border-box', WebkitBoxSizing: 'border-box', MozBoxSizing: 'border-box' });
	},

	postCreate: function(){
		this.inherited(arguments);

		this.connect(this.textbox, "onscroll", "_onInput");
		this.connect(this.textbox, "onresize", "_onInput");
		this.connect(this.textbox, "onfocus", "_onInput"); // useful when a previous estimate was off a bit
		this._setTimeoutHandle = setTimeout(dojo.hitch(this, "resize"), 0);
	},

	uninitialize: function(){
		if(this._setTimeoutHandle){
			clearTimeout(this._setTimeoutHandle);
		}
		this.inherited(arguments);
	}
});

}

if(!dojo._hasResource["scorll.asset.TextForm"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.asset.TextForm"] = true;
dojo.provide("scorll.asset.TextForm");






dojo.declare("scorll.asset.TextForm", [
    scorll.asset.AssetForm
    ], {
    widgetsInTemplate: true,
    templateString:"<div>\n\t<div style=\"width: 100%;\">\n\t\t<div dojoType=\"dojox.layout.TableContainer\" dojoAttachPoint=\"formContainer\" cols=\"1\" orientation=\"vert\" labelWidth=\"120\">\n\t\t\t<div dojoType=\"dijit.form.TextBox\" dojoAttachPoint=\"titleText\" title=\"Title (Optional)\" style=\"width:100%\"></div>\n\t\t\t<div dojoType=\"dijit.form.Textarea\" dojoAttachPoint=\"bodyText\" title=\"Text\" style=\"min-height: 100px;\"></div>\n\t\t</div>\n\t\t<div style=\"text-align: right;\">\n\t\t\t<div dojoType=\"dijit.form.Button\" dojoAttachEvent=\"onClick:submit\">Submit</div>\n\t\t\t<div dojoType=\"dijit.form.Button\" dojoAttachEvent=\"onClick:cancel\">Cancel</div>\n\t\t</div>\n\t</div>\n",
    postCreate: function() {
        this.formContainer.startup();
        if (!this.item.data) {
            this.item.data = {};
            this.item.data.text = this.getHelpText();
        }
        var data = this.item.data;
        if (data.title) {
            this.titleText.attr('value', data.title);
        }
        this.bodyText.attr('value', data.text);
    },
    submit: function() {
        var title = null;
        if (this.titleText.attr('value').trim() != '') {
            title = this.titleText.attr('value').trim();
        }
        var text = this.bodyText.attr('value').trim();
        var data = {};
        if (title) {
            data.title = title;
        }
        data.text = text;
        this.item.data = data;
        this.onSubmit(this.item);
    },
    cancel: function() {
        this.onCancel();
    },
    getHelpText: function() {
        return "This text will appear when you press 'Submit' button.\nEach new line becomes a paragraph.\nBasic Formatting:\n__underline__\n//italic//\n**bold**\n* list item\nLink: [[http://google.com]]\nLink with label: [[http://google.com Google]]";
    }
});

}

if(!dojo._hasResource["scorll.asset.Image"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.asset.Image"] = true;
dojo.provide("scorll.asset.Image");



dojo.declare("scorll.asset.Image", [
    scorll.asset.Asset
    ], {
    templateString:"<div>\n\t<img src=\"${item.data.url}\" />\n</div>\n"
});

}

if(!dojo._hasResource["scorll.asset.ImageForm"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.asset.ImageForm"] = true;
dojo.provide("scorll.asset.ImageForm");





dojo.declare("scorll.asset.ImageForm", [
    scorll.asset.AssetForm
    ], {
    widgetsInTemplate: true,
    templateString:"<div>\n\t<div style=\"width: 100%;\">\n\t\t<div dojoType=\"dojox.layout.TableContainer\" dojoAttachPoint=\"formContainer\" cols=\"1\" orientation=\"vert\" labelWidth=\"120\">\n\t\t\t<div dojoType=\"dijit.form.TextBox\" dojoAttachPoint=\"imageUrl\" title=\"Image Url\" style=\"width: 100%\"></div>\n\t\t</div>\n\t\t<div style=\"text-align: right;\">\n\t\t\t<div dojoType=\"dijit.form.Button\" dojoAttachEvent=\"onClick:submit\">Submit</div>\n\t\t\t<div dojoType=\"dijit.form.Button\" dojoAttachEvent=\"onClick:cancel\">Cancel</div>\n\t\t</div>\n\t</div>\n",
    postCreate: function() {
        this.formContainer.startup();
        if (!this.item.data) {
            return;
        }
        var data = this.item.data;
        if (data.url) {
            this.imageUrl.attr('value', data.url);
        }
    },
    submit: function() {
        var url = this.imageUrl.attr('value').trim();
        var data = {};
        data.url = url;
        this.item.data = data;
        this.onSubmit(this.item);
    },
    cancel: function() {
        this.onCancel();
    }
});

}

if(!dojo._hasResource["scorll.asset.MultipleChoice"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.asset.MultipleChoice"] = true;
dojo.provide("scorll.asset.MultipleChoice");





dojo.declare("scorll.asset.MultipleChoice", [
    scorll.asset.Asset,
    scorll.asset.Tracking
    ], {
    templateString:"<div>\n\t<div>${item.data.question}</div>\n</div>\n",
    responses: [],
    postCreate: function() {
        var asset = this;
        var data = this.item.data;
        asset.getTrackingResult(function(err, result) {
            if (result) {
                var learnerResponse = result.response;
                if (Array.isArray(learnerResponse)) asset.responses = learnerResponse;
            }
            if (data.answers) {
                for (var i in data.answers) {
                    var type = data.type || "radio";
                    var id = "interaction-" + asset.item.id + "-" + i;
                    var name = "interaction" + asset.item.id;
                    var value = i;
                    var label = data.answers[i];
                    var html = dojo.string.substitute('<p><label for="${0}">${1}</label></p>', [id, label]);
                    var p = dojo.place(html, asset.domNode);
                    // Checked
                    if (learnerResponse) {
                        if (Array.isArray(learnerResponse)) {
                            var checked = (learnerResponse.indexOf(i) > -1 && " checked") || "";
                        } else {
                            var checked = (learnerResponse == i && " checked") || "";
                        }
                    } else {
                        var checked = "";
                    }
                    html = dojo.string.substitute('<input type="${0}" id="${1}" name="${2}" value="${3}"${4}/>', [type, id, name, value, checked]);
                    var input = dojo.place(html, p, "first");
                    dojo.connect(input, "change", function() {
                        if (type == 'radio') {
                            var response = this.value;
                        } else {
                            if (this.checked) {
                                asset.responses.push(this.value);
                            } else {
                                asset.responses.splice(asset.responses.indexOf(this.value), 1);
                            }
                            var response = asset.responses;
                        }
                        var params = {
                            type: asset.TRACKING_TYPE.CHOICE,
                            response: response
                        };
                        asset.track(params, function(err) {
                            // TODO: You can add feedback here
                            console.log(arguments);
                        });
                    });

                }
            }
        });
    }
});

}

if(!dojo._hasResource["scorll.asset.MultipleChoiceForm"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.asset.MultipleChoiceForm"] = true;
dojo.provide("scorll.asset.MultipleChoiceForm");




dojo.declare("scorll.asset.MultipleChoiceForm", [
    scorll.asset.AssetForm
    ], {
    templateString:"<div>\n\t<div style=\"width: 100%;\">\n\t\t<div dojoType=\"dojox.layout.TableContainer\" dojoAttachPoint=\"formContainer\" cols=\"1\" orientation=\"vert\" labelWidth=\"120\">\n\t\t<div dojoType=\"dijit.form.Textarea\"\n\t\t\tdojoAttachPoint=\"questionBox\"\n            title=\"Question\"\n\t\t\tstyle=\"width: 100%; min-height: 21px;\" ></div>\n\t\t<div dojoType=\"dijit.form.Textarea\"\n\t\t\tdojoAttachPoint=\"answersBox\"\n            title=\"Answers\"\n\t\t\tstyle=\"width: 100%; min-height: 200px;\" ></div>\n        </div>\n\t\t<div style=\"text-align: right;\">\n\t\t\t<div dojoType=\"dijit.form.Button\"\n\t\t\t\tdojoAttachEvent=\"onClick:submit\">Submit</div>\n\t\t\t<div dojoType=\"dijit.form.Button\"\n\t\t\t\tdojoAttachEvent=\"onClick:cancel\">Cancel</div>\n\t\t</div>\n\t</div>\n",
    postCreate: function() {
        this.formContainer.startup();
        if (!this.item.data) {
            return;
        }
        var data = this.item.data;
        var correctResponse = data['correctResponses'] ? data.correctResponses[0] : [];
        this.questionBox.attr('value', data.question);
        if (data.answers) {
            var answersString = "";
            for (var i in data.answers) {
                var answerString = data.answers[i].trim();
                if (correctResponse.indexOf(i) > -1) {
                    answerString = "* " + answerString;
                }
                answersString += answerString + "\n";
            }
            this.answersBox.attr('value', answersString.trim());
        }
    },
    submit: function() {
        var question = this.questionBox.attr('value').trim();
        var answers = this.answersBox.attr('value').trim().split("\n");
        var correctResponse = [];
        for (var i in answers) {
            if (answers[i].indexOf("* ") == 0) {
                correctResponse.push(i);
                answers[i] = answers[i].slice(2);
            }
        }
        var data = {};
        data.type = correctResponse.length > 1 ? "checkbox" : "radio";
        data.question = question;
        data.answers = answers;
        data.correctResponses = [correctResponse];
        this.item.data = data;
        this.onSubmit(this.item);
    },
    cancel: function() {
        this.onCancel();
    }
});

}

if(!dojo._hasResource["scorll.asset.YouTube"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.asset.YouTube"] = true;
dojo.provide("scorll.asset.YouTube");



dojo.declare("scorll.asset.YouTube", [
    scorll.asset.Asset
    ], {
    templateString:"<div style=\"text-align: center\">\n\t<iframe title=\"YouTube video player\" width=\"640\" height=\"510\" src=\"http://www.youtube.com/embed/${item.data.video}?rel=0&wmode=transparent\" frameborder=\"0\" allowfullscreen></iframe>\n</div>\n"
});

}

if(!dojo._hasResource["scorll.asset.YouTubeForm"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.asset.YouTubeForm"] = true;
dojo.provide("scorll.asset.YouTubeForm");






dojo.declare("scorll.asset.YouTubeForm", [
    scorll.asset.AssetForm
    ], {
    widgetsInTemplate: true,
    templateString:"<div title=\"YouTube Video\">\n\t<div style=\"width: 100%;\">\n\t\t<div dojoType=\"dojox.layout.TableContainer\" dojoAttachPoint=\"formContainer\" cols=\"1\" labelWidth=\"120\">\n\t\t\t<div dojoType=\"dijit.form.TextBox\" dojoAttachPoint=\"videoUrl\" title=\"Video Url\" style=\"width: 100%\"></div>\n\t\t</div>\n\t\t<div style=\"text-align: right;\">\n\t\t\t<div dojoType=\"dijit.form.Button\" dojoAttachEvent=\"onClick:submit\">Submit</div>\n\t\t\t<div dojoType=\"dijit.form.Button\" dojoAttachEvent=\"onClick:cancel\">Cancel</div>\n\t\t</div>\n\t</div>\n",
    postCreate: function() {
        this.formContainer.startup();
        if (!this.item.data) {
            return;
        }
        var data = this.item.data;
        if (data.video) {
            var url = "http://www.youtube.com/watch?v=" + data.video;
            this.videoUrl.attr('value', url);
        }
    },
    submit: function() {
        var regex = new RegExp("v=([^&]+)");
        var match = regex.exec(this.videoUrl.attr('value').trim());
        var video = match[1];
        var data = {};
        data.video = video;
        this.item.data = data;
        this.onSubmit(this.item);
    },
    cancel: function() {
        this.onCancel();
    }
});

}

if(!dojo._hasResource["scorll.asset.SlideShare"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.asset.SlideShare"] = true;
dojo.provide("scorll.asset.SlideShare");



dojo.declare("scorll.asset.SlideShare", [
    scorll.asset.Asset
    ], {
    templateString:"<div style=\"text-align: center\">\n</div>\n"
});

}

if(!dojo._hasResource["dojo.io.script"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojo.io.script"] = true;
dojo.provide("dojo.io.script");

dojo.getObject("io", true, dojo);

/*=====
dojo.declare("dojo.io.script.__ioArgs", dojo.__IoArgs, {
	constructor: function(){
		//	summary:
		//		All the properties described in the dojo.__ioArgs type, apply to this
		//		type as well, EXCEPT "handleAs". It is not applicable to
		//		dojo.io.script.get() calls, since it is implied by the usage of
		//		"jsonp" (response will be a JSONP call returning JSON)
		//		or the response is pure JavaScript defined in
		//		the body of the script that was attached.
		//	callbackParamName: String
		//		Deprecated as of Dojo 1.4 in favor of "jsonp", but still supported for
		// 		legacy code. See notes for jsonp property.
		//	jsonp: String
		//		The URL parameter name that indicates the JSONP callback string.
		//		For instance, when using Yahoo JSONP calls it is normally,
		//		jsonp: "callback". For AOL JSONP calls it is normally
		//		jsonp: "c".
		//	checkString: String
		//		A string of JavaScript that when evaluated like so:
		//		"typeof(" + checkString + ") != 'undefined'"
		//		being true means that the script fetched has been loaded.
		//		Do not use this if doing a JSONP type of call (use callbackParamName instead).
		//	frameDoc: Document
		//		The Document object for a child iframe. If this is passed in, the script
		//		will be attached to that document. This can be helpful in some comet long-polling
		//		scenarios with Firefox and Opera.
		this.callbackParamName = callbackParamName;
		this.jsonp = jsonp;
		this.checkString = checkString;
		this.frameDoc = frameDoc;
	}
});
=====*/
(function(){
	var loadEvent = dojo.isIE ? "onreadystatechange" : "load",
		readyRegExp = /complete|loaded/;

	dojo.io.script = {
		get: function(/*dojo.io.script.__ioArgs*/args){
			//	summary:
			//		sends a get request using a dynamically created script tag.
			var dfd = this._makeScriptDeferred(args);
			var ioArgs = dfd.ioArgs;
			dojo._ioAddQueryToUrl(ioArgs);
	
			dojo._ioNotifyStart(dfd);

			if(this._canAttach(ioArgs)){
				var node = this.attach(ioArgs.id, ioArgs.url, args.frameDoc);

				//If not a jsonp callback or a polling checkString case, bind
				//to load event on the script tag.
				if(!ioArgs.jsonp && !ioArgs.args.checkString){
					var handle = dojo.connect(node, loadEvent, function(evt){
						if(evt.type == "load" || readyRegExp.test(node.readyState)){
							dojo.disconnect(handle);
							ioArgs.scriptLoaded = evt;
						}
					});
				}
			}

			dojo._ioWatch(dfd, this._validCheck, this._ioCheck, this._resHandle);
			return dfd;
		},
	
		attach: function(/*String*/id, /*String*/url, /*Document?*/frameDocument){
			//	summary:
			//		creates a new <script> tag pointing to the specified URL and
			//		adds it to the document.
			//	description:
			//		Attaches the script element to the DOM.  Use this method if you
			//		just want to attach a script to the DOM and do not care when or
			//		if it loads.
			var doc = (frameDocument || dojo.doc);
			var element = doc.createElement("script");
			element.type = "text/javascript";
			element.src = url;
			element.id = id;
			element.charset = "utf-8";
			return doc.getElementsByTagName("head")[0].appendChild(element);
		},
	
		remove: function(/*String*/id, /*Document?*/frameDocument){
			//summary: removes the script element with the given id, from the given frameDocument.
			//If no frameDocument is passed, the current document is used.
			dojo.destroy(dojo.byId(id, frameDocument));
			
			//Remove the jsonp callback on dojo.io.script, if it exists.
			if(this["jsonp_" + id]){
				delete this["jsonp_" + id];
			}
		},
	
		_makeScriptDeferred: function(/*Object*/args){
			//summary:
			//		sets up a Deferred object for an IO request.
			var dfd = dojo._ioSetArgs(args, this._deferredCancel, this._deferredOk, this._deferredError);
	
			var ioArgs = dfd.ioArgs;
			ioArgs.id = dojo._scopeName + "IoScript" + (this._counter++);
			ioArgs.canDelete = false;
	
			//Special setup for jsonp case
			ioArgs.jsonp = args.callbackParamName || args.jsonp;
			if(ioArgs.jsonp){
				//Add the jsonp parameter.
				ioArgs.query = ioArgs.query || "";
				if(ioArgs.query.length > 0){
					ioArgs.query += "&";
				}
				ioArgs.query += ioArgs.jsonp
					+ "="
					+ (args.frameDoc ? "parent." : "")
					+ dojo._scopeName + ".io.script.jsonp_" + ioArgs.id + "._jsonpCallback";
	
				ioArgs.frameDoc = args.frameDoc;
	
				//Setup the Deferred to have the jsonp callback.
				ioArgs.canDelete = true;
				dfd._jsonpCallback = this._jsonpCallback;
				this["jsonp_" + ioArgs.id] = dfd;
			}
			return dfd; // dojo.Deferred
		},
		
		_deferredCancel: function(/*Deferred*/dfd){
			//summary: canceller function for dojo._ioSetArgs call.
	
			//DO NOT use "this" and expect it to be dojo.io.script.
			dfd.canceled = true;
			if(dfd.ioArgs.canDelete){
				dojo.io.script._addDeadScript(dfd.ioArgs);
			}
		},
	
		_deferredOk: function(/*Deferred*/dfd){
			//summary: okHandler function for dojo._ioSetArgs call.
	
			//DO NOT use "this" and expect it to be dojo.io.script.
			var ioArgs = dfd.ioArgs;
	
			//Add script to list of things that can be removed.
			if(ioArgs.canDelete){
				dojo.io.script._addDeadScript(ioArgs);
			}
	
			//Favor JSONP responses, script load events then lastly ioArgs.
			//The ioArgs are goofy, but cannot return the dfd since that stops
			//the callback chain in Deferred. The return value is not that important
			//in that case, probably a checkString case.
			return ioArgs.json || ioArgs.scriptLoaded || ioArgs;
		},
	
		_deferredError: function(/*Error*/error, /*Deferred*/dfd){
			//summary: errHandler function for dojo._ioSetArgs call.
	
			if(dfd.ioArgs.canDelete){
				//DO NOT use "this" and expect it to be dojo.io.script.
				if(error.dojoType == "timeout"){
					//For timeouts, remove the script element immediately to
					//avoid a response from it coming back later and causing trouble.
					dojo.io.script.remove(dfd.ioArgs.id, dfd.ioArgs.frameDoc);
				}else{
					dojo.io.script._addDeadScript(dfd.ioArgs);
				}
			}
			console.log("dojo.io.script error", error);
			return error;
		},
	
		_deadScripts: [],
		_counter: 1,
	
		_addDeadScript: function(/*Object*/ioArgs){
			//summary: sets up an entry in the deadScripts array.
			dojo.io.script._deadScripts.push({id: ioArgs.id, frameDoc: ioArgs.frameDoc});
			//Being extra paranoid about leaks:
			ioArgs.frameDoc = null;
		},
	
		_validCheck: function(/*Deferred*/dfd){
			//summary: inflight check function to see if dfd is still valid.
	
			//Do script cleanup here. We wait for one inflight pass
			//to make sure we don't get any weird things by trying to remove a script
			//tag that is part of the call chain (IE 6 has been known to
			//crash in that case).
			var _self = dojo.io.script;
			var deadScripts = _self._deadScripts;
			if(deadScripts && deadScripts.length > 0){
				for(var i = 0; i < deadScripts.length; i++){
					//Remove the script tag
					_self.remove(deadScripts[i].id, deadScripts[i].frameDoc);
					deadScripts[i].frameDoc = null;
				}
				dojo.io.script._deadScripts = [];
			}
	
			return true;
		},
	
		_ioCheck: function(/*Deferred*/dfd){
			//summary: inflight check function to see if IO finished.
			var ioArgs = dfd.ioArgs;
			//Check for finished jsonp
			if(ioArgs.json || (ioArgs.scriptLoaded && !ioArgs.args.checkString)){
				return true;
			}
	
			//Check for finished "checkString" case.
			var checkString = ioArgs.args.checkString;
			if(checkString && eval("typeof(" + checkString + ") != 'undefined'")){
				return true;
			}
	
			return false;
		},
	
		_resHandle: function(/*Deferred*/dfd){
			//summary: inflight function to handle a completed response.
			if(dojo.io.script._ioCheck(dfd)){
				dfd.callback(dfd);
			}else{
				//This path should never happen since the only way we can get
				//to _resHandle is if _ioCheck is true.
				dfd.errback(new Error("inconceivable dojo.io.script._resHandle error"));
			}
		},
	
		_canAttach: function(/*Object*/ioArgs){
			//summary: A method that can be overridden by other modules
			//to control when the script attachment occurs.
			return true;
		},
		
		_jsonpCallback: function(/*JSON Object*/json){
			//summary:
			//		generic handler for jsonp callback. A pointer to this function
			//		is used for all jsonp callbacks.  NOTE: the "this" in this
			//		function will be the Deferred object that represents the script
			//		request.
			this.ioArgs.json = json;
		}
	};
})();

}

if(!dojo._hasResource["scorll.asset.SlideShareForm"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.asset.SlideShareForm"] = true;
dojo.provide("scorll.asset.SlideShareForm");







dojo.declare("scorll.asset.SlideShareForm", [
    scorll.asset.AssetForm
    ], {
    widgetsInTemplate: true,
    templateString:"<div>\n\t<div style=\"width: 100%;\">\n\t\t<div dojoType=\"dojox.layout.TableContainer\" dojoAttachPoint=\"formContainer\" cols=\"1\" labelWidth=\"120\">\n\t\t\t<div dojoType=\"dijit.form.TextBox\" dojoAttachPoint=\"slideShareUrl\" title=\"SlideShare URL\" style=\"width: 100%\"></div>\n\t\t</div>\n\t\t<div style=\"text-align: right;\">\n\t\t\t<div dojoType=\"dijit.form.Button\" dojoAttachEvent=\"onClick:submit\">Submit</div>\n\t\t\t<div dojoType=\"dijit.form.Button\" dojoAttachEvent=\"onClick:cancel\">Cancel</div>\n\t\t</div>\n\t</div>\n",
    postCreate: function() {
        this.formContainer.startup();
        if (!this.item.data) {
            return;
        }
        var data = this.item.data;
        if (data.url) {
            this.slideShareUrl.attr('value', data.url);
        }
    },
    submit: function() {
        var thisObject = this;
        var url = "http://www.slideshare.net/api/oembed/1?url=" + this.slideShareUrl.attr('value').trim() + "&format=json";
        dojo.io.script.get({
            url: url,
            preventCache: true,
            checkString: false,
            load: function(data) {
                console.log(data);
                var data = {};
                data.url = url;
                data.html = data.html
                thisObject.item.data = data;
                thisObject.onSubmit(thisObject.item);
            }
        });
    },
    cancel: function() {
        this.onCancel();
    }
});

}

if(!dojo._hasResource["scorll.asset.Scribd"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.asset.Scribd"] = true;
dojo.provide("scorll.asset.Scribd");



dojo.declare("scorll.asset.Scribd", [
    scorll.asset.Asset
    ], {
    templateString:"<div style=\"text-align: center\">\n    <iframe class=\"scribd_iframe_embed\"\n        id=\"${item.id}\"\n        src=\"http://www.scribd.com/embeds/${item.data.scribd}/content?start_page=1&view_mode=slideshow\"\n        data-auto-height=\"true\" data-aspect-ratio=\"0.772727272727273\"\n        scrolling=\"no\"\n        width=\"100%\" height=\"600\"\n        frameborder=\"0\"></iframe><script type=\"text/javascript\">(function() { var scribd = document.createElement(\"script\"); scribd.type = \"text/javascript\"; scribd.async = true; scribd.src = \"http://www.scribd.com/javascripts/embed_code/inject.js\"; var s = document.getElementsByTagName(\"script\")[0]; s.parentNode.insertBefore(scribd, s); })();</script>\n</div>\n"
});

}

if(!dojo._hasResource["scorll.asset.ScribdForm"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.asset.ScribdForm"] = true;
dojo.provide("scorll.asset.ScribdForm");






dojo.declare("scorll.asset.ScribdForm", [
    scorll.asset.AssetForm
    ], {
    widgetsInTemplate: true,
    templateString:"<div>\n\t<div style=\"width: 100%;\">\n\t\t<div dojoType=\"dojox.layout.TableContainer\" dojoAttachPoint=\"formContainer\" cols=\"1\" labelWidth=\"120\">\n\t\t\t<div dojoType=\"dijit.form.TextBox\" dojoAttachPoint=\"scribdUrl\" title=\"Scribd Url\" style=\"width: 100%\"></div>\n\t\t</div>\n\t\t<div style=\"text-align: right;\">\n\t\t\t<div dojoType=\"dijit.form.Button\" dojoAttachEvent=\"onClick:submit\">Submit</div>\n\t\t\t<div dojoType=\"dijit.form.Button\" dojoAttachEvent=\"onClick:cancel\">Cancel</div>\n\t\t</div>\n\t</div>\n",
    postCreate: function() {
        this.formContainer.startup();
        if (!this.item.data) {
            return;
        }
        var data = this.item.data;
        if (data.scribd) {
            var url = "http://www.scribd.com/doc/" + data.scribd + "/" + data.prettyUrl;
            this.scribdUrl.attr('value', url);
        }
    },
    submit: function() {
        var regex = new RegExp("/doc/([^/]+)/(.+)");
        var match = regex.exec(this.scribdUrl.attr('value').trim());
        var scribd = match[1];
        var prettyUrl = match[2];
        var data = {};
        data.scribd = scribd;
        data.prettyUrl = prettyUrl;
        this.item.data = data;
        this.onSubmit(this.item);
    },
    cancel: function() {
        this.onCancel();
    }
});

}

if(!dojo._hasResource["scorll.asset.Vimeo"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.asset.Vimeo"] = true;
dojo.provide("scorll.asset.Vimeo");



dojo.declare("scorll.asset.Vimeo", [
    scorll.asset.Asset
    ], {
    templateString:"<div style=\"text-align: center\">\n    <iframe src=\"http://player.vimeo.com/video/${item.data.video}?title=0&amp;byline=0&amp;portrait=0\" width=\"640\" height=\"510\" frameborder=\"0\"></iframe>\n</div>\n"
});

}

if(!dojo._hasResource["scorll.asset.VimeoForm"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.asset.VimeoForm"] = true;
dojo.provide("scorll.asset.VimeoForm");






dojo.declare("scorll.asset.VimeoForm", [
    scorll.asset.AssetForm
    ], {
    widgetsInTemplate: true,
    templateString:"<div title=\"Vimeo Video\">\n\t<div style=\"width: 100%;\">\n\t\t<div dojoType=\"dojox.layout.TableContainer\" dojoAttachPoint=\"formContainer\" cols=\"1\" labelWidth=\"120\">\n\t\t\t<div dojoType=\"dijit.form.TextBox\" dojoAttachPoint=\"videoUrl\" title=\"Video Url\" style=\"width: 100%\"></div>\n\t\t</div>\n\t\t<div style=\"text-align: right;\">\n\t\t\t<div dojoType=\"dijit.form.Button\" dojoAttachEvent=\"onClick:submit\">Submit</div>\n\t\t\t<div dojoType=\"dijit.form.Button\" dojoAttachEvent=\"onClick:cancel\">Cancel</div>\n\t\t</div>\n\t</div>\n",
    postCreate: function() {
        this.formContainer.startup();
        if (!this.item.data) {
            return;
        }
        var data = this.item.data;
        if (data.video) {
            var url = "http://www.vimeo.com/" + data.video;
            this.videoUrl.attr('value', url);
        }
    },
    submit: function() {
        var regex = new RegExp("com\/([^&]+)");
        var match = regex.exec(this.videoUrl.attr('value').trim());
        var video = match[1];
        var data = {};
        data.video = video;
        this.item.data = data;
        this.onSubmit(this.item);
    },
    cancel: function() {
        this.onCancel();
    }
});

}


dojo.i18n._preloadLocalizations("dojo.nls.scorll", ["ROOT","ar","ca","cs","da","de","de-de","el","en","en-gb","en-us","es","es-es","fi","fi-fi","fr","fr-fr","he","he-il","hu","it","it-it","ja","ja-jp","ko","ko-kr","nb","nl","nl-nl","pl","pt","pt-br","pt-pt","ru","sk","sl","sv","th","tr","xx","zh","zh-cn","zh-tw"]);
