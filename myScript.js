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

// Create an array of shape filled with value
function fillArr(shape, value) {
  var newArr = new Array(shape);
  for (let i = 0; i < newArr.length; i++) {
    newArr[i] = value;
  }
  return newArr
}

// Get dimesions of an array
function getDim(arr) {
  var dim = [];
  moreDim = true; // True while more dimensions to array
  while (moreDim === true) {
    if (Array.isArray(arr)) {
      dim.push(arr.length);
    } else {
      moreDim = false;
    }
    arr = arr[0];
  }
  return dim
}

// Reshape 1D array into 2 dimensions
function reshape2D(arr, dim) {
  mat2D = [];
  for (let i = 0; i < dim[0]; i++) {
    var row = [];
    for (let j = 0; j < dim[1]; j++) {
      row.push(arr[i*dim[1]+j])
    }
    mat2D.push(row);
  }
  return mat2D
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
  var arrDim = getDim(arr); // Array dimensions
  arr = arr.flat(); // Flatten array into 1D
  var newArr = [];
  for (let i = 0; i < arr.length; i++) {
    newArr.push(arr[i] * n);
  }
  if (arrDim.length === 2) {
    newArr = reshape2D(newArr, arrDim);
  }
  return newArr
}

// Subtract one (1D or 2D) matrix from another
function matMinus(mat1, mat2) {
  var matDim = getDim(mat1); // Matrix dimensions
  mat1 = mat1.flat();
  mat2 = mat2.flat();
  var matNew = Array(mat1.length);
  for (let i = 0; i < mat1.length; i++) {
  matNew[i] = mat1[i] - mat2[i];
  } 
  matNew = reshape2D(matNew, matDim);
  return matNew
}

// Return transpose of a 2D matrix
function transp2D(mat) {
  var matDim = getDim(mat);
  var newMat = [];
  for (let i = 0; i < matDim[1]; i++) {
    var row = [];
    for (let j = 0; j < matDim[0]; j++) {
      row.push(mat[j][i]) 
    }
    newMat.push(row)
  }
  return newMat
}

// Return the product of two matrices
function matMult(mat1, mat2) {
  var mat1Dim = getDim(mat1);
  var mat2Dim = getDim(mat2);
  mat2 = transp2D(mat2);
  var matNew = [];
  for (let i = 0; i < mat2Dim[1]; i++) {
    let row =  [];
    for (let j = 0; j < mat1Dim[0]; j++) {
      prod = 0;
      for (let k = 0; k < mat1Dim[1]; k++) {
        prod += mat1[j][k] * mat2[i][k];
      }
      row.push(prod);
    }
    matNew.push(row)
  }
  return transp2D(matNew)
}

// Return determinant of a 2x2 matrix
function det2D(mat) {
  return mat[0][0] * mat[1][1] - mat[0][1] * mat[1][0]
}

