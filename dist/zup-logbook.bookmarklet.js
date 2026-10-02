(function(P){"use strict";const R="zup-logbook-host",M=[{id:1,name:"Colaboramos de verdade"},{id:2,name:"Nosso compromisso é coletivo"},{id:3,name:"Vamos direto ao ponto"},{id:4,name:"Focamos no cliente"},{id:5,name:"Entregamos valor de ponta a ponta"},{id:6,name:"Decidimos com contexto"},{id:7,name:"Protagonizamos o futuro"},{id:8,name:"Tomamos a iniciativa"},{id:9,name:"Entrega soluções técnicas"},{id:10,name:"Aplicabilidade de novos conhecimentos técnicos"},{id:11,name:"Linguagem de Programação [Java, Go, Kotlin, C#, Python, Swift, etc ]"},{id:12,name:"Algoritmos e Estrutura de Dados"},{id:13,name:"Fluxo de trabalho/Workflow"},{id:14,name:"Pipeline CI/CD"},{id:15,name:"APIs"},{id:16,name:"Segurança"},{id:17,name:"Arquitetura de soluções"},{id:18,name:"Redes (VPC, CDN, DNS, etc)"},{id:19,name:"Infra / IaC (Terraform, CloudFormation, etc)"},{id:23,name:"StackSpot AI"},{id:25,name:"Computing services (EC2, ECS, EKS, Fargate, Lambda, etc)"},{id:26,name:"Observabilidade e Monitoramento"},{id:27,name:"SQL / noSQL"},{id:28,name:"Cache"},{id:29,name:"Inteligencia Artificial"},{id:40,name:"Arquitetura de Solução"},{id:41,name:"Qualidade"},{id:50,name:"Testes Automatizados"},{id:52,name:"Log, Debug, Performance"},{id:53,name:"Versionamento"},{id:54,name:"Code Review"},{id:59,name:"Arquitetura"},{id:62,name:"CI/CD"},{id:72,name:"Bancos de dados"},{id:80,name:"Codificação"},{id:83,name:"Arquitetura de Sistemas"},{id:86,name:"DevOps e Observabilidade"},{id:97,name:"Boas Práticas de programação e automação"},{id:106,name:"Linux"}];function I(n){return n.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]/g,"")}function N(n){const t=I(n);return t?M.find(a=>{const o=I(a.name);return o===t||o.includes(t)||t.includes(o)})||{id:0,name:n.trim()}:null}function H(n){let t=n.trim().replace(/^```[a-z0-9_-]*\s*/i,"").replace(/\s*```$/,"").replace(/\[cite:[^\]]*\]/gi,"").replace(/\[\d+(?:,\s*\d+)*\]/g,"").trim();if(/^##+\s+/m.test(t)){let l="";const h=t.match(/^#\s*(?:t[ií]tulo:\s*)?(.+)$/mi)||t.match(/^t[ií]tulo:\s*(.+)$/mi);h?l=h[1].replace(/^t[ií]tulo:\s*/i,"").trim():l=t.split(/\r?\n/)[0]?.replace(/^[#\s*_-]+/,"").replace(/^t[ií]tulo:\s*/i,"").trim()||"";const g=/^##+\s+(.+)$/gm;let k;const d=[];for(;(k=g.exec(t))!==null;)d.push({header:k[1].trim(),index:k.index,end:k.index+k[0].length});const b=[],x=[],_=[];for(let v=0;v<d.length;v++){const A=d[v],J=v+1<d.length?d[v+1].index:t.length,E=t.slice(A.end,J).trim();if(/compet[eê]ncias/i.test(A.header)){const j=E.split(/\r?\n/).map(L=>L.replace(/^[-*•\d.)\s]+/,"").trim()).filter(Boolean);for(const L of j){const D=N(L);D&&b.push(D)}continue}let T=A.header;T.endsWith(":")||(T+=":"),x.push({type:"paragraph",children:[{text:T,bold:!0}]}),E?(x.push({type:"paragraph",children:[{text:E}]}),_.push(`${T}
${E}`)):_.push(T),x.push({type:"paragraph",children:[{text:"",bold:!0}]})}return x.length>0&&x[x.length-1].children?.[0]?.text===""&&x.pop(),{title:l,formattedContent:x,content:_.join(`

`),isPerformanceReview:!0,metadata:{templateFor:/lideran[cç]a/i.test(t)&&!/n[aã]o\s*lideran[cç]a/i.test(t)?"LEADERSHIP":"NON_LEADERSHIP"},competences:b}}let a=t;const o=a.match(/compet[eê]ncias:\s*([\s\S]*)$/i);let f="";o&&(f=o[1].trim(),a=a.slice(0,o.index).trim());let p="";const u=a.search(/descri[cç][aã]o:/i);u!==-1?(p=a.slice(0,u).replace(/t[ií]tulo:\s*/i,"").trim(),a=a.slice(u).replace(/descri[cç][aã]o:\s*/i,"").trim()):p=a.split(/\r?\n/)[0]?.replace(/t[ií]tulo:\s*/i,"").trim()||"",p=p.split(/\r?\n/)[0]?.replace(/^t[ií]tulo:\s*/i,"").trim()||"";const s=/(Resultado\/impacto(?:\s*\(momento atual\))?:?|Atitude e comportamento:?|Conhecimento T[eé]cnico da Pr[aá]tica:?|Aprendizado Tech:?|Expectativas de Entregas:?|Coment[aá]rios Adicionais(?: e Feedback Recebido)?:?)/gi,e=[];let r;for(;(r=s.exec(a))!==null;)e.push({index:r.index,header:r[0],end:r.index+r[0].length});const c=[],m=[];for(let l=0;l<e.length;l++){const h=e[l],g=l+1<e.length?e[l+1].index:a.length;let k=a.slice(h.end,g).trim().replace(/^-+\s*|\s*-+$/g,"").trim(),d=h.header.trim();d.endsWith(":")||(d+=":"),c.push({type:"paragraph",children:[{text:d,bold:!0}]}),k?(c.push({type:"paragraph",children:[{text:k}]}),m.push(`${d}
${k}`)):m.push(d),l<e.length-1&&c.push({type:"paragraph",children:[{text:"",bold:!0}]})}const y=[];if(f){const l=f.split(/[\r\n,]+/).map(h=>h.replace(/^[-*•\d.)\s]+/,"").trim()).filter(Boolean);for(const h of l){const g=N(h);g&&y.push(g)}}return{title:p,formattedContent:c,content:m.join(`

`),isPerformanceReview:!0,metadata:{templateFor:/lideran[cç]a/i.test(t)&&!/n[aã]o\s*lideran[cç]a/i.test(t)?"LEADERSHIP":"NON_LEADERSHIP"},competences:y}}function w(n){if(!n||typeof n!="string")return null;const t=n.trim().split(".");if(t.length!==3)return null;try{const i=t[1].replace(/-/g,"+").replace(/_/g,"/"),a=decodeURIComponent(atob(i).split("").map(f=>"%"+("00"+f.charCodeAt(0).toString(16)).slice(-2)).join("")),o=JSON.parse(a);return{token:n.trim(),payload:o,exp:o.exp?o.exp*1e3:1/0,typ:(o.typ||o.type||"").toLowerCase(),iss:o.iss,azp:o.azp||o.client_id}}catch{try{const i=JSON.parse(atob(t[1].replace(/-/g,"+").replace(/_/g,"/")));return{token:n.trim(),payload:i,exp:i.exp?i.exp*1e3:1/0,typ:(i.typ||i.type||"").toLowerCase(),iss:i.iss,azp:i.azp||i.client_id}}catch{return null}}}function C(n){return n.typ==="id"||n.typ==="refresh"?!1:n.typ==="bearer"||n.payload&&(n.payload.resource_access||n.payload.realm_access||n.payload.scope)?!0:n.typ!=="id"}function q(n){return n.typ==="refresh"||n.payload&&n.payload.type==="refresh"}let S=null,z=null;try{if(typeof window<"u"){const n=window.fetch;window.fetch=async function(...i){try{const a=i[0],o=i[1];let f=null;if(o?.headers)if(o.headers instanceof Headers)f=o.headers.get("Authorization")||o.headers.get("authorization");else if(Array.isArray(o.headers)){const u=o.headers.find(([s])=>s.toLowerCase()==="authorization");u&&(f=u[1])}else typeof o.headers=="object"&&(f=o.headers.Authorization||o.headers.authorization);if(f&&f.toLowerCase().startsWith("bearer ")){const u=f.replace(/^bearer\s+/i,"").trim(),s=w(u);s&&C(s)&&(S=u)}if((typeof a=="string"?a:a?.url||"").includes("protocol/openid-connect/token")&&o?.body){const u=typeof o.body=="string"?o.body:"",e=new URLSearchParams(u).get("refresh_token");e&&(z=e)}}catch{}return n.apply(this,i)};const t=XMLHttpRequest.prototype.setRequestHeader;XMLHttpRequest.prototype.setRequestHeader=function(i,a){try{if(i?.toLowerCase()==="authorization"&&a?.toLowerCase().startsWith("bearer ")){const o=a.replace(/^bearer\s+/i,"").trim(),f=w(o);f&&C(f)&&(S=o)}}catch{}return t.apply(this,[i,a])}}}catch{}async function B(n,t,i){if(!n)return null;try{const o=`${t?t.replace(/\/+$/,""):"https://keycloak-zenity.zup.com.br/auth/realms/zupinternal"}/protocol/openid-connect/token`,f=i||"realwave_zupper_csp_ui",p=new URLSearchParams({grant_type:"refresh_token",refresh_token:n.trim(),client_id:f}),u=await fetch(o,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded",Accept:"*/*"},credentials:"omit",body:p.toString()});if(u.ok){const s=await u.json();if(s.access_token){S=s.access_token,s.refresh_token&&(z=s.refresh_token);try{for(let e=0;e<sessionStorage.length;e++){const r=sessionStorage.key(e);if(r&&r.startsWith("oidc.user:")){const c=JSON.parse(sessionStorage.getItem(r)||"{}");c.access_token=s.access_token,s.refresh_token&&(c.refresh_token=s.refresh_token),s.id_token&&(c.id_token=s.id_token),s.expires_in&&(c.expires_at=Math.floor(Date.now()/1e3)+s.expires_in),sessionStorage.setItem(r,JSON.stringify(c))}}}catch{}return s.access_token}}}catch{}return null}async function F(){return typeof window>"u"||!document.body?null:new Promise(n=>{try{const t=document.createElement("iframe");t.style.display="none",t.id="zup-logbook-sso-iframe";const i=encodeURIComponent(window.location.origin+window.location.pathname),a=Math.random().toString(36).substring(2),o=Math.random().toString(36).substring(2),f=`https://keycloak-zenity.zup.com.br/auth/realms/zupinternal/protocol/openid-connect/auth?client_id=realwave_zupper_csp_ui&redirect_uri=${i}&response_mode=fragment&response_type=code%20id_token%20token&scope=openid&prompt=none&state=${a}&nonce=${o}`;let p=null;const u=()=>{p&&clearTimeout(p);try{t.parentNode&&t.parentNode.removeChild(t)}catch{}};p=setTimeout(()=>{u(),n(null)},3e3),t.onload=()=>{try{const s=t.contentWindow?.location.href||"";if(s.includes("access_token=")){const e=s.split("#")[1]||s.split("?")[1]||"",r=new URLSearchParams(e),c=r.get("access_token"),m=r.get("refresh_token");if(c){S=c,m&&(z=m),u(),n(c);return}}}catch{}},t.src=f,document.body.appendChild(t)}catch{n(null)}})}async function $(n=!1){const t=Date.now(),i=15e3;let a=null;if(z){const e=w(z);a={token:z,iss:e?.iss,azp:e?.azp}}const o=window;if(o?.keycloak)try{if(typeof o.keycloak.updateToken=="function"&&await o.keycloak.updateToken(n?999999:30),o.keycloak.refreshToken&&!a){const e=w(o.keycloak.refreshToken);a={token:o.keycloak.refreshToken,iss:e?.iss,azp:e?.azp}}if(o.keycloak.token){const e=w(o.keycloak.token);if(e&&C(e)&&(!n&&e.exp>t+i))return o.keycloak.token}}catch{}if(!n&&S){const e=w(S);if(e&&C(e)&&e.exp>t+i)return S}const f=[sessionStorage,localStorage];for(const e of f)try{for(let r=0;r<e.length;r++){const c=e.key(r);if(c&&c.startsWith("oidc.user:")){const m=JSON.parse(e.getItem(c)||"{}");if(m.refresh_token&&!a){const y=w(m.refresh_token);a={token:m.refresh_token,iss:y?.iss,azp:y?.azp}}if(m.access_token){const y=w(m.access_token);if(y&&C(y)&&(!n&&y.exp>t+i))return m.access_token}}}}catch{}const p=[],u=e=>{if(!e||typeof e!="string")return;const r=e.match(/eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+/g);if(r)for(const c of r){const m=w(c);m&&(q(m)?a||(a={token:c,iss:m.iss,azp:m.azp}):C(m)&&p.push(m))}};try{for(let e=0;e<sessionStorage.length;e++){const r=sessionStorage.key(e);r&&u(sessionStorage.getItem(r)||"")}}catch{}try{for(let e=0;e<localStorage.length;e++){const r=localStorage.key(e);r&&u(localStorage.getItem(r)||"")}}catch{}try{u(document.cookie)}catch{}for(const e of["keycloak","_keycloak","kc","auth","currentUser","__PRELOADED_STATE__"])try{o[e]&&u(typeof o[e]=="string"?o[e]:JSON.stringify(o[e]))}catch{}if(!n&&p.length>0){const e=p.filter(r=>r.exp>t+i);if(e.length>0)return e.sort((r,c)=>{const m=r.typ==="bearer"?1:0,y=c.typ==="bearer"?1:0;return m!==y?y-m:c.exp-r.exp}),e[0].token}if(a){const e=await B(a.token,a.iss,a.azp);if(e)return e}const s=await F();return s||(p.length>0?(p.sort((e,r)=>r.exp-e.exp),p[0].token):null)}function O(){const n=document.getElementById(R);if(n){n.style.display==="none"?(n.style.display="block",setTimeout(()=>{n.shadowRoot?.querySelector("textarea")?.focus()},50)):n.style.display="none";return}const t=document.createElement("div");t.id=R,t.style.position="fixed",t.style.top="50%",t.style.left="50%",t.style.transform="translate(-50%, -50%)",t.style.width="380px",t.style.height="380px",t.style.maxWidth="90vw",t.style.maxHeight="90vh",t.style.zIndex="2147483647",t.style.display="block",t.style.boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 0 100vmax rgba(0, 0, 0, 0.45)",t.style.borderRadius="12px",t.style.fontFamily='-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';const i=t.attachShadow({mode:"open"}),a=document.createElement("style");a.textContent=`
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
      padding: 16px;
      gap: 10px;
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
  `,i.appendChild(a);const o=document.createElement("div");o.className="modal",o.innerHTML=`
    <div class="header">
      <span class="title">Zup Logbook</span>
      <button class="close-btn" type="button" title="Fechar">✕</button>
    </div>
    <textarea placeholder="Cole o Markdown ou texto do relato aqui..." autofocus></textarea>
    <div class="status"></div>
    <button class="submit-btn" type="button" disabled>Enviar</button>
  `,i.appendChild(o);const f=o.querySelector(".close-btn"),p=o.querySelector("textarea"),u=o.querySelector(".status"),s=o.querySelector(".submit-btn"),e=()=>{t.style.display="none",window.removeEventListener("pointerdown",r,!0)},r=l=>{l.composedPath().includes(t)||e()};f.onclick=l=>{l.stopPropagation(),e()};const c=(l,h)=>{u.className=`status ${l}`,u.textContent=h},m=()=>{u.className="status",u.textContent=""};p.oninput=()=>{s.disabled=!p.value.trim(),m()};const y=async()=>{const l=p.value.trim();if(!l){c("error","Cole o relato antes de enviar.");return}let h=null;try{h=JSON.parse(l)}catch{h=H(l)}if(!h||!h.title&&!h.content){c("error","Não foi possível identificar o título ou conteúdo do relato.");return}s.disabled=!0,s.textContent="Autenticando...",m();let g=await $();if(!g){c("error","Token de autenticação (Access Token) não encontrado na página."),s.textContent="Enviar",s.disabled=!p.value.trim();return}s.textContent="Enviando...";const k=async d=>{const b=await fetch("https://apiznt.zenity.zup.com.br/dune/v1/entry",{method:"POST",headers:{"Content-Type":"application/json",Accept:"*/*",authorization:`Bearer ${d}`},credentials:"omit",body:JSON.stringify(h)}),x=await b.text();let _={};try{_=JSON.parse(x)}catch{_={text:x}}return{ok:b.ok,status:b.status,data:_,text:x}};try{let d=await k(g);if(!d.ok&&(d.status===401||d.status===403||d.text.includes("not authorized"))){s.textContent="Renovando sessão...";const b=await $(!0);b&&b!==g&&(g=b,s.textContent="Reenviando...",d=await k(g))}if(d.ok)c("success",`Relato${d.data?.id?` #${d.data.id}`:""} enviado com sucesso!`),p.value="",s.disabled=!0;else{const b=d.data?.message||d.data?.Message||d.data?.error||d.text||`Status HTTP ${d.status}`;c("error",`Falha (${d.status}): ${b}`)}}catch(d){c("error",`Erro de conexão: ${d.message}`)}finally{s.textContent="Enviar",s.disabled=!p.value.trim()}};s.onclick=l=>{l.stopPropagation(),y()},p.onkeydown=l=>{(l.ctrlKey||l.metaKey)&&l.key==="Enter"&&(l.preventDefault(),y()),l.key==="Escape"&&e()},document.body.appendChild(t),setTimeout(()=>{p.focus(),window.addEventListener("pointerdown",r,!0)},100)}O(),P.mountZupLogbook=O,Object.defineProperty(P,Symbol.toStringTag,{value:"Module"})})(this.ZupLogbook=this.ZupLogbook||{});
