var Socrates = {};

Socrates.Stage = {
	render: function(content) {
		$(content.items).each(function(i, item) {
			var asset = Socrates.Asset.factory(item);
			Socrates.Stage.add(asset);
		});
		$('#stage').sortable();
		$('#stage').disableSelection();
	},

	add: function(asset) {
		$('#stage').append(asset.render());
		$('#notes').height($('#stage').height());
	}
}

