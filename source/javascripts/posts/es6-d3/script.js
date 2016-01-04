'use strict'

var x = 10
var x = 20
console.log(x)


let z = 30
console.log(z)
try{
	let y = 50
} catch (e){
	console.log(e)
}


// for (var i=0; i<3; i++){
// 	setTimeout(function(){ console.log(i, 'var loop') }, 10)
// }

// for (let i=0; i<3; i++){
// 	setTimeout(function(){ console.log(i, 'let loop') }, 10)
// }

// let RegExp = 7
// let window = 8




console.log('blah balzz'.includes('z'))
//also startswith, endswith

var d = {district: 10, d2014: .2, r2014: .7, d2012: .4, r2012: .6}

var tt = d3.select('.tooltip')
    .html('')

tt.append('div').text('District' + d.district)

var row1 = tt.append('div.tt-row')
row1.append('div.year').text('Year')
row1.append('div.rep').text('Rep.')
row1.append('div.dash').text('—')   
row1.append('div.dem').text('Dem.')

var row2 = tt.append('div.tt-row')
row2.append('div.year').text('2014')
row2.append('div.rep').text(d3.format('%')(d.r2014))
row2.append('div.dash').text('—')   
row2.append('div.dem').text(d3.format('%')(d.d2014))

var row3 = tt.append('div.tt-row')
row3.append('div.year').text('2012')
row3.append('div.rep').text(d3.format('%')(d.r2012))
row3.append('div.dash').text('—')   
row3.append('div.dem').text(d3.format('%')(d.d2012))


var ttHTML = `
<div class='.tt-top'>District ${d.district}</div>
<div class='.tt-row'>
	<div class='.year'>Year</div>
	<div class='.rep' >Rep.</div>
	<div class='.dash'>—</div>
	<div class='.dem' >Dem.</div>
</div>
<div class='.tt-row'>
	<div class='.year'>2012</div>
	<div class='.rep' >${d3.format('%')(d.r2012)}</div>
	<div class='.dash'>—</div>
	<div class='.dem' >${d3.format('%')(d.d2012)}</div>
</div>
<div class='.tt-row'>
	<div class='.year'>2014</div>
	<div class='.rep' >${d3.format('%')(d.r2014)}</div>
	<div class='.dash'>—</div>
	<div class='.dem' >${d3.format('%')(d.d2014)}</div>
</div>
`

tt = d3.select('.tooltip').html(`
	<div class='.tt-top'>District ${d.district}</div>
	<div class='.tt-row'>
		<div class='.year'>Year</div>
		<div class='.rep' >Rep.</div>
		<div class='.dash'>—</div>
		<div class='.dem' >Dem.</div>
	</div>
	<div class='.tt-row'>
		<div class='.year'>2012</div>
		<div class='.rep' >${d3.format('%')(d.r2012)}</div>
		<div class='.dash'>—</div>
		<div class='.dem' >${d3.format('%')(d.d2012)}</div>
	</div>
	<div class='.tt-row'>
		<div class='.year'>2014</div>
		<div class='.rep' >${d3.format('%')(d.r2014)}</div>
		<div class='.dash'>—</div>
		<div class='.dem' >${d3.format('%')(d.d2014)}</div>
	</div>
`)


//arrows

var flowers = d3.range(20).map(() => ({x: Math.random(), y: Math.random()}))
var x = d3.scale.linear().domain(d3.extent(flowers, (d) => d.x))
var y = d3.scale.linear()


d3.select('body').selectAll('.num')
		.data(d3.range(30)).enter()
	.append('span')
		.text((d) => d)
		.style('font-size', (d) => d + 'px')

d3.select('body').selectAll('.num')
		.data(flowers).enter()
	.append('circle')
		.attr('cx', (d) => x(d.sepalWidth))
		.attr('cx', (d) => y(d.sepalLength))
		.attr('cx', ({sepalLength}) => y(sepalLength))
		.attr('r',  (d, i) => i)

//no this
d3.select('body').on('mousemove', () => console.log(d3.mouse(this)))
d3.select('body').on('mousemove', function(){ console.log(d3.mouse(this)) })




//property init shorthand
var width = 960,
		height = 500

var svg = d3.select('body')
		.append('svg').attr({width, height})

//destructoring
var {q, b} = {q: 100, b: 100}
//mixed and nested


//sets and maps

//Not showing?

//default parameters

function add(a, b = 100, c = a){
	return a + b + c
}
console.log(add(10))
console.log(add(10, 20))
console.log(add(10, 20, 7))

//rest parameters
function multiply(...values){
	return values.reduce(function(p, v){ return p*v }, 1)
}
console.log(multiply(12, 123, 12333))


//spread 
console.log(Math.max.apply(Math, d3.range(20)))
console.log(Math.max(...d3.range(20)))


//symboles