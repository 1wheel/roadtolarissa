var zIndex = 10
var imgs = []

d3.selectAll('a').each(function(){
  var sel = d3.select(this)

  var [src, href] = sel.attr('href').split('---')
  if (href && href.includes('imgur')) [href, src] = sel.attr('href').split('---')
  if (!src.includes('imgur')) return
  
  sel.attr('href', href || '')
  if (href) sel.classed('actual-link', true)
  
  if (!src.includes('.png') && !src.includes('.gif')) src = src + '.png'

  imgs.push(src)
  sel
    .classed('mouse-over-img', true)
    .on('mouseover click touchstart', () => {
      sel.st({zIndex: zIndex++})
  
    var bb = imgSel.node().getBoundingClientRect()
    console.log(bb, bb.left)
    if (innerWidth < 800){
      var width = Math.min(350, innerWidth - 10)
  
      console.log(width, bb.width + 2)
      if (width == bb.width - 2){
        imgSel.st({width: '', left: '', maxHeight: ''})
        d3.selectAll('p').classed('active', false)
      } else{
        imgSel.st({
            maxWidth: width + 'px',
            left: 5 - bb.left,
            maxHeight: '400px',
          })
        sel.parent().classed('active', true)
      }
    }
  
      if (href) return
  
      d3.event.preventDefault()
      d3.event.stopPropagation()
    })
  .on('mouseout', () => {
    // imgSel.st({width: '', left: '', maxHeight: ''})
  })
    .append('div').append('div').append('img').at({src})

  var imgSel = sel.select('img')

})

d3.select('body').on('touchstart', () => {
  d3.select('body').selectAll('img').st({maxWidth: '', left: '', maxHeight: ''})
  d3.selectAll('p').classed('active', false)
})
  // .st({maxWidth: Math.min(innerWidth - 10, 750) + 'px'})

setTimeout(function(){
  d3.selectAll('.mouse-over-img img').each(function(){
    var bb = this.getBoundingClientRect()
  
    var classStr = bb.left < 120 ? 'left' : innerWidth - bb.left < 120 ? 'right' : ''
    d3.select(this).attr('class', classStr)
  })
}, 0)


// d3.select('body').html('')
// d3.select('html')
//   .append('div').st({zIndex: 100})
//   .appendMany('img', _.shuffle(imgs))
//   .at({src: d => d, width: 200})
//   .st({
//     position: 'absolute', 
//     left: (d, i) => (i % 9)*200, 
//     top:  (d, i) => Math.floor(i/9)*100
//   })
