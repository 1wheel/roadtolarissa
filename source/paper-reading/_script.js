d3.csv('https://docs.google.com/spreadsheets/d/e/2PACX-1vSwFBbjJCU-J_QI2wUJXXfOmHxXRg7U90PbgmOYCfy8beA8eZxjUSICZOB3G0TAx6TgtpNVfIe6GgU3/pub?output=csv', (err, res) => {
  if (err) return console.log(err)
  data = res

  console.log(data)

  d3.select('#list').html('').appendMany('div', data)
    .st({marginBottom: 20, marginTop: 20})
    .append('a')
    .text(d => d.title)
    .at({href: d => d.link || d.pdf})
    .st({opacity: d => d.read ? .5 : 1, textDecoration: 'none'})
})