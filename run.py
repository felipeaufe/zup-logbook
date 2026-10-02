#!/usr/bin/env python3
"""
Launcher conveniente para o Zup Logbook em Python.
Executa verificações e inicia a aplicação desktop.
"""
import sys
import subprocess
from pathlib import Path

def check_frontend():
    dist_index = Path(__file__).resolve().parent / "dist" / "index.html"
    if not dist_index.exists():
        print(">> Build do frontend não encontrado. Executando 'npm run build'...")
        try:
            subprocess.run(["pnpm", "build"], check=True)
        except (subprocess.CalledProcessError, FileNotFoundError):
            try:
                subprocess.run(["npm", "run", "build"], check=True)
            except Exception as e:
                print(f"Erro ao compilar frontend: {e}")
                print("Por favor, instale as dependências (pnpm install ou npm install) e execute o build.")
                sys.exit(1)

def main():
    check_frontend()
    from zup_logbook.main import main as app_main
    app_main()

if __name__ == "__main__":
    main()
