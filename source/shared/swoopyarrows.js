// https://github.com/bizweekgraphics/swoopyarrows/blob/master/swoopyArrow.js

function swoopyArrow() {

  var angle = Math.PI,
      clockwise = true,
      xValue = function(d) { return d[0]; },
      yValue = function(d) { return d[1]; };

  function render(data) {

    data = data.map(function(d, i) {
      return [xValue.call(data, d, i), yValue.call(data, d, i)];
    });

    // get the chord length ("height" {h}) between points
    var h = hypotenuse(data[1][0]-data[0][0], data[1][1]-data[0][1])

    // get the distance at which chord of height h subtends {angle} radians
    var d = h / ( 2 * Math.tan(angle / 2) );

    // get the radius {r} of the circumscribed circle
    var r = hypotenuse(d, h/2)

    /*
    SECOND, compose the corresponding SVG arc.
      read up: http://www.w3.org/TR/SVG/paths.html#PathDataEllipticalArcCommands
      example: <path d = "M 200,50 a 50,50 0 0,1 100,0"/>
                          M 200,50                          Moves pen to (200,50);
                                   a                        draws elliptical arc;
                                     50,50                  following a degenerate ellipse, r1 == r2 == 50;
                                                            i.e. a circle of radius 50;
                                           0                with no x-axis-rotation (irrelevant for circles);
                                             0,1            with large-axis-flag=0 and sweep-flag=1 (clockwise);
                                                 100,0      to a point +100 in x and +0 in y, i.e. (300,50).
    */
    var path =  "M " + data[0][0] + "," + data[0][1]
         + " a " + r + "," + r
         + " 0 0," + (clockwise ? "1" : "0") + " "
         + (data[1][0]-data[0][0]) + "," + (data[1][1]-data[0][1]);

    return path
  }

  function hypotenuse(a, b) {
    return Math.sqrt( Math.pow(a,2) + Math.pow(b,2) );
  }

  render.angle = function(_) {
    if (!arguments.length) return angle;
    angle = Math.min(Math.max(_, 1e-6), Math.PI-1e-6);
    return render;
  };

  render.clockwise = function(_) {
    if (!arguments.length) return clockwise;
    clockwise = !!_;
    return render;
  };

  render.x = function(_) {
    if (!arguments.length) return xValue;
    xValue = _;
    return render;
  };

  render.y = function(_) {
    if (!arguments.length) return yValue;
    yValue = _;
    return render;
  };

  return render;
}
