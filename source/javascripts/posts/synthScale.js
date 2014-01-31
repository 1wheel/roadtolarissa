//helper functions
var f = function(str){ return function(obj){ return str ? obj[str] : obj; }}
var compose = function(g, h){ return function(d){ return g(h(d)); }}

var width = 750,
    height = 750,
    numBeats = 16,
    pitches = [130.81, 146.83, 164.81, 174.61, 196.00, 220.00, 246.94, 261.63, 146.83*2, 164.81*2, 174.61*2, 196.00*2, 220.00*2, 246.94*2, 261.63*2].reverse();

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
    .range(['white', '#338AE5', '#FFB800', '#BA5FD6']);

//translate (0, 0) to center of svg to make circle math easier
var svg = d3.select('#synth')
    .attr('height', height)
    .attr('width', width)
  .append('g')
    .attr('transform', 'translate(' + [width/2, height/2] +')');

//create a g element for each beat
//rotated so we only have to worry about circular math 
var beats = svg.selectAll('g')
    .data(d3.range(numBeats)).enter()
  .append('g')
    .attr('transform', function(d){ return 'rotate(' + rotationScale(d) + ')'; })

//add array of notes to each beat
var notes = beats.selectAll('path')
    .data(function(){ return pitches.map(function(d, i){ return {pitch: d, lockon: 0}; }); }).enter()
  .append('path')
    .attr('d', arc)
    .on('click', function(d){
      d.lockon = (d.lockon + 1) % 4;
      d.on = d.lockon;
      d3.select(this)
          .call(colorNote)
          .style('stroke', 'black');
    })
    .on('mouseover', function(d){
      d.on = (d.lockon + 1) % 4;
      d3.select(this)
        .transition().duration(100)
          .style('fill', color(d.on));
    })
    .on('mouseout', function(d){
      d.on = d.lockon;
      d3.select(this)
        .transition().duration(1000)
          .call(colorNote);
    })
    .style('stroke-width', 1.4)
    .style('stroke', 'lightgrey')
    .style('fill', 'white')

function colorNote(selection){ selection.style('fill', compose(color, f('on'))); }

var ac = this.AudioContext ? new AudioContext() : new webkitAudioContext();
ac.createGain();
var nextBeat = 0;
var nextBeatTime = ac.currentTime;
setInterval(function(){
  //ac time is more accurate than setInterval, look ahead 100 ms to schedule notes
  while (nextBeatTime < ac.currentTime + .1){    
    //grab the active beat column 
    beats.filter(function(d, i){ return i == nextBeat; })
      .selectAll('path')
        .each(function(d){
          //if the note is selected, play pitch at scheduled nextBeat
          if (d.on){
            var o = osc(d.pitch, d.on);
            o.osc.start(nextBeatTime);
            o.osc.stop(nextBeatTime + getDuration())
          }
          //highlight and unhighlight selected column
          //visually exact timing doesn't matter as much
          //easier to hear something off by a few ms
          var selection = d3.select(this).style('stroke', 'grey')
          //use timeout instead of transition so mouseovers transitions don't cancel)
          setTimeout(function(){
            selection.style('stroke', 'lightgrey');
          }, getBPM()*1000)
        })

    //update time and index of nextBeat 
    nextBeatTime += getBPM();
    nextBeat = (nextBeat + 1) % numBeats; 
  }
}, 25)


//add sliders to the page
var sliders = d3.select('#synthSliders').selectAll('input')
    .data(['Pitch', 'BPM', 'Duration']).enter()
  .append('div')
    .style({display: 'inline-block', 'margin-left': '89.5px', 'text-align': 'center'})

sliders.append('p').text(f());

sliders.append('p').append('input')
    .attr({type: 'range', min: '0', max: '1', step: '0.0001', value: '.5'})
    .attr('id', f())
    .style('width', '127px');

//use inverse log scales for finer control over high and low values 
function getPitch(){
  var scale = d3.scale.log().base(2).domain([.1, 10]);
  return scale.invert((d3.select('#Pitch').node().valueAsNumber));
}
function getBPM(){
  var scale = d3.scale.log().base(2).domain([40, 1200]);
  var rv = 60/scale.invert((d3.select('#BPM').node().valueAsNumber));
  return rv;
}
function getDuration(){
  var scale = d3.scale.log().base(2).domain([.05, 1]);
  return scale.invert((d3.select('#Duration').node().valueAsNumber));
}

//generate oscillator
function osc(pitch, waveform){
  oscillator = ac.createOscillator(),
  oscillator.type = waveform;
  oscillator.frequency.value = pitch*getPitch();
  gainNode = ac.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(ac.destination);
  gainNode.gain.value = .2;
  return {osc: oscillator, gain: gainNode};
};