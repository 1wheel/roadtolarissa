var svg = d3.select('#memorization')
  .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .call(addYAxis)

var lineG = svg.append('g')
var circleG = svg.append('g')

var memObj
function start(){
  var tree = {i: topLevel, left: 0, right: width, parents: [tree]}
  memObj = {topLevel: tree}
  tree.parents = [tree]
  addChildren(tree)
  drawCircle(tree, tree)  
}
start()

function addChildren(obj){
  if (memObj[obj.i]){
    memObj[obj.i].parents.push(obj.parents[0])
    memObj[obj.i].unsolvedParents.push(obj.parents[0])
    return memObj[obj.i]
  }
  memObj[obj.i] = obj


  obj.x = (obj.left + obj.right)/2
  obj.y = levelToHeight(obj.i)
  obj.childDrawn = false
  obj.children = []

  obj.unsolvedParents = obj.parents.slice()
  Object.defineProperty(obj, 'solved', {get: function(){
    return obj.childDrawn && obj.children.every(function(d){
      return !_.contains(d.unsolvedParents, obj)
    })
  }})

  if (obj.i <= 1){
    obj.childDrawn = true
    obj.val = 1
  } 

  return obj
}

function drawCircle(obj, from){
  var path = lineG.append('path')
      .classed('down-path', true)
      .attr('d', arc([obj.x, obj.y], [from.x, from.y], obj.leftSide))
      .call(hidePath)
  path.transition().duration(duration)
      .attr('stroke-dashoffset', 0)
      .each('end', function(){ obj.circle.call(setCircleClass) })

  //don't create a circle if it doesn't already exist
  if (obj.circle) return
  

  obj.circle = circleG.append('circle')
      .attr('r', 10)
      .on('mouseover', function(){
        if (!obj.childDrawn){
          obj.childDrawn = true

          var mid = (obj.left + obj.right)/2
          var cIndex = [obj.i - 1, obj.i - 2]

          obj.children = [
              addChildren({i: cIndex[0], parents: [obj], leftSide: true,  left: obj.left, right: mid}), 
              addChildren({i: cIndex[1], parents: [obj], leftSide: false, left: mid,       right: obj.right})]
          obj.val = d3.sum(obj.children, ƒ('val'))

          drawCircle(obj.children[0], obj)
          drawCircle(obj.children[1], obj)
          obj.circle.call(setCircleClass)
        }
        if (obj.unsolvedParents.length && obj.solved){
          lineG.selectAll('new-path')
              .data(obj.unsolvedParents).enter()
            .append('path')
              .classed('up-path', true)
              .attr('d', function(d){
                return arc([d.x, d.y], [obj.x, obj.y], obj.leftSide) })
              .call(hidePath)
            .transition().duration(duration)
              .attr('stroke-dashoffset', 0)
              .each('end', function(){
                updateParentState(obj) 
                if (obj.i === topLevel){ reset(svg) }
              })

          obj.unsolvedParents = []
          obj.circle.attr('class', 'done')
        }

        setTitleText(this, obj)
      })
      .attr({cx: from.x, cy: from.y})
      .style('pointer-events', 'none')
      .datum(obj)
      .call(setCircleClass)

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