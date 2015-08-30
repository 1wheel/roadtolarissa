var curSong = curLine = isPlaying = curTime = curStartT = curT = null

var height = 500
var width  = 750 

var baseCharPerSec = 6
var lastCharPerSec = baseCharPerSec
var  minCharPerSec = 3

var player = d3.select('#player')

var red  = '#d2130a',
    blue = '#3b4274',
    grey = '#ccc'

function onYouTubeIframeAPIReady(){
  d3.select('#buttons').dataAppend(songs, 'img.button')
      .attr('src', function(d){
        return '/images/thumbnails/lyrics/' + d.slug + '.jpg' })
      .on('click', playSong)

  playSong(songs[2])
}



function playSong(song){
  //style buttons
  d3.selectAll('.button').classed('selected', function(d){ return d === song })

  isPlaying = false
  curSong = null

  //break lines into characters for graphing 
  song.lines.forEach(function(d, i){
    d.i = i

    var s = d3.scale.linear()
        .domain([0, d.text.length - 1])
        .range([d.start, d.start + d.dur])
    d.chars = d.text.split('').map(function(c, j){
      return {
        line: d,
        c: c,
        sTime: s(i),
        rTime: Math.round(s(i))/100,
        j: j
      }
    })
  })

  chars = _.flatten(song.lines.map(ƒ('chars')))

  //set up DOM 
  player.html('')

  var lineContainer = player.append('div#lineContainer')

  var lineEls = lineContainer.dataAppend(song.lines, 'div.line')
      .each(function(d){ d.sel = d3.select(this) })
  lineEls.append('div.frontline').html(ƒ('text', toText))
  lineEls.append('div.backline')
      .each(function(d){ d.backSel = d3.select(this) })

  //embed youtube video
  var ytContainer = player.append('div#ytContainer')
  playerYT = new YT.Player('ytContainer', {
    width: width,
    height: height,
    videoId: song.id,
    startSeconds: 40,
    endSeconds: 10,
    events: {
      onReady: function(e){
        e.target.playVideo()
        curSong = song
        drawGraph() 
      },
      onStateChange: function(e){ isPlaying = e.data == 1},
    }
  })
}


//animate lyrics
d3.timer(function(t){
  if (!isPlaying || !curSong) return

  curTime = playerYT.getCurrentTime()
  curT = t

  //check if curLine is still active
  if (!(curLine && curLine.start <= curTime && curTime <= curLine.start + curLine.actualDur)) {

    var activeLine = null
    curSong.lines.forEach(function(d){
      d.isActive = d.start <= curTime && curTime <= d.start + d.dur
      if (d.isActive) activeLine = d
    })

    d3.selectAll('div.line').style('opacity', function(d){ return d.isActive ? 1 : 0 })

    if (!activeLine) return 

    //calculate target speed
    if (curLine){
      var typed = curLine.chars.filter(ƒ('typed'))
      if (typed.length > 3){
        lastCharPerSec = 1/3*lastCharPerSec
                       + 2/3*typed.length/(_.last(typed).time - typed[0].time)   

        lastCharPerSec = Math.max(lastCharPerSec, minCharPerSec)
      }
    }

    curLine = activeLine
    curStartT = t

    //calculate number of lines to skip
    curLine.actualDur = curLine.dur; i = curLine.i
    while (curLine.chars.length/curLine.actualDur > lastCharPerSec && i < curSong.lines.length - 1){
      curLine.actualDur += curSong.lines[++i].dur
    }

    curLine.chars.forEach(function(d, i){
      d.sel.transition().delay(i*50)
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
  d3.event.preventDefault()

  if (!isPlaying || !curSong || !curLine) return

  //redo with slice?
  var nextChar = curLine.chars.filter(function(d){ return !d.typed })[0]
  if (!nextChar) return

  var k = String.fromCharCode(d3.event.charCode)
  
  if (nextChar.c == k){

    nextChar.typed = true
    nextChar.time = curTime
    nextChar.tTime = (curLine.start + (curT - curStartT)/1000)/100

    curLine.backSel.html(toText(curLine.chars.filter(ƒ('typed')).map(ƒ('c')).join('')))

    typedChars = chars.filter(ƒ('typed'))
    if (typedChars.length - 1){
      nextChar.tDif =  nextChar.tTime - typedChars[typedChars.length - 2].tTime
      console.log(nextChar.tDif)
      nextChar.tDif =  Math.max(nextChar.tDif, .00001)
      nextChar.cps = 1/nextChar.tDif
      console.log(nextChar.tDif, nextChar.cps)
      updateLine()
    }


    nextChar.sel.attr('fill', blue)
      .transition()
        .attr('r', 15)
        .style('stroke', 'white')
      .transition().duration(1000)
        .attr('r', 3)
  }
})


var c, chars
function drawGraph(){
  

  var byTime = d3.nest().key(ƒ('rTime')).entries(chars)
  byTime.forEach(function(sec){
    sec.values.forEach(function(d, i){ d.i = i })
  })

  c = d3.conventions({
    parentSel: player.append('div#graphCont'),
    width: width, 
    height: 300,
    margin: {left: 10, right: 10, top: 10, bottom: 10}
  })

  c.path = c.svg.append('path')
      .style({stroke: 'black', fill: 'none', 'stroke-width': .5})

  c.x.domain([0, playerYT.getDuration()/100])
  c.y.domain(d3.extent(chars,  ƒ('i')).reverse())

  var secs = c.svg.dataAppend(byTime, 'g')
      .translate(function(d){ return [c.x(d.key), 0] })

  secs.dataAppend(ƒ('values'), 'circle')
      .attr('r', 1)
      .attr('cy', function(d){ return d.i*7 })
      .attr('fill', grey)
      .each(function(d){ d.sel = d3.select(this) })

  


  c.y.domain([0, 3000]).range([c.height, c.height - 100]).clamp(true)
  c.line = d3.svg.line()
      .x(ƒ('tTime', c.x))
      .y(ƒ('cps', c.y))
      .interpolate('step')

}

function updateLine(){
  c.path.attr('d', c.line(typedChars.slice(1)))
}



function toText(chars){
  var rv = ''
  chars.split('').forEach(function(c, i){
    if (i && !(i % 30)) rv += '<br>'
    rv += c
  })
  return rv
}