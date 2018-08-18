var fontScale = d3.scaleLinear()
    .range([14, 22]);
// format variables
var formatNumber = d3.format(".1f"), // zero decimal places
    format = function(d) { return formatNumber(d); },
    color = d3.scaleOrdinal(d3.schemeCategory20);

// format date
var timeParse = d3.timeParse("%Y")
var formatYear = d3.timeFormat("%Y")

//transition times
var highightTransition = 50
var newYearTransition = 2000

//starting year
var thisYear = 1968

// load the data
d3.csv("us-budget-sankey-main.csv", function(error, csv) {
    if (error) throw error;

    // load deficit data
    d3.csv("us-budget-sankey-deficit.csv", function(error, deficit) {
        if (error) throw error;

        // load bars data
        d3.csv("us-budget-sankey-bars.csv", function(error, barData) {
            if (error) throw error;

            newData(csv, deficit, thisYear);
            drawSankey()
            drawSlider();
        });
    });
});

//------THE TRANSITIONING FUNCTION------\\
function updateSankey() {
    var path = sankey.link();

    sankey.nodes(nodes)
        .links(links)
        .layout(1000);

    sankey.relayout(); // PURPOSE???
    fontScale.domain(d3.extent(nodes, function(d) { return d.value }));

    // transition links
    sankeySvg.selectAll(".link")
        .data(links)
        .transition()
        .duration(newYearTransition)
        .attr("d", path)
        .style("stroke-width", function(d) { return Math.max(1, d.dy); });

    // transition nodes
    sankeySvg.selectAll(".node")
        .data(nodes)
        .transition()
        .duration(newYearTransition)
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")"
        });

    // transition rectangles for the nodes
    sankeySvg.selectAll(".node rect")
        .data(nodes)
        .transition()
        .duration(newYearTransition)
        .attr("height", function(d) {
            return d.dy < 0 ? .1 : d.dy;
        });

    // //-----SOMETHING NEEDS TO GET FIXED BELOW?-----\\
    // title for the nodes
    sankeySvg.selectAll(".nodeLabel")
        .data(nodes)
        .transition()
        .duration(newYearTransition)
        .style("font-size", function(d) {
            return Math.floor(fontScale(d.value)) + "px";
        });

    // % for the nodes
    sankeySvg.selectAll(".nodePercent")
        .data(nodes)
        .text(function(d) { return format(d.value) + "%" });

    //% for spending in times of surplus using seperate data

    node.append("text")
        .attr("text-anchor", "middle")
        .attr("x", 30)
        .attr("y", function(d) { return d.dy / 2; })
        .style("font-size", 18)
        .attr("dy", ".35em")
        .filter(function(d) { return d.node == 20 })
        .text(function() {
            return format(thisYearDeficit[0].spending) + "%"
        })
        .attr('class', 'nodePercent');
}

function newData(csv, deficit, thisYear) {
    thisYearCsv = csv.filter(function(d) {
        if (d['year'] == thisYear) {
            return d
        }
    });
    //console.log(thisYearCsv)

    thisYearDeficit = deficit.filter(function(d) {
        if (d['year'] == thisYear) {
            return d
        }
    });
    //console.log(thisYearDeficit)

    //create an array to push all sources and targets, before making them unique
    //because starting nodes are not targets and end nodes are not sources
    arr = [];
    thisYearCsv.forEach(function(d) {
        arr.push(d.source);
        arr.push(d.target);
    }); //console.log(arr.filter(onlyUnique))

    // create nodes array
    nodes = arr.filter(onlyUnique).map(function(d, i) {
        return {
            node: i,
            name: d
        }
    });

    //console.log(nodes)
    // create links array
    links = thisYearCsv.map(function(thisYearCsv_row) {
        return {
            source: getNode("source"),
            target: getNode("target"),
            value: +thisYearCsv_row.value,
            type: thisYearCsv_row.type //to alow for proper keying
        }

        function getNode(type) {
            return nodes.filter(function(node_object) { return node_object.name == thisYearCsv_row[type]; })[0].node;
        }
    });
    //console.log(links)

    lineData = csv
    lineData.forEach(function(d) {
        d.year = +d.year;
        d.value = +d.value;
    });
    //console.log(lineData)
};

