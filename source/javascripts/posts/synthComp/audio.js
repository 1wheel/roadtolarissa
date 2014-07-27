var ac = this.AudioContext ? new AudioContext() : new webkitAudioContext();
ac.createGain();
var totalBeats =  0;
var beatFraction = 0;

var lastAcTime = ac.currentTime;
d3.timer(function(){
  var beatDuration = (1/Hz())/numBeats;
  if (!isPaused){
    beatFraction += (ac.currentTime - lastAcTime)/beatDuration;
  }
  lastAcTime = ac.currentTime;
  var lastAngle = 360/numBeats*(totalBeats + beatFraction);

  d3.selectAll(".gearG").attr("transform", function(d){
    return "rotate(" + lastAngle  * d.direction + ")"; });

  //ac time is more accurate than setInterval, look ahead 100 ms to schedule notes
  while (beatFraction > .9 && !isPaused){  
    
    //on every nth beat apply notes  
    if (!(totalBeats % offset)){

      //extract update information
      var updateArray = pitches.map(function(d){ return false; });

      beatsB.filter(function(d, i){ return i === (5 + totalBeats/offset) % numBeatsB; })
        .selectAll('path')
          .each(function(d, i){
            updateArray[i] = d.on;
            //TODO flash color
            d3.select(this)
                .style('fill', d.on ? '#4A84CF' : '#AEE0FF')
                .style('fill-opacity', 1)
              .transition().duration(2000)
                .call(colorNote);
          });

      //apply updates to fast circle
      beats.filter(function(d, i){ return i == (9 + (-totalBeats/7) % 8) % 8; })
        .selectAll('path')
          .each(function(d, i){
            if (updateArray[i]){
              d.on = +!d.on;
              d3.select(this)
                  .style('fill', d.on ? '#6AC342' : '#CE3101')
                  .style('fill-opacity', 1)
                .transition().duration(1000).delay(250)
                  .call(colorNote);
            }
          })
    }

    //grab the active beat column 
    beats.filter(function(d, i){ return i == (totalBeats + 5) % numBeats; })
      .selectAll('path')
        .each(function(d){
          //if the note is selected, play pitch at scheduled nextBeat
          if (d.on){
            var o = osc(d.pitch, d.on);
            var nextBeatTime = ac.currentTime + (1 - beatFraction)*beatDuration;
            o.osc.start(nextBeatTime);
            o.osc.stop(nextBeatTime + getDuration())
          }

          //highlight and unhighlight selected column
          //visually exact timing doesn't matter as much
          //easier to hear something off by a few ms
          var selection = d3.select(this);
          selection
                .style('fill', 'black')
                .style('fill-opacity', '.7')
              .transition().duration(beatDuration*1000*2)
                .call(colorNote);
        });

    totalBeats++;
    beatFraction--;
    updateURL();
  }
});


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

function getDuration(){
  var scale = d3.scale.log().base(2).domain([.05, 1]);
  return scale.invert((d3.select('#Duration').node().valueAsNumber));
}

//Hz is call several times each frame; cache DOM look up
var Hz = (function(){
  var scale = d3.scale.log().base(2).domain([.01, 5]);
  var value;
  function setValue(){
    value = scale.invert(this.valueAsNumber);
  }
  d3.select('#BPM').on('change', setValue);
  setValue.call(d3.select('#BPM').node());

  return function(){ return value; }
})();




var isPaused = false;
function togglePause(){ isPaused = !isPaused; }

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
    if (Math.random() > .3){
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


//set url to reflect state on note change or beat
function updateURL(){
  window.location.hash = totalBeats + '+' +encode(d3.selectAll('.note').data().map(function(d){
    return d.on ? '1' : '0'; }).join(''));
  console.log('updating' + window.location.hash);
}

//set state to url on load
var hash = window.location.hash.split('+');
if (hash){
  totalBeats = isNaN(hash[0]) ? 0 : +(hash[0])
  if (hash.length == 2){ 
    var loadedNotes = decode(window.location.hash[1]).split('');
    d3.selectAll('.note').each(function(d, i){
      d.on === !!loadedNotes[i];
    });  
  }
}



//generate oscillator
function osc(pitch, waveform){
  oscillator = ac.createOscillator(),
  oscillator.type = 1;
  oscillator.frequency.value = pitch*getPitch();
  gainNode = ac.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(ac.destination);
  gainNode.gain.value = .04;
  return {osc: oscillator, gain: gainNode};
};
