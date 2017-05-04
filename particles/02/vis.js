/* global d3 */

const margin = { top: 1, right: 1, bottom: 6, left: 1 };
const width = 960 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;
const formatNumber = d3.format(',.0f');
const format = d => `${formatNumber(d)} TWh`;
const color = d3.scaleOrdinal(d3.schemeCategory20);

const svg = d3.select('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

const sankey = d3.sankey()
  .nodeWidth(15)
  .nodePadding(10)
  .size([width, height]);

const path = sankey.link();

const freqCounter = 1;

d3.json('energy.json', (energy) => {
  sankey
    .nodes(energy.nodes)
    .links(energy.links)
    .layout(32);

  const link = svg.append('g').selectAll('.link')
    .data(energy.links)
    .enter().append('path')
      .attr('class', 'link')
      .attr('d', path)
      .style('stroke-width', d => Math.max(1, d.dy))
      .sort((a, b) => b.dy - a.dy);

  link.append('title')
    .text(d => `${d.source.name} → ${d.target.name}\n${format(d.value)}`);

  const node = svg.append('g').selectAll('.node')
    .data(energy.nodes)
    .enter().append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .call(d3.drag()
        .subject(d => d)
        .on('start', function () { this.parentNode.appendChild(this); })
        .on('drag', dragmove));

  node.append('rect')
    .attr('height', d => d.dy)
    .attr('width', sankey.nodeWidth())
    .style('fill', (d) => {
      d.color = color(d.name.replace(/ .*/, ''));
      return d.color;
    })
    .style('stroke', 'none')
    .append('title')
      .text(d => `${d.name}\n${format(d.value)}`);

  node.append('text')
    .attr('x', -6)
    .attr('y', d => d.dy / 2)
    .attr('dy', '.35em')
    .attr('text-anchor', 'end')
    .attr('transform', null)
    .text(d => d.name)
    .filter(d => d.x < width / 2)
      .attr('x', 6 + sankey.nodeWidth())
      .attr('text-anchor', 'start');

  function dragmove(d) {
    d3.select(this).attr('transform', `translate(${d.x},${d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))})`);
    sankey.relayout();
    link.attr('d', path);
  }

  const linkExtent = d3.extent(energy.links, d => d.value);
  const frequencyScale = d3.scaleLinear().domain(linkExtent).range([0.05, 1]);
  const particleSize = d3.scaleLinear().domain(linkExtent).range([1, 5]);


  energy.links.forEach((link) => {
    link.freq = frequencyScale(link.value);
    link.particleSize = 2;
    link.particleColor = d3.scaleLinear().domain([0, 1])
    .range([link.source.color, link.target.color]);
  });

  const t = d3.timer(tick, 1000);
  let particles = [];

  function tick(elapsed, time) {
    particles = particles.filter(d => d.current < d.path.getTotalLength());

    d3.selectAll('path.link')
    .each(
      function (d) {
        // if (d.freq < 1) {
        for (let x = 0; x < 2; x += 1) {
          const offset = (Math.random() - 0.5) * (d.dy - 4);
          if (Math.random() < d.freq) {
            const length = this.getTotalLength();
            particles.push({ link: d, time: elapsed, offset, path: this, length, animateTime: length, speed: 0.5 + (Math.random()) });
          }
        }
        // }
        /*    
            else {
              for (var x = 0; x<d.freq; x++) {
                var offset = (Math.random() - .5) * d.dy;
                particles.push({link: d, time: elapsed, offset: offset, path: this})
              }
            } 
        */
      });

    particleEdgeCanvasPath(elapsed);
  }

  function particleEdgeCanvasPath(elapsed) {
    const context = d3.select('canvas').node().getContext('2d');

    context.clearRect(0, 0, 1000, 1000);

    context.fillStyle = 'gray';
    context.lineWidth = '1px';
    for (const x in particles) {
      if ({}.hasOwnProperty.call(particles, x)) {
        const currentTime = elapsed - particles[x].time;
        // var currentPercent = currentTime / 1000 * particles[x].path.getTotalLength();
        particles[x].current = currentTime * 0.15 * particles[x].speed;
        const currentPos = particles[x].path.getPointAtLength(particles[x].current);
        context.beginPath();
        context.fillStyle = particles[x].link.particleColor(0);
        context.arc(currentPos.x, currentPos.y + particles[x].offset, particles[x].link.particleSize, 0, 2 * Math.PI);
        context.fill();
      }
    }
  }
});
