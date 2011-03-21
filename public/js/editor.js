Socrates.Editor = {
	newasset: function() {
		if($('#newAssetDialog').length == 0) {
			var dialog = "<div id='newAssetDialog'>";
			for(var type in Socrates.Asset.registeredClasses) {
				dialog += "<div onclick=\"Socrates.Editor.showeditor('" + type + "')\">" + type + "</div>";
			}
			dialog += "</div>";
			$('body').append(dialog);
		}

		$('#newAssetDialog').dialog({
			modal: true,
			position: "center",
			title: "New Asset",
			width: 460
				});
	},
	showeditor: function(type) {
		$('#newAssetDialog').dialog("close");
		var data = {type: type};
		var asset = Socrates.Asset.factory(data);
		asset.editor(function(err) {
			if(!err) {
				Socrates.Stage.add(asset);
			}
		});
	}
}
