dojo.provide("scorll.asset.PieChart");

dojo.require("scorll.asset.Asset");

dojo.declare("scorll.asset.PieChart", [
  scorll.asset.Asset
  ], {
  templatePath: dojo.moduleUrl('scorll.asset', 'PieChart.html'),
  postCreate: function () {
    var asset = this;
    var data = asset.item.data;
    var values = data.values.split("\n");
    var title = "Title Title Title";

    google.load("visualization", "1", {callback:g, packages:["corechart"]});
    function g() {
      var dataT = new google.visualization.DataTable();
      dataT.addColumn('string');
      dataT.addColumn('number');
      dataT.addRows(values.length);
      for(var i = 0; i < values.length; i++) {
        var tokens = values[i].split(" ");
        dataT.setValue(i, 0, tokens.slice(1).join(" "));
        dataT.setValue(i, 1, tokens[0] * 1);
      }

      var chart = new
      google.visualization.PieChart(document.getElementById('chart-'+asset.item.id));
      chart.draw(dataT, {width: 700, height: 400, title: title});
    }
  }
});

