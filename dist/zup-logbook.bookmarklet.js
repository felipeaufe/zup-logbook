(function(q){"use strict";const B="zup-logbook-host",F=[{id:1,name:"Colaboramos de verdade"},{id:2,name:"Nosso compromisso é coletivo"},{id:3,name:"Vamos direto ao ponto"},{id:4,name:"Focamos no cliente"},{id:5,name:"Entregamos valor de ponta a ponta"},{id:6,name:"Decidimos com contexto"},{id:7,name:"Protagonizamos o futuro"},{id:8,name:"Tomamos a iniciativa"},{id:9,name:"Entrega soluções técnicas"},{id:10,name:"Aplicabilidade de novos conhecimentos técnicos"},{id:11,name:"Linguagem de Programação [Java, Go, Kotlin, C#, Python, Swift, etc ]"},{id:12,name:"Algoritmos e Estrutura de Dados"},{id:13,name:"Fluxo de trabalho/Workflow"},{id:14,name:"Pipeline CI/CD"},{id:15,name:"APIs"},{id:16,name:"Segurança"},{id:17,name:"Arquitetura de soluções"},{id:18,name:"Redes (VPC, CDN, DNS, etc)"},{id:19,name:"Infra / IaC (Terraform, CloudFormation, etc)"},{id:23,name:"StackSpot AI"},{id:25,name:"Computing services (EC2, ECS, EKS, Fargate, Lambda, etc)"},{id:26,name:"Observabilidade e Monitoramento"},{id:27,name:"SQL / noSQL"},{id:28,name:"Cache"},{id:29,name:"Inteligencia Artificial"},{id:40,name:"Arquitetura de Solução"},{id:41,name:"Qualidade"},{id:50,name:"Testes Automatizados"},{id:52,name:"Log, Debug, Performance"},{id:53,name:"Versionamento"},{id:54,name:"Code Review"},{id:59,name:"Arquitetura"},{id:62,name:"CI/CD"},{id:72,name:"Bancos de dados"},{id:80,name:"Codificação"},{id:83,name:"Arquitetura de Sistemas"},{id:86,name:"DevOps e Observabilidade"},{id:97,name:"Boas Práticas de programação e automação"},{id:106,name:"Linux"}];function M(a){return a.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]/g,"")}function Z(a){const t=M(a);return t?F.find(s=>{const o=M(s.name);return o===t||o.includes(t)||t.includes(o)})||{id:0,name:a.trim()}:null}function J(a){let t=a.trim().replace(/^```[a-z0-9_-]*\s*/i,"").replace(/\s*```$/,"").replace(/\[cite:[^\]]*\]/gi,"").replace(/\[\d+(?:,\s*\d+)*\]/g,"").trim();if(/^##+\s+/m.test(t)){let m="";const k=t.match(/^#\s*(?:t[ií]tulo:\s*)?(.+)$/mi)||t.match(/^t[ií]tulo:\s*(.+)$/mi);k?m=k[1].replace(/^t[ií]tulo:\s*/i,"").trim():m=t.split(/\r?\n/)[0]?.replace(/^[#\s*_-]+/,"").replace(/^t[ií]tulo:\s*/i,"").trim()||"";const b=/^##+\s+(.+)$/gm;let x;const w=[];for(;(x=b.exec(t))!==null;)w.push({header:x[1].trim(),index:x.index,end:x.index+x[0].length});const $=[],C=[],S=[];for(let z=0;z<w.length;z++){const P=w[z],i=z+1<w.length?w[z+1].index:t.length,u=t.slice(P.end,i).trim();if(/compet[eê]ncias/i.test(P.header)){const T=u.split(/\r?\n/).map(N=>N.replace(/^[-*•\d.)\s]+/,"").trim()).filter(Boolean);for(const N of T){const g=Z(N);g&&$.push(g)}continue}let v=P.header;v.endsWith(":")||(v+=":"),C.push({type:"paragraph",children:[{text:v,bold:!0}]}),u?(C.push({type:"paragraph",children:[{text:u}]}),S.push(`${v}
${u}`)):S.push(v),C.push({type:"paragraph",children:[{text:"",bold:!0}]})}return C.length>0&&C[C.length-1].children?.[0]?.text===""&&C.pop(),{title:m,formattedContent:C,content:S.join(`

`),isPerformanceReview:!0,metadata:{templateFor:/lideran[cç]a/i.test(t)&&!/n[aã]o\s*lideran[cç]a/i.test(t)?"LEADERSHIP":"NON_LEADERSHIP"},competences:$}}let s=t;const o=s.match(/compet[eê]ncias:\s*([\s\S]*)$/i);let h="";o&&(h=o[1].trim(),s=s.slice(0,o.index).trim());let r="";const f=s.search(/descri[cç][aã]o:/i);f!==-1?(r=s.slice(0,f).replace(/t[ií]tulo:\s*/i,"").trim(),s=s.slice(f).replace(/descri[cç][aã]o:\s*/i,"").trim()):r=s.split(/\r?\n/)[0]?.replace(/t[ií]tulo:\s*/i,"").trim()||"",r=r.split(/\r?\n/)[0]?.replace(/^t[ií]tulo:\s*/i,"").trim()||"";const c=/(Resultado\/impacto(?:\s*\(momento atual\))?:?|Atitude e comportamento:?|Conhecimento T[eé]cnico da Pr[aá]tica:?|Aprendizado Tech:?|Expectativas de Entregas:?|Coment[aá]rios Adicionais(?: e Feedback Recebido)?:?)/gi,e=[];let n;for(;(n=c.exec(s))!==null;)e.push({index:n.index,header:n[0],end:n.index+n[0].length});const l=[],y=[];for(let m=0;m<e.length;m++){const k=e[m],b=m+1<e.length?e[m+1].index:s.length;let x=s.slice(k.end,b).trim().replace(/^-+\s*|\s*-+$/g,"").trim(),w=k.header.trim();w.endsWith(":")||(w+=":"),l.push({type:"paragraph",children:[{text:w,bold:!0}]}),x?(l.push({type:"paragraph",children:[{text:x}]}),y.push(`${w}
${x}`)):y.push(w),m<e.length-1&&l.push({type:"paragraph",children:[{text:"",bold:!0}]})}const p=[];if(h){const m=h.split(/[\r\n,]+/).map(k=>k.replace(/^[-*•\d.)\s]+/,"").trim()).filter(Boolean);for(const k of m){const b=Z(k);b&&p.push(b)}}return{title:r,formattedContent:l,content:y.join(`

`),isPerformanceReview:!0,metadata:{templateFor:/lideran[cç]a/i.test(t)&&!/n[aã]o\s*lideran[cç]a/i.test(t)?"LEADERSHIP":"NON_LEADERSHIP"},competences:p}}function _(a){if(!a||typeof a!="string")return null;const t=a.trim().split(".");if(t.length!==3)return null;try{let d=t[1].replace(/-/g,"+").replace(/_/g,"/");for(;d.length%4!==0;)d+="=";const s=decodeURIComponent(atob(d).split("").map(h=>"%"+("00"+h.charCodeAt(0).toString(16)).slice(-2)).join("")),o=JSON.parse(s);return{token:a.trim(),payload:o,exp:o.exp?o.exp*1e3:1/0,typ:(o.typ||o.type||"").toLowerCase(),iss:o.iss,azp:o.azp||o.client_id}}catch{try{let d=t[1].replace(/-/g,"+").replace(/_/g,"/");for(;d.length%4!==0;)d+="=";const s=JSON.parse(atob(d));return{token:a.trim(),payload:s,exp:s.exp?s.exp*1e3:1/0,typ:(s.typ||s.type||"").toLowerCase(),iss:s.iss,azp:s.azp||s.client_id}}catch{return null}}}function A(a){return!a||!a.payload||a.typ==="refresh"||a.payload.type==="refresh"||a.typ==="id"||a.payload.type==="id"?!1:!!(a.typ==="bearer"||a.payload.token_type?.toLowerCase()==="bearer"||a.payload.resource_access||a.payload.realm_access||a.payload.scope&&!a.payload.nonce&&!a.payload.auth_time)}function U(a){return a.typ==="refresh"||a.payload&&a.payload.type==="refresh"}let L=null,I=null;try{if(typeof window<"u"&&!window.__zup_interceptors_installed){window.__zup_interceptors_installed=!0;const a=window.fetch;window.fetch=async function(...d){try{const s=d[0],o=d[1];let h=null;if(o?.headers)if(o.headers instanceof Headers)h=o.headers.get("Authorization")||o.headers.get("authorization");else if(Array.isArray(o.headers)){const f=o.headers.find(([c])=>c.toLowerCase()==="authorization");f&&(h=f[1])}else typeof o.headers=="object"&&(h=o.headers.Authorization||o.headers.authorization);if(h&&h.toLowerCase().startsWith("bearer ")){const f=h.replace(/^bearer\s+/i,"").trim(),c=_(f);c&&A(c)&&(L=f)}if((typeof s=="string"?s:s?.url||"").includes("protocol/openid-connect/token")&&o?.body){const f=typeof o.body=="string"?o.body:"",e=new URLSearchParams(f).get("refresh_token");e&&(I=e)}}catch{}return a.apply(this,d)};const t=XMLHttpRequest.prototype.setRequestHeader;XMLHttpRequest.prototype.setRequestHeader=function(d,s){try{if(d?.toLowerCase()==="authorization"&&s?.toLowerCase().startsWith("bearer ")){const o=s.replace(/^bearer\s+/i,"").trim(),h=_(o);h&&A(h)&&(L=o)}}catch{}return t.apply(this,[d,s])}}}catch{}async function j(a,t,d){if(!a)return null;try{const o=`${t?t.replace(/\/+$/,""):"https://keycloak-zenity.zup.com.br/auth/realms/zupinternal"}/protocol/openid-connect/token`,h=d||"realwave_zupper_csp_ui",r=new URLSearchParams({grant_type:"refresh_token",refresh_token:a.trim(),client_id:h}),f=await fetch(o,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded",Accept:"*/*"},credentials:"omit",body:r.toString()});if(f.ok){const c=await f.json();if(c.access_token){L=c.access_token,c.refresh_token&&(I=c.refresh_token);try{for(let e=0;e<sessionStorage.length;e++){const n=sessionStorage.key(e);if(n&&n.startsWith("oidc.user:")){const l=JSON.parse(sessionStorage.getItem(n)||"{}");l.access_token=c.access_token,c.refresh_token&&(l.refresh_token=c.refresh_token),c.id_token&&(l.id_token=c.id_token),c.expires_in&&(l.expires_at=Math.floor(Date.now()/1e3)+c.expires_in),sessionStorage.setItem(n,JSON.stringify(l))}}}catch{}return c.access_token}}}catch{}return null}async function W(){return typeof window>"u"||!document.body?null:new Promise(a=>{try{const t=document.createElement("iframe");t.style.display="none",t.id="zup-logbook-sso-iframe";const d=encodeURIComponent(window.location.origin+window.location.pathname),s=Math.random().toString(36).substring(2),o=Math.random().toString(36).substring(2),h=`https://keycloak-zenity.zup.com.br/auth/realms/zupinternal/protocol/openid-connect/auth?client_id=realwave_zupper_csp_ui&redirect_uri=${d}&response_mode=fragment&response_type=code%20id_token%20token&scope=openid&prompt=none&state=${s}&nonce=${o}`;let r=null;const f=()=>{r&&clearTimeout(r);try{t.parentNode&&t.parentNode.removeChild(t)}catch{}};r=setTimeout(()=>{f(),a(null)},3e3),t.onload=()=>{try{const c=t.contentWindow?.location.href||"";if(c.includes("access_token=")){const e=c.split("#")[1]||c.split("?")[1]||"",n=new URLSearchParams(e),l=n.get("access_token"),y=n.get("refresh_token");if(l){L=l,y&&(I=y),f(),a(l);return}}}catch{}},t.src=h,document.body.appendChild(t)}catch{a(null)}})}async function R(a=!1){const t=Date.now(),d=15e3;try{const e=sessionStorage.getItem("zup_manual_token")||localStorage.getItem("zup_manual_token");if(e){const n=_(e);if(n)return console.info("[ZupLogbook] Usando token manual salvo"),{token:n.token,exp:n.exp,isExpired:n.exp<=t,userEmail:n.payload?.email,userName:n.payload?.name,source:"manual"}}}catch{}let s=null;if(I){const e=_(I);s={token:I,iss:e?.iss,azp:e?.azp}}const o=window;if(o?.keycloak)try{if(typeof o.keycloak.updateToken=="function"&&await o.keycloak.updateToken(a?999999:30),o.keycloak.refreshToken&&!s){const e=_(o.keycloak.refreshToken);s={token:o.keycloak.refreshToken,iss:e?.iss,azp:e?.azp}}if(o.keycloak.token){const e=_(o.keycloak.token);if(e&&A(e)&&(!a&&e.exp>t+d))return console.info("[ZupLogbook] Token obtido via window.keycloak"),{token:o.keycloak.token,exp:e.exp,isExpired:!1,userEmail:e.payload?.email,userName:e.payload?.name,source:"keycloak"}}}catch{}if(!a&&L){const e=_(L);if(e&&A(e)&&e.exp>t+d)return console.info("[ZupLogbook] Token obtido via interceptador de rede"),{token:L,exp:e.exp,isExpired:!1,userEmail:e.payload?.email,userName:e.payload?.name,source:"interceptor"}}const h=[sessionStorage,localStorage];for(const e of h)try{for(let n=0;n<e.length;n++){const l=e.key(n);if(l&&l.startsWith("oidc.user:")){const y=JSON.parse(e.getItem(l)||"{}");if(y.refresh_token&&!s){const p=_(y.refresh_token);s={token:y.refresh_token,iss:p?.iss,azp:p?.azp}}if(y.access_token){const p=_(y.access_token);if(p&&A(p)&&(!a&&p.exp>t+d))return console.info("[ZupLogbook] Token obtido via storage OIDC ("+l+")"),{token:y.access_token,exp:p.exp,isExpired:!1,userEmail:p.payload?.email,userName:p.payload?.name,source:"oidc"}}}}}catch{}const r=[],f=(e,n)=>{if(!e||typeof e!="string")return;const l=e.match(/eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+/g);if(l)for(const y of l){const p=_(y);p&&(U(p)?s||(s={token:y,iss:p.iss,azp:p.azp}):A(p)&&(console.info(`[ZupLogbook] Candidato Access Token (${n}): exp=${new Date(p.exp).toLocaleTimeString()}, expirado=${p.exp<=t}`),r.push(p)))}};try{for(let e=0;e<sessionStorage.length;e++){const n=sessionStorage.key(e);n&&f(sessionStorage.getItem(n)||"",`sessionStorage[${n}]`)}}catch{}try{for(let e=0;e<localStorage.length;e++){const n=localStorage.key(e);n&&!n.startsWith("zup_manual_token")&&f(localStorage.getItem(n)||"",`localStorage[${n}]`)}}catch{}try{f(document.cookie,"cookie")}catch{}for(const e of["keycloak","_keycloak","kc","auth","currentUser","__PRELOADED_STATE__"])try{o[e]&&f(typeof o[e]=="string"?o[e]:JSON.stringify(o[e]),`window.${e}`)}catch{}if(!a&&r.length>0){const e=r.filter(n=>n.exp>t+d);if(e.length>0){e.sort((l,y)=>{const p=l.typ==="bearer"?1:0,m=y.typ==="bearer"?1:0;return p!==m?m-p:y.exp-l.exp});const n=e[0];return console.info(`[ZupLogbook] Melhor token selecionado: exp=${new Date(n.exp).toLocaleTimeString()}`),{token:n.token,exp:n.exp,isExpired:!1,userEmail:n.payload?.email,userName:n.payload?.name,source:"storage"}}}if(s){console.info("[ZupLogbook] Tentando renovar sessão com Refresh Token...");const e=await j(s.token,s.iss,s.azp);if(e){const n=_(e);return{token:e,exp:n?.exp||t+3e5,isExpired:!1,userEmail:n?.payload?.email,userName:n?.payload?.name,source:"refresh_token"}}}console.info("[ZupLogbook] Tentando Silent SSO via iframe...");const c=await W();if(c){const e=_(c);return{token:c,exp:e?.exp||t+3e5,isExpired:!1,userEmail:e?.payload?.email,userName:e?.payload?.name,source:"sso_iframe"}}if(r.length>0){r.sort((n,l)=>l.exp-n.exp);const e=r[0];return console.warn(`[ZupLogbook] Todos os access tokens estão expirados (último expirou às ${new Date(e.exp).toLocaleTimeString()})`),{token:null,exp:e.exp,isExpired:!0,userEmail:e.payload?.email,userName:e.payload?.name,source:"expired"}}return console.warn("[ZupLogbook] Nenhum token de acesso encontrado na página."),{token:null,exp:0,isExpired:!1,source:"not_found"}}function H(){const a=document.getElementById(B);if(a){a.style.display==="none"?(a.style.display="block",a.dispatchEvent(new CustomEvent("zup-open"))):a.style.display="none";return}const t=document.createElement("div");t.id=B,t.style.position="fixed",t.style.top="50%",t.style.left="50%",t.style.transform="translate(-50%, -50%)",t.style.width="380px",t.style.height="380px",t.style.maxWidth="90vw",t.style.maxHeight="90vh",t.style.zIndex="2147483647",t.style.display="block",t.style.boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 0 100vmax rgba(0, 0, 0, 0.45)",t.style.borderRadius="12px",t.style.fontFamily='-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';const d=t.attachShadow({mode:"open"}),s=document.createElement("style");s.textContent=`
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
  `,d.appendChild(s);const o=document.createElement("div");o.className="modal",o.innerHTML=`
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
  `,d.appendChild(o);const h=o.querySelector(".close-btn"),r=o.querySelector(".session-badge"),f=o.querySelector(".session-refresh-btn"),c=o.querySelector(".session-toggle-btn"),e=o.querySelector(".manual-box"),n=o.querySelector(".manual-input"),l=o.querySelector(".manual-apply-btn"),y=o.querySelector(".manual-refresh-btn"),p=o.querySelector(".manual-clear-btn"),m=o.querySelector("textarea"),k=o.querySelector(".status"),b=o.querySelector(".submit-btn"),x=async(i=!1)=>{const u=await R(i);if(u.token&&!u.isExpired){const v=Math.max(0,Math.round((u.exp-Date.now())/6e4)),T=u.userEmail?u.userEmail.split("@")[0]:"Sessão ativa";r.textContent=`🟢 ${u.source==="manual"?"Manual: ":""}${T} (${v}m)`,r.style.color="#4ade80",r.title=`Expira às ${new Date(u.exp).toLocaleTimeString()}`}else u.isExpired?(r.textContent="🔴 Sessão expirada (F5 no People)",r.style.color="#f87171",r.title=`Expirou às ${new Date(u.exp).toLocaleTimeString()}`):(r.textContent="⚪ Token não detectado",r.style.color="#94a3b8",r.title="Nenhum token encontrado na página.")},w=async()=>{r.textContent="🔄 Atualizando...",r.style.color="#818cf8",await x(!0),S("success","Sessão atualizada!"),setTimeout(z,3e3)};f.onclick=i=>{i.stopPropagation(),w()},y.onclick=i=>{i.stopPropagation(),w()},c.onclick=()=>{const i=e.style.display==="none"||!e.style.display;if(e.style.display=i?"flex":"none",i){const u=sessionStorage.getItem("zup_manual_token")||localStorage.getItem("zup_manual_token")||"";n.value=u,n.focus()}},l.onclick=async()=>{const i=n.value.trim().replace(/^bearer\s+/i,"");i&&(sessionStorage.setItem("zup_manual_token",i),e.style.display="none",await x(!0),S("success","Chave manual salva e validada com sucesso!"),setTimeout(z,3e3))},p.onclick=async()=>{sessionStorage.removeItem("zup_manual_token"),localStorage.removeItem("zup_manual_token"),n.value="",e.style.display="none",await x(!0),S("success","Chave manual removida."),setTimeout(z,3e3)};const $=()=>{t.style.display="none"},C=i=>{if(t.style.display==="none")return;i.composedPath().includes(t)||$()};h.onclick=i=>{i.stopPropagation(),$()};const S=(i,u)=>{k.className=`status ${i}`,k.textContent=u},z=()=>{k.className="status",k.textContent=""};m.oninput=()=>{b.disabled=!m.value.trim(),z()},t.addEventListener("zup-open",()=>{x(),setTimeout(()=>{m.focus()},50)});const P=async()=>{const i=m.value.trim();if(!i){S("error","Cole o relato antes de enviar.");return}let u=null;try{u=JSON.parse(i)}catch{u=J(i)}if(!u||!u.title&&!u.content){S("error","Não foi possível identificar o título ou conteúdo do relato.");return}b.disabled=!0,b.textContent="Autenticando...",z();let v=await R();if(!v.token){v.isExpired?S("error",`Sessão expirada no People Zup (expirou às ${new Date(v.exp).toLocaleTimeString()}). Recarregue a página (F5) ou use a "Chave manual" acima.`):S("error",'Token de autenticação não encontrado na página. Atualize a página (F5) ou use a "Chave manual" acima.'),b.textContent="Enviar",b.disabled=!m.value.trim();return}let T=v.token;b.textContent="Enviando...";const N=async g=>{const E=await fetch("https://apiznt.zenity.zup.com.br/dune/v1/entry",{method:"POST",headers:{"Content-Type":"application/json",Accept:"*/*",authorization:`Bearer ${g}`},credentials:"omit",body:JSON.stringify(u)}),D=await E.text();let O={};try{O=JSON.parse(D)}catch{O={text:D}}return{ok:E.ok,status:E.status,data:O,text:D}};try{let g=await N(T);if(!g.ok&&(g.status===401||g.status===403||g.text.includes("not authorized"))){b.textContent="Renovando sessão...";const E=await R(!0);E.token&&E.token!==T&&(T=E.token,b.textContent="Reenviando...",g=await N(T))}if(g.ok)S("success",`Relato${g.data?.id?` #${g.data.id}`:""} enviado com sucesso!`),m.value="",b.disabled=!0,x();else{const E=g.data?.message||g.data?.Message||g.data?.error||g.text||`Status HTTP ${g.status}`;S("error",`Falha (${g.status}): ${E}`)}}catch(g){S("error",`Erro de conexão: ${g.message}`)}finally{b.textContent="Enviar",b.disabled=!m.value.trim()}};b.onclick=i=>{i.stopPropagation(),P()},m.onkeydown=i=>{(i.ctrlKey||i.metaKey)&&i.key==="Enter"&&(i.preventDefault(),P()),i.key==="Escape"&&$()},document.body.appendChild(t),x(),setTimeout(()=>{m.focus(),window.addEventListener("pointerdown",C,!0)},100)}H(),q.mountZupLogbook=H,Object.defineProperty(q,Symbol.toStringTag,{value:"Module"})})(this.ZupLogbook=this.ZupLogbook||{});
