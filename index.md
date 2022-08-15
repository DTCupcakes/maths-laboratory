 <link href="styles.css" rel="stylesheet">
 <script type="text/x-mathjax-config">
    MathJax.Hub.Config({
      tex2jax: {
        skipTags: ['script', 'noscript', 'style', 'textarea', 'pre'],
        inlineMath: [['$','$']],
        displayMath: [ ['\[', '\]'] ]
      }
    });
  </script>
  <script src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML" type="text/javascript"></script> 
<script defer src="https://cdn.plot.ly/plotly-latest.min.js"> </script>
  <script defer src="myScript.js"></script>

# Gaussian Processes
## Introduction

**test caching: 36**

Imagine that you are a scientist measuring the concentration of atmospheric carbon dioxide (CO<sub>2</sub>) and after more than 40 years of painstaking measurement the results of your measurements look like this.

<div id="dataPlot"></div>

*Hover your cursor over the plot above to see the exact data values. Click and drag a rectangle over a region of the plot to zoom in.*

CO<sub>2</sub> is a greenhouse gas, since it traps heat in the atmosphere, making it an important part of climate models. Let’s try to make a prediction about the concentration of CO<sub>2</sub> in the atmosphere in March of 2035. Based on the data we have, which of the two predicted values below (shown in orange and green) do you think is more likely?

<div id="predPlot"></div>

I bet you noticed the upward trend in our data, and so you think the higher data point is much more likely than the lower data point. How do we quantify this intuition?

In order to make a prediction we need to engage in an exercise of model building. We’ll start with some simple linear models and extend out the necessary ideas until we can build a much more flexible model known as a Gaussian process. 

Unlike many models you may be familiar with, Gaussian processes aren’t restricted to a particular relationship between the parameters and instead use the distribution of the existing data to build the model. What we will end up with is a model that tells us the probability of measuring a particular value of the CO<sub>2</sub> concentration at any given time. To make predictions all we need to do is find the points with the highest probability.

## Linear Models

Our CO<sub>2</sub> data might, at first glance, look like it fits a single straight upwards facing line. Remember that scientific data comes with uncertainties, so let’s add some to our data.

<div id="uncPlot"></div>

*Note: I've increased the size of the uncertainties shown so that they are visible on the plot.*

Ideally our line should fit within the uncertainties of all the data points. On the plot, our line will have the general formula \[y = mt +c.\] $t$ is the time at which we measure each data point (i.e. the year), $m$ is the slope of the line, $c$ moves the line vertically up and down, and $y$ is the value we predict for CO<sub>2</sub> concentration.

We can experiment with different values of $m$ and $c$ to see what different lines we get. These values are the PARAMETERS for our model, since they change what our model looks like on the plot, and what predictions we get from it. We know that $m$ needs to be positive to produce an upwards slope.

Try adjusting the values of $m$ and $c$ using the sliders on the plot below to find the linear model that best fits our data.

<div id="linModelPlot">
  <div class="slidecontainer" id="linSlopeSlideContainer">
    <input type="range" min="0" max="50" value="10" class="slider" id="linSlope">
    <p>$m$: <span id="linSlopeVal"></span></p>
  </div>
  <div class="slidecontainer" id="linIceptSlideContainer">
    <input type="range" min="300" max="440" value="300" class="slider" id="linIcept">
    <p>$c$: <span id="linIceptVal"></span></p>
  </div>
</div>

This process of altering the parameters to find which version of the model best fits the data is known as OPTIMISATION and is an important step of model building. There are many different established optimisation algorithms that can be used to find the best parameters for any model.

### The Nomal (Gaussian) Distribution

One way we can talk about our model is to say that the data is drawn from a DISTRIBUTION. Let’s see what happens if we assume our linear model is a completely accurate picture of reality. That means the atmospheric CO<sub>2</sub> concentration increases linearly with time, such that at any time $t$ the CO<sub>2</sub> concentration is given by our formula: \[ y = mt + c \]

So what happens now if we measure the CO<sub>2</sub> concentration? What you would see is that we don’t actually measure the CO<sub>2</sub> concentration exactly. Our measurements are all just a little bit off, maybe because of random variations, maybe because of systematic error in our measurement process. This is what we mean when we talk about adding uncertainty. We are allowing for the fact that our measurements will be inaccurate to some small degree due to factors that are not necessarily under our control.

