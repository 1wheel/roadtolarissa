var varColors = {i: 'purple', j: 'blue', n: 'orange', maxDrawdown: 'red', peak: 'pink'}

d3.selectAll('code')
  .selectAll('.line').selectAll('span')
    .attr('class', function(){
      var text = d3.select(this).text();
      return varColors[text] ? text + '-code' : '';
    })


d3.selectAll('p').selectAll('code')
    .html(function(){
      var str = d3.select(this).text();
      if (str === 'maxDrawdown') return str;
      //return "<span class='n-text'>BEEP</span>" 
      str = str.replace(/n/g, "<span class='n-text'>n</span>")
      str = str.replace(/i/g, "<span class='i-text'>i</span>")
      return str;
    })