// Return inverse of a 2x2 matrix
function inv2D(mat) {
  var det = det2D(mat);
  var adj = [[mat[1][1], -1*mat[0][1]], [-1*mat[1][0], mat[0][0]]];
  return arrMult(adj, 1 / det)
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

// Output 2D Gaussian
function Gauss2D(xVal, yVal, means, corr) {
  let zVal = [];
  for (let i = 0; i < yVal.length; i++) {
    var row = [];
    for (let j = 0; j < xVal.length; j++) {
      var x = [[xVal[j]], [yVal[i]]];
      var coeff = 1 / (Math.sqrt((2 * Math.PI)**2 * det2D(corr)));
      var diff = matMinus(x, means);
      var power1 = matMult(inv2D(corr), diff);
      var power2 = matMult(transp2D(diff), power1);
      var power = arrMult(power2, -0.5);
      var G = coeff * Math.exp(power);
      row.push(G);
    }
    zVal.push(row);
  }
  return zVal
}

// Calculate Gaussian value n sigma away from mean
var OneSigma = (stdt, stdy) => Math.exp(-2) / (2 * Math.PI * stdt * stdy);
var TwoSigma = (stdt, stdy) => Math.exp(-4) / (2 * Math.PI * stdt * stdy);

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
let xValLinear = arange(xLimLin[0],  xLimLin[1]+10, 20);
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
let xValGauss1D = arange(xLimGauss1D[0], xLimGauss1D[1], 1);
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
var traceDotGauss1D = new Trace(fillArr(xValGauss1D.length, 1980), xValGauss1D)
traceDotGauss1D.line.color = traceLinGauss1D.line.color;
traceDotGauss1D.line.dash = 'dot';

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
var dataGauss1D = [
  traceLinFixed, 
  traceGauss1D, 
  traceLinGauss1D,
  traceDotGauss1D
];

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
  var traceDotGauss1D = new Trace(fillArr(xValGauss1D.length, t), xValGauss1D)
  traceDotGauss1D.line.color = traceLinGauss1D.line.color;
  traceDotGauss1D.line.dash = 'dot';
  var dataGauss1D = [
    traceLinFixed, 
    traceGauss1D, 
    traceLinGauss1D,
    traceDotGauss1D
  ];
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

/* 2D Gaussian Plot */
// Define t slider
var meant2DSliderScale = tSliderScale;
var meant2DSlider = document.getElementById("meant2D");
var meant2DOutput = document.getElementById("meant2DValue");
meant2DOutput.innerHTML = meant2DSliderScale(meant2DSlider.value);

// Define mean calculation from fixed linear model parameters
var calcMeany2D = calcMean;
var meany2DOutput = document.getElementById("meany2DValue");
meany2DOutput.innerHTML = calcMeany2D(meant2DSlider.value);

// Define standard deviation (in t) slider
var stdt2DSliderScale = stdSliderScale;
var stdt2DSlider = document.getElementById("stdt2D");
var stdt2DOutput = document.getElementById("stdt2DVal");
stdt2DOutput.innerHTML = stdt2DSliderScale(stdt2DSlider.value);

// Define standard deviation (in y) slider
var stdy2DSliderScale = stdSliderScale;
var stdy2DSlider = document.getElementById("stdy2D");
var stdy2DOutput = document.getElementById("stdy2DVal");
stdy2DOutput.innerHTML = stdy2DSliderScale(stdy2DSlider.value);

// Axis limits for Gaussian in t
let xLimGauss2Dt = [1960, 2020];
let yLimGauss2Dt = [0, 0.45];

// Create data for Gaussian in t
let xValGauss2Dt = arange(xLimGauss2Dt[0], xLimGauss2Dt[1], 1);
let yValGauss2Dt = Gauss1D(xValGauss2Dt, meant2DOutput.innerHTML, stdt2DOutput.innerHTML);

// Plot Gaussian in t
//var traceGauss2Dt = new Trace(xValGauss2Dt, yValGauss2Dt);
var traceGauss2Dt = {
  type: 'scatter',
  x: xValGauss2Dt,
  y: yValGauss2Dt,
  mode: 'lines',
  //this.name = 'Red';
  line: {
    color: 'rgb(0, 255, 0)',
    width: 3,
  },
  xaxis: 'x2',
  yaxis: 'y2'
};

// Plot Gaussian in t on CO2 vs time plot
var yValLinGauss2Dt = rotGauss1D(yValGauss2Dt, 338);
var traceLinGauss2Dt = new Trace(xValGauss2Dt, yValLinGauss2Dt);
traceLinGauss2Dt.line.color = traceGauss2Dt.line.color;
var traceDotGauss2Dt = new Trace(xValGauss2Dt, fillArr(yValGauss2Dt.length, 338))
traceDotGauss2Dt.line.color = traceLinGauss2Dt.line.color;
traceDotGauss2Dt.line.dash = 'dot';

// Axis limits for Gaussian in y
let xLimGauss2Dy = yLimLin;
let yLimGauss2Dy = yLimGauss1D;

// Create data for Gaussian in t
let xValGauss2Dy = arange(xLimGauss2Dy[0], xLimGauss2Dy[1], 1);
let yValGauss2Dy = Gauss1D(xValGauss2Dy, meany2DOutput.innerHTML, stdy2DOutput.innerHTML);

// Plot Gaussian in t
var traceGauss2Dy = new Trace(xValGauss2Dy, yValGauss2Dy);
traceGauss2Dy.line.color = 'rgb(0, 0, 255)';
traceGauss2Dy.xaxis = 'x3';
traceGauss2Dy.yaxis = 'y3';

// Plot Gaussian in y on CO2 vs time plot
var yValLinGauss2Dy = rotGauss1D(yValGauss2Dy, 1980);
var traceLinGauss2Dy = new Trace(yValLinGauss2Dy, xValGauss2Dy);
traceLinGauss2Dy.line.color = traceGauss2Dy.line.color;
var traceDotGauss2Dy = new Trace(fillArr(xValGauss2Dy.length, 1980), xValGauss2Dy)
traceDotGauss2Dy.line.color = traceLinGauss2Dy.line.color;
traceDotGauss2Dy.line.dash = 'dot';

// Create trace for contour plot
var means2D = [[1980], [338]];
var corr2D = [[1, 0], [0, 1]];
var zValGauss2D = Gauss2D(xValGauss2Dt, xValGauss2Dy, means2D, corr2D);
var traceGauss2DContour = {
  z: zValGauss2D,
  x: xValGauss2Dt,
  y: xValGauss2Dy,
  type:'contour',
  colorscale: 'Greys',
  contours: {
    start: 0,
    end: OneSigma(1,1),
    size: 0.5 * OneSigma(1,1)
  }
}

// Plot layout
var xLabelGauss2Dt = xLabelLin;
var yLabelGauss2Dt = 'Probability';
var layoutGauss2D = {
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
    title: new Title(xLabelGauss2Dt),
    range: xLimGauss2Dt,
    linecolor: 'black',
    mirror: true,
    domain: [0.6, 1],
    anchor: 'y2'
  },
  yaxis2: {
    title: new Title(yLabelGauss2Dt),
    range: yLimGauss2Dt,
    linecolor: 'black',
    mirror: true,
    domain: [0.6, 1],
    anchor: 'x2'
  },
  xaxis3: {
    title: new Title(xLabelGauss1D),
    range: xLimGauss2Dy,
    linecolor: 'black',
    mirror: true,
    domain: [0.6, 1],
    anchor: 'y3'
  },
  yaxis3: {
    title: new Title(yLabelGauss1D),
    range: yLimGauss2Dy,
    linecolor: 'black',
    mirror: true,
    domain: [0, 0.4],
    anchor: 'x3'
  },
  grid: {rows: 1, columns: 2, pattern: 'independent'},
  showlegend: false
};

