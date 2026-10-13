@echo off
chcp 65001 >nul
title GameScore App - Lanzador del Proyecto

echo ========================================================
echo   🎮 INICIADOR AUTOMATICO - GAMESCORE APP
echo   Prueba Evaluable APIs (Módulo 2, Unidad 3)
echo ========================================================
echo.

set "JAVA_HOME=C:\Program Files\Android\openjdk\jdk-21.0.8"
set "MVN_PATH=C:\Users\adrao\.m2\wrapper\dists\apache-maven-3.9.16\0daed3be3ebd1c706f0e69e8b07c6b73f5cc4ea3dfce72a8d0ec2e849ca2ddb0\bin\mvn.cmd"
set "MYSQL_PATH=C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe"

if not exist "%MYSQL_PATH%" (
    set "MYSQL_PATH=mysql"
)

echo [1/3] Verificando Base de Datos MySQL...
"%MYSQL_PATH%" -u root -p"Admin" -e "USE gamescore_db;" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Creando e inicializando base de datos gamescore_db...
    "%MYSQL_PATH%" -u root -p"Admin" --default-character-set=utf8mb4 -e "source %~dp0database/gamescore_db.sql"
) else (
    echo [OK] Base de datos 'gamescore_db' detectada y lista.
)

echo.
echo [2/3] Arrancando Servidor Frontend en http://localhost:5502...
start "Frontend GameScore (Puerto 5502)" powershell -NoExit -ExecutionPolicy Bypass -File "%~dp0frontend\servidor_frontend.ps1" -Port 5502

echo.
echo [3/3] Arrancando Backend Spring Boot en http://localhost:8082...
start "Backend Spring Boot GameScore (Puerto 8082)" cmd /c "cd /d "%~dp0backend" && set "JAVA_HOME=%JAVA_HOME%" && "%MVN_PATH%" spring-boot:run"

echo.
echo Abriendo la aplicación en tu navegador...
timeout /t 3 >nul
start http://localhost:5502

echo.
echo ========================================================
echo   ✅ Aplicación iniciada con éxito:
echo   - Frontend:    http://localhost:5502
echo   - Backend API: http://localhost:8082/puntuaciones
echo   - Base Datos:  MySQL gamescore_db (:3306)
echo ========================================================
echo.
pause
