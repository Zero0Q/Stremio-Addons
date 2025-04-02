#!/bin/bash

echo "Installing dependencies for all addons..."

cd addons/PirateScroll
npm install
cd ../episonext
npm install
cd ../stremio-customizer
npm install
cd ../..

echo "Dependencies installation complete!" 