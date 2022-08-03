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

/* LINEAR PLOT */
let xLimits = [1960, 2020];
let yLimits = [300, 400];

// x values and initial y values
let xValLinear = arange(xLimits[0],  xLimits[1], 1);
let yValLinear = linModel(xValLinear, 1, 1)

// Data
traceLinear = {
  type: 'scatter',
  x: xValLinear,
  y: yValLinear,
  mode: 'lines',
  name: 'Red',
  line: {
    color: 'rgb(219, 64, 82)',
    width: 3
  }
};

// Plot layout
var layoutLinear = {
  width: 500,
  height: 500,
  xaxis: {range: xLimits},
  yaxis: {range: yLimits}
};

// Create plot
Plotly.newPlot('linModelPlot', {
  data: [traceLinear],
  layout: layoutLinear,
});

// Linear model slope (m) slider
var linSlopeSliderScale = slope => 1 * slope;
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
  linSlopeOutput.innerHTML = m;
  var newY = linModel(xValLinear, m, c);
  var data = [{
    type: 'scatter',
    x: xValLinear,
    y: newY,
    mode: 'lines',
    name: 'Red',
    line: {
      color: 'rgb(219, 64, 82)',
      width: 3
    }
  }]
  Plotly.react('linModelPlot', data, layoutLinear)
}

linIceptSlider.oninput = function() {
  let m = linSlopeSliderScale(linSlopeSlider.value);
  let c = linIceptSliderScale(this.value);
  linIceptOutput.innerHTML = c;
  var newY = linModel(xValLinear, m, c);
  var data = [{
    type: 'scatter',
    x: xValLinear,
    y: newY,
    mode: 'lines',
    name: 'Red',
    line: {
      color: 'rgb(219, 64, 82)',
      width: 3
    }
  }]
  Plotly.react('linModelPlot', data, layoutLinear)
}

/* 1D GAUSSIAN PLOT */
// Data
let xValues = arange(0, 10, 0.1);
//yValues = linModel(xValues, 2, 1);
yValues = Gauss1D(xValues, 5, 1);

// Plot data
trace = {
  type: 'scatter',
  x: xValues,
  y: yValues,
  mode: 'lines',
  name: 'Red',
  line: {
    color: 'rgb(219, 64, 82)',
    width: 3
  }
};

// Plot layout
var layout = {
  width: 500,
  height: 400,
  grid: {rows: 1, columns: 1, pattern: 'independent'}
};

// Create plot
Plotly.newPlot('myPlot', {
  data: [trace],
  layout: layout,
});

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
  var newY = Gauss1D(xValues, mean, std);
  var data = [{
    type: 'scatter',
    x: xValues,
    y: newY,
    mode: 'lines',
    name: 'Red',
    line: {
      color: 'rgb(219, 64, 82)',
      width: 3
    }
  }]
  Plotly.react('myPlot', data, layout)
}

stdSlider.oninput = function() {
  let mean = meanSliderScale(meanSlider.value);
  let std = stdSliderScale(this.value);
  stdOutput.innerHTML = std;
  var newY = Gauss1D(xValues, mean, std);
  var data = [{
    type: 'scatter',
    x: xValues,
    y: newY,
    mode: 'lines',
    name: 'Red',
    line: {
      color: 'rgb(219, 64, 82)',
      width: 3
    }
  }]
  Plotly.react('myPlot', data, layout)
}

// Randomize button
function randomize() {
  Plotly.animate('myPlot', {
    data: [{y: Gauss1D(xValues, 10*Math.random(), 1)}],
    transition: {
      duration: 500,
      easing: 'cubic-in-out'
    },
	  frame: {
		  duration: 500
	  }
  })
}