/*
*    main.js
*    Mastering Data Visualization with D3.js
*    3.11 - Making a bar chart
*/

var width = 2000;
var radius = width / 2;

d3.json("data/buildings.json").then(function(data) {
  console.log(data);

  const root = tree(data);

  //  var svgT = d3
  //    .select("#chart-area")
  //   .append("svg")
  //    .attr("width", width)
  //.attr("height", width);

  //var svgT = document.createElement("svg");
  //svgT.setAttribute("width", width).setAttribute("height", width);

  const svg = d3
    .select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", width)
    .style("width", "100%")
    .style("height", "auto")
    .style("padding", "10px")
    .style("box-sizing", "border-box")
    .style("font", "10px sans-serif");

  const g = svg.append("g");

  const link = g
    .append("g")
    .attr("fill", "none")
    .attr("stroke", "#555")
    .attr("stroke-opacity", 0.4)
    .attr("stroke-width", 1.5)
    .selectAll("path")
    .data(root.links())
    .enter()
    .append("path")
    .attr(
      "d",
      d3
        .linkRadial()
        .angle(d => d.x)
        .radius(d => d.y)
    );

  var node = g
    .append("g")
    .attr("stroke-linejoin", "round")
    .attr("stroke-width", 3)
    .selectAll("g")
    .data(root.descendants().reverse())
    .enter()
    .append("g")
    .attr(
      "transform",
      d => `
            rotate(${d.x * 180 / Math.PI - 90})
            translate(${d.y},0)
          `
    );

  node
    .append("circle")
    .attr("fill", d => (d.children ? "#555" : "#999"))
    .attr("r", 2.5);

  node
    .append("text")
    .attr("dy", "0.31em")
    .attr("x", d => (d.x < Math.PI === !d.children ? 6 : -6))
    .attr("text-anchor", d => (d.x < Math.PI === !d.children ? "start" : "end"))
    .attr("transform", d => (d.x >= Math.PI ? "rotate(180)" : null))
    .text(d => d.data.name)
    .clone(true)
    .lower()
    .attr("stroke", "white");

  document.body.appendChild(svg.node());
  console.log(g.node());
  const box = g.node().getBBox();

  console.log(box.width);
  console.log(box.height);

  svg
    .remove()
    .attr("width", box.width)
    .attr("height", box.height)
    .attr("viewBox", `${box.x} ${box.y} ${box.width} ${box.height}`);

  console.log(svg);

  var canvas = svg;
  var context = canvas.getContext("2d");

  width = canvas.property("width");
  height = canvas.property("height");

  canvas.call(
    d3
      .zoom()
      .scaleExtent([1 / 2, 4])
      .on("zoom", zoomed)
  );

  function zoomed() {
    context.save();
    context.clearRect(0, 0, width, height);
    context.translate(d3.event.transform.x, d3.event.transform.y);
    context.scale(d3.event.transform.k, d3.event.transform.k);
    drawPoints();
    context.restore();
  }

  function drawPoints() {
    context.beginPath();
    points.forEach(drawPoint);
    context.fill();
  }

  function drawPoint(point) {
    context.moveTo(point[0] + radius, point[1]);
    context.arc(point[0], point[1], radius, 0, 2 * Math.PI);
  }

  d3.select("body").append(function() {
    return svg.node();
  });
});

var tree = data =>
  d3
    .tree()
    .size([2 * Math.PI, radius])
    .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth)(
    d3.hierarchy(data)
  );
