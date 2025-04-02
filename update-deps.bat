@echo off
cd addons
for /d %%i in (*) do (
  if exist "%%i\package.json" (
    echo Updating dependencies in %%i...
    cd "%%i"
    npm install
    npm update
    cd ..
  )
)
cd ..
echo All dependencies updated!