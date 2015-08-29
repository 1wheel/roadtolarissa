var curSong = songs[0]
var curLine = null
var curTime = 0
var curStartT = 0
var height  = 500

var player = d3.select('#player')

var lineContainer = player.append('div#lineContainer')

var lineEls = lineContainer.dataAppend(curSong.lines, 'div.line')
    .text(ƒ('text'))
    .each(function(d){ d.sel = d3.select(this) })


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
      // 'onError': onPlayerError
    }
  });
}


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