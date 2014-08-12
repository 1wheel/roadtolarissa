var ac = this.AudioContext ? new AudioContext() : new webkitAudioContext();
ac.createGain();
var totalBeats =  0;
var beatFraction = 0;
var lastAcTime = ac.currentTime;

loadState();

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

      beatsB.filter(function(d, i){ return i === (4 + totalBeats/offset) % numBeatsB; })
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
                  .style('fill', d.on ? '#FF69C8' : '#4A84CF')
                  .style('fill-opacity', 1)
                .transition().duration(1000).delay(250)
                  .call(colorNote);
            }
            else if (!d.on){
              d3.select(this)
                  .style('fill', '#AEE0FF')
                  .style('fill-opacity', 1)
                .transition().duration(2000)
                  .call(colorNote);

            }
          })
    }

    //grab the active beat column 
    var duration = getDuration();
    beats.filter(function(d, i){ return i == (totalBeats + 5) % numBeats; })
      .selectAll('path')
        .each(function(d){
          //if the note is selected, play pitch at scheduled nextBeat
          if (d.on){
            var nextBeatTime = ac.currentTime + (1 - beatFraction)*beatDuration;
            playNote(d.pitch, nextBeatTime, duration)
          }

          //highlight and unhighlight selected column
          //visually exact timing doesn't matter as much
          //easier to hear something off by a few ms
          var selection = d3.select(this);
          selection
                .style('fill', 'FDE24E')
                .style('fill-opacity', d.on ? .5 : 1)
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
  d3.selectAll('.note').each(function(d, i){
    if (Math.random() > (i < 9*7 ? .75 : .99)){
      d3.select(this).on('click').call(this, d);
    }
  });
}

d3.select('#buttons').selectAll('.button')
    .data(
      [ 
        {text: 'Pause',  fun: togglePause},
        {text: 'Clear',       fun: clear},
        {text: 'Randomize',   fun: randomize}]).enter()
    .append('span')
      .text(f('text'))
      .on('click', function(d){ d.fun(); });


//set url to reflect state on note change or beat
var updateURL = _.throttle(function(){
  window.location.hash = totalBeats + '+' +encode(d3.selectAll('.note').data().map(function(d){
    return d.on ? '1' : '0'; }).join(''));
}, 1000);

//set state to url on load
function loadState(){
  var hash = window.location.hash.replace('#', '').split('+');
  if (hash){
    totalBeats = isNaN(hash[0]) ? 0 : +(hash[0])
    if (hash.length == 2){ 
      var loadedNotes = decode(hash[1]).split('');
      d3.selectAll('.note')
          .each(function(d, i){ d.on = loadedNotes[i] === "1" ? true : false; })
          .call(colorNote);  
    } else{ randomize(); }
  } else{ randomize(); }
}



function playNote(pitch, start, duration){
  oscillator = ac.createOscillator(),
  oscillator.type = 1;
  oscillator.frequency.value = pitch*getPitch();
  
  gainNode = ac.createGain();
  gainNode.connect(ac.destination);
  gainNode.gain.value = 0;
  gainNode.gain.setTargetAtTime(.08/Math.max(0.1, duration), start + duration*1/4, duration/10)
  gainNode.gain.setTargetAtTime(.001, start + duration*3/4, duration/10)

  oscillator.connect(gainNode);  
  oscillator.start(start);
  oscillator.stop(start + duration);
};