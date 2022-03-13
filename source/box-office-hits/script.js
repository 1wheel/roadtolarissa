console.clear()
d3.select('body').selectAppend('div.tooltip.tooltip-hidden')



window.init = async function(){
  if (!window.weekendData) util.parseData()

  drawWeeklyTopPercent()
  sleep(20)

  drawYearDistribution()
  drawBestWeekScatter()

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}


if (window.__datacache){
  window.init()
} else{
  d3.loadData(
    'https://roadtolarissa.com/data/box-office-mojo-weekend.csv', 
    'https://roadtolarissa.com/data/box-office-mojo-weekly.csv', 
    'bo_mojo_inflation.csv', 
    (err, res) => {
      window.window.__datacache = res
      window.init() 
  })
}


