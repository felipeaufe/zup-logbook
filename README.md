# 🚀 Zup Logbook - Diário de Bordo Inteligente (Bookmarklet & IA)

> 💡 **Branch `bookmarklet`**: Esta branch contém a versão Bookmarklet do assistente. Ela roda diretamente injetada no portal **People Zup**, aproveitando a sessão e autenticação já existentes, com interface isolada via **Shadow DOM** e sem necessidade de servidores locais ou instalações de aplicativos!

---

## ⚡ Como Usar (Instalação em 1 Minuto)

O Zup Logbook é carregado através de um **Bookmarklet Loader** ultra-leve (~450 caracteres), 100% compatível com a barra de favoritos de qualquer navegador.

### 1. Criar o Favorito no Navegador
1. Exiba a Barra de Favoritos do seu navegador:
   - **Chrome / Edge / Brave:** `Ctrl + Shift + B` (ou `Cmd + Shift + B` no Mac)
   - **Firefox:** `Ctrl + Shift + B`
2. Clique com o botão direito na barra de favoritos e selecione **Adicionar página...** / **Adicionar favorito**.
3. Preencha os campos:
   - **Nome:** `⭐ Zup Logbook`
   - **URL:** Cole o código do Loader abaixo exatamente como está:

```javascript
javascript:(function(){if(!location.hostname.includes('people.zup.com.br')){location.href='https://people.zup.com.br/career/logbook';return;}const h=document.getElementById('zup-logbook-host');if(h){h.style.display=h.style.display==='none'?'block':'none';return;}const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/felipeaufe/zup-logbook@bookmarklet/dist/zup-logbook.bookmarklet.js?t='+Date.now();document.body.appendChild(s);})();
```

4. Clique em **Salvar**.

---

## 🌐 Onde e Como o Script está Hospedado?

O script compilado da aplicação está versionado diretamente neste repositório GitHub e distribuído através da CDN global **jsDelivr**:

- **Repositório GitHub:** [`felipeaufe/zup-logbook`](https://github.com/felipeaufe/zup-logbook)
- **Branch:** [`bookmarklet`](https://github.com/felipeaufe/zup-logbook/tree/bookmarklet)
- **Arquivo no Repositório:** [`dist/zup-logbook.bookmarklet.js`](https://github.com/felipeaufe/zup-logbook/blob/bookmarklet/dist/zup-logbook.bookmarklet.js)
- **URL Pública CDN (jsDelivr Edge):**
  ```text
  https://cdn.jsdelivr.net/gh/felipeaufe/zup-logbook@bookmarklet/dist/zup-logbook.bookmarklet.js
  ```

### 🔒 Por que usar a CDN jsDelivr?
1. **MIME Type Correto:** O GitHub raw serve arquivos com `text/plain` (o que navegadores bloqueiam em `<script>`). O jsDelivr entrega com `Content-Type: application/javascript; charset=utf-8`.
2. **CORS Aberto (`*`):** Permite que o portal do People Zup baixe e execute o script sem bloqueios de segurança do navegador.
3. **Distribuição Global (Edge Cache):** Utiliza a rede da Cloudflare e Fastly para entregar o script em poucos milissegundos com servidores locais no Brasil.
4. **Sem Servidores Locais:** Você e outros usuários não precisam rodar Python, Node.js ou manter terminais abertos.
5. **Cache-Busting Automático:** O parâmetro `?t=Date.now()` no loader garante que novas versões publicadas no repositório sejam baixadas sem travar no cache local do navegador.

---

## 🎯 Fluxo de Funcionamento do Loader

1. **Auto-redirecionamento:** Se você clicar no favorito estando em qualquer outra página (ex: Google, Jira, Slack), o navegador será redirecionado automaticamente para a página do People Zup (`https://people.zup.com.br/career/logbook`).
2. **Injeção do Assistente:** Estando na página do People Zup, o loader baixa o script da CDN e renderiza a aplicação dentro de um **Shadow DOM isolado**, garantindo que nenhum estilo do People conflite com o aplicativo.
3. **Toggle Instantâneo:** Clicar novamente no favorito ou no botão `X` oculta ou exibe a gaveta na hora, sem recarregar o script da internet.
4. **Sessão Automática:** Como roda dentro da página do People Zup, as requisições de diário de bordo aproveitam a sessão do usuário já autenticada (incluindo 2FA).

---

## 🖥️ Recursos da Interface

- **Largura Flexível:** Abre por padrão em **100% da largura** e conta com botão no cabeçalho para alternar para modo gaveta lateral de **720px**.
- **Dock Esquerda / Direita:** Quando em 720px, botões direcionais permitem ancorar o painel no lado direito ou esquerdo da tela, com animação suave e fixação contextual.
- **Agente de IA Integrado:** Converse naturalmente sobre suas atividades do dia; o assistente gera a proposta estruturada do diário de bordo para aprovação e envio direto ao People Zup.

---

## 🛠️ Desenvolvimento Local e Build

Caso deseje alterar o código fonte e gerar uma nova versão:

### 1. Instalar dependências
```bash
npm install
```

### 2. Compilar para produção e atualizar o bundle
```bash
npm run build
```
O comando de build compila o TypeScript/React via Vite e executa o script `scripts/build-bookmarklet.js`, que atualiza os arquivos em `dist/`:
- `dist/zup-logbook.bookmarklet.js`
- `dist/bookmarklet.txt`
- `dist/index.html`

### 3. Publicar alterações no GitHub
```bash
git add dist/ scripts/ README.md
git commit -m "feat: atualizações no bookmarklet"
git push origin bookmarklet
```
Assim que o push for feito na branch `bookmarklet`, a CDN jsDelivr refletirá a nova versão automaticamente!
