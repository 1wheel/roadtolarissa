//Download history of oscar nominations
//http://awardsdatabase.oscars.org/ampas_awards/BasicSearchInput.jsp
var script = document.createElement("script")
script.src = 'http://d3js.org/d3.v3.min.js'
document.body.appendChild(script)

var nominations = [],
    curYear,
    curNth,
    curAward

d3.selectAll('dl > *').each(function(){
  var sel = d3.select(this)
  if      (this.tagName == 'DT'){
    curYear = sel.text().trim()
    var str = curYear.split('(')[1].split(')')[0]
    curNth = +str.slice(0, str.length - 2)
  }
  else if (this.tagName == 'DIV'){
    curAward = sel.text().replace(' IN A LEADING ROLE', '').trim()
  }
  else{
    var nom = {year: curYear, ceremonyNum: curNth, award: curAward}
    var text = sel.text().split('[NOTE')[0].trim()
    nom.won = ~text.indexOf('*') ? 1 : ''
    var nameMovie = text.replace('*', '').split(' -- ')
    nom.name = nameMovie[0]
    nom.movie = nameMovie[1] ? nameMovie[1].split(' {')[0].replace(/"/g, '') : ''
    nominations.push(nom)
  }
})

//copy(d3.csv.format(nominations))