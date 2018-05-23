an experiment with a synthetic patient flow dataset

---

original example

---

a solution 🎉

[![solution](http://i.imgur.com/s6msjAQ.png)](https://twitter.com/NadiehBremer/status/801359689279795200)  
[[tweet](https://twitter.com/NadiehBremer/status/801359689279795200)]

specifically, this [stackoverflow answer](http://stackoverflow.com/a/19709615/1732222) has the workaround to solve this apparent bug in [Chromium](https://www.chromium.org/)'s implementation of the [SVG 1.1 standard](https://www.w3.org/TR/SVG/)

in `d3.sankey.js`, we want to alter the return value of the path generator to ensure that we never return perfectly straight paths. inserting this this new `moveto` command `"M" + -10 + "," + -10` on the first line does just that:

```javascript
return (
    'M' +
    -10 +
    ',' +
    -10 +
    'M' +
    x0 +
    ',' +
    y0 +
    'C' +
    x2 +
    ',' +
    y0 +
    ' ' +
    x3 +
    ',' +
    y1 +
    ' ' +
    x1 +
    ',' +
    y1
)
```

an iteration on by [Patient Flow Sankey Particles](http://bl.ocks.org/micahstubbs/ed0ae1c70256849dab3e35a0241389c9) from [@micahstubbs](https://twitter.com/micahstubbs)

see also the [earlier version](https://bl.ocks.org/micahstubbs/3c0cb0c0de021e0d9653032784c035e9) with `13` layout iterations that happens to avoid any perfectly straight paths.

and also this [earlier bug reproduction example](https://bl.ocks.org/micahstubbs/bf90fda6717e243832edad6ed9f82814) with `14` Sankey layout iterations that does produce a couple of those problematic-for-Chromium perfectly straight SVG paths

inspired by the blog post [Data-based and unique gradients for visualizations with d3.js](http://www.visualcinnamon.com/2016/05/data-based-svg-gradient-d3.html) and associated example [Data based gradients - Simple - Solar system](http://bl.ocks.org/nbremer/f4138083889ba159ae8385b4a54da8fb) from [@nadiehbremer](https://twitter.com/nadiehbremer)