function drawSankey() {
    // set the dimensions and margins of the graph
    sankeyMargin = { top: 30, right: 10, bottom: 10, left: 10 },
        sankeyWidth = sankeyContainer.offsetWidth - sankeyMargin.left - sankeyMargin.right,
        sankeyHeight = 425 - sankeyMargin.top - sankeyMargin.bottom;

    // append the svg object to the body of the page
    sankeySvg = d3.select("#sankeyContainer").append("svg")
        .attr("width", sankeyWidth + sankeyMargin.left + sankeyMargin.right)
        .attr("height", sankeyHeight + sankeyMargin.top + sankeyMargin.bottom)
        .attr('class', 'sankeyCanvas')
        .style('background', '#e8e8e8')
        .append("g")
        .attr("transform",
            "translate(" + sankeyMargin.left + "," + sankeyMargin.top + ")");

    // Set the sankey diagram properties
    sankey = d3.sankey()
        .nodeWidth(60)
        .nodePadding(20)
        .size([sankeyWidth, sankeyHeight]);

    var path = sankey.link();

    sankey.nodes(nodes)
        .links(links)
        .layout(1000);

    fontScale.domain(d3.extent(nodes, function(d) { return d.value }));

    // add in the links
    var link = sankeySvg.append("g").selectAll(".link")
        .data(links, function(d) { return d.id; })
        .enter().append("path")
        .attr("class", "link")
        .attr("d", path)
        .style('stroke', function(d) { if (d.type == 'Revenue') { return 'green' } else if (d.type == 'Spending') { return 'red' } else { return 'grey' } })
        .style("stroke-width", function(d) { return Math.max(1, d.dy); })
        .attr('key', function(d) { if (d.type == 'Revenue') { return d.source.name.split(' ').join('_') } else { return d.target.name.split(' ').join('_') } });

    // add in the nodes
    var node = sankeySvg.append("g").selectAll(".node")
        .data(nodes)
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")"
        });

    // add the rectangles for the nodes
    node.append("rect")
        .attr("height", function(d) {
            return d.dy < 0 ? .1 : d.dy;
        })
        .attr("width", sankey.nodeWidth())
        .attr('key', function(d) {
            return d.name.split(' ').join('_');
        })
        .attr('value', function(d) {
            return d.value;
        })
        .attr('class', 'nodeRect')
        .style("fill", 'lightgrey')
        .style("opacity", 0.5)
        .style("stroke", 'black');

    // title for the nodes
    node.append("text")
        .attr("x", -6)
        .attr("y", function(d) { return d.dy / 2; })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .style("font-size", function(d) {
            return Math.floor(fontScale(d.value)) + "px";
        })
        .text(function(d) { return d.name; })
        .attr('class', 'nodeLabel')
        .filter(function(d) { return d.x < sankeyWidth / 2; })
        .attr("x", 6 + sankey.nodeWidth())
        .attr("text-anchor", "start");

    // % for the nodes
    node.append("text")
        .attr("text-anchor", "middle")
        .attr("x", 30)
        .attr("y", function(d) { return d.dy / 2; })
        .style("font-size", 16)
        .attr("dy", ".35em")
        .attr('class', 'nodePercent')
        .filter(function(d) { return d.value > 1 })
        .filter(function(d) { return d.node != 20 }) //do spending seperately to correctly show surplus
        .text(function(d) { return format(d.value) + "%" });

    //PERCENT OF GDP label
    sankeySvg.append('text')
        .attr("x", 0)
        .attr("y", -5)
        .attr("dy", "0em")
        .text('Percent of GDP (May not add up due to rounding)')
        .attr('font-size', 20)
        .attr('font-weight', 'bold')
        .attr('class', 'percent');

    // % for spending in times of surplus using seperate data
    node.append("text")
        .attr("text-anchor", "middle")
        .attr("x", 30)
        .attr("y", function(d) { return d.dy / 2; })
        .style("font-size", 18)
        .attr("dy", ".35em")
        .filter(function(d) { return d.node == 20 })
        .text(function() {
            return format(thisYearDeficit[0].spending) + "%"
        })
        .attr('class', 'nodePercent');
};

function drawSlider() {
    //Slider
    var slider = d3.sliderHorizontal()
        .min(1968)
        .max(2017)
        .step(1)
        .width(barsContainer.offsetWidth - 62)
        .tickFormat(d3.format(".4"))
        .on('end', val => { //use end instead of onchange, is when user releases mouse
            thisYear = val;

            d3.csv("us-budget-sankey-main.csv", function(error, csv) {
                if (error) throw error;

                d3.csv("us-budget-sankey-deficit.csv", function(error, deficit) {
                    if (error) throw error;
                    newData(csv, deficit, thisYear);
                    updateSankey()
                });
            });
        })

    var g = d3.select("div#slider").append("svg")
        .attr("width", barsContainer.offsetWidth)
        .attr("height", 100)
        .append("g")
        .attr("transform", "translate(30,30)");

    g.call(slider);
    d3.selectAll('#slider')
        .style('font-size', 20)
}

function stackMin(serie) {
    return d3.min(serie, function(d) { return d[0]; });
};

function stackMax(serie) {
    return d3.max(serie, function(d) { return d[1]; });
};

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
};