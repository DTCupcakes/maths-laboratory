const url = "https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_annmean_mlo.txt"

// Colours
const red = 'rgb(219, 64, 82)';
const blue = 'rgb(0, 0, 255)';
const green = 'rgb(0, 255, 0)';

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
    newArr.push(arr[i] + parseFloat(n)); // Ensure that number is float not string
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
  this.color = red;
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

function Axis(label, range, anchor, domain) {
  this.title = new Title(label);
  this.range = range;
  this.linecolor = 'black';
  this.mirror = true;
  this.anchor = anchor;
  this.domain = domain;
}

function Layout(xLabels, yLabels, xRanges, yRanges) {
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
const nullLabel = '';
const nullLim = [0, 0];
const xLimData = [1960, 2020];
const yLimData = [300, 400];
const xLabelData = 'Year';
const yLabelData = 'Carbon Dioxide Concentration (ppm)';
const xLabelsLin = [xLabelData, nullLabel, nullLabel];
const yLabelsLin = [yLabelData, nullLabel, nullLabel]
const xRangesLin = [xLimData, nullLim, nullLim];
const yRangesLin = [yLimData, nullLim, nullLim];

/* General Plot Info (Gaussian) */
const yLimGauss = [0, 0.45];
const yLabelGauss = 'Probability';

// Fixed linear model parameters
const mFixed = 1.4;
const cFixed = 310;

// Plot labels and ranges
const xLabelsGauss1D = [xLabelData, yLabelData, nullLabel];
const yLabelsGauss1D = [yLabelData, yLabelGauss, nullLabel]
const xRangesGauss1D = [xLimData, yLimData, nullLim];
const yRangesGauss1D = [yLimData, yLimGauss, nullLim];

const xLabelsGauss2D = [xLabelData, xLabelData, yLabelData];
const yLabelsGauss2D = [yLabelData, yLabelGauss, yLabelGauss];
const xRangesGauss2D = [xLimData, xLimData, yLimData];
const yRangesGauss2D = [yLimData, yLimGauss, yLimGauss];

/* BASIC DATA PLOT */
// Create layout
var layoutData = new Layout(xLabelsLin, yLabelsLin, xRangesLin, yRangesLin);
layoutData.xaxis.domain = [0, 1];
layoutData.yaxis.domain = [0, 1];

// Create plot
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

// Create layout
var layoutPred = new Layout(xLabelsLin, yLabelsLin, xRangesLin, yRangesLin);
layoutPred.xaxis.range = xLimPred;
layoutPred.yaxis.range = yLimPred;
layoutPred.xaxis.domain = [0, 1];
layoutPred.yaxis.domain = [0, 1];

// Create plot
var predPlot = document.getElementById("predPlot");
Plotly.newPlot(predPlot, {
  data: [tracePred1, tracePred2],
  layout: layoutPred,
});

/* DATA WITH UNCERTAINTIES PLOT */
// Plot layout
var layoutUnc = new Layout(xLabelsLin, yLabelsLin, xRangesLin, yRangesLin);
layoutUnc.xaxis.domain = [0, 1];
layoutUnc.yaxis.domain = [0, 1];
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

// Create layout
var layoutLinear = new Layout(xLabelsLin, yLabelsLin, xRangesLin, yRangesLin);
layoutLinear.xaxis.domain = [0, 1];
layoutLinear.yaxis.domain = [0, 1];

// Create plot
var linModelPlot = document.getElementById("linModelPlot");
Plotly.newPlot(linModelPlot, {
  data: [traceLinear],
  layout: layoutLinear,
});

// For sliders to do upon input
function sliderLin() {
  let m = linSlope.scale(linSlope.slider.value);
  let c = linIcept.scale(linIcept.slider.value);
  linSlope.out.innerHTML = m.toPrecision(2);
  linIcept.out.innerHTML = c.toPrecision(3);
  var newY = linModel(xValLinear, m, c);
  var data = [new Trace(xValLinear, newY)];
  Plotly.react(linModelPlot, data, layoutLinear),
  Plotly.relayout(linModelPlot, layoutLinear)
}

// Attach slider input function to sliders
linSlope.slider.oninput = sliderLin;
linIcept.slider.oninput = sliderLin;

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

// Function for rotating 1D Gaussian onto time vs Co2 plot
function rotGauss1D(GaussVal, shift) {
  var LinGaussMult = arrMult(GaussVal, 50);
  var LinGauss1D = arrAdd(LinGaussMult, shift);
  return LinGauss1D
}

function TraceGauss(xVal, yVal, shift, anchors, color, axSwap) {
  // shift: Shift for Gaussian to line up with mean on linear plot
  // anchors: Axis for Gaussian subplot
  // axSwap: true for Gaussian in t, false otherwise
  this.trace = new Trace(xVal, yVal);
  this.trace.line.color = color;
  this.trace.xaxis = anchors[0];
  this.trace.yaxis = anchors[1];
  var yValLin = rotGauss1D(yVal, shift);
  if (axSwap === true) { // Don't flip Gaussian on linear plot
    this.traceLin = new Trace(xVal, yValLin);
    this.traceDot = new Trace(xVal, fillArr(xVal.length, shift))
  } else { 
    this.traceLin = new Trace(yValLin, xVal);
    this.traceDot = new Trace(fillArr(xVal.length, shift), xVal) 
  }; 
  this.traceLin.line.color = color;
  this.traceDot.line.color = color;
  this.traceDot.line.dash = 'dot';
}
var traceGauss1D = new TraceGauss(xValGauss1D, yValGauss1D, t1D.out.innerHTML, ['x2', 'y2'], blue);

// Plot layout
var layoutGauss1D = new Layout(xLabelsGauss1D, yLabelsGauss1D, xRangesGauss1D, yRangesGauss1D);
layoutGauss1D.yaxis2.domain = [0, 1];

// Data for subplots
var dataGauss1D = [
  traceLinFixed,
  traceGauss1D.trace,
  traceGauss1D.traceLin,
  traceGauss1D.traceDot,
];

// Create plot
var linGauss1DPlot = document.getElementById("linGauss1DPlot");
Plotly.newPlot(linGauss1DPlot, {
  data: dataGauss1D,
  layout: layoutGauss1D,
});

// Things for sliders to do upon input
function sliderGauss1D() {
  let t = t1D.scale(t1D.slider.value);
  let mean = calcMean(t);
  let std = std1D.scale(std1D.slider.value);
  t1D.out.innerHTML = t.toPrecision(4);
  meanOutput.innerHTML = mean.toPrecision(3);
  std1D.out.innerHTML = std.toPrecision(2);
  var newY = Gauss1D(xValGauss1D, mean, std);
  var traceGauss1D = new TraceGauss(xValGauss1D, newY, t, ['x2', 'y2'], blue);
  var dataGauss1D = [
    traceLinFixed,
    traceGauss1D.trace,
    traceGauss1D.traceLin,
    traceGauss1D.traceDot,
  ];
  Plotly.react(linGauss1DPlot, dataGauss1D, layoutGauss1D),
  Plotly.relayout(linGauss1DPlot, layoutGauss1D)
}

// Attach slider input function to sliders
t1D.slider.oninput = sliderGauss1D;
std1D.slider.oninput = sliderGauss1D;

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
// Create layout
var layoutMonth = new Layout(xLabelsLin, yLabelsLin, xRangesLin, yRangesLin);
layoutMonth.xaxis.domain = [0, 1];
layoutMonth.yaxis.domain = [0, 1];

// Create plot
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

var traceGauss2Dt = new TraceGauss(xValGauss2Dt, yValGauss2Dt, meany2DOutput.innerHTML, ['x2', 'y2'], green, true);

// Create data for Gaussian in t
let xValGauss2Dy = arange(yLimData[0], yLimData[1], 1);
let yValGauss2Dy = Gauss1D(xValGauss2Dy, meany2DOutput.innerHTML, stdy2D.out.innerHTML);

var traceGauss2Dy = new TraceGauss(xValGauss2Dy, yValGauss2Dy, meant2D.out.innerHTML, ['x3', 'y3'], blue);

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
var layoutGauss2D = new Layout(xLabelsGauss2D, yLabelsGauss2D, xRangesGauss2D, yRangesGauss2D);

// Data for subplots
var dataGauss2D = [
  traceLinFixed, 
  traceGauss2Dt.trace, 
  traceGauss2Dt.traceLin,
  traceGauss2Dt.traceDot,
  traceGauss2Dy.trace, 
  traceGauss2Dy.traceLin,
  traceGauss2Dy.traceDot,
  traceGauss2DContour
];

// Create plot
var Gauss2DPlot = document.getElementById("Gauss2DPlot");
Plotly.newPlot(Gauss2DPlot, {
  data: dataGauss2D,
  layout: layoutGauss2D,
});

// Things for all sliders to do upon input
function sliderGauss2D() {
  let meant = meant2D.scale(meant2D.slider.value);
  let meany = calcMeany2D(meant);
  let stdt = stdt2D.scale(stdt2D.slider.value);
  let stdy = stdy2D.scale(stdy2D.slider.value);
  meant2D.out.innerHTML = meant.toPrecision(4);
  meany2DOutput.innerHTML = meany.toPrecision(3);
  stdt2D.out.innerHTML = stdt.toPrecision(2);
  stdy2D.out.innerHTML = stdy.toPrecision(2);
  var newGausst = Gauss1D(xValGauss2Dt, meant, stdt);
  var newGaussy = Gauss1D(xValGauss2Dy, meany, stdy);
  var traceGauss2Dt = new TraceGauss(xValGauss2Dt, newGausst, meany, ['x2', 'y2'], green, true);
  var traceGauss2Dy = new TraceGauss(xValGauss2Dy, newGaussy, meant, ['x3', 'y3'], blue);
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
    traceGauss2Dt.trace, 
    traceGauss2Dt.traceLin,
    traceGauss2Dt.traceDot,
    traceGauss2Dy.trace, 
    traceGauss2Dy.traceLin,
    traceGauss2Dy.traceDot,
    traceGauss2DContour
  ];
  Plotly.react(Gauss2DPlot, dataGauss2D, layoutGauss2D),
  Plotly.relayout(Gauss2DPlot, layoutGauss2D)
}

