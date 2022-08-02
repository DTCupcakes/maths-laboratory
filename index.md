## Gaussian Processes
<script defer src="https://cdn.plot.ly/plotly-latest.min.js"> </script>
  <script defer src="myScript.js"></script>

  <div id="linModelPlot">'
    <div class="slidecontainer" id="linSlopeSlideContainer">
      <input type="range" min="0" max="10" value="1" class="slider" id="linSlope">
      <p>m: <span id="linSlopeVal"></span></p>
    </div>
    <div class="slidecontainer" id="linIceptSlideContainer">
      <input type="range" min="300" max="400" value="300" class="slider" id="linIcept">
      <p>c: <span id="linIceptVal"></span></p>
    </div>
  </div>
  
  <div id="myPlot"></div>
  <button onclick="javascript:randomize();">Randomize!</button>
  <div class="slidecontainer" id="meanslidecontainer">
    <input type="range" min="0" max="10" value="5" class="slider" id="myMean">
    <p>Mean: <span id="meanValue"></span></p>
  </div>
  <div class="slidecontainer" id="stdslidecontainer">
    <input type="range" min="1" max="5" value="1" class="slider" id="myStd">
    <p>Standard deviation: <span id="stdValue"></span></p>
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