Let’s say that we make measurements of the atmospheric CO<sub>2</sub> concentration in 2023. What is the probability of us measuring any given value of the CO<sub>2</sub> concentration? Intuitively we understand that the probability should be higher closer to the “true” value of the CO<sub>2</sub> concentration, and should decrease as we move further away from it. How quickly this distribution decreases is determined by the size of our uncertainties on each measurement. A smaller uncertainty means our measurement is more likely to be closer to the true value.

This type of probability distribution is called a NORMAL DISTRIBUTION or a GAUSSIAN. We say that our measurements are DRAWN from this distribution, meaning that this distribution tells us the probability of the measurement taking a particular value. We indicate this by using this notation: \[ y_i \sim N(\mu, \sigma) \]

Our individual measurements $y_1$, $y_2$, $y_3$, etc are represented here by $y_i$.  is the location of the MEAN, or centre, of our Gaussian distribution, while  is the size of the uncertainty. The $N$ indicates that the probability of our measurements taking on particular values follows a normal distribution (as opposed to a different type of probability distribution).

The mean should be the “true” value of $y$, given by our linear model, and so we can make the following replacement: \[ y_i \sim N(mt+c, \sigma) \]

What we want is a formula to tell us the PROBABILITY of our measurement taking a particular value. The most basic formula for a Gaussian, or normal distribution, is \[P(y_i | t, \sigma) = \exp(-y_i^2). \]
Our notation on the left hand side of this equation tells us we want the probability of getting a measurement $y_i$, given that we are measuring at time $t$, and have uncertainties of size $ \sigma $.

Since this is a probability distribution, we should add some constants to ensure the total area under the Gaussian, which corresponds to the probability of $y_i$ taking any value, is one: \[ P(y_i \vert t, \sigma) = \frac{1}{\sqrt{2\pi}} \exp \left( - \frac{1}{2} y_i^2 \right) \]

This Gaussian has a mean of 0 and a standard deviation of 1. These are the parameters of our Gaussian, and we want to change them so that they fit our model. We can add the mean $\mu$ and standard deviation $\sigma$ into the Gaussian formula like this: \[ P(y_i \vert t, \sigma) = \frac{1}{\sqrt{2\pi\sigma^2}} \exp \left( -\frac{(y_i - \mu)^2}{2\sigma^2} \right) \]

Let's replace the mean with the one from our linear model: \[ P(y_i \vert t, \sigma) = \frac{1}{\sqrt{2\pi\sigma^2}} \exp \left( -\frac{(y_i - (mt + c))^2}{2\sigma^2} \right) \]

By using this formula we are able to determine the probability of our CO<sub>2</sub> concentration measurement taking a particular value given that we are measuring at time $t$. 

On the plot below is shown (in red) a linear model where the parameters are fixed to best fit the data shown above. Try playing around with the value of $t$ and the standard deviation of the normal distribution associated with the linear model.

<div id="linGauss1DPlot">
  <div class="slidecontainer" id="tslidecontainer">
    <input type="range" min="1980" max="2040" value="2000" class="slider" id="myt">
    <p>$t$: <span id="tVal"></span></p>
    <p>Mean ($\mu=mt+c$): <span id="meanVal"></span></p>
  </div>
  <div class="slidecontainer" id="stdslidecontainer">
    <input type="range" min="10" max="100" value="1" class="slider" id="myStd">
    <p>Standard deviation ($\sigma$): <span id="stdVal"></span></p>
    <button onclick="javascript:createData1D();">Create New Data</button>
    <button onclick="javascript:clearData1D();">Clear Data</button>
  </div>
</div>

## Time Uncertainty

So that’s it we’re done right? All we need to do is find the right parameters for our linear model and then take into account the uncertainties.

Not quite.

Our plots so far have used yearly measurements of the atmospheric CO<sub>2</sub> concentration. What happens if we zoom in a little and look at the monthly measurements instead?

<div id="monthPlot"></div>

From zooming in to the monthly measurements we can see that we can't account for all the variation in CO<sub>2</sub> concentration by only using our linear model. There is some yearly periodic variation that remains unaccounted for.

You may have some ideas about what type of equation we can use to model this variation, but finding the right equation and parameters is much more involved and uncertain than for our simple linear model. However, we can model both the periodic variation and the upwards trend easily using a Gaussian process.

Before we tackle Gaussian processes we will need to understand some intermediate concepts.

Just like the CO<sub>2</sub> concentration we can talk about our time measurements as also having associated uncertainty. The means that they are also drawn from a normal distribution: \[ t_i \sim N(t, \sigma_t) \]

