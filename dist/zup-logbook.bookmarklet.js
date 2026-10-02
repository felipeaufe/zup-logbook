var X=Object.defineProperty;var Y=(I,C,L)=>C in I?X(I,C,{enumerable:!0,configurable:!0,writable:!0,value:L}):I[C]=L;var q=(I,C,L)=>Y(I,typeof C!="symbol"?C+"":C,L);(function(I){"use strict";const C=`Você é o assistente inteligente de Diário de Bordo da Zup.
Sua missão é transformar os relatos informais do Zupper em registros claros, objetivos, profissionais e organizados de Diário de Bordo para a plataforma People.
Regras:
1. Crie um Título impactante e profissional para o diário.
2. Estruture o conteúdo utilizando os templates e seções oficiais da Zup.
3. Selecione as competências técnicas e comportamentais mais relevantes para o relato EXCLUSIVAMENTE a partir do catálogo oficial fornecido.
4. O template padrão é NON_LEADERSHIP (ou LEADERSHIP se for liderança).`,L=`Resultado/impacto (momento atual):
Registre cases e entregas da sua área que estão alinhados com as expectativas da Zup.

Atitude e comportamento:
Registre como suas atitudes e comportamentos têm contribuído para agregar valor aos clientes e ao sucesso da sua área e do time em que lidera.

Conhecimento Técnico da Prática:
Registre as tecnologias, ferramentas, conceitos e metodologias que você tem aplicado como liderança, avaliando a consistência dessa prática e o quanto você incentiva intencionalmente seu time a adotar esses mesmos recursos.

Aprendizado Tech:
Registre os aprendizados e a evolução técnica que você apresentou como liderança, ao conduzir entregas e em seus estudos intencionais. Descreva também como você tem incentivado seu time a buscar o mesmo desenvolvimento técnico e a realizar estudos direcionados.

Expectativas de Entregas:
Registre os combinados e expectativas de suas entregas e entregas da área, alinhados com seu time para os próximos dias, semanas, meses.

Comentários Adicionais e Feedback Recebido:
Registre comentários adicionais, como feedbacks recebidos de clientes ou pares.`,$=`Resultado/impacto (momento atual):
Registre cases e entregas que você vem trabalhando que estão alinhadas com as expectativas da sua atuação e do resultado da Zup.

Atitude e comportamento:
Faça um registro de como sua atitude/comportamento têm contribuído para agregar valor aos clientes e ao sucesso do time.

Conhecimento Técnico da Prática:
Registre quais são as tecnologias, ferramentas, conceitos e metodologias que você tem aplicado em sua atuação, reforçando o quão consistente está na prática.

Aprendizado Tech:
Registre quais são os aprendizados e evolução técnica que você teve durante a execução das suas entregas e também em estudos intencionais.

Expectativas de Entregas:
Registre combinados e expectativas de entregas alinhados com sua liderança para os próximos dias, semanas, meses.

Comentários Adicionais e Feedback Recebido:
Registre comentários adicionais, como feedbacks recebidos de clientes ou pares.`,R={SETTINGS:"zup_logbook_settings",SESSION:"zup_logbook_session",COMPETENCES:"zup_logbook_competences"},Z={aiProvider:"stackspot",stackspotClientId:"",stackspotClientSecret:"",stackspotRealm:"zup",stackspotSlug:"",stackspotToken:"",aiApiKey:"",aiModel:"gemini-2.5-flash",peopleBaseUrl:"https://people.zup.com.br",logbookEndpoint:"https://apiznt.zenity.zup.com.br/dune/v1/entry",customInstructions:C,leadershipTemplate:L,nonLeadershipTemplate:$,saveSession:!0};class K{constructor(){q(this,"settings",Z);q(this,"session",{token:null,refreshToken:null,cookies:{},user:null,lastLogin:null,expiresAt:null,refreshExpiresAt:null});q(this,"cachedCompetences",[]);this.load()}load(){try{const e=localStorage.getItem(R.SETTINGS);e&&(this.settings={...Z,...JSON.parse(e)}),this.settings.leadershipTemplate||(this.settings.leadershipTemplate=L),this.settings.nonLeadershipTemplate||(this.settings.nonLeadershipTemplate=$),this.settings.customInstructions||(this.settings.customInstructions=C);const n=localStorage.getItem(R.SESSION);n&&this.settings.saveSession&&(this.session={...this.session,...JSON.parse(n)});const s=localStorage.getItem(R.COMPETENCES);s&&(this.cachedCompetences=JSON.parse(s))}catch(e){console.warn("Erro ao carregar dados do localStorage:",e)}}save(){try{localStorage.setItem(R.SETTINGS,JSON.stringify(this.settings)),this.settings.saveSession?localStorage.setItem(R.SESSION,JSON.stringify(this.session)):localStorage.removeItem(R.SESSION),localStorage.setItem(R.COMPETENCES,JSON.stringify(this.cachedCompetences))}catch(e){console.warn("Erro ao salvar dados no localStorage:",e)}}getSettings(){return this.settings}updateSettings(e){return this.settings={...this.settings,...e},this.save(),this.settings}getSession(){if(this.session.expiresAt){const e=new Date(this.session.expiresAt).getTime();this.session.isExpired=Date.now()>e}return this.session}updateSession(e){if(this.session={...this.session,...e},this.session.expiresAt){const n=new Date(this.session.expiresAt).getTime();this.session.isExpired=Date.now()>n}return this.save(),this.session}clearSession(){this.session={token:null,refreshToken:null,cookies:{},user:null,lastLogin:null,expiresAt:null,refreshExpiresAt:null,isExpired:!1},this.save()}getCachedCompetences(){return this.cachedCompetences}setCachedCompetences(e){this.cachedCompetences=e,this.save()}}const k=new K;function M(l){if(!l||typeof l!="string")return null;try{const e=l.trim().split(".");if(e.length===3){let n=e[1].replace(/-/g,"+").replace(/_/g,"/");for(;n.length%4!==0;)n+="=";try{const s=decodeURIComponent(atob(n).split("").map(o=>"%"+("00"+o.charCodeAt(0).toString(16)).slice(-2)).join(""));return JSON.parse(s)}catch{return JSON.parse(atob(n))}}}catch(e){console.warn("Erro ao decodificar JWT:",e)}return null}function H(l){if(!l)return{};const e=(l.email||l.upn||l.unique_name||"").trim(),n=(l.preferred_username||(e?e.split("@")[0]:"")||l.sub||"").trim();let s="";if(l.name&&typeof l.name=="string"?s=l.name.trim():l.given_name&&(s=l.family_name?`${l.given_name} ${l.family_name}`.trim():l.given_name.trim()),s){const o=s.split(/\s+/);o.length===2&&o[0].toLowerCase()===o[1].toLowerCase()&&(s=o[0])}return{name:s||void 0,username:n||void 0,email:e||void 0}}function W(l){return!l||typeof l!="string"?[]:l.match(/eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+/g)||[]}class G{constructor(){q(this,"listeners",[]);q(this,"isRefreshing",!1);this.setupNetworkInterceptors(),this.detectSessionFromPage()}setupNetworkInterceptors(){try{if(window.__zup_interceptors_installed)return;window.__zup_interceptors_installed=!0;const e=this,n=window.fetch;window.fetch=async function(...o){const p=o[0],t=o[1];try{let c=null;if(t&&t.headers)if(t.headers instanceof Headers)c=t.headers.get("Authorization")||t.headers.get("authorization");else if(Array.isArray(t.headers)){const i=t.headers.find(([h])=>h.toLowerCase()==="authorization");i&&(c=i[1])}else typeof t.headers=="object"&&(c=t.headers.Authorization||t.headers.authorization||t.headers.AUTHORIZATION);if(c&&c.toLowerCase().startsWith("bearer ")){const i=c.replace(/^bearer\s+/i,"").trim();i&&i.length>20&&e.handleDiscoveredToken(i)}if((typeof p=="string"?p:p?.url||"").includes("protocol/openid-connect/token")&&t?.body){const i=typeof t.body=="string"?t.body:"",v=new URLSearchParams(i).get("refresh_token");v&&k.updateSession({refreshToken:v})}}catch{}const r=await n.apply(this,o);try{(typeof p=="string"?p:p?.url||"").includes("protocol/openid-connect/token")&&r.ok&&r.clone().json().then(i=>{i?.access_token&&(console.log("[ZupLogbook] Novo token interceptado da resposta do Keycloak!"),e.handleKeycloakTokenResponse(i))}).catch(()=>{})}catch{}return r};const s=XMLHttpRequest.prototype.setRequestHeader;XMLHttpRequest.prototype.setRequestHeader=function(o,p){try{if(o&&o.toLowerCase()==="authorization"&&p&&p.toLowerCase().startsWith("bearer ")){const t=p.replace(/^bearer\s+/i,"").trim();t&&t.length>20&&e.handleDiscoveredToken(t)}}catch{}return s.apply(this,[o,p])}}catch(e){console.warn("Erro ao configurar interceptadores de rede no Bookmarklet:",e)}}handleDiscoveredToken(e,n){const s=k.getSession();s.token===e&&!s.isExpired||(console.log("Novo token interceptado na página do People Zup!"),this.setManualToken(e,n))}detectSessionFromPage(e=!1){const n=k.getSession();if(!e&&n.token&&!n.isExpired)return n;try{for(const r of[sessionStorage,localStorage])try{for(let c=0;c<r.length;c++){const a=r.key(c);if(a&&a.startsWith("oidc.user:")){const i=JSON.parse(r.getItem(a)||"{}");if(i.access_token){const h=M(i.access_token);if((h?.exp?h.exp*1e3:i.expires_at?i.expires_at*1e3:1/0)>Date.now()+1e4)return console.log("[ZupLogbook] Sessão OIDC ativa encontrada diretamente em "+a),this.setManualToken(i.access_token,i.refresh_token)}}}}catch{}const o=[],p=r=>{const c=W(r);for(const a of c){const i=M(a);i&&o.push({token:a,payload:i,exp:i.exp?i.exp*1e3:1/0,typ:(i.typ||i.type||"").toLowerCase()})}};for(let r=0;r<sessionStorage.length;r++){const c=sessionStorage.key(r);if(c){const a=sessionStorage.getItem(c);a&&p(a)}}for(let r=0;r<localStorage.length;r++){const c=localStorage.key(r);if(c&&!c.startsWith("zup_logbook")){const a=localStorage.getItem(c);a&&p(a)}}p(document.cookie);const t=window;t.keycloak?.token&&p(t.keycloak.token),t.keycloak?.refreshToken&&p(t.keycloak.refreshToken);for(const r of["keycloak","_keycloak","kc","auth","currentUser","__PRELOADED_STATE__"])try{t[r]&&p(typeof t[r]=="string"?t[r]:JSON.stringify(t[r]))}catch{}if(o.length>0){const r=Date.now(),c=o.filter(g=>g.exp>r+1e4),a=o.find(g=>g.typ==="refresh"||(g.payload?.type||"").toLowerCase()==="refresh"),i=g=>g.typ==="id"||(g.payload?.type||"").toLowerCase()==="id",h=c.filter(g=>g!==a&&!i(g));h.sort((g,m)=>{const y=g.typ==="bearer"?2:g.payload?.resource_access||g.payload?.realm_access?1:0,f=m.typ==="bearer"?2:m.payload?.resource_access||m.payload?.realm_access?1:0;return y!==f?f-y:m.exp-g.exp}),a&&k.updateSession({refreshToken:a.token});const v=h[0]||c.find(g=>g.typ==="bearer")||c[0];if(v)return console.log("[ZupLogbook] Sessão encontrada com sucesso na varredura profunda!"),this.setManualToken(v.token,a?.token)}}catch(o){console.warn("Erro ao auto-detectar sessão do portal:",o)}const s=k.getSession();return(!s.token||s.isExpired)&&s.refreshToken&&!this.isRefreshing&&(console.log("[ZupLogbook] Sessão expirada na página, renovando automaticamente com refresh token..."),this.refreshAccessToken().catch(()=>{})),k.getSession()}async triggerSilentSsoCheck(){return console.log("Disparando verificação silenciosa de SSO com Keycloak..."),new Promise(e=>{const n=document.createElement("iframe");n.style.display="none",n.id="zup-logbook-sso-iframe";const s=encodeURIComponent(window.location.origin+window.location.pathname),o=Math.random().toString(36).substring(2),p=Math.random().toString(36).substring(2),t=`https://keycloak-zenity.zup.com.br/auth/realms/zupinternal/protocol/openid-connect/auth?client_id=realwave_zupper_csp_ui&redirect_uri=${s}&response_mode=fragment&response_type=code%20id_token%20token&scope=openid&prompt=none&state=${o}&nonce=${p}`;let r=null;const c=()=>{r&&clearTimeout(r);try{n.parentNode&&n.parentNode.removeChild(n)}catch{}};r=setTimeout(()=>{c();const a=this.detectSessionFromPage(!0);e(!!a.token)},4e3),n.onload=()=>{try{const a=n.contentWindow?.location.href||"";if(a.includes("access_token=")||a.includes("code=")){const i=a.split("#")[1]||a.split("?")[1]||"",h=new URLSearchParams(i),v=h.get("access_token"),g=h.get("refresh_token");if(v){console.log("Token obtido com sucesso via Silent SSO do Keycloak!"),this.setManualToken(v,g||void 0),c(),e(!0);return}}}catch{}},n.src=t,document.body.appendChild(n)})}handleKeycloakTokenResponse(e){if(!e?.access_token)return null;const n=e.access_token,s=e.refresh_token,o=M(n),p=o?H(o):null;let t=o?.exp?o.exp*1e3:0;if(e.expires_in){const a=Date.now()+Number(e.expires_in)*1e3;(!t||a>t)&&(t=a)}t<=Date.now()&&(t=Date.now()+3e5);const r=new Date(t).toISOString();try{for(let a=0;a<sessionStorage.length;a++){const i=sessionStorage.key(a);if(i&&i.startsWith("oidc.user:")){const h=JSON.parse(sessionStorage.getItem(i)||"{}");h.access_token=n,s&&(h.refresh_token=s),e.id_token&&(h.id_token=e.id_token),h.expires_at=Math.floor(t/1e3),sessionStorage.setItem(i,JSON.stringify(h)),console.log("[ZupLogbook] sessionStorage atualizado com novo access_token para "+i)}}}catch{}const c=k.updateSession({token:n,...s?{refreshToken:s}:{},user:p||k.getSession().user,lastLogin:new Date().toISOString(),expiresAt:r,isExpired:!1});return this.notify(c),c}setManualToken(e,n){const s=e.replace(/^Bearer\s+/i,"").trim(),o=M(s),p=o?H(o):null;let t=o?.exp?o.exp*1e3:0;t<=Date.now()&&(t=Date.now()+3e5);const r=new Date(t).toISOString(),c=k.updateSession({token:s,...n?{refreshToken:n.trim()}:{},user:p,lastLogin:new Date().toISOString(),expiresAt:r,isExpired:!1});return this.notify(c),c}async refreshAccessToken(){if(this.isRefreshing){for(let s=0;s<20;s++)if(await new Promise(o=>setTimeout(o,200)),!this.isRefreshing){const o=k.getSession();return!!o.token&&!o.isExpired}return!1}const n=k.getSession().refreshToken;if(!n)return!!await this.triggerSilentSsoCheck();this.isRefreshing=!0,console.log("[ZupLogbook] Executando renovação via Keycloak OpenID Connect...");try{const s="https://keycloak-zenity.zup.com.br/auth/realms/zupinternal/protocol/openid-connect/token",o=new URLSearchParams({grant_type:"refresh_token",refresh_token:n.trim(),client_id:"realwave_zupper_csp_ui"});let p=await fetch(s,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded",Accept:"*/*"},credentials:"include",body:o.toString()}),t={};try{t=await p.json()}catch{}return p.ok&&t.access_token?(console.log("[ZupLogbook] Token JWT renovado com sucesso pelo Keycloak no Bookmarklet!"),this.handleKeycloakTokenResponse(t),!0):(console.warn("[ZupLogbook] Falha na renovação via Keycloak token endpoint:",t),await this.triggerSilentSsoCheck())}catch(s){return console.error("[ZupLogbook] Erro ao chamar token endpoint:",s.message),!1}finally{this.isRefreshing=!1}}logout(){k.clearSession(),this.notify(k.getSession())}onAuthStatusChanged(e){return this.listeners.push(e),()=>{this.listeners=this.listeners.filter(n=>n!==e)}}notify(e){this.listeners.forEach(n=>{try{n(e)}catch(s){console.error("Erro no callback de auth status:",s)}})}}const A=new G,J="zup-logbook-host",V=[{id:1,name:"Colaboramos de verdade"},{id:2,name:"Nosso compromisso é coletivo"},{id:3,name:"Vamos direto ao ponto"},{id:4,name:"Focamos no cliente"},{id:5,name:"Entregamos valor de ponta a ponta"},{id:6,name:"Decidimos com contexto"},{id:7,name:"Protagonizamos o futuro"},{id:8,name:"Tomamos a iniciativa"},{id:9,name:"Entrega soluções técnicas"},{id:10,name:"Aplicabilidade de novos conhecimentos técnicos"},{id:11,name:"Linguagem de Programação [Java, Go, Kotlin, C#, Python, Swift, etc ]"},{id:12,name:"Algoritmos e Estrutura de Dados"},{id:13,name:"Fluxo de trabalho/Workflow"},{id:14,name:"Pipeline CI/CD"},{id:15,name:"APIs"},{id:16,name:"Segurança"},{id:17,name:"Arquitetura de soluções"},{id:18,name:"Redes (VPC, CDN, DNS, etc)"},{id:19,name:"Infra / IaC (Terraform, CloudFormation, etc)"},{id:23,name:"StackSpot AI"},{id:25,name:"Computing services (EC2, ECS, EKS, Fargate, Lambda, etc)"},{id:26,name:"Observabilidade e Monitoramento"},{id:27,name:"SQL / noSQL"},{id:28,name:"Cache"},{id:29,name:"Inteligencia Artificial"},{id:40,name:"Arquitetura de Solução"},{id:41,name:"Qualidade"},{id:50,name:"Testes Automatizados"},{id:52,name:"Log, Debug, Performance"},{id:53,name:"Versionamento"},{id:54,name:"Code Review"},{id:59,name:"Arquitetura"},{id:62,name:"CI/CD"},{id:72,name:"Bancos de dados"},{id:80,name:"Codificação"},{id:83,name:"Arquitetura de Sistemas"},{id:86,name:"DevOps e Observabilidade"},{id:97,name:"Boas Práticas de programação e automação"},{id:106,name:"Linux"}];function U(l){return l.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]/g,"")}function j(l){const e=U(l);return e?V.find(s=>{const o=U(s.name);return o===e||o.includes(e)||e.includes(o)})||{id:0,name:l.trim()}:null}function Q(l){let e=l.trim().replace(/^```[a-z0-9_-]*\s*/i,"").replace(/\s*```$/,"").replace(/\[cite:[^\]]*\]/gi,"").replace(/\[\d+(?:,\s*\d+)*\]/g,"").trim();if(/^##+\s+/m.test(e)){let m="";const y=e.match(/^#\s*(?:t[ií]tulo:\s*)?(.+)$/mi)||e.match(/^t[ií]tulo:\s*(.+)$/mi);y?m=y[1].replace(/^t[ií]tulo:\s*/i,"").trim():m=e.split(/\r?\n/)[0]?.replace(/^[#\s*_-]+/,"").replace(/^t[ií]tulo:\s*/i,"").trim()||"";const f=/^##+\s+(.+)$/gm;let x;const w=[];for(;(x=f.exec(e))!==null;)w.push({header:x[1].trim(),index:x.index,end:x.index+x[0].length});const P=[],_=[],T=[];for(let E=0;E<w.length;E++){const N=w[E],u=E+1<w.length?w[E+1].index:e.length,d=e.slice(N.end,u).trim();if(/compet[eê]ncias/i.test(N.header)){const D=d.split(/\r?\n/).map(b=>b.replace(/^[-*•\d.)\s]+/,"").trim()).filter(Boolean);for(const b of D){const z=j(b);z&&P.push(z)}continue}let S=N.header;S.endsWith(":")||(S+=":"),_.push({type:"paragraph",children:[{text:S,bold:!0}]}),d?(_.push({type:"paragraph",children:[{text:d}]}),T.push(`${S}
${d}`)):T.push(S),_.push({type:"paragraph",children:[{text:"",bold:!0}]})}return _.length>0&&_[_.length-1].children?.[0]?.text===""&&_.pop(),{title:m,formattedContent:_,content:T.join(`

`),isPerformanceReview:!0,metadata:{templateFor:/lideran[cç]a/i.test(e)&&!/n[aã]o\s*lideran[cç]a/i.test(e)?"LEADERSHIP":"NON_LEADERSHIP"},competences:P}}let s=e;const o=s.match(/compet[eê]ncias:\s*([\s\S]*)$/i);let p="";o&&(p=o[1].trim(),s=s.slice(0,o.index).trim());let t="";const r=s.search(/descri[cç][aã]o:/i);r!==-1?(t=s.slice(0,r).replace(/t[ií]tulo:\s*/i,"").trim(),s=s.slice(r).replace(/descri[cç][aã]o:\s*/i,"").trim()):t=s.split(/\r?\n/)[0]?.replace(/t[ií]tulo:\s*/i,"").trim()||"",t=t.split(/\r?\n/)[0]?.replace(/^t[ií]tulo:\s*/i,"").trim()||"";const c=/(Resultado\/impacto(?:\s*\(momento atual\))?:?|Atitude e comportamento:?|Conhecimento T[eé]cnico da Pr[aá]tica:?|Aprendizado Tech:?|Expectativas de Entregas:?|Coment[aá]rios Adicionais(?: e Feedback Recebido)?:?)/gi,a=[];let i;for(;(i=c.exec(s))!==null;)a.push({index:i.index,header:i[0],end:i.index+i[0].length});const h=[],v=[];for(let m=0;m<a.length;m++){const y=a[m],f=m+1<a.length?a[m+1].index:s.length;let x=s.slice(y.end,f).trim().replace(/^-+\s*|\s*-+$/g,"").trim(),w=y.header.trim();w.endsWith(":")||(w+=":"),h.push({type:"paragraph",children:[{text:w,bold:!0}]}),x?(h.push({type:"paragraph",children:[{text:x}]}),v.push(`${w}
${x}`)):v.push(w),m<a.length-1&&h.push({type:"paragraph",children:[{text:"",bold:!0}]})}if(h.length===0){const m=s.split(/\r?\n/).filter(Boolean),y=s.trim();return{title:t||"Registro",formattedContent:(m.length>0?m:[s]).map(f=>({type:"paragraph",children:[{text:f}]})),content:y||t,isPerformanceReview:!1}}const g=[];if(p){const m=p.split(/[\r\n,]+/).map(y=>y.replace(/^[-*•\d.)\s]+/,"").trim()).filter(Boolean);for(const y of m){const f=j(y);f&&g.push(f)}}return{title:t,formattedContent:h,content:v.join(`

`),isPerformanceReview:!0,metadata:{templateFor:/lideran[cç]a/i.test(e)&&!/n[aã]o\s*lideran[cç]a/i.test(e)?"LEADERSHIP":"NON_LEADERSHIP"},competences:g}}function F(){const l=document.getElementById(J);if(l){l.style.display==="none"?(l.style.display="block",l.dispatchEvent(new CustomEvent("zup-open"))):l.style.display="none";return}const e=document.createElement("div");e.id=J,e.style.position="fixed",e.style.top="50%",e.style.left="50%",e.style.transform="translate(-50%, -50%)",e.style.width="380px",e.style.height="380px",e.style.maxWidth="90vw",e.style.maxHeight="90vh",e.style.zIndex="2147483647",e.style.display="block",e.style.boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 0 100vmax rgba(0, 0, 0, 0.45)",e.style.borderRadius="12px",e.style.fontFamily='-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';const n=e.attachShadow({mode:"open"}),s=document.createElement("style");s.textContent=`
    * { box-sizing: border-box; margin: 0; padding: 0; }
    :host {
      all: initial;
      display: block;
    }
    .modal {
      width: 100%;
      height: 100%;
      background: #181920;
      border: 1px solid #2d3142;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      padding: 14px 16px;
      gap: 8px;
      color: #e2e8f0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      user-select: none;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .title {
      font-size: 14px;
      font-weight: 600;
      color: #fff;
    }
    .close-btn {
      background: none;
      border: none;
      color: #8892b0;
      font-size: 16px;
      cursor: pointer;
      line-height: 1;
      padding: 4px;
      border-radius: 4px;
    }
    .close-btn:hover {
      color: #fff;
      background: #252836;
    }
    .session-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #94a3b8;
      padding: 0 2px;
    }
    .session-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      max-width: 230px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .session-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .session-refresh-btn {
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 11px;
      padding: 2px;
      line-height: 1;
      transition: transform 0.2s, color 0.2s;
    }
    .session-refresh-btn:hover {
      color: #fff;
      transform: rotate(90deg);
    }
    .session-toggle-btn {
      background: none;
      border: none;
      color: #818cf8;
      cursor: pointer;
      font-size: 11px;
      text-decoration: underline;
      padding: 0;
    }
    .session-toggle-btn:hover {
      color: #a5b4fc;
    }
    .manual-box {
      display: none;
      gap: 6px;
      align-items: center;
      padding: 6px 8px;
      background: #0f1015;
      border: 1px solid #2d3142;
      border-radius: 8px;
    }
    .manual-input {
      flex: 1;
      background: transparent;
      border: none;
      color: #f1f5f9;
      font-size: 11px;
      outline: none;
      font-family: monospace;
    }
    .manual-apply-btn {
      background: #6366f1;
      color: #fff;
      border: none;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
    }
    .manual-apply-btn:hover {
      background: #4f46e5;
    }
    .manual-refresh-btn {
      background: #252836;
      color: #e2e8f0;
      border: 1px solid #3b4261;
      padding: 4px 6px;
      border-radius: 4px;
      font-size: 11px;
      cursor: pointer;
      line-height: 1;
    }
    .manual-refresh-btn:hover {
      background: #32374a;
      color: #fff;
    }
    .manual-clear-btn {
      background: #252836;
      color: #94a3b8;
      border: none;
      padding: 4px 6px;
      border-radius: 4px;
      font-size: 11px;
      cursor: pointer;
      line-height: 1;
    }
    textarea {
      flex: 1;
      width: 100%;
      background: #0f1015;
      border: 1px solid #2d3142;
      border-radius: 8px;
      color: #f1f5f9;
      padding: 10px;
      font-size: 12px;
      font-family: monospace;
      resize: none;
      outline: none;
      user-select: text;
    }
    textarea:focus {
      border-color: #6366f1;
    }
    .status {
      display: none;
      font-size: 11px;
      padding: 6px 8px;
      border-radius: 6px;
      word-break: break-word;
      line-height: 1.3;
    }
    .status.success {
      display: block;
      color: #4ade80;
      background: rgba(34, 197, 94, 0.12);
      border: 1px solid rgba(34, 197, 94, 0.25);
    }
    .status.error {
      display: block;
      color: #f87171;
      background: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.25);
    }
    .submit-btn {
      width: 100%;
      height: 38px;
      background: #6366f1;
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s, opacity 0.15s;
    }
    .submit-btn:hover:not(:disabled) {
      background: #4f46e5;
    }
    .submit-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `,n.appendChild(s);const o=document.createElement("div");o.className="modal",o.innerHTML=`
    <div class="header">
      <span class="title">Zup Logbook</span>
      <button class="close-btn" type="button" title="Fechar">✕</button>
    </div>
    <div class="session-bar">
      <span class="session-badge">● Detectando sessão...</span>
      <div class="session-actions">
        <button class="session-refresh-btn" type="button" title="Atualizar sessão e testar token">🔄</button>
        <button class="session-toggle-btn" type="button">Chave manual</button>
      </div>
    </div>
    <div class="manual-box">
      <input type="password" class="manual-input" placeholder="Cole o Bearer token aqui..." />
      <button class="manual-apply-btn" type="button">Salvar</button>
      <button class="manual-refresh-btn" type="button" title="Recarregar e validar token">🔄</button>
      <button class="manual-clear-btn" type="button" title="Limpar token manual">✕</button>
    </div>
    <textarea placeholder="Cole o Markdown ou texto do relato aqui..." autofocus></textarea>
    <div class="status"></div>
    <button class="submit-btn" type="button" disabled>Enviar</button>
  `,n.appendChild(o);const p=o.querySelector(".close-btn"),t=o.querySelector(".session-badge"),r=o.querySelector(".session-refresh-btn"),c=o.querySelector(".session-toggle-btn"),a=o.querySelector(".manual-box"),i=o.querySelector(".manual-input"),h=o.querySelector(".manual-apply-btn"),v=o.querySelector(".manual-refresh-btn"),g=o.querySelector(".manual-clear-btn"),m=o.querySelector("textarea"),y=o.querySelector(".status"),f=o.querySelector(".submit-btn"),x=async(u=!1)=>{let d=k.getSession();if((u||!d.token)&&(d=A.detectSessionFromPage(u)),d.token&&!d.isExpired){const S=d.expiresAt?Math.max(0,Math.round((new Date(d.expiresAt).getTime()-Date.now())/6e4)):5,D=d.user?.name||d.user?.email?.split("@")[0]||"Sessão ativa";t.textContent=`🟢 ${D} (${S}m)`,t.style.color="#4ade80",t.title=d.expiresAt?`Expira às ${new Date(d.expiresAt).toLocaleTimeString()}`:"Sessão ativa"}else d.token&&d.isExpired?(t.textContent="🔴 Sessão expirada (clique 🔄)",t.style.color="#f87171",t.title=d.expiresAt?`Expirou às ${new Date(d.expiresAt).toLocaleTimeString()}`:"Expirado"):(t.textContent="⚪ Token não detectado",t.style.color="#94a3b8",t.title="Nenhum token encontrado na página.")};A.onAuthStatusChanged(()=>{x()});const w=async()=>{t.textContent="🔄 Atualizando...",t.style.color="#818cf8",await A.refreshAccessToken()||A.detectSessionFromPage(!0),await x();const d=k.getSession();d.token&&!d.isExpired?T("success","Sessão atualizada!"):T("error","Não foi possível renovar automaticamente. Atualize a página (F5) ou use a chave manual."),setTimeout(E,3e3)};r.onclick=u=>{u.stopPropagation(),w()},v.onclick=u=>{u.stopPropagation(),w()},c.onclick=()=>{const u=a.style.display==="none"||!a.style.display;if(a.style.display=u?"flex":"none",u){const d=k.getSession();i.value=d.token||"",i.focus()}},h.onclick=async()=>{const u=i.value.trim().replace(/^bearer\s+/i,"");u&&(A.setManualToken(u),a.style.display="none",await x(),T("success","Chave manual salva e validada com sucesso!"),setTimeout(E,3e3))},g.onclick=async()=>{A.logout(),i.value="",a.style.display="none",await x(),T("success","Chave manual removida."),setTimeout(E,3e3)};const P=()=>{e.style.display="none"},_=u=>{if(e.style.display==="none")return;u.composedPath().includes(e)||P()};p.onclick=u=>{u.stopPropagation(),P()};const T=(u,d)=>{y.className=`status ${u}`,y.textContent=d},E=()=>{y.className="status",y.textContent=""};m.oninput=()=>{f.disabled=!m.value.trim(),E()},e.addEventListener("zup-open",()=>{x(),setTimeout(()=>{m.focus()},50)});const N=async()=>{const u=m.value.trim();if(!u){T("error","Cole o relato antes de enviar.");return}let d=null;try{d=JSON.parse(u)}catch{d=Q(u)}if(!d||!d.title&&!d.content){T("error","Não foi possível identificar o título ou conteúdo do relato.");return}f.disabled=!0,f.textContent="Autenticando...",E();let S=k.getSession();if((!S.token||S.isExpired)&&(S=A.detectSessionFromPage(!0)),S.isExpired&&S.refreshToken&&(f.textContent="Renovando sessão...",await A.refreshAccessToken(),S=k.getSession()),!S.token){T("error",'Token de autenticação não encontrado. Atualize a página do People (F5) ou use a "Chave manual" acima.'),f.textContent="Enviar",f.disabled=!m.value.trim();return}f.textContent="Enviando...";const D=async b=>{const z=await fetch("https://apiznt.zenity.zup.com.br/dune/v1/entry",{method:"POST",headers:{"Content-Type":"application/json",Accept:"*/*",authorization:`Bearer ${b}`},credentials:"omit",body:JSON.stringify(d)}),O=await z.text();let B={};try{B=JSON.parse(O)}catch{B={text:O}}return{ok:z.ok,status:z.status,data:B,text:O}};try{let b=await D(S.token);if(!b.ok&&(b.status===401||b.status===403||b.text.includes("not authorized")||b.text.includes("deny")||b.text.toLowerCase().includes("expired"))&&(f.textContent="Renovando sessão...",await A.refreshAccessToken())){const O=k.getSession();O.token&&(f.textContent="Reenviando...",b=await D(O.token))}if(b.ok)T("success",`Relato${b.data?.id?` #${b.data.id}`:""} enviado com sucesso!`),m.value="",f.disabled=!0,x();else{const z=b.data?.message||b.data?.Message||b.data?.error||b.text||`Status HTTP ${b.status}`;T("error",`Falha (${b.status}): ${z}`)}}catch(b){T("error",`Erro de conexão: ${b.message}`)}finally{f.textContent="Enviar",f.disabled=!m.value.trim()}};f.onclick=u=>{u.stopPropagation(),N()},m.onkeydown=u=>{(u.ctrlKey||u.metaKey)&&u.key==="Enter"&&(u.preventDefault(),N()),u.key==="Escape"&&P()},document.body.appendChild(e),x(),setTimeout(()=>{m.focus(),window.addEventListener("pointerdown",_,!0)},100)}window.ZupLogbook={mountZupLogbook:F},F(),I.mountZupLogbook=F,Object.defineProperty(I,Symbol.toStringTag,{value:"Module"})})(this.ZupLogbook=this.ZupLogbook||{});