// Attach slider input function to sliders
meant2D.slider.oninput = sliderGauss2D;
stdt2D.slider.oninput = sliderGauss2D;
stdy2D.slider.oninput = sliderGauss2D;

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

var traceGaussCorrt = new TraceGauss(xValGaussCorrt, yValGaussCorrt, meanyCorrOutput.innerHTML, ['x2', 'y2'], green, true);

// Create data for Gaussian in t
let xValGaussCorry = arange(yLimData[0], yLimData[1], 1);
let yValGaussCorry = Gauss1D(xValGaussCorry, meanyCorrOutput.innerHTML, stdyCorr.out.innerHTML);

var traceGaussCorry = new TraceGauss(xValGaussCorry, yValGaussCorry, meantCorr.out.innerHTML, ['x3', 'y3'], blue);

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
var layoutGaussCorr = new Layout(xLabelsGauss2D, yLabelsGauss2D, xRangesGauss2D, yRangesGauss2D);

// Data for subplots
var dataGaussCorr = [
  traceLinFixed, 
  traceGaussCorrt.trace,
  traceGaussCorrt.traceLin,
  traceGaussCorrt.traceDot,  
  traceGaussCorry.trace,
  traceGaussCorry.traceLin,
  traceGaussCorry.traceDot,
  traceGaussCorrContour
];

