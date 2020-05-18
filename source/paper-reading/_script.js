d3.csv('https://www.googleapis.com/drive/v3/files/1Eq6G-zkMIhrSMPwqvCqM7I0FpqRsw2iwWO01X_t_XVE/export?mimeType=text/csv&key=AIzaSyAT-ALGW_bcmcvNs1dPgcV7fF6tR1vKY44', (err, res) => {
  if (err) return console.log(err)
  data = res

  console.log(data)

  d3.select('#list')
    .st({marginBottom: 60})
    .html('').appendMany('div', data)
    .st({marginBottom: 20, marginTop: 20})
    .append('a')
    .text(d => d.title)
    .at({href: d => d.link || d.pdf})
    .st({opacity: d => d.read ? .5 : 1, textDecoration: 'none'})
})


// https://www.googleapis.com/download/drive/v2/files/2PACX-1vSwFBbjJCU-J_QI2wUJXXfOmHxXRg7U90PbgmOYCfy8beA8eZxjUSICZOB3G0TAx6TgtpNVfIe6GgU3?alt=media



// d3.csv('https://www.googleapis.com/drive/v3/files/1Eq6G-zkMIhrSMPwqvCqM7I0FpqRsw2iwWO01X_t_XVE/export?mimeType=text/csv&key=AIzaSyAT-ALGW_bcmcvNs1dPgcV7fF6tR1vKY44', (err, res) => {
//   console.log(err)
//   console.log(res)
// })