function ƒ(str){ return function(d){ return typeof(str) == 'undefined' ? d : d[str] } } 

(function() {
        
    function jetpack(d3) {
        d3.selection.prototype.translate = function(xy) {
            return this.attr('transform', function(d,i) {
                return 'translate('+[typeof xy == 'function' ? xy(d,i) : xy]+')';
            });
        };

        d3.transition.prototype.translate = function(xy) {
            return this.attr('transform', function(d,i) {
                return 'translate('+[typeof xy == 'function' ? xy(d,i) : xy]+')';
            });
        };

        d3.selection.prototype.tspans = function(lines, lh) {
            return this.selectAll('tspan')
                .data(lines)
                .enter()
                .append('tspan')
                .text(function(d) { return d; })
                .attr('x', 0)
                .attr('dy', lh || 15);
        };

        d3.selection.prototype.append = 
        d3.selection.enter.prototype.append = function(name) {
            var n = d3_parse_attributes(name), s;
            //console.log(name, n);
            name = n.attr ? n.tag : name;
            name = d3_selection_creator(name);
            s = this.select(function() {
                return this.appendChild(name.apply(this, arguments));
            });
            return n.attr ? s.attr(n.attr) : s;
        };

        d3.selection.prototype.insert = 
        d3.selection.enter.prototype.insert = function(name, before) {
            var n = d3_parse_attributes(name), s;
            name = n.attr ? n.tag : name;
            name = d3_selection_creator(name);
            before = d3_selection_selector(before);
            s = this.select(function() {
                return this.insertBefore(name.apply(this, arguments), before.apply(this, arguments) || null);
            });
            return n.attr ? s.attr(n.attr) : s;
        };

        d3.selection.prototype.styleC = function(name){
            return this.style(name, d3.compose.apply(null, [].slice.call(arguments, 1)))
        }
        d3.selection.prototype.attrC = function(name){
            return this.attr(name, d3.compose.apply(null, [].slice.call(arguments, 1)))
        }
        d3.transition.prototype.styleC = function(name){
            return this.style(name, d3.compose.apply(null, [].slice.call(arguments, 1)))
        }
        d3.transition.prototype.attrC = function(name){
            return this.attr(name, d3.compose.apply(null, [].slice.call(arguments, 1)))
        }

        d3.selection.prototype.appendData = function(name, data){
            return this.selectAll('#zzzzzz')
                    .data(data)
                    .enter()
                    .append(name)
        }


        var d3_parse_attributes_regex = /([\.#])/g;

        function d3_parse_attributes(name) {
            if (typeof name === "string") {
                var attr = {},
                    parts = name.split(d3_parse_attributes_regex), p;
                    name = parts.shift();
                while ((p = parts.shift())) {
                    if (p == '.') attr['class'] = attr['class'] ? attr['class'] + ' ' + parts.shift() : parts.shift();
                    else if (p == '#') attr.id = parts.shift();
                }
                return attr.id || attr['class'] ? { tag: name, attr: attr } : name;
            }
            return name;
        }

        function d3_selection_creator(name) {
            return typeof name === "function" ? name : (name = d3.ns.qualify(name)).local ? function() {
                return this.ownerDocument.createElementNS(name.space, name.local);
            } : function() {
                return this.ownerDocument.createElementNS(this.namespaceURI, name);
            };
        }

        function d3_selection_selector(selector) {
            return typeof selector === "function" ? selector : function() {
                return this.querySelector(selector);
            };
        }

        d3.wordwrap = function(line, maxCharactersPerLine) {
            var w = line.split(' '),
                lines = [],
                words = [],
                maxChars = maxCharactersPerLine || 40,
                l = 0;
            w.forEach(function(d) {
                if (l+d.length > maxChars) {
                    lines.push(words.join(' '));
                    words.length = 0;
                    l = 0;
                }
                l += d.length;
                words.push(d);
            });
            if (words.length) {
                lines.push(words.join(' '));
            }
            return lines;
        };
        
        d3.ascendingKey = function(key) {
            return typeof key == 'function' ? function (a, b) {
                  return key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : key(a) >= key(b) ? 0 : NaN;
            } : function (a, b) {
                  return a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : a[key] >= b[key] ? 0 : NaN;
            };
        };

        d3.descendingKey = function(key) {
            return typeof key == 'function' ? function (a, b) {
                return key(b) < key(a) ? -1 : key(b) > key(a) ? 1 : key(b) >= key(a) ? 0 : NaN;
            } : function (a, b) {
                return b[key] < a[key] ? -1 : b[key] > a[key] ? 1 : b[key] >= a[key] ? 0 : NaN;
            };
        };

        d3.conventions = function(c){
          c = c || {}

          c.width  = c.width  || 900
          c.height = c.height || 500

          c.margin = c.margin || {top: 20, right: 20, bottom: 20, left: 25}

          c.parentSel = c.parentSel || d3.select('body')

          c.svg = c.svg || c.parentSel.append("svg")
              .attr("width", c.width + c.margin.left + c.margin.right)
              .attr("height", c.height + c.margin.top + c.margin.bottom)
            .append("g")
              .attr("transform", "translate(" + c.margin.left + "," + c.margin.top + ")")

          c.color   = c.color   || d3.scale.category10()
          c.x       = c.x       || d3.scale.linear().range([0, c.width])
          c.y       = c.y       || d3.scale.linear().range([c.height, 0])
          c.rScale  = c.rScale  || d3.scale.sqrt().range([5, 20])
          c.line    = c.line    || d3.svg.line()


          c.xAxis = c.xAxis || d3.svg.axis().scale(c.x).orient("bottom");
          c.yAxis = c.yAxis || d3.svg.axis().scale(c.y).orient("left")


          c.drawAxis = function(){
            c.svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + c.height + ")")
                .call(c.xAxis);

            c.svg.append("g")
                .attr("class", "y axis")
                .call(c.yAxis);
          }
          
          return c
        }

        d3.attachTooltip = function(sel, fieldFns){
          sel 
              .on('mouseover', ttDisplay)
              .on('mousemove', ttMove)
              .on('mouseout',  ttHide)

          function ttDisplay(d){
            d3.select('.tooltip')
                .classed('tooltip-hidden', false)
                .html('')
              .appendData('div', fieldFns || d3.keys(d).map(function(str){ return function(d){ return str + ': ' + d[str] } }))
                .text(function(fn){ return fn(d) })

            d3.select(this).classed('tooltipped', true)
          }

          function ttMove(d){
            var tt = d3.select('.tooltip')
            if (!tt.size()) return
            var e = d3.event,
              x = e.clientX,
              y = e.clientY,
              doctop = (window.scrollY)? window.scrollY : (document.documentElement && document.documentElement.scrollTop)? document.documentElement.scrollTop : document.body.scrollTop;
              n = tt.node(),
              nBB = n.getBoundingClientRect()

            tt.style('top', (y+doctop-nBB.height-18)+"px");
            tt.style('left', Math.min(Math.max(0, (x-nBB.width/2)), window.innerWidth - nBB.width)+"px");
          }

          function ttHide(d){
            d3.select('.tooltip').classed('tooltip-hidden', true);

            d3.selectAll('.tooltipped').classed('tooltipped', false)
          }
        }

        d3.compose = function(){
          var functions = arguments 
          return function(d){
            var i = functions.length
            while(i--) d = functions[i].call(this, d)
            return d
          }
        }

    }

    if (typeof d3 === 'object' && d3.version) jetpack(d3);
    else if (typeof define === 'function' && define.amd) {
        define(['d3'], jetpack);
    }

})();