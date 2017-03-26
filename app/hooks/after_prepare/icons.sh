#!/bin/bash
rm icon.png
../node_modules/.bin/svg2png ../src/icon.svg --output ./icon.png --width=512
../node_modules/.bin/cordova-icon
