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
      nomination.actress = actress
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

})



//grab a new copy of the data so we can add properties w/o adding fields to prev tooltip
// d3.csv('/javascripts/posts/dataAnalysis/data.csv', function(data){
d3.csv('data.csv', function(nominations){
  //convert the award ceremony index to a number  
  nominations.forEach(function(d){ d.ceremonyNum = +d.ceremonyNum })

  //select only actress nominations
  var actressNominations = nominations.filter(function(d){ 
    return d.award == 'ACTRESS' })

  //group by actress
  var byActress = d3.nest().key(f('name')).entries(actressNominations)

  //count previous nominations
  byActress.forEach(function(actress){
    actress.values.forEach(function(nomination, i){
      nomination.prevNominations = i
      nomination.actress = actress
    })
  })


  !(function(){
    var c = d3.conventions({parentSel: d3.select('#nominations-offset')})

    //compute domain of scales
    c.x.domain(d3.extent(actressNominations, f('ceremonyNum')))
    c.y.domain(d3.extent(actressNominations, f('prevNominations')))
    
    //calculate offset 
    d3.nest()
      .key(function(d){ return d.ceremonyNum + '-' + d.prevNominations })
      .entries(actressNominations)
    .forEach(function(year){
      _.sortBy(year.values, f('won')).reverse().forEach(function(d, i){
        d.offset = i
        d.pos = [c.x(d.ceremonyNum) + i*1.5, c.y(d.prevNominations) - i*3]
      })
    })

    //draw x and y axis
    c.drawAxis()

    //draw circles
    c.svg.dataAppend(_.sortBy(actressNominations, f('offset')), 'circle.nomination')
        .translate(f('pos'))
        .classed('winner', f('won'))
        .attr('r', 3)
        .call(d3.attachTooltip)
  })()

})