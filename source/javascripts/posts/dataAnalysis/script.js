// d3.csv('/javascripts/posts/dataAnalysis/data.csv', function(data){
d3.csv('/javascripts/posts/dataAnalysis/data.csv', function(nominations){
  //convert the award ceremony index to a number  
  nominations.forEach(function(d){ d.ceremonyNum = +d.ceremonyNum })

  //check that every ceremony has been loaded
  d3.extent(nominations, ƒ('ceremonyNum')) //[1, 87]


  //select only actress nominations
  var actressNominations = nominations.filter(function(d){ 
    return d.award == 'ACTRESS' })

  //group by actress
  var byActress = d3.nest().key(ƒ('name')).entries(actressNominations)

  //sanity check - Merylr Strep has 15 nominations
  d3.max(byActress, ƒ('values', 'length'))

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
    c.x.domain(d3.extent(actressNominations, ƒ('ceremonyNum')))
    c.y.domain(d3.extent(actressNominations, ƒ('prevNominations')))
    
    //draw x and y axis
    c.drawAxis()

    //draw circles
    c.svg.dataAppend(actressNominations, 'circle.nomination')
        .attr('cx', ƒ('ceremonyNum', c.x))
        .attr('cy', ƒ('prevNominations', c.y))
        .classed('winner', ƒ('won'))
        .attr('r', 3)
        .call(d3.attachTooltip)
  })()



  !(function(){
    var c = d3.conventions({parentSel: d3.select('#nominations-offset')})

    c.x.domain(d3.extent(actressNominations, ƒ('ceremonyNum')))
    c.y.domain(d3.extent(actressNominations, ƒ('prevNominations')))
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


    c.svg.dataAppend(_.sortBy(actressNominations, ƒ('offset')), 'circle.nomination')
        //position with transform translate instead
        .translate(ƒ('pos'))
        .classed('winner', ƒ('won'))
        .attr('r', 3)
        .call(d3.attachTooltip)
  })()


  !(function(){
    var c = d3.conventions({parentSel: d3.select('#nominations-linked')})

    c.x.domain(d3.extent(actressNominations, ƒ('ceremonyNum')))
    c.y.domain(d3.extent(actressNominations, ƒ('prevNominations')))
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
        .attr('d', function(d){ return 'M' + d.values.map(ƒ('pos')).join('L') })

    c.svg.dataAppend(topActresses, 'text')
        //values are sorted by time - most recent nomination is always last 
        .translate(function(d){ return _.last(d.values).pos })
        .text(ƒ('key'))
        .attr({dy: -4, 'text-anchor': 'middle'})

    var circles = c.svg.dataAppend(_.sortBy(actressNominations, ƒ('offset')), 'circle.nomination')
        .translate(ƒ('pos'))
        .classed('winner', ƒ('won'))
        .attr('r', 3)
        .call(d3.attachTooltip)

    circles.on('mouseover', function(d){
      //make nominations with the same actor larger
      circles.attr('r', function(e){ return d.name == e.name ? 5 : 3 })
      //connect lines with a path
      mouseoverPath.attr('d', 'M' + d.otherNominations.map(ƒ('pos')).join('L'))
    })
  })()



  !(function(){
    var c = d3.conventions({parentSel: d3.select('#nominations-average')})

    c.x.domain(d3.extent(actressNominations, ƒ('ceremonyNum')))
    c.y.domain(d3.extent(actressNominations, ƒ('prevNominations')))
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
    var byYear = d3.nest().key(ƒ('ceremonyNum')).entries(actressNominations)
    byYear.forEach(function(d, i){
      //for each year, select previous 15 years
      var prevYears = byYear.slice(Math.max(0, i - 15), i + 1)
      //create array of all nominations over previous 15 years
      var prevNoms = _.flatten(prevYears.map(ƒ('values')))

      //calculate average number of previous nominations for nominees and winners 
      d.nomAvgPrev = d3.mean(prevNoms,                  ƒ('prevNominations'))
      d.wonAvgPrev = d3.mean(prevNoms.filter(ƒ('won')), ƒ('prevNominations'))
    })

    var line = d3.svg.line()
        .x(ƒ('key', c.x))
        .y(ƒ('nomAvgPrev', c.y))

    c.svg.append('path.nomAvg').attr('d', line(byYear))
    c.svg.append('path.winAvg').attr('d', line.y(ƒ('wonAvgPrev', c.y))(byYear))

    var mouseoverPath = c.svg.append('path.mouseconnection')

    var topActresses = byActress.filter(function(d){ return d.values.length > 5 })

    c.svg.dataAppend(topActresses, 'path.connection')
        .attr('d', function(d){ return 'M' + d.values.map(ƒ('pos')).join('L') })

    c.svg.dataAppend(topActresses, 'text')
        //values are sorted by time - most recent nomination is always last 
        .translate(function(d){ return _.last(d.values).pos })
        .text(ƒ('key'))
        .attr({dy: -4, 'text-anchor': 'middle'})

    var circles = c.svg.dataAppend(_.sortBy(actressNominations, ƒ('offset')), 'circle.nomination')
        .translate(ƒ('pos'))
        .classed('winner', ƒ('won'))
        .attr('r', 3)
        .call(d3.attachTooltip)

    circles.on('mouseover', function(d){
      //make nominations with the same actor larger
      circles.attr('r', function(e){ return d.name == e.name ? 5 : 3 })
      //connect lines with a path
      mouseoverPath.attr('d', 'M' + d.otherNominations.map(ƒ('pos')).join('L'))
    })
  })()


  !(function(){
    var c = d3.conventions({
      parentSel: d3.select('#distribution'),
      height: 800,
      width: 550,
      margin: {left: 100, top: 10, bottom: 10, right: 150}
    })

    var topActresses = byActress
      .filter(function(d){
        return d.values.length > 2 || d.values.some(ƒ('won')) })
      .sort(d3.ascendingKey(ƒ('values', 'length')))

    c.x.domain([0, d3.max(topActresses, ƒ('values', 'length'))])

    c.y.domain([0, topActresses.length - 1])
    topActresses = topActresses.sort(d3.ascendingKey(ƒ('values', 'length')))
    var actressG = c.svg.dataAppend(topActresses, 'g')
        .translate(function(d, i){ return [0, c.y(i)] })

    actressG.append('text.name').text(ƒ('key'))
        .attr({'text-anchor': 'end', dy: '.33em', x: -8})

    actressG.dataAppend(ƒ('values'), 'circle.nomination')
        .classed('winner', ƒ('won'))
        .attr('cx', function(d, i){ return c.x(i) })
        .attr('r', 4)
        .call(d3.attachTooltip)
  })()


  !(function(){
    var positionings = [
      { label:  'Most Nominations',
        //position circles
        setX: function(){
          c.x.domain([0, d3.max(topActresses, ƒ('values', 'length'))])

          topActresses.forEach(function(actress){
            _.sortBy(actress.values, 'ceremonyNum')
              .forEach(function(d, i){ d.x = c.x(i) })
          })

        },
        //order for rows
        sortBy: ƒ('values', 'length')
      },
      { label:  'Most Wins',
        setX: function(){
          c.x.domain([0, d3.max(topActresses, ƒ('values', 'length'))])

          topActresses.forEach(function(actress){
            _.sortBy(actress.values, function(d){ return -d.won*100 + d.ceremonyNum })
              .forEach(function(d, i){ d.x = c.x(i) })
          })
        },
        //lexicographic sort
        sortBy: function(d){
          return d.values.filter(ƒ('won')).length*100 + d.values.length }
      },
      { label:  'Most Without',
        setX: function(){
          topActresses.forEach(function(d){
            d.firstWin = 0
            while (d.firstWin < d.values.length && !d.values[d.firstWin].won){
              d.firstWin++
            }
            d.afterFirst = d.values.length - d.firstWin 
          })
          c.x.domain([-d3.max(topActresses, ƒ('firstWin')), 
                     d3.max(topActresses, ƒ('afterFirst'))])

          topActresses.forEach(function(actress){
            _.sortBy(actress.values, 'ceremonyNum')
              .forEach(function(d, i){ d.x = c.x(i - actress.firstWin) })
          })
        },
        //lexicographic sort
        sortBy: function(d){ return d.firstWin*100 + d.values.length }
      },
      { label: 'Longest Career',
        setX: function(){
          c.x.domain([0, d3.max(topActresses, careerLength)])

          topActresses.forEach(function(actress){
            actress.values.forEach(function(d){
              d.x = c.x(d.ceremonyNum - actress.values[0].ceremonyNum)
            })
          })
        },
        //lexicographic sort
        sortBy: careerLength
      },
      { label:  'Over Time',
        setX: function(){
          c.x.domain(d3.extent(actressNominations, ƒ('ceremonyNum')))
          actressNominations.forEach(function(d){ d.x = c.x(d.ceremonyNum) })
        },
        sortBy: function(d){ return -d.values[0].ceremonyNum }
      }, 

    ]

    d3.select('#buttons').dataAppend(positionings, 'span.button')
        .text(ƒ('label'))
        .on('click', renderPositioning)

    var c = d3.conventions({
      parentSel: d3.select('#buttons'),
      height: 800,
      width: 550,
      margin: {left: 100, top: 10, bottom: 10, right: 150}
    })

    var topActresses = byActress
      .filter(function(d){
        return d.values.length > 2 || d.values.some(ƒ('won')) })
      .sort(d3.ascendingKey(ƒ('values', 'length')))

    c.x.domain([0, d3.max(topActresses, ƒ('values', 'length'))])

    c.y.domain([0, topActresses.length - 1])
    topActresses = topActresses.sort(d3.ascendingKey(ƒ('values', 'length')))
    var actressG = c.svg.dataAppend(topActresses, 'g')
        .translate(function(d, i){ return [0, c.y(i)] })

    actressG.append('text.name').text(ƒ('key'))
        .attr({'text-anchor': 'end', dy: '.33em', x: -8})

    actressG.dataAppend(ƒ('values'), 'circle.nomination')
        .classed('winner', ƒ('won'))
        .attr('cx', function(d, i){ return c.x(i) })
        .attr('r', 4)
        .call(d3.attachTooltip)


    renderPositioning(positionings[0])

    function renderPositioning(d){
      //position circles by updating their x proprety
      d.setX()
      actressG.transition('circles').delay(function(d){ return (86 - (d.i || 86))*20 }).duration(500)
        .selectAll('circle')
          .attr('cx', ƒ('x'))

      //save order to actress object
      _.sortBy(topActresses, d.sortBy).forEach(function(d, i){ d.i = i })

      actressG.transition().delay(function(d){ return (86 - d.i)*20 + 1900 }).duration(650)
          .translate(function(d){ return [0, c.y(d.i)] })

  
      d3.selectAll('.button').classed('selected', function(e){ return e == d })
    }
  
    function careerLength(d){
      return _.last(d.values).ceremonyNum - d.values[0].ceremonyNum 
    }

  })()

})

