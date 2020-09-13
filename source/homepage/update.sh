#!/bin/bash

: '
add screenshot 

https://1wheel.imgur.com/all/


update sheet

https://docs.google.com/spreadsheets/d/1xUvK5PGo8XPqARJIvXRnn71lJSL8CwjvjUWB9Jcy0Ho
'


cd "$(dirname "$0")"
cd ../../../archive-roadtolarissa/homepage-list/

node script.js
node script.js
yarn pub

cd ../../roadtolarissa/source/homepage/

node list-bin.js
# yarn pub 
