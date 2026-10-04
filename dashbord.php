<H1 align=center>Sales Analytical Dashboard</H1>

<table>
 <tr>
    <td style="width: 750px;"><div id="wdr-component"></div>
    </td>
    
   <td><div id="googlechart-container1" style="width: 650px; height:400px;"></div>
   </td>
</tr>
  
 <tr>
    <td><div id="fusionmap-container" ></div>
    </td>
    
   <td><div id="googlechart-container" ></div>
   </td>
</tr>
</table>
<div id="wdr-component2"></div>
<link rel="stylesheet" type="text/css" href="https://cdn.webdatarocks.com/latest/webdatarocks.min.css" />

<script src="https://cdn.webdatarocks.com/latest/webdatarocks.toolbar.min.js"></script>
<script src="https://cdn.webdatarocks.com/latest/webdatarocks.js"></script>

<script src="https://cdn.webdatarocks.com/_codepen/webdatarocks.fusioncharts.js"></script>

<script src="https://static.fusioncharts.com/code/latest/fusioncharts.js"></script>

<script src="https://static.fusioncharts.com/code/latest/themes/fusioncharts.theme.fint.js"></script>

<script src="https://cdn.webdatarocks.com/latest/webdatarocks.googlecharts.js"></script>
<script src="https://www.gstatic.com/charts/loader.js"></script>
var pivot = new WebDataRocks({
    container: "#wdr-component",
    toolbar: true,
    height: 380,
    width: "100%",
    report: {
    dataSource: {
       "dataSourceType": "csv",
        "filename": "https://cdn.webdatarocks.com/data/data.csv"
    },
    "slice": {
        "rows": [
            {
                "uniqueName": "Country"
            }
        ],
        "columns": [
            {
                "uniqueName": "Category"
            },
            {
                "uniqueName": "Measures"
            }
        ],
        "measures": [
            {
                "uniqueName": "Price",
                "aggregation": "sum"
            }
        ]
    }
  },
});
reportcomplete: function() {
        pivot.off("reportcomplete");
        pivotTableReportComplete = true;
        createGoogleChart();
        createGoogleChart1();
        createFusionMap();
    }
	var pivotTableReportComplete = false;
var googleChartsLoaded = false;
google.charts.load('current', {
    'packages': ['corechart']
});
google.charts.setOnLoadCallback(onGoogleChartsLoaded);

Next, we will designate a function to create the charts:

function onGoogleChartsLoaded() {
    googleChartsLoaded = true;
    if (pivotTableReportComplete) {
        createGoogleChart();
        createGoogleChart1();
    }
}
function createGoogleChart() {
    if (googleChartsLoaded) {
        pivot.googlecharts.getData({
                type: "column"
            },
            drawChart,
            drawChart
        );
    }
}
function drawChart(_data) {
    var data = google.visualization.arrayToDataTable(_data.data);
    var options = {
        colors: ['#e44a00', '#ffeead', '#d9534f', '#ffad60', '#5bc0de', '#26827E']
    };
    var chart = new google.visualization.ColumnChart(document.getElementById('googlechart-container'));
    chart.draw(data, options);
}
function createGoogleChart1() {
    if (googleChartsLoaded) {
        pivot.googlecharts.getData({
                type: "pie"
            },
            drawChart1,
            drawChart1
        );
    }
}
function drawChart1(_data) {
    var data = google.visualization.arrayToDataTable(_data.data);
    var options = {
        legend: {
            position: 'top'
        },
        colors: ['#68AA23', '#3e6e0c', '#2b5202', '#558c1c', '#75b533', '#95e344']
    };
    var chart = new google.visualization.PieChart(document.getElementById('googlechart-container1'));
    chart.draw(data, options);
}
function createFusionMap() {
  var map = new FusionCharts({
    "type": "maps/worldwithcountries",
    
    "renderAt": "fusionmap-container",
    "width": "100%",
    "height": "400",
    "dataFormat": "json"
  });
pivot.fusioncharts.getData({
    type: "maps/" + map.chartType(),
    "slice": {
        "rows": [
            {
                "uniqueName": "Country"
            }
        ],
        "columns": [
            {
                "uniqueName": "Category"
            },
            {
                "uniqueName": "Measures"
            }
        ],
        "measures": [
            {
                "uniqueName": "Price",
                "aggregation": "sum"
            }
        ]
    }
  }, function(data) { 
    data.chart.showLabels = "0";
    data.chart.showCanvasBorder = "0";
    data.chart.theme = "fint";
    data.chart.nullEntityColor = "#cccccc";
    data.chart.nullEntityAlpha = "50";
    data.colorrange = {
      "minvalue": data.extradata.minValue,
      "startlabel": "Low",
      "endlabel": "High",
      "code": "#e44a00",
      "gradient": "1",
      "color": [
        {
          "maxvalue": data.extradata.maxValue,
          "code": "#6baa01"
        }
      ]
    };
    delete data.extradata;
    map.setJSONData(data);
    map.render();
  }, function(data) { 
    data.chart.showLabels = "0";
    data.chart.showCanvasBorder = "0";
    data.chart.theme = "fint";
    data.chart.nullEntityColor = "#cccccc";
    data.chart.nullEntityAlpha = "50";
    data.colorrange = {
      "minvalue": data.extradata.minValue,
      "startlabel": "Low",
      "endlabel": "High",
      "code": "#e44a00",
      "gradient": "1",
      "color": [
        {
          "maxvalue": data.extradata.maxValue,
          "code": "#6baa01"
        }
      ]
    };
    delete data.extradata;
    map.setJSONData(data);
  });
}
var pivot2 = new WebDataRocks({
    container: "#wdr-component2",
    height: 400,
    width: "100%",
    report: {
    "dataSource": {
        "dataSourceType": "csv",
        "filename": "https://cdn.webdatarocks.com/data/data.csv"
    },
    "slice": {
        "rows": [
            {
                "uniqueName": "Country"
            },
            {
                "uniqueName": "Business Type"
            },
            {
                "uniqueName": "Color"
            },
            {
                "uniqueName": "Destination"
            },
            {
                "uniqueName": "Discount"
            },
            {
                "uniqueName": "Quantity"
            },
            {
                "uniqueName": "Size"
            }
        ],
        "columns": [
            {
                "uniqueName": "Category"
            },
            {
                "uniqueName": "Measures"
            }
        ],
        "measures": [
            {
                "uniqueName": "Price",
                "aggregation": "sum"
            }
        ],
        "flatOrder": [
            "Country",
            "Category",
            "Price",
            "Business Type",
            "Color",
            "Destination",
            "Discount",
            "Quantity",
            "Size"
        ]
    },
    "options": {
        "grid": {
            "type": "flat"
        }
    }
  }
});