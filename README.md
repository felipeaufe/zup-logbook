# Zup Logbook - Diário de Bordo Inteligente (Electron + IA)

Um aplicativo desktop moderno e intuitivo construído com **Electron**, **React**, **TypeScript** e **Tailwind CSS** para automatizar o registro de diários de bordo no **People Zup** (`people.zup.com.br`).

---

## 🚀 Como Funciona

1. **Apresentação e Conexão**: Ao abrir a aplicação, uma tela inicial apresenta o assistente. Ao clicar em *Conectar*, uma janela segura do navegador do People Zup é aberta.
2. **Autenticação com 2FA**: O usuário realiza seu login habitual e valida o Segundo Fator de Autenticação (2FA) diretamente no People Zup.
3. **Interceptação Automática do JWT**: O Electron intercepta de forma transparente o token Bearer JWT e cookies da sessão assim que a autenticação é concluída, fechando a janela do People Zup e levando o usuário diretamente ao chat.
4. **Chat com Agente de IA**:
   - O usuário descreve livremente suas atividades do dia (ex.: *"Hoje foquei 6h na refatoração do módulo de autenticação e participei de 2h de alinhamentos"*).
   - O agente de IA processa o texto, aplica as regras de negócio, calcula a duração e gera um **Card de Proposta Visual**.
5. **Revisão e Ajustes**: O usuário pode aprovar com um clique, editar os campos diretamente ou solicitar alterações conversando com a IA (ex.: *"Mude a categoria para Bugfix"*).
6. **Disparo do POST & Limpeza**: Ao aprovar, o app converte o registro para o formato JSON esperado pela API do People Zup e efetua o envio autenticado. Após o sucesso, a tela é limpa automaticamente para um novo registro.

---

## 🛠️ Tecnologias

- **Electron**: Plataforma desktop multiplataforma (Linux, Windows, macOS).
- **Vite & React 19**: Interface moderna, ágil e reativa.
- **Tailwind CSS**: Design escuro, polido e elegante.
- **Lucide Icons**: Ícones modernos e consistentes.
- **Google Gemini API / OpenAI**: Inteligência artificial para extração e estruturação automática de dados.

---

## 📦 Como Executar

### 1. Instalar Dependências
```bash
npm install
```

### 2. Iniciar em Modo de Desenvolvimento
```bash
npm run dev
```

### 3. Compilar para Produção
```bash
npm run build
```

---

## ⚙️ Configurações

O aplicativo conta com uma tela de **Configurações** (ícone de engrenagem) que permite:
- **IA**: Escolher entre Google Gemini e OpenAI, inserir a chave de API e selecionar o modelo (padrão: `gemini-2.5-flash`).
- **People Zup**: Customizar a URL base (`https://people.zup.com.br`) e o endpoint do diário (padrão: `/api/v1/logbook`), inspecionar ou copiar o JWT ativo, ou inserir um token manualmente.
- **Regras do Diário**: Ajustar as instruções de sistema fornecidas à IA.
