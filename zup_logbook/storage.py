import os
import json
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from .templates import (
    DEFAULT_INSTRUCTIONS,
    DEFAULT_LEADERSHIP_TEMPLATE,
    DEFAULT_NON_LEADERSHIP_TEMPLATE,
)

DEFAULT_SETTINGS: Dict[str, Any] = {
    "aiProvider": "stackspot",
    "stackspotClientId": "",
    "stackspotClientSecret": "",
    "stackspotRealm": "zup",
    "stackspotSlug": "",
    "stackspotToken": "",
    "aiApiKey": "",
    "aiModel": "gemini-2.5-flash",
    "peopleBaseUrl": "https://people.zup.com.br",
    "logbookEndpoint": "https://apiznt.zenity.zup.com.br/dune/v1/entry",
    "customInstructions": DEFAULT_INSTRUCTIONS,
    "leadershipTemplate": DEFAULT_LEADERSHIP_TEMPLATE,
    "nonLeadershipTemplate": DEFAULT_NON_LEADERSHIP_TEMPLATE,
    "saveSession": True,
    "capturedHeaders": {},
}

class StorageService:
    def __init__(self):
        config_dir = Path.home() / ".config" / "zup-logbook"
        config_dir.mkdir(parents=True, exist_ok=True)
        self.config_path = config_dir / "zup-logbook-config.json"
        
        self.settings: Dict[str, Any] = dict(DEFAULT_SETTINGS)
        self.session: Dict[str, Any] = {
            "token": None,
            "refreshToken": None,
            "cookies": {},
            "user": None,
            "lastLogin": None,
            "expiresAt": None,
            "refreshExpiresAt": None,
            "isExpired": False,
        }
        self.cached_competences: List[Dict[str, Any]] = []
        self.load()

    def load(self):
        try:
            if self.config_path.exists():
                with open(self.config_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.settings = {**DEFAULT_SETTINGS, **data.get("settings", {})}
                    if not self.settings.get("leadershipTemplate"):
                        self.settings["leadershipTemplate"] = DEFAULT_LEADERSHIP_TEMPLATE
                    if not self.settings.get("nonLeadershipTemplate"):
                        self.settings["nonLeadershipTemplate"] = DEFAULT_NON_LEADERSHIP_TEMPLATE
                    if not self.settings.get("customInstructions"):
                        self.settings["customInstructions"] = DEFAULT_INSTRUCTIONS

                    if data.get("session") and self.settings.get("saveSession", True):
                        self.session = {**self.session, **data["session"]}

                    if isinstance(data.get("cachedCompetences"), list):
                        self.cached_competences = data["cachedCompetences"]
        except Exception as err:
            print(f"[Storage] Erro ao carregar configurações: {err}")

    def save(self):
        try:
            data = {
                "settings": self.settings,
                "session": self.session if self.settings.get("saveSession", True) else None,
                "cachedCompetences": self.cached_competences,
            }
            with open(self.config_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        except Exception as err:
            print(f"[Storage] Erro ao salvar configurações: {err}")

    def get_cached_competences(self) -> List[Dict[str, Any]]:
        return self.cached_competences

    def set_cached_competences(self, competences: List[Dict[str, Any]]):
        self.cached_competences = competences
        self.save()

    def get_settings(self) -> Dict[str, Any]:
        return self.settings

    def update_settings(self, new_settings: Dict[str, Any]) -> Dict[str, Any]:
        self.settings.update(new_settings)
        self.save()
        return self.settings

    def get_session(self) -> Dict[str, Any]:
        if self.session.get("expiresAt"):
            try:
                exp_str = self.session["expiresAt"].replace("Z", "+00:00")
                exp_time = datetime.fromisoformat(exp_str)
                now = datetime.now(timezone.utc)
                self.session["isExpired"] = now > exp_time
            except Exception:
                pass
        return self.session

    def update_session(self, new_session: Dict[str, Any]) -> Dict[str, Any]:
        self.session.update(new_session)
        if self.session.get("expiresAt"):
            try:
                exp_str = self.session["expiresAt"].replace("Z", "+00:00")
                exp_time = datetime.fromisoformat(exp_str)
                now = datetime.now(timezone.utc)
                self.session["isExpired"] = now > exp_time
            except Exception:
                pass
        self.save()
        return self.session

    def clear_session(self) -> Dict[str, Any]:
        self.session = {
            "token": None,
            "refreshToken": None,
            "cookies": {},
            "user": None,
            "lastLogin": None,
            "expiresAt": None,
            "refreshExpiresAt": None,
            "isExpired": False,
        }
        self.save()
        return self.session

storage = StorageService()
