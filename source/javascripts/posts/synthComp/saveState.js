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
