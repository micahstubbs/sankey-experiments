this iteration finds the solution to the labels bug :tada: 

![sankey-label-y-position-fix-1](https://user-images.githubusercontent.com/2119400/44296223-2889f700-a26f-11e8-929f-e024690e4cf1.gif)

if we also transition the `y` attribute of both of our SVG text elements, everything lines up :sunglasses:   
link to line https://github.com/micahstubbs/sankey-experiments/blob/master/labels-bug/03/budget-dashboard.js#L78

![sankey-experiments_budget-dashboard_js_at_master_ _micahstubbs_sankey-experiments](https://user-images.githubusercontent.com/2119400/44296242-74d53700-a26f-11e8-9dca-57e4927166db.png)

---

this iteration removes unused variables

---

this iteration makes the code nice to work with

---

#### Help! Sankey labels not transitioning properly

This is the sankey from my working [federal budget dashboard](https://bl.ocks.org/MasonChinkin/5776c090ef29ad707e7835ee001662bd). For some reason when I try to apply transitions in the traditional way, the labels dont relocate properly.

I suspect it has something to do with sankey.js realligning the sankey categories by size every time the data is refreshed, but haven't been able to find a solution.

For reference, there are some [great blocks demonstrating transitioning sankeys](https://bl.ocks.org/syntagmatic/77c7f7e8802e8824eed473dd065c450b)