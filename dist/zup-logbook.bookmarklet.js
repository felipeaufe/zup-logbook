(function(w){"use strict";const S="zup-logbook-host",E=[{id:1,name:"Colaboramos de verdade"},{id:2,name:"Nosso compromisso é coletivo"},{id:3,name:"Vamos direto ao ponto"},{id:4,name:"Focamos no cliente"},{id:5,name:"Entregamos valor de ponta a ponta"},{id:6,name:"Decidimos com contexto"},{id:7,name:"Protagonizamos o futuro"},{id:8,name:"Tomamos a iniciativa"},{id:9,name:"Entrega soluções técnicas"},{id:10,name:"Aplicabilidade de novos conhecimentos técnicos"},{id:11,name:"Linguagem de Programação [Java, Go, Kotlin, C#, Python, Swift, etc ]"},{id:12,name:"Algoritmos e Estrutura de Dados"},{id:13,name:"Fluxo de trabalho/Workflow"},{id:14,name:"Pipeline CI/CD"},{id:15,name:"APIs"},{id:16,name:"Segurança"},{id:17,name:"Arquitetura de soluções"},{id:18,name:"Redes (VPC, CDN, DNS, etc)"},{id:19,name:"Infra / IaC (Terraform, CloudFormation, etc)"},{id:23,name:"StackSpot AI"},{id:25,name:"Computing services (EC2, ECS, EKS, Fargate, Lambda, etc)"},{id:26,name:"Observabilidade e Monitoramento"},{id:27,name:"SQL / noSQL"},{id:28,name:"Cache"},{id:29,name:"Inteligencia Artificial"},{id:40,name:"Arquitetura de Solução"},{id:41,name:"Qualidade"},{id:50,name:"Testes Automatizados"},{id:52,name:"Log, Debug, Performance"},{id:53,name:"Versionamento"},{id:54,name:"Code Review"},{id:59,name:"Arquitetura"},{id:62,name:"CI/CD"},{id:72,name:"Bancos de dados"},{id:80,name:"Codificação"},{id:83,name:"Arquitetura de Sistemas"},{id:86,name:"DevOps e Observabilidade"},{id:97,name:"Boas Práticas de programação e automação"},{id:106,name:"Linux"}];function v(a){return a.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]/g,"")}function L(a){const t=v(a);return t?E.find(e=>{const o=v(e.name);return o===t||o.includes(t)||t.includes(o)})||{id:0,name:a.trim()}:null}function z(a){const t=a.trim(),i=t.search(/descri[cç][aã]o:/i),e=t.search(/compet[eê]ncias:/i);let o="";i!==-1?o=t.slice(0,i).replace(/t[ií]tulo:\s*/i,"").trim().split(/\r?\n/).map(u=>u.trim()).filter(Boolean)[0]||"":o=t.split(/\r?\n/)[0]?.replace(/t[ií]tulo:\s*/i,"").trim()||"";let s="";i!==-1&&(s=e!==-1?t.slice(i,e):t.slice(i),s=s.replace(/descri[cç][aã]o:\s*/i,"").trim());let r="";e!==-1&&(r=t.slice(e).replace(/compet[eê]ncias:\s*/i,"").trim());const m=s?s.split(/[\r\n]+\s*-{3,}\s*[\r\n]+/):[],d=[],f=[];for(let c=0;c<m.length;c++){const p=m[c].trim();if(!p)continue;const u=p.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);if(!u.length)continue;const n=u[0],l=u.slice(1).join(`
`);d.push({type:"paragraph",children:[{text:n,bold:!0}]}),l?(d.push({type:"paragraph",children:[{text:l}]}),f.push(`${n}
${l}`)):f.push(n),c<m.length-1&&d.push({type:"paragraph",children:[{text:"",bold:!0}]})}const b=[];if(r){const c=r.split(/[\r\n]+/).map(p=>p.replace(/^[-*•\d.)\s]+/,"").trim()).filter(Boolean);for(const p of c){const u=L(p);u&&b.push(u)}}return{title:o,formattedContent:d,content:f.join(`

`),isPerformanceReview:!0,metadata:{templateFor:/lideran[cç]a/i.test(t)&&!/n[aã]o\s*lideran[cç]a/i.test(t)?"LEADERSHIP":"NON_LEADERSHIP"},competences:b}}let g=null;try{if(typeof window<"u"){const a=window.fetch;window.fetch=async function(...i){try{const e=i[1];let o=null;if(e?.headers)if(e.headers instanceof Headers)o=e.headers.get("Authorization")||e.headers.get("authorization");else if(Array.isArray(e.headers)){const s=e.headers.find(([r])=>r.toLowerCase()==="authorization");s&&(o=s[1])}else typeof e.headers=="object"&&(o=e.headers.Authorization||e.headers.authorization);if(o&&o.toLowerCase().startsWith("bearer ")){const s=o.replace(/^bearer\s+/i,"").trim();s.length>20&&(g=s)}}catch{}return a.apply(this,i)};const t=XMLHttpRequest.prototype.setRequestHeader;XMLHttpRequest.prototype.setRequestHeader=function(i,e){try{if(i?.toLowerCase()==="authorization"&&e?.toLowerCase().startsWith("bearer ")){const o=e.replace(/^bearer\s+/i,"").trim();o.length>20&&(g=o)}}catch{}return t.apply(this,[i,e])}}}catch{}function A(){if(g)return g;if(typeof window>"u")return null;const a=window;if(a.keycloak?.token)return a.keycloak.token;const t=[],i=e=>{if(!e||typeof e!="string")return;const o=e.match(/eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+/g);if(o)for(const s of o)try{const r=JSON.parse(atob(s.split(".")[1].replace(/-/g,"+").replace(/_/g,"/")));t.push({token:s,exp:r.exp?r.exp*1e3:1/0})}catch{}};try{for(let e=0;e<sessionStorage.length;e++){const o=sessionStorage.key(e);o&&i(sessionStorage.getItem(o)||"")}}catch{}try{for(let e=0;e<localStorage.length;e++){const o=localStorage.key(e);o&&i(localStorage.getItem(o)||"")}}catch{}try{i(document.cookie)}catch{}for(const e of["keycloak","_keycloak","kc","auth","currentUser","__PRELOADED_STATE__"])try{a[e]&&i(typeof a[e]=="string"?a[e]:JSON.stringify(a[e]))}catch{}if(t.length>0){const e=Date.now(),o=t.filter(s=>s.exp>e);return o.length>0?o[0].token:t[0].token}return null}function C(){const a=document.getElementById(S);if(a){a.style.display==="none"?(a.style.display="block",setTimeout(()=>{a.shadowRoot?.querySelector("textarea")?.focus()},50)):a.style.display="none";return}const t=document.createElement("div");t.id=S,t.style.position="fixed",t.style.top="50%",t.style.left="50%",t.style.transform="translate(-50%, -50%)",t.style.width="380px",t.style.height="380px",t.style.maxWidth="90vw",t.style.maxHeight="90vh",t.style.zIndex="2147483647",t.style.display="block",t.style.boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 0 100vmax rgba(0, 0, 0, 0.45)",t.style.borderRadius="12px",t.style.fontFamily='-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';const i=t.attachShadow({mode:"open"}),e=document.createElement("style");e.textContent=`
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
  `,i.appendChild(e);const o=document.createElement("div");o.className="modal",o.innerHTML=`
    <div class="header">
      <span class="title">Zup Logbook</span>
      <button class="close-btn" type="button" title="Fechar">✕</button>
    </div>
    <textarea placeholder="Cole o texto ou JSON do relato aqui..." autofocus></textarea>
    <div class="status"></div>
    <button class="submit-btn" type="button" disabled>Enviar</button>
  `,i.appendChild(o);const s=o.querySelector(".close-btn"),r=o.querySelector("textarea"),m=o.querySelector(".status"),d=o.querySelector(".submit-btn"),f=()=>{t.style.display="none",window.removeEventListener("pointerdown",b,!0)},b=n=>{n.composedPath().includes(t)||f()};s.onclick=n=>{n.stopPropagation(),f()};const c=(n,l)=>{m.className=`status ${n}`,m.textContent=l},p=()=>{m.className="status",m.textContent=""};r.oninput=()=>{d.disabled=!r.value.trim(),p()};const u=async()=>{const n=r.value.trim();if(!n){c("error","Cole o relato antes de enviar.");return}let l=null;try{l=JSON.parse(n)}catch{l=z(n)}if(!l||!l.title&&!l.content){c("error","Não foi possível identificar o título ou conteúdo do relato.");return}const x=A();if(!x){c("error","Token de autenticação não encontrado na página.");return}d.disabled=!0,d.textContent="Enviando...",p();try{const h=await fetch("https://apiznt.zenity.zup.com.br/dune/v1/entry",{method:"POST",headers:{"Content-Type":"application/json",Accept:"*/*",authorization:`Bearer ${x}`},credentials:"omit",body:JSON.stringify(l)}),k=await h.text();let y={};try{y=JSON.parse(k)}catch{y={text:k}}if(h.ok)c("success",`Relato${y?.id?` #${y.id}`:""} enviado com sucesso!`),r.value="",d.disabled=!0;else{const T=y?.message||y?.error||k||`Status HTTP ${h.status}`;c("error",`Falha (${h.status}): ${T}`)}}catch(h){c("error",`Erro de conexão: ${h.message}`)}finally{d.textContent="Enviar",d.disabled=!r.value.trim()}};d.onclick=n=>{n.stopPropagation(),u()},r.onkeydown=n=>{(n.ctrlKey||n.metaKey)&&n.key==="Enter"&&(n.preventDefault(),u()),n.key==="Escape"&&f()},document.body.appendChild(t),setTimeout(()=>{r.focus(),window.addEventListener("pointerdown",b,!0)},100)}C(),w.mountZupLogbook=C,Object.defineProperty(w,Symbol.toStringTag,{value:"Module"})})(this.ZupLogbook=this.ZupLogbook||{});
