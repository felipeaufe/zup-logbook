var X=Object.defineProperty;var Y=(I,C,R)=>C in I?X(I,C,{enumerable:!0,configurable:!0,writable:!0,value:R}):I[C]=R;var q=(I,C,R)=>Y(I,typeof C!="symbol"?C+"":C,R);(function(I){"use strict";const C=`Você é o assistente inteligente de Diário de Bordo da Zup.
Sua missão é transformar os relatos informais do Zupper em registros claros, objetivos, profissionais e organizados de Diário de Bordo para a plataforma People.
Regras:
1. Crie um Título impactante e profissional para o diário.
2. Estruture o conteúdo utilizando os templates e seções oficiais da Zup.
3. Selecione as competências técnicas e comportamentais mais relevantes para o relato EXCLUSIVAMENTE a partir do catálogo oficial fornecido.
4. O template padrão é NON_LEADERSHIP (ou LEADERSHIP se for liderança).`,R=`Resultado/impacto (momento atual):
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
Registre comentários adicionais, como feedbacks recebidos de clientes ou pares.`,L={SETTINGS:"zup_logbook_settings",SESSION:"zup_logbook_session",COMPETENCES:"zup_logbook_competences"},H={aiProvider:"stackspot",stackspotClientId:"",stackspotClientSecret:"",stackspotRealm:"zup",stackspotSlug:"",stackspotToken:"",aiApiKey:"",aiModel:"gemini-2.5-flash",peopleBaseUrl:"https://people.zup.com.br",logbookEndpoint:"https://apiznt.zenity.zup.com.br/dune/v1/entry",customInstructions:C,leadershipTemplate:R,nonLeadershipTemplate:$,saveSession:!0};class K{constructor(){q(this,"settings",H);q(this,"session",{token:null,refreshToken:null,cookies:{},user:null,lastLogin:null,expiresAt:null,refreshExpiresAt:null});q(this,"cachedCompetences",[]);this.load()}load(){try{const e=localStorage.getItem(L.SETTINGS);e&&(this.settings={...H,...JSON.parse(e)}),this.settings.leadershipTemplate||(this.settings.leadershipTemplate=R),this.settings.nonLeadershipTemplate||(this.settings.nonLeadershipTemplate=$),this.settings.customInstructions||(this.settings.customInstructions=C);const a=localStorage.getItem(L.SESSION);a&&this.settings.saveSession&&(this.session={...this.session,...JSON.parse(a)});const s=localStorage.getItem(L.COMPETENCES);s&&(this.cachedCompetences=JSON.parse(s))}catch(e){console.warn("Erro ao carregar dados do localStorage:",e)}}save(){try{localStorage.setItem(L.SETTINGS,JSON.stringify(this.settings)),this.settings.saveSession?localStorage.setItem(L.SESSION,JSON.stringify(this.session)):localStorage.removeItem(L.SESSION),localStorage.setItem(L.COMPETENCES,JSON.stringify(this.cachedCompetences))}catch(e){console.warn("Erro ao salvar dados no localStorage:",e)}}getSettings(){return this.settings}updateSettings(e){return this.settings={...this.settings,...e},this.save(),this.settings}getSession(){if(this.session.expiresAt){const e=new Date(this.session.expiresAt).getTime();this.session.isExpired=Date.now()>e}return this.session}updateSession(e){if(this.session={...this.session,...e},this.session.expiresAt){const a=new Date(this.session.expiresAt).getTime();this.session.isExpired=Date.now()>a}return this.save(),this.session}clearSession(){this.session={token:null,refreshToken:null,cookies:{},user:null,lastLogin:null,expiresAt:null,refreshExpiresAt:null,isExpired:!1},this.save()}getCachedCompetences(){return this.cachedCompetences}setCachedCompetences(e){this.cachedCompetences=e,this.save()}}const S=new K;function B(c){try{const e=c.split(".");if(e.length===3){const s=e[1].replace(/-/g,"+").replace(/_/g,"/"),o=decodeURIComponent(atob(s).split("").map(r=>"%"+("00"+r.charCodeAt(0).toString(16)).slice(-2)).join(""));return JSON.parse(o)}}catch(e){console.warn("Erro ao decodificar JWT:",e)}return null}function U(c){if(!c)return{};const e=(c.email||c.upn||c.unique_name||"").trim(),a=(c.preferred_username||(e?e.split("@")[0]:"")||c.sub||"").trim();let s="";if(c.name&&typeof c.name=="string"?s=c.name.trim():c.given_name&&(s=c.family_name?`${c.given_name} ${c.family_name}`.trim():c.given_name.trim()),s){const o=s.split(/\s+/);o.length===2&&o[0].toLowerCase()===o[1].toLowerCase()&&(s=o[0])}return{name:s||void 0,username:a||void 0,email:e||void 0}}function W(c){return!c||typeof c!="string"?[]:c.match(/eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+/g)||[]}class G{constructor(){q(this,"listeners",[]);q(this,"isRefreshing",!1);this.setupNetworkInterceptors(),this.detectSessionFromPage()}setupNetworkInterceptors(){try{if(window.__zup_interceptors_installed)return;window.__zup_interceptors_installed=!0;const e=this,a=window.fetch;window.fetch=async function(...o){try{const r=o[0],t=o[1];let i=null;if(t&&t.headers)if(t.headers instanceof Headers)i=t.headers.get("Authorization")||t.headers.get("authorization");else if(Array.isArray(t.headers)){const n=t.headers.find(([h])=>h.toLowerCase()==="authorization");n&&(i=n[1])}else typeof t.headers=="object"&&(i=t.headers.Authorization||t.headers.authorization||t.headers.AUTHORIZATION);if(i&&i.toLowerCase().startsWith("bearer ")){const n=i.replace(/^bearer\s+/i,"").trim();n&&n.length>20&&e.handleDiscoveredToken(n)}if((typeof r=="string"?r:r?.url||"").includes("protocol/openid-connect/token")&&t?.body){const n=typeof t.body=="string"?t.body:"",b=new URLSearchParams(n).get("refresh_token");b&&S.updateSession({refreshToken:b})}}catch{}return a.apply(this,o)};const s=XMLHttpRequest.prototype.setRequestHeader;XMLHttpRequest.prototype.setRequestHeader=function(o,r){try{if(o&&o.toLowerCase()==="authorization"&&r&&r.toLowerCase().startsWith("bearer ")){const t=r.replace(/^bearer\s+/i,"").trim();t&&t.length>20&&e.handleDiscoveredToken(t)}}catch{}return s.apply(this,[o,r])}}catch(e){console.warn("Erro ao configurar interceptadores de rede no Bookmarklet:",e)}}handleDiscoveredToken(e,a){const s=S.getSession();s.token===e&&!s.isExpired||(console.log("Novo token interceptado na página do People Zup!"),this.setManualToken(e,a))}detectSessionFromPage(e=!1){const a=S.getSession();if(!e&&a.token&&!a.isExpired)return a;try{for(const t of[sessionStorage,localStorage])try{for(let i=0;i<t.length;i++){const m=t.key(i);if(m&&m.startsWith("oidc.user:")){const n=JSON.parse(t.getItem(m)||"{}");if(n.access_token){const h=B(n.access_token);if((h?.exp?h.exp*1e3:n.expires_at?n.expires_at*1e3:1/0)>Date.now()+1e4)return console.log("[ZupLogbook] Sessão OIDC ativa encontrada diretamente em "+m),this.setManualToken(n.access_token,n.refresh_token)}}}}catch{}const s=[],o=t=>{const i=W(t);for(const m of i){const n=B(m);n&&s.push({token:m,payload:n,exp:n.exp?n.exp*1e3:1/0,typ:(n.typ||n.type||"").toLowerCase()})}};for(let t=0;t<sessionStorage.length;t++){const i=sessionStorage.key(t);if(i){const m=sessionStorage.getItem(i);m&&o(m)}}for(let t=0;t<localStorage.length;t++){const i=localStorage.key(t);if(i&&!i.startsWith("zup_logbook")){const m=localStorage.getItem(i);m&&o(m)}}o(document.cookie);const r=window;r.keycloak?.token&&o(r.keycloak.token),r.keycloak?.refreshToken&&o(r.keycloak.refreshToken);for(const t of["keycloak","_keycloak","kc","auth","currentUser","__PRELOADED_STATE__"])try{r[t]&&o(typeof r[t]=="string"?r[t]:JSON.stringify(r[t]))}catch{}if(s.length>0){const t=Date.now(),i=s.filter(p=>p.exp>t+1e4),m=s.find(p=>p.typ==="refresh"||(p.payload?.type||"").toLowerCase()==="refresh"),n=p=>p.typ==="id"||(p.payload?.type||"").toLowerCase()==="id",h=i.filter(p=>p!==m&&!n(p));h.sort((p,E)=>{const u=p.typ==="bearer"?2:p.payload?.resource_access||p.payload?.realm_access?1:0,y=E.typ==="bearer"?2:E.payload?.resource_access||E.payload?.realm_access?1:0;return u!==y?y-u:E.exp-p.exp});const b=h[0]||i.find(p=>p.typ==="bearer")||i[0]||s[0];if(b)return console.log("[ZupLogbook] Sessão encontrada com sucesso na varredura profunda!"),this.setManualToken(b.token,m?.token)}}catch(s){console.warn("Erro ao auto-detectar sessão do portal:",s)}return S.getSession()}async triggerSilentSsoCheck(){return console.log("Disparando verificação silenciosa de SSO com Keycloak..."),new Promise(e=>{const a=document.createElement("iframe");a.style.display="none",a.id="zup-logbook-sso-iframe";const s=encodeURIComponent(window.location.origin+window.location.pathname),o=Math.random().toString(36).substring(2),r=Math.random().toString(36).substring(2),t=`https://keycloak-zenity.zup.com.br/auth/realms/zupinternal/protocol/openid-connect/auth?client_id=realwave_zupper_csp_ui&redirect_uri=${s}&response_mode=fragment&response_type=code%20id_token%20token&scope=openid&prompt=none&state=${o}&nonce=${r}`;let i=null;const m=()=>{i&&clearTimeout(i);try{a.parentNode&&a.parentNode.removeChild(a)}catch{}};i=setTimeout(()=>{m();const n=this.detectSessionFromPage(!0);e(!!n.token)},4e3),a.onload=()=>{try{const n=a.contentWindow?.location.href||"";if(n.includes("access_token=")||n.includes("code=")){const h=n.split("#")[1]||n.split("?")[1]||"",b=new URLSearchParams(h),p=b.get("access_token"),E=b.get("refresh_token");if(p){console.log("Token obtido com sucesso via Silent SSO do Keycloak!"),this.setManualToken(p,E||void 0),m(),e(!0);return}}}catch{}},a.src=t,document.body.appendChild(a)})}setManualToken(e,a){const s=e.replace(/^Bearer\s+/i,"").trim(),o=B(s),r=o?U(o):null;let t=null;o?.exp&&(t=new Date(o.exp*1e3).toISOString());const i=S.updateSession({token:s,...a?{refreshToken:a.trim()}:{},user:r,lastLogin:new Date().toISOString(),expiresAt:t,isExpired:!1});return this.notify(i),i}async refreshAccessToken(){if(this.isRefreshing){for(let s=0;s<20;s++)if(await new Promise(o=>setTimeout(o,200)),!this.isRefreshing){const o=S.getSession();return!!o.token&&!o.isExpired}return!1}const e=S.getSession(),a=e.refreshToken;if(!a)return!!await this.triggerSilentSsoCheck();this.isRefreshing=!0,console.log("Bookmarklet: executando renovação via Keycloak OpenID Connect...");try{const s="https://keycloak-zenity.zup.com.br/auth/realms/zupinternal/protocol/openid-connect/token",o=new URLSearchParams({grant_type:"refresh_token",refresh_token:a});let r=await fetch(s,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded",Accept:"*/*"},credentials:"include",body:o.toString()}),t={};try{t=await r.json()}catch{}if(!r.ok&&(t.error==="invalid_client"||t.error_description?.includes("client"))){o.set("client_id","realwave_zupper_csp_ui"),r=await fetch(s,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded",Accept:"*/*"},credentials:"include",body:o.toString()});try{t=await r.json()}catch{}}if(r.ok&&t.access_token){console.log("Token JWT renovado com sucesso pelo Keycloak no Bookmarklet!");const i=t.access_token,m=t.refresh_token||a;let n=null,h=null;t.expires_in&&(n=new Date(Date.now()+t.expires_in*1e3).toISOString()),t.refresh_expires_in&&(h=new Date(Date.now()+t.refresh_expires_in*1e3).toISOString());const b=B(i),p=b?U(b):e.user,E=S.updateSession({token:i,refreshToken:m,user:p,lastLogin:new Date().toISOString(),expiresAt:n,refreshExpiresAt:h,isExpired:!1});return this.notify(E),!0}else return console.warn("Falha na renovação via Keycloak no Bookmarklet:",t),!1}catch(s){return console.error("Erro ao chamar token endpoint no Bookmarklet:",s.message),!1}finally{this.isRefreshing=!1}}logout(){S.clearSession(),this.notify(S.getSession())}onAuthStatusChanged(e){return this.listeners.push(e),()=>{this.listeners=this.listeners.filter(a=>a!==e)}}notify(e){this.listeners.forEach(a=>{try{a(e)}catch(s){console.error("Erro no callback de auth status:",s)}})}}const A=new G,J="zup-logbook-host",V=[{id:1,name:"Colaboramos de verdade"},{id:2,name:"Nosso compromisso é coletivo"},{id:3,name:"Vamos direto ao ponto"},{id:4,name:"Focamos no cliente"},{id:5,name:"Entregamos valor de ponta a ponta"},{id:6,name:"Decidimos com contexto"},{id:7,name:"Protagonizamos o futuro"},{id:8,name:"Tomamos a iniciativa"},{id:9,name:"Entrega soluções técnicas"},{id:10,name:"Aplicabilidade de novos conhecimentos técnicos"},{id:11,name:"Linguagem de Programação [Java, Go, Kotlin, C#, Python, Swift, etc ]"},{id:12,name:"Algoritmos e Estrutura de Dados"},{id:13,name:"Fluxo de trabalho/Workflow"},{id:14,name:"Pipeline CI/CD"},{id:15,name:"APIs"},{id:16,name:"Segurança"},{id:17,name:"Arquitetura de soluções"},{id:18,name:"Redes (VPC, CDN, DNS, etc)"},{id:19,name:"Infra / IaC (Terraform, CloudFormation, etc)"},{id:23,name:"StackSpot AI"},{id:25,name:"Computing services (EC2, ECS, EKS, Fargate, Lambda, etc)"},{id:26,name:"Observabilidade e Monitoramento"},{id:27,name:"SQL / noSQL"},{id:28,name:"Cache"},{id:29,name:"Inteligencia Artificial"},{id:40,name:"Arquitetura de Solução"},{id:41,name:"Qualidade"},{id:50,name:"Testes Automatizados"},{id:52,name:"Log, Debug, Performance"},{id:53,name:"Versionamento"},{id:54,name:"Code Review"},{id:59,name:"Arquitetura"},{id:62,name:"CI/CD"},{id:72,name:"Bancos de dados"},{id:80,name:"Codificação"},{id:83,name:"Arquitetura de Sistemas"},{id:86,name:"DevOps e Observabilidade"},{id:97,name:"Boas Práticas de programação e automação"},{id:106,name:"Linux"}];function Z(c){return c.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]/g,"")}function j(c){const e=Z(c);return e?V.find(s=>{const o=Z(s.name);return o===e||o.includes(e)||e.includes(o)})||{id:0,name:c.trim()}:null}function Q(c){let e=c.trim().replace(/^```[a-z0-9_-]*\s*/i,"").replace(/\s*```$/,"").replace(/\[cite:[^\]]*\]/gi,"").replace(/\[\d+(?:,\s*\d+)*\]/g,"").trim();if(/^##+\s+/m.test(e)){let u="";const y=e.match(/^#\s*(?:t[ií]tulo:\s*)?(.+)$/mi)||e.match(/^t[ií]tulo:\s*(.+)$/mi);y?u=y[1].replace(/^t[ií]tulo:\s*/i,"").trim():u=e.split(/\r?\n/)[0]?.replace(/^[#\s*_-]+/,"").replace(/^t[ií]tulo:\s*/i,"").trim()||"";const g=/^##+\s+(.+)$/gm;let x;const v=[];for(;(x=g.exec(e))!==null;)v.push({header:x[1].trim(),index:x.index,end:x.index+x[0].length});const D=[],_=[],w=[];for(let T=0;T<v.length;T++){const N=v[T],d=T+1<v.length?v[T+1].index:e.length,l=e.slice(N.end,d).trim();if(/compet[eê]ncias/i.test(N.header)){const O=l.split(/\r?\n/).map(f=>f.replace(/^[-*•\d.)\s]+/,"").trim()).filter(Boolean);for(const f of O){const z=j(f);z&&D.push(z)}continue}let k=N.header;k.endsWith(":")||(k+=":"),_.push({type:"paragraph",children:[{text:k,bold:!0}]}),l?(_.push({type:"paragraph",children:[{text:l}]}),w.push(`${k}
${l}`)):w.push(k),_.push({type:"paragraph",children:[{text:"",bold:!0}]})}return _.length>0&&_[_.length-1].children?.[0]?.text===""&&_.pop(),{title:u,formattedContent:_,content:w.join(`

`),isPerformanceReview:!0,metadata:{templateFor:/lideran[cç]a/i.test(e)&&!/n[aã]o\s*lideran[cç]a/i.test(e)?"LEADERSHIP":"NON_LEADERSHIP"},competences:D}}let s=e;const o=s.match(/compet[eê]ncias:\s*([\s\S]*)$/i);let r="";o&&(r=o[1].trim(),s=s.slice(0,o.index).trim());let t="";const i=s.search(/descri[cç][aã]o:/i);i!==-1?(t=s.slice(0,i).replace(/t[ií]tulo:\s*/i,"").trim(),s=s.slice(i).replace(/descri[cç][aã]o:\s*/i,"").trim()):t=s.split(/\r?\n/)[0]?.replace(/t[ií]tulo:\s*/i,"").trim()||"",t=t.split(/\r?\n/)[0]?.replace(/^t[ií]tulo:\s*/i,"").trim()||"";const m=/(Resultado\/impacto(?:\s*\(momento atual\))?:?|Atitude e comportamento:?|Conhecimento T[eé]cnico da Pr[aá]tica:?|Aprendizado Tech:?|Expectativas de Entregas:?|Coment[aá]rios Adicionais(?: e Feedback Recebido)?:?)/gi,n=[];let h;for(;(h=m.exec(s))!==null;)n.push({index:h.index,header:h[0],end:h.index+h[0].length});const b=[],p=[];for(let u=0;u<n.length;u++){const y=n[u],g=u+1<n.length?n[u+1].index:s.length;let x=s.slice(y.end,g).trim().replace(/^-+\s*|\s*-+$/g,"").trim(),v=y.header.trim();v.endsWith(":")||(v+=":"),b.push({type:"paragraph",children:[{text:v,bold:!0}]}),x?(b.push({type:"paragraph",children:[{text:x}]}),p.push(`${v}
${x}`)):p.push(v),u<n.length-1&&b.push({type:"paragraph",children:[{text:"",bold:!0}]})}if(b.length===0){const u=s.split(/\r?\n/).filter(Boolean),y=s.trim();return{title:t||"Registro",formattedContent:(u.length>0?u:[s]).map(g=>({type:"paragraph",children:[{text:g}]})),content:y||t,isPerformanceReview:!1}}const E=[];if(r){const u=r.split(/[\r\n,]+/).map(y=>y.replace(/^[-*•\d.)\s]+/,"").trim()).filter(Boolean);for(const y of u){const g=j(y);g&&E.push(g)}}return{title:t,formattedContent:b,content:p.join(`

`),isPerformanceReview:!0,metadata:{templateFor:/lideran[cç]a/i.test(e)&&!/n[aã]o\s*lideran[cç]a/i.test(e)?"LEADERSHIP":"NON_LEADERSHIP"},competences:E}}function F(){const c=document.getElementById(J);if(c){c.style.display==="none"?(c.style.display="block",c.dispatchEvent(new CustomEvent("zup-open"))):c.style.display="none";return}const e=document.createElement("div");e.id=J,e.style.position="fixed",e.style.top="50%",e.style.left="50%",e.style.transform="translate(-50%, -50%)",e.style.width="380px",e.style.height="380px",e.style.maxWidth="90vw",e.style.maxHeight="90vh",e.style.zIndex="2147483647",e.style.display="block",e.style.boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 0 100vmax rgba(0, 0, 0, 0.45)",e.style.borderRadius="12px",e.style.fontFamily='-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';const a=e.attachShadow({mode:"open"}),s=document.createElement("style");s.textContent=`
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
  `,a.appendChild(s);const o=document.createElement("div");o.className="modal",o.innerHTML=`
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
  `,a.appendChild(o);const r=o.querySelector(".close-btn"),t=o.querySelector(".session-badge"),i=o.querySelector(".session-refresh-btn"),m=o.querySelector(".session-toggle-btn"),n=o.querySelector(".manual-box"),h=o.querySelector(".manual-input"),b=o.querySelector(".manual-apply-btn"),p=o.querySelector(".manual-refresh-btn"),E=o.querySelector(".manual-clear-btn"),u=o.querySelector("textarea"),y=o.querySelector(".status"),g=o.querySelector(".submit-btn"),x=async(d=!1)=>{let l=S.getSession();if((d||!l.token||l.isExpired)&&(l=A.detectSessionFromPage(d)),l.token&&!l.isExpired){const k=l.expiresAt?Math.max(0,Math.round((new Date(l.expiresAt).getTime()-Date.now())/6e4)):5,O=l.user?.name||l.user?.email?.split("@")[0]||"Sessão ativa";t.textContent=`🟢 ${O} (${k}m)`,t.style.color="#4ade80",t.title=l.expiresAt?`Expira às ${new Date(l.expiresAt).toLocaleTimeString()}`:"Sessão ativa"}else l.token&&l.isExpired?(t.textContent="🔴 Sessão expirada (F5 no People)",t.style.color="#f87171",t.title=l.expiresAt?`Expirou às ${new Date(l.expiresAt).toLocaleTimeString()}`:"Expirado"):(t.textContent="⚪ Token não detectado",t.style.color="#94a3b8",t.title="Nenhum token encontrado na página.")};A.onAuthStatusChanged(()=>{x()});const v=async()=>{t.textContent="🔄 Atualizando...",t.style.color="#818cf8",await A.refreshAccessToken()||A.detectSessionFromPage(!0),await x();const l=S.getSession();l.token&&!l.isExpired?w("success","Sessão atualizada!"):w("error","Não foi possível renovar automaticamente. Atualize a página (F5) ou use a chave manual."),setTimeout(T,3e3)};i.onclick=d=>{d.stopPropagation(),v()},p.onclick=d=>{d.stopPropagation(),v()},m.onclick=()=>{const d=n.style.display==="none"||!n.style.display;if(n.style.display=d?"flex":"none",d){const l=S.getSession();h.value=l.token||"",h.focus()}},b.onclick=async()=>{const d=h.value.trim().replace(/^bearer\s+/i,"");d&&(A.setManualToken(d),n.style.display="none",await x(),w("success","Chave manual salva e validada com sucesso!"),setTimeout(T,3e3))},E.onclick=async()=>{A.logout(),h.value="",n.style.display="none",await x(),w("success","Chave manual removida."),setTimeout(T,3e3)};const D=()=>{e.style.display="none"},_=d=>{if(e.style.display==="none")return;d.composedPath().includes(e)||D()};r.onclick=d=>{d.stopPropagation(),D()};const w=(d,l)=>{y.className=`status ${d}`,y.textContent=l},T=()=>{y.className="status",y.textContent=""};u.oninput=()=>{g.disabled=!u.value.trim(),T()},e.addEventListener("zup-open",()=>{x(),setTimeout(()=>{u.focus()},50)});const N=async()=>{const d=u.value.trim();if(!d){w("error","Cole o relato antes de enviar.");return}let l=null;try{l=JSON.parse(d)}catch{l=Q(d)}if(!l||!l.title&&!l.content){w("error","Não foi possível identificar o título ou conteúdo do relato.");return}g.disabled=!0,g.textContent="Autenticando...",T();let k=S.getSession();if((!k.token||k.isExpired)&&(k=A.detectSessionFromPage(!0)),k.isExpired&&k.refreshToken&&(g.textContent="Renovando sessão...",await A.refreshAccessToken(),k=S.getSession()),!k.token){w("error",'Token de autenticação não encontrado. Atualize a página do People (F5) ou use a "Chave manual" acima.'),g.textContent="Enviar",g.disabled=!u.value.trim();return}g.textContent="Enviando...";const O=async f=>{const z=await fetch("https://apiznt.zenity.zup.com.br/dune/v1/entry",{method:"POST",headers:{"Content-Type":"application/json",Accept:"*/*",authorization:`Bearer ${f}`},credentials:"omit",body:JSON.stringify(l)}),P=await z.text();let M={};try{M=JSON.parse(P)}catch{M={text:P}}return{ok:z.ok,status:z.status,data:M,text:P}};try{let f=await O(k.token);if(!f.ok&&(f.status===401||f.status===403||f.text.includes("not authorized")||f.text.includes("deny"))&&(g.textContent="Renovando sessão...",await A.refreshAccessToken())){const P=S.getSession();P.token&&P.token!==k.token&&(g.textContent="Reenviando...",f=await O(P.token))}if(f.ok)w("success",`Relato${f.data?.id?` #${f.data.id}`:""} enviado com sucesso!`),u.value="",g.disabled=!0,x();else{const z=f.data?.message||f.data?.Message||f.data?.error||f.text||`Status HTTP ${f.status}`;w("error",`Falha (${f.status}): ${z}`)}}catch(f){w("error",`Erro de conexão: ${f.message}`)}finally{g.textContent="Enviar",g.disabled=!u.value.trim()}};g.onclick=d=>{d.stopPropagation(),N()},u.onkeydown=d=>{(d.ctrlKey||d.metaKey)&&d.key==="Enter"&&(d.preventDefault(),N()),d.key==="Escape"&&D()},document.body.appendChild(e),x(),setTimeout(()=>{u.focus(),window.addEventListener("pointerdown",_,!0)},100)}window.ZupLogbook={mountZupLogbook:F},F(),I.mountZupLogbook=F,Object.defineProperty(I,Symbol.toStringTag,{value:"Module"})})(this.ZupLogbook=this.ZupLogbook||{});
