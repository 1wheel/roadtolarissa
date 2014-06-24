---
layout: post
title: "Even Fewer Lambdas In D3"
comments: true
categories: 
---
Writing D3 typically involves writing lots of anonymous functions. The [scatter plot](http://bl.ocks.org/mbostock/3887118) example illustrates typical use cases:

####Scale computations 

```javascript 
    var x = d3.scale.linear()
        .range([0, width])
        .domain(d3.extent(data.map(function(d){ return d.sepalWidth; })));

    var y = d3.scale.linear()
        .range([height, 0])
        .domain(d3.extent(data.map(function(d){ return d.sepalLength; })));
```
`data` is an array of objects, each with a `sepalWidth` and a `sepalLength` property. `data.map` is a function [built into](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) every Javascript array. It takes a function (in this case, `function(d){ return d.sepalWidth; }`), calls it on each element of the original array, and returns a new array containing the returned values. 

Since `sepalWidth` is always a number, we get 

- basdfas beepsdfsdf;lskdfj