The time measurement we make, $t_i$, is more likely to be closer to the “true” time value $t$, than further away. The width of the normal distribution is given by our uncertainty $\sigma_t$. From now on I will be using $\sigma_t$ to indicate uncertainty in time, and $\sigma_y$ to indicate uncertainty in CO<sub>2</sub> concentration, in order to more clearly differentiate between the two.

The calculation to determine the probability of our time measurement taking on any particular value is almost identical to the calculation for CO<sub>2</sub> concentration. All we have to do is replace the mean and uncertainty with their corresponding values for time. The mean in this case is the “true” value of time $t$: \[ P(t_i \vert t, \sigma_t) = \frac{1}{\sqrt{2\pi\sigma_t^2}} \exp \left( -\frac{(t_i-t)^2}{2\sigma_t^2} \right) \]

Play around with the Gaussian below to see how the values of $t$ and $\sigma_t$ affect our time measurements.

### 2D Gaussians

In order for our measurements to be useful we need to make time measurements and measurements of the CO<sub>2</sub> concentration together. To represent this on our CO<sub>2</sub> vs time plot we can imagine combining the probability distributions for time and CO<sub>2</sub> concentration together. This combined probability distribution tells us the probability of our set of two measurements having two particular values.

One important (and very convenient) property of Gaussian distributions is that we can combine two 1D Gaussians to get a 2D Gaussian that has very similar properties. Our 2D Gaussian that tells us the probability of getting a particular pair of time and CO<sub>2</sub> concentration measurements $(t_i,y_i)$ has the following formula: \[ P(t_i, y_i \vert \sigma_t, \sigma_y) = \frac{1}{\sqrt{(2\pi)^2 \sigma_t^2 \sigma_y^2}} \exp \left( -\frac{1}{2} \left( \frac{(t_i - \mu_t)^2}{\sigma_t^2} + \frac{(y_i - \mu_y)^2}{\sigma_y^2} \right) \right) \]

You may notice that our 2D Gaussian is simply the product of our two 1D Gaussians (try multiplying them together yourself). This idea extends the same way into higher dimensions, and so we can obtain a Gaussian probability distribution using as many different variables as we want.

For now, play around with the 2D Gaussian below to see how changing the means and uncertainties affects the probability distribution.

<div id="Gauss2DPlot">
  <div class="slidecontainer" id="meant2DSlideContainer">
    <input type="range" min="1980" max="2040" value="2000" class="slider" id="meant2D">
    <p>Mean ($\mu_t=t$): <span id="meant2DVal"></span></p>
    <p>Mean ($\mu_y=mt+c$): <span id="meany2DVal"></span></p>
  </div>
  <div class="slidecontainer" id="stdt2DSlideContainer">
    <input type="range" min="10" max="100" value="10" class="slider" id="stdt2D">
    <p>Standard deviation ($\sigma_t$): <span id="stdt2DVal"></span></p>
  </div>
  <div class="slidecontainer" id="stdy2DSlideContainer">
    <input type="range" min="10" max="100" value="10" class="slider" id="stdy2D">
    <p>Standard deviation ($\sigma_y$): <span id="stdy2DVal"></span></p>
  </div>
</div>

**Figure 7 (Interactive) - CO<sub>2</sub> vs time plot and 2D Gaussian**

## Matrices and n-Dimensional Gaussians
Imagine we wanted to extend our model out to cover a new variable z representing (for example) temperature. Our 3D Gaussian probability formula would be \[ P(t_i, y_i, z_i \vert \sigma_t, \sigma_y, \sigma_z) = \frac{1}{\sqrt{(2\pi)^3\sigma_t^2\sigma_y^2\sigma_z^2}} \exp \left( -\frac{1}{2} \left( \frac{(t_i-\mu_t)^2}{\sigma_t^2} + \frac{(y_i-\mu_y)^2}{\sigma_y^2} + \frac{(z_i-\mu_z)^2}{\sigma_z^2} \right) \right) \]

Here $z_i$ is a temperature measurement, $z$ is its mean value, and $\sigma_z$ is its uncertainty. If we wanted to, we could use a Gaussian to describe the relationship between any number of variables. In order to do this more elegantly it is a good idea to simplify this formula using matrices.

