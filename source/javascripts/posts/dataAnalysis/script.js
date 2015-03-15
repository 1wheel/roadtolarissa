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

    var circles = c.svg.dataAppend(_.sortBy(actressNominations, f('offset')), 'circle.nomination')
        .translate(f('pos'))
        .classed('winner', f('won'))
        .attr('r', 3)
        .call(d3.attachTooltip)

    circles.on('mouseover', function(d){
      //make nominations with the same actor larger
      circles.attr('r', function(e){ return d.name == e.name ? 7 : 3 })
      //connect lines with a path
      mouseoverPath.attr('d', 'M' + d.otherNominations.map(f('pos')).join('L'))
    })

  })()

})

