const url = "https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_annmean_mlo.txt"

/* FUNCTIONS FOR PLOTTING */
// Create an array from start to stop with size step between elements
function arange(start, stop, step) {
  linArr = [];
  for (let i = start; i < stop; i += step) {
    linArr.push(i);
  }
  return linArr
}

// Output y values where y = m*x+c
function linModel(xVal, m, c) {
  let yVal = [];
  for (let i = 0; i < xVal.length; i++) {
    yVal.push(m * (xVal[i] - 1960) + c)
}
  return yVal
}

// Output y values for 1D Gaussian
function Gauss1D(xVal, mean, std) {
  let yVal = [];
  for (let i = 0; i < xVal.length; i++) {
    let coeff = 1 / (Math.sqrt(2 * Math.PI * std**2));
    let exp = -0.5 * (xVal[i] - mean)**2 / std**2;
    let g = coeff * Math.exp(exp)
    yVal.push(g)
  }
  return yVal
}

/* OBJECT CONSTRUCTORS */
function Line() {
  this.color = 'rgb(219, 64, 82)';
  this.width = 3;
}

function Trace(xData, yData) {
  this.type = 'scatter';
  this.x = xData;
  this.y = yData;
  this.mode = 'lines';
  this.name = 'Red';
  this.line = new Line();
}

function Title(titleText) {
  this.text = titleText;
}

function Axis(titleText, range) {
  this.title = new Title(titleText);
  this.range = range;
  this.linecolor = 'black';
  this.mirror = true;
}

function Layout(xLabel, yLabel, xRange, yRange) {
  this.width = 500;
  this.height = 500;
  this.xaxis = {
    title: new Title(xLabel),
    range: xRange,
    linecolor: 'black',
    mirror: true
  };
  this.yaxis = {
    title: new Title(yLabel),
    range: yRange,
    linecolor: 'black',
    mirror: true
  };
}

/* LINEAR PLOT */
let xLimLin = [1960, 2020];
let yLimLin = [300, 400];

// x values and initial y values
let xValLinear = arange(xLimLin[0],  xLimLin[1]+10, 1);
let yValLinear = linModel(xValLinear, 0.1, 300)

// Data
let traceLinear = new Trace(xValLinear, yValLinear);

// Plot layout
let xLabelLin = 'Year';
let yLabelLin = 'Carbon Dioxide Concentration (ppm)';
var layoutLinear = new Layout(xLabelLin, yLabelLin, xLimLin, yLimLin);

// Create plot
Plotly.newPlot('linModelPlot', {
  data: [traceLinear],
  layout: layoutLinear,
});

// Linear model slope (m) slider
var linSlopeSliderScale = slope => 0.1 * slope;
var linSlopeSlider = document.getElementById("linSlope");
var linSlopeOutput = document.getElementById("linSlopeVal");
linSlopeOutput.innerHTML = linSlopeSliderScale(linSlopeSlider.value);

// LInear model y-intercept (c) slider
var linIceptSliderScale = std => 1 * std;
var linIceptSlider = document.getElementById("linIcept");
var linIceptOutput = document.getElementById("linIceptVal");
linIceptOutput.innerHTML = linIceptSliderScale(linIceptSlider.value);

linSlopeSlider.oninput = function() {
  let m = linSlopeSliderScale(this.value);
  let c = linIceptSliderScale(linIceptSlider.value);
  linSlopeOutput.innerHTML = m.toPrecision(2);
  var newY = linModel(xValLinear, m, c);
  var data = [new Trace(xValLinear, newY)];
  Plotly.react('linModelPlot', data, layoutLinear),
  Plotly.relayout('linModelPlot', layoutLinear)
}

linIceptSlider.oninput = function() {
  let m = linSlopeSliderScale(linSlopeSlider.value);
  let c = linIceptSliderScale(this.value);
  linIceptOutput.innerHTML = c;
  var newY = linModel(xValLinear, m, c);
  var data = [new Trace(xValLinear, newY)];
  Plotly.react('linModelPlot', data, layoutLinear),
  Plotly.relayout('linModelPlot', layoutLinear)
}

