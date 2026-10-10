var FORCE_OPT = new URLSearchParams(location.search)
var forcePortrait = null
function portraitData(){
  if (forcePortrait) return forcePortrait.data !== undefined ? forcePortrait.data : forcePortrait.wait
  var get = u => fetch(u + '?v=' + Date.now()).then(r => r.ok ? r.json() : null).catch(() => null)
  forcePortrait = {data: undefined}
  forcePortrait.wait = Promise.all([get('positions.mobile.json'), get('labels.mobile.json')])
    .then(r => forcePortrait.data = r[0] && r[0]._ref && r[1] ? {positions: r[0], labels: r[1]} : null)
  return forcePortrait.wait
}
window.drawForce = function(allEps){
  var t0 = performance.now()
  var SHOWS = {
    'ek-vox': 'Ezra Klein', 'impeachment': 'Ezra Klein', 'ek-nyt': 'Ezra Klein',
    'crazy-genius': 'Derek Thompson', 'plain-english': 'Derek Thompson',
    'odd-lots': 'Odd Lots',
    '538-politics': 'Nate Silver', 'risky-biz': 'Nate Silver', 'silver-bulletin': 'Nate Silver',
    'reply-all': 'PJ Vogt', 'crypto-island': 'PJ Vogt', 'search-engine': 'PJ Vogt',
    'hard-fork': 'Hard Fork', 'tyler': 'Tyler Cowen', 'dwarkesh': 'Dwarkesh', 'fresh-air': 'Fresh Air',
    'decoder': 'Decoder', 'interesting-times': 'Ross Douthat', 'the-argument': 'Ross Douthat', 'chinatalk': 'ChinaTalk', 'longform': 'Longform',
  }
  var SHORT_HOST = {'Ezra Klein': 'Ezra', 'Derek Thompson': 'Plain English', 'Odd Lots': 'Odd Lots', 'Nate Silver': 'Nate Silver', 'PJ Vogt': 'Search Engine', 'Hard Fork': 'Hard Fork', 'Tyler Cowen': 'CwT', 'Dwarkesh': 'Dwarkesh', 'Fresh Air': 'Fresh Air', 'Decoder': 'Decoder', 'Ross Douthat': 'Douthat', 'ChinaTalk': 'ChinaTalk', 'Longform': 'Longform'}
  var HOSTS = [
    ['Ezra Klein',     '#b8735a'],   // NYT Ezra Klein Show terracotta
    ['Derek Thompson', '#e8705f'],   // Plain English coral (was a light blue: too many blues and purples)
    ['Odd Lots',       '#4b2a8a'],   // Odd Lots purple
    ['Nate Silver',    '#00c832'],   // Silver Bulletin green
    ['PJ Vogt',        '#b74c38'],   // Search Engine rust
    ['Hard Fork',      '#c9cc22'],   // Hard Fork chartreuse
    ['Tyler Cowen',    '#1d839f'],   // Conversations with Tyler teal
    ['Dwarkesh',       '#6b4a3a'],   // Dwarkesh brown
    ['Fresh Air',      '#a8a196'],   // Fresh Air warm grey: the biggest cloud recedes so the small shows read (was NPR blue)
    ['Decoder',        '#48c8d0'],   // Decoder light cyan: far from the #f0f selection ring (was pink, too close to it; the art's lime is Hard Fork's)
    ['Ross Douthat',   '#1b1a6e'],   // Interesting Times navy
    ['ChinaTalk',      '#e0a640'],   // ChinaTalk gold
    ['Longform',       '#8b3a62'],   // Longform maroon: a clearly different hue from Fresh Air's warm grey (grey-brown and sage both read too close)
  ]
  var hostIdx = {}, hostColor = window.hostColor = {}
  window.showColor = {}; Object.keys(SHOWS).forEach(k => { HOSTS.forEach(h => { if (h[0] == SHOWS[k]) window.showColor[k] = h[1] }) })
  HOSTS.forEach((h, i) => { hostIdx[h[0]] = i; hostColor[h[0]] = h[1] })

  var SCENE = window.forceScene || null, sceneOf = {}, scenePos = null
  if (SCENE){
    var laneShow = HOSTS.map(h => Object.keys(SHOWS).filter(k => SHOWS[k] == h[0])[0])
    var laneOfHost = {}; HOSTS.forEach((h, k) => laneOfHost[h[0]] = laneShow[k])
    allEps = []; scenePos = {_ref: (SCENE.canvas || [1000, 540]).slice()}
    SCENE.nodes.forEach((s, i) => {
      var shows = s.shows && s.shows.length ? s.shows.map(h => laneOfHost[h] || h) : null
      var nh = shows ? shows.length : Math.max(1, s.hosts || 1), ne = Math.max(3, s.eps || nh)
      for (var e = 0; e < ne; e++) allEps.push({g: [s.name], s: shows ? shows[e % nh] : laneShow[(i + e % nh) % laneShow.length],
        d: (2020 + Math.floor(e/12)) + '-' + ('0' + (e % 12 + 1)).slice(-2) + '-01'})
      sceneOf[s.name] = s; scenePos[s.key || guestKey(s.name)] = [s.x, s.y]
    })
  }
  var POS = SCENE ? scenePos : window.forcePositions

  var eps = allEps.filter(d => d.d >= '2016-01-01' && SHOWS[d.s] && !d.r)
  eps.forEach(d => d.date = d.date || new Date(d.d + 'T12:00:00Z'))
  var laneOf = d => SHOWS[d.s]

  function guestKey(g){
    var p = g.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\./g, '').toLowerCase().split(/\s+/)
      .filter(t => !/^(jr|sr|ii|iii|iv)$/.test(t))
    return p[0] + '|' + p[p.length - 1]
  }
  var byGuest = {}
  eps.forEach(d => (d.g || []).forEach(g => {
    var k = guestKey(g), o = byGuest[k] = byGuest[k] || {key: k, name: '', eps: []}
    if (g.length > o.name.length) o.name = g
    if (o.eps.indexOf(d) < 0) o.eps.push(d)
  }))
  var LABEL_HOSTS = 3
  var nodes = Object.values(byGuest).filter(o => o.eps.length >= 3)
  nodes.forEach(n => {
    n.eps.sort((a, b) => a.date - b.date)
    n.v = HOSTS.map(() => 0)
    n.eps.forEach(d => n.v[hostIdx[laneOf(d)]]++)
    n.norm = Math.sqrt(d3.sum(n.v, x => x*x))
    n.n = n.eps.length
    n.hosts = d3.nestBy(n.eps, laneOf).sort((a, b) => b.length - a.length)
    n.main = n.hosts[0].key
  })
  nodes.sort((a, b) => b.n - a.n || (a.name < b.name ? -1 : 1))
  nodes.forEach((n, i) => n.i = i)

  var TH = 0.5, K = 6
  var hash = (i, j) => ((i*73856093) ^ (j*19349663)) % 1000 / 1e6   // deterministic tiebreak among identical vectors
  var cand = nodes.map(() => [])
  for (var i = 0; i < nodes.length; i++) for (var j = i + 1; j < nodes.length; j++){
    var a = nodes[i], b = nodes[j], s = 0
    for (var h = 0; h < a.v.length; h++) s += a.v[h]*b.v[h]
    var c = s/(a.norm*b.norm)
    if (c >= TH){ cand[i].push([j, c, c + hash(i, j)]); cand[j].push([i, c, c + hash(i, j)]) }
  }
  var seen = {}, links = []
  cand.forEach((l, i) => {
    nodes[i].top = l.sort((a, b) => b[2] - a[2]).slice(0, K).map(e => nodes[e[0]])
    nodes[i].top.forEach(m => {
      var id = i < m.i ? i + '-' + m.i : m.i + '-' + i
      if (seen[id]) return
      seen[id] = 1; links.push({source: i, target: m.i, c: l.filter(e => e[0] == m.i)[0][1]})
    })
  })

  var coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches
  var isMobile = (coarse || window.innerWidth <= 640) && !SCENE
  var PORTRAIT = (isMobile && window.innerWidth <= 640 || FORCE_OPT.has('portrait')) && !SCENE && !FORCE_OPT.has('nobake') ? portraitData() : null
  if (PORTRAIT && PORTRAIT.then){ PORTRAIT.then(() => window.drawForce(allEps)); return }
  if (PORTRAIT) POS = PORTRAIT.positions
  var sel = d3.select('.tour-force').html('')
  var width = sel.node().getBoundingClientRect().width || 900, boxW = width
  var height = isMobile ? Math.round(width*1.15) : Math.round(Math.min(width*.5, 480))
  var fixed = !FORCE_OPT.has('nobake') && POS && POS._ref
  if (fixed){ width = POS._ref[0]; height = POS._ref[1] }
  var px = fixed ? boxW/width : 1                 // screen px per layout unit
  var scale = isMobile && !fixed ? .68 : 1
  var showLabels = !isMobile || PORTRAIT || (fixed && 10*px >= 8)
  var DOT = 2.2*scale

  var step = DOT*2.1, shapeCache = {}
  function shape(k){
    if (shapeCache[k]) return shapeCache[k]
    var cells = [], seen = {}, add = c => { cells.push(c); seen[c.q + ',' + c.r] = 1 }
    var xy = c => ({x: step*(c.q + c.r/2), y: step*c.r*Math.sqrt(3)/2})
    var neigh = c => [[1,0],[-1,0],[0,1],[0,-1],[1,-1],[-1,1]].map(d => ({q: c.q + d[0], r: c.r + d[1]}))
    add({q: 0, r: 0})
    while (cells.length < k){
      var cand = [], cx = d3.mean(cells, c => xy(c).x), cy = d3.mean(cells, c => xy(c).y)
      cells.forEach(c => neigh(c).forEach(m => { if (!seen[m.q + ',' + m.r]){ var p = xy(m); cand.push({c: m, d: Math.hypot(p.x - cx, p.y - cy)}) } }))
      add(cand.sort((a, b) => a.d - b.d)[0].c)
    }
    var pts = cells.map(xy), mx = d3.mean(pts, p => p.x), my = d3.mean(pts, p => p.y)
    pts = pts.map(p => ({x: p.x - mx, y: p.y - my})).sort((a, b) => Math.atan2(a.y, a.x) - Math.atan2(b.y, b.x))
    return shapeCache[k] = {pts: pts, r: d3.max(pts, p => Math.hypot(p.x, p.y))}
  }
  nodes.forEach(n => {
    var order = {}; n.hosts.forEach((h, i) => order[h.key] = i)
    var eps = n.eps.slice().sort((a, b) => order[laneOf(a)] - order[laneOf(b)] || a.date - b.date)
    var sh = shape(eps.length)
    n.dots = eps.map((d, i) => ({x: sh.pts[i].x, y: sh.pts[i].y, r: DOT, host: laneOf(d), d: d}))
    n.r = sh.r + DOT + .2*scale
  })
  if (SCENE) nodes.forEach(n => { var s = sceneOf[n.name]; if (!s) return
    if (s.key) n.key = s.key
    if (s.r) n.r = s.r })

  var svg = sel.append('svg').at({width: width, height: height})
  if (fixed) svg.attr('viewBox', '0 0 ' + width + ' ' + height).classed('fixed', true)   // style.css: width 100%, height auto, capped so it stays ≤ 480px tall
  var nodeG = svg.append('g'), hostG = svg.append('g'), labelG = svg.append('g')

  var cloud = {}
  function cloudsOf(){
    var out = {}
    HOSTS.forEach(h => {
      var pure = nodes.filter(n => n.main == h[0] && n.hosts.length == 1)
      if (pure.length < 3) pure = nodes.filter(n => n.main == h[0] && n.hosts.length < LABEL_HOSTS)
      if (pure.length) out[h[0]] = {x: d3.mean(pure, n => n.x), y: d3.mean(pure, n => n.y), n: pure.length, nodes: pure}
    })
    return out
  }
  if (fixed){
    var ref = POS._ref, s = Math.min(width/ref[0], height/ref[1]), ox = (width - ref[0]*s)/2, oy = (height - ref[1]*s)/2
    nodes.forEach(n => { var p = POS[n.key]; if (p){ n.x = ox + p[0]*s; n.y = oy + p[1]*s } else { n.x = width/2; n.y = height/2 } })
    var fit = 1
  } else {
    var nativeRandom = Math.random, seed = 20260920
    Math.random = () => { seed = (seed*1664525 + 1013904223) % 4294967296; return seed/4294967296 }
    var inner = nodes.filter(n => n.hosts.length < LABEL_HOSTS)
    var R0 = Math.sqrt(d3.sum(inner, n => n.r*n.r)/.86)      // hex-ish packing density
    var ringR = h => h == LABEL_HOSTS ? R0 - 10*scale : R0 + 70*scale + 50*scale*(h - LABEL_HOSTS - 1)
    nodes.forEach(n => { n.ax = width/2; n.ay = height/2 })   // inner disc: no angle target (strength 0), but forceX/Y must not see undefined
    d3.nestBy(nodes.filter(n => n.hosts.length >= LABEL_HOSTS), n => n.hosts.length).forEach(ring => {
      var r = ringR(+ring.key)
      ring.sort((a, b) => hostIdx[a.main] - hostIdx[b.main] || b.n - a.n).forEach((n, i) => { var a = i/ring.length*2*Math.PI - Math.PI/2; n.ax = width/2 + r*Math.cos(a); n.ay = height/2 + r*Math.sin(a) })
    })
    var sim = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).distance(l => l.source.r + l.target.r + 10*scale).strength(l => .2 + .5*(l.c - TH)/(1 - TH)))
      .force('charge', d3.forceManyBody().strength(-1.5*scale*scale).distanceMax(40*scale))   // barely any: collision does the packing, shells touch
      .force('collide', d3.forceCollide(n => n.r).iterations(4))
      .force('x', d3.forceX(width/2).strength(.02))
      .force('radial', d3.forceRadial(n => n.hosts.length >= LABEL_HOSTS ? ringR(n.hosts.length) : 0, width/2, height/2).strength(n => n.hosts.length == LABEL_HOSTS ? 1 : n.hosts.length > LABEL_HOSTS ? .6 : .08))
      .force('ax', d3.forceX(n => n.ax).strength(n => n.hosts.length >= LABEL_HOSTS ? .3 : 0))
      .force('ay', d3.forceY(n => n.ay).strength(n => n.hosts.length >= LABEL_HOSTS ? .3 : 0))
      .force('y', d3.forceY(height/2).strength(.02*Math.pow(width/height, 1.6)))   // a little flatter than the box's own aspect so the blob fills its width
      .stop()
    nodes.forEach(n => { var a = hostIdx[n.main]/HOSTS.length*2*Math.PI; n.x = width/2 + Math.cos(a)*width*.3 + (hash(n.i, 7)*4e4 % 40); n.y = height/2 + Math.sin(a)*height*.3 + (hash(n.i, 11)*4e4 % 40) })
    for (var k = 0; k < 300; k++) sim.tick()

    cloud = cloudsOf()
    nodes.forEach(n => {
      var tot = 0, cx = 0, cy = 0
      n.hosts.forEach(h => { var c = cloud[h.key]; if (c){ tot += h.length; cx += h.length*c.x; cy += h.length*c.y } })
      n.tx = tot ? cx/tot : n.x; n.ty = tot ? cy/tot : n.y
    })
    var mixed = n => Math.min(.5, .12*(n.hosts.length - 1))
    sim.force('link').strength(l => (.2 + .5*(l.c - TH)/(1 - TH))*(l.source.hosts.length > 1 || l.target.hosts.length > 1 ? .3 : 1))   // a tourist's springs give way to the pull
      .distance(l => l.source.r + l.target.r + 10*scale)
    sim.force('tx', d3.forceX(n => n.tx).strength(mixed)).force('ty', d3.forceY(n => n.ty).strength(mixed)).alpha(.6)
    for (k = 0; k < 600; k++) sim.tick()

    var core = nodes.filter(n => n.hosts.length <= LABEL_HOSTS)
    var pad = 8, x0 = d3.min(core, n => n.x - n.r), x1 = d3.max(core, n => n.x + n.r), y0 = d3.min(core, n => n.y - n.r), y1 = d3.max(core, n => n.y + n.r)
    var fit = Math.min((width - 2*pad)/(x1 - x0), (height - 2*pad)/(y1 - y0))*.74   // disc + rim take ~3/4 of the height; floaters and labels spread through the wide field around it
    nodes.forEach(n => { n.x = width/2 + (n.x - (x0 + x1)/2)*fit; n.y = height/2 + (n.y - (y0 + y1)/2)*fit })
    if (fit != 1){
      sim.force('link', null).force('charge', null).force('x', null).force('y', null).force('tx', null).force('ty', null).alpha(.3)
      for (k = 0; k < 40; k++) sim.tick()
      nodes.forEach(n => { n.x = Math.max(pad + n.r, Math.min(width - pad - n.r, n.x)); n.y = Math.max(pad + n.r, Math.min(height - pad - n.r, n.y)) })
    }
    sim.force('link', null).force('charge', null).force('x', d3.forceX(width/2).strength(n => n.hosts.length >= LABEL_HOSTS + 1 ? 0 : .01)).force('y', d3.forceY(height/2).strength(n => n.hosts.length >= LABEL_HOSTS + 1 ? 0 : .01)).force('tx', null).force('ty', null).force('ax', null).force('ay', null).alpha(.5).alphaDecay(.01)
    for (k = 0; k < 300; k++) sim.tick()
    Math.random = nativeRandom
  }
  var layoutMs = Math.round(performance.now() - t0)

  var nodeSel = nodeG.appendMany('g.node', nodes).translate(n => [n.x, n.y])
  nodeSel.append('circle.shell').at({r: n => n.r}).style('stroke', null)
  nodeSel.each(function(n){
    d3.select(this).appendMany('circle.dot', n.dots).at({cx: d => d.x, cy: d => d.y, r: d => d.r, fill: d => hostColor[d.host]})
  })

  var LABEL = {top: 10, line1: 12, lineH: 11, dy: 11, ring0: 2, ringStep: 7, clear: 7, gap: 5, word: 5, minDrawn: 4, ambig: 6, edge: 4}
  var GEO_VERSION = 7
  var anchorX = (x, anchor, w) => anchor == 'start' ? x : anchor == 'end' ? x - w : x - w/2
  var labelBox = (x, y, anchor, w, lines, ws) => { lines = lines || 1
    var b = {x: anchorX(x, anchor, w), y: y - LABEL.top, w: w, h: LABEL.line1 + LABEL.lineH*(lines - 1)}
    if (ws && ws.length > 1) b.rows = ws.map((wi, i) => ({x: anchorX(x, anchor, wi), y: i ? b.y + LABEL.line1 + LABEL.lineH*(i - 1) : b.y,
      w: wi, h: i ? LABEL.lineH : LABEL.line1}))
    return b }
  var baselineY = (cy, sinA, lines) => cy + (sinA > .4 ? LABEL.top : sinA < -.4 ? -2 - LABEL.lineH*(lines - 1) : 3 - LABEL.lineH/2*(lines - 1))
  var splitsOf = t => { var words = t.split(' '); return words.length < 2 ? [words] : d3.range(1, words.length).map(k => [words.slice(0, k).join(' '), words.slice(k).join(' ')]) }
  var splitLines = t => { var s = splitsOf(t); return s[s.length - 1] }
  var sideOf = (n, y, lines) => { var top = y - LABEL.top, bot = top + LABEL.line1 + LABEL.lineH*((lines || 1) - 1); return bot <= n.y ? -1 : top >= n.y ? 1 : 0 }
  var CUT_WIDE = 1.25
  function shapeOf(text, widthOf){
    var all = splitsOf(text).map(ls => { var ws = ls.map(l => +widthOf(l).toFixed(2)); return {lines: ls, ws: ws, w: Math.max.apply(null, ws), cut: ls[0].split(' ').length} })
    var def = all[all.length - 1], v = {0: def}
    var narrow = all.reduce((a, o) => o.w < a.w - 1e-9 ? o : a, def)
    ;[-1, 1].forEach(side => { var ok = all.filter(o => o.ws.length < 2 || (side < 0 ? o.ws[1] <= o.ws[0] : o.ws[0] <= o.ws[1]))
      var pick = ok.length ? ok.reduce((a, o) => o.w < a.w - 1e-9 ? o : a, ok.indexOf(def) >= 0 ? def : ok[0]) : def
      v[side] = pick.w > CUT_WIDE*narrow.w ? narrow : pick })
    if (def.lines.length > 1){ var w1 = +widthOf(text).toFixed(2); v.one = {lines: [text], ws: [w1], w: w1, cut: text.split(' ').length} }
    return {lines: def.lines.length, w: Math.max(v[-1].w, v[0].w, v[1].w), v: v}
  }
  var oneFits = (w, x, anchor) => { var x0 = anchorX(x, anchor, w); return x0 >= LABEL.edge && x0 + w <= width - LABEL.edge }
  var boxOf = (n, m, x, y, anchor) => { var sd = sideOf(n, y, m.lines), one = !sd && m.v && m.v.one && oneFits(m.v.one.w, x, anchor), sh = one ? m.v.one : (m.v && m.v[sd]) || m
    var lines = one ? 1 : m.lines
    return Object.assign(labelBox(x, y, anchor, sh.w, lines, sh.ws), {n: n, side: sd, lines: lines, sh: sh}) }
  var textTop = 0
  function measureLabels(list, keepTop){
    var out = {}, g = labelG.append('g.measure'), strs = {}, el = {}
    list.forEach(o => { strs[o.text] = 1; splitsOf(o.text).forEach(ls => ls.forEach(l => strs[l] = 1)) })
    Object.keys(strs).forEach(l => el[l] = g.append('text.t-sub.perm.halo').text(l))   // all in, then one layout for every read
    var wOf = {}; Object.keys(el).forEach(l => wOf[l] = el[l].node().getComputedTextLength())
    list.forEach((o, k) => { out[o.key] = shapeOf(o.text, l => wOf[l])
      if (!k && !keepTop){ var bb = el[splitLines(o.text)[0]].node().getBBox(); textTop = Math.max(0, Math.min(2, LABEL.top + bb.y)) } })
    g.remove()
    return out
  }
  var geoEntry = sh => { var e = o => ({w: o.w, ws: o.ws, cut: o.cut}), d = sh.v[0], out = {w: d.w, lines: sh.lines}
    if (sh.lines > 1){ Object.assign(out, {ws: d.ws, cut: d.cut})
      if (sh.v[-1].cut != d.cut) out.above = e(sh.v[-1]); if (sh.v[1].cut != d.cut) out.below = e(sh.v[1])
      if (sh.v.one) out.one = {w: sh.v.one.w} }
    return out }

  var DEFAULTS = {
    pipeline: 'greedy+repair+anneal+tighten+swap+compact',
    cost: {fb: 1, bb: 5, sl: 1, ew: 24, sw: 1e6, pw: 4, xw: 400, nw: 400, lhw: 400, rw: .6, cw: 2, aw: .6, lw: 1, kw: 40, gw: 20,
           hard: 1e6, missw: 1e5, ambw: 20, lenw: .04, floatw: 40, fw: 20, tw: 8, stw: 300, rcw: 6,
           hw: 400,
           ow: 80, skw: 8,
           ocw: .25, rrw: .8, iw: 40,
           exw: 4},
    search: {passes: 6, hood: 5, ords: 6, kk: 12, fullr: 18, corr: 60,
             k: 40, moves: 400000, t0: 6, t1: .05, swapp: .2, rounds: 4, restarts: 3, tr: .35,
             near: 140, sep: 8, kall: 1500, swtol: 14, saseed: 3, edge: LABEL.edge, rimx: 16,
             knot: 8, knotr: 100, knotn: 400000,
             elevMax: 37, leadMax: 26,
             rimfine: 80, knotord: 1,
             knotlead: 24,
             ledstep: 1,
             corner: 1,
             octol: 3, row1: 8,
             arck: 40}
  }
  var GREEDY_COST = {nw: 12, lhw: 10, rcw: 0}
  function resolveParams(defs, inject, url){
    var out = {pipeline: String(defs.pipeline)}, groupOf = {}
    Object.keys(defs).forEach(g => { if (g == 'pipeline') return
      out[g] = Object.assign({}, defs[g]); Object.keys(defs[g]).forEach(k => groupOf[k] = g) })
    var set = (k, v) => { if (k == 'pipeline'){ out.pipeline = String(v); return }
      if (!groupOf[k]) throw new Error('unknown force param: ' + k)
      out[groupOf[k]][k] = +v }
    if (inject) Object.keys(inject).forEach(k => set(k, inject[k]))
    url.forEach((v, k) => { if (groupOf[k]) set(k, v) })
    return out
  }
  var forceParams = window.forceParams || null
  var PIPELINE = DEFAULTS.pipeline
  if (forceParams && forceParams.pipeline) PIPELINE = String(forceParams.pipeline)
  if (FORCE_OPT.has('search')) PIPELINE = FORCE_OPT.get('search')   // §S: ?search=greedy, ?search=greedy+repair
  if (FORCE_OPT.has('sa')) PIPELINE = +FORCE_OPT.get('sa') ? DEFAULTS.pipeline : 'greedy+repair+tighten+swap+compact'
  var STRATEGY_NAMES = ['none', 'greedy', 'repair', 'anneal', 'tighten', 'swap', 'compact']
  var unknownPasses = PIPELINE.split('+').map(s => s.trim()).filter(s => s && STRATEGY_NAMES.indexOf(s) < 0)
  if (unknownPasses.length){ console.warn('force: unknown search pass ' + unknownPasses.join('+') + ' — falling back to ' + DEFAULTS.pipeline); PIPELINE = DEFAULTS.pipeline }
  var PARAMS = resolveParams(Object.assign({}, DEFAULTS, {pipeline: PIPELINE,
    cost: PIPELINE.indexOf('anneal') < 0 ? Object.assign({}, DEFAULTS.cost, GREEDY_COST) : DEFAULTS.cost}), forceParams, FORCE_OPT)

  var placed = []
  var rowsOf = b => b.rows || [b]
  var hit1 = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h
  var hit = (a, b) => { if (!a.rows && !b.rows) return hit1(a, b); if (!hit1(a, b)) return false
    var A = rowsOf(a), B = rowsOf(b); for (var i = 0; i < A.length; i++) for (var j = 0; j < B.length; j++) if (hit1(A[i], B[j])) return true; return false }
  var covers = (box, skipHost) => nodes.filter(n => n.main != skipHost && hit(box, {x: n.x - n.r, y: n.y - n.r, w: 2*n.r, h: 2*n.r})).length
  var boxDist1 = (box, m) => Math.max(0, Math.hypot(Math.max(box.x - m.x, 0, m.x - (box.x + box.w)), Math.max(box.y - m.y, 0, m.y - (box.y + box.h))) - m.r)
  var boxDist = (box, m) => box.rows ? Math.min.apply(null, box.rows.map(r => boxDist1(r, m))) : boxDist1(box, m)
  var segBox1 = (a, b, box) => { for (var t = 0; t <= 1; t += .05){ var x = a[0] + (b[0] - a[0])*t, y = a[1] + (b[1] - a[1])*t; if (x > box.x && x < box.x + box.w && y > box.y && y < box.y + box.h) return true } return false }
  var segBox = (a, b, box) => box.rows ? box.rows.some(r => segBox1(a, b, r)) : segBox1(a, b, box)
  var LEGPAD = 2.5
  var legBox = (A, B, box) => box.rows ? box.rows.some(r => legBox1(A, B, r)) : legBox1(A, B, box)
  var legBox1 = (A, B, box) => { var x0 = box.x - LEGPAD, y0 = box.y - LEGPAD, x1 = box.x + box.w + LEGPAD, y1 = box.y + box.h + LEGPAD
    if (Math.min(A[0], B[0]) >= x1 || Math.max(A[0], B[0]) <= x0 || Math.min(A[1], B[1]) >= y1 || Math.max(A[1], B[1]) <= y0) return false
    var t0 = 0, t1 = 1, dx = B[0] - A[0], dy = B[1] - A[1], p = [-dx, dx, -dy, dy], q = [A[0] - x0, x1 - A[0], A[1] - y0, y1 - A[1]]
    for (var i = 0; i < 4; i++){ if (p[i] === 0){ if (q[i] <= 0) return false; continue }
      var r = q[i]/p[i]; if (p[i] < 0){ if (r > t1) return false; if (r > t0) t0 = r } else { if (r < t0) return false; if (r < t1) t1 = r } }
    return t1 > t0 ? (t1 - t0)*Math.hypot(dx, dy) : 0 }
  var segCircle = (A, B, m) => { var dx = B[0] - A[0], dy = B[1] - A[1], L2 = dx*dx + dy*dy || 1, t = Math.max(0, Math.min(1, ((m.x - A[0])*dx + (m.y - A[1])*dy)/L2)); return Math.hypot(m.x - (A[0] + t*dx), m.y - (A[1] + t*dy)) < m.r }
  var segSeg = (a, b, c, d) => { var o = (p, q, r) => Math.sign((q[0] - p[0])*(r[1] - p[1]) - (q[1] - p[1])*(r[0] - p[0])); return o(a, b, c) != o(a, b, d) && o(c, d, a) != o(c, d, b) && o(a, b, c) != 0 && o(c, d, a) != 0 }
  var legsOf = q => [[q.s, q.e], [q.e, q.a]]
  var LEGTOUCH = 2.5
  var ptSeg = (p, a, b) => { var dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx*dx + dy*dy, t = L2 ? Math.max(0, Math.min(1, ((p[0] - a[0])*dx + (p[1] - a[1])*dy)/L2)) : 0
    return Math.hypot(p[0] - (a[0] + t*dx), p[1] - (a[1] + t*dy)) }
  var legLen = G => Math.hypot(G[1][0] - G[0][0], G[1][1] - G[0][1])
  var legsMeet = (A, B) => { if (legLen(A) < .01 || legLen(B) < .01) return false
    if (Math.min(A[0][0], A[1][0]) - LEGTOUCH > Math.max(B[0][0], B[1][0]) || Math.min(B[0][0], B[1][0]) - LEGTOUCH > Math.max(A[0][0], A[1][0]) ||
        Math.min(A[0][1], A[1][1]) - LEGTOUCH > Math.max(B[0][1], B[1][1]) || Math.min(B[0][1], B[1][1]) - LEGTOUCH > Math.max(A[0][1], A[1][1])) return false
    return segSeg(A[0], A[1], B[0], B[1]) || Math.min(ptSeg(A[0], B[0], B[1]), ptSeg(A[1], B[0], B[1]), ptSeg(B[0], A[0], A[1]), ptSeg(B[1], A[0], A[1])) < LEGTOUCH }
  var PARTOL = 11
  var PARNEAR = 7
  var parK = d => d <= PARNEAR ? 10 : 1 + 9*(PARTOL - d)/(PARTOL - PARNEAR)
  var parallelLegs = (L, M) => { var v = Math.abs(L[0][0] - L[1][0]) < .5, h = Math.abs(L[0][1] - L[1][1]) < .5; if (!v && !h) return 0
    var mv = Math.abs(M[0][0] - M[1][0]) < .5, mh = Math.abs(M[0][1] - M[1][1]) < .5, k = 0
    if (v && mv && Math.abs(L[0][0] - M[0][0]) < PARTOL && Math.min(Math.max(L[0][1], L[1][1]), Math.max(M[0][1], M[1][1])) - Math.max(Math.min(L[0][1], L[1][1]), Math.min(M[0][1], M[1][1])) > 8) k += parK(Math.abs(L[0][0] - M[0][0]))
    if (h && mh && Math.abs(L[0][1] - M[0][1]) < PARTOL && Math.min(Math.max(L[0][0], L[1][0]), Math.max(M[0][0], M[1][0])) - Math.max(Math.min(L[0][0], L[1][0]), Math.min(M[0][0], M[1][0])) > 8) k += parK(Math.abs(L[0][1] - M[0][1]))
    return k }

  var hostInfo = {}
  cloud = cloudsOf()
  HOSTS.forEach(h => {
    if (!FORCE_OPT.has('hostnames')) return
    var c = cloud[h[0]]
    if (!c) return
    var spread = d3.median(c.nodes, n => Math.hypot(n.x - c.x, n.y - c.y)), packed = Math.sqrt(c.n)*8*scale
    hostInfo[h[0]] = {pure: c.n, spread: Math.round(spread), packed: Math.round(packed)}
    if (c.n < 4 || spread > Math.max(60*scale, 2*packed)) return
    var g = hostG.append('g.host')
    var t = g.append('text.t-axis.halo').text(SHORT_HOST[h[0]] || h[0]).style('fill', h[1]).style('font-weight', 600)
    var w = t.node().getComputedTextLength() + 2, best = null
    var R = Math.min(40*scale, Math.max(10, Math.round(spread/5)*5))
    for (var dy = -R; dy <= R; dy += 5) for (var dx = -R; dx <= R; dx += 5){
      var box = labelBox(c.x + dx, c.y + dy, 'middle', w, 1)   // §G
      if (box.x < 2 || box.x + w > width - 2) continue
      var score = covers(box, h[0])*6 + Math.hypot(dx, dy) + (placed.some(p => hit(box, p)) ? 1e4 : 0)
      if (!best || score < best.score) best = {score, x: c.x + dx, y: c.y + dy + 3, box}
    }
    t.at({x: best.x, y: best.y, textAnchor: 'middle'})
    placed.push(Object.assign(best.box, {host: 1, name: '#host:' + (SHORT_HOST[h[0]] || h[0])}))
  })

  if (showLabels){
    var hand = FORCE_OPT.has('nolabels') ? {} : SCENE ? (SCENE.labels || {}) : PORTRAIT ? PORTRAIT.labels : (window.guestLabels || {}), byName = {}; nodes.forEach(n => byName[n.name] = n)
    var leaderG = labelG.append('g.leaders').lower()
    var GC = 40, RMAX = d3.max(nodes, m => m.r) + 1, ngrid = {}; nodes.forEach(m => { var k = Math.floor(m.x/GC) + ',' + Math.floor(m.y/GC); (ngrid[k] = ngrid[k] || []).push(m) })
    var nearNodes = (x1, y1, x2, y2) => { var out = [], r = RMAX; for (var i = Math.floor((Math.min(x1, x2) - r)/GC); i <= Math.floor((Math.max(x1, x2) + r)/GC); i++) for (var j = Math.floor((Math.min(y1, y2) - r)/GC); j <= Math.floor((Math.max(y1, y2) + r)/GC); j++){ var g = ngrid[i + ',' + j]; if (g) for (var t = 0; t < g.length; t++) out.push(g[t]) } return out }
    var segHits0 = (x1, y1, x2, y2) => nearNodes(x1, y1, x2, y2).reduce((k, m) => {
      var dx = x2 - x1, dy = y2 - y1, L2 = dx*dx + dy*dy || 1, t = Math.max(0, Math.min(1, ((m.x - x1)*dx + (m.y - y1)*dy)/L2))
      return k + (Math.hypot(m.x - (x1 + t*dx), m.y - (y1 + t*dy)) < m.r ? 1 : 0)
    }, 0)
    var segMemo = new Map()
    var segHits = (x1, y1, x2, y2) => { var key = x1 + ',' + y1 + ',' + x2 + ',' + y2, v = segMemo.get(key)
      if (v === undefined){ v = segHits0(x1, y1, x2, y2); segMemo.set(key, v) } return v }
    var nearMemo = new Map()
    var nodeNear = (n, B) => { var key = n.i + ',' + B.x + ',' + B.y + ',' + B.w + ',' + B.h + (B.rows ? B.rows.map(r => ';' + r.x + ',' + r.y + ',' + r.w + ',' + r.h).join('') : ''), v = nearMemo.get(key)
      if (v !== undefined) return v
      var d0 = boxDist(B, n), near = nearNodes(B.x - d0 - 7, B.y - d0 - 7, B.x + B.w + d0 + 7, B.y + B.h + d0 + 7)
      v = (near.some(m => m !== n && boxDist(B, m) < d0 + 7) ? 1 : 0) | (near.some(m => m !== n && boxDist(B, m) < 4) ? 2 : 0)
      nearMemo.set(key, v); return v }
    var segLabelHits = (a, b, self) => placed.reduce((k, box) => k + (box.n !== self && legBox(a, b, box) ? 1 : 0), 0)
    function leaderPath(n, x, y, anchor, m){ var P = leaderPath1(n, x, y, anchor, m); if (P) P.n0 = n; return P }
    function leaderPath1(n, x, y, anchor, m){
      var B = boxOf(n, m, x, y, anchor), bx = B.x, by = B.y, bw = B.w, bh = B.h, R = rowsOf(B), sd = B.side, span = n.r - 1.5 + 1e-6
      var mids = R.map((r, i) => by + LABEL.top - 3 + LABEL.dy*i), ax = bx + bw/2, ay = by + bh/2, off = 0, en = 0, e = null, mid = null
      if (sd){ var nr = R[sd < 0 ? R.length - 1 : 0]
        ax = Math.max(nr.x - 1, Math.min(nr.x + nr.w + 1, n.x)); ay = sd < 0 ? by + bh + 1 : by - 1; off = Math.abs(ax - n.x); en = Math.abs(ax - nr.x - nr.w/2)
        if (off > span){ if (anchor == 'middle'){ ax = nr.x + nr.w/2; e = [ax, n.y] } else { ax = n.x < nr.x ? nr.x - 1 : nr.x + nr.w + 1; ay = mids[sd < 0 ? R.length - 1 : 0]; e = [n.x, ay] } } }
      else if (n.x < bx || n.x > bx + bw){ var k = 0; mids.forEach((v, i) => { if (Math.abs(n.y - v) < Math.abs(n.y - mids[k])) k = i })
        ax = n.x < bx ? R[k].x - 1 : R[k].x + R[k].w + 1; mid = mids[k]; ay = Math.max(mid - 3.5, Math.min(mid + 3, n.y)); off = Math.abs(ay - n.y); en = Math.abs(ay - mid)
        if (off > span){ ay = mid; e = [n.x, ay] } }
      else e = [n.x, ay]
      var nb2 = nodeNear(n, B), amb = nb2 & 1, touch = nb2 & 2
      var under = Math.abs(bx + bw/2 - n.x) < 4 && Math.hypot(ax - n.x, ay - n.y) < n.r + 30 && !touch
      if (!rim[n.i] && (under || (Math.hypot(ax - n.x, ay - n.y) < n.r + 12 && !amb))) return null
      if (!e){ var o1 = Math.sqrt(Math.max(0, n.r*n.r - off*off)) + 1, s0 = sd ? [ax, n.y + (ay > n.y ? o1 : -o1)] : [n.x + (ax > n.x ? o1 : -o1), ay]
        var nh = segHits(s0[0], s0[1], ax, ay), lh = segLabelHits(s0, [ax, ay], n)
        return {s: s0, e: [ax, ay], a: [ax, ay], kind: sd ? 'vert' : 'horiz', off: off, en: en, mid: mid, nodeHits: nh, labelHits: lh, hits: nh + lh} }
      var dx = e[0] - n.x, dy = e[1] - n.y, L = Math.hypot(dx, dy) || 1
      var nh2 = segHits(n.x, n.y, e[0], e[1]) + segHits(e[0], e[1], ax, ay) - 1, lh2 = segLabelHits([n.x, n.y], e, n) + segLabelHits(e, [ax, ay], n)
      var p = {s: [n.x + dx/L*(n.r + 1), n.y + dy/L*(n.r + 1)], e: e, a: [ax, ay], kind: 'elbow', nodeHits: nh2, labelHits: lh2, hits: nh2 + lh2}
      p.hook = legsOf(p).some(G => rowsOf(B).some(r => legBox1(G[0], G[1], r) > 4)) ? 1 : 0
      var l1 = Math.hypot(p.e[0] - p.s[0], p.e[1] - p.s[1]), l2 = Math.hypot(ax - e[0], ay - e[1])
      p.kink = (p.e[0] - p.s[0])*dx + (p.e[1] - p.s[1])*dy < 0 || Math.min(l1, l2) < 4 || l1 + l2 < 12 ? 1 : 0
      return p
    }
    var GRAZE = 1.5
    var grazeOf = p => { var k = 0; if (p.graze != null) return p.graze
      legsOf(p).forEach(G => { if (legLen(G) < .01) return
        nearNodes(G[0][0], G[0][1], G[1][0], G[1][1]).forEach(m => { if (m === p.n0) return; var d = ptSeg([m.x, m.y], G[0], G[1]); if (d >= m.r && d < m.r + GRAZE) k++ }) })
      return p.graze = k }
    var leadDrawn = p => Math.hypot(p.e[0] - p.s[0], p.e[1] - p.s[1]) + Math.hypot(p.a[0] - p.e[0], p.a[1] - p.e[1])
    var leaders = []
    var parallelCost = (lp, self) => { var k = 0; legsOf(lp).forEach(L => leaders.forEach(q => { if (q.n === self) return
      legsOf(q).forEach(M => k += parallelLegs(L, M)) })); return k }
    var pathsMeet = (p, q) => legsOf(p).some(A => legsOf(q).some(B => legsMeet(A, B)))
    var leaderCross = (lp, self) => leaders.reduce((k, q) => k + (q.n !== self && pathsMeet(lp, q) ? 1 : 0), 0)
    var leaderD = p => 'M' + p.s[0] + ' ' + p.s[1] + ' L' + p.e[0] + ' ' + p.e[1] + ' L' + p.a[0] + ' ' + p.a[1]
    var named = [], meta = {}, has = {}
    var pathOf = n => leaders.filter(q => q.n === n)[0]
    function setLabel(n, best, path){
      var m = meta[n.name]
      placed = placed.filter(b => b.n !== n); leaders = leaders.filter(q => q.n !== n); has[n.i] = 0
      m.best = best
      if (!best) return
      placed.push(best.box); has[n.i] = 1
      var p = path || leaderPath(n, best.x, best.y, best.anchor, m); if (p){ p.n = n; leaders.push(p) }
    }
    function captureAsg(exportLeaders){
      var a = named.map(n => { var m = meta[n.name]; return m.best ? {spot: m.best, path: pathOf(n) || null} : null })
      a.exportLeaders = !!exportLeaders
      return a
    }
    function applyAsg(asg){
      var todo = []
      named.forEach((n, a) => { var m = meta[n.name], e = asg[a] || null, spot = e && e.spot
        if (m.best === spot && (!spot || (pathOf(n) || null) === e.path)) return
        placed = placed.filter(b => b.n !== n); leaders = leaders.filter(q => q.n !== n); has[n.i] = 0
        m.best = spot
        if (!spot) return
        placed.push(spot.box); has[n.i] = 1
        todo.push([n, e]) })
      todo.forEach(q => { var n = q[0], e = q[1], m = meta[n.name]
        var p = e.path || leaderPath(n, e.spot.x, e.spot.y, e.spot.anchor, m); if (p){ p.n = n; leaders.push(p) } })
      return asg
    }
    function render(asg){
      applyAsg(asg)
      named.forEach(n => { var m = meta[n.name]; if (!m.best){ m.t.remove(); return }
        var sh = m.best.box.sh || (m.v && m.v[m.best.box.side]) || m.v[0]
        m.t.at({y: m.best.y, textAnchor: m.best.anchor}).selectAll('tspan').remove()
        sh.lines.forEach((l, i) => m.t.append('tspan').at({x: m.best.x, dy: i ? LABEL.dy : 0}).text(l)) })
      leaderG.selectAll('path').remove()
      leaders.forEach(p => leaderG.append('path.leader').datum(p.n).at({d: leaderD(p)}))
      return asg
    }
    function toExport(asg){
      var o = {}
      named.forEach((n, a) => { var e = asg && asg[a]; if (!e) return
        o[n.name] = [+(e.spot.x - n.x).toFixed(1), +(e.spot.y - n.y).toFixed(1), e.spot.anchor] })
      return o
    }
    function fromExport(labels){
      var a = named.map(n => { var h = labels[n.name]; if (!h) return null
        var m = meta[n.name], x = n.x + (h[0] || 0), y = n.y + (h[1] || 0), anchor = h[2] || 'start'
        return {spot: {x: x, y: y, anchor: anchor, box: boxOf(n, m, x, y, anchor)}, path: null} })
      a.exportLeaders = false
      return a
    }
    var placement = null
    var inner = nodes.filter(n => n.hosts.length < LABEL_HOSTS)
    var rim = {}; nodes.forEach(n => { if (n.hosts.length == LABEL_HOSTS && inner.some(m => Math.hypot(m.x - n.x, m.y - n.y) < n.r + m.r + 3)) rim[n.i] = 1 })
    var geoShorts = window.guestShorts || {}
    var geoText = n => n.name in geoShorts ? geoShorts[n.name] : n.name
    var geoShapes = measureLabels(nodes.filter(n => n.hosts.length >= LABEL_HOSTS && geoText(n)).map(n => ({key: n.key, text: geoText(n)}))), geoLabels = {}
    Object.keys(geoShapes).forEach(k => geoLabels[k] = geoEntry(geoShapes[k]))
    window.forceGeo = {version: GEO_VERSION, box: LABEL, labels: geoLabels}
    var metaOf = (n, t, text) => { var sh = geoShapes[n.key] || measureLabels([{key: n.key, text: text}], 1)[n.key]
      splitLines(text).forEach((l, i) => t.append('tspan').at({x: 0, dy: i ? LABEL.dy : 0}).text(l))
      return {t: t, text: text, w: sh.w, lines: sh.lines, v: sh.v, best: null} }
    if (Object.keys(hand).length){
      var shorts = window.guestShorts || {}
      var shortOf = k => k in shorts ? shorts[k] : k
      named = Object.keys(hand).filter(k => byName[k]).map(k => byName[k])
      var handSel = labelG.appendMany('text.t-sub.perm.halo', named)
      handSel.each(function(n){ meta[n.name] = metaOf(n, d3.select(this), shortOf(n.name)) })
      placement = render(fromExport(hand))
      if (FORCE_OPT.has('drag')){   // hand placement only with ?drag (Adam: no drag code without a query parameter)
        handSel.style('cursor', 'move').style('pointer-events', 'all').call(d3.drag()
          .on('start', () => dragging = true)
          .on('drag', function(n){ var h = hand[n.name]; h[0] = +(h[0] + d3.event.dx).toFixed(1); h[1] = +(h[1] + d3.event.dy).toFixed(1)
            placement = render(fromExport(hand)) })
          .on('end', function(){
            dragging = false
            var json = '{\n' + Object.keys(hand).map(k => JSON.stringify(k) + ': ' + JSON.stringify(hand[k])).join(',\n') + '\n}'
            console.log('labels.json ↓\n' + json)
            if (navigator.clipboard) navigator.clipboard.writeText(json).catch(() => {})
          }))
      }
      window.forceLabels = {hand: Object.keys(hand).length}
    } else {
    var t1 = performance.now()
    var shorts = window.guestShorts || {}
    var short = n => n.name in shorts ? shorts[n.name] : n.name
    var COST = PARAMS.cost, SEARCH = PARAMS.search
    var bcx = d3.mean(inner, n => n.x), bcy = d3.mean(inner, n => n.y)
    var ea = (d3.max(inner, n => n.x + n.r) - d3.min(inner, n => n.x - n.r))/2, eb = (d3.max(inner, n => n.y + n.r) - d3.min(inner, n => n.y - n.r))/2
    var normal = n => Math.atan2((n.y - bcy)/(eb*eb), (n.x - bcx)/(ea*ea))   // the ellipse's outward normal: near-vertical along the flat top and bottom
    named = nodes.filter(n => n.hosts.length >= LABEL_HOSTS && short(n)).sort((a, b) => (b.hosts.length > LABEL_HOSTS) - (a.hosts.length > LABEL_HOSTS) || (a.hosts.length > LABEL_HOSTS ? b.n - a.n : Math.atan2(a.y - bcy, a.x - bcx) - Math.atan2(b.y - bcy, b.x - bcx)))
    if (FORCE_OPT.get('labels') == 'rim') named = named.filter(n => rim[n.i])
    var discs = nodes.map(n => ({x: n.x - n.r, y: n.y - n.r, w: 2*n.r, h: 2*n.r, n: n}))
    var CELL = 40, grid = {}; discs.forEach(d => { var k = Math.floor(d.n.x/CELL) + ',' + Math.floor(d.n.y/CELL); (grid[k] = grid[k] || []).push(d) })
    var nearDiscs = (box, m) => { var out = [], r = RMAX + m; for (var i = Math.floor((box.x - r)/CELL); i <= Math.floor((box.x + box.w + r)/CELL); i++) for (var j = Math.floor((box.y - r)/CELL); j <= Math.floor((box.y + box.h + r)/CELL); j++){ var g = grid[i + ',' + j]; if (g) out = out.concat(g) } return out }
    var G2 = LABEL.gap/2   // §G: boxes keep LABEL.gap between them, half of it on each side
    var sameRow = (a, b) => Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) >= .6*Math.min(a.h, b.h)
    var boxClash1 = (a, b) => hit1({x: a.x - G2, y: a.y - G2, w: a.w + LABEL.gap, h: a.h + LABEL.gap}, b) || (sameRow(a, b) && hit1({x: a.x - LABEL.word, y: a.y, w: a.w + 2*LABEL.word, h: a.h}, b))
    var boxClash = (a, b) => { if (!a.rows && !b.rows) return boxClash1(a, b)
      if (!hit1({x: a.x - LABEL.word - G2, y: a.y - G2, w: a.w + 2*LABEL.word + LABEL.gap, h: a.h + LABEL.gap}, b)) return false
      var A = rowsOf(a), B = rowsOf(b); for (var i = 0; i < A.length; i++) for (var j = 0; j < B.length; j++) if (boxClash1(A[i], B[j])) return true; return false }
    var discHit = (box, self, m) => nearDiscs(box, m).some(d => d.n !== self && hit(box, {x: d.x - m, y: d.y - m, w: d.w + 2*m, h: d.h + 2*m}))
    var clear = (box, self, m) => box.x >= 0 && box.x + box.w <= width && box.y >= 0 && box.y + box.h <= height && !placed.some(p => boxClash(box, p)) && !discHit(box, self, Math.max(m || 0, 1))
    var CORR = SEARCH.corr, corr = {}
    nodes.forEach(n => { if (!rim[n.i]) return; var a = normal(n), vert = Math.abs(Math.sin(a)) > Math.abs(Math.cos(a))
      corr[n.i] = {sx: vert ? 0 : Math.sign(Math.cos(a)), sy: vert ? Math.sign(Math.sin(a)) : 0}; corr[n.i].x0 = n.x + corr[n.i].sx*(n.r + 1); corr[n.i].y0 = n.y + corr[n.i].sy*(n.r + 1) })
    var corridorOf = (c, box) => { var lo, beyond
      if (c.sy){ if (c.x0 < box.x - 1 || c.x0 > box.x + box.w + 1) return 0; lo = c.sy < 0 ? c.y0 - (box.y + box.h) : box.y - c.y0; beyond = c.sy < 0 ? box.y > c.y0 : box.y + box.h < c.y0 }
      else { if (c.y0 < box.y - 1 || c.y0 > box.y + box.h + 1) return 0; lo = c.sx < 0 ? c.x0 - (box.x + box.w) : box.x - c.x0; beyond = c.sx < 0 ? box.x > c.x0 : box.x + box.w < c.x0 }
      if (beyond || lo > CORR) return 0
      return lo < 35 ? 1 : .5 }
    var corridorCost = (box, n) => { var k = 0, R = rowsOf(box)
      for (var i in corr){ if (has[i] || +i == n.i) continue; var c = corr[i], best = 0
        for (var r = 0; r < R.length; r++) best = Math.max(best, corridorOf(c, R[r]))
        k += best }
      return k }
    var ORDER = [4, 12, 0, 8, 2, 6, 14, 10, 3, 5, 11, 13, 1, 7, 9, 15]

    var W = Object.assign({}, COST)
    var inkBox = b => !textTop ? b : Object.assign({x: b.x, y: b.y + textTop, w: b.w, h: b.h - textTop},
      b.rows ? {rows: b.rows.map((r, i) => i ? r : {x: r.x, y: r.y + textTop, w: r.w, h: r.h - textTop})} : {})
    var ambOf = q => { if (q.amb) return q.amb
      var box = inkBox(q.s.box), d0 = boxDist(box, q.n), mg = 20, amb = 0
      if (q.g) nodes.forEach(m => { if (m !== q.n) mg = Math.min(mg, boxDist(box, m) - d0) })
      else nearDiscs(box, 26).forEach(d => { if (d.n === q.n) return; var e = boxDist(box, d.n) - d0; if (e < LABEL.ambig) amb++; if (e < mg) mg = e })
      return q.amb = {mg: mg, amb: amb} }
    var pointsAt = (A, B, box) => box.rows ? (box.rows.some(r => pointsAt1(A, B, r)) ? 1 : 0) : pointsAt1(A, B, box)
    var pointsAt1 = (A, B, box) => {
      if (Math.hypot(B[0] - A[0], B[1] - A[1]) < 3) return 0
      if (Math.abs(A[0] - B[0]) < .5){ var top = Math.min(A[1], B[1]), bot = Math.max(A[1], B[1])
        if (A[0] > box.x + 1 && A[0] < box.x + box.w - 1){ var dB = top - (box.y + box.h), dA = box.y - bot; return (dB >= -1 && dB < 8) || (dA >= -1 && dA < 8) ? 1 : 0 }
        var along = Math.min(bot, box.y + box.h) - Math.max(top, box.y)
        return along > 4 && ((A[0] > box.x - 2 && A[0] <= box.x + 1) || (A[0] >= box.x + box.w - 1 && A[0] < box.x + box.w + 2)) ? 1 : 0 }
      if (Math.abs(A[1] - B[1]) < .5){ var lo = Math.min(A[0], B[0]), hi = Math.max(A[0], B[0])
        if (A[1] > box.y + 1 && A[1] < box.y + box.h - 1){ var dR = lo - (box.x + box.w), dL = box.x - hi; return (dR >= -1 && dR < 6) || (dL >= -1 && dL < 6) ? 1 : 0 }
        var span = Math.min(hi, box.x + box.w) - Math.max(lo, box.x)
        return span > 4 && ((A[1] > box.y - 2 && A[1] <= box.y + 1) || (A[1] >= box.y + box.h - 1 && A[1] < box.y + box.h + 2)) ? 1 : 0 }
      return 0 }
    var rowSide = (n, b) => b.y + b.h < n.y ? -1 : b.y > n.y ? 1 : 0
    var rowDist = (n, b, sd) => sd < 0 ? n.y - (b.y + b.h) : b.y - n.y
    var thinInv = (a, sa, b, sb) => { if (!rim[a.i] || !rim[b.i] || Math.abs(a.x - b.x) > 45) return 0
      var sd = rowSide(a, sa.box); if (!sd || sd != rowSide(b, sb.box)) return 0
      if (Math.min(sa.box.x + sa.box.w, sb.box.x + sb.box.w) - Math.max(sa.box.x, sb.box.x) < 1) return 0
      var da = rowDist(a, sa.box, sd), db = rowDist(b, sb.box, sd); if (Math.abs(da - db) < 5) return 0
      var wa = meta[a.name].w, wb = meta[b.name].w
      return (da < db ? wa > wb + 4 : wb > wa + 4) ? 1 : 0 }
    var STACK_ROW1 = LABEL.line1 + LABEL.gap
    var elevOf = (n, b) => b.y + b.h <= n.y ? n.y - n.r - (b.y + b.h) : b.y >= n.y ? b.y - (n.y + n.r) : -1
    var STACK_RUN = 16, blobEnv = {top: {}, bot: {}}
    nodes.forEach(n => { if (!rim[n.i]) return
      for (var x = Math.ceil(n.x - n.r); x <= Math.floor(n.x + n.r); x++){ var h = Math.sqrt(Math.max(0, n.r*n.r - (x - n.x)*(x - n.x)))
        if (!(x in blobEnv.top) || n.y - h < blobEnv.top[x]) blobEnv.top[x] = n.y - h
        if (!(x in blobEnv.bot) || n.y + h > blobEnv.bot[x]) blobEnv.bot[x] = n.y + h } })
    var roomUnder = (B, sd, a) => { var run = 0, best = 0, c0 = a.x - a.r - LABEL.gap, c1 = a.x + a.r + LABEL.gap
      for (var x = Math.ceil(B.x); x <= Math.floor(B.x + B.w); x++){ var e = sd < 0 ? blobEnv.top[x] : blobEnv.bot[x]
        if (e == null) continue
        var gap = x >= c0 && x <= c1 ? -1 : sd < 0 ? e - (B.y + B.h) : B.y - e
        run = gap >= STACK_ROW1 ? run + 1 : 0; if (run > best) best = run }
      return best >= STACK_RUN ? 1 : 0 }
    var stackOn = (a, A, b, B) => { if (!rim[a.i] || !rim[b.i]) return 0
      var sd = rowSide(a, A); if (!sd || sd != rowSide(b, B)) return 0
      var x0 = Math.min(A.x, a.x), x1 = Math.max(A.x + A.w, a.x)
      if (B.x >= x1 - .5 || B.x + B.w <= x0 + .5) return 0
      if (sd < 0 ? B.y < A.y + A.h - .5 : B.y + B.h > A.y + .5) return 0
      return elevOf(b, B) >= STACK_ROW1 || roomUnder(B, sd, a) ? 1 : 0 }
    var reachOf = (n, b) => { var sd = b.side != null ? b.side : rowSide(n, b)
      return sd < 0 ? n.y - n.r - (b.y + b.h) : sd > 0 ? b.y - (n.y + n.r) : Math.max(b.x - (n.x + n.r), n.x - n.r - (b.x + b.w)) }
    var ONE_GAP = 8, ONE_ALIGN = 4, ONE_WORD = 10
    var wholeOf = b => b.lines == 1 && b.sh && b.n && meta[b.n.name] && b.sh === meta[b.n.name].v.one
    var ONE_RAMP = .5, ONE_HALF = 6
    var ramp1 = (v, lim, R) => v < lim ? 1 : v < lim + R ? (lim + R - v)/R : 0
    var readsAsOne = (A, B) => { if (!A || !B || A.n === B.n) return 0
      if (Math.abs(A.x - B.x) > A.w + B.w + ONE_WORD + ONE_RAMP || Math.abs(A.y - B.y) > A.h + B.h + ONE_GAP + ONE_RAMP) return 0
      var RA = rowsOf(A), RB = rowsOf(B), list = wholeOf(A) || wholeOf(B), k = 0
      for (var i = 0; i < RA.length; i++) for (var j = 0; j < RB.length; j++){ var a = RA[i], b = RB[j]
        var vo = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y)
        if (vo > .25*Math.min(a.h, b.h)){ var hg = Math.max(a.x, b.x) - Math.min(a.x + a.w, b.x + b.w)
          if (hg > -.5) k = Math.max(k, vo >= .55*Math.min(a.h, b.h) ? ramp1(hg, ONE_WORD, ONE_RAMP) : Math.max(0, Math.min(1, 1 - hg/ONE_HALF))/2); continue }
        if (list) continue
        var ho = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x), vg = Math.max(a.y, b.y) - Math.min(a.y + a.h, b.y + b.h)
        if (ho > 0 && vg > -.5) k = Math.max(k, ramp1(vg, ONE_GAP, ONE_RAMP)*ramp1(Math.min(Math.abs(a.x - b.x), Math.abs(a.x + a.w - b.x - b.w), Math.abs(a.x + a.w/2 - b.x - b.w/2)), ONE_ALIGN, ONE_RAMP)) }
      return Math.ceil(k*64)/64 }   // in 64ths: exact in the annealer's float32 pair cache
    var SKIM = 6
    var skim1 = (A, B, r) => { var d
      if (Math.abs(A[0] - B[0]) < .5){ if (Math.min(Math.max(A[1], B[1]), r.y + r.h) - Math.max(Math.min(A[1], B[1]), r.y) <= 4) return 0
        d = A[0] < r.x ? r.x - A[0] : A[0] > r.x + r.w ? A[0] - r.x - r.w : -1 }
      else if (Math.abs(A[1] - B[1]) < .5){ if (Math.min(Math.max(A[0], B[0]), r.x + r.w) - Math.max(Math.min(A[0], B[0]), r.x) <= 4) return 0
        d = A[1] < r.y ? r.y - A[1] : A[1] > r.y + r.h ? A[1] - r.y - r.h : -1 }
      else return 0
      return d >= 0 && d < SKIM ? Math.ceil((SKIM - d)/SKIM*8)/8 : 0 }   // in eighths: exact in the annealer's float32 pair cache
    var skimOf = (lp, box) => { if (!lp || !box || lp.n0 === box.n) return 0; var k = 0, R = rowsOf(box)
      legsOf(lp).forEach(L => { if (legLen(L) < .01) return; var m = 0; R.forEach(r => m = Math.max(m, skim1(L[0], L[1], r))); k += m }); return k }
    var TERMS = [
      {name: 'ring', weight: 'rw',
       unary: (q, w) => q.g ? q.ring*w.rw : w.rw*Math.max(0, q.len - q.n.r - 3)/7},
      {name: 'length', weight: 'lenw',
       unary: (q, w) => w.lenw*q.len},
      {name: 'elbow', weight: 'ew',
       unary: (q, w) => q.s.lp && q.s.lp.kind == 'elbow' ? w.ew : 0},
      {name: 'normalTurn', weight: 'aw',
       unary: (q, w) => { if (!rim[q.n.i]) return 0
         if (q.g) return q.dev*w.aw
         var dd = Math.abs(Math.atan2(q.cy - q.n.y, q.cx - q.n.x) - normal(q.n)) % (2*Math.PI)
         return Math.min(dd, 2*Math.PI - dd)*w.aw }},
      {name: 'floaterHome', weight: 'floatw',
       unary: (q, w) => rim[q.n.i] || (Math.abs(q.cx - q.n.x) < 5 && q.cy > q.n.y) ? 0 : w.floatw},
      {name: 'floaterBelow', weight: 'bb', phase: 'greedy',
       unary: (q, w) => q.belowOnly ? -w.bb : 0},
      {name: 'leaderExists', weight: 'lw',
       unary: (q, w) => q.s.lp ? w.lw : 0},
      {name: 'leaderThroughNode', weight: 'nw', audit: 'leader-through-node',
       unary: (q, w) => q.s.lp ? q.s.lp.nodeHits*w.nw : 0},
      {name: 'leaderGraze', weight: 'gw',
       unary: (q, w) => q.s.lp && w.gw ? grazeOf(q.s.lp)*w.gw : 0},
      {name: 'leaderKink', weight: 'kw',
       unary: (q, w) => q.s.lp && q.s.lp.kink ? w.kw : 0},
      {name: 'leaderThroughBox', weight: 'lhw', audit: 'leader-through-label',
       unary: (q, w) => q.s.lp ? q.s.lp.labelHits*w.lhw : 0,
       pair: (q, w) => { var k = 0; if (q.sa.lp) legsOf(q.sa.lp).forEach(G => { if (legBox(G[0], G[1], q.sb.box)) k += w.lhw }); return k }},
      {name: 'boxUnderLeader', weight: 'lhw', audit: 'leader-through-label',
       unary: (q, w) => leaders.reduce((k, o) => k + (o.n !== q.n && (legBox(o.s, o.e, q.s.box) || legBox(o.e, o.a, q.s.box)) ? 1 : 0), 0)*w.lhw,
       pair: (q, w) => { var k = 0; if (q.sb.lp) legsOf(q.sb.lp).forEach(G => { if (legBox(G[0], G[1], q.sa.box)) k += w.lhw }); return k }},
      {name: 'leaderCross', weight: 'xw',
       unary: (q, w) => q.s.lp ? leaderCross(q.s.lp, q.n)*w.xw : 0,
       pair: (q, w) => q.sa.lp && q.sb.lp && pathsMeet(q.sa.lp, q.sb.lp) ? w.xw : 0},
      {name: 'parallelLegs', weight: 'pw',
       unary: (q, w) => q.s.lp ? parallelCost(q.s.lp, q.n)*w.pw : 0,
       pair: (q, w) => { if (!q.sa.lp || !q.sb.lp) return 0
         var A = legsOf(q.sa.lp), B = legsOf(q.sb.lp), par = 0
         A.forEach(G => B.forEach(M => par += parallelLegs(G, M)))
         return par*w.pw }},
      {name: 'margin', weight: null,
       unary: q => q.s.lp ? 0 : Math.max(0, 20 - ambOf(q).mg)/20},
      {name: 'ambiguity', weight: 'ambw', audit: 'ambiguous',
       unary: (q, w) => q.s.lp ? 0 : ambOf(q).amb*w.ambw},
      {name: 'corridor', weight: 'cw', phase: 'greedy',
       unary: (q, w) => corridorCost(q.s.box, q.n)*w.cw},
      {name: 'slide', weight: null, phase: 'greedy',
       unary: q => Math.abs(q.slide)/100},
      {name: 'pointsAt', weight: 'fw',
       unary: (q, w) => { if (!q.g) return 0; var k = 0
         if (q.s.lp) placed.forEach(b => { if (b.n !== q.n && legsOf(q.s.lp).some(L => pointsAt(L[0], L[1], b))) k++ })
         leaders.forEach(o => { if (o.n !== q.n && legsOf(o).some(L => pointsAt(L[0], L[1], q.s.box))) k++ })
         return k*w.fw },
       pair: (q, w) => { var k = 0
         if (q.sa.lp) legsOf(q.sa.lp).forEach(L => { if (pointsAt(L[0], L[1], q.sb.box)) k++ })
         if (q.sb.lp) legsOf(q.sb.lp).forEach(L => { if (pointsAt(L[0], L[1], q.sa.box)) k++ })
         return k*w.fw }},
      {name: 'thinNear', weight: 'tw',
       pair: (q, w) => thinInv(q.n, q.sa, q.nb, q.sb)*w.tw},
      {name: 'stack', weight: 'stw',
       pair: (q, w) => w.stw ? (stackOn(q.n, q.sa.box, q.nb, q.sb.box) + stackOn(q.nb, q.sb.box, q.n, q.sa.box))*w.stw : 0},
      {name: 'stackPlaced', weight: 'stw', phase: 'greedy',
       unary: (q, w) => { if (!w.stw || !rim[q.n.i]) return 0; var k = 0
         placed.forEach(p => { if (p.n && p.n !== q.n) k += stackOn(q.n, q.s.box, p.n, p) + stackOn(p.n, p, q.n, q.s.box) }); return k*w.stw }},
      {name: 'rimReach', weight: 'rcw',
       unary: (q, w) => { if (!w.rcw || !rim[q.n.i]) return 0; var b = q.s.box, e = b.side ? reachOf(q.n, b) : 0, L = q.s.lp ? leadDrawn(q.s.lp) : 0
         return (Math.max(0, e - SEARCH.elevMax) + Math.max(0, L - SEARCH.leadMax))*w.rcw }},
      {name: 'entryOff', weight: 'ocw',
       unary: (q, w) => { var p = q.s.lp; return !w.ocw || !rim[q.n.i] || !p || p.en == null ? 0 : w.ocw*(p.kind == 'vert' ? Math.max(0, p.en - SEARCH.octol) : 4*p.en) }},
      {name: 'rimRow', weight: 'rrw',
       unary: (q, w) => { if (!w.rrw || !rim[q.n.i] || !q.s.lp) return 0
         return w.rrw*Math.max(0, leadDrawn(q.s.lp) - SEARCH.row1) }},
      {name: 'exitOff', weight: 'exw',
       unary: (q, w) => { var p = q.s.lp; return p && p.off ? w.ew + w.exw*p.off : 0 }},
      {name: 'rimOrder', weight: 'iw',
       pair: (q, w) => { if (!w.iw || !rim[q.n.i] || !rim[q.nb.i]) return 0; var A = q.sa.box, B = q.sb.box
         if (!A.side || A.side != B.side || Math.abs(q.n.x - q.nb.x) > 80) return 0
         var d = (A.x + A.w/2) - (B.x + B.w/2); if ((q.n.x - q.nb.x)*d >= 0) return 0
         return w.iw*Math.ceil(Math.min(1, (Math.abs(d) + 2)/8)*8)/8 }},
      {name: 'readsAsOne', weight: 'ow',
       pair: (q, w) => w.ow ? readsAsOne(q.sa.box, q.sb.box)*w.ow : 0},
      {name: 'readsAsOnePlaced', weight: 'ow', phase: 'greedy',
       unary: (q, w) => { if (!w.ow) return 0; var k = 0; placed.forEach(p => { if (p.n && p.n !== q.n) k += readsAsOne(q.s.box, p) }); return k*w.ow }},
      {name: 'leaderSkim', weight: 'skw',
       pair: (q, w) => w.skw ? (skimOf(q.sa.lp, q.sb.box) + skimOf(q.sb.lp, q.sa.box))*w.skw : 0},
      {name: 'leaderSkimPlaced', weight: 'skw', phase: 'greedy',
       unary: (q, w) => { if (!w.skw) return 0; var k = 0
         if (q.s.lp) placed.forEach(b => { if (b.n !== q.n) k += skimOf(q.s.lp, b) })
         leaders.forEach(o => { if (o.n !== q.n) k += skimOf(o, q.s.box) }); return k*w.skw }},
      {name: 'leaderHook', weight: 'hw',
       unary: (q, w) => q.s.lp && q.s.lp.hook ? w.hw : 0},
      {name: 'ownDisc', weight: 'hard',
       unary: (q, w) => rowsOf(q.s.box).some(r => Math.hypot(Math.max(r.x - q.n.x, 0, q.n.x - (r.x + r.w)), Math.max(r.y - q.n.y, 0, q.n.y - (r.y + r.h))) < q.n.r + 1) ? w.hard : 0},
      {name: 'missing', weight: 'missw', audit: 'missing',
       unary: (q, w) => w.missw},
      {name: 'boxOverlap', weight: 'hard', audit: 'over-label',
       pair: (q, w) => boxClash(q.sa.box, q.sb.box) ? w.hard : 0},
      {name: 'edge', weight: 'hard', audit: 'off-canvas',
       unary: (q, w) => { var b = q.s.box; return b.x >= 0 && b.y >= 0 && b.x + b.w <= width && b.y + b.h <= height ? 0 : w.hard }},
      {name: 'discOverlap', weight: 'hard', audit: 'over-node',
       unary: (q, w) => discHit(q.s.box, q.n, 1) ? w.hard : 0},
      {name: 'leaderlessClear', weight: 'hard', phase: 'greedy',
       unary: (q, w) => !q.s.lp && discHit(q.s.box, q.n, LABEL.clear) ? w.hard : 0},
      {name: 'invisibleLeader', weight: 'hard', audit: 'invisible-leader',
       unary: (q, w) => q.s.lp && leadDrawn(q.s.lp) < LABEL.minDrawn ? w.hard : 0},
      {name: 'boxOverlapPlaced', weight: 'hard', phase: 'greedy', audit: 'over-label',
       unary: (q, w) => placed.some(p => p.n !== q.n && boxClash(q.s.box, p)) ? w.hard : 0}
    ]
    var GREEDY_SUM = ['edge', 'discOverlap', 'boxOverlapPlaced', 'invisibleLeader', 'leaderlessClear',
                      'leaderThroughNode', 'leaderThroughBox', 'leaderExists', 'leaderCross', 'parallelLegs', 'margin',
                      'boxUnderLeader', 'ring', 'corridor', 'normalTurn', 'slide', 'elbow', 'floaterBelow', 'leaderGraze', 'leaderKink', 'pointsAt', 'stackPlaced', 'rimReach', 'leaderHook', 'ownDisc',
                      'readsAsOnePlaced', 'leaderSkimPlaced', 'entryOff', 'rimRow', 'exitOff']
    var STATIC_SUM = ['edge', 'discOverlap', 'invisibleLeader',
                      'ring', 'length', 'elbow', 'normalTurn', 'floaterHome', 'leaderThroughNode', 'leaderExists', 'margin', 'ambiguity',
                      'leaderGraze', 'leaderKink', 'rimReach', 'leaderHook', 'ownDisc', 'entryOff', 'rimRow', 'exitOff']
    var HARD_SUM = ['edge', 'discOverlap', 'boxOverlapPlaced', 'ownDisc'], HARD_LEAD_SUM = ['invisibleLeader', 'leaderlessClear']
    var PAIR_SUM   = ['boxOverlap', 'leaderThroughBox', 'boxUnderLeader', 'leaderCross', 'parallelLegs', 'pointsAt', 'thinNear', 'stack', 'readsAsOne', 'leaderSkim', 'rimOrder']
    var AUDIT_WEIGHTS = {nw: 1, lhw: 1, xw: 1, ambw: 1, missw: 2, hard: 1,
                         rw: 0, lenw: 0, ew: 0, sw: 0, aw: 0, floatw: 0, bb: 0, lw: 0, cw: 0, kw: 0, gw: 0, fw: 0, tw: 0, stw: 0, rcw: 0, hw: 0, ow: 0, skw: 0, ocw: 0, rrw: 0, iw: 0, exw: 0}
    function makeCost(terms, w){
      var by = {}; terms.forEach(t => by[t.name] = t)
      var sum = (order, q) => { var k = 0; for (var i = 0; i < order.length; i++){ var t = by[order[i]]; k += (q.sb ? t.pair : t.unary)(q, w) } return k }
      return {
        terms: terms, w: w, by: by,
        greedy: q => sum(GREEDY_SUM, q),
        hard: (n, s) => sum(HARD_SUM, {n: n, s: s, g: 1}),
        hardLead: (n, s) => sum(HARD_LEAD_SUM, {n: n, s: s, g: 1}),
        unary: (n, s) => { if (!s) return w.missw
          var cx = s.box.x + s.box.w/2, cy = s.box.y + s.box.h/2
          return sum(STATIC_SUM, {n: n, s: s, g: 0, cx: cx, cy: cy, len: Math.hypot(cx - n.x, cy - n.y)}) },
        pair: (a, sa, b, sb) => sa && sb ? sum(PAIR_SUM, {n: a, s: sa, sa: sa, nb: b, sb: sb, g: 0}) : 0,
        view: w2 => makeCost(terms, Object.assign({}, w, w2)),
        explain: (names, spotOf, nbOf) => { var out = {}
          terms.forEach(t => out[t.name] = 0)
          names.forEach((n, a) => { var s = spotOf(a)
            if (!s){ out.missing += w.missw; return }
            var cx = s.box.x + s.box.w/2, cy = s.box.y + s.box.h/2, q = {n: n, s: s, g: 0, cx: cx, cy: cy, len: Math.hypot(cx - n.x, cy - n.y)}
            STATIC_SUM.forEach(k => out[k] += by[k].unary(q, w))
            nbOf(a).forEach(b => { if (b <= a) return; var sb = spotOf(b); if (!sb) return
              var q2 = {n: n, s: s, sa: s, nb: names[b], sb: sb, g: 0}
              PAIR_SUM.forEach(k => out[k] += by[k].pair(q2, w)) }) })
          Object.keys(out).forEach(k => out[k] = +out[k].toFixed(2)); return out }
      }
    }
    var Cost = makeCost(TERMS, W), AUDIT_COST = Cost.view(AUDIT_WEIGHTS)
    var Placer = window.Placer = {cost: Cost, auditCost: AUDIT_COST, terms: TERMS, debug: {}}

    var SL = COST.sl
    var KK = SEARCH.kk, HOOD = SEARCH.hood, ORDS = SEARCH.ords, PASSES = SEARCH.passes, FULLR = SEARCH.fullr
    var devOf = n => { var nrm = normal(n); return a => { var d = Math.abs(a - nrm) % (2*Math.PI); return Math.min(d, 2*Math.PI - d) } }
    var axisOf = n => { var a = normal(n); return Math.abs(Math.sin(a)) > Math.abs(Math.cos(a)) ? (Math.sin(a) > 0 ? Math.PI/2 : -Math.PI/2) : (Math.cos(a) > 0 ? 0 : Math.PI) }
    var onGrid = (c, v) => c + +(v - c).toFixed(1)
    function spotAt(n, m, v, ring, dev, belowOnly){
      var x = onGrid(n.x, v.x), y = onGrid(n.y, v.y)
      return {x: x, y: y, anchor: v.anchor, box: boxOf(n, m, x, y, v.anchor),
              ring: ring, slide: v.slide, elbow: v.elbow || 0, straight: v.straight || 0,
              dev: dev, belowOnly: belowOnly, lp: null, cost: 0}
    }
    function slideVariants(anchor, cx, y0, vert, horiz, w, h){
      var slides = [0]
      if (vert) for (var s = 3; s < w/2 - 3; s += 3) slides.push(s, -s)
      if (horiz) for (var s = 3; s < h/2 - 2; s += 3) slides.push(s, -s)
      return slides.map(sl => ({anchor: anchor, x: cx + (vert ? sl : 0), y: y0 + (horiz ? sl : 0), slide: sl}))
    }
    var ELBOW_OFFS = [6, 14, 22, 32, 44, 58, 74]
    function elbowVariants(n, cx, y0, anchor, vert, w, lines){
      var out = []
      if (vert) ELBOW_OFFS.forEach(o => { out.push({anchor: 'start', x: n.x + o, y: y0}); out.push({anchor: 'end', x: n.x - o, y: y0}) })
      var cw = Math.floor((n.r - 1.5)*10 + 1e-6)/10
      if (vert && SEARCH.corner !== 0) for (var s = -cw; s <= cw + 1e-9; s += Math.max(1, cw/3)){
        out.push({anchor: 'start', x: n.x + s + 1, y: y0, corner: 1}); out.push({anchor: 'end', x: n.x - s - 1, y: y0, corner: 1}) }
      if (!vert) [6, 14].forEach(o => { out.push({anchor: 'middle', x: cx + (anchor == 'start' ? w/2 : -w/2), y: baselineY(n.y - o, -1, lines)}); out.push({anchor: 'middle', x: cx + (anchor == 'start' ? w/2 : -w/2), y: baselineY(n.y + o, 1, lines)}) })   // §G
      return out.map(e => Object.assign(e, {slide: 0, elbow: 1}))
    }
    function slantVariants(n, a, rad, ring, lines, vert){
      if (!vert || !ring || W.sw >= W.hard) return []
      return [18, -18, 35, -35].map(deg => { var a2 = a + deg*Math.PI/180, sx2 = n.x + Math.cos(a2)*rad, sy2 = n.y + Math.sin(a2)*rad
        return {anchor: 'middle', x: sx2, y: baselineY(sy2, Math.sin(a), lines), slide: 0, elbow: 0, straight: 1} })   // §G (vert: sin a is ±1)
    }
    var baseAt = (n, m, cy, sinA) => { if (m.v && m.v.one && Math.abs(sinA) <= .4){ var y1 = baselineY(cy, sinA, 1); if (!sideOf(n, y1, m.lines)) return y1 }
      return baselineY(cy, sinA, m.lines) }
    function candidatesFor(n, m, opts){
      var w = m.w, lines = m.lines, isRim = rim[n.i], h = LABEL.line1 + LABEL.lineH*(lines - 1), dev = devOf(n), out = []
      var below = opts.mode == 'below', straightOnly = opts.mode == 'straight'
      var dirs16 = (isRim ? d3.range(16).sort((a, b) => dev(a*Math.PI/8) - dev(b*Math.PI/8)) : ORDER).map(k => k*Math.PI/8)
      var dirs32 = d3.range(32).map(k => k*Math.PI/16).sort((a, b) => dev(a) - dev(b))
      var axis = isRim ? axisOf(n) : 0
      for (var ring = opts.from; ring < opts.to; ring++){
        var rad = n.r + LABEL.ring0 + ring*LABEL.ringStep, dirs = below ? [Math.PI/2] : straightOnly ? [axis] : ring < 6 ? dirs16 : dirs32
        for (var kk = 0; kk < dirs.length; kk++){
          var a = dirs[kk], cx = n.x + Math.cos(a)*rad, cy = n.y + Math.sin(a)*rad
          var anchor = Math.cos(a) > .4 ? 'start' : Math.cos(a) < -.4 ? 'end' : 'middle'
          var y0 = baseAt(n, m, cy, Math.sin(a))
          var vert = Math.abs(Math.cos(a)) < 1e-9, horiz = Math.abs(Math.sin(a)) < 1e-9
          var variants = slideVariants(anchor, cx, y0, vert && !below && !straightOnly, horiz && !straightOnly, w, h)
          if (straightOnly && vert) for (var s = SEARCH.ledstep; s <= w/2 + 18; s += s < 3 ? SEARCH.ledstep : s > w/2 - 2 ? 6 : 3) variants.push({anchor: anchor, x: cx + s, y: y0, slide: s}, {anchor: anchor, x: cx - s, y: y0, slide: -s})
          if (straightOnly && horiz) for (var s = SEARCH.ledstep; s <= n.r + 2; s += SEARCH.ledstep) variants.push({anchor: anchor, x: cx, y: y0 + s, slide: s}, {anchor: anchor, x: cx, y: y0 - s, slide: -s})
          if (isRim && !straightOnly && !below && horiz) for (var s = SEARCH.ledstep; s <= n.r + 2; s += SEARCH.ledstep)
            if (!variants.some(v => Math.abs(Math.abs(v.slide) - s) < 1e-9)) variants.push({anchor: anchor, x: cx, y: y0 + s, slide: s}, {anchor: anchor, x: cx, y: y0 - s, slide: -s})
          if (straightOnly) variants = variants.concat(elbowVariants(n, cx, y0, anchor, vert, w, lines), slantVariants(n, a, rad, ring, lines, vert))
          for (var si = 0; si < variants.length; si++) out.push(spotAt(n, m, variants[si], ring, isRim ? dev(a) : 0, below ? 1 : 0))
        }
      }
      return out
    }
    var withLeader = (n, s, m) => { s.lp = leaderPath(n, s.x, s.y, s.anchor, m); return s }
    function bestSpot(n, m, full, opts){
      opts = opts || {}
      var cost = opts.cost || Cost, w0 = cost.w, kk = opts.kk || KK, useBelow = 'below' in opts ? opts.below : W.fb
      var best = null, isRim = rim[n.i], cands = []
      var belowOnly = !isRim && useBelow
      var straightOnly = isRim && SL && !opts.general
      for (var ring = 0; ring < (full || straightOnly ? FULLR : 14) && !(!full && best && best.cost <= ring*w0.rw); ring++){
        if (belowOnly && ring == 3){ if (best) break; belowOnly = false; ring = 0 }
        if (straightOnly && ring == FULLR){ if (best) break; straightOnly = false; ring = 0 }
        var spots = candidatesFor(n, m, {mode: belowOnly ? 'below' : straightOnly ? 'straight' : 'all', from: ring, to: ring + 1})
        for (var si = 0; si < spots.length; si++){
          var c = spots[si]
          if (cost.hard(n, c)) continue
          withLeader(n, c, m)
          if (cost.hardLead(n, c)) continue
          var k = c.cost = cost.greedy({n: n, s: c, g: 1, ring: c.ring, slide: c.slide, dev: c.dev, belowOnly: c.belowOnly})
          if (!best || k < best.cost) best = c
          if (full) cands.push(c)
        }
        if (!full && best && best.cost <= ring*w0.rw) break
      }
      if (best && best.cost >= w0.hard) best = null
      if (full && best) best.cands = cands.sort((a, b) => a.cost - b.cost).slice(0, kk)
      return best
    }
    var lab = labelG.appendMany('text.t-sub.perm.halo', named)
    lab.each(function(n){ meta[n.name] = metaOf(n, d3.select(this), short(n)) })
    var order = named.slice().sort((a, b) => (!!rim[a.i] - !!rim[b.i]) || (rim[a.i] ? meta[a.name].w - meta[b.name].w : 0))
    function runGreedy(){ order.forEach(n => setLabel(n, bestSpot(n, meta[n.name]))) }
    var AW = AUDIT_COST.w
    var leaderOf = {}
    function problemsOf(S){
      var k = 0, inS = {}; S.forEach(n => inS[n.i] = 1)
      leaders.forEach(q => {
        var own = inS[q.n.i], legs = [[q.s, q.e], [q.e, q.a]]
        if (own) legs.forEach(L => nearNodes(L[0][0], L[0][1], L[1][0], L[1][1]).forEach(m => { if (m !== q.n && segCircle(L[0], L[1], m)) k += AW.nw }))
        placed.forEach(b => { if (b.n !== q.n && (own || (b.n && inS[b.n.i]))) legs.forEach(L => { if (legBox(L[0], L[1], b)) k += AW.lhw }) })
        if (own) leaders.forEach(q2 => { if (q2.n !== q.n && !inS[q2.n.i] && pathsMeet(q, q2)) k += AW.xw })
      })
      for (var i1 = 0; i1 < leaders.length; i1++) for (var j1 = i1 + 1; j1 < leaders.length; j1++){ var q1 = leaders[i1], q2 = leaders[j1]; if (inS[q1.n.i] && inS[q2.n.i] && pathsMeet(q1, q2)) k += AW.xw }
      leaderOf = {}; leaders.forEach(q => leaderOf[q.n.i] = 1)
      placed.forEach(b => { if (!b.n || !inS[b.n.i] || leaderOf[b.n.i]) return; var ib = inkBox(b), d0 = boxDist(ib, b.n); nodes.forEach(m => { if (m !== b.n && boxDist(ib, m) < d0 + LABEL.ambig) k += AW.ambw }) })
      S.forEach(n => { if (!meta[n.name].best) k += AW.missw })
      return k
    }
    var partnersOf = n => {
      var P = [], add = m => { if (m && m !== n && P.indexOf(m) < 0) P.push(m) }, mine = placed.filter(b => b.n === n)[0], q0 = pathOf(n)
      leaders.forEach(q => { if (q.n !== n && mine && (segBox(q.s, q.e, mine) || segBox(q.e, q.a, mine))) add(q.n) })
      if (q0) placed.forEach(b => { if (b.n !== n && (segBox(q0.s, q0.e, b) || segBox(q0.e, q0.a, b))) add(b.n) })
      if (!mine) placed.filter(b => b.n).sort((a, b) => boxDist(a, n) - boxDist(b, n)).slice(0, 3).forEach(b => add(b.n))
      return P.slice(0, 4)
    }
    function placeBy(x, S){
      var m = meta[x.name], b = bestSpot(x, m, true)
      if (!b){ setLabel(x, null); return }
      var pick = null, pk = Infinity, scan = c => { setLabel(x, c); var k = problemsOf(S); if (k < pk){ pk = k; pick = c } }
      b.cands.forEach(scan)
      if (pk > 0 && rim[x.i]){ setLabel(x, null); var g = bestSpot(x, m, true, {general: 1}); if (g) g.cands.forEach(scan) }
      setLabel(x, pick)
    }
    var moves = 0
    var snap = all => all.map(x => [x, meta[x.name].best, pathOf(x)]), unsnap = S => S.forEach(o => setLabel(o[0], o[1], o[2]))
    function tryOrders(all, orders){
      var saved = snap(all), bestK = problemsOf(all), bestOpt = null
      orders.forEach(order => {
        order.forEach(x => setLabel(x, null))
        order.forEach(x => placeBy(x, all))
        var k = problemsOf(all)
        if (k < bestK){ bestK = k; bestOpt = snap(all) }
        unsnap(saved)
      })
      if (bestOpt){ unsnap(bestOpt); moves++ }
      return bestOpt ? 1 : 0
    }
    function runRepair(){
    for (var pass = 0; pass < PASSES; pass++){
      var scored = named.map(n => ({n: n, k: problemsOf([n])})).filter(o => o.k > 0).sort((a, b) => b.k - a.k)
      if (!scored.length) break
      var improved = 0
      scored.forEach(o => {
        var n = o.n, P = partnersOf(n), all = [n].concat(P)
        var options = [[n]]; P.forEach(p => options.push([p, n], [n, p]))
        if (P.length > 1) options.push([n].concat(P.slice(0, 2)), [P[0], P[1], n])
        if (!meta[n.name].best && P.length > 2) options.push([n].concat(P))
        improved += tryOrders(all, options)
      })
      var rng = (z => () => (z = (z*1664525 + 1013904223) % 4294967296)/4294967296)(7 + pass)
      var shuffle = a => { a = a.slice(); for (var i = a.length - 1; i > 0; i--){ var j = Math.floor(rng()*(i + 1)), t = a[i]; a[i] = a[j]; a[j] = t } return a }
      named.map(n => ({n: n, k: problemsOf([n])})).filter(o => o.k > 0).sort((a, b) => b.k - a.k).forEach(o => {
        var n = o.n, hood = named.filter(m => m !== n && (Math.hypot(m.x - n.x, m.y - n.y) < 80 || (meta[m.name].best && meta[n.name].best && boxDist(meta[m.name].best.box, {x: n.x, y: n.y, r: 0}) < 60)))
          .sort((a, b) => Math.hypot(a.x - n.x, a.y - n.y) - Math.hypot(b.x - n.x, b.y - n.y)).slice(0, HOOD)
        var all = [n].concat(hood), orders = [[n].concat(hood), hood.concat([n])]; for (var oi = 0; oi < ORDS; oi++) orders.push(shuffle(all))
        improved += tryOrders(all, orders)
      })
      if (!improved) break
    }
    }
    var idxOf = {}, objOf = null, saStats = null
    function runAnneal(){
      var SAK = SEARCH.k, SAMOVES = SEARCH.moves, T0 = SEARCH.t0, T1 = SEARCH.t1, SWAPP = SEARCH.swapp
      var NEAR = SEARCH.near, SEP = SEARCH.sep, KALL = SEARCH.kall, SWTOL = SEARCH.swtol, SASEED = SEARCH.saseed
      var EDGE = SEARCH.edge, ROUNDS = SEARCH.rounds, TR = SEARCH.tr, RESTARTS = SEARCH.restarts
      var sa0 = performance.now()
      named.forEach((n, a) => idxOf[n.name] = a)
      var seed = {}; named.forEach(n => seed[n.name] = meta[n.name].best)

      named.forEach(n => setLabel(n, null))
      var SA_OPT = {cost: Cost.view({cw: 0}), kk: KALL}, SA_OPT_NB = Object.assign({below: 0}, SA_OPT), SA_OPT_GEN = Object.assign({general: 1}, SA_OPT)
      var cands = named.map(n => {
        var m = meta[n.name], out = [null]
        var take = (b, cap, sep, keep) => { if (!b) return; var SP = sep || SEP; b.cands.forEach(c => {
          if (out.length > (cap || SAK)) return
          if (keep && !keep(c)) return
          if (c.box.x < EDGE || c.box.y < EDGE || c.box.x + c.box.w > width - EDGE || c.box.y + c.box.h > height - EDGE) return
          for (var t = 1; t < out.length; t++){ var o = out[t]
            if (o.anchor == c.anchor && Math.abs(o.box.x - c.box.x) < SP && Math.abs(o.box.y - c.box.y) < SP) return }
          out.push(c) }) }
        take(bestSpot(n, m, true, SA_OPT))
        if (out.length <= SAK) take(bestSpot(n, m, true, SA_OPT_NB))
        if (rim[n.i] && SL) take(bestSpot(n, m, true, SA_OPT_GEN), SAK + SEARCH.rimx)
        if (rim[n.i] && SL && SEARCH.rimfine) take(bestSpot(n, m, true, SA_OPT), SAK + SEARCH.rimx + SEARCH.rimfine, .5, c => reachOf(n, c.box) <= SEARCH.elevMax + LABEL.ringStep)
        var s = seed[n.name]
        if (s) out.push({x: s.x, y: s.y, anchor: s.anchor, box: s.box})
        return out })

      var NL = named.length, env = cands.map((cs, a) => { var n = named[a], e = [n.x, n.y, n.x, n.y]
        cs.forEach(c => { if (!c) return; e[0] = Math.min(e[0], c.box.x); e[1] = Math.min(e[1], c.box.y); e[2] = Math.max(e[2], c.box.x + c.box.w); e[3] = Math.max(e[3], c.box.y + c.box.h) }); return e })
      var nb = [], pidx = [], np = 0
      for (var a = 0; a < NL; a++){ nb.push([]); pidx.push({}) }
      for (var a = 0; a < NL; a++) for (var b = a + 1; b < NL; b++){ var EA = env[a], EB = env[b]
        if ((EA[2] < EB[0] || EB[2] < EA[0] || EA[3] < EB[1] || EB[3] < EA[1]) && Math.hypot(named[a].x - named[b].x, named[a].y - named[b].y) > NEAR) continue
        nb[a].push(b); nb[b].push(a); pidx[a][b] = pidx[b][a] = np++ }
      var pcache = new Array(np), sc = null
      function pc(a, i, b, j){
        if (a > b){ var t = a; a = b; b = t; t = i; i = j; j = t }
        var p = pidx[a][b]; if (p === undefined) return 0
        var Kb = cands[b].length, arr = pcache[p] || (pcache[p] = new Float32Array(cands[a].length*Kb).fill(-1))
        var ix = i*Kb + j, v = arr[ix]
        if (v >= 0) return v
        v = Cost.pair(named[a], cands[a][i], named[b], cands[b][j]); arr[ix] = v; return v
      }
      var asg = new Int32Array(NL)
      named.forEach((n, a) => { var s = seed[n.name]; if (!s) return
        for (var i = 1; i < cands[a].length; i++){ var c = cands[a][i]
          if (Math.abs(c.x - s.x) < .01 && Math.abs(c.y - s.y) < .01 && c.anchor == s.anchor){ asg[a] = i; break } } })
      var writeAsg = () => named.forEach((n, a) => setLabel(n, cands[a][asg[a]], cands[a][asg[a]] ? cands[a][asg[a]].lp : null))
      function refreshLeaders(){
        writeAsg()
        named.forEach((n, a) => { var m = meta[n.name], was = m.best
          setLabel(n, null)
          cands[a].forEach(c => { if (c) c.lp = leaderPath(n, c.x, c.y, c.anchor, m) })
          setLabel(n, was, was ? was.lp : null) })
        sc = cands.map((cs, a) => cs.map(c => Cost.unary(named[a], c)))
        pcache = new Array(np)
      }
      var costAt = (a, i) => { var s = sc[a][i], l = nb[a]; for (var t = 0; t < l.length; t++) s += pc(a, i, l[t], asg[l[t]]); return s }
      var matchAt = (a, c) => { var cs = cands[a], bi = -1, bd = SWTOL
        for (var i = 1; i < cs.length; i++){ var o = cs[i]
          if (o.anchor != c.anchor) continue
          var d = Math.abs(o.x - c.x) + Math.abs(o.y - c.y); if (d < bd){ bd = d; bi = i } }
        return bi }
      var energy = () => { var e = 0
        for (var a = 0; a < NL; a++){ e += sc[a][asg[a]]; for (var t = 0; t < nb[a].length; t++) if (nb[a][t] > a) e += pc(a, asg[a], nb[a][t], asg[nb[a][t]]) }
        return e }
      var mkRnd = z => () => (z = (z*1664525 + 1013904223) >>> 0)/4294967296
      var rnd = mkRnd(SASEED)
      var seedE = null, bestE = null, acc = 0, seedAsg = Int32Array.from(asg), gBest = null, gBestE = Infinity
      var SIB = window.forceSiblings || null
      var arcStats = {arcs: 0, kept: 0, dE: 0, ms: 0}, KNOT = SEARCH.knot, KNOTR = SEARCH.knotr, KNOTN = SEARCH.knotn, knotStats = {knots: 0, solved: 0, nodes: 0}
      var near2 = (a, b) => Math.hypot(named[a].x - named[b].x, named[a].y - named[b].y)
      function finish(){
        if (SEARCH.arck > 1) for (var ap = 0; ap < 3; ap++){ var kept0 = arcStats.kept; arcSolve(); if (arcStats.kept == kept0) break }
        if (KNOT > 1){
          var preKnot = Int32Array.from(asg), preE = energy()
          knotSolve(); refreshLeaders()
          var postE = energy()
          if (!(postE < preE - 1e-9)){ asg.set(preKnot); refreshLeaders() }
          knotStats.dE = +(Math.min(0, postE - preE)).toFixed(2) } }
      for (var rs = 0; rs < RESTARTS; rs++){
      var sib = SIB && SIB.take && rs ? SIB.take(rs) : null
      if (sib && !(sib.seedE === seedE && sib.seed && sib.seed.length == NL && sib.seed.every((v, a) => v === seedAsg[a]))) sib = null
      if (sib){ var sfe = sib.fe == null ? NaN : sib.fe; acc += sib.acc; if (sfe < gBestE){ gBestE = sfe; gBest = Int32Array.from(sib.asg) } continue }
      if (SIB && SIB.only != null && rs != SIB.only) continue
      var acc0 = acc
      asg.set(seedAsg); rnd = mkRnd(SASEED + rs*7919)
      for (var round = 0; round < ROUNDS; round++){
        refreshLeaders()
        var E = energy(); if (seedE === null) seedE = E
        var bestCur = Int32Array.from(asg)
        bestE = E
        var T = round ? T0*TR : T0, cool = Math.pow(T1/T, 1/Math.max(1, SAMOVES))   // later rounds start cooler: the layout is already good
        for (var it = 0; it < SAMOVES; it++){
          T *= cool
          var a = (rnd()*NL)|0, d
          if (rnd() < SWAPP && nb[a].length){
            var b = nb[a][(rnd()*nb[a].length)|0], oa = asg[a], ob = asg[b]
            if (!cands[a][oa] || !cands[b][ob]) continue
            var ia = matchAt(a, cands[b][ob]), ib = matchAt(b, cands[a][oa])
            if (ia < 0 || ib < 0 || (ia == oa && ib == ob)) continue
            var old = costAt(a, oa) + costAt(b, ob) - pc(a, oa, b, ob)
            asg[a] = ia; asg[b] = ib
            d = costAt(a, ia) + costAt(b, ib) - pc(a, ia, b, ib) - old
            if (d <= 0 || rnd() < Math.exp(-d/T)){ E += d; acc++ } else { asg[a] = oa; asg[b] = ob }
          } else {
            var i = (rnd()*cands[a].length)|0
            if (i == asg[a]) continue
            d = costAt(a, i) - costAt(a, asg[a])
            if (d <= 0 || rnd() < Math.exp(-d/T)){ asg[a] = i; E += d; acc++ }
          }
          if (E < bestE - 1e-9){ bestE = E; bestCur.set(asg) }
        }
        asg.set(bestCur)
      }
      refreshLeaders(); finish(); var fe = energy()
      if (SIB && SIB.give) SIB.give(rs, {fe: fe, asg: Array.from(asg), acc: acc - acc0, seed: Array.from(seedAsg), seedE: seedE})
      if (fe < gBestE){ gBestE = fe; gBest = Int32Array.from(asg) }
      }
      asg.set(gBest); bestE = gBestE; refreshLeaders()
      function arcSolve(){
        var t0 = performance.now(), K = SEARCH.arck, groups = {}; arcStats.passes = (arcStats.passes || 0) + 1
        named.forEach((n, a) => { if (!rim[n.i]) return; var k = Math.round(axisOf(n)*100); (groups[k] = groups[k] || []).push(a) })
        Object.keys(groups).forEach(key => { var G = groups[key]; if (G.length < 3) return
          var vert = Math.abs(Math.sin(key/100)) > .5
          G.sort((p, q) => vert ? named[p].x - named[q].x : named[p].y - named[q].y)
          var inG = {}; G.forEach(a => inG[a] = 1)
          var OPT = G.map(a => { var n = named[a], cs = cands[a], pr = []
            for (var i = 1; i < cs.length; i++){ var k = sc[a][i]; nb[a].forEach(o => { if (!inG[o]) k += pc(a, i, o, asg[o]) }); if (k < W.hard) pr.push({i: i, k: k, c: cs[i]}) }
            pr.sort((x, y) => x.k - y.k)
            var take = [], bands = [[], [], [], []], cur = pr.filter(o => o.i == asg[a])[0]
            if (cur) take.push(cur)
            pr.forEach(o => bands[Math.min(3, Math.max(0, Math.floor(reachOf(n, o.c.box)/12)))].push(o))
            var per = Math.ceil((K - take.length)/4), near = (o, p) => o.c.anchor == p.c.anchor && Math.abs(o.c.box.x - p.c.box.x) < 1.5 && Math.abs(o.c.box.y - p.c.box.y) < 1.5
            bands.forEach(B => { var got = 0; for (var t = 0; t < B.length && got < per; t++){ var o = B[t]; if (take.some(p => p === o || near(o, p))) continue; take.push(o); got++ } })
            return take.slice(0, K) })
          var N = G.length, kOf = t => t < 0 ? 1 : OPT[t].length
          if (OPT.some(o => !o.length)) return
          var pp = (t, c, s, j) => s < 0 ? 0 : pc(G[t], OPT[t][c].i, G[s], OPT[s][j].i)
          var D = [], B = []
          for (var t = 0; t < N; t++){ var ka = kOf(t - 2), kb = kOf(t - 1), kc = kOf(t), kz = kOf(t - 3)
            var d = new Float64Array(ka*kb*kc).fill(Infinity), bk = new Int32Array(ka*kb*kc)
            var P1 = new Float64Array(kb*kc), P2 = new Float64Array(ka*kc), P3 = new Float64Array(kz*kc)
            for (var c = 0; c < kc; c++){ for (var j = 0; j < kb; j++) P1[j*kc + c] = pp(t, c, t - 1, j)
              for (var j = 0; j < ka; j++) P2[j*kc + c] = pp(t, c, t - 2, j)
              for (var j = 0; j < kz; j++) P3[j*kc + c] = pp(t, c, t - 3, j) }
            var prev = t ? D[t - 1] : null
            for (var a = 0; a < ka; a++) for (var b = 0; b < kb; b++){
              for (var z = 0; z < kz; z++){ var base = prev ? prev[(z*ka + a)*kb + b] : 0; if (base === Infinity) continue
                for (var c = 0; c < kc; c++){ var v = base + OPT[t][c].k + P1[b*kc + c] + P2[a*kc + c] + P3[z*kc + c], ix = (a*kb + b)*kc + c
                  if (v < d[ix]){ d[ix] = v; bk[ix] = z } } } }
            D.push(d); B.push(bk) }
          var last = D[N - 1], bi = 0; for (var i = 1; i < last.length; i++) if (last[i] < last[bi]) bi = i
          if (!(last[bi] < W.hard)) return
          var kc = kOf(N - 1), kb = kOf(N - 2), pick = new Int32Array(N), c = bi % kc, b = Math.floor(bi/kc) % kb, a = Math.floor(bi/(kc*kb))
          for (var t = N - 1; t >= 0; t--){ pick[t] = c; var z = B[t][(a*kOf(t - 1) + b)*kOf(t) + c]; c = b; b = a; a = z }
          var was = Int32Array.from(asg), preE = energy()
          G.forEach((m, t) => asg[m] = OPT[t][pick[t]].i)
          refreshLeaders(); var postE = energy(); arcStats.arcs++
          if (postE < preE - 1e-9){ arcStats.kept++; arcStats.dE += postE - preE; bestE = postE } else { asg.set(was); refreshLeaders() } })
        arcStats.dE = +arcStats.dE.toFixed(2); arcStats.ms += Math.round(performance.now() - t0)
      }
      function knotSolve(){
        var bad = {}, done = {}
        for (var a = 0; a < NL; a++) for (var t = 0; t < nb[a].length; t++){ var b = nb[a][t]; if (b > a && pc(a, asg[a], b, asg[b]) >= 1){ bad[a] = 1; bad[b] = 1 } }
        for (var a = 0; a < NL; a++){ var ca = cands[a][asg[a]]; if (rim[named[a].i] && ca && ca.lp && leadDrawn(ca.lp) > SEARCH.knotlead) bad[a] = 1 }
        var badL = Object.keys(bad).map(Number).sort((a, b) => a - b)
        badL.forEach(a => { if (done[a]) return
          var K = [a].concat(badL.filter(b => b != a && !done[b] && near2(a, b) < KNOTR))
          nb[a].filter(b => K.indexOf(b) < 0 && !done[b] && near2(a, b) < KNOTR).sort((b, c) => near2(a, b) - near2(a, c)).forEach(b => K.push(b))
          K = K.slice(0, KNOT); K.forEach(b => done[b] = 1)
          if (SEARCH.knotord) K.sort((p, q) => Math.atan2(named[p].y - bcy, named[p].x - bcx) - Math.atan2(named[q].y - bcy, named[q].x - bcx))
          var inK = {}; K.forEach((b, k) => inK[b] = k + 1)
          var opts = K.map(b => cands[b].map((c, i) => { var k = sc[b][i]; nb[b].forEach(o => { if (!inK[o]) k += pc(b, i, o, asg[o]) }); return {i: i, k: k} })
            .filter(o => o.k < W.hard).sort((x, y) => x.k - y.k))
          var lb = new Float64Array(K.length + 1); for (var k = K.length - 1; k >= 0; k--) lb[k] = lb[k + 1] + (opts[k].length ? opts[k][0].k : 0)
          var pick = new Int32Array(K.length), best = 0, bestPick = null, nodes = 0
          K.forEach((b, k) => { best += sc[b][asg[b]]; nb[b].forEach(o => { if (!inK[o] || inK[o] - 1 > k) best += pc(b, asg[b], o, asg[o]) }) })
          var start = best
          ;(function dfs(k, part){
            if (k == K.length){ if (part < best - 1e-9){ best = part; bestPick = Int32Array.from(pick) } return }
            var b = K[k], os = opts[k]
            for (var t = 0; t < os.length && nodes < KNOTN; t++){ nodes++
              var i = os[t].i, v = part + os[t].k
              if (v + lb[k + 1] >= best - 1e-9) break
              for (var j = 0; j < k && v + lb[k + 1] < best; j++) v += pc(b, i, K[j], pick[j])
              if (v + lb[k + 1] >= best - 1e-9) continue
              pick[k] = i; dfs(k + 1, v) } })(0, 0)
          knotStats.knots++; knotStats.nodes += nodes
          if (bestPick && best < start - 1e-9){ K.forEach((b, k) => asg[b] = bestPick[k]); knotStats.solved++ }
        })
      }
      writeAsg()
      var stateOf = a => { var n = named[a], m = meta[n.name], b = m.best
        return b ? {x: b.x, y: b.y, anchor: b.anchor, box: b.box,
          lp: leaderPath(n, b.x, b.y, b.anchor, m)} : null }
      objOf = function(S){
        var inS = {}, st = {}, k = 0, get = a => (a in st) ? st[a] : (st[a] = stateOf(a))
        S.forEach(a => inS[a] = 1)
        S.forEach(a => { k += Cost.unary(named[a], get(a))
          nb[a].forEach(b => { if (inS[b] && b < a) return; k += Cost.pair(named[a], get(a), named[b], get(b)) }) })
        return k }
      var allIdx = d3.range(NL)
      saStats = {seedObj: +seedE.toFixed(2), saObj: +bestE.toFixed(2), cands: +(d3.mean(cands, c => c.length)).toFixed(1),
        pairs: np, accepted: acc, saMs: Math.round(performance.now() - sa0), objAfterSA: +objOf(allIdx).toFixed(2), knot: knotStats, arc: arcStats}
      window.saObjAll = () => +objOf(allIdx).toFixed(2)
      window.saProbe = nm => { var a = idxOf[nm]; if (a == null) return null
        return cands[a].map((c, i) => { var pr = 0; nb[a].forEach(b => pr += pc(a, i, b, asg[b]))
          return {i: i, dx: c ? +(c.box.x + c.box.w/2 - named[a].x).toFixed(0) : null, dy: c ? +(c.box.y + c.box.h/2 - named[a].y).toFixed(0) : null,
            anchor: c ? c.anchor : null, lead: c ? (c.lp ? c.lp.nodeHits : 'none') : null,
            sc: +sc[a][i].toFixed(1), pair: +pr.toFixed(1), tot: +(sc[a][i] + pr).toFixed(1), now: i == asg[a] ? 1 : 0} }) }
      var explainAsg = A => Cost.explain(named, a => cands[a][(A || asg)[a]], a => nb[a])
      window.forceExplain = explainAsg
      window.saBreak = () => { var t = explainAsg(), d = (x, w) => +(x/w).toFixed(1)
        return {stat: +STATIC_SUM.reduce((k, q) => k + t[q], 0).toFixed(1), lead: t.leaderExists, nodeHit: d(t.leaderThroughNode, W.nw),
          len: t.length, box: d(t.boxOverlap, W.hard), thru: d(t.leaderThroughBox + t.boxUnderLeader, W.lhw),
          cross: d(t.leaderCross, W.xw), par: d(t.parallelLegs, W.pw), miss: t.missing} }
      var energyNew = () => { var e = 0
        for (var a = 0; a < NL; a++){ e += Cost.unary(named[a], cands[a][asg[a]])
          for (var t = 0; t < nb[a].length; t++) if (nb[a][t] > a) e += Cost.pair(named[a], cands[a][asg[a]], named[nb[a][t]], cands[nb[a][t]][asg[nb[a][t]]]) }
        return e }
      Object.assign(Placer.debug, {energyOld: energy, energyNew: energyNew, assignment: () => Array.from(asg)})
    }
    var distOf = (n, b) => b ? Math.hypot(b.box.x + b.box.w/2 - n.x, b.box.y + b.box.h/2 - n.y) : Infinity
    function runTighten(){
    for (var tp = 0; tp < 2; tp++) named.forEach(n => { if (!rim[n.i] || !meta[n.name].best) return
      var m = meta[n.name], was = m.best, wasPath = pathOf(n), k0 = problemsOf([n]), d0 = distOf(n, was), o0 = objOf ? objOf([idxOf[n.name]]) : 0
      setLabel(n, null)
      var b = bestSpot(n, m); if (!b || distOf(n, b) >= d0 - 3){ setLabel(n, was, wasPath); return }
      setLabel(n, b); if (problemsOf([n]) > k0 || (objOf && objOf([idxOf[n.name]]) > o0 + 1e-9)){ setLabel(n, was, wasPath) } else moves++ })
    }
    var boxFor = (n, x, y, anchor) => boxOf(n, meta[n.name], x, y, anchor)
    var leadLen = n => { var b = meta[n.name].best; return b ? Math.hypot(b.box.x + b.box.w/2 - n.x, b.box.y + b.box.h/2 - n.y) : 0 }
    var rimNamed = named.filter(n => rim[n.i])
    function runSwap(){
    for (var sp = 0; sp < 3; sp++){ var swapsMade = 0
      rimNamed.forEach(a => rimNamed.forEach(b => { if (a.i >= b.i) return
        var A = meta[a.name].best, B = meta[b.name].best; if (!A || !B) return
        if (Math.hypot(A.box.x - B.box.x, A.box.y - B.box.y) > 70) return
        var before = leadLen(a) + leadLen(b), k0 = problemsOf([a, b]), o0 = objOf ? objOf([idxOf[a.name], idxOf[b.name]]) : 0
        var ca = {x: B.x, y: B.y, anchor: B.anchor, box: boxFor(a, B.x, B.y, B.anchor)}, cb = {x: A.x, y: A.y, anchor: A.anchor, box: boxFor(b, A.x, A.y, A.anchor)}
        setLabel(a, null); setLabel(b, null)
        var ok = clear(ca.box, a, 0); if (ok){ setLabel(a, ca); ok = clear(cb.box, b, 0) }
        if (ok){ setLabel(b, cb); var after = leadLen(a) + leadLen(b)
          if (after < before - 4 && problemsOf([a, b]) <= k0 && (!objOf || objOf([idxOf[a.name], idxOf[b.name]]) <= o0 + 1e-9)){ swapsMade++; return } }
        setLabel(a, A); setLabel(b, B) }))
      moves += swapsMade; if (!swapsMade) break }
    }
    function runCompact(){
      var near = (a, b) => Math.abs(a.x - b.x) < 160 && Math.abs(a.y - b.y) < 160
      var stateNow = n => { var b = meta[n.name].best; return b ? {x: b.x, y: b.y, anchor: b.anchor, box: b.box, lp: leaderPath(n, b.x, b.y, b.anchor, meta[n.name])} : null }
      var reachNow = n => { var b = meta[n.name].best; return b ? reachOf(n, b.box) : 0 }
      var pulled = 0, straightened = 0, slid = 0
      for (var cp = 0; cp < 3; cp++){ var movedPass = 0
        rimNamed.filter(n => meta[n.name].best).sort((a, b) => reachNow(a) - reachNow(b)).forEach(n => {
          var m = meta[n.name], nbs = named.filter(o => o !== n && meta[o.name].best && near(o, n)), nst = nbs.map(stateNow)
          var objAt = s => { var k = Cost.unary(n, s); for (var i = 0; i < nbs.length; i++) k += Cost.pair(n, s, nbs[i], nst[i]); return k }
          var cur = stateNow(n), o0 = objAt(cur), k0 = problemsOf([n]), moved = 0
          var spot = (x, y, an) => { x = onGrid(n.x, x); y = onGrid(n.y, y); return {x: x, y: y, anchor: an, box: boxFor(n, x, y, an)} }
          var tryAt = (c, lim, straight) => { var was = m.best, wasPath = pathOf(n), o1 = -1
            setLabel(n, null)
            if (clear(c.box, n, 1)){ setLabel(n, c); var st = stateNow(n); o1 = objAt(st)
              if (o1 <= lim && problemsOf([n]) <= k0 && !(straight && (!st.lp || st.lp.kind == 'elbow'))) return o1
              o1 = Infinity }
            setLabel(n, was, wasPath); return o1 }
          if (cur && cur.lp && cur.lp.kind == 'elbow'){ var jb = m.best, jx = jb.box, jumps = []
            if (jx.side){ var jr = rowsOf(jx), nr = jr[jx.side < 0 ? jr.length - 1 : 0], d = n.x < nr.x ? n.x - nr.x + 1 : n.x - nr.x - nr.w - 1
              var yOff = jx.side < 0 ? Math.min(0, n.y - n.r - LABEL.ring0 - (jx.y + jx.h)) : Math.max(0, n.y + n.r + LABEL.ring0 - jx.y)
              var rT = n.r + LABEL.minDrawn + 2, yTick = jx.side < 0 ? Math.min(0, n.y - rT - (jx.y + jx.h)) : Math.max(0, n.y + rT - jx.y)
              ;[0, 3, 8].forEach(k => { var tx = jb.x + d + Math.sign(d)*k
                jumps.push([tx, jb.y, jb.anchor]); if (yOff) jumps.push([tx, jb.y + yOff, jb.anchor]); if (yTick != yOff) jumps.push([tx, jb.y + yTick, jb.anchor]) }) }
            else { var ay = cur.lp.a[1], jy = jb.y + n.y - Math.max(ay - 3.5, Math.min(ay + 3, n.y))
              var edge = jb.anchor == 'end' ? n.x - n.r - LABEL.ring0 : jb.anchor == 'start' ? n.x + n.r + LABEL.ring0 : null
              ;[jy, jb.y + n.y - ay].forEach(v => { jumps.push([jb.x, v, jb.anchor]); if (edge != null) jumps.push([edge, v, jb.anchor]) }) }
            jumps.map(j => ({j: j, d: Math.hypot(j[0] - jb.x, j[1] - jb.y)})).sort((a, c) => a.d - c.d).some(o => {
              var c = spot(o.j[0], o.j[1], o.j[2]), o1 = c.box.side === jx.side ? tryAt(c, o0 + 1e-9, 1) : -1
              if (!(o1 >= 0 && o1 < Infinity)) return false
              o0 = o1; moved++; straightened++; return true }) }
          for (var guard = 0; guard < 160; guard++){
            var b = m.best, bx = b.box, sd = bx.side, steps = []
            var lpn = pathOf(n), toward = d => Math.abs(d) < .05 ? 0 : -Math.sign(d)*Math.min(1, Math.abs(d)), br = rowsOf(bx), nr0 = br[sd < 0 ? br.length - 1 : 0]
            var dc = !sd ? (lpn ? (lpn.mid != null ? lpn.mid : lpn.a[1]) - n.y : 0) : nr0.x + nr0.w/2 - n.x
            if (toward(dc)) steps.push(sd ? [toward(dc), 0] : [0, toward(dc)])
            if (sd) steps.push([0, sd < 0 ? 1 : -1])
            else if (bx.x > n.x + n.r) steps.push([-1, 0]); else if (bx.x + bx.w < n.x - n.r) steps.push([1, 0])
            for (var ek = 1; ek <= 6; ek++) steps.push(sd ? [ek, 0, 1] : [0, ek, 1], sd ? [-ek, 0, 1] : [0, -ek, 1])
            if (!steps.some(st => { var c = spot(b.x + st[0], b.y + st[1], b.anchor)
              if (c.box.side !== sd) return false
              var o1 = tryAt(c, st[2] ? o0 - 1e-6 : o0 + 1e-9); if (!(o1 >= 0 && o1 < Infinity)) return false
              o0 = o1; return true })) break
            moved++ }
          var b0 = m.best, sd0 = b0.box.side, L0 = pathOf(n)
          if (sd0 && L0 && leadDrawn(L0) > SEARCH.row1) for (var sl = -Math.ceil(n.r); sl <= n.r; sl++) for (var k = 1; sl && k < 60; k++){
            var c = spot(b0.x + sl, b0.y - sd0*k, b0.anchor); if (c.box.side !== sd0) break
            var o1 = tryAt(c, o0 - 1e-9, L0.kind != 'elbow'); if (o1 < 0) break
            if (o1 < Infinity){ o0 = o1; moved++; slid++ } }
          if (moved){ pulled += moved; movedPass++ } })
        if (!movedPass) break }
      moves += pulled ? 1 : 0
      compactStats = {px: pulled, straightened: straightened, slid: slid}
    }
    var compactStats = null
    function reElbow(asg){
      applyAsg(asg)
      placed.filter(b => b.n).forEach(b => setLabel(b.n, meta[b.n.name].best, asg.exportLeaders ? meta[b.n.name].best.lp : null))
      return captureAsg(asg.exportLeaders)
    }
    var STRATEGIES = {
      none:    {name: 'none',    kind: 'search', run: function(asg){ named.forEach(n => setLabel(n, null)); return captureAsg(0) }},
      greedy:  {name: 'greedy',  kind: 'search', run: function(asg){ applyAsg(asg); runGreedy();  return captureAsg(asg.exportLeaders) }},
      repair:  {name: 'repair',  kind: 'search', run: function(asg){ applyAsg(asg); runRepair();  return captureAsg(asg.exportLeaders) }},
      anneal:  {name: 'anneal',  kind: 'search', run: function(asg){ applyAsg(asg); runAnneal();  return captureAsg(1) }},
      tighten: {name: 'tighten', kind: 'polish', run: function(asg){ applyAsg(asg); runTighten(); return captureAsg(asg.exportLeaders) }},
      swap:    {name: 'swap',    kind: 'polish', run: function(asg){ applyAsg(asg); runSwap();    return captureAsg(asg.exportLeaders) }},
      compact: {name: 'compact', kind: 'polish', run: function(asg){ applyAsg(asg); runCompact(); return captureAsg(asg.exportLeaders) }}
    }
    function pipeline(names){
      var list = String(names).split('+').map(s => s.trim()).filter(s => s && s != 'none')
      var bad = list.filter(s => !STRATEGIES[s])
      if (bad.length){ console.warn('force: unknown search pass ' + bad.join('+') + ' — falling back to ' + DEFAULTS.pipeline)
        list = DEFAULTS.pipeline.split('+').filter(s => s != 'none') }
      return {name: list.join('+'), passes: list, run: function(asg){
        var elbowed = 0
        list.forEach(nm => { var s = STRATEGIES[nm]
          if (s.kind == 'polish' && !elbowed){ elbowed = 1; asg = reElbow(asg) }
          asg = s.run(asg) })
        return elbowed ? asg : reElbow(asg) }}
    }
    var PIPE = pipeline(PARAMS.pipeline)
    placement = render(PIPE.run(STRATEGIES.none.run(captureAsg(0))))
    var spotsNow = () => named.map(n => { var m = meta[n.name]; if (!m.best) return null
      return {box: m.best.box, lp: pathOf(n) || null} })
    window.forceAudit = function(){
      var all = d3.range(named.length), out = {}
      var spots = spotsNow()
      var t = AUDIT_COST.explain(named, a => spots[a], () => all)
      TERMS.forEach(x => { if (x.audit) out[x.audit] = (out[x.audit] || 0) + t[x.name] })
      out.crossings = t.leaderCross
      out.total = Object.keys(out).reduce((k, q) => k + out[q], 0)
      return out
    }
    function debugSpots(name){ var n = named.filter(m => m.name == name)[0]; if (!n) return null; var m = meta[n.name], was = m.best
      setLabel(n, null); var b = bestSpot(n, m, true); setLabel(n, was)
      return b ? b.cands.map(c => ({dx: +(c.box.x + c.box.w/2 - n.x).toFixed(0), dy: +(c.box.y + c.box.h/2 - n.y).toFixed(0), anchor: c.anchor, cost: +c.cost.toFixed(2), straight: c.straight || 0})) : [] }
    function debugExplain(assignment){
      if (assignment && window.forceExplain) return window.forceExplain(assignment)
      var spots = spotsNow(), all = d3.range(named.length)
      return Cost.explain(named, a => spots[a], () => all)
    }
    Object.assign(Placer.debug, {spots: debugSpots, explain: debugExplain})
    window.forceSpots = debugSpots
    var long = leaders.filter(p => Math.abs(p.e[0] - p.s[0]) + Math.abs(p.e[1] - p.s[1]) + Math.abs(p.a[0] - p.e[0]) + Math.abs(p.a[1] - p.e[1]) > 45).length, floatLeaders = leaders.filter(p => !rim[p.n.i]).length
    window.forceLabels = Object.assign({wanted: named.length, placed: placed.filter(b => b.n).length, rim: Object.keys(rim).length, problems: problemsOf(named), moves: moves, leaders: leaders.length, long: long, floatLeaders: floatLeaders, compact: compactStats, placeMs: Math.round(performance.now() - t1)},
      saStats ? Object.assign({}, saStats, {objFinal: window.saObjAll()}) : {})
    }
  }

  var cur = null, dragging = false, V = window.visState
  function nearestAt(m){
    var best = null, lim = isMobile ? 18/px : 10, bestD = Infinity   // a finger reaches 18 screen px, whatever the viewBox scale
    nodes.forEach(n => { var dx = n.x - m[0], dy = n.y - m[1], dd = Math.sqrt(dx*dx + dy*dy) - n.r; if (dd < lim && dd < bestD){ bestD = dd; best = n } })
    return best
  }
  var byKey = {}; nodes.forEach(n => byKey[n.key] = n)
  var HI = '#f0f'
  function show(n){
    cur = n
    var ep = window.visState.ep
    nodeSel.classed('on', m => m === n)
    if (n) nodeSel.filter(m => m === n).raise()
    nodeSel.select('.shell').style('stroke', m => m === n ? HI : null).style('stroke-width', m => m === n ? 1.6 : null)
    nodeSel.selectAll('circle.dot').style('stroke', d => d.d === ep ? HI : null).style('stroke-width', d => d.d === ep ? 1.4 : null)

  }
  function dotAt(n, m){
    var best = null, bd = DOT*1.6
    n.dots.forEach(d => { var dd = Math.hypot(n.x + d.x - m[0], n.y + d.y - m[1]); if (dd < bd){ bd = dd; best = d.d } })
    return best
  }
  svg.append('rect').at({width: width, height: height, opacity: 0}).lower()
  svg
    .on('mousemove', function(){
      if (V.stuck || dragging || coarse || d3.event.shiftKey) return
      var m = d3.mouse(this), n = nearestAt(m)
      if (!n) return
      var ep = dotAt(n, m), st = window.visState
      if (n !== cur || ep !== st.ep) pick(n, ep)
    })
    .on('click', function(){
      d3.event.stopPropagation()
      var m = d3.mouse(this), n = nearestAt(m)
      if (!n){ release(); return }
      var ep = dotAt(n, m), v = window.visState
      if (V.stuck && v.guest == n.key && (ep || null) === (v.ep || null)){ release(); return }
      if (isMobile && V.stuck && v.guest == n.key && !ep){ release(); return }
      V.stuck = true; pick(n, ep || tapEp(n))
    })
  if (isMobile && !PORTRAIT) svg.st({touchAction: 'none'}).on('touchstart touchmove', function(){
    var t = d3.touches(this)[0]
    if (!t) return
    d3.event.preventDefault()
    var n = nearestAt(t)
    if (n && n !== cur){ V.stuck = true; pick(n) }
  })
  d3.select(document).on('keydown.podforce', function(){ if (d3.event.key == 'Escape') V.stuck = false })
  d3.select(document).on('click.podforce', function(){ if (V.stuck && !d3.event.target.closest('.tour-force')) V.stuck = false })
  function pick(n, ep){ var v = window.visState; v.guest = n.key; v.ep = ep || null; renderAll.guest(); renderAll.ep() }
  function tapEp(n){ return isMobile ? n.eps[n.eps.length - 1] || null : null }
  function release(){ V.stuck = false; if (isMobile && window.visState.ep){ window.visState.ep = null; renderAll.guest(); renderAll.ep() } }
  var render = () => show(window.visState.guest ? byKey[window.visState.guest] || null : null)
  renderAll.guest.fns.force = render; renderAll.ep.fns.force = render
  render()
  if (!FORCE_OPT.has('drag')) labelG.selectAll('text.perm').style('pointer-events', 'all').style('cursor', 'pointer')
    .on('mouseenter', function(n){ if (!n || V.stuck || dragging || coarse) return; pick(n) })
    .on('click', function(n){ if (!n) return; d3.event.stopPropagation(); var v = window.visState
      if (V.stuck && v.guest == n.key){ release(); return } V.stuck = true; pick(n, tapEp(n)) })

  window.forceExport = () => { var o = {_ref: [width, height]}; nodes.forEach(n => o[n.key] = [+n.x.toFixed(1), +n.y.toFixed(1)]); return o }
  window.forceLabelExport = () => toExport ? toExport(placement) : {}
  window.forceStats = {baked: !!fixed, nodes: nodes.length, edges: links.length, layoutMs: layoutMs, fit: +fit.toFixed(3), width: width, height: height,
    hostsNamed: hostG.selectAll('text').size(), hosts: hostInfo, labels: labelG.selectAll('text').size()}
  if (SCENE) window.forceStats.scene = SCENE.name || true
}

if (window.episodes) drawForce(window.episodes)
