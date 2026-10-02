import os
import socket
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

class SPAHandler(SimpleHTTPRequestHandler):
    """
    Handler para Single Page Applications (SPA) que serve index.html
    quando o arquivo solicitado não existe.
    """
    def __init__(self, *args, directory=None, **kwargs):
        super().__init__(*args, directory=directory, **kwargs)

    def log_message(self, format, *args):
        # Silencia logs detalhados de cada requisição estática para não poluir o terminal
        pass

    def do_GET(self):
        # Remove query parameters para checar existência física do arquivo
        path_without_query = self.path.split("?")[0]
        file_path = os.path.join(self.directory, path_without_query.lstrip("/"))
        if not os.path.exists(file_path) and not path_without_query.startswith("/api/"):
            # Se for rota SPA, serve o index.html
            self.path = "/index.html"
        return super().do_GET()

def find_free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("", 0))
        return s.getsockname()[1]

def start_static_server(dist_dir: str) -> tuple[ThreadingHTTPServer, int]:
    port = find_free_port()
    handler = partial(SPAHandler, directory=dist_dir)
    server = ThreadingHTTPServer(("127.0.0.1", port), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server, port
