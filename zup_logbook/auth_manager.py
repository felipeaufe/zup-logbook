import base64
import json
import random
import string
import time
from urllib.parse import urlparse, parse_qs, unquote
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, Callable
import requests
import webview

from .storage import storage

def base64url_decode(payload_str: str) -> dict:
    rem = len(payload_str) % 4
    if rem > 0:
        payload_str += "=" * (4 - rem)
    data = base64.urlsafe_b64decode(payload_str.encode("utf-8"))
    return json.loads(data.decode("utf-8"))

def extract_clean_user_info(payload: dict) -> Dict[str, Optional[str]]:
    email = (payload.get("email") or payload.get("upn") or payload.get("unique_name") or "").strip()

    candidate_name = ""
    if payload.get("name") and isinstance(payload["name"], str):
        candidate_name = payload["name"].strip()
    elif payload.get("given_name"):
        if payload.get("family_name"):
            candidate_name = f"{payload['given_name']} {payload['family_name']}".strip()
        else:
            candidate_name = payload["given_name"].strip()

    # Evita duplicações como "felipe.feitosa felipe.feitosa"
    if candidate_name:
        parts = candidate_name.split()
        if len(parts) == 2 and parts[0].lower() == parts[1].lower():
            candidate_name = parts[0]

    if not candidate_name and payload.get("preferred_username"):
        candidate_name = payload["preferred_username"].strip()

    if not candidate_name:
        candidate_name = email.split("@")[0] if email else (payload.get("sub") or "")

    return {
        "name": candidate_name,
        "email": email or None,
    }

