var width = 750,
    height = 750,
    numBeatsM = 9;

//beat number to angle
var rotationScale = d3.scale.linear()
    .domain([0, numBeatsM - 1])
    .range([360/numBeatsM, 360]);

//pitch index to distance from center of circle
var heightScale = d3.scale.linear()
    .domain([0, pitches.length])
    .range([100, height/2 - 1]);

//member of pitchs to arc path
var arc = d3.svg.arc()
    .innerRadius(function(d, i){ return heightScale(i); })
    .outerRadius(function(d, i){ return heightScale(i + 1) - 0; })
    .startAngle(0)
    .endAngle(2*Math.PI/numBeatsM)

//waveform number to color
var color = d3.scale.ordinal()
    .domain(d3.range(4))
    .range(['white', 'black']);

//translate (0, 0) to center of svg to make circle math easier
var svgM = d3.select('#synth2')
    .attr('height', height)
    .attr('width', width)
  .append('g')
    .attr('transform', 'translate(' + [width/2, height/2] +')')
  .append('g')
    .attr('transform', 'rotate(-180)')

//create a g element for each beat
//rotated so we only have to worry about circular math 
var beatsM = svgM.selectAll('g')
    .data(d3.range(numBeatsM)).enter()
  .append('g')
    .attr('transform', function(d){ return 'rotate(' + rotationScale(d) + ')'; })

//add array of notes to each beat
var notesM = beatsM.selectAll('path')
    .data(function(){ return pitches.map(function(d, i){
      return {pitch: d, on: false, i: i}; }); 
    }).enter()
  .append('path')
    .attr('d', arc)
    .call(styleNotes);




var ratioM = 7;

notesM.each(function(d){
  if (Math.random() > .7){
    d3.select(this).on('click').call(this, d);
  }
})