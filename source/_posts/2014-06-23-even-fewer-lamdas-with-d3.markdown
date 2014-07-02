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

`data` is an array of objects, each with a `sepalWidth` and a `sepalLength` property. `data.map` is a function [built into](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) every javascript array. It takes a function (in this case, `function(d){ return d.sepalWidth; }`), calls it on each element of the original array, and returns a new array containing the returned values. 

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
      .data(['flowerName1', 'flowerName2', 'flowerName3'])
    .enter().append("div")
      .text(function(d) { return d; })
      .on('click', function(d){ alert(d + ' Clicked!'); })
```
Instead of binding an element of the data array to a circle, we attach names of different types of flowers to a text element. Just like `.attr`, `.text(function(d){ return d; })` calls the anonymous function on each element of the selection and uses the return value to update the element. Instead of changing an arbitrary attribute, `.text` (as the name suggests) sets the text. Since the bound data is an array of strings and we're only trying to print each of them out, our function just returns what is was passed. 

####Generalizations

Needing a function that returns what it is passed turns out to be surprisingly common. We can skip a bit of typing by saving a reference to the identify function: 
```javascript
var idFn = function(d){ return d; };
```
and instead of typing out all the syntactical noise of `functionn`, `return`, `(` and `:`  every time we need it, we can say exactly what we mean everything time an identity function is used:
```javascript
    .enter().append("div")
        .text(idFn)
```

Admittedly, this isn't a huge improvement. We could try extend this idea by creating more named functions to access field properties:

```javascript 
var getSepalWidth = function(d){ return d.sepalWidth; }
var getSepalLength = function(d){ return d.sepalLength; }

var datum = {sepalWidth: 10, sepalWidth: 34};
console.log(getSepalWidth(datum));    //10
console.log(getSepalLength(datum));   //34

x.domain(d3.extent(data.map(getSepalWidth)));
x.domain(d3.extent(data.map(getSepalLength)));
```

This make the the meat of our code more consise, but requires repetitive boilerplate code and mentally keep tracking of the names of each of the field accessors. If we need to access another field, we have to create another accessor function first. Instead of manually making each accessor function, we can create a function that creates accessor functions:
```javascript
var ƒ = function(field){
	return function(object){ 
		return object[field]
	}
}

console.log(ƒ('sepalWidth')(datum));    //10
console.log(ƒ('sepalLength')(datum));   //34
```
Calling `ƒ('fieldName')` returns a function that takes an object and returns its `fieldName` property. A single expressive (if slightly more complicated) idea replaces many repetitive ones.  Pz suggests using ƒ for this function since it is short and easy to tip - option-f. I like that it evokes its purpose 'ƒield accessor' without being verbose. 

For the most common pattern of anonymous functions though, getting a property from an object and transforming it with a scale function `.attr("cx", function(d) { return x(d.sepalWidth); })`, we're still stuck typing out of the entirely of the function syntax. We can tell the computer how to automatically combine the accessor and scale functions instead manually spelling it:
```javascript
var compose = function(g, h){
	return function(d){
		return g(h(d))
	}
}

var addOne = function(d){ return d + 1 }
var timesFive = function(d){ return d*10 }
var divideByTwo = function(d){ return d/2 }

compose(addOne, timesFive)(2)		//(2*5) + 1 = 11
compose(addOne, timesFive)(10)	//(10*5) + 1 = 51
compose(timesFive, addOne)(10)	//(10 + 1)*5 =  55
compose(divideByTwo, addOne)(14)	//(14 + 1)*5 =  7.5
```

`compose` takes two functions and returns function representing the composition of those functions. Using compose in conjecture ƒ allows us to eliminate almost all of the noise of inline lambda's from our d3 code:

```javascript
    .enter().append("circle")
      .attr("cx", compose(x, ƒ('sepalWidth'))
      .attr("cy", compose(y, ƒ('sepalLength'))

```

####More modifications
Since we're making our helpful functions, we can modify them to make the more useful. `ƒ`, for example, can replace `idFn` if we add a check for an `undefined` argument:

```javascript
function ƒ(field){
    return function(object){ 
        return typeof(field) === 'undefined' ? object : object[field];
    }
}

datum === ƒ()(datum) //true
```
I've tried having `ƒ` accept arrays to access nested properties (not convinced that its that useful since it `ƒ(['prop1', 'prop2', 'prop3'])` is equivlent to `compose(ƒ('prop1'), ƒ('prop2'), ƒ('prop3'))`. Another variation: a 'safe' version of ƒ that doesn't throw an error when the returned function isn't.

The [annotated source](http://underscorejs.org/docs/underscore.html) of underscore shows how `compose` can be extend to take any number of functions. 


####Further reading
These helpers for d3 and d3 itself makes heavy use of function's first class status in d3. Some referencing:

[Javascript Allongé](https://leanpub.com/javascript-allonge/read)
[Hey Underscore, You're Doing It Wrong!](https://www.youtube.com/watch?v=m3svKOdZijA)
[Functional Javascript](http://blog.fogus.me/2013/05/29/fun-js-pt-1-functional-javascript/)
[Underscore equivalents in native js and d3]
(https://gist.github.com/mbostock/3934356)
