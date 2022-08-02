 <script type="text/x-mathjax-config">
    MathJax.Hub.Config({
      tex2jax: {
        skipTags: ['script', 'noscript', 'style', 'textarea', 'pre'],
        inlineMath: [['$','$']]
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

<div id="linModelPlot">
  <div class="slidecontainer" id="linSlopeSlideContainer">
    <input type="range" min="0" max="10" value="1" class="slider" id="linSlope">
    <p>m: <span id="linSlopeVal"></span></p>
  </div>
  <div class="slidecontainer" id="linIceptSlideContainer">
    <input type="range" min="300" max="400" value="300" class="slider" id="linIcept">
    <p>c: <span id="linIceptVal"></span></p>
  </div>
</div>
  
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
