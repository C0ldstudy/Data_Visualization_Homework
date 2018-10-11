var margin = {top: 20, right: 20, bottom: 30, left: 40},
  width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;
var xName = "Birth Rate",
  yName = "Death Rate";

/*
 * value accessor - returns the value to encode for a given data object.
 * scale - maps value to a visual display encoding, such as a pixel position.
 * map function - maps from data value to display value
 * axis - sets up axis
 */

// setup x
var xValue = function(d) { return d["Birth Rate"];}, // data -> value
    xScale = d3.scale.linear().range([0,width]).nice(), // value -> display
    xMap = function(d) { return xScale(xValue(d));}, // data -> display
    xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickFormat(d3.format(".0%"));

// setup y
var yValue = function(d) { return d["Death Rate"];}, // data -> value
    yScale = d3.scale.linear().range([height, 0]).nice(), // value -> display
    yMap = function(d) { return yScale(yValue(d));}, // data -> display
    yAxis = d3.svg.axis().scale(yScale).orient("left").tickFormat(d3.format(".0%"));

// setup fill color
var cValue = function(d) { return d["Region"];},
    color = d3.scale.category10();

// add the tooltip area to the webpage
var tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// load data
d3.csv("countries_of_world.csv", function(error, data) {

  // change string (from CSV) into number format
  data.forEach(function(d) {
    d["Birth Rate"] = +d["Birth Rate"];
    d["Death Rate"] = +d["Death Rate"];
    // console.log(d);
  });

  var xMax = d3.max(data, function(d) { return d[xName]; }) * 1.05,
      xMin = d3.min(data, function(d) { return d[xName]; }),
      xMin = xMin > 0 ? 0 : xMin,
      yMax = d3.max(data, function(d) { return d[yName]; }) * 1.05,
      yMin = d3.min(data, function(d) { return d[yName]; }),
      yMin = yMin > 0 ? 0 : yMin;
  xScale.domain([xMin, xMax]);
  yScale.domain([yMin, yMax]);

  // // don't want dots overlapping axis, so add in buffer to data domain
  // xScale.domain([d3.min(data, xValue)-0.01, d3.max(data, xValue)+0.01]);
  // yScale.domain([d3.min(data, yValue)-0.01, d3.max(data, yValue)+0.01]);

  // zoom in/out
  var zoomBeh = d3.behavior.zoom()
    .x(xScale)
    .y(yScale)
    .scaleExtent([0, 500])
    .on("zoom", zoom);

    // add the graph canvas to the body of the webpage
  var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .call(zoomBeh);

  // x-axis
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text(xName);


  // y-axis
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
    .text(yName);
  //   var objects = svg.append("svg")
  //     .classed("objects", true)
  //     .attr("width", width)
  //     .attr("height", height);

  // objects.append("svg:line")
  //     .classed("axisLine hAxisLine", true)
  //     .attr("x1", 0)
  //     .attr("y1", 0)
  //     .attr("x2", width)
  //     .attr("y2", 0)
  //     .attr("transform", "translate(0," + height + ")");

  // objects.append("svg:line")
  //     .classed("axisLine vAxisLine", true)
  //     .attr("x1", 0)
  //     .attr("y1", 0)
  //     .attr("x2", 0)
  //   .attr("y2", height);

    svg.append("rect")
    .attr("width", width)
    .attr("height", height)

  // draw dots
    svg.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 3.5)
      .attr("transform", transform)
      .style("fill", function(d) { return color(cValue(d));})
    .on("mouseover", function (d) {
      d3.select(this).transition().attr("r", 10); //change the radius to enlarge the circle
      tooltip.transition()
           .duration(200)
           .style("opacity", .9);
      tooltip.html(d["Country"])
           .style("left", (d3.event.pageX + 10) + "px")
           .style("top", (d3.event.pageY - 10) + "px");
  })
    .on("mouseout", function (d) {
      d3.select(this).transition().attr("r", 3.5); // get back to the normal circle size
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    });

  // draw legend
  var legend = svg.selectAll(".legend")
      .data(color.domain())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  // draw legend colored rectangles
  legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

  // draw legend text
  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
    .text(function (d) { return d; })

  function zoom() {
    svg.select(".x.axis").call(xAxis);
    svg.select(".y.axis").call(yAxis);
    svg.selectAll(".dot")
      .attr("transform", transform);
  }

  function transform(d) {
    return "translate(" + xScale(d[xName]) + "," + yScale(d[yName]) + ")";
  }
});