/* 1D GAUSSIAN PLOT */
// Axis limits for 1D Gaussian
let xLimGauss1D = yLimLin;
let yLimGauss1D = [0, 0.45];

// Data
let xValGauss1D = arange(xLimGauss1D[0], xLimGauss1D[1], 0.1);
//yValues = linModel(xValues, 2, 1);
let yValGauss1D = Gauss1D(xValGauss1D, 350, 1);

// Plot data
traceGauss1D = {
  type: 'scatter',
  x: xValGauss1D,
  y: yValGauss1D,
  xaxis: 'x2',
  yaxis: 'y2',
  mode: 'lines',
  name: 'Red',
  line: {
    color: 'rgb(219, 64, 82)',
    width: 3
  }
};

// Plot layout
var layoutGauss1D = {
  width: 500,
  height: 400,
  xaxis: {
    title: {text: 'Carbon Dioxide Concentration (ppm)'},
    range: xLimGauss1D,
    linecolor: 'black',
    mirror: true
  },
  yaxis: {
    //title: {text: 'Carbon Dioxide Concentration (ppm)'},
    range: yLimGauss1D,
    linecolor: 'black',
    mirror: true
  },
  grid: {rows: 1, columns: 2, pattern: 'independent'}
};

// Data for subplots
var dataGauss1D = [traceLinear, traceGauss1D];

// Create plot
Plotly.newPlot('linGauss1DPlot', {
  data: dataGauss1D,
  layout: layoutGauss1D,
});

// Update layout with slider movement
var updateGauss1D = layoutGauss1D;

var meanSliderScale = mean => 1 * mean;
var meanSlider = document.getElementById("myMean");
var meanOutput = document.getElementById("meanValue");
meanOutput.innerHTML = meanSliderScale(meanSlider.value);

var stdSliderScale = std => 1 * std;
var stdSlider = document.getElementById("myStd");
var stdOutput = document.getElementById("stdValue");
stdOutput.innerHTML = stdSliderScale(stdSlider.value);

meanSlider.oninput = function() {
  let mean = meanSliderScale(this.value);
  let std = stdSliderScale(stdSlider.value);
  meanOutput.innerHTML = mean;
  var newY = Gauss1D(xValGauss1D, mean, std);
  var traceGauss1D = {
    type: 'scatter',
    x: xValGauss1D,
    y: newY,
    xaxis: 'x2',
    yaxis: 'y2',
    mode: 'lines',
    name: 'Red',
    line: {
      color: 'rgb(219, 64, 82)',
      width: 3
    }
  };
  var dataGauss1D = [traceLinear, traceGauss1D];
  Plotly.react('linGauss1DPlot', dataGauss1D, layoutGauss1D),
  Plotly.relayout('linGauss1DPlot', updateGauss1D)
}

stdSlider.oninput = function() {
  let mean = meanSliderScale(meanSlider.value);
  let std = stdSliderScale(this.value);
  stdOutput.innerHTML = std;
  var newY = Gauss1D(xValGauss1D, mean, std);
  var traceGauss1D = {
    type: 'scatter',
    x: xValGauss1D,
    y: newY,
    xaxis: 'x2',
    yaxis: 'y2',
    mode: 'lines',
    name: 'Red',
    line: {
      color: 'rgb(219, 64, 82)',
      width: 3
    }
  };
  var dataGauss1D = [traceLinear, traceGauss1D];
  Plotly.react('linGauss1DPlot', dataGauss1D, layoutGauss1D),
  Plotly.relayout('linGauss1DPlot', updateGauss1D)
}

// Randomize button
/*function randomize() {
  Plotly.animate('linGauss1DPlot', {
    data: [{y: Gauss1D(xValues, 10*Math.random(), 1)}],
    transition: {
      duration: 500,
      easing: 'cubic-in-out'
    },
	  frame: {
		  duration: 500
	  }
  })
}*/