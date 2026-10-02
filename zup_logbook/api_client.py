import json
from typing import Dict, Any, List
import requests

from .storage import storage
from .auth_manager import auth_manager
from .competences import set_dynamic_competences, get_available_competences

def is_likely_token_expired(status: int, response_data: Any, response_text: str) -> bool:
    if status in (401, 403):
        return True
    if status == 400:
        text = (json.dumps(response_data or "") + " " + (response_text or "")).lower()
        keywords = [
            "token", "expired", "expirou", "expirado", "jwt",
            "unauthorized", "invalid_token", "bearer", "auth", "forbidden"
        ]
        if any(kw in text for kw in keywords):
            return True
        session = storage.get_session()
        if session.get("isExpired") or session.get("refreshToken"):
            return True
    return False

class ApiClient:
    def fetch_competences(self, force_refresh: bool = False) -> List[Dict[str, Any]]:
        session = storage.get_session()
        cached = storage.get_cached_competences()

        if not force_refresh and cached:
            set_dynamic_competences(cached)
            return cached

        if not session.get("token"):
            return cached if cached else get_available_competences()

        endpoint = "https://apiznt.zenity.zup.com.br/dune/v1/performance-review/competence"
        headers = {
            "Accept": "application/json, text/plain, */*",
            "authorization": f"Bearer {session['token']}",
            "Origin": "https://people.zup.com.br",
            "Referer": "https://people.zup.com.br/",
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:156.0) Gecko/20100101 Firefox/156.0",
        }

        try:
            print(f"[API] Consultando competências no People Zup ({endpoint})...")
            res = requests.get(endpoint, headers=headers, timeout=(5, 12))

            if res.status_code in (400, 401):
                print(f"[API] {res.status_code} ao buscar competências. Tentando refresh...")
                if auth_manager.refresh_access_token():
                    fresh_session = storage.get_session()
                    headers["authorization"] = f"Bearer {fresh_session['token']}"
                    res = requests.get(endpoint, headers=headers, timeout=(5, 12))

            if res.ok:
                data = res.json()
                if isinstance(data, list) and len(data) > 0:
                    print(f"[API] {len(data)} competências dinâmicas carregadas!")
                    storage.set_cached_competences(data)
                    set_dynamic_competences(data)
                    return data
            else:
                print(f"[API] Resposta inesperada de competências: {res.status_code}")
        except Exception as err:
            print(f"[API] Erro ao buscar competências: {err}")

        return cached if cached else get_available_competences()

    def submit_logbook(self, draft: Dict[str, Any], is_retry: bool = False) -> Dict[str, Any]:
        session = storage.get_session()
        settings = storage.get_settings()

        if not session.get("token"):
            return {
                "success": False,
                "message": "Token de autenticação não encontrado. Por favor, conecte-se ao People Zup.",
            }

        if session.get("isExpired") and not is_retry:
            print("[API] Token expirado detectado antes do envio. Tentando renovação...")
            if auth_manager.refresh_access_token():
                return self.submit_logbook(draft, is_retry=True)

        target_url = settings.get("logbookEndpoint") or "https://apiznt.zenity.zup.com.br/dune/v1/entry"

        # Constrói o texto simples
        plain_content = (draft.get("content") or "").strip()
        if not plain_content and draft.get("blocks"):
            plain_content = "\n\n".join(
                [f"{b.get('title', '')}\n{b.get('description', '')}" for b in draft["blocks"]]
            )

        # Formatação Slate AST exigida pela API Dune do People Zup
        formatted_content = [
            {"type": "paragraph", "children": [{"text": line}]}
            for line in plain_content.split("\n")
        ]

        is_performance = draft.get("isPerformanceReview", True) and draft.get("type") != "livre"

        if is_performance:
            competences_payload = [
                {"id": c["id"], "name": c["name"]}
                for c in draft.get("competences", [])
                if "id" in c and "name" in c
            ]
            payload = {
                "title": draft.get("title", ""),
                "formattedContent": formatted_content,
                "isPerformanceReview": True,
                "competences": competences_payload,
                "metadata": {
                    "templateFor": draft.get("templateFor") or "NON_LEADERSHIP",
                },
                "content": plain_content,
            }
        else:
            payload = {
                "content": plain_content,
                "formattedContent": formatted_content,
                "title": draft.get("title", ""),
                "isPerformanceReview": False,
            }

        headers = {
            "Content-Type": "application/json",
            "Accept": "*/*",
            "authorization": f"Bearer {session['token']}",
            "Origin": "https://people.zup.com.br",
            "Referer": "https://people.zup.com.br/",
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:156.0) Gecko/20100101 Firefox/156.0",
        }

        print(f"[API] Enviando diário para {target_url}...")
        try:
            res = requests.post(target_url, headers=headers, json=payload, timeout=(5, 20))
            res_text = res.text
            try:
                res_data = res.json()
            except Exception:
                res_data = {"text": res_text}

            if res.ok:
                entry_id = res_data.get("id", "")
                return {
                    "success": True,
                    "message": f"Diário de Bordo #{entry_id} registrado com sucesso no People Zup!",
                    "responseStatus": res.status_code,
                    "data": res_data,
                }

            if not is_retry and is_likely_token_expired(res.status_code, res_data, res_text):
                print(f"[API] Status {res.status_code} indica token expirado. Renovando...")
                if auth_manager.refresh_access_token():
                    retry_result = self.submit_logbook(draft, is_retry=True)
                    retry_result["refreshedToken"] = True
                    return retry_result

                auth_manager.open_login()
                return {
                    "success": False,
                    "message": "Sua sessão expirou no People Zup. Abrimos a janela de login para você revalidar seu 2FA.",
                    "responseStatus": res.status_code,
                    "data": res_data,
                }

            err_msg = res_data.get("message") if isinstance(res_data, dict) else res_text
            return {
                "success": False,
                "message": f"Falha ao registrar diário ({res.status_code}): {err_msg or 'Erro inesperado'}",
                "responseStatus": res.status_code,
                "data": res_data,
            }
        except Exception as err:
            print(f"[API] Erro de rede ao submeter diário: {err}")
            return {
                "success": False,
                "message": f"Erro de conexão com People Zup ({err}).",
            }

api_client = ApiClient()