We can simplify the 2D Gaussian formula by using three different matrices. The matrix $\bf{x}$ contains the values of our measurements, the matrix $\bf{\mu}$ contains the means of the Gaussian distributions, and the CORRELATION MATRIX $\bf{C}$ contains our uncertainties:
\[ \bf{x} = \begin{bmatrix} t_i \\\ y_i \end{bmatrix} \]
\[ \bf{\mu} = \begin{bmatrix} \mu_t \\\ \mu_y \end{bmatrix} \]
\[ \bf{C} = \begin{bmatrix} \sigma_t^2 & 0 \\\ 0 & \sigma_y^2 \end{bmatrix} \]

Notice the zeroes in the correlation matrix, because those slots will become important soon.

First let’s use our matrices to construct the terms inside the exponential. First we will need to construct the terms \[ (t_i - \mu_t)^2, (y_i - \mu_y)^2.\]

If we subtract $\bf{\mu}$ from $\bf{x}$, we get \[ \bf{x} - \bf{\mu} = \begin{bmatrix} t_i - \mu_t \\\ y_i - \mu_y \end{bmatrix} \]

Multiplying this matrix by its own transpose gives us \[ (\bf{x} - \bf{\mu})^T (\bf{x} - \bf{\mu}) = \begin{bmatrix} t_i - \mu_t & y_i - \mu_y \end{bmatrix} \begin{bmatrix} t_i - \mu_t \\\ y_i - \mu_y \end{bmatrix} = (t_i - \mu_t)^2 + (y_i - \mu_y)^2 \]

To fully express the term in the exponential, we need to divide by the uncertainties. Notice that the inverse of the correlation matrix is \[ \bf{C}^{-1} = \begin{bmatrix} 1/\sigma_t^2 & 0 \\\ 0 & 1/\sigma_y^2 \end{bmatrix} \]

To show this for yourself, try substituting it into the following equation to show that you get the identity matrix: \[ \bf{C}^{-1}\bf{C} = \bf{I} \]

We can insert the inverse correlation matrix into our previous equation to give us \[ (\bf{x} - \bf{\mu})^T \bf{C}^{-1} (\bf{x} - \bf{\mu}) = \begin{bmatrix} t_i - \mu_t & y_i - \mu_y \end{bmatrix} \begin{bmatrix} 1/\sigma_t^2 & 0 \\\ 0 & 1/\sigma_y^2 \end{bmatrix} \begin{bmatrix} t_i - \mu_t \\\ y_i - \mu_y \end{bmatrix} = \frac{(t_i - \mu_t)^2}{\sigma_t^2} + \frac{(y_i - \mu_y)^2}{\sigma_y^2} \]

and then our formula for the 2D Gaussian becomes \[ P(t_i, y_i \vert \sigma_t, \sigma_y) = \frac{1}{\sqrt{(2\pi)^2\sigma_t^2\sigma_y^2}} \exp \left( -\frac{1}{2} (\bf{x} - \bf{\mu})^T \bf{C}^{-1} (\bf{x} - \bf{\mu}) \right) \]

You’ll also notice that part of the term under the square root is the same as the determinant of our correlation matrix, so we will substitute that in: \[ P(t_i, y_i \vert \sigma_t, \sigma_y) = \frac{1}{\sqrt{(2\pi)^2 \det(\bf{C})}} \exp \left( -\frac{1}{2} (\bf{x} - \bf{\mu})^T \bf{C}^{-1} (\bf{x} - \bf{\mu}) \right) \]

You’ll notice now that all the variables in this expression are matrices, so now our 2D Gaussian has become an expression for a Gaussian in as many dimensions as we could want. These matrices contain all the information about the means of our model, the uncertainties and the values of our measurements. If we want to expand our model to include more variables then we just need to adjust the matrices. For example, if we wanted to add back in our variable $z$ from before, we would adjust the matrices in the following way
\[ \bf{x} = \begin{bmatrix} t_i \\\ y_i \\\ z_i \end{bmatrix} \]
\[ \bf{\mu} = \begin{bmatrix} \mu_t \\\ \mu_y \\\ \mu_z \end{bmatrix} \]
\[ \bf{C} = \begin{bmatrix} \sigma_t^2 & 0 & 0 \\\ 0 & \sigma_y^2 & 0 \\\ 0 & 0 & \sigma_z^2 \end{bmatrix} \]

## Correlation Coefficients

One very common way to characterise a set of measurements is to calculate the CORRELATION, and more precisely the CORRELATION COEFFICIENT $\rho$. The correlation coefficient gives us a measure of how closely our measurements line up along a straight line. It takes values between -1 and 1. A negative correlation coefficient means our data is clustered along a line with a negative slope and a positive correlation coefficient means our data is clustered along a line with a positive slope. The further away from zero the value is, the less variation there is around the line.

