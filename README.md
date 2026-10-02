# Zup Logbook - Diário de Bordo Inteligente (Python + IA)

Um aplicativo desktop moderno e intuitivo construído em **Python** (com **pywebview** nativo), **React 19**, **TypeScript** e **Tailwind CSS** para automatizar o registro de diários de bordo no **People Zup** (`people.zup.com.br`).

---

## 🚀 Como Funciona

1. **Apresentação e Conexão**: Ao abrir a aplicação, a tela inicial apresenta o assistente. Ao clicar em *Conectar*, uma janela segura do People Zup (Keycloak) é aberta.
2. **Autenticação com 2FA**: O usuário realiza seu login habitual e valida o Segundo Fator de Autenticação (2FA) corporativo.
3. **Captura e Renovação de Token**: O aplicativo captura o Bearer token JWT, cookies e refresh token, fechando a janela de login e levando o usuário diretamente ao chat. Possui renovação automática e silenciosa em caso de expiração do token.
4. **Chat com Agente de IA**:
   - Suporte nativo à **StackSpot AI** (Personal Access Token ou OAuth2 Client Credentials com Quick Commands / Chat API), além de Google Gemini e OpenAI.
   - O usuário descreve livremente suas atividades do dia.
   - O agente de IA processa o relato, seleciona o template apropriado (Liderança / Não Liderança), identifica competências oficiais e gera o **Card de Proposta Visual**.
5. **Revisão e Ajustes**: O usuário pode aprovar com um clique, editar os campos diretamente ou solicitar alterações conversando com a IA.
6. **Disparo do POST & Limpeza**: Ao aprovar, o app converte o registro para o formato Slate AST esperado pela API Dune do People Zup e efetua o envio autenticado.

---

## 🛠️ Tecnologias

- **Python 3.10+**: Backend nativo com `pywebview` integrado ao WebKit2/GTK no Linux e WebView2 no Windows.
- **React 19 & TypeScript**: Interface visual reativa, rápida e fluida.
- **Tailwind CSS**: Design escuro oficial Zup Purple (`#7B2CBF` / `#0D0E12`).
- **Lucide Icons**: Ícones modernos e consistentes.
- **StackSpot AI / Google Gemini / OpenAI**: Motores de IA para estruturação de diários.

---

## 📦 Como Executar

### 1. Pré-requisitos
- Python 3.10 ou superior
- Node.js e pnpm (ou npm)

### 2. Configurar o Ambiente Python
```bash
# Criar o ambiente virtual com acesso a pacotes do sistema (WebKitGTK/gi)
python3 -m venv --system-site-packages .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 3. Instalar Dependências e Compilar o Frontend
```bash
pnpm install
pnpm build
```

### 4. Iniciar a Aplicação
```bash
python3 run.py
```

Ou via script npm:
```bash
pnpm start
```

---

## ⚙️ Configurações

O aplicativo conta com uma tela de **Configurações** (ícone de engrenagem) que permite:
- **Provedor de IA**: Escolher entre StackSpot AI (PAT ou Client ID/Secret com Realm e Quick Command), Google Gemini e OpenAI.
- **People Zup**: Visualizar o status de conexão, tempo de expiração do token, botão de renovação manual, ou inserir token JWT diretamente.
- **Templates e Instruções**: Customizar os 3 blocos oficiais (Templates de Liderança, Não Liderança e Instruções de Sistema da IA) com botão para restaurar padrões a qualquer momento.
