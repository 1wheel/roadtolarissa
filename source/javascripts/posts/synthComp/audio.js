var ac = this.AudioContext ? new AudioContext() : new webkitAudioContext();
ac.createGain();
var nextBeat = 0;
var totalBeats =  0;
var nextBeatM = 0;
var nextBeatTime = ac.currentTime;
setInterval(function(){
  //ac time is more accurate than setInterval, look ahead 100 ms to schedule notes
  while (nextBeatTime < ac.currentTime + .1){  
    //on every nth beat, spin the larger circle and apply notes  
    if (!(totalBeats % ratioM)){
      //spin larger wheel
      svgM
        .transition().duration(getBPM()*9*1000).ease('linear')
          .attr('transform', 'rotate(' + -(-nextBeatM/numBeatsM*360) + ')');

      //extract update information
      var updateArray = pitches.map(function(d){ return false; });
      beatsM.filter(function(d, i){ return i === nextBeatM; })
        .selectAll('path')
          .each(function(d, i){
            updateArray[i] = d.on;
            //TODO flash color
            d3.select(this)
                .style('fill', d.on ? 'blue' : 'white')
              .transition().duration(3000)
                .call(colorNote);
          });

      //apply updates to slow circle
      console.log(totalBeats % numBeats, ((totalBeats % numBeats) + Math.ceil(numBeats/2)) % numBeats)
      beats.filter(function(d, i){ return i == (Math.ceil(numBeats/2) + totalBeats) % numBeats; })
        .selectAll('path')
          .each(function(d, i){
            if (updateArray[i]){
              d.on = +!d.on;
              d3.select(this)
                  .style('fill', d.on ? 'green' : 'red')
                .transition().duration(2000)
                  .call(colorNote);
            }
          })


      nextBeatM = (nextBeatM + 1) % numBeatsM;
    }



    //grab the active beat column 
    beats.filter(function(d, i){ return i == totalBeats % numBeats; })
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
        });

    svg
      .transition().duration(getBPM()*1000).ease('linear')
        .attr('transform', 'rotate(' + (-totalBeats%numBeats/numBeats*360 - 180) + ')');


    //update time and index of nextBeat 
    nextBeatTime += getBPM();
    nextBeat = (nextBeat + 1) % numBeats; 
    totalBeats++;
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