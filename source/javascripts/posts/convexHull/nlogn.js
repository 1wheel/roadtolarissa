function drawNlogN(){
  var numPoints = 20,
      points = _.sortBy(uniformRandom(numPoints), f('x'))
      points = [
        {
          "x": 39.91344952373765,
          "y": 153.72833327855915,
          "p": [
            39.91344952373765,
            153.72833327855915
          ],
          "i": 0,
          "circle": ""
        },
        {
          "x": 73.17783529870212,
          "y": 366.78394209593534,
          "p": [
            73.17783529870212,
            366.78394209593534
          ],
          "i": 1,
          "circle": ""
        },
        {
          "x": 97.71426521474496,
          "y": 67.79173515969887,
          "p": [
            97.71426521474496,
            67.79173515969887
          ],
          "i": 2,
          "circle": ""
        },
        {
          "x": 112.93901572935283,
          "y": 108.55065375799313,
          "p": [
            112.93901572935283,
            108.55065375799313
          ],
          "i": 3,
          "circle": ""
        },
        {
          "x": 137.63408741215244,
          "y": 450.7416709442623,
          "p": [
            137.63408741215244,
            450.7416709442623
          ],
          "i": 4,
          "circle": ""
        },
        {
          "x": 166.95727376500145,
          "y": 352.3355967947282,
          "p": [
            166.95727376500145,
            352.3355967947282
          ],
          "i": 5,
          "circle": ""
        },
        {
          "x": 184.77750909514725,
          "y": 440.36424428923056,
          "p": [
            184.77750909514725,
            440.36424428923056
          ],
          "i": 6,
          "circle": ""
        },
        {
          "x": 291.50812077568844,
          "y": 70.69559228839353,
          "p": [
            291.50812077568844,
            70.69559228839353
          ],
          "i": 7,
          "circle": ""
        },
        {
          "x": 303.78620149567723,
          "y": 335.68769509438425,
          "p": [
            303.78620149567723,
            335.68769509438425
          ],
          "i": 8,
          "circle": ""
        },
        {
          "x": 306.71612346195616,
          "y": 441.77649376215413,
          "p": [
            306.71612346195616,
            441.77649376215413
          ],
          "i": 9,
          "circle": ""
        },
        {
          "x": 316.95499102352187,
          "y": 58.49910111865028,
          "p": [
            316.95499102352187,
            58.49910111865028
          ],
          "i": 10,
          "circle": ""
        },
        {
          "x": 356.09441455453634,
          "y": 381.0306651168503,
          "p": [
            356.09441455453634,
            381.0306651168503
          ],
          "i": 11,
          "circle": ""
        },
        {
          "x": 360.3969158604741,
          "y": 91.61422536708415,
          "p": [
            360.3969158604741,
            91.61422536708415
          ],
          "i": 12,
          "circle": ""
        },
        {
          "x": 362.15996594983153,
          "y": 411.28624306293204,
          "p": [
            362.15996594983153,
            411.28624306293204
          ],
          "i": 13,
          "circle": ""
        },
        {
          "x": 521.5741337800864,
          "y": 171.60448135109618,
          "p": [
            521.5741337800864,
            171.60448135109618
          ],
          "i": 14,
          "circle": ""
        },
        {
          "x": 621.6104509017896,
          "y": 287.0408159447834,
          "p": [
            621.6104509017896,
            287.0408159447834
          ],
          "i": 15,
          "circle": ""
        },
        {
          "x": 633.2360122469254,
          "y": 218.44040736323223,
          "p": [
            633.2360122469254,
            218.44040736323223
          ],
          "i": 16,
          "circle": ""
        },
        {
          "x": 663.6123790231068,
          "y": 323.13210810534656,
          "p": [
            663.6123790231068,
            323.13210810534656
          ],
          "i": 17,
          "circle": ""
        },
        {
          "x": 683.2663578330539,
          "y": 332.2886627865955,
          "p": [
            683.2663578330539,
            332.2886627865955
          ],
          "i": 18,
          "circle": ""
        },
        {
          "x": 707.6637074584141,
          "y": 57.68893611384555,
          "p": [
            707.6637074584141,
            57.68893611384555
          ],
          "i": 19,
          "circle": ""
        }
      ]

  points.forEach(function(d, i){ d.i = i })
  
  var svg = d3.select('#nlogn').html('')
    .append('svg')
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
  
  var lineG = svg.append('g')
  
  var activePoints = lineG.append('path').classed('cur-hull', true)

  var circles = svg.selectAll('circle')
      .data(points).enter()
    .append('circle').classed('point', true)
      .attr('r', 3)
      .attr('cx', f('x'))
      .attr('cy', f('y'))
      .each(function(d){ d.circle = d3.select(this) })
      .on('mouseover', function(d, i){
        if (i == activeI) iteratePoint()
      })

  lineG.append('path').classed('xorder', true)
      .attr('d', 'M' + points.map(f('p')).join('L'))


  var topPoints = [points[0], points[1]]
  var curI = 2
  var lookingBack = false
  var activeI = curI

  function iteratePoint(){
    if (curI > points.length  - 1) return

    var curPoint = points[curI]

    if (!lookingBack){
      activeI = _.last(topPoints).i
      lookingBack = true
    } else{
      var a = topPoints[topPoints.length - 2]
      var b = topPoints[topPoints.length - 1]
      var keep = a ? !lessThan180(a, b, curPoint) : true

      b.g ? b.g.remove() : ''
      if (!keep && topPoints.length > 1){
        topPoints.pop()
        b.circle.classed('passed-point', true)        
        activeI = _.last(topPoints).i

        activePoints.transition().duration(1500).attr('d', 'M' + topPoints
          .concat({p: midPoint(a, curPoint)})
          // .concat(a)
          .concat(curPoint).map(f('p')).join('L'))

      } else{
        lookingBack = false
        topPoints.push(curPoint)
        curI++
        activeI = curI
        curPoint = points[curI]

        activePoints.attr('d',  'M' + topPoints
            .concat(_.last(topPoints))
          .map(f('p')).join('L'))
        .transition().duration(1500).attr('d', 'M' + topPoints
            .concat(curPoint)
          .map(f('p')).join('L'))
      }

    }

    circles.attr('r', function(d, i){ return i < curI ? 5 : 5 })
    topPoints.concat(curPoint).forEach(function(d){
      d.circle.attr('r', 10).classed('top-point', true) 
    })
    
    circles.classed('next-point', function(d, i){
      return i === activeI
    })


    if (lookingBack){
      drawAngle(curPoint, topPoints[topPoints.length - 1], topPoints[topPoints.length - 2])
    }
  }


  circles.classed('next-point', function(d, i){
    return i === curI
  })

  iteratePoint()

  // svg.append('rect')
  //     .attr({width: width, height: height})
  //     .on('mousemove', function(){
  //       var p3 = d3.mouse(this)
  //       var p3 = {x: p3[0], y: p3[1]}
  //       mPath.attr('d', ['M', p2.x, ',', p2.y, 'L', p3.x, ',', p3.y].join(''))
  //       //console.log(calcAngle(p1, p2, p3))
  //       ang = isLessThan180(p1, p2, p3)
  //       aText.text(ang)
  //     })
  // var p1 = {x: 200, y: 200}
  // var p2 = {x: 300, y: 200}
  // svg.append('path').classed('mline', true)
  //     .attr('d', ['M', p1.x, ',', p1.y, 'L', p2.x, ',', p2.y].join(''))

  // var mPath = svg.append('path').classed('mline', true)
  // var aText = svg.append('text').style('fill', 'white')
  //     .attr({dy: '3em', dx: '3em'})


  svg.append('text').classed('reset-button', true)
      .attr({dy: '1em', dx: '.2em'})
      .on('click', drawNlogN)
      .text('↻')
}
drawNlogN()