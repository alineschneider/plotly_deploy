
function init() {
  var selector = d3.select("#selDataset");
  
  d3.json("samples.json").then((data) => {
    console.log(data);
    // Add options to index.html dropdown
    var sampleNames = data.names;
    sampleNames.forEach((sample) => {
    selector
      .append("option")
      .text(sample)
      .property("value", sample);
    });

    // Get metadata (ID 940) for Demographic Info and Gauge chart
    var metaArray = data.metadata.filter(sampleObj => sampleObj.id == "940");
    var metaDict = metaArray[0];
    var wFreq = metaDict.wfreq;
    var PANEL = d3.select("#sample-metadata");
  
    // Populating initial metadata for ID 940
    PANEL.html("");
    PANEL.append("h6").text("ID: " + metaDict.id);
    PANEL.append("h6").text("ETHNICITY: " + metaDict.ethnicity);
    PANEL.append("h6").text("GENDER: " + metaDict.gender);
    PANEL.append("h6").text("AGE: " + metaDict.age);
    PANEL.append("h6").text("LOCATION: " + metaDict.location);
    PANEL.append("h6").text("BBTYPE: " + metaDict.bbtype);
    PANEL.append("h6").text("WFREQ: " + metaDict.wfreq);


    // Plot gauge chart
    var traceGauge = [{
      domain: { x: [0, 1], y: [0, 1] },
      value: wFreq,
      title: { text: "Belly Button Washing Frequency" },
      type: "indicator",
      mode: "gauge+number",
    }];
  
    var layoutGauge = { width: 600, height: 450, margin: { t: 0, b: 0 } };

    Plotly.newPlot('gauge', traceGauge, layoutGauge);

    // Get samples data (ID 940) for horizontal and bubble bar charts
    var samplesArray = data.samples.filter(sampleObj => sampleObj.id == "940");
    var resultDict = samplesArray[0];
    var otuIds = resultDict.otu_ids;
    var sampleValues = resultDict.sample_values;
    var otuLabels = resultDict.otu_labels;
    
    // Sort values by sample_values
    var otuSamplesList = [];
    for (var i = 0; i < otuIds.length; i++) {
      otuSamplesList.push({
        'otu_IDs': "OTU " + otuIds[i], 'sample_values': sampleValues[i]
      })
    };
    
    var sortedListDict = otuSamplesList.sort((a, b) => b.sample_values - a.sample_values);
    
    // Get the top 10 samples and their respective OTU IDs
    var yOtuIds = [];
    var xSampleValues = [];
    var tenIds = sortedListDict.slice(0, 10);
    tenIds.forEach(dict => {
      yOtuIds.push(dict.otu_IDs);
      xSampleValues.push(dict.sample_values)
    });
    
    // Plot the horizontal bar chart
    var traceBar = [{
      x: xSampleValues,
      y: yOtuIds,
      type: "bar",
      orientation: "h"
    }];

    var layoutBar = {
      title: "Top 10 bacterial species (OTUs)",
    };

    Plotly.newPlot("bar", traceBar, layoutBar);

    // Plot the bubble chart

    var traceBubble = [{
      x: otuIds,
      y: sampleValues,
      text: otuLabels,
      mode: 'markers',
      marker: {
        color: otuIds,
        size: sampleValues,
        colorscale: 'YlGnBu'
      }
    }];
    
    var layoutBubble = {
      showlegend: false,
      height: 600,
      width: 1100
    };
    
    Plotly.newPlot('bubble', traceBubble, layoutBubble);

  });

};
  
init();


function optionChanged(newSample) {
  buildMetadata(newSample);
  buildCharts(newSample);
};

function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {

    // Get metadata (ID 940) for Demographic Info and Gauge chart
    var metaArray = data.metadata.filter(sampleObj => sampleObj.id == sample);
    var metaDict = metaArray[0];
    var PANEL = d3.select("#sample-metadata");
  
    PANEL.html("");
    PANEL.append("h6").text("ID: " + metaDict.id);
    PANEL.append("h6").text("ETHNICITY: " + metaDict.ethnicity);
    PANEL.append("h6").text("GENDER: " + metaDict.gender);
    PANEL.append("h6").text("AGE: " + metaDict.age);
    PANEL.append("h6").text("LOCATION: " + metaDict.location);
    PANEL.append("h6").text("BBTYPE: " + metaDict.bbtype);
    PANEL.append("h6").text("WFREQ: " + metaDict.wfreq);
  });
};


function buildCharts(sample) {
  d3.json("samples.json").then((data) => {
    
    // Get samples data matching ID selected from the dropdown for horizontal and bubble bar charts
    var samplesArray = data.samples.filter(sampleObj => sampleObj.id == sample);
    var samplesDict = samplesArray[0];
    var otuIds = samplesDict.otu_ids;
    var sampleValues = samplesDict.sample_values;
    var otuLabels = samplesDict.otu_labels;

    var metaArray = data.metadata.filter(sampleObj => sampleObj.id == sample);
    var metaDict = metaArray[0];
    var wFreq = metaDict.wfreq;
    
    // Sort values by sample_values
    var otuSamplesList = [];
    for (var i = 0; i < otuIds.length; i++) {
      otuSamplesList.push({
        'otu_IDs': "OTU " + otuIds[i], 'sample_values': sampleValues[i]
      })
    };
    
    var sortedListDict = otuSamplesList.sort((a, b) => b.sample_values - a.sample_values);
    
    // Get the top 10 samples and their respective OTU IDs
    var yOtuIds = [];
    var tenOtuIds = sortedListDict.slice(0, 10);
    tenOtuIds.forEach(dict => yOtuIds.push(dict.otu_IDs));

    var xSampleValues = [];
    var tenSampleValues = sortedListDict.slice(0, 10);
    tenSampleValues.forEach(dict => xSampleValues.push(dict.sample_values));
    
    // Restyle the horizontal bar chart
    var updateBar = {
      x: [xSampleValues],
      y: [yOtuIds]
    };

    Plotly.restyle("bar", updateBar);

    // Restyle the bubble chart
    var updateBubble = {
      x: [otuIds],
      y: [sampleValues],
      text: [otuLabels],
      marker: [{
        color: otuIds,
        size: sampleValues,
        colorscale: 'YlGnBu'
      }]
    };
    
    Plotly.restyle('bubble', updateBubble);

    // Restyle gauge chart
    var updateGauge = {
      value: [wFreq]
    };
  
    Plotly.restyle('gauge', updateGauge);

  });

};