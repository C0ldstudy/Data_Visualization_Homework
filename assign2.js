var margin = {top: 20, right: 20, bottom: 30, left: 100},
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
var xValue = function(d) { return d[xName];}, // data -> value
    xScale = d3.scaleLinear().range([0,width]).nice(), // value -> display
    xMap = function(d) { return xScale(xValue(d));}, // data -> display
  // xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickFormat(d3.format(".0%"));
    xAxis = d3.axisBottom().scale(xScale).tickFormat(d3.format(".0%"));

// setup y
var yValue = function(d) { return d[yName];}, // data -> value
    yScale = d3.scaleLinear().range([height, 0]).nice(), // value -> display
    yMap = function(d) { return yScale(yValue(d));}, // data -> display
    // yAxis = d3.svg.axis().scale(yScale).orient("left").tickFormat(d3.format(".0%"));
    yAxis = d3.axisLeft().scale(yScale).tickFormat(d3.format(".0%"));

// setup fill color
var cValue = function(d) { return d["Region"];},
    color = d3.scaleOrdinal(d3.schemeCategory10);

// add the tooltip area to the webpage
var tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// load data
d3.csv("countries_of_world.csv", function (error, data) {
  var selectData = [];
  for (i = 2; i < Object.keys(data[0]).length; i++){
    selectData.push({ "text": Object.keys(data[0])[i] })
  }

  var xMax = d3.max(data, function(d) { return d[xName]; }) * 1.05,
      xMin = d3.min(data, function(d) { return d[xName]; }),
      xMin = xMin > 0 ? 0 : xMin,
      yMax = d3.max(data, function(d) { return d[yName]; }) * 1.05,
      yMin = d3.min(data, function(d) { return d[yName]; }),
      yMin = yMin > 0 ? 0 : yMin;
  xScale.domain([xMin, xMax]);
  yScale.domain([yMin, yMax]);

// add the graph canvas to the body of the webpage
  var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .call(d3.zoom()
    .scaleExtent([0, 500])
      .on("zoom", zoom));


// Select X-axis Variable
  d3.select("#scatter").append('br');
  var span = d3.select("#scatter").append('span')
      .text('Select X-Axis variable: ')
  var yInput = d3.select("#scatter").append('select')
        .attr('id','xSelect')
        .on('change',xChange)
      .selectAll('option')
        .data(selectData)
        .enter()
      .append('option')
        .attr('value', function (d) { return d.text })
        .text(function (d) { return d.text ;})
  d3.select("#scatter").append('br');

// Select Y-axis Variable
  var span = d3.select("#scatter").append('span')
        .text('Select Y-Axis variable: ')
  var yInput = d3.select("#scatter").append('select')
        .attr('id','ySelect')
        .on('change',yChange)
      .selectAll('option')
        .data(selectData)
        .enter()
      .append('option')
        .attr('value', function (d) { return d.text })
        .text(function (d) { return d.text ;})
  d3.select("#scatter").append('br');

// x-axis
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "xlabel")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text(xName);

// y-axis
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "ylabel")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
    .text(yName);

    svg.append("rect")
    .attr("width", width)
    .attr("height", height)

  // draw dots
    var circles = svg.selectAll(".dot")
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
    .text(function (d) { return d; });

    function zoom() {
      svg.attr("transform", d3.event.transform);
    }

  function transform(d) {
    return "translate(" + xScale(d[xName]) + "," + yScale(d[yName]) + ")";
  }

  function yChange() {
    var value = this.value; // get the new y value
    yName = this.value;
// change the yScale
    yScale.domain([
      d3.min([0, d3.min(data, function (d) { return d[value] * 1.01 })]),
      d3.max([0, d3.max(data, function (d) { return d[value] * 1.01 })])
    ]);
    yAxis.scale(yScale); // change the yScale
    d3.select('.y.axis') // redraw the yAxis
      .transition().duration(1000)
      .call(yAxis);
    d3.select('.ylabel') // change the yAxisLabel
      .text(value);
    d3.selectAll('circle') // move the circles
      .transition().duration(1000)
      .attr("transform", function(d) { return "translate(" + xScale(d[xName]) + "," + yScale(d[value]) + ")" });
        // .attr('cy',function (d) { return yScale(d[value]) })
  }

  function xChange() {
    var value = this.value; // get the new x value
    xName = this.value;
// change the xScale
     xScale.domain([
        d3.min([0, d3.min(data, function (d) { return d[value]*1.01 })]),
        d3.max([0, d3.max(data, function (d) { return d[value]*1.01 })])
     ]);
    xAxis.scale(xScale); // change the xScale
    d3.select('.x.axis') // redraw the xAxis
      .transition().duration(1000)
      .call(xAxis);
    d3.select('.xlabel') // change the xAxisLabel
      .transition().duration(1000)
      .text(value);

    d3.selectAll('circle') // move the circles
      .transition().duration(1000)
      .attr("transform", function(d) { return "translate(" + xScale(d[value]) + "," + yScale(d[yName]) + ")" });
      // .attr('cx', function (d) { return xScale(d[value]) });
  }

});
