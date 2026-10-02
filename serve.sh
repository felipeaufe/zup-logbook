#!/bin/bash
echo "🚀 Iniciando servidor local do Zup Logbook em http://localhost:8080..."
echo "Pressione Ctrl+C para encerrar."
python3 -m http.server 8080 --directory dist
