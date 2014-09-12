var svg = d3.select('#recursion')
  .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .call(addYAxis)

var pathG = svg.append('g')
var circlesG = svg.append('g')


var levelToHeight = d3.scale.linear()
    .domain([topLevel, 0])
    .range([0, height])

function start(){
  var tree = {i: topLevel, left: 0, right: width}
  tree.parents = [tree]
  addChildren(tree)
  drawCircle(tree)  
}

start()

function addChildren(obj){

  obj.x = (obj.left + obj.right)/2
  obj.y = levelToHeight(obj.i)
  obj.childDrawn = false
  obj.solved = false

  obj.unsolvedParents = obj.parents.slice();
  Object.defineProperty(obj, 'solved', {get: function(){
    return obj.childDrawn && obj.children.every(function(d){
      return !_.contains(d.unsolvedParents, obj)
    })
  }})

  if (obj.i <= 1){
    obj.childDrawn = true
    obj.val = 1
    obj.children = []
    return obj
  }

  var mid = (obj.left + obj.right)/2
  var cIndex = [obj.i - 1, obj.i - 2]
  if (obj.i % 2){ cIndex.reverse() }
  if (Math.random() < .5){ cIndex.reverse() }
  obj.children = [
      addChildren({i: cIndex[0], parents: [obj], leftSide: true,  left: obj.left, right: mid}), 
      addChildren({i: cIndex[1], parents: [obj], leftSide: false, left: mid,       right: obj.right}), 
    ]

  obj.val = d3.sum(obj.children, ƒ('val'))
  return obj
}

function drawCircle(obj){
  obj.circle = circlesG.append('circle')
      .classed('circle', true)
      .on('mouseover', function(){
        if (!obj.childDrawn){
          obj.childDrawn = true
          drawCircle(obj.children[0])
          drawCircle(obj.children[1])
          obj.circle.call(setCircleClass)
        }
        if (obj.unsolvedParents.length && obj.solved){
          pathG.append('path')
              .attr('d', arc([obj.parents[0].x, obj.parents[0].y], [obj.x, obj.y], obj.leftSide))
              .call(hidePath)
            .transition().duration(duration)
              .attr('stroke-dashoffset', 0)
              .each('end', function(){
                updateParentState(obj) 
                if (obj.i === topLevel){ reset(svg) }
              })

          obj.unsolvedParents = [];
          obj.circle.attr('class', 'done')
        }

        setTitleText(this, obj)
      })
      .style('pointer-events', 'none')
      .attr({cx: obj.parents[0].x, cy: obj.parents[0].y, r: 10})
      .datum(obj)
      .call(setCircleClass)

  var path = pathG.append('path')
      //.attr('d', arc([obj.parents[0].x, obj.parents[0].y], [obj.parents[0].x, obj.parents[0].y], obj.leftSide))
      .style({stroke: 'black', "stroke-width": 2})
      .attr('d', arc([obj.x, obj.y], [obj.parents[0].x, obj.parents[0].y], obj.leftSide))
      .call(hidePath)
  path.transition().duration(duration)
      .attr('stroke-dashoffset', 0)
      .each('end', function(){ updateParentState(obj) })

  obj.circle.transition().duration(duration)
      .tween('position', function(){
        var pathLength = path.node().getTotalLength()
        return function(t){
          var pos = path.node().getPointAtLength(t*pathLength)
          d3.select(this).attr({cx: pos.x, cy: pos.y})
        } 
      })
      .each('end', function(){ d3.select(this).style('pointer-events', '') })
}