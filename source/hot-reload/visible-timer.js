!(function(){
  var timers = {}

  var resize = _.throttle(() => {
    d3.values(timers).forEach(d => {
      var bbox = d.sel.node().getBoundingClientRect()
      d.top = pageYOffset + bbox.top
      d.bot = pageYOffset + bbox.bottom
    })
  }, 200)

  d3.select(window).on('resize', resize)

  var resizeSlow = _.throttle(resize, 1000)

  if (window.visibleTimerClock) visibleTimerClock.stop()
  visibleTimerClock = d3.timer(() => {

    resizeSlow()

    d3.values(timers).forEach(d => {
      d.active = d.top < innerHeight + scrollY && scrollY < d.bot
    })

    d3.values(timers).forEach(d => {
      if (!d.active) return

      d.t += 16 //idk?

      d.fn(d.t)
    })
  })
  

  d3.visibleTimer = function(fn, key, sel){
    if (!sel.size()) return

    var t = 0
    timers[key] = {sel, fn, t}

    resize()
  }

  d3.visibleTimer.timers = timers
})()