Let’s apply this idea to a set of measurements of the CO<sub>2</sub> concentration all taken at the same time $t$. Using our traditional 2D Gaussian these measurements have very little correlation in any direction (which you can see on the interactive 2D Gaussian plot above). This is a result of our assumption that the uncertainties  along each axis are independent, i.e. the variation in measurements along one axis does not affect the variation in measurements along the other.

Now let’s assume that this is not the case. Maybe there is a systematic error in our measurements that causes our measurements of the CO<sub>2</sub> concentration to be lower when we measure a higher time value. This would add correlation to our uncertainties, such that our correlation coefficient $\rho$ is no longer zero.

This is where those empty spaces in our correlation matrix come in! Into each of those spaces we will add the product of our correlation coefficient with the uncertainties in time and CO<sub>2</sub> concentration. \[ \bf{C} = \begin{bmatrix} \sigma_t^2 & \rho\sigma_t\sigma_y \\\ \rho\sigma_t\sigma_y & \sigma_y^2 \end{bmatrix} \]

To find the probability that our measurement will take a particular value, we can use the same Gaussian formula that we used before. The only difference is that our definition of the correlation matrix has changed. \[ P(t_i, y_i \vert \sigma_t, \sigma_y) = \frac{1}{\sqrt{(2\pi)^2 \det(\bf{C})}} \exp \left( -\frac{1}{2} (\bf{x} - \bf{\mu})^T \bf{C}^{-1} (\bf{x} - \bf{\mu}) \right) \]

Try playing around with the correlation coefficients in the 2D Gaussian below to see how they affect the distribution of our measurements.

<div id="GaussCorrPlot">
    <div class="slidecontainer" id="meantCorrSlideContainer">
      <input type="range" min="1960" max="2020" value="1980" class="slider" id="meantCorr">
      <p>Mean ($\mu_t=t$): <span id="meantCorrVal"></span></p>
      <p>Mean ($\mu_y=mt+c$): <span id="meanyCorrVal"></span></p>
    </div>
    <div class="slidecontainer" id="stdtCorrSlideContainer">
      <input type="range" min="10" max="100" value="10" class="slider" id="stdtCorr">
      <p>Standard deviation ($\sigma_t$): <span id="stdtCorrVal"></span></p>
    </div>
    <div class="slidecontainer" id="stdyCorrSlideContainer">
      <input type="range" min="10" max="100" value="10" class="slider" id="stdyCorr">
      <p>Standard deviation ($\sigma_y$): <span id="stdyCorrVal"></span></p>
    </div>
    <div class="slidecontainer" id="rhoCorrSlideContainer">
      <input type="range" min="-9" max="9" value="0" class="slider" id="rhoCorr">
      <p>Correlation coefficient ($\rho$): <span id="rhoCorrVal"></span></p>
    </div>
  </div>

**Figure 8 (Interactive) - CO<sub>2</sub> vs time plot and 2D Gaussian (now with correlation coefficients)**

If we wanted to bring back in our temperature measurement $z$, we would need different correlation coefficients for the correlation between each pair of variables. If $\rho_{ty}$ is the correlation coefficient relating $t$ and $y$, $\rho_{tz}$ is the correlation coefficient relating $t$ and $z$, and $\rho_{yz}$ is the correlation coefficient relating $y$ and $z$, then our 3D correlation matrix will look like this: \[ \bf{C} = \begin{bmatrix} \sigma_t^2 & \rho_{ty}\sigma_t\sigma_y & \rho_{tz}\sigma_t\sigma_z \\\ \rho_{ty}\sigma_t\sigma_y & \sigma_y^2 & \rho_{yz}\sigma_y\sigma_z \\\ \rho_{tz}\sigma_t\sigma_z & \rho_{yz}\sigma_y\sigma_z & \sigma_z^2 \end{bmatrix} \]

## Recap

Let’s revisit our linear model and see how it’s changed since we first introduced it. In our old model, each CO<sub>2</sub> concentration measurement was drawn from a single one-dimensional Gaussian distribution: \[ y_i \sim N(mt+c, \sigma_y) \]

The probability of our CO<sub>2</sub> concentration measurements taking any particular value was given by the following formula: \[ P(y_i \vert t, \sigma) = \frac{1}{\sqrt{2\pi\sigma^2}} \exp \left( -\frac{(y_i - (mt + c))^2}{2\sigma^2} \right) \]

