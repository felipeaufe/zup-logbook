import unittest
from zup_logbook.storage import StorageService
from zup_logbook.competences import get_available_competences, set_dynamic_competences, ALL_COMPETENCES
from zup_logbook.templates import DEFAULT_INSTRUCTIONS, DEFAULT_LEADERSHIP_TEMPLATE, DEFAULT_NON_LEADERSHIP_TEMPLATE
from zup_logbook.ai_service import ai_service
from zup_logbook.bridge import bridge_api

class TestZupLogbookPython(unittest.TestCase):
    def test_competences_catalog(self):
        comps = get_available_competences()
        self.assertGreaterEqual(len(comps), 100)
        names = [c["name"] for c in comps]
        self.assertIn("Colaboramos de verdade", names)
        self.assertIn("StackSpot AI", names)

    def test_storage_service(self):
        storage = StorageService()
        settings = storage.get_settings()
        self.assertIn("aiProvider", settings)
        self.assertIn("logbookEndpoint", settings)
        session = storage.get_session()
        self.assertIn("token", session)

    def test_ai_parsing(self):
        mock_raw = '''
```json
{
  "message": "Estruturado com sucesso!",
  "title": "Entrega de feature no People",
  "blocks": [
    {"title": "Resultado/impacto (momento atual):", "description": "Entregue com qualidade."}
  ],
  "templateFor": "NON_LEADERSHIP",
  "competenceIds": [1, 23],
  "hours": 8
}
```
'''
        result = ai_service._parse_ai_result(mock_raw, "Fiz a entrega")
        self.assertEqual(result["draft"]["title"], "Entrega de feature no People")
        self.assertEqual(len(result["draft"]["competences"]), 2)
        comp_ids = [c["id"] for c in result["draft"]["competences"]]
        self.assertIn(1, comp_ids)
        self.assertIn(23, comp_ids)

    def test_bridge_api_methods_exist(self):
        methods = [
            "getSession", "startLogin", "cancelLogin", "setManualToken",
            "refreshToken", "logout", "getSettings", "saveSettings",
            "processRelato", "testAiConnection", "submitLogbook", "getCompetences"
        ]
        for m in methods:
            self.assertTrue(hasattr(bridge_api, m), f"Method {m} missing on bridge_api")

    def test_ai_test_connection_validation(self):
        # Sem credenciais na StackSpot
        res = ai_service.test_connection({"aiProvider": "stackspot", "stackspotToken": "", "stackspotClientId": ""})
        self.assertFalse(res["success"])
        self.assertIn("Nenhuma credencial configurada", res["message"])

        # Sem API key no Gemini
        res_gemini = ai_service.test_connection({"aiProvider": "gemini", "aiApiKey": ""})
        self.assertFalse(res_gemini["success"])
        self.assertIn("Chave de API do Google Gemini não configurada", res_gemini["message"])

        # Sem API key na OpenAI
        res_openai = ai_service.test_connection({"aiProvider": "openai", "aiApiKey": ""})
        self.assertFalse(res_openai["success"])
        self.assertIn("Chave de API da OpenAI não configurada", res_openai["message"])

if __name__ == "__main__":
    unittest.main()
