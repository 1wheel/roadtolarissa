//helper functions
var f = function(str){ return function(obj){ return str ? obj[str] : obj; }}
var ƒ = function(str){ return function(obj){ return str ? obj[str] : obj; }}
var compose = function(g, h){ return function(d, i){ return g(h(d, i)); }}

var comma = d3.format(',');

//contains reusable graphs
var graphs = {};

str = d3.selectAll('.note').data().map(function(d){ return d.on ? '1' : '0'; }).join('')
//http://www.smashingmagazine.com/2011/10/19/optimizing-long-lists-of-yesno-values-with-javascript/
function pack(/* string */ values) {
    var chunks = values.match(/.{1,4}/g), packed = '';
    for (var i=0; i < chunks.length; i++) {
        packed += parseInt('1' + chunks[i], 2).toString(32);
    }
    return packed;
}

function unpack(/* string */ packed) {
    var values = '';
    for (var i=0; i < packed.length; i++) {
        values += packed.charCodeAt(i).toString(2).substr(1);
    }
    return values;
}


str = "1101001010110100001001101100010010100010001111101111011100010000101000110000000000000000000000000000001010001000010000000000000100000"
var charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_';

function pack(str){
	var chunks = str.match(/.{1,6}/g);
	var lastChunckLength = chunks[chunks.length - 1].length;
	var decimals = chunks.map(function(d){ return parseInt(d, 2); });
	decimals.push(lastChunckLength);
	return decimals.map(function(d){ return charset[d]; }).join('');
}

function unpack(str){
	var decimals = str.split('').map(function(d){ return charset.indexOf(d); });
	var lastChunckLength = decimals.pop();
	var lastDecimal = decimals.pop();
	var decoded = decimals.map(function(d){ return  d.toString(2); }).join('');
	var lastChunk = ('00000' + lastDecimal.toString(2)).slice(-lastChunckLength);
	decoded += lastChunk;
	return decoded;
}


// class Urlify
//     constructor: ->
//         @charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_'

//     encode: (bits) ->
//         chunks = (bits[i...i+6] for i in [0...bits.length] by 6)
//         last_chunk_length = chunks[chunks.length-1].length
//         decimals = (parseInt(chunk, 2) for chunk in chunks)
//         decimals.push(last_chunk_length)
//         encoded = (@charset[i] for i in decimals).join('')

//         return encoded

//     decode: (encoded) ->
//         decimals = (@charset.indexOf(char) for char in encoded)
//         [last_chunk_length, last_decimal] = [decimals.pop(), decimals.pop()]
//         decoded = (('00000'+d.toString(2)).slice(-6) for d in decimals).join('')
//         last_chunk = ('00000'+last_decimal.toString(2)).slice(-last_chunk_length)
//         decoded += last_chunk

//         return decoded


// encode: (bits) ->
//     chunks = (bits[i...i+6] for i in [0...bits.length] by 6)
//     last_chunk_length = chunks[chunks.length-1].length
//     decimals = (parseInt(chunk, 2) for chunk in chunks)
//     decimals.push(last_chunk_length)
//     encoded = (@charset[i] for i in decimals).join('')

//     return encoded

// decode: (encoded) ->
//     decimals = (@charset.indexOf(char) for char in encoded)
//     [last_chunk_length, last_decimal] = [decimals.pop(), decimals.pop()]
//     decoded = (('00000'+d.toString(2)).slice(-6) for d in decimals).join('')
//     last_chunk = ('00000'+last_decimal.toString(2)).slice(-last_chunk_length)
//     decoded += last_chunk

//     return decoded






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
      _results.push(this.charset[i]);
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
      _results.push(this.charset.indexOf(char));
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
