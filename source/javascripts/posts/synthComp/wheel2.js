var height = rBlue*radius*2 - 5,
    numBeatsM = 7;

//beat number to angle
var rotationScale = d3.scale.linear()
    .domain([0, numBeatsM - 1])
    .range([360/numBeatsM, 360]);

//pitch index to distance from center of circle
var heightScale = d3.scale.linear()
    .domain([0, pitches.length])
    .range([25, height/2 - 1]);

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

//create a g element for each beat
//rotated so we only have to worry about circular math 
var beatsM = d3.select('.blue .gearG').selectAll('g')
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
