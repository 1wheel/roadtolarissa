(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.hcluster = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
//
//
//

module.exports = {
  euclidean: require('./src/euclidean'),
  manhattan: require('./src/manhattan'),
  chebyshev: require('./src/chebyshev'),
  angular: require('./src/angular'),
  cosineSimilarity: require('./src/cosine-similarity'),
  angularSimilarity: require('./src/angular-similarity')
};

},{"./src/angular":3,"./src/angular-similarity":2,"./src/chebyshev":4,"./src/cosine-similarity":5,"./src/euclidean":6,"./src/manhattan":7}],2:[function(require,module,exports){
//
//
//
var cosineSimilarity = require('./cosine-similarity');

//
module.exports = function(a, b, accessor) {
  var cosSimValue = cosineSimilarity.apply(null, arguments);
  return 1 - ( (2 * Math.acos(cosSimValue)) / Math.PI);
};

},{"./cosine-similarity":5}],3:[function(require,module,exports){
//
//
//
var cosineSimilarity = require('./cosine-similarity');

//
module.exports = function(a, b, accessor) {
  var cosSimValue = cosineSimilarity.apply(null, arguments);
  return (2 * Math.acos(cosSimValue)) / Math.PI;
};

},{"./cosine-similarity":5}],4:[function(require,module,exports){
//
//
//

//
module.exports = function(a, b, accessor) {
  var x = accessor ? a.map(accessor) : a,
      y = accessor ? b.map(accessor) : b,
      distance = Math.abs(x[0] - y[0]);
  for(var ndx = 1; ndx < x.length; ndx++) {
    distance = Math.max(distance, Math.abs(x[ndx] - y[ndx]));
  }
  return distance;
};

},{}],5:[function(require,module,exports){
//
//
//

//
module.exports = function(a, b, accessor) {
  var x = accessor ? a.map(accessor) : a,
      y = accessor ? b.map(accessor) : b,
      dotProduct = 0,
      xMagnitude = 0,
      yMagnitude = 0;

  for(var ndx = 0; ndx < x.length; ndx++) {
    xMagnitude += x[ndx] * x[ndx];
    yMagnitude += y[ndx] * y[ndx];
    dotProduct += x[ndx] * y[ndx];
  }
  return dotProduct / ( Math.sqrt(xMagnitude) * Math.sqrt(yMagnitude) );
};

},{}],6:[function(require,module,exports){
//
//
//

//
module.exports = function(a, b, accessor) {
  var x = accessor ? a.map(accessor) : a,
      y = accessor ? b.map(accessor) : b,
      distance = 0;
  for(var ndx = 0; ndx < x.length; ndx++) {
    distance += (x[ndx] - y[ndx]) * (x[ndx] - y[ndx]);
  }
  return Math.sqrt(distance);
};

},{}],7:[function(require,module,exports){
//
//
//

//
module.exports = function(a, b, accessor) {
  var x = accessor ? a.map(accessor) : a,
      y = accessor ? b.map(accessor) : b,
      distance = 0;
  for(var ndx = 0; ndx < x.length; ndx++) {
    distance += Math.abs(x[ndx] - y[ndx]);
  }
  return distance;
};

},{}],8:[function(require,module,exports){
'use strict';

var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;

var isArray = function isArray(arr) {
  if (typeof Array.isArray === 'function') {
    return Array.isArray(arr);
  }

  return toStr.call(arr) === '[object Array]';
};

var isPlainObject = function isPlainObject(obj) {
  if (!obj || toStr.call(obj) !== '[object Object]') {
    return false;
  }

  var hasOwnConstructor = hasOwn.call(obj, 'constructor');
  var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
  // Not own constructor property must be Object
  if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
    return false;
  }

  // Own properties are enumerated firstly, so to speed up,
  // if last one is own, then all properties are own.
  var key;
  for (key in obj) {/**/}

  return typeof key === 'undefined' || hasOwn.call(obj, key);
};

module.exports = function extend() {
  var options, name, src, copy, copyIsArray, clone,
    target = arguments[0],
    i = 1,
    length = arguments.length,
    deep = false;

  // Handle a deep copy situation
  if (typeof target === 'boolean') {
    deep = target;
    target = arguments[1] || {};
    // skip the boolean and the target
    i = 2;
  } else if ((typeof target !== 'object' && typeof target !== 'function') || target == null) {
    target = {};
  }

  for (; i < length; ++i) {
    options = arguments[i];
    // Only deal with non-null/undefined values
    if (options != null) {
      // Extend the base object
      for (name in options) {
        src = target[name];
        copy = options[name];

        // Prevent never-ending loop
        if (target !== copy) {
          // Recurse if we're merging plain objects or arrays
          if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
            if (copyIsArray) {
              copyIsArray = false;
              clone = src && isArray(src) ? src : [];
            } else {
              clone = src && isPlainObject(src) ? src : {};
            }

            // Never move original objects, clone them
            target[name] = extend(deep, clone, copy);

          // Don't bring in undefined values
          } else if (typeof copy !== 'undefined') {
            target[name] = copy;
          }
        }
      }
    }
  }

  // Return the modified object
  return target;
};


},{}],9:[function(require,module,exports){
//
//
//
var distance = require('distancejs'),
    extend = require('extend');

//
var hcluster = function() {
  var data,
      clusters,
      clustersGivenK,
      treeRoot,
      posKey = 'position',
      distanceName = 'angular',
      distanceFn = distance.angular,
      linkage = 'avg',
      verbose = false;

  //
  // simple constructor
  function clust() { }

  //
  // getters, setters a la D3

  // return data or set data and build tree
  clust.data = function(value) {
    if(!arguments.length) return data;

    // dataset will be mutated
    data = value;
    clust._buildTree();
    return clust;
  };
  clust.posKey = function(value) {
    if(!arguments.length) return posKey;
    posKey = value;
    return clust;
  };
  clust.linkage = function(value) {
    if(!arguments.length) return linkage;
    linkage = value;
    return clust;
  };
  clust.verbose = function(value) {
    if(!arguments.length) return verbose;
    verbose = value;
    return clust;
  };
  clust.distance = function(value) {
    if(!arguments.length) return distanceName;
    distanceName = value;
    distanceFn = {
      angular: distance.angular,
      euclidean: distance.euclidean
    }[value] || distance.angular;
    return clust;
  }

  //
  // get tree properties

  clust.orderedNodes = function() {
    if(!treeRoot) throw new Error('Need to passin data and build tree first.');

    return treeRoot.indexes.map(function(ndx) {
      return data[ndx];
    });
  };
  clust.tree = function() {
    if(!treeRoot) throw new Error('Need to passin data and build tree first.');
    return treeRoot;
  };
  clust.getClusters = function(n) {
    if(!treeRoot) throw new Error('Need to passin data and build tree first.');
    if(n > data.length) throw new Error('n must be less than the size of the dataset');
    return clustersGivenK[data.length - n]
             .map(function(indexes) {
               return indexes.map(function(ndx) { return data[ndx]; });
             });
  };

  //
  // math, matrix utility fn's

  // return unique pairs of indexes on n x n matrix above the diagonal
  clust._squareMatrixPairs = function(n) {
    var pairs = [];
    for(var row = 0; row < n; row++) {
      for(var col = row + 1; col < n; col++) {
        pairs.push([row, col]);
      }
    }
    return pairs;
  };

  // average distance between set of cluster indexes
  clust._avgDistance = function(setA, setB) {
    var distance = 0;
    for(var ndxA = 0; ndxA < setA.length; ndxA++) {
      for(var ndxB = 0; ndxB < setB.length; ndxB++) {
        distance += data[setA[ndxA]]._distances[setB[ndxB]];
      }
    }
    return distance / setA.length / setB.length;
  };

  // min distance between set of cluster indexes
  clust._minDistance = function(setA, setB) {
    var distances = [];
    for(var ndxA = 0; ndxA < setA.length; ndxA++) {
      for(var ndxB = 0; ndxB < setB.length; ndxB++) {
        distances.push(data[setA[ndxA]]._distances[setB[ndxB]]);
      }
    }
    return distances.sort()[0];
  };

  // max distance between set of cluster indexes
  clust._maxDistance = function(setA, setB) {
    var distances = [];
    for(var ndxA = 0; ndxA < setA.length; ndxA++) {
      for(var ndxB = 0; ndxB < setB.length; ndxB++) {
        distances.push(data[setA[ndxA]]._distances[setB[ndxB]]);
      }
    }
    return distances.sort()[distances.length-1];
  };

  //
  // tree construction

  //
  clust._buildTree = function() {
    if(!data || !data.length) throw new Error('Need `data` to build tree');

    //
    var node, clusterPairs, nearestPair, newCluster;
    clusters = [];
    clustersGivenK = [];
    tree = {};

    // calculate distances and build single datum clusters
    data.forEach(function(d, ndx) {
      d._distances = data.map(function(compareTo) {
        return distanceFn(d[posKey], compareTo[posKey]);
      });
      clusters.push(extend(d, {
        height: 0,
        indexes: [ndx]
      }));
    });

    // for tree of n leafs, n-1 linkages
    for(var iter = 0; iter < data.length - 1; iter++) {
      verbose && console.log(iter + ': ' +
          clusters.map(function(c) { return c.indexes; }).join('|'));

      // find closest pair of clusters, pair[2] is distance
      clusterPairs = clust._squareMatrixPairs(clusters.length);
      clusterPairs.forEach(function(pair) {
        pair[2] = clust['_'+linkage+'Distance'](
                  clusters[pair[0]].indexes,
                  clusters[pair[1]].indexes ); });
      nearestPair = clusterPairs
        .reduce(function(pairA, pairB) { return pairA[2] <= pairB[2] ? pairA : pairB; },
                [0, 0, Infinity]);
      newCluster = {
        name: 'Node ' + iter,
        height: nearestPair[2],
        indexes: clusters[nearestPair[0]].indexes.concat(clusters[nearestPair[1]].indexes),
        children: [ clusters[nearestPair[0]], clusters[nearestPair[1]] ],
      };
      verbose && console.log(newCluster);
      clustersGivenK.push(clusters.map(function(c) { return c.indexes; }));

      // remove merged nodes and push new node
      clusters.splice(Math.max(nearestPair[0], nearestPair[1]),1);
      clusters.splice(Math.min(nearestPair[0], nearestPair[1]),1);
      clusters.push(newCluster);
    }

    treeRoot = clusters[0];
    // clust._rebalanceTree(treeRoot);
  };

  // TODO: better rebalancing algo? ... this is just for presentation
  // rebalance after tree is built (b/c it is top down operation)
  // clust._rebalanceTree = function(node) {
  //   if(node.parent && node.parent.children && node.parent.children.length &&
  //      node.children && node.children.length) {
  //     var rightDistance = clust['_'+linkage+'Distance'](
  //       node.parent.children[1].indexes,
  //       node.children[0].indexes);
  //     var leftDistance = clust['_'+linkage+'Distance'](
  //       node.parent.children[1].indexes,
  //       node.children[1].indexes);

  //     // switch order of node.children
  //     if(leftDistance > rightDistance) {
  //       node.children = [ node.children[1], node.children[0] ];
  //       node.indexes = node.children[0].indexes.concat(node.children[1].indexes);
  //     }
  //   }
  //   if(node.children) {
  //     clust._rebalanceTree(node.children[0]);
  //     clust._rebalanceTree(node.children[1]);
  //   }
  // };

  return clust;
};

module.exports = hcluster;

},{"distancejs":1,"extend":8}]},{},[9])(9)
});