// Data for subplots
var dataGauss2D = [
  traceLinFixed, 
  traceGauss2Dt, 
  traceLinGauss2Dt,
  traceDotGauss2Dt, 
  traceGauss2Dy,
  traceLinGauss2Dy,
  traceDotGauss2Dy,
  traceGauss2DContour
];

// Create plot
Plotly.newPlot('Gauss2DPlot', {
  data: dataGauss2D,
  layout: layoutGauss2D,
});

// Things for all sliders to do upon input
function sliderGauss2D(meant, meany, stdt, stdy) {
  var newGausst = Gauss1D(xValGauss2Dt, meant, stdt);
  var traceGauss2Dt = new Trace(xValGauss2Dt, newGausst);
  traceGauss2Dt.line.color = 'rgb(0, 255, 0)';
  traceGauss2Dt.xaxis = 'x2';
  traceGauss2Dt.yaxis = 'y2';
  var newGaussy = Gauss1D(xValGauss2Dy, meany, stdy);
  var traceGauss2Dy = new Trace(xValGauss2Dy, newGaussy);
  traceGauss2Dy.line.color = 'rgb(0, 0, 255)';
  traceGauss2Dy.xaxis = 'x3';
  traceGauss2Dy.yaxis = 'y3';
  var yValLinGauss2Dt = rotGauss1D(newGausst, meany);
  var traceLinGauss2Dt = new Trace(xValGauss2Dt, yValLinGauss2Dt);
  traceLinGauss2Dt.line.color = 'rgb(0, 255, 0)';
  var traceDotGauss2Dt = new Trace(xValGauss2Dt, fillArr(yValGauss2Dt.length, meany))
  traceDotGauss2Dt.line.color = traceLinGauss2Dt.line.color;
  traceDotGauss2Dt.line.dash = 'dot';
  var yValLinGauss2Dy = rotGauss1D(newGaussy, meant);
  var traceLinGauss2Dy = new Trace(yValLinGauss2Dy, xValGauss2Dy);
  traceLinGauss2Dy.line.color = 'rgb(0, 0, 255)';
  var traceDotGauss2Dy = new Trace(fillArr(xValGauss2Dy.length, meant), xValGauss2Dy)
  traceDotGauss2Dy.line.color = traceLinGauss2Dy.line.color;
  traceDotGauss2Dy.line.dash = 'dot';
  var means2D = [[meant], [meany]];
  var corr2D = [[stdt**2, 0], [0, stdy**2]];
  var zValGauss2D = Gauss2D(xValGauss2Dt, xValGauss2Dy, means2D, corr2D);
  var traceGauss2DContour = {
    z: zValGauss2D,
    x: xValGauss2Dt,
    y: xValGauss2Dy,
    type:'contour',
    colorscale: 'Greys',
    contours: {
      start: 0,
      end: OneSigma(stdt, stdy),
      size: OneSigma(stdt, stdy)
    }
  }
  var dataGauss2D = [
    traceLinFixed, 
    traceGauss2Dt, 
    traceLinGauss2Dt,
    traceDotGauss2Dt, 
    traceGauss2Dy, 
    traceLinGauss2Dy,
    traceDotGauss2Dy,
    traceGauss2DContour
  ];
  Plotly.react('Gauss2DPlot', dataGauss2D, layoutGauss2D),
  Plotly.relayout('Gauss2DPlot', layoutGauss2D)
}

