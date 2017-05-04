var margin = {top: 1, right: 1, bottom: 6, left: 1},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var formatNumber = d3.format(",.0f"),
    format = function(d) { return formatNumber(d) + " TWh"; },
    color = d3.scaleOrdinal(d3.schemeCategory20);

var svg = d3.select("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var sankey = d3.sankey()
    .nodeWidth(15)
    .nodePadding(10)
    .size([width, height]);

var path = sankey.link();

var freqCounter = 1;


d3.json("energy.json", function(energy) {

  sankey
      .nodes(energy.nodes)
      .links(energy.links)
      .layout(32);

  var link = svg.append("g").selectAll(".link")
      .data(energy.links)
    .enter().append("path")
      .attr("class", "link")
      .attr("d", path)
      .style("stroke-width", function(d) { return Math.max(1, d.dy); })
      .sort(function(a, b) { return b.dy - a.dy; });

  link.append("title")
      .text(function(d) { return d.source.name + " → " + d.target.name + "\n" + format(d.value); });

  var node = svg.append("g").selectAll(".node")
      .data(energy.nodes)
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
    .call(d3.drag()
      .subject(function(d) { return d; })
      .on("start", function() { this.parentNode.appendChild(this); })
      .on("drag", dragmove));

  node.append("rect")
      .attr("height", function(d) { return d.dy; })
      .attr("width", sankey.nodeWidth())
      .style("fill", function(d) { return d.color = color(d.name.replace(/ .*/, "")); })
      .style("stroke", "none")
    .append("title")
      .text(function(d) { return d.name + "\n" + format(d.value); });

  node.append("text")
      .attr("x", -6)
      .attr("y", function(d) { return d.dy / 2; })
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .attr("transform", null)
      .text(function(d) { return d.name; })
    .filter(function(d) { return d.x < width / 2; })
      .attr("x", 6 + sankey.nodeWidth())
      .attr("text-anchor", "start");

  function dragmove(d) {
    d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")");
    sankey.relayout();
    link.attr("d", path);
  }

  var linkExtent = d3.extent(energy.links, function (d) {return d.value});
  var frequencyScale = d3.scaleLinear().domain(linkExtent).range([0.05,1]);
  var particleSize = d3.scaleLinear().domain(linkExtent).range([1,5]);


  energy.links.forEach(function (link) {
    link.freq = frequencyScale(link.value);
    link.particleSize = 2;
    link.particleColor = d3.scaleLinear().domain([0,1])
    .range([link.source.color, link.target.color]);
  })

  var t = d3.timer(tick, 1000);
  var particles = [];

  function tick(elapsed, time) {

    particles = particles.filter(function (d) {return d.current < d.path.getTotalLength()});

    d3.selectAll("path.link")
    .each(
      function (d) {
//        if (d.freq < 1) {
        for (var x = 0;x<2;x++) {
          var offset = (Math.random() - .5) * (d.dy - 4);
          if (Math.random() < d.freq) {
            var length = this.getTotalLength();
            particles.push({link: d, time: elapsed, offset: offset, path: this, length: length, animateTime: length, speed: 0.5 + (Math.random())})
          }
        }

//        }
/*        else {
          for (var x = 0; x<d.freq; x++) {
            var offset = (Math.random() - .5) * d.dy;
            particles.push({link: d, time: elapsed, offset: offset, path: this})
          }
        } */
      });

    particleEdgeCanvasPath(elapsed);
  }

  function particleEdgeCanvasPath(elapsed) {
    var context = d3.select("canvas").node().getContext("2d")

    context.clearRect(0,0,1000,1000);

      context.fillStyle = "gray";
      context.lineWidth = "1px";
    for (var x in particles) {
        var currentTime = elapsed - particles[x].time;
//        var currentPercent = currentTime / 1000 * particles[x].path.getTotalLength();
        particles[x].current = currentTime * 0.15 * particles[x].speed;
        var currentPos = particles[x].path.getPointAtLength(particles[x].current);
        context.beginPath();
      context.fillStyle = particles[x].link.particleColor(0);
        context.arc(currentPos.x,currentPos.y + particles[x].offset,particles[x].link.particleSize,0,2*Math.PI);
        context.fill();
    }
  }


});
