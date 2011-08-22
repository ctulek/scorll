/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["scorll.asset.PieChart"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.asset.PieChart"] = true;
dojo.provide("scorll.asset.PieChart");

dojo.require("scorll.asset.Asset");

dojo.declare("scorll.asset.PieChart", [
  scorll.asset.Asset
  ], {
  templateString:"<div>\n    <div id=\"chart-${item.id}\">Loading Chart...</div>\n",
  postCreate: function () {
    var asset = this;
    var data = asset.item.data;
    var values = data.values.split("\n");
    var title = data.title;

    google.load("visualization", "1", {
      callback: g,
      packages: ["corechart"]
    });

    function g() {
      var dataT = new google.visualization.DataTable();
      dataT.addColumn('string');
      dataT.addColumn('number');
      dataT.addRows(values.length);
      for (var i = 0; i < values.length; i++) {
        var tokens = values[i].split(" ");
        dataT.setValue(i, 0, tokens.slice(1).join(" "));
        dataT.setValue(i, 1, tokens[0] * 1);
      }

      var chart = new
      google.visualization.PieChart(document.getElementById('chart-' + asset.item.id));
      var titleTextStyle = {
        fontSize: 16,
        fontName: "Beteckna, Georgia, 'Verdana', 'Helvetica Neue', Helvetica, Arial, default"
      }
      chart.draw(dataT, {
        width: 700,
        height: 400,
        title: title,
        titleTextStyle: titleTextStyle
      });
    }
  }
});

}
