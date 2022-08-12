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

// Squared-exponential kernel
function kernel_SE(t1, t2, l) {
  return Math.exp(-0.5 * Math.abs(t1 - t2)**2 / l)
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
  this.width = 500;
  this.height = 500;
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
  this.showlegend = false;
}

function LayoutGauss1D(xLabels, yLabels, xRanges, yRanges) {
  this.width = 650;
  this.height = 500;
  this.xaxis = {
    title: new Title(xLabels[0]),
    range: xRanges[0],
    linecolor: 'black',
    mirror: true,
    anchor: 'y1',
    domain: [0, 0.45]
  };
  this.yaxis = {
    title: new Title(yLabels[0]),
    range: yRanges[0],
    linecolor: 'black',
    mirror: true,
    anchor: 'x1',
    domain: [0.1, 0.9]
  };
  this.xaxis2 = {
    title: new Title(xLabels[1]),
    range: xRanges[1],
    linecolor: 'black',
    mirror: true,
    anchor: 'y2',
    domain: [0.6, 1]
  };
  this.yaxis2 = {
    title: new Title(yLabels[1]),
    range: yRanges[1],
    linecolor: 'black',
    mirror: true,
    anchor: 'x2'
  };
  this.grid = {rows: 1, columns: 2, pattern: 'independent'};
  this.showlegend = false;
};

function LayoutGauss2D(xLabels, yLabels, xRanges, yRanges) {
  this.width = 650;
  this.height = 500;
  this.xaxis = {
    title: new Title(xLabels[0]),
    range: xRanges[0],
    linecolor: 'black',
    mirror: true,
    anchor: 'y1',
    domain: [0, 0.45]
  };
  this.yaxis = {
    title: new Title(yLabels[0]),
    range: yRanges[0],
    linecolor: 'black',
    mirror: true,
    anchor: 'x1',
    domain: [0.1, 0.9]
  };
  this.xaxis2 = {
    title: new Title(xLabels[1]),
    range: xRanges[1],
    linecolor: 'black',
    mirror: true,
    domain: [0.6, 1],
    anchor: 'y2'
  };
  this.yaxis2 = {
    title: new Title(yLabels[1]),
    range: yRanges[1],
    linecolor: 'black',
    mirror: true,
    domain: [0.6, 1],
    anchor: 'x2'
  };
  this.xaxis3 = {
    title: new Title(xLabels[2]),
    range: xRanges[2],
    linecolor: 'black',
    mirror: true,
    domain: [0.6, 1],
    anchor: 'y3'
  };
  this.yaxis3 = {
    title: new Title(yLabels[2]),
    range: yRanges[2],
    linecolor: 'black',
    mirror: true,
    domain: [0, 0.4],
    anchor: 'x3'
  };
  this.grid = {rows: 1, columns: 2, pattern: 'independent'};
  this.showlegend = false;
};

function Slider(sliderID, outputID, sliderScale) {
  // sliderID: ID of the slider element in HTML
  // outputID: ID of the span showing the output of the slider in HTML
  this.slider = document.getElementById(sliderID);
  this.out = document.getElementById(outputID);
  this.scale = val => sliderScale * val;
  this.out.innerHTML = this.scale(this.slider.value);//.toPrecision(2);
}

/* General Plot Info (Linear) */
const xLimData = [1960, 2020];
const yLimData = [300, 400];
const xLabelData = 'Year';
const yLabelData = 'Carbon Dioxide Concentration (ppm)';

/* General Plot Info (Gaussian) */
const yLimGauss = [0, 0.45];
const yLabelGauss = 'Probability';

// Fixed linear model parameters
const mFixed = 1.4;
const cFixed = 310;

