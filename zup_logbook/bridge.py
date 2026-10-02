import json
import threading
from typing import Dict, Any, List, Optional
import webview

from .storage import storage
from .auth_manager import auth_manager
from .api_client import api_client
from .ai_service import ai_service
from .competences import get_available_competences

class BridgeAPI:
    def __init__(self):
        # Prefixo _ evita que o pywebview inspecione/serialize atributos internos para o JS
        self._main_window: Optional[webview.Window] = None

    def set_window(self, window: webview.Window):
        self._main_window = window
        auth_manager.set_main_window(window)

    def emit_event(self, event_name: str, payload: Any):
        if not self._main_window:
            return

        def _send():
            try:
                payload_json = json.dumps(payload, ensure_ascii=False)
                script = f"window.dispatchEvent(new CustomEvent('{event_name}', {{ detail: {payload_json} }}));"
                self._main_window.evaluate_js(script)
            except Exception as e:
                print(f"[Bridge] Erro ao emitir evento {event_name}: {e}")

        threading.Thread(target=_send, daemon=True).start()

    # ==================== Métodos da API expostos para o JS ====================

    def getSession(self) -> Dict[str, Any]:
        return storage.get_session()

    def startLogin(self) -> bool:
        print("[Bridge] startLogin chamado")
        def on_auth(session_data):
            self.emit_event("py:auth-status-changed", session_data)
            if session_data.get("token"):
                def _fetch_comps():
                    try:
                        comps = api_client.fetch_competences(force_refresh=True)
                        self.emit_event("py:competences-updated", comps)
                    except Exception as e:
                        print(f"[Bridge] Erro ao buscar competências pós login: {e}")
                threading.Thread(target=_fetch_comps, daemon=True).start()

        def on_close():
            print("[Bridge] Login embutido fechado/cancelado")
            self.emit_event("py:auth-status-changed", storage.get_session())

        auth_manager.open_login(callback=on_auth, on_close=on_close)
        return True

    def cancelLogin(self) -> bool:
        print("[Bridge] cancelLogin chamado")
        auth_manager.close_login_window()
        self.emit_event("py:auth-status-changed", storage.get_session())
        return True

    def setManualToken(self, token: str, refreshToken: Optional[str] = None) -> Dict[str, Any]:
        session = auth_manager.set_manual_token(token, refreshToken)
        self.emit_event("py:auth-status-changed", session)
        if session.get("token"):
            def _fetch_comps():
                try:
                    comps = api_client.fetch_competences(force_refresh=True)
                    self.emit_event("py:competences-updated", comps)
                except Exception as e:
                    print(f"[Bridge] Erro ao buscar competências: {e}")
            threading.Thread(target=_fetch_comps, daemon=True).start()
        return session

    def refreshToken(self) -> Dict[str, Any]:
        print("[Bridge] refreshToken chamado")
        success = auth_manager.refresh_access_token()
        session = storage.get_session()
        self.emit_event("py:auth-status-changed", session)
        if success and session.get("token"):
            def _fetch_comps():
                try:
                    comps = api_client.fetch_competences(force_refresh=True)
                    self.emit_event("py:competences-updated", comps)
                except Exception as e:
                    print(f"[Bridge] Erro ao buscar competências após refresh: {e}")
            threading.Thread(target=_fetch_comps, daemon=True).start()
        return {"success": success, "session": session}

    def logout(self) -> Dict[str, Any]:
        session = auth_manager.logout()
        self.emit_event("py:auth-status-changed", session)
        return session

    def getSettings(self) -> Dict[str, Any]:
        return storage.get_settings()

    def saveSettings(self, settings: Dict[str, Any]) -> Dict[str, Any]:
        return storage.update_settings(settings)

    def processRelato(self, userInput: str, history: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        return ai_service.process_relato(userInput, history or [])

    def submitLogbook(self, draft: Dict[str, Any]) -> Dict[str, Any]:
        return api_client.submit_logbook(draft)

    def getCompetences(self, forceRefresh: bool = False) -> List[Dict[str, Any]]:
        return api_client.fetch_competences(force_refresh=forceRefresh)

bridge_api = BridgeAPI()
