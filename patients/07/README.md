it looks like [this commit](https://github.com/d3/d3-interpolate/commit/8b5587adb0fb57a8098b0c268ab17813ec911ad7) from version [1.1.2](https://github.com/d3/d3-interpolate/releases/tag/v1.1.2) of [d3-interpolate](https://github.com/d3/d3-interpolate) breaks [d3-sankey](https://github.com/d3/d3-sankey)

building d3-sankey.js and using it yields this error message  
![d3Interpolate.number is not a function](http://i.imgur.com/t1BIqn6.png)  

here is a diff between version 0.4.1 of `d3-sankey` hosted at [https://unpkg.com/d3-sankey@0.4.1](https://unpkg.com/d3-sankey@0.4.1)  
![diff](http://i.imgur.com/XS9gbCC.png)  

---

an iteration with the modern d3 version 4 `d3-sankey` module.  testing out loading the UMD file from a script tag. 

```
git clone git@github.com:d3/d3-sankey.git
npm i
npm run pretest
```

then use `build/d3-sankey.js`

https://github.com/d3/d3-sankey