meant2DSlider.oninput = function() {
  let meant = meant2DSliderScale(this.value);
  let meany = calcMeany2D(meant);
  let stdt = stdt2DSliderScale(stdt2DSlider.value);
  let stdy = stdy2DSliderScale(stdy2DSlider.value);
  meant2DOutput.innerHTML = meant;
  meany2DOutput.innerHTML = meany;
  sliderGauss2D(meant, meany, stdt, stdy);
}

stdt2DSlider.oninput = function() {
  let meant = meant2DSliderScale(meant2DSlider.value);
  let meany = calcMeany2D(meant);
  let stdt = stdt2DSliderScale(this.value);
  let stdy = stdy2DSliderScale(stdy2DSlider.value);
  stdt2DOutput.innerHTML = stdt;
  sliderGauss2D(meant, meany, stdt, stdy);
}

stdy2DSlider.oninput = function() {
  let meant = meant2DSliderScale(meant2DSlider.value);
  let meany = calcMeany2D(meant);
  let stdt = stdt2DSliderScale(stdt2DSlider.value);
  let stdy = stdy2DSliderScale(this.value);
  stdy2DOutput.innerHTML = stdy;
  sliderGauss2D(meant, meany, stdt, stdy);
}

/* 2D Gaussian Plot with Correlation */
// Define t slider
var meantCorrSliderScale = tSliderScale;
var meantCorrSlider = document.getElementById("meantCorr");
var meantCorrOutput = document.getElementById("meantCorrValue");
meantCorrOutput.innerHTML = meantCorrSliderScale(meantCorrSlider.value);

// Define mean calculation from fixed linear model parameters
var calcMeanyCorr = calcMean;
var meanyCorrOutput = document.getElementById("meanyCorrValue");
meanyCorrOutput.innerHTML = calcMeanyCorr(meantCorrSlider.value);

// Define standard deviation (in t) slider
var stdtCorrSliderScale = stdSliderScale;
var stdtCorrSlider = document.getElementById("stdtCorr");
var stdtCorrOutput = document.getElementById("stdtCorrVal");
stdtCorrOutput.innerHTML = stdtCorrSliderScale(stdtCorrSlider.value);

// Define standard deviation (in y) slider
var stdyCorrSliderScale = stdSliderScale;
var stdyCorrSlider = document.getElementById("stdyCorr");
var stdyCorrOutput = document.getElementById("stdyCorrVal");
stdyCorrOutput.innerHTML = stdyCorrSliderScale(stdyCorrSlider.value);

// Define correlation coefficient slider
var rhoCorrSliderScale = rho => 0.1 * rho;
var rhoCorrSlider = document.getElementById("rhoCorr");
var rhoCorrOutput = document.getElementById("rhoCorrVal");
rhoCorrOutput.innerHTML = rhoCorrSliderScale(rhoCorrSlider.value);

// Axis limits for Gaussian in t
let xLimGaussCorrt = [1960, 2020];
let yLimGaussCorrt = [0, 0.45];

// Create data for Gaussian in t
let xValGaussCorrt = arange(xLimGaussCorrt[0], xLimGaussCorrt[1], 1);
let yValGaussCorrt = Gauss1D(xValGaussCorrt, meantCorrOutput.innerHTML, stdtCorrOutput.innerHTML);

// Plot Gaussian in t
//var traceGaussCorrt = new Trace(xValGaussCorrt, yValGaussCorrt);
var traceGaussCorrt = {
  type: 'scatter',
  x: xValGaussCorrt,
  y: yValGaussCorrt,
  mode: 'lines',
  //this.name = 'Red';
  line: {
    color: 'rgb(0, 255, 0)',
    width: 3,
  },
  xaxis: 'x2',
  yaxis: 'y2'
};

