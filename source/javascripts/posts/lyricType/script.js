var curSong = songs[0]
var curLine = null
var curTime = 0
var curStartT = 0
var height  = 500


curSong.lines.forEach(function(d){
  d.chars = d.text.split('').map(function(c){
    return {
      line: d,
      c: c
    }
  })
})

//set up DOM 
var player = d3.select('#player')

var lineContainer = player.append('div#lineContainer')

var lineEls = lineContainer.dataAppend(curSong.lines, 'div.line')
    .each(function(d){ d.sel = d3.select(this) })
lineEls.append('div.frontline').text(ƒ('text'))
lineEls.append('div.backline')
    .each(function(d){ d.backSel = d3.select(this) })

//embed youtube video
var ytContainer = player.append('div#ytContainer')
var isPlaying = false

function onYouTubeIframeAPIReady() {
  player = new YT.Player('ytContainer', {
    width: 750,
    height: 500,
    videoId: curSong.id,
    events: {
      onReady: function(e){ e.target.playVideo() },
      onStateChange: function(e){ isPlaying = e.data == 1},
    }
  })
}


//animate lyrics
d3.timer(function(t){
  if (!isPlaying || !curSong) return

  curTime = player.getCurrentTime()

  var activeLine = null
  curSong.lines.forEach(function(d){
    d.isActive = d.start <= curTime && curTime <= d.start + d.dur
    if (d.isActive) activeLine = d
  })

  if (activeLine != curLine){
    lineEls.style('opacity', function(d){ return d.isActive ? 1 : 0 })
    curLine = activeLine
    curStartT = t
  }

  if (curLine){
    var offset = (t - curStartT)/curLine.dur*(height - 50)/1000
    // console.log(offset)
    curLine.sel.style('transform', 'translateY(' +  offset + 'px)')  
  }
})



//listen for keypresses

d3.select(window).on('keypress', function(){
  if (!isPlaying || !curSong || !curLine) return


  //redo with slice?
  var nextChar = curLine.chars.filter(function(d){ return !d.typed })[0]
  if (!nextChar) return

  var k = String.fromCharCode(d3.event.charCode)
  
  if (nextChar.c == k){
    nextChar.typed = true
    curLine.backSel.text(curLine.chars.filter(ƒ('typed')).map(ƒ('c')).join(''))
    //todo - graph animation
  }

  d3.event.preventDefault()
})



// $(window).bind('keypress', function(e) {
//   saveKey = e;
//     var code = (e.keyCode ? e.keyCode : e.which);
//   if((CurrentLyrics && CurrentLyrics.lyricsReady) && player.playing){
//     CurrentLyrics.compareToNext(String.fromCharCode(e.charCode));
//   }
// });

