---
layout: post
title: "Even Fewer Lambdas In D3"
comments: true
categories: 
---
Writing D3 typically involves writing lots of anonymous functions. The [scatter plot](http://bl.ocks.org/mbostock/3887118) example illustrates two typical use cases: scales and attributes.  

####Scale computations 

```javascript 
var x = d3.scale.linear()
    .range([0, width])
    .domain(d3.extent(data.map(function(d){ return d.sepalWidth; })))

var y = d3.scale.linear()
    .range([height, 0])
    .domain(d3.extent(data.map(function(d){ return d.sepalLength; })))
```

`data` is an array of objects, each with a `sepalWidth` and a `sepalLength` property. `data.map` is a function [built into](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) every Javascript array. It takes a function (in this case, `function(d){ return d.sepalWidth; }`), calls it on each element of the original array, and returns a new array containing the returned values. 

Since `sepalWidth` is always a number, `map` returns an array of numbers. This array is immediately passed to `d3.extent`, which returns the min and max sepalWidth and is used to set the domain of the `x` scale.

####Data driven attributes  

```javascript 
svg.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("cx", function(d) { return x(d.sepalWidth); })
      .attr("cy", function(d) { return y(d.sepalLength); })
      .style("fill", function(d) { return color(d.species); })
```

`.attr("cx", function(d) { return x(d.sepalWidth); })` iterates over every element in the current selection, calling the anonymous function on the data bound to the element (here, a member of the data array), and setting the element's "cx" property equal to the return value of the function. By also setting the "cy" property of each circle to be proportional to `sepalLenght`, a scatter plot showing `sepalWidth` v. `sepalLength` is created. 

This process is at the core of D3. Elements of a data array are associated with elements on the page, functions transform each data point, and the results alter the appearance of the elements on the page.

In addition to attributes, text and interaction can also be controlled with functions operating on data:

```javascript 
var legend = svg.selectAll(".legend")
      .data(color.domain())
    .enter().append("div")
      .text(function(d) { return d; })
      .on('click', function(d){ alert(d + ' Clicked!'); })
```



