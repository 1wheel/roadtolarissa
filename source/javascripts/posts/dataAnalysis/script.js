var f = d3.f

// d3.csv('/javascripts/posts/dataAnalysis/data.csv', function(data){
d3.csv('data.csv', function(nominations){
  //convert the award ceremony index to a number  
  nominations.forEach(function(d){ d.ceremonyNum = +d.ceremonyNum })

  //check that every ceremony has been loaded
  d3.extent(nominations, f('ceremonyNum')) //[1, 87]


  //select only actress nominations
  var actressNominations = nominations.filter(function(d){ 
    return d.award == 'ACTRESS' })

  //group by actress
  var byActress = d3.nest().key(f('name')).entries(actressNominations)

  //sanity check - Merylr Strep has 15 nominations
  d3.max(byActress, f('values', 'length'))

  //count previous nominations
  byActress.forEach(function(actress){
    actress.values.forEach(function(nomination, i){
      nomination.prevNominations = i
      //attach a reference to the actress group
      nomination.otherNominations = actress.values
    })
  })

  !(function(){
    var c = d3.conventions({parentSel: d3.select('#nominations-scatter')})

    //compute domain of scales
    c.x.domain(d3.extent(actressNominations, f('ceremonyNum')))
    c.y.domain(d3.extent(actressNominations, f('prevNominations')))
    
    //draw x and y axis
    c.drawAxis()

    //draw circles
    c.svg.dataAppend(actressNominations, 'circle.nomination')
        .attr('cx', f('ceremonyNum', c.x))
        .attr('cy', f('prevNominations', c.y))
        .classed('winner', f('won'))
        .attr('r', 3)
        .call(d3.attachTooltip)
  })()



  !(function(){
    var c = d3.conventions({parentSel: d3.select('#nominations-offset')})

    c.x.domain(d3.extent(actressNominations, f('ceremonyNum')))
    c.y.domain(d3.extent(actressNominations, f('prevNominations')))
    c.drawAxis()
    
    //calculate offset 
    d3.nest()
      .key(function(d){ return d.ceremonyNum + '-' + d.prevNominations })
      .entries(actressNominations)
    .forEach(function(year){
      //sort nominations so winners come first  
      year.values.sort(d3.descendingKey('won')).forEach(function(d, i){
        d.offset = i
        //save new position as a property for labels later
        d.pos = [c.x(d.ceremonyNum) + i*1.5, c.y(d.prevNominations) - i*3]
      })
    })


    c.svg.dataAppend(_.sortBy(actressNominations, f('offset')), 'circle.nomination')
        //position with transform translate instead
        .translate(f('pos'))
        .classed('winner', f('won'))
        .attr('r', 3)
        .call(d3.attachTooltip)
  })()


  !(function(){
    var c = d3.conventions({parentSel: d3.select('#nominations-linked')})

    c.x.domain(d3.extent(actressNominations, f('ceremonyNum')))
    c.y.domain(d3.extent(actressNominations, f('prevNominations')))
    c.drawAxis()
    
    d3.nest()
      .key(function(d){ return d.ceremonyNum + '-' + d.prevNominations })
      .entries(actressNominations)
    .forEach(function(year){
      year.values.sort(d3.descendingKey('won')).forEach(function(d, i){
        d.offset = i
        d.pos = [c.x(d.ceremonyNum) + i*1.5, c.y(d.prevNominations) - i*3]
      })
    })

    var mouseoverPath = c.svg.append('path.mouseconnection')

    var topActresses = byActress.filter(function(d){ return d.values.length > 5 })

    c.svg.dataAppend(topActresses, 'path.connection')
        .attr('d', function(d){ return 'M' + d.values.map(f('pos')).join('L') })

    c.svg.dataAppend(topActresses, 'text')
        //values are sorted by time - most recent nomination is always last 
        .translate(function(d){ return _.last(d.values).pos })
        .text(f('key'))
        .attr({dy: -4, 'text-anchor': 'middle'})

    var circles = c.svg.dataAppend(_.sortBy(actressNominations, f('offset')), 'circle.nomination')
        .translate(f('pos'))
        .classed('winner', f('won'))
        .attr('r', 3)
        .call(d3.attachTooltip)

    circles.on('mouseover', function(d){
      //make nominations with the same actor larger
      circles.attr('r', function(e){ return d.name == e.name ? 5 : 3 })
      //connect lines with a path
      mouseoverPath.attr('d', 'M' + d.otherNominations.map(f('pos')).join('L'))
    })
  })()



  !(function(){
    var c = d3.conventions({parentSel: d3.select('#nominations-average')})

    c.x.domain(d3.extent(actressNominations, f('ceremonyNum')))
    c.y.domain(d3.extent(actressNominations, f('prevNominations')))
    c.drawAxis()
    
    d3.nest()
      .key(function(d){ return d.ceremonyNum + '-' + d.prevNominations })
      .entries(actressNominations)
    .forEach(function(year){
      year.values.sort(d3.descendingKey('won')).forEach(function(d, i){
        d.offset = i
        d.pos = [c.x(d.ceremonyNum) + i*1.5, c.y(d.prevNominations) - i*3]
      })
    })

    //group by year
    var byYear = d3.nest().key(f('ceremonyNum')).entries(actressNominations)
    byYear.forEach(function(d, i){
      //for each year, select previous 15 years
      var prevYears = byYear.slice(Math.max(0, i - 15), i + 1)
      //create array of all nominations over previous 15 years
      var prevNoms = _.flatten(prevYears.map(f('values')))

      //calculate average number of previous nominations for nominees and winners 
      d.nomAvgPrev = d3.mean(prevNoms,                  f('prevNominations'))
      d.wonAvgPrev = d3.mean(prevNoms.filter(f('won')), f('prevNominations'))
    })

    var line = d3.svg.line()
        .x(f('key', c.x))
        .y(f('nomAvgPrev', c.y))

    c.svg.append('path.nomAvg').attr('d', line(byYear))
    c.svg.append('path.winAvg').attr('d', line.y(f('wonAvgPrev', c.y))(byYear))

    var mouseoverPath = c.svg.append('path.mouseconnection')

    var topActresses = byActress.filter(function(d){ return d.values.length > 5 })

    c.svg.dataAppend(topActresses, 'path.connection')
        .attr('d', function(d){ return 'M' + d.values.map(f('pos')).join('L') })

    c.svg.dataAppend(topActresses, 'text')
        //values are sorted by time - most recent nomination is always last 
        .translate(function(d){ return _.last(d.values).pos })
        .text(f('key'))
        .attr({dy: -4, 'text-anchor': 'middle'})

    var circles = c.svg.dataAppend(_.sortBy(actressNominations, f('offset')), 'circle.nomination')
        .translate(f('pos'))
        .classed('winner', f('won'))
        .attr('r', 3)
        .call(d3.attachTooltip)

    circles.on('mouseover', function(d){
      //make nominations with the same actor larger
      circles.attr('r', function(e){ return d.name == e.name ? 5 : 3 })
      //connect lines with a path
      mouseoverPath.attr('d', 'M' + d.otherNominations.map(f('pos')).join('L'))
    })
  })()


  !(function(){
    var c = d3.conventions({parentSel: d3.select('#overtime')})

    c.x.domain(d3.extent(actressNominations, f('nth')))
    c.y.domain([0, byActress.length - 1])

    c.svg.append('g')
        .translate(function(d, i){ return [0, i] })
      .dataAppend(f('values'), circle)
        .attr('cx', f('nth'), x)
  })


})