// Plot Gaussian in t on CO2 vs time plot
var yValLinGaussCorrt = rotGauss1D(yValGaussCorrt, 338);
var traceLinGaussCorrt = new Trace(xValGaussCorrt, yValLinGaussCorrt);
traceLinGaussCorrt.line.color = traceGaussCorrt.line.color;
var traceDotGaussCorrt = new Trace(xValGaussCorrt, fillArr(yValGaussCorrt.length, 338))
traceDotGaussCorrt.line.color = traceLinGaussCorrt.line.color;
traceDotGaussCorrt.line.dash = 'dot';

// Axis limits for Gaussian in y
let xLimGaussCorry = yLimLin;
let yLimGaussCorry = yLimGauss1D;

// Create data for Gaussian in t
let xValGaussCorry = arange(xLimGaussCorry[0], xLimGaussCorry[1], 1);
let yValGaussCorry = Gauss1D(xValGaussCorry, meanyCorrOutput.innerHTML, stdyCorrOutput.innerHTML);

// Plot Gaussian in t
var traceGaussCorry = new Trace(xValGaussCorry, yValGaussCorry);
traceGaussCorry.line.color = 'rgb(0, 0, 255)';
traceGaussCorry.xaxis = 'x3';
traceGaussCorry.yaxis = 'y3';

// Plot Gaussian in y on CO2 vs time plot
var yValLinGaussCorry = rotGauss1D(yValGaussCorry, 1980);
var traceLinGaussCorry = new Trace(yValLinGaussCorry, xValGaussCorry);
traceLinGaussCorry.line.color = traceGaussCorry.line.color;
var traceDotGaussCorry = new Trace(fillArr(xValGaussCorry.length, 1980), xValGaussCorry)
traceDotGaussCorry.line.color = traceLinGaussCorry.line.color;
traceDotGaussCorry.line.dash = 'dot';

// Create trace for contour plot
var meansCorr = [[1980], [338]];
var corrCorr = [[1, 0], [0, 1]];
var zValGaussCorr = Gauss2D(xValGaussCorrt, xValGaussCorry, meansCorr, corrCorr);
var traceGaussCorrContour = {
  z: zValGaussCorr,
  x: xValGaussCorrt,
  y: xValGaussCorry,
  type:'contour',
  colorscale: 'Greys',
  contours: {
    start: 0,
    end: OneSigma(1,1),
    size: 0.5 * OneSigma(1,1)
  }
}

// Plot layout
var xLabelGaussCorrt = xLabelLin;
var yLabelGaussCorrt = 'Probability';
var layoutGaussCorr = {
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
    title: new Title(xLabelGaussCorrt),
    range: xLimGaussCorrt,
    linecolor: 'black',
    mirror: true,
    domain: [0.6, 1],
    anchor: 'y2'
  },
  yaxis2: {
    title: new Title(yLabelGaussCorrt),
    range: yLimGaussCorrt,
    linecolor: 'black',
    mirror: true,
    domain: [0.6, 1],
    anchor: 'x2'
  },
  xaxis3: {
    title: new Title(xLabelGauss1D),
    range: xLimGaussCorry,
    linecolor: 'black',
    mirror: true,
    domain: [0.6, 1],
    anchor: 'y3'
  },
  yaxis3: {
    title: new Title(yLabelGauss1D),
    range: yLimGaussCorry,
    linecolor: 'black',
    mirror: true,
    domain: [0, 0.4],
    anchor: 'x3'
  },
  grid: {rows: 1, columns: 2, pattern: 'independent'},
  showlegend: false
};

// Data for subplots
var dataGaussCorr = [
  traceLinFixed, 
  traceGaussCorrt, 
  traceLinGaussCorrt,
  traceDotGaussCorrt, 
  traceGaussCorry,
  traceLinGaussCorry,
  traceDotGaussCorry,
  traceGaussCorrContour
];

// Create plot
Plotly.newPlot('GaussCorrPlot', {
  data: dataGaussCorr,
  layout: layoutGaussCorr,
});