// Plot labels and ranges
const xLabelsGauss1D = [xLabelData, yLabelData];
const yLabelsGauss1D = [yLabelData, yLabelGauss]
const xRangesGauss1D = [xLimData, yLimData];
const yRangesGauss1D = [yLimData, yLimGauss];
const xLabelsGauss2D = [xLabelData, xLabelData, yLabelData];
const yLabelsGauss2D = [yLabelData, yLabelGauss, yLabelGauss];
const xRangesGauss2D = [xLimData, xLimData, yLimData];
const yRangesGauss2D = [yLimData, yLimGauss, yLimGauss];

/* BASIC DATA PLOT */
// Create plot
var layoutData = new Layout(xLabelData, yLabelData, xLimData, yLimData);
var dataPlot = document.getElementById("dataPlot");
Plotly.newPlot(dataPlot, {
  data: [],
  layout: layoutData,
});

/* DATA PLOT WITH PREDICTIONS */
let xLimPred = [1960, 2040];
let yLimPred = [300, 420];

// Data
let pred1 = [[2035], [415]];
let pred2 = [[2035], [320]];
let tracePred1 = {
  type: 'scatter',
  x: pred1[0],
  y: pred1[1]
}
let tracePred2 = {
  type: 'scatter',
  x: pred2[0],
  y: pred2[1]
}

// Create plot
var layoutPred = new Layout(xLabelData, yLabelData, xLimPred, yLimPred);
var predPlot = document.getElementById("predPlot");
Plotly.newPlot(predPlot, {
  data: [tracePred1, tracePred2],
  layout: layoutPred,
});

/* DATA WITH UNCERTAINTIES PLOT */
// Plot layout
var layoutUnc = new Layout(xLabelData, yLabelData, xLimData, yLimData);
var uncPlot = document.getElementById("uncPlot");
Plotly.newPlot(uncPlot, {
  data: [],
  layout: layoutUnc,
});

/* LINEAR MODEL PLOT */
// Linear model sliders
var linSlope = new Slider('linSlope', 'linSlopeVal', 0.1); // Slope (m)
var linIcept = new Slider('linIcept', 'linIceptVal', 1); // y-intercept (c)

// x values and initial y values
let xValLinear = arange(xLimData[0],  xLimData[1]+10, 20);
let yValLinear = linModel(xValLinear, linSlope.out.innerHTML, 300)

// Data
let traceLinear = new Trace(xValLinear, yValLinear);

// Create plot
var layoutLinear = new Layout(xLabelData, yLabelData, xLimData, yLimData);
var linModelPlot = document.getElementById("linModelPlot");
Plotly.newPlot(linModelPlot, {
  data: [traceLinear],
  layout: layoutLinear,
});

function sliderLinear(m,c) {
  var newY = linModel(xValLinear, m, c);
  var data = [new Trace(xValLinear, newY)];
  Plotly.react(linModelPlot, data, layoutLinear),
  Plotly.relayout(linModelPlot, layoutLinear)
}

linSlope.slider.oninput = function() {
  let m = linSlope.scale(this.value);
  let c = linIcept.scale(linIcept.slider.value);
  linSlope.out.innerHTML = m.toPrecision(2);
  sliderLinear(m,c);
}

linIcept.slider.oninput = function() {
  let m = linSlope.scale(linSlope.slider.value);
  let c = linIcept.scale(this.value);
  linIcept.out.innerHTML = c;
  sliderLinear(m,c);
}

/* 1D GAUSSIAN PLOT */
// Define sliders
var t1D = new Slider('myt', 'tVal', 1); // t value
var std1D = new Slider('myStd', 'stdVal', 0.1); // standard deviation value

// Define mean calculation from fixed linear model parameters
var calcMean = t => mFixed * (t - linShift) + cFixed;
var meanOutput = document.getElementById("meanVal");
meanOutput.innerHTML = calcMean(t1D.slider.value);

// Plot fixed linear model
let yValLinFixed = linModel(xValLinear, mFixed, cFixed)

// Data
let traceLinFixed = new Trace(xValLinear, yValLinFixed);

