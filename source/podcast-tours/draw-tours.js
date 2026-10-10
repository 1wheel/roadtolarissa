// One lane per host (every show they've run), one tiny dot per episode, 2016-2026.
// A guest on 3+ different hosts' shows with <= RUN_WINDOW_DAYS between consecutive stops is a
// "run": each run gets a small-multiple card below the lead. Hover/tap an episode for a chunky
// panel listing every appearance of that episode's guest(s); the selection itself is marked in
// --hi (magenta) everywhere, so the three charts read as one picture.
// Guest names come from feed text + LLM extraction: treat as best-effort, and as untrusted
// strings (everything lands in the DOM escaped or via .text()).
function initRenderAll(fnLabels){   // from anthropics/attribution-graphs-frontend util.js
  var rv = {}
  fnLabels.forEach(label => { rv[label] = ev => Object.values(rv[label].fns).forEach(d => d(ev)); rv[label].fns = {} })
  return rv
}
// ============================ the shared selection state ============================
// Defined here; draw-force.js and draw-ranks.js render from it. The shape:
//
//   window.visState = {guest, ep, stuck}
//     guest   a 'first|last' guest key (see guestKey), or null
//     ep      one episode record out of the drawn set, or null
//     stuck   true once a click locked the selection — hover stops moving it until something unlocks
//
//   window.renderAll.guest() / .ep()   run every render fn registered under that key.
//     Register as renderAll.<key>.fns.<component> = fn. Keying by component is what makes the page
//     hot-reloadable: re-running a file replaces its fn instead of stacking a second copy.
//     A render fn reads visState and draws. It must not assign to visState — the two directions would race.
//
// The interaction rules every view follows:
//   hover       moves the selection only while stuck is false, on a fine pointer, with shift up (shift freezes)
//   click       sets the selection and locks it (stuck = true)
//   click again on the locked thing unlocks; so do Esc and a click on empty space. Unlocking redraws
//               nothing — what is showing stays until the next hover moves it
// Inside drawTours guest/ep are written only by setSel, stuck only by lock / unlock / toggleLock, and the
// URL only by syncUrl; every handler in this file calls those. draw-force.js and draw-ranks.js write visState
// themselves and follow the same rules — keep them in step when a rule here changes.
// ====================================================================================
window.visState = window.visState || {guest: null, ep: null, stuck: false}
window.renderAll = window.renderAll || initRenderAll(['guest', 'ep'])
// ---- shared with draw-ranks.js through window, the way draw-force.js shares its color maps ----
// one key per person: diacritics, periods, middle initials, suffixes and hyphenated surnames folded, so the
// feeds' several spellings of a name land on the same first|last
window.guestKey = function(g){
  var p = g.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\./g, '').toLowerCase().split(/\s+/)
    .filter(t => !/^(jr|sr|ii|iii|iv)$/.test(t))
  return p[0] + '|' + p[p.length - 1]
}
// show key -> host lane. These are the names window.hostColor is keyed by (draw-force.js), which is why the
// brand is the lane where the show is the brand (Odd Lots, Fresh Air) and the person where the person is.
// It doubles as the post's show list: a show missing here is not on any chart.
window.showHost = {
  'ek-vox': 'Ezra Klein', 'impeachment': 'Ezra Klein', 'ek-nyt': 'Ezra Klein',
  'crazy-genius': 'Derek Thompson', 'plain-english': 'Derek Thompson',
  'odd-lots': 'Odd Lots', '538-politics': 'Nate Silver', 'risky-biz': 'Nate Silver', 'silver-bulletin': 'Nate Silver',
  'reply-all': 'PJ Vogt', 'crypto-island': 'PJ Vogt', 'search-engine': 'PJ Vogt',
  'hard-fork': 'Hard Fork', 'tyler': 'Tyler Cowen', 'dwarkesh': 'Dwarkesh', 'fresh-air': 'Fresh Air',
  'decoder': 'Decoder', 'interesting-times': 'Ross Douthat', 'the-argument': 'Ross Douthat', 'chinatalk': 'ChinaTalk', 'longform': 'Longform',
}
// lane chart dot packing, ?lanes=swarm|fill: read once at load, before syncUrl rewrites the query string
window.laneMode = window.laneMode || (new URLSearchParams(location.search).get('lanes') == 'swarm' ? 'swarm' : 'fill')
window.drawTours = function(allEps){
  var eps = allEps.filter(d => d.d >= '2016-01-01')

  // ---- marks ----
  var DOT_FILL = '#1f1f1f'     // a lane dot before the force graph publishes window.showColor
  var DOT_R = 1.4, DOT_OPACITY = .85   // lane dots: bigger and near-opaque (were 1.2 / .45 — Adam: "way too faded")
  var EP_R = 1.6, EP_FILL = '#333', EP_OPACITY = .35   // the gray episode dot on a card, both as feed context and inside a ring
  var RING_R = 3.5, RING_W = 1.4                       // the selection ring: lane chart and cards use the same one, so a stop reads as the same mark in both
  var CARD_INK = '#222'                                // every run card's rings and run line
  var HI = getComputedStyle(document.documentElement).getPropertyValue('--hi').trim() || '#f0f'   // selection color, everywhere
  var RUN = ['#c4616c', '#6b8bc3', '#d4ad4a', '#5aaea1', '#9b7fc2', '#d98a5b']   // muted, one per run without its own color
  // colors.json ({"Guest Name": "#hex"}, hand-written: the person's own site/newsletter accent) wins over the palette.
  // Nothing draws with it since the cards went to CARD_INK; kept so a card can take its run's color back
  var runColor = t => t ? ((window.guestColors || {})[t.name] || (t.ci >= 0 && t.ci < RUN.length ? RUN[t.ci] : '#666')) : '#666'

  var SHOWS = {
    'ek-vox':       {label: 'Ezra Klein Show', short: 'Ezra',      host: 'Ezra Klein'},
    'impeachment':  {label: 'Impeachment',    short: 'Impeachment', host: 'Ezra Klein'},
    'ek-nyt':       {label: 'Ezra Klein Show', short: 'Ezra',     host: 'Ezra Klein'},
    'crazy-genius': {label: 'Crazy/Genius',   short: 'C/G',       host: 'Derek Thompson'},
    'plain-english':{label: 'Plain English',  short: 'Plain E.',  host: 'Derek Thompson'},
    'odd-lots':     {label: 'Odd Lots',       short: 'Odd Lots',  host: 'Joe Weisenthal & Tracy Alloway'},
    '538-politics': {label: '538 Politics',   short: '538',       host: 'Nate Silver'},
    'risky-biz':    {label: 'Risky Business', short: 'Risky B.',  host: 'Nate Silver'},
    'silver-bulletin':{label: 'Silver Bulletin', short: 'Silver B.', host: 'Nate Silver'},
    'reply-all':    {label: 'Reply All',      short: 'Reply All', host: 'PJ Vogt'},
    'crypto-island':{label: 'Crypto Island',  short: 'Crypto I.', host: 'PJ Vogt'},
    'search-engine':{label: 'Search Engine',  short: 'Search E.', host: 'PJ Vogt'},
    'hard-fork':    {label: 'Hard Fork',      short: 'Hard Fork', host: 'Kevin Roose & Casey Newton'},
    'decoder':      {label: 'Decoder',        short: 'Decoder',   host: 'Nilay Patel'},
    'tyler':        {label: 'Conv. w/ Tyler', short: 'CwT',       host: 'Tyler Cowen'},
    'dwarkesh':     {label: 'Dwarkesh Pod',   short: 'Dwarkesh',  host: 'Dwarkesh Patel'},
    'interesting-times': {label: 'Interesting Times', short: 'Douthat', host: 'Ross Douthat'},
    'the-argument': {label: 'The Argument',   short: 'Argument',  host: 'Ross Douthat'},
    'chinatalk':    {label: 'ChinaTalk',      short: 'ChinaTalk', host: 'Jordan Schneider'},
    'longform':     {label: 'Longform',       short: 'Longform',  host: 'Longform'},
    'fresh-air':    {label: 'Fresh Air',      short: 'Fresh Air', host: 'Terry Gross'},
    'tal':          {label: 'This American Life', short: 'TAL',   host: 'Ira Glass'},
  }
  // one lane per host, not per feed: a host's shorter-lived shows fold into the same line so a move
  // from Reply All to Search Engine reads as one person, not two. big label = the show; small label = the rest.
  var ROWS = [
    {host: 'Ezra Klein',                     show: 'The Ezra Klein Show',    sub: '+ Vox, Impeachment',        lanes: ['ek-vox', 'impeachment', 'ek-nyt']},
    {host: 'Derek Thompson',                 show: 'Plain English',          sub: '+ Crazy/Genius',                lanes: ['crazy-genius', 'plain-english']},
    {host: 'Joe Weisenthal & Tracy Alloway', show: 'Odd Lots',               sub: '',                              lanes: ['odd-lots']},
    {host: 'Nate Silver',                    show: 'Silver Bulletin',        sub: '+ 538, Risky Business', lanes: ['538-politics', 'risky-biz', 'silver-bulletin']},
    {host: 'PJ Vogt',                        show: 'Search Engine',          sub: '+ Reply All, Crypto Island',    lanes: ['reply-all', 'crypto-island', 'search-engine']},
    {host: 'Kevin Roose & Casey Newton',     show: 'Hard Fork',              sub: '',                              lanes: ['hard-fork']},
    {host: 'Nilay Patel',                    show: 'Decoder',                sub: '',                              lanes: ['decoder']},
    {host: 'Tyler Cowen',                    show: 'Conversations with Tyler', sub: '',                            lanes: ['tyler']},
    {host: 'Ross Douthat',                   show: 'Interesting Times',      sub: '+ The Argument',                lanes: ['the-argument', 'interesting-times']},
    {host: 'Jordan Schneider',               show: 'ChinaTalk',              sub: '',                              lanes: ['chinatalk']},
    {host: 'Dwarkesh Patel',                 show: 'Dwarkesh Podcast',       sub: '',                              lanes: ['dwarkesh']},
    {host: 'Longform',                       show: 'Longform',               sub: '',                              lanes: ['longform']},
    {host: 'Terry Gross',                    show: 'Fresh Air',              sub: '',                              lanes: ['fresh-air']},
  ]
  // the post shows only the shows above; TAL stays in the sketch.
  // Silver Bulletin text interviews (p=1) count as ordinary stops here — no hollow-dot treatment
  var shown = {}
  ROWS.forEach(row => row.lanes.forEach(s => shown[s] = 1))
  eps = eps.filter(d => shown[d.s])

  // ---- layout ----
  // d3.conventions pins the container's width; clear it so a redraw measures the live grid cell, not the last draw
  // (jetpack's .st() calls .match on the value, so null must go through d3's native .style())
  // markup: .tour-chart > .chart + .side(.search-wrap > input.guest-search, .panel); selectAppend keeps
  // the search box (and whatever is typed in it) across redraws
  var wrap = d3.select('.tour-chart')
  wrap.selectAppend('div.tour-force')                  // full width on its own row
  var chartSel = wrap.selectAppend('div.chart').html('').style('width', null).style('height', null)   // by-show chart, left
  var side = wrap.selectAppend('div.side')             // search + list, beside the chart (sticky)
  var searchWrap = side.selectAppend('span.search-wrap')
  searchWrap.selectAppend('input.guest-search').at({type: 'text', placeholder: 'find a guest…', autocomplete: 'off'})
  if (side.select('.panel').empty()) side.append('div.panel.panel-hidden')
  var coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches
  var isMobile = window.innerWidth <= 640 || (coarse && window.innerWidth <= 1024)   // must match the CSS breakpoint, not the chart cell width
  var sidebar = !isMobile                                    // desktop: appearance list lives in the right column

  // lane labels hang into the page's left gutter: the svg is widened by `gutter` and shifted left by the same amount,
  // so the plot itself starts flush with the post column
  var LABEL_W = isMobile ? 128 : 152    // phone: fits 'Silver B., 538, Risky B.' at 8px; .chart clips anything wider
  var GUTTER_KEEP = 16                  // never eat the page's own left edge
  var PAGE_KEEP = 28                    // ...nor the scrollbar side
  var box = chartSel.node().getBoundingClientRect()
  var measured = box.width || window.innerWidth
  var gutter = isMobile ? 0 : Math.max(0, Math.min(LABEL_W, box.left - GUTTER_KEEP))
  var availWidth = Math.min(measured + gutter, document.documentElement.clientWidth - PAGE_KEEP)
  var margin = {top: 18, right: 14, bottom: 30, left: LABEL_W}

  // Odd Lots and Fresh Air publish several times a week: their lanes get extra height so the dot packing has room
  var LANE_H = 24, LANE_H_DENSE = 36, LANE_GAP = 6   // a touch taller than the original 22 / 34 / 6
  var laneH = {}, laneY = {}, y = 0
  ROWS.forEach(row => {
    var dense = row.lanes.indexOf('odd-lots') > -1 || row.lanes.indexOf('fresh-air') > -1
    laneH[row.host] = dense ? LANE_H_DENSE : LANE_H
    laneY[row.host] = y + laneH[row.host]/2
    y += laneH[row.host] + LANE_GAP
  })
  var height = y - LANE_GAP - 4        // drop the gap trailing the last lane, then sit the axis close under it
  var laneOf = d => SHOWS[d.s].host

  var c = d3.conventions({sel: chartSel, totalWidth: availWidth, height: height, margin: margin})
  document.documentElement.style.setProperty('--rail-h', c.totalHeight + 'px')   // the right rail matches the lane chart
  chartSel.style('width', measured + 'px').select('svg').style('margin-left', -gutter + 'px')

  // ---- time axis ----
  var AXIS_END_PAD_DAYS = 3     // a little air so the newest episode isn't drawn on the frame
  var PX_PER_TICK = 62          // year labels at ~8 chars, never crowded and never fewer than 3
  var TICK_FLIP_PX = 34         // a label this close to the right edge flips to the other side of its line
  eps.forEach(d => d.date = d.date || new Date(d.d + 'T12:00:00Z'))
  var maxDate = d3.max(eps, d => d.date)
  c.x = d3.scaleUtc().domain([new Date('2016-01-01'), new Date(+maxDate + AXIS_END_PAD_DAYS*864e5)]).range([0, c.width])   // ends at the latest episode
  c.svg.append('g').attr('class', 'x axis').translate(c.height, 1)
    .call(d3.axisBottom(c.x).ticks(Math.max(3, Math.min(11, Math.floor(c.width/PX_PER_TICK)))))
  // same tick language as the run cards: a faint year line through the lanes (stroke from css), small gray label below
  c.svg.selectAll('.domain').remove()
  c.svg.selectAll('.x .tick line').at({y1: -c.height - 2, y2: 3})
  // labels sit to the right of their line; the last one flips left so it never runs past the plot (clipped on phones)
  var flips = d => c.x(d) > c.width - TICK_FLIP_PX
  c.svg.selectAll('.x text').classed('t-axis', true).at({y: 6, x: d => flips(d) ? -3 : 3, textAnchor: d => flips(d) ? 'end' : 'start'})
  c.svg.select('.x').lower()

  // ---- dot placement: x is the date, y is a greedy packing inside the lane band ----
  // every dot is placed left to right against the dots already placed in its lane, so the same width always gives the
  // same picture. ?lanes=swarm hugs the centre line (a beeswarm capped at the band edge: a pile-up takes an overlap
  // instead of growing an arm); ?lanes=fill (default) spreads each dot to the y farthest from its neighbours, so a busy
  // stretch fills the band evenly and a quiet one scatters across it
  var LANE_MODE = window.laneMode
  var BAND_INSET = 4                  // keep dots off the lane's own edge
  var DOT_GAP = 2*DOT_R + .4          // centre-to-centre distance that counts as not touching
  var FILL_WIN = 8                    // fill: neighbours within this many px of x push a dot away
  var FILL_SLOTS = 10, FILL_SLOTS_DENSE = 12
  var FILL_ROOM = 1.25*DOT_GAP        // fill: a slot this clear of every neighbour is as good as any, so sparse stretches scatter instead of zigzagging edge to edge
  var FALLBACK_STEP = .5              // swarm: y resolution when the band is full and some overlap is unavoidable
  function hash(s){
    var h = 0
    for (var i = 0; i < s.length; i++) h = (h*31 + s.charCodeAt(i)) % 1000003
    return h/1000003
  }
  function placeLanes(){
    var BUCKET = Math.max(DOT_GAP, LANE_MODE == 'fill' ? FILL_WIN : 0)
    var byLane = {}
    eps.forEach(d => {
      d.px = c.x(d.date)
      var k = laneOf(d); (byLane[k] = byLane[k] || []).push(d)
    })
    Object.keys(byLane).forEach(k => {
      var cy = laneY[k], cap = laneH[k]/2 - BAND_INSET
      var slots = laneH[k] == LANE_H_DENSE ? FILL_SLOTS_DENSE : FILL_SLOTS
      var buckets = new Map(), flip = 1
      var list = byLane[k]
      list.forEach(d => d._h = hash((d.u || '') + '|' + d.t + '|' + d.d))   // the seed mixes url+title+date so shared generic links don't line up
      list.sort((a, b) => a.px - b.px || a._h - b._h)
      list.forEach(d => {
        var win = LANE_MODE == 'fill' ? FILL_WIN : DOT_GAP
        var b = Math.floor(d.px/BUCKET), near = []
        for (var i = b - 1; i <= b + 1; i++) (buckets.get(i) || []).forEach(o => { if (Math.abs(o.px - d.px) < win) near.push(o) })
        var minDist = y => { var m = Infinity; near.forEach(o => { var dx = o.px - d.px, dy = o.py - cy - y, dd = dx*dx + dy*dy; if (dd < m) m = dd }); return Math.sqrt(m) }
        var off
        if (LANE_MODE == 'fill'){
          // max-min over evenly spaced slots, shifted per dot so the slots never print as stripes; ties go to the first slot in a per-dot rotation
          var step = 2*cap/(slots - 1), shift = (d._h - .5)*step, start = Math.floor(d._h*7919) % slots, best = -1
          for (var j = 0; j < slots; j++){
            var s = (start + j) % slots, y = Math.max(-cap, Math.min(cap, -cap + s*step + shift)), m = Math.min(FILL_ROOM, minDist(y))
            if (m > best + 1e-6){ best = m; off = y }
          }
        } else {
          // each close neighbour blocks an interval of y; take the free y nearest the centre, alternating sides on a near-tie
          var blocked = near.map(o => { var dx = o.px - d.px, h = Math.sqrt(Math.max(0, DOT_GAP*DOT_GAP - dx*dx)); return [o.py - cy - h, o.py - cy + h] })
          var free = y => y >= -cap - 1e-9 && y <= cap + 1e-9 && blocked.every(iv => y <= iv[0] + 1e-9 || y >= iv[1] - 1e-9)
          var up = null, dn = null
          ;[0].concat(...blocked).forEach(y => {
            if (!free(y)) return
            if (y <= 0 && (up == null || y > up)) up = y
            if (y >= 0 && (dn == null || y < dn)) dn = y
          })
          if (up != null || dn != null){
            if (up == null) off = dn
            else if (dn == null) off = up
            else if (Math.abs(-up - dn) < DOT_R) off = flip < 0 ? up : dn
            else off = -up < dn ? up : dn
          } else {
            // no free y inside the cap: the least-overlapping one, nearest the centre on a tie
            var best = -1
            for (var y = 0; y <= cap + 1e-9; y += FALLBACK_STEP) [flip*y, -flip*y].forEach(yy => { var m = minDist(yy); if (m > best + 1e-6){ best = m; off = yy } })
          }
          if (off) flip = off < 0 ? 1 : -1
        }
        d.py = cy + off
        var bb = Math.floor(d.px/BUCKET); buckets.has(bb) ? buckets.get(bb).push(d) : buckets.set(bb, [d])
      })
    })
  }
  placeLanes()

  // ---- lane chrome: show name big, other shows small ----
  ROWS.forEach(row => {
    var yy = laneY[row.host]
    c.svg.append('line.lane-line').at({x1: 0, x2: c.width, y1: yy, y2: yy})
    var hasSub = !!row.sub
    c.svg.append('text.t-name').at({x: -6, y: yy + (hasSub ? -1 : 4), textAnchor: 'end'})
      .text(isMobile ? row.show.replace('The Ezra Klein Show', 'Ezra Klein Show').replace('Conversations with Tyler', 'Conv. w/ Tyler') : row.show)
    var tight = isMobile || gutter < LABEL_W - 10  // labels can't fully hang into the gutter: use the short forms
    if (hasSub) c.svg.append('text.t-sub.lane-sub').at({x: -6, y: yy + 11, textAnchor: 'end'}).text(tight ? row.sub.replace('+ 538, Risky Business', '+ 538, Risky B.').replace('+ Reply All, Crypto Island', '+ Reply All, Crypto I.') : row.sub)
  })

  // ---- guest index, keyed by the shared guestKey above ----
  var guestKey = window.guestKey
  var byGuest = {}, guestMeta = {}
  eps.forEach(d => (d.g || []).forEach(g => {
    if (d.r) return                       // reruns are not appearances
    var k = guestKey(g), list = byGuest[k] = byGuest[k] || []
    if (list.indexOf(d) < 0) list.push(d)
  }))
  Object.keys(byGuest).forEach(k => {
    var list = byGuest[k].sort((a, b) => a.date - b.date), name = ''
    list.forEach(d => d.g.forEach(g => { if (guestKey(g) == k && g.length > name.length) name = g }))   // the longest spelling wins: 'Annie Lowrey' over 'A. Lowrey'
    guestMeta[k] = {key: k, name, eps: list, nShows: d3.nestBy(list, d => d.s).length, nHosts: d3.nestBy(list, d => laneOf(d)).length}
  })
  var names = Object.values(guestMeta).sort((a, b) => b.eps.length - a.eps.length || b.nHosts - a.nHosts)

  // ---- runs: same guest, 3+ hosts, <= W days between consecutive stops, total span <= 2W ----
  var MIN_HOSTS = +(new URLSearchParams(location.search).get('hosts')) || 3   // ?hosts=2 to see two-host runs too
  var RUN_WINDOW_DAYS = 30
  var tours = []
  function computeTours(W){
    tours = []
    eps.forEach(d => { d.tour = null; d.tier = 0 })
    Object.keys(byGuest).forEach(k => {
      var list = byGuest[k].slice().sort((a, b) => a.date - b.date), cluster = [list[0]]
      var flush = () => {
        var hosts = d3.nestBy(cluster, d => laneOf(d))
        if (hosts.length >= MIN_HOSTS){
          var tour = {key: k, name: guestMeta[k].name, eps: cluster, nHosts: hosts.length, last: cluster[cluster.length - 1].date}
          tours.push(tour)
          cluster.forEach(d => { if (!d.tour || tour.nHosts > d.tour.nHosts){ d.tour = tour; d.tier = 3 } })
        }
      }
      for (var i = 1; i < list.length; i++){
        if ((list[i].date - list[i-1].date)/864e5 <= W && (list[i].date - cluster[0].date)/864e5 <= 2*W) cluster.push(list[i])
        else { flush(); cluster = [list[i]] }
      }
      flush()
    })
    tours.sort((a, b) => b.nHosts - a.nHosts || b.last - a.last)   // biggest run first, then most recent
    var ci = 0
    tours.forEach(t => { t.ci = (window.guestColors || {})[t.name] ? -1 : ci++ })
  }

  // ---- layers: dots, then the selection marks above them, then the (currently empty) annotation layer ----
  var dotG = c.svg.append('g')
  var dotSel = dotG.appendMany('circle.ep', eps).translate(d => [d.px, d.py])
  var hiG = c.svg.append('g').st({pointerEvents: 'none'})
  var annG = c.svg.append('g').st({pointerEvents: 'none'})   // nothing is drawn into it today; it still dims itself for the lead run, see highlight()

  // the force graph owns the host palette, and only exists after it has drawn: re-tint once it does
  window.restyleDots = restyle
  function restyle(){
    var sc = window.showColor || {}
    dotSel.at({r: DOT_R}).st({fill: d => sc[d.s] || DOT_FILL, fillOpacity: DOT_OPACITY, stroke: 'none'})   // same host colors as the force graph, keyed by show
  }

  // ---- highlight: a magenta ring on every appearance of the selected guest ----
  function highlight(keys){
    hiG.html('')
    keys = keys.filter(k => guestMeta[k])
    annG.st({opacity: keys.indexOf('jasmine|sun') > -1 ? 0 : 1})
    keys.forEach(k => {
      hiG.appendMany('circle', guestMeta[k].eps).translate(d => [d.px, d.py]).at({r: RING_R, fill: 'none', stroke: HI, strokeWidth: RING_W})
    })
  }
  // guests of an episode ordered by how often they've appeared (most first)
  function guestKeysOf(d){
    var seen = {}, out = []
    ;(d.g || []).forEach(g => { var k = guestKey(g); if (guestMeta[k] && !seen[k]){ seen[k] = 1; out.push(k) } })
    return out.sort((a, b) => guestMeta[b].eps.length - guestMeta[a].eps.length)
  }

  // ---- run cards: one row per show, the run's stops joined by a line, feed context dots, month ticks ----
  // the lead run (Jasmine Sun) renders alone into .tour-lead; the others as narrower cards in the .tour-cards row
  var CARD_W = 204, CARD_MIN_W = 172, CARD_GAP = 12, CARD_SHOW_LABEL_W = 62, CARD_FALLBACK_W = 750   // cards shrink to CARD_MIN_W to fit one more per row
  var CARD_MIN_DAYS = 20, CARD_AIR_DAYS = 8     // every card covers the same number of days, so slopes compare
  var CARD_ROW_H = 13, CARD_PAD_T = 18, CARD_PAD_B = 16, CARD_TL_L = 6
  var leadSel = d3.select('.tour-lead'), multSel = d3.select('.tour-cards')
  var fmtShort = d3.utcFormat('%b %-d')
  var spanDays = CARD_MIN_DAYS   // shared across the cards: set in drawMultiples from the longest run
  var cardLanes = 1              // shared too: the most show lanes on any card, so every card is that tall and the axes line up

  function renderCard(container, tour, cardW, showLabelW){
    var card = container.append('div.mult-card').datum(tour).classed('on', state.guest == tour.key).style('width', cardW + 'px')   // css says 204; a shrunk card sets its own
      .on('click', () => { d3.event.stopPropagation(); toggleLock(tour.key, null, state.guest == tour.key && !state.ep) })
    var rc = tour.key == 'jasmine|sun' ? runColor(tour) : CARD_INK
    var stops = tour.eps.slice().sort((a, b) => a.date - b.date)
    var note = (window.cardNotes || {})[tour.name]
    var rows = d3.nestBy(stops, d => d.s)

    // the run sits in the middle of a fixed-length window, so a tight run reads as tight
    var mid = (+stops[0].date + +stops[stops.length-1].date)/2, t0 = mid - spanDays/2*864e5, t1 = mid + spanDays/2*864e5
    var nLanes = cardLanes || rows.length
    var H = CARD_PAD_T + nLanes*CARD_ROW_H + CARD_PAD_B   // lanes top-aligned; a card with fewer lanes leaves the gap above its axis
    var svg = card.append('svg').at({width: cardW, height: H})
    var x = d3.scaleUtc().domain([t0, t1]).range([CARD_TL_L + 4, cardW - showLabelW - 6]), rowY = {}
    // the name sits in the svg, centered over the plot's date domain, in the same style as the big chart's show labels
    svg.append('text.t-name').at({x: (x.range()[0] + x.range()[1])/2, y: 11, textAnchor: 'middle'}).text(tour.name)
    if (note) card.append('div.mult-note.t-body').html(note)   // author-written notes.json, not feed text
    rows.forEach((r, i) => { rowY[r.key] = CARD_PAD_T + i*CARD_ROW_H + CARD_ROW_H/2 })

    var axisY = CARD_PAD_T + nLanes*CARD_ROW_H + 2, lastEnd = -Infinity
    x.ticks(d3.utcMonth).forEach((d, i) => {
      svg.append('line').at({x1: x(d), x2: x(d), y1: CARD_PAD_T - 2, y2: axisY + 3})
      var label = svg.append('text.t-axis').at({x: x(d) + 3, y: axisY + 11}).text(d3.utcFormat(i ? '%b' : '%b %Y')(d))
      if (x(d) + 3 < lastEnd + 6) label.remove()   // narrow cards: keep the tick line, drop a label that would run into the last one
      else lastEnd = x(d) + 3 + label.node().getComputedTextLength()
    })

    // every other episode of the same show in the window: the run's stops have to be readable against the feed's normal rate
    rows.forEach(r => {
      var yy = rowY[r.key]
      svg.append('line').at({x1: CARD_TL_L, x2: cardW - showLabelW, y1: yy, y2: yy})
      eps.forEach(d => {
        if (d.s != r.key || +d.date < t0 || +d.date > t1 || r.indexOf(d) > -1) return
        svg.append('circle').datum(d).at({cx: x(d.date), cy: yy, r: EP_R, fill: EP_FILL, fillOpacity: EP_OPACITY}).st({cursor: 'pointer'})
          .on('click', d => { d3.event.stopPropagation(); lock(guestOf(d), d) })   // a context dot selects that episode (and its guest)
      })
    })

    // the run line is drawn as segments trimmed at each ring's edge, so nothing crosses a ring's interior and
    // no fill is needed (other episodes' dots stay visible inside the rings)
    var trim = RING_R + 1
    d3.pairs(stops).forEach(([a, b]) => {
      var x1 = x(a.date), y1 = rowY[a.s], x2 = x(b.date), y2 = rowY[b.s], len = Math.hypot(x2 - x1, y2 - y1)
      if (len <= 2*trim) return
      var ux = (x2 - x1)/len, uy = (y2 - y1)/len
      svg.append('line.run').at({x1: x1 + ux*trim, y1: y1 + uy*trim, x2: x2 - ux*trim, y2: y2 - uy*trim}).st({stroke: rc, strokeWidth: 1.4, opacity: 1})   // full strength so the line matches its rings (was .7, which washed Jasmine's gold out); inline style: the hairline CSS rule would override an attribute
    })

    // a stop is a ring + its own gray dot; the solid center marks the selected episode (kept in sync by renderAll.ep)
    stops.forEach(d => {
      svg.append('circle.stop').datum(d).at({cx: x(d.date), cy: rowY[d.s], r: RING_R, fill: 'none', stroke: rc, strokeWidth: RING_W})
        .st({pointerEvents: 'all', cursor: 'pointer'})
        .on('click', d => { d3.event.stopPropagation(); lock(tour.key, d === state.ep ? null : d) })   // a ring selects that episode; the selected ring drops back to the guest
        .append('title').text(fmtShort(d.date) + ' · ' + d.t)
      svg.append('circle').at({cx: x(d.date), cy: rowY[d.s], r: EP_R, fill: EP_FILL, fillOpacity: EP_OPACITY, pointerEvents: 'none'})
      svg.append('circle.stopc').datum(d).at({cx: x(d.date), cy: rowY[d.s], r: 2, fill: rc, opacity: d === state.ep ? 1 : 0, pointerEvents: 'none'})
    })
    rows.forEach(r => svg.append('text.t-sub.lane-sub').at({x: cardW - showLabelW + 4, y: rowY[r.key] + 3}).text(SHOWS[r.key].short))
  }

  function drawMultiples(){
    leadSel.html(''); multSel.html('')
    if (!tours.length) return
    spanDays = Math.max(CARD_MIN_DAYS, d3.max(tours, t => (+d3.max(t.eps, d => d.date) - +d3.min(t.eps, d => d.date))/864e5) + CARD_AIR_DAYS)
    var lead = tours.filter(t => t.key == 'jasmine|sun')[0] || tours[0]
    var lanesOf = t => d3.nestBy(t.eps, d => d.s).length
    cardLanes = 0; renderCard(leadSel, lead, CARD_W, CARD_SHOW_LABEL_W)   // every card is as tall as its own lanes (cardLanes 0 = use the card's own count)
    // balanced explicit rows: as many cards per row as fit, then the count spread evenly (10 → 5 + 5 or 4 + 3 + 3, never 7 + 3).
    // "fit" counts cards at CARD_MIN_W, so a row takes one more card before it wraps; the cards then shrink only as far as
    // the widest row needs (full CARD_W whenever that row fits at full size)
    var rest = tours.filter(t => t !== lead), avail = multSel.node().getBoundingClientRect().width || CARD_FALLBACK_W
    var fit = Math.max(1, Math.floor((avail + CARD_GAP) / (CARD_MIN_W + CARD_GAP))), rows = Math.ceil(rest.length / fit)
    var perRow = Math.ceil(rest.length / rows), cardW = Math.max(CARD_MIN_W, Math.min(CARD_W, Math.floor((avail + CARD_GAP) / perRow - CARD_GAP)))
    var i = 0
    d3.range(rows).forEach(r => {
      var n = Math.ceil((rest.length - i) / (rows - r)), row = multSel.append('div.mult-rowline')
      rest.slice(i, i + n).forEach(t => renderCard(row, t, cardW, CARD_SHOW_LABEL_W))   // one width for every card in the grid
      i += n
    })
  }

  // ---- one selection: a guest (shown in the search box) and optionally one episode ----
  // hover/click on the chart, a list row, a co-guest link, a run card and the search box all go through select()
  var panel = d3.select('.side .panel')
  side.style('margin-top', null)
  if (sidebar) panel.st({height: 'auto', maxHeight: 'none', overflowY: 'auto', boxSizing: 'border-box'})   // the rail's flex column (css) keeps the list inside the screen
  else panel.style('height', null).style('max-height', null).style('overflow-y', null)
  // the wide rail takes the force graph's height, and init() draws the graph after this, so setSel's .long test ran on a
  // near-empty rail and marked short lists long: re-test whenever the panel resizes. Desktop only: there .long just adds a
  // spacer inside the scroller (css); on the phone its padding changes the panel's own height and would loop
  var pNode = panel.node(); pNode.__sidebar = sidebar
  if (!pNode.__ro && window.ResizeObserver) (pNode.__ro = new ResizeObserver(() => {
    if (!pNode.__sidebar || pNode.classList.contains('panel-hidden')) return
    var st = pNode.scrollTop
    pNode.classList.remove('long'); pNode.classList.toggle('long', pNode.scrollHeight > pNode.clientHeight); pNode.scrollTop = st
    showCur(pNode)   // the scroll set on the near-empty rail can leave the selected row out of view once it grows
  })).observe(pNode)
  // the selected episode's row scrolls into view inside the panel (not the page), centred; the list has no room below its
  // last row, so the last episode just sits at the bottom. Measured from the panel's top: offsetTop counts from the rail.
  // DOM only: the observer above keeps the first drawTours call's closure
  function showCur(pn){
    var row = pn.querySelector('.p-row.cur')
    if (!row) return
    var top = row.getBoundingClientRect().top - pn.getBoundingClientRect().top - pn.clientTop + pn.scrollTop
    if (top < pn.scrollTop || top + row.offsetHeight > pn.scrollTop + pn.clientHeight) pn.scrollTop = top - pn.clientHeight/2 + row.offsetHeight/2
  }
  eps.forEach((d, i) => d.i = i)   // the panel addresses an episode by index, so a row survives being re-rendered as html
  var state = window.visState   // shape and rules: the block at the top of this file

  // modes: browsing (hover/click drive the selection) or searching (the box has focus and the panel is the typeahead).
  // Anything that touches the chart, a card or Esc leaves search mode first.
  var searching = false
  function endSearch(){ if (!searching) return; searching = false; var b = d3.select('.guest-search').node(); if (b) b.blur() }

  // ---- the setter: the only lines in this file that write visState.guest / visState.ep ----
  // an unknown key becomes null so every render fn can index guestMeta[state.guest] without a check
  function setSel(key, ep){
    state.guest = key && guestMeta[key] ? key : null
    state.ep = ep || null
  }
  // set and redraw every view. Leaves the lock alone: whether this came from a hover or a click is decided below
  function select(key, ep){
    endSearch()
    setSel(key, ep)
    renderAll.guest(); renderAll.ep()
  }

  // ---- click versus hover: the only lines in this file that write visState.stuck ----
  // hover follows the pointer until a click locks; shift held freezes whatever is showing; a coarse pointer never
  // hovers (a phone's finger-drag is its own handler, below). Unlocking redraws nothing: the next hover moves it.
  function hoverFollows(){ return !state.stuck && !coarse && !d3.event.shiftKey }
  function lock(key, ep){ state.stuck = true; select(key, ep) }
  function unlock(){ state.stuck = false }                                   // Esc, a click on empty chart, a click off the page's charts
  function toggleLock(key, ep, same){ if (state.stuck && same) unlock(); else lock(key, ep) }   // clicking the locked thing again unlocks
  // an episode stands for itself plus its most-booked guest — never two contexts in the panel
  function guestOf(d){ return guestKeysOf(d)[0] || null }

  renderAll.guest.fns.tours = () => {
    d3.select('.guest-search').property('value', state.guest ? guestMeta[state.guest].name : '')
    highlight(state.guest ? [state.guest] : [])
    d3.selectAll('.mult-card').classed('on', t => t && t.key == state.guest)
    renderPanel()
  }
  renderAll.ep.fns.tours = () => {
    hiG.selectAll('circle.epc').remove()
    if (state.ep){
      hiG.append('circle.epc').translate([state.ep.px, state.ep.py]).at({r: RING_R, fill: 'none', stroke: HI, strokeWidth: RING_W})
      hiG.append('circle.epc').translate([state.ep.px, state.ep.py]).at({r: EP_R, fill: HI})
    }
    d3.selectAll('.mult-card circle.stop').st({stroke: d => d === state.ep ? HI : ''})   // '' not null: jetpack .st can't take null
    d3.selectAll('.mult-card circle.stopc').at({opacity: d => d === state.ep ? 1 : 0, fill: HI})
    panel.classed('sheet', isMobile && !!state.ep)
    renderPanel()
  }

  // ---- the URL: ?guest=Jasmine+Sun&ep=odd-lots/2026-08-21, the only reader and writer of those two keys ----
  // replaceState, never pushState: a hover must not fill the back button. Registered as its own component so a
  // selection made from the force graph or the leaderboards lands in the URL too.
  function syncUrl(){
    if (!history.replaceState) return
    var q = []
    if (state.guest) q.push('guest=' + encodeURIComponent(guestMeta[state.guest].name))
    if (state.ep) q.push('ep=' + encodeURIComponent(state.ep.s + '/' + state.ep.d))
    history.replaceState(null, '', location.pathname + (q.length ? '?' + q.join('&') : '') + location.hash)
  }
  function stateFromUrl(){
    var p = new URLSearchParams(location.search), out = {guest: null, ep: null}
    var g = p.get('guest'); if (g && guestMeta[guestKey(g)]) out.guest = guestKey(g)
    var e = (p.get('ep') || '').split('/'); if (e.length == 2) out.ep = eps.filter(d => d.s == e[0] && d.d == e[1])[0] || null
    return out
  }
  renderAll.guest.fns.url = syncUrl; renderAll.ep.fns.url = syncUrl

  // ---- the panel: the selected guest's appearances, the selected episode expanded in place ----
  // feed text is untrusted, so everything that goes in as html is escaped here
  var esc = s => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
  var safeUrl = u => /^https?:\/\//.test(u || '') ? u : ''
  function dedupe(x){   // Substack feeds repeat the subtitle as the first body sentence (often truncated the second time)
    var m = /^(.{20,200}?[.?!]["”']?)\s+/.exec(x || '')
    if (!m) return x
    var rest = x.slice(m[0].length)
    return rest.slice(0, 30) == m[1].slice(0, 30) ? (rest.length > m[1].length ? rest : m[1]) : x
  }
  // expanded row: description (small type, a repeated lead sentence collapsed), co-guests as links, then the episode link
  function epDetail(e){
    // every guest of a multi-guest episode, in order; the selected one plain, the others switch the selection
    var keys = guestKeysOf(e)
    var others = keys.length > 1 ? keys.map(k => k == state.guest ? esc(guestMeta[k].name) : "<a class='p-glink' data-key='" + esc(k) + "'>" + esc(guestMeta[k].name) + '</a>') : []
    return "<div class='p-detail'>"
      + (e.x ? "<div class='t-sub'>" + esc(dedupe(e.x)) + '</div>' : '')
      + (others.length ? "<div class='t-body'>" + others.join(', ') + '</div>' : '')
      + (safeUrl(e.u) ? "<div class='t-axis'><a href='" + esc(e.u) + "' target='_blank' rel='noopener'>episode ↗</a></div>" : '')
      + '</div>'
  }
  // a row: ISO date, show abbreviation, title
  function rowHtml(e, cur){
    return "<li class='p-row" + (cur ? ' cur' : '') + "' data-ep='" + e.i + "'><span class='t-axis'>" + e.d + ' ' + esc(SHOWS[e.s].label) + "</span> <span class='t-body'>" + esc(e.t) + '</span>'
      + (cur ? epDetail(e) : '') + '</li>'
  }
  function renderPanel(){
    if (searching) return   // the typeahead owns the panel while the box has focus
    var html = ''
    var gm = state.guest && guestMeta[state.guest]
    var inList = gm && state.ep && gm.eps.indexOf(state.ep) > -1
    if (state.ep && !inList) html += '<ol class="p-list">' + rowHtml(state.ep, true) + '</ol>'   // episode outside the guest's list (or no guest): same expanded row
    if (gm){
      html += "<div class='p-guest'><ol class='p-list'>"
      gm.eps.slice().sort((a, b) => b.date - a.date).forEach(e => html += rowHtml(e, e === state.ep))
      html += '</ol>'
    }
    if (!html){ panel.classed('panel-hidden', true).html(''); return }
    panel.classed('panel-hidden', false).classed('long', false).html(html)
    var pn = panel.node(); panel.classed('long', pn.scrollHeight > pn.clientHeight)   // overflowing list: traps the wheel (css)
    showCur(pn)
  }
  // clicks inside the panel: a row selects that episode; a co-guest link switches guest (keeping the episode)
  panel.on('click', function(){
    var t = d3.event.target
    if (t.closest('a[href]')) return
    var g = t.closest('.p-glink'); if (g){ d3.event.stopPropagation(); lock(g.getAttribute('data-key'), state.ep); return }
    var r = t.closest('li.p-row'); if (r){ d3.event.stopPropagation(); var e = eps[+r.getAttribute('data-ep')]; lock(state.guest, e === state.ep ? null : e) }
  })

  // ---- pointer: the chart has 8k dots and no hit areas, so everything is nearest-dot against the raw coordinates ----
  var HIT_PX = isMobile ? 26 : 16    // a fat finger needs a wider catch than a cursor
  function nearestAt(m){
    var best = null, bestD = HIT_PX*HIT_PX
    eps.forEach(d => { var dx = d.px - m[0], dy = d.py - m[1], dd = dx*dx + dy*dy; if (dd < bestD){ bestD = dd; best = d } })
    return best
  }
  // a finger drags the selection along the dots without locking it (the phone's list sheet opens on its own)
  if (isMobile){
    c.svg.st({touchAction: 'none'})
      .on('touchstart touchmove', function(){
        var t = d3.touches(this)[0]
        if (!t) return
        d3.event.preventDefault()
        var d = nearestAt(t)
        if (d) select(guestOf(d), d)
      })
  }
  c.svg.append('rect').at({width: c.width, height: c.height, opacity: 0})   // an invisible catcher: mousemove needs a target across the whole plot
  c.svg
    .on('mousemove', function(){
      if (searching) endSearch()
      if (!hoverFollows()) return
      var d = nearestAt(d3.mouse(this))
      if (d && d !== state.ep) select(guestOf(d), d)    // between dots: keep the last one
    })
    .on('click', function(){
      d3.event.stopPropagation()
      var d = nearestAt(d3.mouse(this))
      if (!d){ unlock(); return }
      toggleLock(guestOf(d), d, d === state.ep)
    })
  d3.select(document).on('keydown.podtour', function(){
    if (d3.event.key != 'Escape') return
    if (searching){ endSearch(); return }   // the first Esc only closes the typeahead
    unlock()
  })
  d3.select(document).on('click.podtour', function(){
    if (d3.event.target.closest('.tour-chart, .tour-lead, .tour-cards')) return   // panel, cards, search: those set the state themselves
    if (isMobile && state.ep) select(state.guest, null)   // phone: tapping off the charts closes the episode sheet
    else unlock()
  })

  // ---- guest search: while typing, the panel itself becomes the (scrollable) list of matching guests ----
  var REGULAR_EPS = 3   // the default list: everyone the post would call a repeat guest
  function fold(s){ return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim() }
  var regulars = names.filter(g => g.eps.length >= REGULAR_EPS)
  console.log(regulars.length + ' guests with 3+ appearances (typeahead default list)')
  function showSuggest(q){
    // empty box: everyone with 3+ appearances, most-booked first; once typing: every match. rows reuse the episode list's .p-row
    var hits = q.length > 1 ? names.filter(g => fold(g.name).indexOf(q) > -1) : regulars
    searching = true
    panel.classed('panel-hidden', false).html('').node().scrollTop = 0
    panel.appendMany('button.p-row.sug', hits)
      .on('mousedown', g => { d3.event.preventDefault() })            // keep the input's blur from firing first
      .on('click', g => { searching = false; lock(g.key, null); d3.select('.guest-search').node().blur() })
      .each(function(g){
        var b = d3.select(this)
        b.append('span.t-body').text(g.name)
        var shows = d3.nestBy(g.eps, d => d.s).sort((a, b) => b.length - a.length)
          .map(s => SHOWS[s.key].short + (s.length > 1 ? ' ×' + s.length : '')).join(', ')
        b.append('span.t-sub').text(' ' + g.eps.length + ' · ' + shows)
      })
    if (!hits.length) panel.append('div.t-sub').text('no match')
  }
  function initTypeahead(){
    d3.select('.guest-search')
      .on('focus click', function(){ if (this.value){ this.value = ''; showSuggest('') } else if (!searching) showSuggest('') })   // any click (or the magnifier) clears
      .on('blur', function(){ searching = false; this.value = state.guest ? guestMeta[state.guest].name : ''; renderPanel() })
      .on('input', function(){
        var q = fold(this.value)
        var hit = names.filter(g => fold(g.name) == q)[0]
        // an exact name previews on the chart and cards only: renderAll would rewrite the box mid-word and move the URL
        if (hit && hit.key != state.guest){ setSel(hit.key, null); highlight([hit.key]); d3.selectAll('.mult-card').classed('on', t => t.key == hit.key) }
        showSuggest(q)
      })
      .on('keydown', function(){ if (d3.event.key == 'Enter'){ var q = fold(this.value), hit = names.filter(g => fold(g.name).indexOf(q) > -1)[0]; if (hit){ lock(hit.key, null); this.blur() } } })
  }
  initTypeahead()

  // ---- boot: a fixed 30-day window between stops; the URL wins, then Jasmine Sun ----
  computeTours(RUN_WINDOW_DAYS); restyle(); drawMultiples()
  // first load honours the URL; a redraw (resize, hot reload) keeps what was showing, if this data still has it
  var start = state.guest || state.ep ? state : stateFromUrl()
  if (!start.guest && !start.ep && guestMeta['jasmine|sun']) start = {guest: 'jasmine|sun', ep: null}
  select(start.guest, start.ep && eps[start.ep.i] === start.ep ? start.ep : null)   // a resize re-runs this with the old episode objects: keep one only if it is still ours
}

// house pattern: one file, re-running it (hot-server) redraws with whatever is already on window
window.init = function(){ drawTours(window.episodes); if (window.drawForce){ drawForce(window.episodes); window.restyleDots && window.restyleDots() }; if (window.drawRanks) drawRanks(window.episodes) }   // the force graph defines window.hostColor; the chart re-tints once it exists
window.DATA_V = '20260922a'   // bump when episodes.json changes so browsers refetch
if (!window.episodes){
  Promise.all([
    fetch('https://roadtolarissa.com/sketches/podcast/episodes.json?v=' + window.DATA_V).then(r => r.json()),
    fetch('notes.json?v=' + Date.now()).then(r => r.ok ? r.json() : {}).catch(() => ({})),    // {"Guest Name": "card text (html ok)"}
    fetch('colors.json?v=' + Date.now()).then(r => r.ok ? r.json() : {}).catch(() => ({})),   // {"Guest Name": "#hex"}
    fetch('labels.json?v=' + Date.now()).then(r => r.ok ? r.json() : {}).catch(() => ({})),   // {"Guest Name": [dx, dy]} force-graph labels, hand-placed
    fetch('positions.json?v=' + Date.now()).then(r => r.ok ? r.json() : {}).catch(() => ({})), // baked force-graph node positions
    fetch('shorts.json?v=' + Date.now()).then(r => r.ok ? r.json() : {}).catch(() => ({})),    // {"Full Name": "short label"} for the force graph
  ]).then(([eps, notes, colors, labels, positions, shorts]) => {
    window.episodes = eps; window.cardNotes = notes; window.guestColors = colors; window.guestLabels = labels; window.forcePositions = positions; window.guestShorts = shorts
    init()
  }).catch(e => { console.error(e); d3.select('.tour-chart').text('could not load episodes.json') })
} else init()

// widths are measured, not responsive css, so a resize has to redraw — debounced, and only when the width really moved
var rT, lastW = window.innerWidth
d3.select(window).on('resize.podtour', () => {
  if (window.innerWidth == lastW) return          // mobile scroll fires resize on height only
  lastW = window.innerWidth
  clearTimeout(rT); rT = setTimeout(() => window.episodes && init(), 150)
})
