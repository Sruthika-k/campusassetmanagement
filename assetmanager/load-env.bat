@echo off
echo Loading environment variables from .env file...

REM Read .env file and set environment variables
for /f "tokens=1,2 delims==" %%a in (.env) do (
    set %%a=%%b
    echo Set %%a=%%b
)

echo Environment variables loaded. Starting application...
mvn spring-boot:run
