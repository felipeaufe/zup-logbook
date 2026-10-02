#!/usr/bin/env python3
"""
Launcher conveniente para o Zup Logbook em Python.
Detecta e utiliza automaticamente o ambiente virtual (.venv),
compila o frontend se necessário e inicia a aplicação desktop.
"""
import os
import sys
import subprocess
from pathlib import Path

def ensure_venv():
    root = Path(__file__).resolve().parent
    venv_dir = root / ".venv"
    venv_python = venv_dir / "bin" / "python"

    # Se já estamos executando dentro do .venv, apenas checa se dependências estão ok
    if sys.prefix == str(venv_dir):
        return

    # Se o .venv já existe mas o script foi chamado com o python global do sistema
    if venv_python.exists():
        os.execv(str(venv_python), [str(venv_python)] + sys.argv)

    # Se o .venv não existir, cria automaticamente usando os pacotes do sistema (WebKitGTK/gi)
    print(">> Configurando ambiente virtual Python (.venv)...")
    try:
        subprocess.run(
            [sys.executable, "-m", "venv", "--system-site-packages", str(venv_dir)],
            check=True,
        )
        requirements_file = root / "requirements.txt"
        if requirements_file.exists():
            print(">> Instalando dependências (requirements.txt)...")
            subprocess.run(
                [str(venv_python), "-m", "pip", "install", "-r", str(requirements_file)],
                check=True,
            )
        os.execv(str(venv_python), [str(venv_python)] + sys.argv)
    except Exception as err:
        print(f"Erro ao configurar ambiente virtual: {err}")
        print("Tente rodar manualmente:\n  python3 -m venv --system-site-packages .venv && source .venv/bin/activate && pip install -r requirements.txt")
        sys.exit(1)

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
    ensure_venv()
    check_frontend()
    if "--test" in sys.argv or "--check" in sys.argv:
        import webview
        from zup_logbook.main import main as app_main
        print(">> Ambiente virtual e dependências (pywebview, requests) verificados com sucesso!")
        return
    from zup_logbook.main import main as app_main
    app_main()

if __name__ == "__main__":
    main()
