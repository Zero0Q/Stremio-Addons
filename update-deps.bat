@echo off
echo Installing dependencies for all addons...

cd addons\PirateScroll
call npm install
cd ..\episonext
call npm install
cd ..\stremio-customizer
call npm install
cd ..\..

echo Dependencies installation complete!