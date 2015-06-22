
build: node_modules
	node_modules/.bin/metalsmith
	# cp -rf source/ public/

node_modules: package.json
	npm install

.PHONY: build
