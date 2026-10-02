#!/usr/bin/env python3
"""
Script de build para gerar o binário executável standalone do Zup Logbook.
1. Compila o frontend React (Vite) para a pasta dist/
2. Empacota a aplicação Python com PyInstaller gerando o binário em dist_bin/zup-logbook
"""
import os
import sys
import shutil
import subprocess
from pathlib import Path

def main():
    root = Path(__file__).resolve().parent
    venv_dir = root / ".venv"
    venv_pyinstaller = venv_dir / "bin" / "pyinstaller"
    venv_python = venv_dir / "bin" / "python"

    # Se chamado com o python do sistema mas existe o venv, re-executa no venv
    if venv_python.exists() and sys.prefix != str(venv_dir):
        os.execv(str(venv_python), [str(venv_python), str(__file__)] + sys.argv[1:])

    print("=" * 60)
    print("🚀  Iniciando processo de build do Zup Logbook")
    print("=" * 60)

    # 1. Compilação do Frontend
    dist_dir = root / "dist"
    print("\n📦 [1/3] Compilando assets do frontend (React + Tailwind)...")
    build_cmd = ["pnpm", "build"] if shutil.which("pnpm") else ["npm", "run", "build"]
    try:
        subprocess.run(build_cmd, cwd=root, check=True)
    except Exception as e:
        print(f"❌ Erro ao compilar o frontend com {' '.join(build_cmd)}: {e}")
        sys.exit(1)

    if not (dist_dir / "index.html").exists():
        print(f"❌ Arquivo {dist_dir / 'index.html'} não encontrado após o build!")
        sys.exit(1)
    print("✅ Frontend compilado com sucesso em dist/")

    # 2. Verificação do PyInstaller
    print("\n⚙️  [2/3] Verificando PyInstaller...")
    pyinstaller_bin = str(venv_pyinstaller) if venv_pyinstaller.exists() else shutil.which("pyinstaller")
    if not pyinstaller_bin:
        print(">> Instalando PyInstaller no ambiente virtual...")
        subprocess.run([sys.executable, "-m", "pip", "install", "pyinstaller>=6.0.0"], check=True)
        pyinstaller_bin = str(venv_pyinstaller) if venv_pyinstaller.exists() else shutil.which("pyinstaller")

    # 3. Empacotamento do Binário
    print("\n🔨 [3/3] Gerando executável standalone com PyInstaller...")
    dist_bin_dir = root / "dist_bin"
    build_work_dir = root / "build"
    dist_bin_dir.mkdir(exist_ok=True)

    cmd = [
        pyinstaller_bin,
        "--name", "zup-logbook",
        "--onefile",
        "--distpath", str(dist_bin_dir),
        "--workpath", str(build_work_dir),
        "--add-data", f"{dist_dir}:dist",
        "--hidden-import", "webview.platforms.gtk",
        "--hidden-import", "gi",
        "--hidden-import", "gi.repository.Gtk",
        "--hidden-import", "gi.repository.Gdk",
        "--hidden-import", "gi.repository.GLib",
        "--hidden-import", "gi.repository.WebKit2",
        "--noconfirm",
        "--clean",
        str(root / "run.py"),
    ]

    try:
        subprocess.run(cmd, cwd=root, check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Erro no empacotamento do binário: {e}")
        sys.exit(1)

    binary_path = dist_bin_dir / "zup-logbook"
    if binary_path.exists():
        size_mb = binary_path.stat().st_size / (1024 * 1024)
        print("\n" + "=" * 60)
        print("🎉  BINÁRIO GERADO COM SUCESSO!")
        print("=" * 60)
        print(f"📍 Local do arquivo : {binary_path}")
        print(f"📏 Tamanho          : {size_mb:.1f} MB")
        print("\nPara executar a aplicação:")
        print(f"  {binary_path}")
        print("=" * 60)
    else:
        print(f"❌ Binário não encontrado em {binary_path}")
        sys.exit(1)

if __name__ == "__main__":
    main()