class AuthManager:
    def __init__(self):
        self.login_window: Optional[webview.Window] = None
        self.on_auth_callback: Optional[Callable[[dict], None]] = None
        self.is_refreshing = False

    def build_auth_url(self) -> str:
        state = "".join(random.choices(string.ascii_letters + string.digits, k=16)) + str(int(time.time()))
        nonce = "".join(random.choices(string.ascii_letters + string.digits, k=16)) + str(int(time.time()))
        redirect_uri = "https://people.zup.com.br/career/logbook"
        
        return (
            "https://keycloak-zenity.zup.com.br/auth/realms/zupinternal/protocol/openid-connect/auth?"
            f"client_id=realwave_zupper_csp_ui&redirect_uri={redirect_uri}&"
            f"response_mode=fragment&response_type=code%20id_token%20token&scope=openid&state={state}&nonce={nonce}"
        )

    def open_login(self, callback: Optional[Callable[[dict], None]] = None):
        if callback:
            self.on_auth_callback = callback

        if self.login_window:
            try:
                self.login_window.show()
                return
            except Exception:
                self.login_window = None

        target_url = self.build_auth_url()
        print(f"[Auth] Abrindo tela de autenticação Keycloak: {target_url}")

        self.login_window = webview.create_window(
            title="Autenticação People Zup (Keycloak & 2FA)",
            url=target_url,
            width=1080,
            height=780,
            resizable=True,
            confirm_close=False,
            background_color="#0D0E12",
        )

        def on_loaded():
            if not self.login_window:
                return
            try:
                current_url = self.login_window.get_current_url()
                print(f"[Auth] Navegação carregada: {current_url}")
                self._check_and_handle_url(current_url)
            except Exception as e:
                print(f"[Auth] Erro no listener loaded: {e}")

        self.login_window.events.loaded += on_loaded

    def close_login_window(self):
        if self.login_window:
            try:
                self.login_window.destroy()
            except Exception as e:
                print(f"[Auth] Erro ao fechar login window: {e}")
            self.login_window = None

    def _check_and_handle_url(self, url: str):
        if not url:
            return

        if "access_token=" in url or "code=" in url or "id_token=" in url:
            try:
                # O Keycloak no modo fragment retorna tokens após # ou após ?
                parsed = urlparse(url)
                params_str = parsed.fragment if parsed.fragment else parsed.query
                params = parse_qs(params_str)

                access_token_list = params.get("access_token")
                refresh_token_list = params.get("refresh_token")
                code_list = params.get("code")

                access_token = access_token_list[0] if access_token_list else None
                refresh_token = refresh_token_list[0] if refresh_token_list else None
                code = code_list[0] if code_list else None

                # Captura cookies da sessão webview se disponível
                cookies_dict = {}
                try:
                    if self.login_window:
                        wv_cookies = self.login_window.get_cookies()
                        for c in wv_cookies:
                            if hasattr(c, "key") and hasattr(c, "value"):
                                cookies_dict[c.key] = c.value
                            elif isinstance(c, dict):
                                cookies_dict[c.get("name")] = c.get("value")
                except Exception as ce:
                    print(f"[Auth] Aviso ao extrair cookies da janela: {ce}")

                if access_token and len(access_token) > 20:
                    print("[Auth] Access token capturado com sucesso!")
                    self.handle_token_captured(access_token, refresh_token=refresh_token, cookies=cookies_dict)
                    self.close_login_window()
                    return

                if code:
                    print("[Auth] Code capturado, trocando por tokens no Keycloak...")
                    success = self.exchange_code_for_tokens(code, "https://people.zup.com.br/career/logbook", cookies=cookies_dict)
                    if success:
                        self.close_login_window()
                        return
            except Exception as e:
                print(f"[Auth] Erro ao processar URL de autenticação: {e}")

    def exchange_code_for_tokens(self, code: str, redirect_uri: str, cookies: Optional[Dict[str, str]] = None) -> bool:
        endpoint = "https://keycloak-zenity.zup.com.br/auth/realms/zupinternal/protocol/openid-connect/token"
        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "*/*",
            "Origin": "https://people.zup.com.br",
            "Referer": "https://people.zup.com.br/",
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:156.0) Gecko/20100101 Firefox/156.0",
        }
        if cookies:
            cookie_header = "; ".join([f"{k}={v}" for k, v in cookies.items() if k and v])
            if cookie_header:
                headers["Cookie"] = cookie_header

        data = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": redirect_uri,
            "client_id": "realwave_zupper_csp_ui",
        }

        try:
            res = requests.post(endpoint, headers=headers, data=data, timeout=15)
            if res.ok:
                resp_json = res.json()
                access_token = resp_json.get("access_token")
                refresh_token = resp_json.get("refresh_token")
                expires_in = resp_json.get("expires_in")
                refresh_expires_in = resp_json.get("refresh_expires_in")

                if access_token:
                    self.handle_token_captured(
                        access_token,
                        refresh_token=refresh_token,
                        expires_in_sec=expires_in,
                        refresh_expires_in_sec=refresh_expires_in,
                        cookies=cookies,
                    )
                    return True
            else:
                print(f"[Auth] Erro na troca de code ({res.status_code}): {res.text}")
        except Exception as e:
            print(f"[Auth] Erro ao trocar code por token: {e}")
        return False

    def refresh_access_token(self) -> bool:
        if self.is_refreshing:
            for _ in range(20):
                time.sleep(0.2)
                if not self.is_refreshing:
                    session = storage.get_session()
                    return bool(session.get("token") and not session.get("isExpired"))
            return False

        current_session = storage.get_session()
        refresh_token = current_session.get("refreshToken")
        if not refresh_token:
            print("[Auth] Tentativa de renovação, mas nenhum refresh_token encontrado.")
            return False

        self.is_refreshing = True
        endpoint = "https://keycloak-zenity.zup.com.br/auth/realms/zupinternal/protocol/openid-connect/token"
        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "*/*",
            "Origin": "https://people.zup.com.br",
            "Referer": "https://people.zup.com.br/",
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:156.0) Gecko/20100101 Firefox/156.0",
        }
        
        cookies = current_session.get("cookies", {})
        if cookies:
            headers["Cookie"] = "; ".join([f"{k}={v}" for k, v in cookies.items() if k and v])

        data = {
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": "realwave_zupper_csp_ui",
        }

        try:
            print(f"[Auth] Renovando token JWT via Keycloak...")
            res = requests.post(endpoint, headers=headers, data=data, timeout=15)
            if res.ok:
                resp_json = res.json()
                new_access_token = resp_json.get("access_token")
                new_refresh_token = resp_json.get("refresh_token") or refresh_token
                expires_in = resp_json.get("expires_in")
                refresh_expires_in = resp_json.get("refresh_expires_in")

                if new_access_token:
                    print("[Auth] Token JWT renovado com sucesso!")
                    self.handle_token_captured(
                        new_access_token,
                        refresh_token=new_refresh_token,
                        expires_in_sec=expires_in,
                        refresh_expires_in_sec=refresh_expires_in,
                    )
                    return True
            else:
                print(f"[Auth] Falha no refresh ({res.status_code}): {res.text}")
        except Exception as e:
            print(f"[Auth] Erro na requisição de refresh: {e}")
        finally:
            self.is_refreshing = False
        return False

    def handle_token_captured(
        self,
        token: str,
        refresh_token: Optional[str] = None,
        expires_in_sec: Optional[int] = None,
        refresh_expires_in_sec: Optional[int] = None,
        cookies: Optional[Dict[str, str]] = None,
    ):
        user_info = None
        expires_at = None
        refresh_expires_at = None

        if expires_in_sec:
            expires_at = (datetime.now(timezone.utc) + timedelta(seconds=expires_in_sec)).isoformat()
        if refresh_expires_in_sec:
            refresh_expires_at = (datetime.now(timezone.utc) + timedelta(seconds=refresh_expires_in_sec)).isoformat()

        try:
            parts = token.split(".")
            if len(parts) == 3:
                payload = base64url_decode(parts[1])
                user_info = extract_clean_user_info(payload)
                if not expires_at and payload.get("exp"):
                    expires_at = datetime.fromtimestamp(payload["exp"], tz=timezone.utc).isoformat()
        except Exception as err:
            print(f"[Auth] Aviso ao decodificar JWT: {err}")

        session_update: Dict[str, Any] = {
            "token": token,
            "user": user_info,
            "lastLogin": datetime.now(timezone.utc).isoformat(),
            "expiresAt": expires_at,
            "isExpired": False,
        }
        if refresh_token:
            session_update["refreshToken"] = refresh_token
        if refresh_expires_at:
            session_update["refreshExpiresAt"] = refresh_expires_at
        if cookies:
            current_cookies = storage.get_session().get("cookies", {})
            current_cookies.update(cookies)
            session_update["cookies"] = current_cookies

        updated_session = storage.update_session(session_update)
        if self.on_auth_callback:
            self.on_auth_callback(updated_session)

    def set_manual_token(self, token: str, refresh_token: Optional[str] = None) -> dict:
        user_info = None
        expires_at = None
        try:
            parts = token.split(".")
            if len(parts) == 3:
                payload = base64url_decode(parts[1])
                user_info = extract_clean_user_info(payload)
                if payload.get("exp"):
                    expires_at = datetime.fromtimestamp(payload["exp"], tz=timezone.utc).isoformat()
        except Exception:
            pass

        data: Dict[str, Any] = {
            "token": token,
            "user": user_info,
            "lastLogin": datetime.now(timezone.utc).isoformat(),
            "expiresAt": expires_at,
            "isExpired": False,
        }
        if refresh_token is not None:
            data["refreshToken"] = refresh_token

        updated = storage.update_session(data)
        if self.on_auth_callback:
            self.on_auth_callback(updated)
        return updated

    def logout(self) -> dict:
        self.close_login_window()
        cleared = storage.clear_session()
        if self.on_auth_callback:
            self.on_auth_callback(cleared)
        return cleared

auth_manager = AuthManager()
