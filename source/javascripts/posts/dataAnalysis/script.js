var f = d3.f

// d3.csv('/javascripts/posts/dataAnalysis/data.csv', function(data){
d3.csv('data.csv', function(nominations){
  //convert the award ceremony index to a number  
  nominations.forEach(function(d){ d.nth = +d.nth })

  //check that every ceremony has been loaded
  d3.extent(nominations, f('nth')) //[1, 87]


  //select only actress nominations
  var actressNomintions = nominations.filter(function(d){ 
    return d.award == 'ACTRESS' })

  //group by actress
  var byActress = d3.nest().key(f('name')).entries(actressNomintions)

  //sanity check - Merylr Strep has 15 nominations
  d3.max(byActress, f('values', 'length'))
})