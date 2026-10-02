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

## 📦 Preparação do Ambiente e Execução (Após o Clone)

### 1. Pré-requisitos

- **Python**: 3.10 ou superior
- **Node.js**: 18+ e gerenciador de pacotes (`pnpm` ou `npm`)
- **Dependências de Sistema (apenas Linux)**:
  - **Fedora / RHEL**:
    ```bash
    sudo dnf install -y python3-gobject webkit2gtk4.1 gtk3
    ```
  - **Ubuntu / Debian**:
    ```bash
    sudo apt update && sudo apt install -y python3-gi python3-gi-cairo gir1.2-gtk-3.0 gir1.2-webkit2-4.1
    ```
  - *(No Windows e macOS não são necessários pacotes adicionais do sistema, pois o WebView2 e WebKit Cocoa já são nativos).*

---

### 2. Forma Rápida (Bootstrap Automático)

Após clonar o repositório e instalar as dependências do frontend:

```bash
# 1. Instalar dependências do frontend
pnpm install   # ou npm install

# 2. Executar o bootstrap automático
python3 run.py
```

> O script `run.py` detectará a ausência do ambiente virtual, criará o `.venv` automaticamente com `--system-site-packages`, instalará as dependências do `requirements.txt`, compilará o frontend se a pasta `dist/` não existir e iniciará a aplicação.

---

### 3. Forma Manual Passo a Passo

```bash
# 1. Instalar dependências do frontend e compilar
pnpm install
pnpm build

# 2. Criar e ativar o ambiente virtual Python
python3 -m venv --system-site-packages .venv
source .venv/bin/activate  # No Windows: .venv\Scripts\activate

# 3. Instalar dependências Python
pip install -r requirements.txt

# 4. Iniciar a aplicação
python3 run.py
```

---

### 4. Como Gerar o Binário Standalone (Executável)

Para gerar um executável independente que não necessita de Python instalado na máquina:

```bash
python3 build_binary.py
# ou
pnpm build:bin
```

O binário final será criado em:
- **Linux / macOS**: `dist_bin/zup-logbook`
- **Windows**: `dist_bin/zup-logbook.exe`

Para executar:
```bash
./dist_bin/zup-logbook
```

---

## ⚙️ Configurações

O aplicativo conta com uma tela de **Configurações** (ícone de engrenagem) que permite:
- **Provedor de IA**: Escolher entre StackSpot AI (PAT ou Client ID/Secret com Realm e Quick Command), Google Gemini e OpenAI.
- **People Zup**: Visualizar o status de conexão, tempo de expiração do token, botão de renovação manual, ou inserir token JWT diretamente.
- **Templates e Instruções**: Customizar os 3 blocos oficiais (Templates de Liderança, Não Liderança e Instruções de Sistema da IA) com botão para restaurar padrões a qualquer momento.
