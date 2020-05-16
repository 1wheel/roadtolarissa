d3.csv('https://docs.google.com/spreadsheets/d/1Eq6G-zkMIhrSMPwqvCqM7I0FpqRsw2iwWO01X_t_XVE/pub?output=csv', (err, res) => {
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



// d3.request('https://cors-anywhere.herokuapp.com//https://docs.google.com/spreadsheets/d/e/2PACX-1vSwFBbjJCU-J_QI2wUJXXfOmHxXRg7U90PbgmOYCfy8beA8eZxjUSICZOB3G0TAx6TgtpNVfIe6GgU3/pub?output=csv')
//   .header('X-Requested-With', 'paper-reading')
//   .header('Origin', 'roadtolarissa.com')
//   .header('Content-Type', 'application/x-www-form-urlencoded')
//   .post('', (err, res) => {
//     if (err) return console.log(err)

//     console.log(res.response)

//     data = d3.csvParse(res.response)

//     console.log(data)

//     d3.select('#list')
//       .st({marginBottom: 60})
//       .html('').appendMany('div', data)
//       .st({marginBottom: 20, marginTop: 20})
//       .append('a')
//       .text(d => d.title)
//       .at({href: d => d.link || d.pdf})
//       .st({opacity: d => d.read ? .5 : 1, textDecoration: 'none'})
//   })

