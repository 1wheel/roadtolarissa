var ac = this.AudioContext ? new AudioContext() : new webkitAudioContext();
ac.createGain();
var nextBeat = 0;
var totalBeats =  0;
var nextBeatM = 0;
var nextBeatTime = ac.currentTime;
setInterval(function(){
  //ac time is more accurate than setInterval, look ahead 100 ms to schedule notes
  while (nextBeatTime < ac.currentTime + .1  && !isPaused){  
    //on every nth beat, spin the larger circle and apply notes  
    if (!(totalBeats % ratioM)){
      //spin larger wheel
      svgM
        .transition().duration(getBPM()*ratioM*1000).ease('linear')
          .attr('transform', 'rotate(' + (-(.5 + nextBeatM)/numBeatsM*360 - 90) + ')');

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


      nextBeatM = (((nextBeatM - 1) % numBeatsM) + numBeatsM) % numBeatsM;
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
          var selection = d3.select(this).style('opacity', 1)
              .transition().duration(getBPM()*1000*2)
                //.style('opacity', '.7')
                .call(colorNote);
          //use timeout instead of transition so mouseovers transitions don't cancel)
          // setTimeout(function(){
          //   selection
          //       //.style('opacity', '.7')
          //       .call(colorNote)
          // }, getBPM()*1000)
        });

    svg
      .transition().duration(getBPM()*1000).ease('linear')
        .attr('transform', 'rotate(' + (-totalBeats%numBeats/numBeats*360 - 180) + ')');


    //update time and index of nextBeat 
    nextBeatTime += getBPM();
    nextBeat = (nextBeat + 1) % numBeats; 
    totalBeats++;
  }
}, 25);


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
  gainNode.gain.value = .1;
  return {osc: oscillator, gain: gainNode};
};


var isPaused = false;
var pauseStart = 0;
var totalPause = 0;
function togglePause(){
  isPaused = !isPaused;
  if (isPaused){
    pauseStart = ac.currentTime;
  } else {
    totalPause += ac.currentTime - pauseStart;
    nextBeatTime += ac.currentTime - pauseStart;
  }

}

function clear(){
  d3.selectAll('.note').each(function(d){
    if (d.on){
      d3.select(this).on('click').call(this, d);
    }
  });
}

function randomize(){
  clear();
  d3.selectAll('.note').each(function(d){
    if (Math.random() > .93){
      d3.select(this).on('click').call(this, d);
    }
  });
}


d3.select('#buttons').selectAll('.button')
    .data(
      [ {text: 'Play/Pause',  fun: togglePause},
        {text: 'Clear',       fun: clear},
        {text: 'Randomize',   fun: randomize}]).enter()
    .append('span')
      .text(f('text'))
      .on('click', function(d){ d.fun(); });

randomize();


function toURL(){
  return d3.selectAll('.note').data().map(function(d){
    return d.on ? '1' : '0'; }).join('');
}