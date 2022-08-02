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

Imagine that you are a scientist measuring the concentration of atmospheric carbon dioxide (CO2) and after more than 40 years of painstaking measurement the results of your measurements look like this.

**Figure 1 - Plot of atmospheric CO2 concentration vs time**

CO2 is a greenhouse gas, since it traps heat in the atmosphere, making it an important part of climate models. Let’s try to make a prediction about the concentration of CO2 in the atmosphere in March of 2035. Based on the data we have, which of the two predicted values shown below do you think is more likely?

**Figure 2 - Plot of atmospheric CO2 concentration vs time with added predictions**

I bet you noticed the upward trend in our data, and so you think the higher data point is much more likely than the lower data point. How do we quantify this intuition?

In order to make a prediction we need to engage in an exercise of model building. We’ll start with some simple linear models and extend out the necessary ideas until we can build a much more flexible model known as a Gaussian process. 

Unlike many models you may be familiar with, Gaussian processes aren’t restricted to a particular relationship between the parameters and instead use the distribution of the existing data to build the model. What we will end up with is a model that tells us the probability of measuring a particular value of the CO2 concentration at any given time. To make predictions all we need to do is find the points with the highest probability.

## Linear Models

Our CO2 data might, at first glance, look like it fits a single straight upwards facing line. Remember that scientific data comes with uncertainties, so let’s add some to our data.

**Figure 3 - CO2 concentration vs time plot with uncertainties**

Ideally our line should fit within the uncertainties of all the data points. On the plot, our line will have the general formula \[y = mt +c.\] $t$ is the time at which we measure each data point (i.e. the year), $m$ is the slope of the line, $c$ moves the line vertically up and down, and $y$ is the value we predict for CO2 concentration.

We can experiment with different values of $m$ and $c$ to see what different lines we get. These values are the PARAMETERS for our model, since they change what our model looks like on the plot, and what predictions we get from it. We know that $m$ needs to be positive to produce an upwards slope.

Try adjusting the values of $m$ and $c$ on the plot below to find the linear model that best fits our data.

<div id="linModelPlot">
  <div class="slidecontainer" id="linSlopeSlideContainer">
    <input type="range" min="0" max="10" value="1" class="slider" id="linSlope">
    <p>$m$: <span id="linSlopeVal"></span></p>
  </div>
  <div class="slidecontainer" id="linIceptSlideContainer">
    <input type="range" min="300" max="400" value="300" class="slider" id="linIcept">
    <p>$c$: <span id="linIceptVal"></span></p>
  </div>
</div>

**Figure 4 (Interactive) - CO2 concentration vs time plot with overlaid linear models**

This process of altering the parameters to find which version of the model best fits the data is known as OPTIMISATION and is an important step of model building. There are many different established optimisation algorithms that can be used to find the best parameters for any model.

### The Nomal (Gaussian) Distribution

One way we can talk about our model is to say that the data is drawn from a DISTRIBUTION. Let’s see what happens if we assume our linear model is a completely accurate picture of reality. That means the atmospheric CO2 concentration increases linearly with time, such that at any time $t$ the CO2 concentration is given by our formula: \[ y = mt + c \]

So what happens now if we measure the CO2 concentration? What you would see is that we don’t actually measure the CO2 concentration exactly. Our measurements are all just a little bit off, maybe because of random variations, maybe because of systematic error in our measurement process. This is what we mean when we talk about adding uncertainty. We are allowing for the fact that our measurements will be inaccurate to some small degree due to factors that are not necessarily under our control.

Let’s say that we make measurements of the atmospheric CO2 concentration in 2023. What is the probability of us measuring any given value of the CO2 concentration? Intuitively we understand that the probability should be higher closer to the “true” value of the CO2 concentration, and should decrease as we move further away from it. How quickly this distribution decreases is determined by the size of our uncertainties on each measurement. A smaller uncertainty means our measurement is more likely to be closer to the true value.

