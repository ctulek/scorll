Socrates.Asset = function(data) {
	this.data = data;
	this.id = data.id;
	this.asset = {};
	this.asset.title = "SAsset";
	this.render = function() {
		return this.begin() + this.body() + this.end();
	}
	this.begin = function() {
		var str  = "<div";
		str += this.id ? " id='" + this.id + "'" : "";
		str += ">";
		return str;
	}
	this.end = function() {
		return "</div>";
	}
	this.body = function() {
		return "Undefined";
	}
	this.editor = function(data) {
	}
}

Socrates.Asset.registeredClasses = {};
Socrates.Asset.register = function(c) {
	Socrates.Asset.registeredClasses[c.__type] = c;
}

Socrates.Asset.factory = function(data) {
	return new Socrates.Asset.registeredClasses[data.type](data);
}

Socrates.Text = function(data) {
	this.__proto__ = new Socrates.Asset(data);
	this.body = function() {
		var str = "";
		str += this.data.title ? "<h2>" + this.data.title + "</h2>" : "";
		str += this.data.text;
		return str;
	}
	this.editor = function(callback) {
		var data = this.data;
		var dialog = '<div id="newTextDialog">';
		dialog += '<form>';
		dialog += '<fieldset>';
		dialog += '<label for="text-title">Title (optional):</label>';
		dialog += '<input type="text" name="text-title" id="text-title"/>';
		dialog += '<label for="text-body">Text:</label>';
		dialog += '<textarea name="text-body" id="text-body"/>';
		dialog += '</fieldset>';
		dialog += '</form>';
		dialog += '</div>';
		dialog = $(dialog);
		$('body').append(dialog);
		console.log(dialog);
		$('#newTextDialog').dialog({
			modal: true,
			position: "center",
			title: "New Text",
			height: 300,
			width: 600,
			buttons: {
				Create: function() {
						data.title = $('#text-title').val().trim() != "" ? $('#text-title').val().trim() : null;
						data.text = $('#text-body').val();
						$(this).dialog("close");
				},
				Cancel: function() {
					$(this).dialog("close");
				}
			},
			close: function(event, ui) {
				if(data.text != null) {
					if(callback) {
						callback();
					}
				} else {
					if(callback) {
						callback("Canceled");
					}
				}
				$('#newTextDialog').remove();
			}
		});
	}
}
Socrates.Text.__type = "text";
Socrates.Asset.register(Socrates.Text);

Socrates.Image = function(data) {
	this.__proto__ = new Socrates.Asset(data);
	this.body = function() {
		var str = "<img src='";
		str += this.data.url;
		str += "'/>";
		return str;
	}
}
Socrates.Image.__type = "image";
Socrates.Asset.register(Socrates.Image);

Socrates.YouTube = function(data) {
	this.__proto__ = new Socrates.Asset(data);
	this.body = function() {
		return "<iframe title=\"YouTube video player\" width=\"640\" height=\"510\" src=\"http://www.youtube.com/embed/" + this.data.video + "?rel=0&wmode=transparent\" frameborder=\"0\" allowfullscreen></iframe>";
	}
}
Socrates.YouTube.__type = "youtube";
Socrates.Asset.register(Socrates.YouTube);

Socrates.Interaction = function(data) {
	this.__proto__ = new Socrates.Asset(data);
	this.body = function() {
		throw new Error("Undefind method");
	}
}

Socrates.MultipleChoice = function(data) {
	this.__proto__ = new Socrates.Interaction(data);
	this.body = function() {
		var str = "<p>" + this.data.question + "</p>";
		for(var i in this.data.answers) {
			str += "<p><input type='radio' name='choice_" + this.data.id + "' />" + this.data.answers[i] + "</p>";
		}
		return str;
	}
}
Socrates.MultipleChoice.__type = "multiplechoice";
Socrates.Asset.register(Socrates.MultipleChoice);
