var width = 900,
    height = 560,
    radius = 21,
    rRed = 9;
    rBlue = 7;
    rYellow = 8;
    x = Math.sin(2 * Math.PI / 3),
    y = Math.cos(2 * Math.PI / 3),
    speed = .03,
    start = Date.now();

var ratioM = rRed;

(function(){

  //largely borrowed from http://bl.ocks.org/mbostock/1353700
  var svg = d3.select("#synth").append("svg")
      .attr("width", width)
      .attr("height", height)
    .append("g")
      .attr("transform", "translate(" + (width / 2 + radius*5) + "," + (height / 2 + 80) + ")")
    .append("g");

  svg.append("g")
      .attr("class", "red")
      .attr("transform", "translate(" + (radius*0) + ",0) rotate(" + 16 + ")")
      .datum({teeth: 11*rRed, radius: radius*rRed, direction: 1})
    .append('g')
      .classed('gearG', true)
    .append("path")
      .attr("d", gear);

  svg.append("g")
      .attr("class", "red")
      .attr("transform", "translate(" + (radius*0) + ",0) rotate(" + 16 + ")")
      .datum({teeth: 11, radius: radius, direction: 1})
    .append('g')
      .classed('gearG', true)
    .append("path")
      .attr("d", gear);


  svg.append("g")
      .attr("class", "blue")
      .attr("transform", "translate(" + (0) + "," + -(radius*(1.58 + rBlue)) + ") rotate(" + 180/rBlue + ")")
      .datum({teeth: 11*rBlue, radius: radius*rBlue, direction: -1/rBlue})
    .append('g')
      .classed('gearG', true)
    .append("path")
      .attr("d", gear);

  svg.append("g")
      .attr("class", "yellow")
      .attr("transform", "translate(" + -(radius*(rRed + rYellow +.58)) + ",0) rotate(" + 180/rYellow + ")")
      .datum({teeth: 11*rYellow, radius: radius*rYellow, direction: -rRed/rYellow})
    .append('g')
      .classed('gearG', true)
    .append("path")
      .attr("d", gear);


function gear(d) {
  var n = d.teeth,
      r0 = Math.abs(d.radius) + radius/2,
      r2 = r0 - radius/2,
      r3 = Math.max(8, d.radius/9),
      da = Math.PI / n,
      a0 = -Math.PI / 2,
      i = -1,
      path = ["M", r0 * Math.cos(a0), ",", r0 * Math.sin(a0)];
  while (++i < n){
    path.push("L", r0 * Math.cos(a0), ",", r0 * Math.sin(a0))
    a0 += da;
    path.push("L", r2 * Math.cos(a0), ",", r2 * Math.sin(a0))
    a0 += da;
  } 
  path.push("L", r0 * Math.cos(a0), ",", r0 * Math.sin(a0))

  path.push("M0,", -r3, "A", r3, ",", r3, " 0 0,0 0,", r3, "A", r3, ",", r3, " 0 0,0 0,", -r3, "Z");
  return path.join("");
}
})();