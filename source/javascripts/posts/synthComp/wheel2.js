var height = rBlue*radius*2 - 5;

//beat number to angle
var rotationScale = d3.scale.linear()
    .domain([0, numBeatsB - 1])
    .range([360/numBeatsB, 360]);

//pitch index to distance from center of circle
var heightScale = d3.scale.linear()
    .domain([0, pitches.length])
    .range([25, height/2 - 1]);

//member of pitchs to arc path
var arc = d3.svg.arc()
    .innerRadius(function(d, i){ return heightScale(i); })
    .outerRadius(function(d, i){ return heightScale(i + 1) - 0; })
    .startAngle(0)
    .endAngle(2*Math.PI/numBeatsB)

//waveform number to color
var color = d3.scale.ordinal()
    .domain(d3.range(4))
    .range(['white', 'black']);

//create a g element for each beat
//rotated so we only have to worry about circular math 
var beatsB = d3.select('.blue .gearG').selectAll('g')
    .data(d3.range(numBeatsB)).enter()
  .append('g')
    .attr('transform', function(d){ return 'rotate(' + rotationScale(d) + ')'; })

//add array of notes to each beat
beatsB.selectAll('path')
    .data(function(){ return pitches.map(function(d, i){
      return {pitch: d, on: false, i: i}; }); 
    }).enter()
  .append('path')
    .attr('d', arc)
    .call(styleNotes);
