var curSong = songs[0]
var curLine = null
var curTime = 0
var curStartT = 0
var isPlaying = false

var height = 500
var width  = 750 

var baseCharPerSec = 6
var lastCharPerSec = baseCharPerSec
var  minCharPerSec = 3

var red  = '#d2130a',
    blue = '#3b4274',
    grey = '#ccc'


curSong.lines.forEach(function(d, i){
  d.i = i

  var s = d3.scale.linear()
      .domain([0, d.text.length - 1])
      .range([d.start, d.start + d.dur])
  d.chars = d.text.split('').map(function(c, i){
    return {
      line: d,
      c: c,
      sTime: s(i),
      rTime: Math.round(s(i))/100
    }
  })
})

//set up DOM 
var player = d3.select('#player')

var lineContainer = player.append('div#lineContainer')

var lineEls = lineContainer.dataAppend(curSong.lines, 'div.line')
    .each(function(d){ d.sel = d3.select(this) })
lineEls.append('div.frontline').html(ƒ('text', toText))
lineEls.append('div.backline')
    .each(function(d){ d.backSel = d3.select(this) })

//embed youtube video
var ytContainer = player.append('div#ytContainer')

function onYouTubeIframeAPIReady() {
  player = new YT.Player('ytContainer', {
    width: width,
    height: height,
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

  //check if curLine is still active
  if (!(curLine && curLine.start <= curTime && curTime <= curLine.start + curLine.actualDur)) {

    var activeLine = null
    curSong.lines.forEach(function(d){
      d.isActive = d.start <= curTime && curTime <= d.start + d.dur
      if (d.isActive) activeLine = d
    })

    lineEls.style('opacity', function(d){ return d.isActive ? 1 : 0 })

    //calculate target speed
    if (curLine){
      var typed = curLine.chars.filter(ƒ('typed'))
      if (typed.length > 3){
        lastCharPerSec = 1/3*lastCharPerSec
                       + 2/3*typed.length/(_.last(typed).time - typed[0].time)   

        lastCharPerSec = Math.max(lastCharPerSec, minCharPerSec)
      }
    }

    console.log(lastCharPerSec)

    curLine = activeLine
    curStartT = t

    //calculate number of lines to skip
    curLine.actualDur = curLine.dur; i = curLine.i
    while (curLine.chars.length/curLine.actualDur > lastCharPerSec && i < curSong.lines.length - 1){
      curLine.actualDur += curSong.lines[++i].dur
    }

    curLine.chars.forEach(function(d){
      d.sel.transition()
          .attr({fill: red, r: 5})
        .transition().duration(500)
          .attr('r', 2)
    })

  }

  if (curLine){
    var offset = (t - curStartT)/curLine.actualDur*(height - 50*Math.ceil(curLine.text.length/30))/1000
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
    nextChar.time = curTime
    curLine.backSel.html(toText(curLine.chars.filter(ƒ('typed')).map(ƒ('c')).join('')))
    //todo - graph animation

    nextChar.sel.attr('fill', blue)
      .transition()
        .attr('r', 10)
      .transition().duration(1000)
        .attr('r', 3)
  }

  d3.event.preventDefault()
})





//graphs!
var chars = _.flatten(curSong.lines.map(ƒ('chars')))

var byTime = d3.nest().key(ƒ('rTime')).entries(chars)
byTime.forEach(function(sec){
  sec.values.forEach(function(d, i){ d.i = i })
})

var c = d3.conventions({
  parentSel: player.append('div'),
  width: width, 
  height: 300,
  margin: {left: 10, right: 10, top: 10, bottom: 10}
})

c.x.domain(d3.extent(byTime, ƒ('key')))
c.y.domain(d3.extent(chars,  ƒ('i')).reverse())

var secs = c.svg.dataAppend(byTime, 'g')
    .translate(function(d){ return [c.x(d.key), 0] })

secs.dataAppend(ƒ('values'), 'circle')
    .attr('r', 1)
    .attr('cy', ƒ('i', c.y))
    .attr('fill', grey)
    .each(function(d){ d.sel = d3.select(this) })



function toText(chars){
  var rv = ''
  chars.split('').forEach(function(c, i){
    if (i && !(i % 30)) rv += '<br>'
    rv += c
  })
  return rv
}