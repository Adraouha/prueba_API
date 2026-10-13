@echo off
chcp 65001 >nul
title Restaurar Base de Datos - gamescore_db

echo ========================================================
echo   🗄️  INICIALIZADOR DE BASE DE DATOS - gamescore_db
echo ========================================================
echo.

set "MYSQL_PATH=C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe"
if not exist "%MYSQL_PATH%" (
    set "MYSQL_PATH=mysql"
)

echo Ejecutando script SQL en MySQL...
"%MYSQL_PATH%" -u root -p"Admin" --default-character-set=utf8mb4 -e "source %~dp0database/gamescore_db.sql"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [OK] Base de datos 'gamescore_db' creada e inicializada correctamente.
    echo.
    "%MYSQL_PATH%" -u root -p"Admin" -e "USE gamescore_db; SELECT * FROM jugador; SELECT * FROM puntuacion;"
) else (
    echo.
    echo [ERROR] No se pudo inicializar la base de datos. Verifica la contraseña o servicio MySQL.
)

echo.
pause
