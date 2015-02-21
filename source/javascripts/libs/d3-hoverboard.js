var f = function(str){ return function(obj){ return str ? obj[str] : obj; }}
var ƒ = function(str){ return function(obj){ return str ? obj[str] : obj; }}
var compose = function(g, h){ return function(d, i){ return g(h(d, i)); }}
