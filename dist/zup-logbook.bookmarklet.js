(function(R){"use strict";const D="zup-logbook-host",B=[{id:1,name:"Colaboramos de verdade"},{id:2,name:"Nosso compromisso é coletivo"},{id:3,name:"Vamos direto ao ponto"},{id:4,name:"Focamos no cliente"},{id:5,name:"Entregamos valor de ponta a ponta"},{id:6,name:"Decidimos com contexto"},{id:7,name:"Protagonizamos o futuro"},{id:8,name:"Tomamos a iniciativa"},{id:9,name:"Entrega soluções técnicas"},{id:10,name:"Aplicabilidade de novos conhecimentos técnicos"},{id:11,name:"Linguagem de Programação [Java, Go, Kotlin, C#, Python, Swift, etc ]"},{id:12,name:"Algoritmos e Estrutura de Dados"},{id:13,name:"Fluxo de trabalho/Workflow"},{id:14,name:"Pipeline CI/CD"},{id:15,name:"APIs"},{id:16,name:"Segurança"},{id:17,name:"Arquitetura de soluções"},{id:18,name:"Redes (VPC, CDN, DNS, etc)"},{id:19,name:"Infra / IaC (Terraform, CloudFormation, etc)"},{id:23,name:"StackSpot AI"},{id:25,name:"Computing services (EC2, ECS, EKS, Fargate, Lambda, etc)"},{id:26,name:"Observabilidade e Monitoramento"},{id:27,name:"SQL / noSQL"},{id:28,name:"Cache"},{id:29,name:"Inteligencia Artificial"},{id:40,name:"Arquitetura de Solução"},{id:41,name:"Qualidade"},{id:50,name:"Testes Automatizados"},{id:52,name:"Log, Debug, Performance"},{id:53,name:"Versionamento"},{id:54,name:"Code Review"},{id:59,name:"Arquitetura"},{id:62,name:"CI/CD"},{id:72,name:"Bancos de dados"},{id:80,name:"Codificação"},{id:83,name:"Arquitetura de Sistemas"},{id:86,name:"DevOps e Observabilidade"},{id:97,name:"Boas Práticas de programação e automação"},{id:106,name:"Linux"}];function O(s){return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]/g,"")}function M(s){const t=O(s);return t?B.find(a=>{const o=O(a.name);return o===t||o.includes(t)||t.includes(o)})||{id:0,name:s.trim()}:null}function Z(s){let t=s.trim().replace(/^```[a-z0-9_-]*\s*/i,"").replace(/\s*```$/,"").replace(/\[cite:[^\]]*\]/gi,"").replace(/\[\d+(?:,\s*\d+)*\]/g,"").trim();if(/^##+\s+/m.test(t)){let m="";const x=t.match(/^#\s*(?:t[ií]tulo:\s*)?(.+)$/mi)||t.match(/^t[ií]tulo:\s*(.+)$/mi);x?m=x[1].replace(/^t[ií]tulo:\s*/i,"").trim():m=t.split(/\r?\n/)[0]?.replace(/^[#\s*_-]+/,"").replace(/^t[ií]tulo:\s*/i,"").trim()||"";const v=/^##+\s+(.+)$/gm;let w;const g=[];for(;(w=v.exec(t))!==null;)g.push({header:w[1].trim(),index:w.index,end:w.index+w[0].length});const N=[],S=[],r=[];for(let k=0;k<g.length;k++){const C=g[k],A=k+1<g.length?g[k+1].index:t.length,E=t.slice(C.end,A).trim();if(/compet[eê]ncias/i.test(C.header)){const _=E.split(/\r?\n/).map(L=>L.replace(/^[-*•\d.)\s]+/,"").trim()).filter(Boolean);for(const L of _){const $=M(L);$&&N.push($)}continue}let h=C.header;h.endsWith(":")||(h+=":"),S.push({type:"paragraph",children:[{text:h,bold:!0}]}),E?(S.push({type:"paragraph",children:[{text:E}]}),r.push(`${h}
${E}`)):r.push(h),S.push({type:"paragraph",children:[{text:"",bold:!0}]})}return S.length>0&&S[S.length-1].children?.[0]?.text===""&&S.pop(),{title:m,formattedContent:S,content:r.join(`

`),isPerformanceReview:!0,metadata:{templateFor:/lideran[cç]a/i.test(t)&&!/n[aã]o\s*lideran[cç]a/i.test(t)?"LEADERSHIP":"NON_LEADERSHIP"},competences:N}}let a=t;const o=a.match(/compet[eê]ncias:\s*([\s\S]*)$/i);let y="";o&&(y=o[1].trim(),a=a.slice(0,o.index).trim());let c="";const f=a.search(/descri[cç][aã]o:/i);f!==-1?(c=a.slice(0,f).replace(/t[ií]tulo:\s*/i,"").trim(),a=a.slice(f).replace(/descri[cç][aã]o:\s*/i,"").trim()):c=a.split(/\r?\n/)[0]?.replace(/t[ií]tulo:\s*/i,"").trim()||"",c=c.split(/\r?\n/)[0]?.replace(/^t[ií]tulo:\s*/i,"").trim()||"";const i=/(Resultado\/impacto(?:\s*\(momento atual\))?:?|Atitude e comportamento:?|Conhecimento T[eé]cnico da Pr[aá]tica:?|Aprendizado Tech:?|Expectativas de Entregas:?|Coment[aá]rios Adicionais(?: e Feedback Recebido)?:?)/gi,e=[];let n;for(;(n=i.exec(a))!==null;)e.push({index:n.index,header:n[0],end:n.index+n[0].length});const l=[],u=[];for(let m=0;m<e.length;m++){const x=e[m],v=m+1<e.length?e[m+1].index:a.length;let w=a.slice(x.end,v).trim().replace(/^-+\s*|\s*-+$/g,"").trim(),g=x.header.trim();g.endsWith(":")||(g+=":"),l.push({type:"paragraph",children:[{text:g,bold:!0}]}),w?(l.push({type:"paragraph",children:[{text:w}]}),u.push(`${g}
${w}`)):u.push(g),m<e.length-1&&l.push({type:"paragraph",children:[{text:"",bold:!0}]})}const d=[];if(y){const m=y.split(/[\r\n,]+/).map(x=>x.replace(/^[-*•\d.)\s]+/,"").trim()).filter(Boolean);for(const x of m){const v=M(x);v&&d.push(v)}}return{title:c,formattedContent:l,content:u.join(`

`),isPerformanceReview:!0,metadata:{templateFor:/lideran[cç]a/i.test(t)&&!/n[aã]o\s*lideran[cç]a/i.test(t)?"LEADERSHIP":"NON_LEADERSHIP"},competences:d}}function b(s){if(!s||typeof s!="string")return null;const t=s.trim().split(".");if(t.length!==3)return null;try{let p=t[1].replace(/-/g,"+").replace(/_/g,"/");for(;p.length%4!==0;)p+="=";const a=decodeURIComponent(atob(p).split("").map(y=>"%"+("00"+y.charCodeAt(0).toString(16)).slice(-2)).join("")),o=JSON.parse(a);return{token:s.trim(),payload:o,exp:o.exp?o.exp*1e3:1/0,typ:(o.typ||o.type||"").toLowerCase(),iss:o.iss,azp:o.azp||o.client_id}}catch{try{let p=t[1].replace(/-/g,"+").replace(/_/g,"/");for(;p.length%4!==0;)p+="=";const a=JSON.parse(atob(p));return{token:s.trim(),payload:a,exp:a.exp?a.exp*1e3:1/0,typ:(a.typ||a.type||"").toLowerCase(),iss:a.iss,azp:a.azp||a.client_id}}catch{return null}}}function T(s){return!s||!s.payload||s.typ==="refresh"||s.payload.type==="refresh"||s.typ==="id"||s.payload.type==="id"?!1:!!(s.typ==="bearer"||s.payload.token_type?.toLowerCase()==="bearer"||s.payload.resource_access||s.payload.realm_access||s.payload.scope&&!s.payload.nonce&&!s.payload.auth_time)}function H(s){return s.typ==="refresh"||s.payload&&s.payload.type==="refresh"}let z=null,I=null;try{if(typeof window<"u"){const s=window.fetch;window.fetch=async function(...p){try{const a=p[0],o=p[1];let y=null;if(o?.headers)if(o.headers instanceof Headers)y=o.headers.get("Authorization")||o.headers.get("authorization");else if(Array.isArray(o.headers)){const f=o.headers.find(([i])=>i.toLowerCase()==="authorization");f&&(y=f[1])}else typeof o.headers=="object"&&(y=o.headers.Authorization||o.headers.authorization);if(y&&y.toLowerCase().startsWith("bearer ")){const f=y.replace(/^bearer\s+/i,"").trim(),i=b(f);i&&T(i)&&(z=f)}if((typeof a=="string"?a:a?.url||"").includes("protocol/openid-connect/token")&&o?.body){const f=typeof o.body=="string"?o.body:"",e=new URLSearchParams(f).get("refresh_token");e&&(I=e)}}catch{}return s.apply(this,p)};const t=XMLHttpRequest.prototype.setRequestHeader;XMLHttpRequest.prototype.setRequestHeader=function(p,a){try{if(p?.toLowerCase()==="authorization"&&a?.toLowerCase().startsWith("bearer ")){const o=a.replace(/^bearer\s+/i,"").trim(),y=b(o);y&&T(y)&&(z=o)}}catch{}return t.apply(this,[p,a])}}}catch{}async function F(s,t,p){if(!s)return null;try{const o=`${t?t.replace(/\/+$/,""):"https://keycloak-zenity.zup.com.br/auth/realms/zupinternal"}/protocol/openid-connect/token`,y=p||"realwave_zupper_csp_ui",c=new URLSearchParams({grant_type:"refresh_token",refresh_token:s.trim(),client_id:y}),f=await fetch(o,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded",Accept:"*/*"},credentials:"omit",body:c.toString()});if(f.ok){const i=await f.json();if(i.access_token){z=i.access_token,i.refresh_token&&(I=i.refresh_token);try{for(let e=0;e<sessionStorage.length;e++){const n=sessionStorage.key(e);if(n&&n.startsWith("oidc.user:")){const l=JSON.parse(sessionStorage.getItem(n)||"{}");l.access_token=i.access_token,i.refresh_token&&(l.refresh_token=i.refresh_token),i.id_token&&(l.id_token=i.id_token),i.expires_in&&(l.expires_at=Math.floor(Date.now()/1e3)+i.expires_in),sessionStorage.setItem(n,JSON.stringify(l))}}}catch{}return i.access_token}}}catch{}return null}async function J(){return typeof window>"u"||!document.body?null:new Promise(s=>{try{const t=document.createElement("iframe");t.style.display="none",t.id="zup-logbook-sso-iframe";const p=encodeURIComponent(window.location.origin+window.location.pathname),a=Math.random().toString(36).substring(2),o=Math.random().toString(36).substring(2),y=`https://keycloak-zenity.zup.com.br/auth/realms/zupinternal/protocol/openid-connect/auth?client_id=realwave_zupper_csp_ui&redirect_uri=${p}&response_mode=fragment&response_type=code%20id_token%20token&scope=openid&prompt=none&state=${a}&nonce=${o}`;let c=null;const f=()=>{c&&clearTimeout(c);try{t.parentNode&&t.parentNode.removeChild(t)}catch{}};c=setTimeout(()=>{f(),s(null)},3e3),t.onload=()=>{try{const i=t.contentWindow?.location.href||"";if(i.includes("access_token=")){const e=i.split("#")[1]||i.split("?")[1]||"",n=new URLSearchParams(e),l=n.get("access_token"),u=n.get("refresh_token");if(l){z=l,u&&(I=u),f(),s(l);return}}}catch{}},t.src=y,document.body.appendChild(t)}catch{s(null)}})}async function P(s=!1){const t=Date.now(),p=15e3;try{const e=sessionStorage.getItem("zup_manual_token")||localStorage.getItem("zup_manual_token");if(e){const n=b(e);if(n)return console.info("[ZupLogbook] Usando token manual salvo"),{token:n.token,exp:n.exp,isExpired:n.exp<=t,userEmail:n.payload?.email,userName:n.payload?.name,source:"manual"}}}catch{}let a=null;if(I){const e=b(I);a={token:I,iss:e?.iss,azp:e?.azp}}const o=window;if(o?.keycloak)try{if(typeof o.keycloak.updateToken=="function"&&await o.keycloak.updateToken(s?999999:30),o.keycloak.refreshToken&&!a){const e=b(o.keycloak.refreshToken);a={token:o.keycloak.refreshToken,iss:e?.iss,azp:e?.azp}}if(o.keycloak.token){const e=b(o.keycloak.token);if(e&&T(e)&&(!s&&e.exp>t+p))return console.info("[ZupLogbook] Token obtido via window.keycloak"),{token:o.keycloak.token,exp:e.exp,isExpired:!1,userEmail:e.payload?.email,userName:e.payload?.name,source:"keycloak"}}}catch{}if(!s&&z){const e=b(z);if(e&&T(e)&&e.exp>t+p)return console.info("[ZupLogbook] Token obtido via interceptador de rede"),{token:z,exp:e.exp,isExpired:!1,userEmail:e.payload?.email,userName:e.payload?.name,source:"interceptor"}}const y=[sessionStorage,localStorage];for(const e of y)try{for(let n=0;n<e.length;n++){const l=e.key(n);if(l&&l.startsWith("oidc.user:")){const u=JSON.parse(e.getItem(l)||"{}");if(u.refresh_token&&!a){const d=b(u.refresh_token);a={token:u.refresh_token,iss:d?.iss,azp:d?.azp}}if(u.access_token){const d=b(u.access_token);if(d&&T(d)&&(!s&&d.exp>t+p))return console.info("[ZupLogbook] Token obtido via storage OIDC ("+l+")"),{token:u.access_token,exp:d.exp,isExpired:!1,userEmail:d.payload?.email,userName:d.payload?.name,source:"oidc"}}}}}catch{}const c=[],f=(e,n)=>{if(!e||typeof e!="string")return;const l=e.match(/eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+/g);if(l)for(const u of l){const d=b(u);d&&(H(d)?a||(a={token:u,iss:d.iss,azp:d.azp}):T(d)&&(console.info(`[ZupLogbook] Candidato Access Token (${n}): exp=${new Date(d.exp).toLocaleTimeString()}, expirado=${d.exp<=t}`),c.push(d)))}};try{for(let e=0;e<sessionStorage.length;e++){const n=sessionStorage.key(e);n&&f(sessionStorage.getItem(n)||"",`sessionStorage[${n}]`)}}catch{}try{for(let e=0;e<localStorage.length;e++){const n=localStorage.key(e);n&&!n.startsWith("zup_manual_token")&&f(localStorage.getItem(n)||"",`localStorage[${n}]`)}}catch{}try{f(document.cookie,"cookie")}catch{}for(const e of["keycloak","_keycloak","kc","auth","currentUser","__PRELOADED_STATE__"])try{o[e]&&f(typeof o[e]=="string"?o[e]:JSON.stringify(o[e]),`window.${e}`)}catch{}if(!s&&c.length>0){const e=c.filter(n=>n.exp>t+p);if(e.length>0){e.sort((l,u)=>{const d=l.typ==="bearer"?1:0,m=u.typ==="bearer"?1:0;return d!==m?m-d:u.exp-l.exp});const n=e[0];return console.info(`[ZupLogbook] Melhor token selecionado: exp=${new Date(n.exp).toLocaleTimeString()}`),{token:n.token,exp:n.exp,isExpired:!1,userEmail:n.payload?.email,userName:n.payload?.name,source:"storage"}}}if(a){console.info("[ZupLogbook] Tentando renovar sessão com Refresh Token...");const e=await F(a.token,a.iss,a.azp);if(e){const n=b(e);return{token:e,exp:n?.exp||t+3e5,isExpired:!1,userEmail:n?.payload?.email,userName:n?.payload?.name,source:"refresh_token"}}}console.info("[ZupLogbook] Tentando Silent SSO via iframe...");const i=await J();if(i){const e=b(i);return{token:i,exp:e?.exp||t+3e5,isExpired:!1,userEmail:e?.payload?.email,userName:e?.payload?.name,source:"sso_iframe"}}if(c.length>0){c.sort((n,l)=>l.exp-n.exp);const e=c[0];return console.warn(`[ZupLogbook] Todos os access tokens estão expirados (último expirou às ${new Date(e.exp).toLocaleTimeString()})`),{token:null,exp:e.exp,isExpired:!0,userEmail:e.payload?.email,userName:e.payload?.name,source:"expired"}}return console.warn("[ZupLogbook] Nenhum token de acesso encontrado na página."),{token:null,exp:0,isExpired:!1,source:"not_found"}}function q(){const s=document.getElementById(D);s&&s.remove();const t=document.createElement("div");t.id=D,t.style.position="fixed",t.style.top="50%",t.style.left="50%",t.style.transform="translate(-50%, -50%)",t.style.width="380px",t.style.height="380px",t.style.maxWidth="90vw",t.style.maxHeight="90vh",t.style.zIndex="2147483647",t.style.display="block",t.style.boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 0 100vmax rgba(0, 0, 0, 0.45)",t.style.borderRadius="12px",t.style.fontFamily='-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';const p=t.attachShadow({mode:"open"}),a=document.createElement("style");a.textContent=`
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
      max-width: 250px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
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
    .manual-clear-btn {
      background: #252836;
      color: #94a3b8;
      border: none;
      padding: 4px 6px;
      border-radius: 4px;
      font-size: 11px;
      cursor: pointer;
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
  `,p.appendChild(a);const o=document.createElement("div");o.className="modal",o.innerHTML=`
    <div class="header">
      <span class="title">Zup Logbook</span>
      <button class="close-btn" type="button" title="Fechar">✕</button>
    </div>
    <div class="session-bar">
      <span class="session-badge">● Detectando sessão...</span>
      <button class="session-toggle-btn" type="button">Chave manual</button>
    </div>
    <div class="manual-box">
      <input type="password" class="manual-input" placeholder="Cole o Bearer token aqui..." />
      <button class="manual-apply-btn" type="button">Salvar</button>
      <button class="manual-clear-btn" type="button" title="Limpar token manual">✕</button>
    </div>
    <textarea placeholder="Cole o Markdown ou texto do relato aqui..." autofocus></textarea>
    <div class="status"></div>
    <button class="submit-btn" type="button" disabled>Enviar</button>
  `,p.appendChild(o);const y=o.querySelector(".close-btn"),c=o.querySelector(".session-badge"),f=o.querySelector(".session-toggle-btn"),i=o.querySelector(".manual-box"),e=o.querySelector(".manual-input"),n=o.querySelector(".manual-apply-btn"),l=o.querySelector(".manual-clear-btn"),u=o.querySelector("textarea"),d=o.querySelector(".status"),m=o.querySelector(".submit-btn"),x=async()=>{const r=await P();if(r.token&&!r.isExpired){const k=Math.max(0,Math.round((r.exp-Date.now())/6e4)),C=r.userEmail?r.userEmail.split("@")[0]:"Sessão ativa";c.textContent=`🟢 ${r.source==="manual"?"Manual: ":""}${C} (${k}m)`,c.style.color="#4ade80",c.title=`Expira às ${new Date(r.exp).toLocaleTimeString()}`}else r.isExpired?(c.textContent="🔴 Sessão expirada (F5 no People)",c.style.color="#f87171",c.title=`Expirou às ${new Date(r.exp).toLocaleTimeString()}`):(c.textContent="⚪ Token não detectado",c.style.color="#94a3b8",c.title="Nenhum token encontrado na página.")};f.onclick=()=>{const r=i.style.display==="none"||!i.style.display;if(i.style.display=r?"flex":"none",r){const k=sessionStorage.getItem("zup_manual_token")||localStorage.getItem("zup_manual_token")||"";e.value=k,e.focus()}},n.onclick=()=>{const r=e.value.trim().replace(/^bearer\s+/i,"");r&&(sessionStorage.setItem("zup_manual_token",r),i.style.display="none",x(),g("success","Chave manual salva com sucesso!"))},l.onclick=()=>{sessionStorage.removeItem("zup_manual_token"),localStorage.removeItem("zup_manual_token"),e.value="",i.style.display="none",x(),g("success","Chave manual removida.")};const v=()=>{t.style.display="none",window.removeEventListener("pointerdown",w,!0)},w=r=>{r.composedPath().includes(t)||v()};y.onclick=r=>{r.stopPropagation(),v()};const g=(r,k)=>{d.className=`status ${r}`,d.textContent=k},N=()=>{d.className="status",d.textContent=""};u.oninput=()=>{m.disabled=!u.value.trim(),N()};const S=async()=>{const r=u.value.trim();if(!r){g("error","Cole o relato antes de enviar.");return}let k=null;try{k=JSON.parse(r)}catch{k=Z(r)}if(!k||!k.title&&!k.content){g("error","Não foi possível identificar o título ou conteúdo do relato.");return}m.disabled=!0,m.textContent="Autenticando...",N();let C=await P();if(!C.token){C.isExpired?g("error",`Sessão expirada no People Zup (expirou às ${new Date(C.exp).toLocaleTimeString()}). Recarregue a página (F5) ou use a "Chave manual" acima.`):g("error",'Token de autenticação não encontrado na página. Atualize a página (F5) ou use a "Chave manual" acima.'),m.textContent="Enviar",m.disabled=!u.value.trim();return}let A=C.token;m.textContent="Enviando...";const E=async h=>{const _=await fetch("https://apiznt.zenity.zup.com.br/dune/v1/entry",{method:"POST",headers:{"Content-Type":"application/json",Accept:"*/*",authorization:`Bearer ${h}`},credentials:"omit",body:JSON.stringify(k)}),L=await _.text();let $={};try{$=JSON.parse(L)}catch{$={text:L}}return{ok:_.ok,status:_.status,data:$,text:L}};try{let h=await E(A);if(!h.ok&&(h.status===401||h.status===403||h.text.includes("not authorized"))){m.textContent="Renovando sessão...";const _=await P(!0);_.token&&_.token!==A&&(A=_.token,m.textContent="Reenviando...",h=await E(A))}if(h.ok)g("success",`Relato${h.data?.id?` #${h.data.id}`:""} enviado com sucesso!`),u.value="",m.disabled=!0,x();else{const _=h.data?.message||h.data?.Message||h.data?.error||h.text||`Status HTTP ${h.status}`;g("error",`Falha (${h.status}): ${_}`)}}catch(h){g("error",`Erro de conexão: ${h.message}`)}finally{m.textContent="Enviar",m.disabled=!u.value.trim()}};m.onclick=r=>{r.stopPropagation(),S()},u.onkeydown=r=>{(r.ctrlKey||r.metaKey)&&r.key==="Enter"&&(r.preventDefault(),S()),r.key==="Escape"&&v()},document.body.appendChild(t),x(),setTimeout(()=>{u.focus(),window.addEventListener("pointerdown",w,!0)},100)}q(),R.mountZupLogbook=q,Object.defineProperty(R,Symbol.toStringTag,{value:"Module"})})(this.ZupLogbook=this.ZupLogbook||{});