// Create plot
var GaussCorrPlot = document.getElementById("GaussCorrPlot");
Plotly.newPlot(GaussCorrPlot, {
  data: dataGaussCorr,
  layout: layoutGaussCorr,
});

// Things for all sliders to do upon input
function sliderGaussCorr() {
  let meant = meantCorr.scale(meantCorr.slider.value);
  let meany = calcMeanyCorr(meant);
  let stdt = stdtCorr.scale(stdtCorr.slider.value);
  let stdy = stdyCorr.scale(stdyCorr.slider.value);
  let rho = rhoCorr.scale(rhoCorr.slider.value);
  meantCorr.out.innerHTML = meant.toPrecision(4);
  meanyCorrOutput.innerHTML = meany.toPrecision(3);
  stdtCorr.out.innerHTML = stdt.toPrecision(2);
  stdyCorr.out.innerHTML = stdy.toPrecision(2);
  rhoCorr.out.innerHTML = rho.toPrecision(2);
  var newGausst = Gauss1D(xValGaussCorrt, meant, stdt);
  var newGaussy = Gauss1D(xValGaussCorry, meany, stdy);
  var traceGaussCorrt = new TraceGauss(xValGaussCorrt, newGausst, meany, ['x2', 'y2'], green, true);
  var traceGaussCorry = new TraceGauss(xValGaussCorry, newGaussy, meant, ['x3', 'y3'], blue);
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
    traceGaussCorrt.trace,
    traceGaussCorrt.traceLin,
    traceGaussCorrt.traceDot,  
    traceGaussCorry.trace,
    traceGaussCorry.traceLin,
    traceGaussCorry.traceDot,
    traceGaussCorrContour
  ];
  Plotly.react(GaussCorrPlot, dataGaussCorr, layoutGaussCorr),
  Plotly.relayout(GaussCorrPlot, layoutGaussCorr)
}

// Attach slider input function to sliders
meantCorr.slider.oninput = sliderGaussCorr;
stdtCorr.slider.oninput = sliderGaussCorr;
stdyCorr.slider.oninput = sliderGaussCorr;
rhoCorr.slider.oninput = sliderGaussCorr;
