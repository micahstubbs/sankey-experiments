here all of the link path gradients render 😀
 
```javascript
sankey
  .nodes(graph.nodes)
  .links(graph.links)
  .layout(13); // any value > 13 breaks the link gradient
```

an iteration on by [Patient Flow Sankey Particles](http://bl.ocks.org/micahstubbs/ed0ae1c70256849dab3e35a0241389c9) from [@micahstubbs](https://twitter.com/micahstubbs)

see also the [broken version](https://bl.ocks.org/micahstubbs/bf90fda6717e243832edad6ed9f82814) with `14` layout iterations

inspired by the blog post [Data-based and unique gradients for visualizations with d3.js](http://www.visualcinnamon.com/2016/05/data-based-svg-gradient-d3.html) and associated example [Data based gradients - Simple - Solar system](http://bl.ocks.org/nbremer/f4138083889ba159ae8385b4a54da8fb) from [@nadiehbremer](https://twitter.com/nadiehbremer)