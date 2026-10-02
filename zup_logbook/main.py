import os
import sys
import threading
from pathlib import Path
import webview

from .storage import storage
from .competences import set_dynamic_competences
from .api_client import api_client
from .bridge import bridge_api
from .server import start_static_server

def main():
    # Carrega competências salvas em cache se existirem
    cached_comps = storage.get_cached_competences()
    if cached_comps:
        set_dynamic_competences(cached_comps)

    # Determina a raiz do projeto
    project_root = Path(__file__).resolve().parent.parent
    dist_dir = project_root / "dist"

    dev_url = os.environ.get("VITE_DEV_SERVER_URL")

    if dev_url:
        target_url = dev_url
        print(f"[Main] Modo Desenvolvimento ativo: Conectando a {target_url}")
    else:
        if not (dist_dir / "index.html").exists():
            print(f"[Main] Aviso: Arquivo {dist_dir / 'index.html'} não encontrado.")
            print("[Main] Execute 'pnpm build' ou 'npm run build' para compilar o frontend.")
            sys.exit(1)

        server, port = start_static_server(str(dist_dir))
        target_url = f"http://127.0.0.1:{port}"
        print(f"[Main] Servidor SPA local iniciado em {target_url}")

    # Criação da janela principal do aplicativo desktop
    window = webview.create_window(
        title="Zup Logbook - Diário de Bordo Inteligente",
        url=target_url,
        js_api=bridge_api,
        width=1200,
        height=850,
        min_size=(900, 650),
        background_color="#0D0E12",
        resizable=True,
    )
    bridge_api.set_window(window)

    # Sincroniza competências em background se já estiver conectado
    session = storage.get_session()
    if session.get("token"):
        def sync_bg():
            try:
                comps = api_client.fetch_competences(force_refresh=True)
                bridge_api.emit_event("py:competences-updated", comps)
            except Exception as e:
                print(f"[Main] Sincronização inicial de competências: {e}")
        threading.Thread(target=sync_bg, daemon=True).start()

    # Inicia o loop de eventos da interface nativa
    debug_mode = bool(os.environ.get("DEBUG") or os.environ.get("VITE_DEV_SERVER_URL"))
    webview.start(debug=debug_mode)

if __name__ == "__main__":
    main()
