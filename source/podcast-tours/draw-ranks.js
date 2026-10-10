// Leaderboards: guests ranked by how many different hosts booked them — one board for the decade, one for the last
// year. A row is the guest's short label + one dot per host in that host's color. Rows select the guest through the
// shared visState/renderAll, so hovering here lights up the by-show chart and the force graph too.
window.drawRanks = function(allEps){
  var SHOWS = window.showHost          // show key -> host lane, and the post's show list; both from draw-tours.js
  var guestKey = window.guestKey
  var hostColor = window.hostColor || {}   // draw-force.js fills this in; grey until it has
  var shorts = window.guestShorts || {}

  var eps = allEps.filter(d => SHOWS[d.s] && !d.r)   // reruns are not appearances
  var latest = d3.max(eps, d => d.d)
  var yearAgo = d3.utcFormat('%Y-%m-%d')(d3.utcDay.offset(new Date(latest + 'T12:00:00Z'), -365))
  // The bar is lower on the short board because the window is: three hosts inside one year is much rarer than three
  // inside a decade, and at 3 the year column would be half a dozen names.
  var BOARDS = [
    {head: 'since 2016',     from: '2016-01-01', minHosts: 3},
    {head: 'last 12 months', from: yearAgo,      minHosts: 2},
  ]

  // everyone booked by minHosts+ different hosts since `from`: most hosts first, ties to most appearances
  function board(from, minHosts){
    var by = {}
    eps.forEach(d => {
      if (d.d < from) return
      var host = SHOWS[d.s]
      ;(d.g || []).forEach(g => {
        var k = guestKey(g), o = by[k] = by[k] || {key: k, name: g, hosts: {}, n: 0}
        o.hosts[host] = (o.hosts[host] || 0) + 1
        o.n++
        if (g.length > o.name.length) o.name = g   // feeds spell the same person several ways: keep the fullest
      })
    })
    var all = Object.values(by)
    all.forEach(o => o.nHosts = Object.keys(o.hosts).length)
    return all.filter(o => o.nHosts >= minHosts).sort((a, b) => b.nHosts - a.nHosts || b.n - a.n)
  }

  // hover previews a guest, click locks it, clicking the locked row unlocks — the same contract as the lane chart
  function show(key){
    var v = window.visState
    v.guest = key
    v.ep = null
    renderAll.guest(); renderAll.ep()
  }
  var sel = d3.select('.tour-ranks').html('')
  sel.appendMany('div.rank-col', BOARDS).each(function(b){
    var col = d3.select(this)
    col.append('div.t-axis.rank-head').text(b.head)
    var rows = col.appendMany('div.rank-row', board(b.from, b.minHosts))
      .on('mouseenter', o => { if (!window.visState.stuck) show(o.key) })
      .on('click', o => {
        d3.event.stopPropagation()
        var v = window.visState
        if (v.stuck && v.guest == o.key){ v.stuck = false; return }
        v.stuck = true
        show(o.key)
      })
    rows.append('span.t-body.rank-name').text(o => shorts[o.name] || o.name)
    rows.append('span.rank-dots').appendMany('span.rank-dot', o => Object.keys(o.hosts).sort((a, b) => o.hosts[b] - o.hosts[a]))
      .st({background: h => hostColor[h] || '#999'}).attr('title', h => h)
    rows.append('span.t-axis.rank-n').text(o => o.nHosts)
  })
  renderAll.guest.fns.ranks = () => sel.selectAll('.rank-row').classed('on', o => o.key == window.visState.guest)
  renderAll.guest.fns.ranks()
}
if (window.episodes) drawRanks(window.episodes)
