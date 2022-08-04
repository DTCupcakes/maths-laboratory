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

// Add n to all values in array
function arrAdd(arr, n) {
  newArr = [];
  for (let i = 0; i < arr.length; i++) {
    newArr.push(arr[i] + n);
  }
  return newArr
}

// Multiply all values in array by n
function arrMult(arr, n) {
  newArr = [];
  for (let i = 0; i < arr.length; i++) {
    newArr.push(arr[i] * n);
  }
  return newArr
}

// Output y values where y = m*x+c
var linShift = 1960;
function linModel(xVal, m, c) {
  let yVal = [];
  for (let i = 0; i < xVal.length; i++) {
    yVal.push(m * (xVal[i] - linShift) + c)
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
  //this.name = 'Red';
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
  this.xaxis = {
    title: new Title(xLabel),
    range: xRange,
    linecolor: 'black',
    mirror: true,
    anchor: 'y1'
  };
  this.yaxis = {
    title: new Title(yLabel),
    range: yRange,
    linecolor: 'black',
    mirror: true,
    anchor: 'x1'
  };
}   

/* LINEAR PLOT */
// Linear model slope (m) slider
var linSlopeSliderScale = slope => 0.1 * slope;
var linSlopeSlider = document.getElementById("linSlope");
var linSlopeOutput = document.getElementById("linSlopeVal");
linSlopeOutput.innerHTML = linSlopeSliderScale(linSlopeSlider.value);

// Linear model y-intercept (c) slider
var linIceptSliderScale = std => 1 * std;
var linIceptSlider = document.getElementById("linIcept");
var linIceptOutput = document.getElementById("linIceptVal");
linIceptOutput.innerHTML = linIceptSliderScale(linIceptSlider.value);

let xLimLin = [1960, 2020];
let yLimLin = [300, 400];

// x values and initial y values
let xValLinear = arange(xLimLin[0],  xLimLin[1]+10, 1);
let yValLinear = linModel(xValLinear, linSlopeOutput.innerHTML, 300)

// Data
let traceLinear = new Trace(xValLinear, yValLinear);

// Plot layout
let xLabelLin = 'Year';
let yLabelLin = 'Carbon Dioxide Concentration (ppm)';
var layoutLinear = new Layout(xLabelLin, yLabelLin, xLimLin, yLimLin);
layoutLinear.width = 500;
layoutLinear.height = 500;

// Create plot
Plotly.newPlot('linModelPlot', {
  data: [traceLinear],
  layout: layoutLinear,
});

function sliderLinear(m,c) {
  var newY = linModel(xValLinear, m, c);
  var data = [new Trace(xValLinear, newY)];
  Plotly.react('linModelPlot', data, layoutLinear),
  Plotly.relayout('linModelPlot', layoutLinear)
}

linSlopeSlider.oninput = function() {
  let m = linSlopeSliderScale(this.value);
  let c = linIceptSliderScale(linIceptSlider.value);
  linSlopeOutput.innerHTML = m.toPrecision(2);
  sliderLinear(m,c);
}

linIceptSlider.oninput = function() {
  let m = linSlopeSliderScale(linSlopeSlider.value);
  let c = linIceptSliderScale(this.value);
  linIceptOutput.innerHTML = c;
  sliderLinear(m,c);
}

/* 1D GAUSSIAN PLOT */
// Fixed linear model parameters
const mFixed = 1.4;
const cFixed = 310;

// Define t slider
var tSliderScale = t => 1 * t;
var tSlider = document.getElementById("myt");
var tOutput = document.getElementById("tValue");
tOutput.innerHTML = tSliderScale(tSlider.value);

// Define mean calculation from fixed linear model parameters
var calcMean = t => mFixed * (t - linShift) + cFixed;
var meanOutput = document.getElementById("meanValue");
meanOutput.innerHTML = calcMean(tSlider.value);

// Define standard deviation slider
var stdSliderScale = std => 0.1 * std;
var stdSlider = document.getElementById("myStd");
var stdOutput = document.getElementById("stdValue");
stdOutput.innerHTML = stdSliderScale(stdSlider.value);

// Plot fixed linear model
let yValLinFixed = linModel(xValLinear, mFixed, cFixed)

// Data
let traceLinFixed = new Trace(xValLinear, yValLinFixed);

// Axis limits for 1D Gaussian
let xLimGauss1D = yLimLin;
let yLimGauss1D = [0, 0.45];

// Create data for 1D Gaussian in y
let xValGauss1D = arange(xLimGauss1D[0], xLimGauss1D[1], 0.1);
let yValGauss1D = Gauss1D(xValGauss1D, meanOutput.innerHTML, stdOutput.innerHTML);

// Plot 1D Gaussian in y
var traceGauss1D = new Trace(xValGauss1D, yValGauss1D);
traceGauss1D.line.color = 'rgb(0, 0, 255)';
traceGauss1D.xaxis = 'x2';
traceGauss1D.yaxis = 'y2';

// Function for rotating 1D Gaussian onto time vs Co2 plot
function rotGauss1D(Gauss1D, t) {
  var LinGauss1D = arrMult(Gauss1D, 50);
  var LinGauss1D = arrAdd(LinGauss1D, t);
  return LinGauss1D
}

// Plot 1D Gaussian on CO2 vs time plot
var yValLinGauss1D = rotGauss1D(yValGauss1D, 1980);
var traceLinGauss1D = new Trace(yValLinGauss1D, xValGauss1D);
traceLinGauss1D.line.color = traceGauss1D.line.color;

// Plot layout
xLabelGauss1D = yLabelLin;
yLabelGauss1D = 'Probability';
var layoutGauss1D = {
  width: 650,
  height: 500,
  xaxis: {
    title: new Title(xLabelLin),
    range: xLimLin,
    linecolor: 'black',
    mirror: true,
    anchor: 'y1',
    domain: [0, 0.45]
  },
  yaxis: {
    title: new Title(yLabelLin),
    range: yLimLin,
    linecolor: 'black',
    mirror: true,
    anchor: 'x1',
    domain: [0.1, 0.9]
  },
  xaxis2: {
    title: new Title(xLabelGauss1D),
    range: xLimGauss1D,
    linecolor: 'black',
    mirror: true,
    anchor: 'y2',
    domain: [0.6, 1]
  },
  yaxis2: {
    title: new Title(yLabelGauss1D),
    range: yLimGauss1D,
    linecolor: 'black',
    mirror: true,
    anchor: 'x2'
  },
  grid: {rows: 1, columns: 2, pattern: 'independent'},
  showlegend: false
};

// Data for subplots
var dataGauss1D = [traceLinFixed, traceGauss1D, traceLinGauss1D];

// Create plot
Plotly.newPlot('linGauss1DPlot', {
  data: dataGauss1D,
  layout: layoutGauss1D,
});

// Things for all sliders to do upon input
function sliderGauss1D(t, mean, std) {
  var newY = Gauss1D(xValGauss1D, mean, std);
  var traceGauss1D = new Trace(xValGauss1D, newY);
  traceGauss1D.line.color = 'rgb(0, 0, 255)';
  traceGauss1D.xaxis = 'x2';
  traceGauss1D.yaxis = 'y2';
  var yValLinGauss1D = rotGauss1D(newY, t);
  var traceLinGauss1D = new Trace(yValLinGauss1D, xValGauss1D);
  traceLinGauss1D.line.color = 'rgb(0, 0, 255)';
  var dataGauss1D = [traceLinFixed, traceGauss1D, traceLinGauss1D];
  Plotly.react('linGauss1DPlot', dataGauss1D, layoutGauss1D),
  Plotly.relayout('linGauss1DPlot', layoutGauss1D)
}

tSlider.oninput = function() {
  let t = tSliderScale(this.value);
  let mean = calcMean(t);
  let std = stdSliderScale(stdSlider.value);
  tOutput.innerHTML = t;
  meanOutput.innerHTML = mean;
  sliderGauss1D(t, mean, std);
}

stdSlider.oninput = function() {
  let t = tSliderScale(tSlider.value);
  let mean = calcMean(t);
  let std = stdSliderScale(this.value);
  stdOutput.innerHTML = std;
  sliderGauss1D(t, mean, std);
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