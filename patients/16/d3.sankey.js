d3.sankey = function() {
  var sankey = {},
    nodeWidth = 24,
    nodeHeight = 30,
    nodePadding = 8,
    size = [1, undefined],
    nodes = [],
    links = []

  let height = size[1]
  if (typeof height === 'undefined') {
    // height = nodeHeight * nodes.length
    // TODO find a nice dynamic way to calculate this
    height = 160
  }

  const nodesHash = {}

  sankey.nodeWidth = function(_) {
    if (!arguments.length) return nodeWidth
    nodeWidth = +_
    return sankey
  }

  sankey.nodeHeight = function(_) {
    if (!arguments.length) return nodeHeight
    nodeHeight = +_
    return sankey
  }

  sankey.nodePadding = function(_) {
    if (!arguments.length) return nodePadding
    nodePadding = +_
    return sankey
  }

  sankey.nodes = function(_) {
    if (!arguments.length) return nodes
    nodes = _
    return sankey
  }

  sankey.links = function(_) {
    if (!arguments.length) return links
    links = _
    return sankey
  }

  sankey.size = function(_) {
    if (!arguments.length) return size
    size = _
    return sankey
  }

  sankey.layout = function(iterations) {
    computeNodeLinks()
    computeNodeValues()
    computeNodeBreadths()
    computeNodeDepths(iterations)
    computeLinkDepths()
    return sankey
  }

  sankey.relayout = function() {
    computeLinkDepths()
    return sankey
  }

  sankey.link = function() {
    var curvature = 0.5

    function link(d) {
      var x0 = d.source.x + d.source.dx,
        x1 = d.target.x,
        xi = d3.interpolateNumber(x0, x1),
        x2 = xi(curvature),
        x3 = xi(1 - curvature),
        y0 = d.source.y + d.sy + d.dy / 2,
        y1 = d.target.y + d.ty + d.dy / 2
      // prevent a perfectly straight path
      // to avoid missing SVG path gradient bug in Chromium
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
    }

    link.curvature = function(_) {
      if (!arguments.length) return curvature
      curvature = +_
      return link
    }

    return link
  }

  // Populate the sourceLinks and targetLinks for each node.
  // Also, if the source and target are not objects, assume they are indices.
  function computeNodeLinks() {
    nodes.forEach(function(node) {
      node.sourceLinks = []
      node.targetLinks = []
      nodesHash[node.id] = node
    })
    links.forEach(function(link) {
      var source = link.source,
        target = link.target
      if (typeof source === 'number')
        source = link.source = nodesHash[link.source]
      if (typeof target === 'number')
        target = link.target = nodesHash[link.target]
      source.sourceLinks.push(link)
      target.targetLinks.push(link)
    })
  }

  // Compute the value (size) of each node by summing the associated links.
  function computeNodeValues() {
    nodes.forEach(function(node) {
      node.value = Math.max(
        d3.sum(node.sourceLinks, value),
        d3.sum(node.targetLinks, value)
      )
      // update the nodesHash with the newly computed value
      nodesHash[node.id] = node
    })
  }

  // Iteratively assign the breadth (x-position) for each node.
  // Nodes are assigned the maximum breadth of incoming neighbors plus one;
  // nodes with no incoming links are assigned breadth zero, while
  // nodes with no outgoing links are assigned the maximum breadth.
  function computeNodeBreadths() {
    var remainingNodes = nodes,
      nextNodes,
      x = 0

    while (remainingNodes.length) {
      nextNodes = []
      remainingNodes.forEach(function(node) {
        node.x = x
        node.dx = nodeWidth
        node.sourceLinks.forEach(function(link) {
          if (nextNodes.indexOf(link.target) < 0) {
            nextNodes.push(link.target)
          }
        })
      })
      remainingNodes = nextNodes
      ++x
    }

    //
    moveSinksRight(x)
    scaleNodeBreadths((size[0] - nodeWidth) / (x - 1))
  }

  function moveSourcesRight() {
    nodes.forEach(function(node) {
      if (!node.targetLinks.length) {
        node.x =
          d3.min(node.sourceLinks, function(d) {
            return d.target.x
          }) - 1
        // update nodesHash with the newly computed x value
        nodesHash[node.id] = node
      }
    })
  }

  function moveSinksRight(x) {
    nodes.forEach(function(node) {
      if (!node.sourceLinks.length) {
        node.x = x - 1
        // update nodesHash with the newly computed x value
        nodesHash[node.id] = node
      }
    })
  }

  function scaleNodeBreadths(kx) {
    nodes.forEach(function(node) {
      node.x *= kx
      // update nodesHash with the newly computed x value
      nodesHash[node.id] = node
    })
  }

  function computeNodeDepths(iterations) {
    var nodesByBreadth = d3
      .nest()
      .key(function(d) {
        return d.x
      })
      .sortKeys(d3.ascending)
      .entries(nodes)
      .map(function(d) {
        return d.values
      })

    //
    initializeNodeDepth()
    resolveCollisions()
    for (var alpha = 1; iterations > 0; --iterations) {
      relaxRightToLeft((alpha *= 0.99))
      resolveCollisions()
      relaxLeftToRight(alpha)
      resolveCollisions()
    }

    function initializeNodeDepth() {
      // var ky = d3.min(nodesByBreadth, function(nodes) {
      //   const linkWidthFactor = nodePadding
      //   // return (
      //   //   (size[1] - (nodes.length - 1) * nodePadding) / d3.sum(nodes, value)
      //   // )
      //   return (
      //     (size[1] - (nodes.length - 1) * linkWidthFactor) /
      //     d3.sum(nodes, value)
      //   )
      // })
      const ky = nodeHeight

      nodesByBreadth.forEach(function(nodes) {
        nodes.forEach(function(node, i) {
          node.y = i
          // node.dy = node.value * ky
          node.dy = node.value * ky
          // update nodesHash with the newly computed y, dy values
          nodesHash[node.id] = node
        })
      })

      links.forEach(function(link) {
        link.dy = link.value * ky
      })
    }

    function relaxLeftToRight(alpha) {
      nodesByBreadth.forEach(function(nodes, breadth) {
        nodes.forEach(function(node) {
          if (node.targetLinks.length) {
            var y =
              d3.sum(node.targetLinks, weightedSource) /
              d3.sum(node.targetLinks, value)
            node.y += (y - center(node)) * alpha
            // update nodesHash with the newly computed y value
            nodesHash[node.id] = node
          }
        })
      })

      function weightedSource(link) {
        return center(link.source) * link.value
      }
    }

    function relaxRightToLeft(alpha) {
      nodesByBreadth
        .slice()
        .reverse()
        .forEach(function(nodes) {
          nodes.forEach(function(node) {
            if (node.sourceLinks.length) {
              var y =
                d3.sum(node.sourceLinks, weightedTarget) /
                d3.sum(node.sourceLinks, value)
              node.y += (y - center(node)) * alpha
              // update nodesHash with the newly computed y value
              nodesHash[node.id] = node
            }
          })
        })

      function weightedTarget(link) {
        return center(link.target) * link.value
      }
    }

    function resolveCollisions() {
      nodesByBreadth.forEach(function(nodes) {
        var node,
          dy,
          y0 = 0,
          n = nodes.length,
          i

        // Push any overlapping nodes down.
        nodes.sort(ascendingDepth)
        for (i = 0; i < n; ++i) {
          node = nodes[i]
          dy = y0 - node.y
          if (dy > 0) node.y += dy
          y0 = node.y + node.dy + nodePadding
        }

        // If the bottommost node goes outside the bounds, push it back up.
        dy = y0 - nodePadding - height
        if (dy > 0) {
          y0 = node.y -= dy

          // Push any overlapping nodes back up.
          for (i = n - 2; i >= 0; --i) {
            node = nodes[i]
            dy = node.y + node.dy + nodePadding - y0
            if (dy > 0) node.y -= dy
            y0 = node.y
          }
        }
      })
    }

    function ascendingDepth(a, b) {
      return a.y - b.y
    }
  }

  function computeLinkDepths() {
    nodes.forEach(function(node) {
      node.sourceLinks.sort(ascendingTargetDepth)
      node.targetLinks.sort(ascendingSourceDepth)
      // update nodesHash with the newly computed depths
      nodesHash[node.id] = node
    })
    nodes.forEach(function(node) {
      var sy = 0,
        ty = 0
      node.sourceLinks.forEach(function(link) {
        link.sy = sy
        sy += link.dy
      })
      node.targetLinks.forEach(function(link) {
        link.ty = ty
        ty += link.dy
      })
      // update nodesHash with the newly computed depths
      nodesHash[node.id] = node
    })

    function ascendingSourceDepth(a, b) {
      return a.source.y - b.source.y
    }

    function ascendingTargetDepth(a, b) {
      return a.target.y - b.target.y
    }
  }

  function center(node) {
    return node.y + node.dy / 2
  }

  function value(link) {
    return link.value
  }

  return sankey
}