// Colours
const red = 'rgb(219, 64, 82)';
const blue = 'rgb(0, 0, 255)';
const green = 'rgb(0, 255, 0)';
const colours = ['black', 'purple', 'orange', 'magenta', 'gray'];

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
  var arrDim = getDim(arr); // Array dimensions
  arr = arr.flat(); // Flatten array into 1D
  var newArr = [];
  for (let i = 0; i < arr.length; i++) {
    newArr.push(arr[i] + parseFloat(n)); // Ensure that number is float not string
  }
  if (arrDim.length === 2) {
    newArr = reshape2D(newArr, arrDim);
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
function matAdd(mat1, mat2) {
  var matDim = getDim(mat1); // Matrix dimensions
  mat1 = mat1.flat();
  mat2 = mat2.flat();
  var matNew = Array(mat1.length);
  for (let i = 0; i < mat1.length; i++) {
    matNew[i] = mat1[i] + mat2[i];
  } 
  matNew = reshape2D(matNew, matDim);
  return matNew
}

function matMinus(mat1, mat2) {
  var mat2New = arrMult(mat2, -1);
  return matAdd(mat1, mat2New)
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

// Create identity matrix of dimension n
function identity(n) {
  var ident = [];
  for (let i = 0; i < n; i++) {
    var row = new Array(n)
    for (let j = 0; j < n; j++) {
      row[j] = 0;
    }
    row[i] = 1;
    ident.push(row)
  }
  return ident
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

// Create a 2D correlation matrix
function makeCorrMat2D(std1, std2, rho) {
  return [[std1**2, std1 * std2 * rho], [std1 * std2 * rho, std2**2]]
}

// Output y values where y = m*x+c
var linShift = 1980;
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

// Function for rotating 1D Gaussian onto time vs Co2 plot
function rotGauss1D(GaussVal, shift) {
  var LinGaussMult = arrMult(GaussVal, 50);
  var LinGauss1D = arrAdd(LinGaussMult, shift);
  return LinGauss1D
}

// Squared-exponential kernel
function kernel_SE(t1, t2, l) {
  return Math.exp(-0.5 * Math.abs(t1 - t2)**2 / l)
}

// Find array index corresponding to y1
function interpArg(y1, yLim, n) {
  // yLim[0] < y1 < yLim[1]
  // n is the array length between yLim[0] and yLim[1]
  let frac = (y1 - yLim[0]) / (yLim[1] - yLim[0]);
  return Math.round(frac * n)
}

// Create random samples from a 2D standard normal distribution
function BoxMuller() {
  var u = 0, v = 0;
  while(u === 0) u = Math.random(); // Convert [0,1) to (0,1)
  while(v === 0) v = Math.random();
  return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}

// Take a random sample of size n from a normal distriubtion
function randNorm1D(mean, std, n) {
  var randArr = []; // Array filled with random samples
  for (let i = 0; i < n; i++) {
    x = parseFloat(std) * BoxMuller() + parseFloat(mean);
    randArr.push(x);
  };
  return randArr
}

// Cholesky decomposition into the product of two matrices (LL^T)
function CholeskyDecomp(A, n) {
  var L = Array(n).fill(0).map(x => Array(n).fill(0));
 
  // Decomposing matrix into Lower Triangular
  for (var i = 0; i < n; i++) {
    for (var j = 0; j <= i; j++) {
      var sum = 0;
      for (var k = 0; k < j; k++) {
        sum += L[i][k] * L[j][k];
      }
      if (i === j) {
        L[i][j] = Math.sqrt(A[i][i] - sum);
      } else {
        L[i][j] = 1.0 / L[j][j] * (A[i][j] - sum);
      }
    }
  }
  return L
}

// Take a random sample from a 2D normal distribution
function randNorm2D(means, corr, n) {
  var eps = 0.001; // Very small number
  var K = matAdd(corr, arrMult(identity(2), eps));
  var L = CholeskyDecomp(K, 2);
  //Generate random samples
  var u = reshape2D(randNorm1D(0, 1, 2*n), [2, n]);
  console.log(matMult(L, u))
  return matAdd(means, matMult(L, u))
}
console.log('new')
var testMeans = [[1], [2]];
var testCorr = [[2, 1], [1, 2]];
var testSamples = randNorm2D(testMeans, testCorr, 10);
console.log(testSamples[0])

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

function TraceData(xData, yData, yErr) {
  this.type = 'scatter';
  this.x = xData;
  this.y = yData;
  this.mode = 'markers';
  this.marker = {
    color: 'black'
  };
  this.error_y = {
    type: 'data',
    array: yErr,
    visible: false,
  }
}

function TraceGauss(xVal, yVal, shift, anchors, color, axSwap) {
  // shift: Shift for Gaussian to line up with mean on linear plot
  // anchors: Axis for Gaussian subplot
  // axSwap: true for Gaussian in t, false otherwise
  this.axSwap = axSwap;

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

  this.update = function (newY, newShift) {
    this.trace.y = newY;
    if (this.axSwap === true) {
      this.traceLin.y = rotGauss1D(newY, newShift);
      this.traceDot.y = fillArr(newY.length, newShift);
    } else {
      this.traceLin.x = rotGauss1D(newY, newShift);
      this.traceDot.x = fillArr(newY.length, newShift);
    }
  }
}

function TraceContour(xVal, yVal, zVal) {
  this.z = zVal;
  this.x = xVal;
  this.y = yVal,
  this.type = 'contour';
  this.colorscale = 'Greys';
  this.contours = {
    start: 0,
    end: OneSigma(1,1),
    size: 0.5 * OneSigma(1,1)
  };
}

// Trace for data created by a button
function TraceButtonData(xData, yData, yDataGauss, anchors) {
  this.trace = {
    type: 'scatter',
    x: xData,
    y: yData,
    mode: 'markers',
    marker: {
      //color: 'black',
      //symbol: 'x',
      //size: 10,
    }
  };
  this.traceGauss = {
    type: 'scatter',
    x: yData,
    y: yDataGauss,
    xaxis: anchors[0],
    yaxis: anchors[1],
    mode: 'markers',
    marker: {
      //color: 'black',
      //symbol: 'x',
      //size: 10,
    }
  }
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

// Update plots with sliders and buttons
function plotUpdate(div, data, layout) {
  // div = HTML div containing the plot
  Plotly.react(div, data, layout),
  Plotly.relayout(div, layout)
}

/* General Plot Info (Linear) */
const nullLabel = '';
const nullLim = [0, 0];
const xLimData = [1980, 2040];
const yLimData = [300, 450];
const xLimMonth = [2000, 2020];
const xLabelData = 'Year';
const yLabelData = 'Carbon Dioxide Concentration (ppm)';
const xLabelsLin = [xLabelData, nullLabel, nullLabel];
const yLabelsLin = [yLabelData, nullLabel, nullLabel]
const xRangesLin = [xLimData, nullLim, nullLim];
const yRangesLin = [yLimData, nullLim, nullLim];

/* General Plot Info (Gaussians) */
const yLimGauss = [0, 0.45];
const yLabelGauss = 'Probability';

// Fixed linear model parameters
const mFixed = 1.9;
const cFixed = 335;
var calcMean = t => mFixed * (t - linShift) + cFixed; // Calculate mean from fixed model

// Plot labels and ranges
const xLabelsGauss1D = [xLabelData, yLabelData, nullLabel];
const yLabelsGauss1D = [yLabelData, yLabelGauss, nullLabel]
const xRangesGauss1D = [xLimData, yLimData, nullLim];
const yRangesGauss1D = [yLimData, yLimGauss, nullLim];

const xLabelsGauss2D = [xLabelData, xLabelData, yLabelData];
const yLabelsGauss2D = [yLabelData, yLabelGauss, yLabelGauss];
const xRangesGauss2D = [xLimData, xLimData, yLimData];
const yRangesGauss2D = [yLimData, yLimGauss, yLimGauss];

/* General Plot Info (Gaussian Processes) */
const xLabelsGP1 = [yLabelData, xLabelData, yLabelData];
const yLabelsGP1 = [yLabelData, yLabelData, yLabelGauss];
const xRangesGP1 = [yLimData, xLimData, yLimData];
const yRangesGP1 = [yLimData, yLimData, yLimGauss];

/* CO2 CONCENTRATION DATA */
var CO2Years = arange(1959, 2022, 1);
var CO2YearData = [
  315.98, 316.91, 317.64, 318.45, 318.99, 319.62, 320.04, 321.37, 322.18, 323.05,
  324.62, 325.68, 326.32, 327.46, 329.68, 330.19, 331.12, 332.03, 333.84, 335.41,
  336.84, 338.76, 340.12, 341.48, 343.15, 344.85, 346.35, 347.61, 349.31, 351.69,
  353.2,  354.45, 355.7,  356.54, 357.21, 358.96, 360.97, 362.74, 363.88, 366.84,
  368.54, 369.71, 371.32, 373.45, 375.98, 377.7,  379.98, 382.09, 384.02, 385.83,
  387.64, 390.1,  391.85, 394.06, 396.74, 398.81, 401.01, 404.41, 406.76, 408.72,
  411.66, 414.24, 416.45,
];
var CO2YearUnc = fillArr(CO2Years.length, 4);
var CO2Months = arange(1958 + 5/24, 2022 + 7/12, 1/12);
var CO2MonthData = [
  315.7,  317.45, 317.51, 317.24, 315.86, 314.93, 313.2,  312.43, 313.33, 314.67,
  315.58, 316.48, 316.65, 317.72, 318.29, 318.15, 316.54, 314.8,  313.84, 313.33,
  314.81, 315.58, 316.43, 316.98, 317.58, 319.03, 320.04, 319.59, 318.18, 315.9,
  314.17, 313.83, 315.,   316.19, 316.89, 317.7,  318.54, 319.48, 320.58, 319.77,
  318.57, 316.79, 314.99, 315.31, 316.1,  317.01, 317.94, 318.55, 319.68, 320.57,
  321.02, 320.62, 319.61, 317.4,  316.25, 315.42, 316.69, 317.7,  318.74, 319.07,
  319.86, 321.38, 322.25, 321.48, 319.74, 317.77, 316.21, 315.99, 317.07, 318.35,
  319.57, 320.01, 320.74, 321.84, 322.26, 321.89, 320.44, 318.69, 316.7,  316.87,
  317.68, 318.71, 319.44, 320.44, 320.89, 322.14, 322.17, 321.87, 321.21, 318.87,
  317.81, 317.3,  318.87, 319.42, 320.62, 321.6,  322.39, 323.7,  324.08, 323.75,
  322.38, 320.36, 318.64, 318.1,  319.78, 321.03, 322.33, 322.5,  323.04, 324.42,
  325.,   324.09, 322.54, 320.92, 319.25, 319.39, 320.73, 321.96, 322.57, 323.15,
  323.89, 325.02, 325.57, 325.36, 324.14, 322.11, 320.33, 320.25, 321.32, 322.89,
  324.,   324.42, 325.63, 326.66, 327.38, 326.71, 325.88, 323.66, 322.38, 321.78,
  322.86, 324.12, 325.06, 325.98, 326.93, 328.13, 328.08, 327.67, 326.34, 324.69,
  323.1,  323.06, 324.01, 325.13, 326.17, 326.68, 327.17, 327.79, 328.93, 328.57,
  327.36, 325.43, 323.36, 323.56, 324.8,  326.01, 326.77, 327.63, 327.75, 329.72,
  330.07, 329.09, 328.04, 326.32, 324.84, 325.2,  326.5,  327.55, 328.55, 329.56,
  330.3,  331.5,  332.48, 332.07, 330.87, 329.31, 327.51, 327.18, 328.16, 328.64,
  329.35, 330.71, 331.48, 332.65, 333.19, 332.2,  331.07, 329.15, 327.33, 327.28,
  328.31, 329.58, 330.73, 331.46, 331.94, 333.11, 333.95, 333.42, 331.97, 329.95,
  328.5,  328.36, 329.38, 330.62, 331.56, 332.74, 333.36, 334.74, 334.72, 333.98,
  333.08, 330.68, 328.96, 328.72, 330.16, 331.62, 332.68, 333.17, 334.96, 336.14,
  336.93, 336.17, 334.89, 332.56, 331.29, 331.28, 332.46, 333.6,  334.94, 335.26,
  336.66, 337.69, 338.02, 338.01, 336.5,  334.42, 332.36, 332.45, 333.76, 334.91,
  336.14, 336.69, 338.27, 338.82, 339.24, 339.26, 337.54, 335.72, 333.97, 334.24,
  335.32, 336.82, 337.9,  338.34, 340.07, 340.93, 341.45, 341.36, 339.45, 337.67,
  336.25, 336.14, 337.3,  338.29, 339.29, 340.55, 341.63, 342.6,  343.04, 342.54,
  340.82, 338.48, 336.95, 337.05, 338.57, 339.91, 340.93, 341.76, 342.77, 343.96,
  344.77, 343.88, 342.42, 340.24, 338.38, 338.41, 339.44, 340.78, 341.57, 342.79,
  343.37, 345.4,  346.14, 345.76, 344.32, 342.51, 340.46, 340.53, 341.79, 343.2,
  344.21, 344.92, 345.68, 347.14, 347.78, 347.16, 345.79, 343.74, 341.59, 341.86,
  343.31, 345.,   345.48, 346.41, 347.91, 348.66, 349.28, 348.65, 346.9,  345.26,
  343.47, 343.35, 344.73, 346.12, 346.78, 347.48, 348.25, 349.86, 350.52, 349.98,
  348.25, 346.17, 345.48, 344.82, 346.22, 347.49, 348.73, 348.92, 349.81, 351.4,
  352.15, 351.59, 350.21, 348.2,  346.66, 346.72, 348.08, 349.28, 350.51, 351.7,
  352.5,  353.67, 354.35, 353.88, 352.8,  350.49, 348.97, 349.37, 350.43, 351.62,
  353.07, 353.43, 354.08, 355.72, 355.95, 355.44, 354.05, 351.84, 350.09, 350.33,
  351.55, 352.91, 353.86, 355.1,  355.75, 356.38, 357.38, 356.39, 354.89, 353.06,
  351.38, 351.69, 353.14, 354.41, 354.93, 355.82, 357.33, 358.77, 359.23, 358.23,
  356.3,  353.97, 352.34, 352.43, 353.89, 355.21, 356.34, 357.21, 357.97, 359.22,
  359.71, 359.43, 357.15, 354.99, 353.01, 353.41, 354.42, 355.68, 357.1,  357.42,
  358.59, 359.39, 360.3,  359.64, 357.45, 355.76, 354.14, 354.23, 355.53, 357.03,
  358.36, 359.04, 360.11, 361.36, 361.78, 360.94, 359.51, 357.59, 355.86, 356.21,
  357.65, 359.1,  360.04, 361.,   361.98, 363.44, 363.83, 363.33, 361.78, 359.33,
  358.32, 358.14, 359.61, 360.82, 362.2,  363.36, 364.28, 364.69, 365.25, 365.06,
  363.69, 361.55, 359.69, 359.72, 361.04, 362.39, 363.24, 364.21, 364.65, 366.49,
  366.77, 365.73, 364.46, 362.4,  360.44, 360.98, 362.65, 364.51, 365.39, 366.1,
  367.36, 368.79, 369.56, 369.13, 367.98, 366.1,  364.16, 364.54, 365.67, 367.3,
  368.35, 369.28, 369.84, 371.15, 371.12, 370.46, 369.61, 367.06, 364.95, 365.52,
  366.88, 368.26, 369.45, 369.71, 370.75, 371.98, 371.75, 371.87, 370.02, 368.27,
  367.15, 367.18, 368.53, 369.83, 370.76, 371.69, 372.63, 373.55, 374.03, 373.4,
  371.68, 369.78, 368.34, 368.61, 369.94, 371.42, 372.7,  373.37, 374.3,  375.19,
  375.93, 375.69, 374.16, 372.03, 370.92, 370.73, 372.43, 373.98, 375.07, 375.82,
  376.64, 377.92, 378.78, 378.46, 376.88, 374.57, 373.34, 373.31, 374.84, 376.17,
  377.17, 378.05, 379.06, 380.54, 380.8,  379.87, 377.65, 376.17, 374.43, 374.63,
  376.33, 377.68, 378.63, 379.91, 380.95, 382.48, 382.64, 382.4,  380.93, 378.93,
  376.89, 377.19, 378.54, 380.31, 381.58, 382.4,  382.86, 384.8,  385.22, 384.24,
  382.65, 380.6,  379.04, 379.33, 380.35, 382.02, 383.1,  384.12, 384.81, 386.73,
  386.78, 386.33, 384.73, 382.24, 381.2,  381.37, 382.7,  384.19, 385.78, 386.06,
  386.28, 387.33, 388.78, 387.99, 386.61, 384.32, 383.41, 383.21, 384.41, 385.79,
  387.17, 387.7,  389.04, 389.76, 390.36, 389.7,  388.25, 386.29, 384.95, 384.64,
  386.23, 387.63, 388.91, 390.41, 391.37, 392.67, 393.21, 392.38, 390.41, 388.54,
  387.03, 387.43, 388.87, 389.99, 391.5,  392.05, 392.8,  393.44, 394.41, 393.95,
  392.72, 390.33, 389.28, 389.19, 390.48, 392.06, 393.31, 394.04, 394.59, 396.38,
  396.93, 395.91, 394.56, 392.59, 391.32, 391.27, 393.2,  394.57, 395.78, 397.03,
  397.66, 398.64, 400.02, 398.81, 397.51, 395.39, 393.72, 393.9,  395.36, 397.03,
  398.04, 398.27, 399.91, 401.51, 401.96, 401.43, 399.27, 397.18, 395.54, 396.16,
  397.4,  399.08, 400.18, 400.55, 401.74, 403.35, 404.15, 402.97, 401.46, 399.11,
  397.82, 398.49, 400.27, 402.06, 402.73, 404.25, 405.06, 407.6,  407.9,  406.99,
  404.59, 402.45, 401.23, 401.79, 403.72, 404.64, 406.36, 406.66, 407.54, 409.22,
  409.89, 409.08, 407.33, 405.32, 403.57, 403.82, 405.31, 407.,   408.15, 408.52,
  409.59, 410.45, 411.44, 410.99, 408.9,  407.16, 405.71, 406.19, 408.21, 409.27,
  411.03, 411.96, 412.18, 413.54, 414.86, 414.16, 411.97, 410.18, 408.76, 408.75,
  410.48, 411.98, 413.61, 414.34, 414.74, 416.45, 417.31, 416.6,  414.62, 412.78,
  411.52, 411.51, 413.12, 414.26, 415.52, 416.75, 417.64, 419.05, 419.13, 418.94,
  416.96, 414.47, 413.3,  413.93, 415.01, 416.71, 418.19, 419.28, 418.81, 420.23,
  420.99, 420.99, 418.9, 
];


// Traces
var traceCO2Data = new TraceData(CO2Years, CO2YearData, CO2YearUnc);
traceCO2Data.name = 'CO2 data';
var traceCO2DataUnc = new TraceData(CO2Years, CO2YearData, CO2YearUnc);
traceCO2DataUnc.error_y.visible = true;
traceCO2DataUnc.name = 'CO2 data';
var traceCO2Month = new TraceData(CO2Months, CO2MonthData, CO2YearUnc);
traceCO2Month.name = 'Monthly CO2 data';

/* BASIC DATA PLOT */
// Create layout
var layoutData = new Layout(xLabelsLin, yLabelsLin, xRangesLin, yRangesLin);
layoutData.xaxis.domain = [0, 1];
layoutData.yaxis.domain = [0, 1];

// Create plot
var dataPlot = document.getElementById("dataPlot");
Plotly.newPlot(dataPlot, {
  data: [traceCO2Data],
  layout: layoutData,
});

/* DATA PLOT WITH PREDICTIONS */
let xLimPred = [1960, 2040];
let yLimPred = [300, 450];

// Data
let pred1 = [[2035], [440]];
let pred2 = [[2035], [340]];
let tracePred1 = {
  type: 'scatter',
  x: pred1[0],
  y: pred1[1],
  name: 'Prediction A',
  marker: {size: 10},
}
let tracePred2 = {
  type: 'scatter',
  x: pred2[0],
  y: pred2[1],
  name: 'Prediction B',
  marker: {size: 10},
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
  data: [traceCO2Data, tracePred1, tracePred2],
  layout: layoutPred,
});

/* DATA WITH UNCERTAINTIES PLOT */
// Plot layout
var layoutUnc = new Layout(xLabelsLin, yLabelsLin, xRangesLin, yRangesLin);
layoutUnc.xaxis.domain = [0, 1];
layoutUnc.yaxis.domain = [0, 1];
var uncPlot = document.getElementById("uncPlot");
Plotly.newPlot(uncPlot, {
  data: [traceCO2DataUnc],
  layout: layoutUnc,
});

/* LINEAR MODEL PLOT */
// Linear model sliders
var linSlope = new Slider('linSlope', 'linSlopeVal', 0.1); // Slope (m)
var linIcept = new Slider('linIcept', 'linIceptVal', 1); // y-intercept (c)

let xValLinear = arange(xLimData[0],  xLimData[1]+10, 20);
let yValLinear = linModel(xValLinear, linSlope.out.innerHTML, 300)

var linModelPlot = new Object();

linModelPlot.traceLin = new Trace(xValLinear, yValLinear); // Linear model trace
linModelPlot.traceLin.name = 'Linear Model';

linModelPlot.layout = new Layout(xLabelsLin, yLabelsLin, xRangesLin, yRangesLin);
linModelPlot.layout.xaxis.domain = [0, 1];
linModelPlot.layout.yaxis.domain = [0, 1];

linModelPlot.data = [traceCO2DataUnc, linModelPlot.traceLin]
linModelPlot.div = document.getElementById("linModelPlot");

Plotly.newPlot(linModelPlot.div, {
  data: linModelPlot.data,
  layout: linModelPlot.layout,
});

// For sliders to do upon input
function sliderLin() {  
  let m = linSlope.scale(linSlope.slider.value);
  let c = linIcept.scale(linIcept.slider.value);
  linSlope.out.innerHTML = m.toPrecision(2);
  linIcept.out.innerHTML = c.toPrecision(3);

  linModelPlot.traceLin.y = linModel(xValLinear, m, c);
  plotUpdate(linModelPlot.div, linModelPlot.data, linModelPlot.layout);
}

// Attach slider input function to sliders
linSlope.slider.oninput = sliderLin;
linIcept.slider.oninput = sliderLin;

/* 1D GAUSSIAN PLOT */
// Define sliders
var t1D = new Slider('myt', 'tVal', 1); // t value
var std1D = new Slider('myStd', 'stdVal', 0.1); // standard deviation value

// Calculate and display mean
var meanOutput = document.getElementById("meanVal");
meanOutput.innerHTML = calcMean(t1D.slider.value);

// Create data for fixed linear model
let yValLinFixed = linModel(xValLinear, mFixed, cFixed)

// Create data for 1D Gaussian in y
let xValGauss1D = arange(yLimData[0], yLimData[1], 0.1);
let yValGauss1D = Gauss1D(xValGauss1D, meanOutput.innerHTML, std1D.out.innerHTML);

var Gauss1DPlot = new Object();

Gauss1DPlot.traceLinFixed = new Trace(xValLinear, yValLinFixed);
Gauss1DPlot.traceLinFixed.name = 'Linear Model';

Gauss1DPlot.traceGauss = new TraceGauss(xValGauss1D, yValGauss1D, t1D.out.innerHTML, ['x2', 'y2'], blue);
Gauss1DPlot.traceGauss.trace.name = 'Normal Distribution';
Gauss1DPlot.traceGauss.traceLin.name = 'Normal Distribution';
Gauss1DPlot.traceGauss.traceDot.name = 'Normal Distribution';

Gauss1DPlot.layout = new Layout(xLabelsGauss1D, yLabelsGauss1D, xRangesGauss1D, yRangesGauss1D);
Gauss1DPlot.layout.yaxis2.domain = [0, 1];

Gauss1DPlot.data = [
  //traceCO2DataUnc,
  Gauss1DPlot.traceLinFixed,
  Gauss1DPlot.traceGauss.trace,
  Gauss1DPlot.traceGauss.traceLin,
  Gauss1DPlot.traceGauss.traceDot,
];

Gauss1DPlot.div = document.getElementById("linGauss1DPlot");
Plotly.newPlot(Gauss1DPlot.div, {
  data: Gauss1DPlot.data,
  layout: Gauss1DPlot.layout,
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
  Gauss1DPlot.traceGauss.update(newY, t);
  plotUpdate(Gauss1DPlot.div, Gauss1DPlot.data, Gauss1DPlot.layout);
}

// Attach slider input function to sliders
t1D.slider.oninput = sliderGauss1D;
std1D.slider.oninput = sliderGauss1D;

// Create data button
Gauss1DPlot.nButtonData = 0;
function createData1D() {
  let t = t1D.scale(t1D.slider.value);
  let mean = calcMean(t);
  let std = std1D.scale(std1D.slider.value);

  var xValData = fillArr(10, t);
  var yValData = randNorm1D(mean, std, 10);
  var yValDataGauss = fillArr(10, 0.005);
  var traceNewData = new TraceButtonData(xValData, yValData, yValDataGauss, ['x2', 'y2']);
  traceNewData.trace.marker.color = colours[Gauss1DPlot.nButtonData];
  traceNewData.traceGauss.marker.color = colours[Gauss1DPlot.nButtonData];

  Gauss1DPlot.data.push(traceNewData.trace);
  Gauss1DPlot.data.push(traceNewData.traceGauss);
  Gauss1DPlot.nButtonData += 1;
  traceNewData.trace.name = 'New Data ' + Gauss1DPlot.nButtonData.toString();
  traceNewData.traceGauss.name = 'New Data ' + Gauss1DPlot.nButtonData.toString();

  plotUpdate(Gauss1DPlot.div, Gauss1DPlot.data, Gauss1DPlot.layout);
}

function clearData1D() {
  if (Gauss1DPlot.nButtonData > 0) {
    Gauss1DPlot.data.pop();
    Gauss1DPlot.data.pop();
    Gauss1DPlot.nButtonData -= 1;
  }
  plotUpdate(Gauss1DPlot.div, Gauss1DPlot.data, Gauss1DPlot.layout);
}

/* MONTHLY DATA PLOT */
// Create layout
var layoutMonth = new Layout(xLabelsLin, yLabelsLin, xRangesLin, yRangesLin);
layoutMonth.xaxis.range = xLimMonth;
layoutMonth.xaxis.domain = [0, 1];
layoutMonth.yaxis.domain = [0, 1];

// Create plot
var monthPlot = document.getElementById("monthPlot");
Plotly.newPlot(monthPlot, {
  data: [traceCO2Month],
  layout: layoutMonth,
});

/* 2D GAUSSIAN PLOT */
// Define t slider
var meant2D = new Slider('meant2D', 'meant2DVal', 1); // mean t value
var stdt2D = new Slider('stdt2D', 'stdt2DVal', 0.1); // standard deviation in t
var stdy2D = new Slider('stdy2D', 'stdy2DVal', 0.1); // standard deviation in y

// Define mean calculation from fixed linear model parameters
var meany2DOutput = document.getElementById("meany2DVal");
meany2DOutput.innerHTML = calcMean(meant2D.out.innerHTML);

// Create data for Gaussian in t
let xValGauss2Dt = arange(xLimData[0], xLimData[1], 1);
let yValGauss2Dt = Gauss1D(xValGauss2Dt, meant2D.out.innerHTML, stdt2D.out.innerHTML);

// Create data for Gaussian in y
let xValGauss2Dy = arange(yLimData[0], yLimData[1], 1);
let yValGauss2Dy = Gauss1D(xValGauss2Dy, meany2DOutput.innerHTML, stdy2D.out.innerHTML);

var Gauss2DPlot = new Object();

Gauss2DPlot.traceLinFixed = Gauss1DPlot.traceLinFixed;

Gauss2DPlot.traceGausst = new TraceGauss(xValGauss2Dt, yValGauss2Dt, meany2DOutput.innerHTML, ['x2', 'y2'], green, true);
Gauss2DPlot.traceGaussy = new TraceGauss(xValGauss2Dy, yValGauss2Dy, meant2D.out.innerHTML, ['x3', 'y3'], blue);

var means2D = [[meant2D.out.innerHTML], [meany2DOutput.innerHTML]];
var corr2D = makeCorrMat2D(stdt2D.out.innerHTML, stdy2D.out.innerHTML, 0);
var zValGauss2D = Gauss2D(xValGauss2Dt, xValGauss2Dy, means2D, corr2D);
Gauss2DPlot.traceContour = new TraceContour(xValGauss2Dt, xValGauss2Dy, zValGauss2D);

Gauss2DPlot.layout = new Layout(xLabelsGauss2D, yLabelsGauss2D, xRangesGauss2D, yRangesGauss2D);
Gauss2DPlot.data = [
  Gauss2DPlot.traceLinFixed, 
  Gauss2DPlot.traceGausst.trace, 
  Gauss2DPlot.traceGausst.traceLin,
  Gauss2DPlot.traceGausst.traceDot,
  Gauss2DPlot.traceGaussy.trace, 
  Gauss2DPlot.traceGaussy.traceLin,
  Gauss2DPlot.traceGaussy.traceDot,
  Gauss2DPlot.traceContour
];

Gauss2DPlot.div = document.getElementById("Gauss2DPlot");
Plotly.newPlot(Gauss2DPlot.div, {
  data: Gauss2DPlot.data,
  layout: Gauss2DPlot.layout,
});

// Things for all sliders to do upon input
function sliderGauss2D() {
  let meant = meant2D.scale(meant2D.slider.value);
  let meany = calcMean(meant);
  let stdt = stdt2D.scale(stdt2D.slider.value);
  let stdy = stdy2D.scale(stdy2D.slider.value);

  meant2D.out.innerHTML = meant.toPrecision(4);
  meany2DOutput.innerHTML = meany.toPrecision(3);
  stdt2D.out.innerHTML = stdt.toPrecision(2);
  stdy2D.out.innerHTML = stdy.toPrecision(2);

  var newGausst = Gauss1D(xValGauss2Dt, meant, stdt);
  var newGaussy = Gauss1D(xValGauss2Dy, meany, stdy);

  Gauss2DPlot.traceGausst.update(newGausst, meany);
  Gauss2DPlot.traceGaussy.update(newGaussy, meant);

  var means2D = [[meant], [meany]];
  var corr2D = makeCorrMat2D(stdt, stdy, 0);
  Gauss2DPlot.traceContour.z = Gauss2D(xValGauss2Dt, xValGauss2Dy, means2D, corr2D);
  plotUpdate(Gauss2DPlot.div, Gauss2DPlot.data, Gauss2DPlot.layout);
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

// Calculate mean in y
var meanyCorrOutput = document.getElementById("meanyCorrVal");
meanyCorrOutput.innerHTML = calcMean(meantCorr.slider.value);

// Create data for Gaussian in t
let xValGaussCorrt = arange(xLimData[0], xLimData[1], 1);
let yValGaussCorrt = Gauss1D(xValGaussCorrt, meantCorr.out.innerHTML, stdtCorr.out.innerHTML);

// Create data for Gaussian in t
let xValGaussCorry = arange(yLimData[0], yLimData[1], 1);
let yValGaussCorry = Gauss1D(xValGaussCorry, meanyCorrOutput.innerHTML, stdyCorr.out.innerHTML);

var GaussCorrPlot = new Object()

GaussCorrPlot.traceLinFixed = Gauss1DPlot.traceLinFixed;

GaussCorrPlot.traceGausst = new TraceGauss(xValGaussCorrt, yValGaussCorrt, meanyCorrOutput.innerHTML, ['x2', 'y2'], green, true);
GaussCorrPlot.traceGaussy = new TraceGauss(xValGaussCorry, yValGaussCorry, meantCorr.out.innerHTML, ['x3', 'y3'], blue);

var meansCorr = [[meantCorr.out.innerHTML], [meanyCorrOutput.innerHTML]];
var corrCorr = makeCorrMat2D(stdtCorr.out.innerHTML, stdyCorr.out.innerHTML, rhoCorr.out.innerHTML);
var zValGaussCorr = Gauss2D(xValGaussCorrt, xValGaussCorry, meansCorr, corrCorr);
GaussCorrPlot.traceContour = new TraceContour(xValGaussCorrt, xValGaussCorry, zValGaussCorr);

GaussCorrPlot.layout = new Layout(xLabelsGauss2D, yLabelsGauss2D, xRangesGauss2D, yRangesGauss2D);
GaussCorrPlot.data = [
  GaussCorrPlot.traceLinFixed, 
  GaussCorrPlot.traceGausst.trace,
  GaussCorrPlot.traceGausst.traceLin,
  GaussCorrPlot.traceGausst.traceDot,  
  GaussCorrPlot.traceGaussy.trace,
  GaussCorrPlot.traceGaussy.traceLin,
  GaussCorrPlot.traceGaussy.traceDot,
  GaussCorrPlot.traceContour
];

GaussCorrPlot.div = document.getElementById("GaussCorrPlot");
Plotly.newPlot(GaussCorrPlot.div, {
  data: GaussCorrPlot.data,
  layout: GaussCorrPlot.layout,
});

// Things for all sliders to do upon input
function sliderGaussCorr() {
  let meant = meantCorr.scale(meantCorr.slider.value);
  let meany = calcMean(meant);
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
  
  GaussCorrPlot.traceGausst.update(newGausst, meany);
  GaussCorrPlot.traceGaussy.update(newGaussy, meant);
  
  var meansCorr = [[meant], [meany]];
  var corrCorr = makeCorrMat2D(stdtCorr.out.innerHTML, stdyCorr.out.innerHTML, rhoCorr.out.innerHTML);
  GaussCorrPlot.traceContour.z = Gauss2D(xValGaussCorrt, xValGaussCorry, meansCorr, corrCorr);
  plotUpdate(GaussCorrPlot.div, GaussCorrPlot.data, GaussCorrPlot.layout);
}

// Attach slider input function to sliders
meantCorr.slider.oninput = sliderGaussCorr;
stdtCorr.slider.oninput = sliderGaussCorr;
stdyCorr.slider.oninput = sliderGaussCorr;
rhoCorr.slider.oninput = sliderGaussCorr;

/* GAUSSIAN PROCESSES PLOT 1 */
// Location of t1
var t1 = 1982;
var y1 = 351;

// Sliders
var t2GP1 = new Slider('t2GP1', 't2GP1Val', 1);  // Value of t2
var stdy1GP1 = new Slider('stdy1GP1', 'stdy1GP1Val', 0.1); // Standard deviation in t
var stdy2GP1 = new Slider('stdy2GP1', 'stdy2GP1Val', 0.1); // Standard deviation in y

// Calculate correlation coefficient
var lengthScale = 100;
var rhoGP1Output = document.getElementById("rhoGP1Val");
rhoGP1Output.innerHTML = kernel_SE(t1, t2GP1.out.innerHTML, lengthScale).toPrecision(2);

let xValGP1Gauss = arange(yLimData[0], yLimData[1], 1);
let yValGP1Gauss = arange(yLimData[0], yLimData[1], 1);

var GPPlot1 = new Object();

let dpGP1 = [[t1], [y1]]; // Data point (t1, y1)
GPPlot1.tracet1 = {
  type: 'scatter',
  x: dpGP1[0],
  y: dpGP1[1],
  xaxis: 'x2',
  yaxis: 'y2',
}

var meansGP1 = [[350], [350]];
var corrGP1 = makeCorrMat2D(stdy1GP1.out.innerHTML, stdy2GP1.out.innerHTML, rhoGP1Output.innerHTML);
var ProbValGP1 = Gauss2D(xValGP1Gauss, yValGP1Gauss, meansGP1, corrGP1);
GPPlot1.traceContour = new TraceContour(xValGP1Gauss, yValGP1Gauss, ProbValGP1);

var argGP1Gauss1D = interpArg(y1, yLimData, xValGP1Gauss.length);
var xValGP1Gauss1D = xValGP1Gauss;
var yValGP1Gauss1D = ProbValGP1.map(arr => arr[argGP1Gauss1D]);
GPPlot1.traceGauss = new TraceGauss(xValGP1Gauss1D, yValGP1Gauss1D, y1, ['x3', 'y3'], red);

var xValLinGP1Gauss1D = rotGauss1D(GPPlot1.traceGauss.trace.y, t2GP1.out.innerHTML);
GPPlot1.traceGauss.traceLin2 = new Trace(xValLinGP1Gauss1D, GPPlot1.traceGauss.traceLin.y);
GPPlot1.traceGauss.traceLin2.xaxis = 'x2';
GPPlot1.traceGauss.traceLin2.yaxis = 'y2';

var xValDotGP1Gauss1D = fillArr(xValLinGP1Gauss1D.length, t2GP1.out.innerHTML);
GPPlot1.traceGauss.traceDot2 = new Trace(xValDotGP1Gauss1D, GPPlot1.traceGauss.traceLin.y);
GPPlot1.traceGauss.traceDot2.line.dash = 'dot';
GPPlot1.traceGauss.traceDot2.xaxis = 'x2';
GPPlot1.traceGauss.traceDot2.yaxis = 'y2';

GPPlot1.layout = new Layout(xLabelsGP1, yLabelsGP1, xRangesGP1, yRangesGP1);
GPPlot1.layout.xaxis.domain = [0.6, 1];
GPPlot1.layout.yaxis.domain = [0.6, 1];
GPPlot1.layout.xaxis2.domain = [0, 0.45];
GPPlot1.layout.yaxis2.domain = [0.1, 0.9];

GPPlot1.data = [ 
  GPPlot1.tracet1,
  GPPlot1.traceGauss.trace,
  GPPlot1.traceGauss.traceLin,
  GPPlot1.traceGauss.traceDot,
  GPPlot1.traceGauss.traceLin2,
  GPPlot1.traceGauss.traceDot2,  
  GPPlot1.traceContour,
];

GPPlot1.div = document.getElementById("GPPlot1");
Plotly.newPlot(GPPlot1.div, {
  data: GPPlot1.data,
  layout: GPPlot1.layout,
});

// Things for all sliders to do upon input
function sliderGP1() {
  let t2 = t2GP1.scale(t2GP1.slider.value);
  let rho = kernel_SE(t1, t2, lengthScale);
  let stdy1 = stdy1GP1.scale(stdy1GP1.slider.value);
  let stdy2 = stdy2GP1.scale(stdy2GP1.slider.value);

  t2GP1.out.innerHTML = t2.toPrecision(4);
  rhoGP1Output.innerHTML = rho.toPrecision(2);
  stdy1GP1.out.innerHTML = stdy1.toPrecision(2);
  stdy2GP1.out.innerHTML = stdy2.toPrecision(2);

  var corrGP1 = makeCorrMat2D(stdy1, stdy2, rho);
  var ProbValGP1 = Gauss2D(xValGP1Gauss, yValGP1Gauss, meansGP1, corrGP1);
  GPPlot1.traceContour.z = ProbValGP1;
  
  var yValGP1Gauss1D = ProbValGP1.map(arr => arr[argGP1Gauss1D]);
  GPPlot1.traceGauss.update(yValGP1Gauss1D, y1);

  GPPlot1.traceGauss.traceLin2.x = rotGauss1D( GPPlot1.traceGauss.trace.y, t2);
  GPPlot1.traceGauss.traceLin2.x = fillArr(xValLinGP1Gauss1D.length, t2);
  plotUpdate( GPPlot1.div,  GPPlot1.data,  GPPlot1.layout);
}

// Attach slider input function to sliders
t2GP1.slider.oninput = sliderGP1;
stdy1GP1.slider.oninput = sliderGP1;
stdy2GP1.slider.oninput = sliderGP1;
