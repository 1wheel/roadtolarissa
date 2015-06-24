
build: node_modules
	node_modules/.bin/metalsmith
	cp -rf source/ public/

	mkdir -p public/blog/2015/01/04/coloring-maps-with-d3/ && cp public/coloring-maps/index.html public/blog/2015/01/04/coloring-maps-with-d3/index.html
	mkdir -p public/blog/2015/02/22/svg-path-strings/ && cp public/path-strings/index.html public/blog/2015/02/22/svg-path-strings/index.html
	mkdir -p public/blog/2014/06/23/even-fewer-lamdas-with-d3 && cp public/even-fewer-lamdas-with-d3/index.html public/blog/2014/06/23/even-fewer-lamdas-with-d3index.html

node_modules: package.json
	npm install

.PHONY: build