This type of probability distribution is called a NORMAL DISTRIBUTION or a GAUSSIAN. We say that our measurements are DRAWN from this distribution, meaning that this distribution tells us the probability of the measurement taking a particular value. We indicate this by using this notation: \[ y_i \sim N(\mu, \sigma) \]

Our individual measurements $y_1$, $y_2$, $y_3$, etc are represented here by $y_i$.  is the location of the MEAN, or centre, of our Gaussian distribution, while  is the size of the uncertainty. The $N$ indicates that the probability of our measurements taking on particular values follows a normal distribution (as opposed to a different type of probability distribution).

The mean should be the “true” value of $y$, given by our linear model, and so we can make the following replacement: \[ y_i \sim N(mt+c, \sigma) \]

What we want is a formula to tell us the PROBABILITY of our measurement taking a particular value. The most basic formula for a Gaussian, or normal distribution, is \[P(y_i | t, \sigma) = \exp(-y_i^2). \]
Our notation on the left hand side of this equation tells us we want the probability of getting a measurement $y_i$, given that we are measuring at time $t$, and have uncertainties of size \$ \sigma \$.

Since this is a probability distribution, we should add some constants to ensure the total area under the Gaussian, which corresponds to the probability of $y_i$ taking any value, is one: \[ P(y_i | t, \sigma) = \frac{1}{\sqrt{2\pi}} \exp(-\frac{1}{2} y_i^2) \]

This Gaussian has a mean of 0 and a standard deviation of 1. These are the parameters of our Gaussian, and we want to change them so that they fit our model. We can add the mean $\mu$ and standard deviation $\sigma$ into the Gaussian formula like this: \[ P(y_i | t, \sigma) = \frac{1}{\sqrt{2\pi\sigma^2}} \exp ( -\frac{(y_i - \mu)^2}{2\sigma^2} ) \]

Let's replace the mean with the one from our linear model: \[ P(y_i | t, \sigma) = \frac{1}{\sqrt{2\pi\sigma^2}} \exp ( -\frac{(y_i - (mt + c))^2}{2\sigma^2} ) \]

By using this formula we are able to determine the probability of our CO2 concentration measurement taking a particular value given that we are measuring at time $t$. Try playing around with the model parameters and the Gaussian below to see where our measurements fall.

<div id="myPlot">
  <button onclick="javascript:randomize();">Randomize!</button>
  <div class="slidecontainer" id="meanslidecontainer">
    <input type="range" min="0" max="10" value="5" class="slider" id="myMean">
    <p>Mean: <span id="meanValue"></span></p>
  </div>
  <div class="slidecontainer" id="stdslidecontainer">
    <input type="range" min="1" max="5" value="1" class="slider" id="myStd">
    <p>Standard deviation: <span id="stdValue"></span></p>
  </div>
</div>

**Figure 5 (Interactive) - CO2 vs time plot and 1D Gaussian over CO2 concentration**

## Welcome to GitHub Pages

You can use the [editor on GitHub](https://github.com/DTCupcakes/maths-laboratory/edit/gh-pages/index.md) to maintain and preview the content for your website in Markdown files.

Whenever you commit to this repository, GitHub Pages will run [Jekyll](https://jekyllrb.com/) to rebuild the pages in your site, from the content in your Markdown files.

### Markdown

Markdown is a lightweight and easy-to-use syntax for styling your writing. It includes conventions for

```markdown
Syntax highlighted code block

# Header 1
## Header 2
### Header 3

- Bulleted
- List

1. Numbered
2. List

**Bold** and _Italic_ and `Code` text

[Link](url) and ![Image](src)
```

For more details see [Basic writing and formatting syntax](https://docs.github.com/en/github/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax).

### Jekyll Themes

Your Pages site will use the layout and styles from the Jekyll theme you have selected in your [repository settings](https://github.com/DTCupcakes/maths-laboratory/settings/pages). The name of this theme is saved in the Jekyll `_config.yml` configuration file.

### Support or Contact

Having trouble with Pages? Check out our [documentation](https://docs.github.com/categories/github-pages-basics/) or [contact support](https://support.github.com/contact) and we’ll help you sort it out.
