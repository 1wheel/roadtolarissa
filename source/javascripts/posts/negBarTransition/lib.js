//helper functions
var f = function(str){ return function(obj){ return str ? obj[str] : obj; }}
var ƒ = function(str){ return function(obj){ return str ? obj[str] : obj; }}
var compose = function(g, h){ return function(d, i){ return g(h(d, i)); }}

var comma = d3.format(',');

//contains reusable graphs
var graphs = {};

function midPoint(a, b){
  return [(a[0] + b[0])/2, (a[1] + b[1])/2]
}


charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_'

var encode = function(bits) {
  var chunk, chunks, decimals, encoded, i, last_chunk_length;
  chunks = (function() {
    var _i, _ref, _results;
    _results = [];
    for (i = _i = 0, _ref = bits.length; _i < _ref; i = _i += 6) {
      _results.push(bits.slice(i, i + 6));
    }
    return _results;
  })();
  last_chunk_length = chunks[chunks.length - 1].length;
  decimals = (function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = chunks.length; _i < _len; _i++) {
      chunk = chunks[_i];
      _results.push(parseInt(chunk, 2));
    }
    return _results;
  })();
  decimals.push(last_chunk_length);
  encoded = ((function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = decimals.length; _i < _len; _i++) {
      i = decimals[_i];
      _results.push(charset[i]);
    }
    return _results;
  }).call(this)).join('');
  return encoded;
}

var decode =function(encoded) {
  var char, d, decimals, decoded, last_chunk, last_chunk_length, last_decimal, _ref;
  decimals = (function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = encoded.length; _i < _len; _i++) {
      char = encoded[_i];
      _results.push(charset.indexOf(char));
    }
    return _results;
  }).call(this);
  _ref = [decimals.pop(), decimals.pop()], last_chunk_length = _ref[0], last_decimal = _ref[1];
  decoded = ((function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = decimals.length; _i < _len; _i++) {
      d = decimals[_i];
      _results.push(('00000' + d.toString(2)).slice(-6));
    }
    return _results;
  })()).join('');
  last_chunk = ('00000' + last_decimal.toString(2)).slice(-last_chunk_length);
  decoded += last_chunk;
  return decoded;
}
