@echo off
echo Iniciando servidor local do Zup Logbook em http://localhost:8080...
echo Pressione Ctrl+C para encerrar.
python -m http.server 8080 --directory dist
pause