In our new model, each pair of CO<sub>2</sub> concentration and time measurements is drawn from a two-dimensional Gaussian distribution: \[ (t_i, y_i) \sim N((\mu_y, \mu_t), (\sigma_t, \sigma_y)) \]

The probability of our CO<sub>2</sub> concentration and time measurements taking any particular pair of values is given by the formula \[ P(t_i, y_i \vert \sigma_t, \sigma_y) = \frac{1}{\sqrt{(2\pi)^2 \sigma_t^2 \sigma_y^2}} \exp \left( -\frac{1}{2} \left( \frac{(t_i - \mu_t)^2}{\sigma_t^2} + \frac{(y_i - \mu_y)^2}{\sigma_y^2} \right) \right) \]

which we generalised using the following matrices \[ \bf{x} = \begin{bmatrix} t_i \\\ y_i \end{bmatrix} \]
\[ \bf{\mu} = \begin{bmatrix} \mu_t \\\ \mu_y \end{bmatrix} \]
\[ \bf{C} = \begin{bmatrix} \sigma_t^2 & \rho\sigma_t\sigma_y \\\ \rho\sigma_t\sigma_y & \sigma_y^2 \end{bmatrix} \]

to a formula for the probability of measurements taking particular values along any number of axes: \[ P(t_i, y_i \vert \sigma_t, \sigma_y) = \frac{1}{\sqrt{(2\pi)^2 \det(\bf{C})}} \exp \left( -\frac{1}{2} (\bf{x} - \bf{\mu})^T \bf{C}^{-1} (\bf{x} - \bf{\mu}) \right) \]

The correlation coefficient/s $\rho$ in the correlation matrix gives us a measure of the correlation between uncertainties along any two axes, taking larger values (more positive or more negative) if the correlation is higher.

## Gaussian Processes
The best way to understand what a Gaussian process does is to start with a single data point $(t_1,y_1)$. What we want to determine is the probability of making a second measurement at the point $(t_2,y_2)$, given that we’ve already recorded the first one. Intuitively we may guess that the closer in time we are to the first, already recorded, data point, the more likely our new value of CO<sub>2</sub> concentration is to be close to the already recorded one. In mathematical terms, we say that the two values are highly correlated.

How might we show this relationship visually? Let’s create a graph where the value of $y_1$ is represented on the horizontal axis and the value of $y_2$ is represented on the vertical axis. We can create a 2D Gaussian on this graph (seen below) to represent the probability of getting a particular pair of $y_1$ and $y_2$.

<div id="GPPlot1">
  <div class="slidecontainer" id="t2GP1SlideContainer">
    <input type="range" min="1960" max="2020" value="1980" class="slider" id="t2GP1">
    <p>$t_2$: <span id="t2GP1Val"></span></p>
    <p>Correlation coefficient ($\rho$): <span id="rhoGP1Val"></span></p>
  </div>
  <div class="slidecontainer" id="stdy1GP1SlideContainer">
    <input type="range" min="10" max="100" value="10" class="slider" id="stdy1GP1">
    <p>Standard deviation ($\sigma_{y_1}$): <span id="stdy1GP1Val"></span></p>
  </div>
  <div class="slidecontainer" id="stdy2GP1SlideContainer">
    <input type="range" min="10" max="100" value="10" class="slider" id="stdy2GP1">
    <p>Standard deviation ($\sigma_{y_2}$): <span id="stdy2GP1Val"></span></p>
  </div>
</div>

**Figure 9 (Interactive) - y1 vs y2 plot and 2D Gaussian**

As we decrease the distance between $t_1$ and $t_2$ on our original plot the correlation between $y_1$ and $y_2$ (and therefore the correlation coefficient in our 2D Gaussian) increases. As the correlation coefficients in our new Gaussian increase it becomes more likely that $y_2$ will have a value close to $y_1$.

***Correlation coefficients play a core role in the construction of Gaussian processes. They link predictions for new data to the data that has already been recorded.***

## References
**The atmospheric carbon dioxide concentration data comes from the following source:**
Dr. Pieter Tans, NOAA/GML (gml.noaa.gov/ccgg/trends/) and Dr. Ralph Keeling, Scripps Institution of Oceanography (scrippsco2.ucsd.edu/).

**The data can be found <a href="https://gml.noaa.gov/ccgg/trends/data.html">here</a>.**