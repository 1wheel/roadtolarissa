var width = 750,
    height = 750,
    numBeats = 8,
    pitches = [130.81, 146.83, 164.81, 174.61, 196.00, 220.00, 246.94, 261.63, 146.83*2, 164.81*2, 174.61*2, 196.00*2, 220.00*2, 246.94*2, 261.63*2].reverse();
    pitches = pitches.filter(function(d, i){ return i % 2; });

//beat number to angle
var rotationScale = d3.scale.linear()
    .domain([0, numBeats - 1])
    .range([360/numBeats, 360]);

//pitch index to distance from center of circle
var heightScale = d3.scale.linear()
    .domain([0, pitches.length])
    .range([100, height/2 - 1]);

//member of pitchs to arc path
var arc = d3.svg.arc()
    .innerRadius(function(d, i){ return heightScale(i); })
    .outerRadius(function(d, i){ return heightScale(i + 1) - 0; })
    .startAngle(0)
    .endAngle(2*Math.PI/numBeats)

//waveform number to color
var color = d3.scale.ordinal()
    .domain(d3.range(4))
    .range(['white', 'black']);

//translate (0, 0) to center of svg to make circle math easier
var svg = d3.select('#synth')
    .attr('height', height)
    .attr('width', width)
  .append('g')
    .attr('transform', 'translate(' + [width/2, height/2] +')')
  .append('g')
    .attr('transform', 'rotate(-180)')


//create a g element for each beat
//rotated so we only have to worry about circular math 
var beats = svg.selectAll('g')
    .data(d3.range(numBeats)).enter()
  .append('g')
    .attr('transform', function(d){ return 'rotate(' + rotationScale(d) + ')'; })

//add array of notes to each beat
var notes = beats.selectAll('path')
    .data(function(){ return pitches.map(function(d, i){
      return {pitch: d, on: false, i: i}; }); 
    }).enter()
  .append('path')
    .call(styleNotes);

function colorNote(selection){ selection.style('fill', compose(color, f('on'))); }

function styleNotes(selection){
  selection
    .attr('d', arc)
    .on('click', function(d){
      d.on = +!d.on;
      d3.select(this)
        .transition().duration(0)
          .call(colorNote)

      updateURL();
    })
    .on('mousemove', function(d){
      d3.select(this)
        .transition().duration(0)
          .style('fill', d.on ? 'darkgrey' : 'lightgrey');
    })
    .on('mouseout', function(d){
      d3.select(this)
        .transition().duration(0)
          .call(colorNote);
    })
    .style('stroke-width', 1.4)
    .style('stroke', 'lightgrey')
    .style('fill', 'white')
    .classed('note', true)
}


function updateURL(){

}

function readURL(){

}