# 🚀 Zup Logbook - Versão Simplificada (Bookmarklet)

> 💡 **Branch `bookmarklet-simplified`**: Versão minimalista e direta ao ponto do Zup Logbook. Foi criada exclusivamente para o **Registro de Performance**, enviando o JSON diretamente para a API do People Zup (`/dune/v1/entry`), sem necessidade de IA, sem criptografia e sem interface complexa.

---

## ✨ Características desta versão

- **Super Simples**: Apenas o título da aplicação, uma área de texto para colar o JSON pronto e o botão de envio.
- **Direto para a API**: Não há pré-processamento ou tratamento de dados; o JSON colado é enviado diretamente para a API do People Zup (`https://apiznt.zenity.zup.com.br/dune/v1/entry`).
- **Zero IA & Zero Criptografia**: Não requer chaves de API, nem serviços de IA ou senhas adicionais.
- **Detecção Automática de Sessão**: Aproveita o token JWT/Keycloak ativo da sua sessão aberta no People Zup.
- **Feedback Imediato**: Notificação clara de sucesso (com ID gerado) ou falha detalhada.
- **Limpeza Automática**: Ao concluir o envio com sucesso, o formulário é limpo automaticamente.
- **Widget Compacto & Flutuante**: Abre como um card flutuante elegante no canto superior direito, sem cobrir a tela inteira.

---

## ⚡ Como Usar (Instalação no Navegador)

### 1. Criar o Favorito no Navegador
1. Exiba a Barra de Favoritos do seu navegador (`Ctrl + Shift + B` ou `Cmd + Shift + B`).
2. Clique com o botão direito na barra de favoritos e selecione **Adicionar página...** / **Adicionar favorito**.
3. Preencha os campos:
   - **Nome:** `⭐ Zup Logbook (Simplificado)`
   - **URL:** Cole o código abaixo exatamente como está:

```javascript
javascript:(function(){if(!location.hostname.includes('people.zup.com.br')){location.href='https://people.zup.com.br/career/logbook';return;}const h=document.getElementById('zup-logbook-host');if(h){h.style.display=h.style.display==='none'?'block':'none';return;}const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/felipeaufe/zup-logbook@bookmarklet-simplified/dist/zup-logbook.bookmarklet.js?t='+Date.now();document.body.appendChild(s);})();
```

4. Clique em **Salvar**.

---

### 2. Enviando um Diário de Bordo
1. Acesse o portal do **People Zup** ([people.zup.com.br/career/logbook](https://people.zup.com.br/career/logbook)) e faça seu login.
2. Clique no favorito **"⭐ Zup Logbook (Simplificado)"** na barra do navegador.
3. Cole o JSON do seu relato no campo de texto.
4. Clique em **Enviar para o People** (ou pressione `Ctrl + Enter`).
5. A notificação de sucesso confirmará o registro e o formulário será limpo automaticamente.

---

## 🛠️ Desenvolvimento Local

```bash
# Instalar dependências
pnpm install # ou npm install

# Rodar modo desenvolvimento
npm run dev

# Compilar bookmarklet
npm run build
```