// Create data for 1D Gaussian in y
let xValGauss1D = arange(yLimData[0], yLimData[1], 1);
let yValGauss1D = Gauss1D(xValGauss1D, meanOutput.innerHTML, std1D.out.innerHTML);

// Plot 1D Gaussian in y
var traceGauss1D = new Trace(xValGauss1D, yValGauss1D);
traceGauss1D.line.color = 'rgb(0, 0, 255)';
traceGauss1D.xaxis = 'x2';
traceGauss1D.yaxis = 'y2';

// Function for rotating 1D Gaussian onto time vs Co2 plot
function rotGauss1D(Gauss1D, shift) {
  var LinGauss1D = arrMult(Gauss1D, 50);
  var LinGauss1D = arrAdd(LinGauss1D, shift);
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
var layoutGauss1D = new LayoutGauss1D(xLabelsGauss1D, yLabelsGauss1D, xRangesGauss1D, yRangesGauss1D);

// Data for subplots
var dataGauss1D = [
  traceLinFixed, 
  traceGauss1D, 
  traceLinGauss1D,
  traceDotGauss1D
];

// Create plot
var linGauss1DPlot = document.getElementById("linGauss1DPlot");
Plotly.newPlot(linGauss1DPlot, {
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
  Plotly.react(linGauss1DPlot, dataGauss1D, layoutGauss1D),
  Plotly.relayout(linGauss1DPlot, layoutGauss1D)
}

t1D.slider.oninput = function() {
  let t = t1D.scale(this.value);
  let mean = calcMean(t);
  let std = std1D.scale(std1D.slider.value);
  t1D.out.innerHTML = t;
  meanOutput.innerHTML = mean;
  sliderGauss1D(t, mean, std);
}

std1D.slider.oninput = function() {
  let t = t1D.scale(t1D.slider.value);
  let mean = calcMean(t);
  let std = std1D.scale(this.value);
  std1D.out.innerHTML = std;
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

/* MONTHLY DATA PLOT */
// Create plot
var layoutMonth = new Layout(xLabelData, yLabelData, xLimData, yLimData);
var monthPlot = document.getElementById("monthPlot");
Plotly.newPlot(monthPlot, {
  data: [],
  layout: layoutMonth,
});

/* 2D GAUSSIAN PLOT */
// Define t slider
var meant2D = new Slider('meant2D', 'meant2DVal', 1); // mean t value
var stdt2D = new Slider('stdt2D', 'stdt2DVal', 0.1); // standard deviation in t
var stdy2D = new Slider('stdy2D', 'stdy2DVal', 0.1); // standard deviation in y

// Define mean calculation from fixed linear model parameters
var calcMeany2D = calcMean;
var meany2DOutput = document.getElementById("meany2DVal");
meany2DOutput.innerHTML = calcMeany2D(meant2D.out.innerHTML);

// Create data for Gaussian in t
let xValGauss2Dt = arange(xLimData[0], xLimData[1], 1);
let yValGauss2Dt = Gauss1D(xValGauss2Dt, meant2D.out.innerHTML, stdt2D.out.innerHTML);

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
var traceDotGauss2Dt = new Trace(xValGauss2Dt, fillArr(yValGauss2Dt.length, meany2DOutput.innerHTML))
traceDotGauss2Dt.line.color = traceLinGauss2Dt.line.color;
traceDotGauss2Dt.line.dash = 'dot';

// Create data for Gaussian in t
let xValGauss2Dy = arange(yLimData[0], yLimData[1], 1);
let yValGauss2Dy = Gauss1D(xValGauss2Dy, meany2DOutput.innerHTML, stdy2D.out.innerHTML);

// Plot Gaussian in t
var traceGauss2Dy = new Trace(xValGauss2Dy, yValGauss2Dy);
traceGauss2Dy.line.color = 'rgb(0, 0, 255)';
traceGauss2Dy.xaxis = 'x3';
traceGauss2Dy.yaxis = 'y3';

// Plot Gaussian in y on CO2 vs time plot
var yValLinGauss2Dy = rotGauss1D(yValGauss2Dy, 1980);
var traceLinGauss2Dy = new Trace(yValLinGauss2Dy, xValGauss2Dy);
traceLinGauss2Dy.line.color = traceGauss2Dy.line.color;
var traceDotGauss2Dy = new Trace(fillArr(xValGauss2Dy.length, meant2D.out.innerHTML), xValGauss2Dy)
traceDotGauss2Dy.line.color = traceLinGauss2Dy.line.color;
traceDotGauss2Dy.line.dash = 'dot';

// Create trace for contour plot
var means2D = [[meant2D.out.innerHTML], [meany2DOutput.innerHTML]];
var corr2D = [[stdt2D.out.innerHTML**2, 0], [0, stdy2D.out.innerHTML**2]];
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
var layoutGauss2D = new LayoutGauss2D(xLabelsGauss2D, yLabelsGauss2D, xRangesGauss2D, yRangesGauss2D);

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
var Gauss2DPlot = document.getElementById("Gauss2DPlot");
Plotly.newPlot(Gauss2DPlot, {
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
  Plotly.react(Gauss2DPlot, dataGauss2D, layoutGauss2D),
  Plotly.relayout(Gauss2DPlot, layoutGauss2D)
}

meant2D.slider.oninput = function() {
  let meant = meant2D.scale(this.value);
  let meany = calcMeany2D(meant);
  let stdt = stdt2D.scale(stdt2D.slider.value);
  let stdy = stdy2D.scale(stdy2D.slider.value);
  meant2D.out.innerHTML = meant;
  meany2DOutput.innerHTML = meany;
  sliderGauss2D(meant, meany, stdt, stdy);
}

stdt2D.slider.oninput = function() {
  let meant = meant2D.scale(meant2D.slider.value);
  let meany = calcMeany2D(meant);
  let stdt = stdt2D.scale(this.value);
  let stdy = stdy2D.scale(stdy2D.slider.value);
  stdt2D.out.innerHTML = stdt;
  sliderGauss2D(meant, meany, stdt, stdy);
}

stdy2D.slider.oninput = function() {
  let meant = meant2D.scale(meant2D.slider.value);
  let meany = calcMeany2D(meant);
  let stdt = stdt2D.scale(stdt2D.slider.value);
  let stdy = stdy2D.scale(this.value);
  stdy2D.out.innerHTML = stdy;
  sliderGauss2D(meant, meany, stdt, stdy);
}

/* 2D GAUSSIAN PLOT WITH CORRELATION */
var meantCorr = new Slider('meantCorr', 'meantCorrVal', 1);  // Mean t value
var stdtCorr = new Slider('stdtCorr', 'stdtCorrVal', 0.1); // Standard deviation in t
var stdyCorr = new Slider('stdyCorr', 'stdyCorrVal', 0.1); // Standard deviation in y
var rhoCorr = new Slider('rhoCorr', 'rhoCorrVal', 0.1);  // Correlation coefficient

// Define mean calculation from fixed linear model parameters
var calcMeanyCorr = calcMean;
var meanyCorrOutput = document.getElementById("meanyCorrVal");
meanyCorrOutput.innerHTML = calcMeanyCorr(meantCorr.slider.value);

// Create data for Gaussian in t
let xValGaussCorrt = arange(xLimData[0], xLimData[1], 1);
let yValGaussCorrt = Gauss1D(xValGaussCorrt, meantCorr.out.innerHTML, stdtCorr.out.innerHTML);

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
var traceDotGaussCorrt = new Trace(xValGaussCorrt, fillArr(yValGaussCorrt.length, meanyCorrOutput.innerHTML))
traceDotGaussCorrt.line.color = traceLinGaussCorrt.line.color;
traceDotGaussCorrt.line.dash = 'dot';

// Create data for Gaussian in t
let xValGaussCorry = arange(yLimData[0], yLimData[1], 1);
let yValGaussCorry = Gauss1D(xValGaussCorry, meanyCorrOutput.innerHTML, stdyCorr.out.innerHTML);

// Plot Gaussian in t
var traceGaussCorry = new Trace(xValGaussCorry, yValGaussCorry);
traceGaussCorry.line.color = 'rgb(0, 0, 255)';
traceGaussCorry.xaxis = 'x3';
traceGaussCorry.yaxis = 'y3';

// Plot Gaussian in y on CO2 vs time plot
var yValLinGaussCorry = rotGauss1D(yValGaussCorry, 1980);
var traceLinGaussCorry = new Trace(yValLinGaussCorry, xValGaussCorry);
traceLinGaussCorry.line.color = traceGaussCorry.line.color;
var traceDotGaussCorry = new Trace(fillArr(xValGaussCorry.length, meantCorr.out.innerHTML), xValGaussCorry)
traceDotGaussCorry.line.color = traceLinGaussCorry.line.color;
traceDotGaussCorry.line.dash = 'dot';

// Create trace for contour plot
var meansCorr = [[meantCorr.out.innerHTML], [meanyCorrOutput.innerHTML]];
var corrCorr = [[stdtCorr.out.innerHTML**2, stdtCorr.out.innerHTML*stdyCorr.out.innerHTML*rhoCorr.out.innerHTML], 
                [stdtCorr.out.innerHTML*stdyCorr.out.innerHTML*rhoCorr.out.innerHTML, stdyCorr.out.innerHTML**2]
                ];
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
var layoutGaussCorr = new LayoutGauss2D(xLabelsGauss2D, yLabelsGauss2D, xRangesGauss2D, yRangesGauss2D);

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
var GaussCorrPlot = document.getElementById("GaussCorrPlot");
Plotly.newPlot(GaussCorrPlot, {
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
  Plotly.react(GaussCorrPlot, dataGaussCorr, layoutGaussCorr),
  Plotly.relayout(GaussCorrPlot, layoutGaussCorr)
}

meantCorr.slider.oninput = function() {
  let meant = meantCorr.scale(this.value);
  let meany = calcMeanyCorr(meant);
  let stdt = stdtCorr.scale(stdtCorr.slider.value);
  let stdy = stdyCorr.scale(stdyCorr.slider.value);
  let rho = rhoCorr.scale(rhoCorr.slider.value);
  meantCorr.out.innerHTML = meant;
  meanyCorrOutput.innerHTML = meany;
  sliderGaussCorr(meant, meany, stdt, stdy, rho);
}

stdtCorr.slider.oninput = function() {
  let meant = meantCorr.scale(meantCorr.slider.value);
  let meany = calcMeanyCorr(meant);
  let stdt = stdtCorr.scale(this.value);
  let stdy = stdyCorr.scale(stdyCorr.slider.value);
  let rho = rhoCorr.scale(rhoCorr.slider.value);
  stdtCorr.out.innerHTML = stdt;
  sliderGaussCorr(meant, meany, stdt, stdy, rho);
}

stdyCorr.slider.oninput = function() {
  let meant = meantCorr.scale(meantCorr.slider.value);
  let meany = calcMeanyCorr(meant);
  let stdt = stdtCorr.scale(stdtCorr.slider.value);
  let stdy = stdyCorr.scale(this.value);
  let rho = rhoCorr.scale(rhoCorr.slider.value);
  stdyCorr.out.innerHTML = stdy;
  sliderGaussCorr(meant, meany, stdt, stdy, rho);
}

rhoCorr.slider.oninput = function() {
  let meant = meantCorr.scale(meantCorr.slider.value);
  let meany = calcMeanyCorr(meant);
  let stdt = stdtCorr.scale(stdtCorr.slider.value);
  let stdy = stdyCorr.scale(stdyCorr.slider.value);
  let rho = rhoCorr.scale(this.value);
  rhoCorr.out.innerHTML = rho;
  sliderGaussCorr(meant, meany, stdt, stdy, rho);
}
