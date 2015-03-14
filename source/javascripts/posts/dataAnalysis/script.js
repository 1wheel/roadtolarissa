var f = d3.f

// d3.csv('/javascripts/posts/dataAnalysis/data.csv', function(data){
d3.csv('data.csv', function(nominations){
  var actressNomintions = nominations.filter(function(d){ return d.award == 'ACTRESS' })
  var byActress = d3.nest().key(f('name')).entries(actressNomintions)

  byActress.length  //There have been 231 people nominated for Best Actress -  
  d3.max(byActress, f('key', 'length')) //merel has been nominated x times - 

  console.log(byActress.length)
})