// Things for all sliders to do upon input
function sliderGaussCorr(meant, meany, stdt, stdy, rho) {
  var newGausst = Gauss1D(xValGaussCorrt, meant, stdt);
  var traceGaussCorrt = new Trace(xValGaussCorrt, newGausst);
  traceGaussCorrt.line.color = 'rgb(0, 255, 0)';
  traceGaussCorrt.xaxis = 'x2';
  traceGaussCorrt.yaxis = 'y2';
  var newGaussy = Gauss1D(xValGaussCorry, meany, stdy);
  var traceGaussCorry = new Trace(xValGaussCorry, newGaussy);
  traceGaussCorry.line.color = 'rgb(0, 0, 255)';
  traceGaussCorry.xaxis = 'x3';
  traceGaussCorry.yaxis = 'y3';
  var yValLinGaussCorrt = rotGauss1D(newGausst, meany);
  var traceLinGaussCorrt = new Trace(xValGaussCorrt, yValLinGaussCorrt);
  traceLinGaussCorrt.line.color = 'rgb(0, 255, 0)';
  var traceDotGaussCorrt = new Trace(xValGaussCorrt, fillArr(yValGaussCorrt.length, meany))
  traceDotGaussCorrt.line.color = traceLinGaussCorrt.line.color;
  traceDotGaussCorrt.line.dash = 'dot';
  var yValLinGaussCorry = rotGauss1D(newGaussy, meant);
  var traceLinGaussCorry = new Trace(yValLinGaussCorry, xValGaussCorry);
  traceLinGaussCorry.line.color = 'rgb(0, 0, 255)';
  var traceDotGaussCorry = new Trace(fillArr(xValGaussCorry.length, meant), xValGaussCorry)
  traceDotGaussCorry.line.color = traceLinGaussCorry.line.color;
  traceDotGaussCorry.line.dash = 'dot';
  var meansCorr = [[meant], [meany]];
  var corrCorr = [[stdt**2, rho * stdt * stdy], [rho * stdt * stdy, stdy**2]];
  var zValGaussCorr = Gauss2D(xValGaussCorrt, xValGaussCorry, meansCorr, corrCorr);
  var traceGaussCorrContour = {
    z: zValGaussCorr,
    x: xValGaussCorrt,
    y: xValGaussCorry,
    type:'contour',
    colorscale: 'Greys',
    contours: {
      start: 0,
      end: OneSigma(stdt, stdy),
      size: OneSigma(stdt, stdy)
    }
  }
  var dataGaussCorr = [
    traceLinFixed, 
    traceGaussCorrt, 
    traceLinGaussCorrt,
    traceDotGaussCorrt, 
    traceGaussCorry, 
    traceLinGaussCorry,
    traceDotGaussCorry,
    traceGaussCorrContour
  ];
  Plotly.react('GaussCorrPlot', dataGaussCorr, layoutGaussCorr),
  Plotly.relayout('GaussCorrPlot', layoutGaussCorr)
}

meantCorrSlider.oninput = function() {
  let meant = meantCorrSliderScale(this.value);
  let meany = calcMeanyCorr(meant);
  let stdt = stdtCorrSliderScale(stdtCorrSlider.value);
  let stdy = stdyCorrSliderScale(stdyCorrSlider.value);
  let rho = rhoCorrSliderScale(rhoCorrSlider.value);
  meantCorrOutput.innerHTML = meant;
  meanyCorrOutput.innerHTML = meany;
  sliderGaussCorr(meant, meany, stdt, stdy, rho);
}

stdtCorrSlider.oninput = function() {
  let meant = meantCorrSliderScale(meantCorrSlider.value);
  let meany = calcMeanyCorr(meant);
  let stdt = stdtCorrSliderScale(this.value);
  let stdy = stdyCorrSliderScale(stdyCorrSlider.value);
  let rho = rhoCorrSliderScale(rhoCorrSlider.value);
  stdtCorrOutput.innerHTML = stdt;
  sliderGaussCorr(meant, meany, stdt, stdy, rho);
}

stdyCorrSlider.oninput = function() {
  let meant = meantCorrSliderScale(meantCorrSlider.value);
  let meany = calcMeanyCorr(meant);
  let stdt = stdtCorrSliderScale(stdtCorrSlider.value);
  let stdy = stdyCorrSliderScale(this.value);
  let rho = rhoCorrSliderScale(rhoCorrSlider.value);
  stdyCorrOutput.innerHTML = stdy;
  sliderGaussCorr(meant, meany, stdt, stdy, rho);
}

rhoCorrSlider.oninput = function() {
  let meant = meantCorrSliderScale(meantCorrSlider.value);
  let meany = calcMeanyCorr(meant);
  let stdt = stdtCorrSliderScale(stdtCorrSlider.value);
  let stdy = stdyCorrSliderScale(stdyCorrSlider.value);
  let rho = rhoCorrSliderScale(this.value);
  rhoCorrOutput.innerHTML = rho;
  sliderGaussCorr(meant, meany, stdt, stdy, rho);
}
