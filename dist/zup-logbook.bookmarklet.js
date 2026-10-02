(function(z){"use strict";const P="zup-logbook-host",N=[{id:1,name:"Colaboramos de verdade"},{id:2,name:"Nosso compromisso é coletivo"},{id:3,name:"Vamos direto ao ponto"},{id:4,name:"Focamos no cliente"},{id:5,name:"Entregamos valor de ponta a ponta"},{id:6,name:"Decidimos com contexto"},{id:7,name:"Protagonizamos o futuro"},{id:8,name:"Tomamos a iniciativa"},{id:9,name:"Entrega soluções técnicas"},{id:10,name:"Aplicabilidade de novos conhecimentos técnicos"},{id:11,name:"Linguagem de Programação [Java, Go, Kotlin, C#, Python, Swift, etc ]"},{id:12,name:"Algoritmos e Estrutura de Dados"},{id:13,name:"Fluxo de trabalho/Workflow"},{id:14,name:"Pipeline CI/CD"},{id:15,name:"APIs"},{id:16,name:"Segurança"},{id:17,name:"Arquitetura de soluções"},{id:18,name:"Redes (VPC, CDN, DNS, etc)"},{id:19,name:"Infra / IaC (Terraform, CloudFormation, etc)"},{id:23,name:"StackSpot AI"},{id:25,name:"Computing services (EC2, ECS, EKS, Fargate, Lambda, etc)"},{id:26,name:"Observabilidade e Monitoramento"},{id:27,name:"SQL / noSQL"},{id:28,name:"Cache"},{id:29,name:"Inteligencia Artificial"},{id:40,name:"Arquitetura de Solução"},{id:41,name:"Qualidade"},{id:50,name:"Testes Automatizados"},{id:52,name:"Log, Debug, Performance"},{id:53,name:"Versionamento"},{id:54,name:"Code Review"},{id:59,name:"Arquitetura"},{id:62,name:"CI/CD"},{id:72,name:"Bancos de dados"},{id:80,name:"Codificação"},{id:83,name:"Arquitetura de Sistemas"},{id:86,name:"DevOps e Observabilidade"},{id:97,name:"Boas Práticas de programação e automação"},{id:106,name:"Linux"}];function T(a){return a.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]/g,"")}function I(a){const t=T(a);return t?N.find(e=>{const o=T(e.name);return o===t||o.includes(t)||t.includes(o)})||{id:0,name:a.trim()}:null}function $(a){let t=a.trim().replace(/^```[a-z0-9_-]*\s*/i,"").replace(/\s*```$/,"").replace(/\[cite:[^\]]*\]/gi,"").replace(/\[\d+(?:,\s*\d+)*\]/g,"").trim();if(/^##+\s+/m.test(t)){let n="";const i=t.match(/^#\s*(?:t[ií]tulo:\s*)?(.+)$/mi)||t.match(/^t[ií]tulo:\s*(.+)$/mi);i?n=i[1].replace(/^t[ií]tulo:\s*/i,"").trim():n=t.split(/\r?\n/)[0]?.replace(/^[#\s*_-]+/,"").replace(/^t[ií]tulo:\s*/i,"").trim()||"";const f=/^##+\s+(.+)$/gm;let c;const l=[];for(;(c=f.exec(t))!==null;)l.push({header:c[1].trim(),index:c.index,end:c.index+c[0].length});const g=[],m=[],E=[];for(let w=0;w<l.length;w++){const A=l[w],O=w+1<l.length?l[w+1].index:t.length,C=t.slice(A.end,O).trim();if(/compet[eê]ncias/i.test(A.header)){const _=C.split(/\r?\n/).map(L=>L.replace(/^[-*•\d.)\s]+/,"").trim()).filter(Boolean);for(const L of _){const D=I(L);D&&g.push(D)}continue}let S=A.header;S.endsWith(":")||(S+=":"),m.push({type:"paragraph",children:[{text:S,bold:!0}]}),C?(m.push({type:"paragraph",children:[{text:C}]}),E.push(`${S}
${C}`)):E.push(S),m.push({type:"paragraph",children:[{text:"",bold:!0}]})}return m.length>0&&m[m.length-1].children?.[0]?.text===""&&m.pop(),{title:n,formattedContent:m,content:E.join(`

`),isPerformanceReview:!0,metadata:{templateFor:/lideran[cç]a/i.test(t)&&!/n[aã]o\s*lideran[cç]a/i.test(t)?"LEADERSHIP":"NON_LEADERSHIP"},competences:g}}let e=t;const o=e.match(/compet[eê]ncias:\s*([\s\S]*)$/i);let s="";o&&(s=o[1].trim(),e=e.slice(0,o.index).trim());let r="";const y=e.search(/descri[cç][aã]o:/i);y!==-1?(r=e.slice(0,y).replace(/t[ií]tulo:\s*/i,"").trim(),e=e.slice(y).replace(/descri[cç][aã]o:\s*/i,"").trim()):r=e.split(/\r?\n/)[0]?.replace(/t[ií]tulo:\s*/i,"").trim()||"",r=r.split(/\r?\n/)[0]?.replace(/^t[ií]tulo:\s*/i,"").trim()||"";const h=/(Resultado\/impacto(?:\s*\(momento atual\))?:?|Atitude e comportamento:?|Conhecimento T[eé]cnico da Pr[aá]tica:?|Aprendizado Tech:?|Expectativas de Entregas:?|Coment[aá]rios Adicionais(?: e Feedback Recebido)?:?)/gi,p=[];let b;for(;(b=h.exec(e))!==null;)p.push({index:b.index,header:b[0],end:b.index+b[0].length});const u=[],x=[];for(let n=0;n<p.length;n++){const i=p[n],f=n+1<p.length?p[n+1].index:e.length;let c=e.slice(i.end,f).trim().replace(/^-+\s*|\s*-+$/g,"").trim(),l=i.header.trim();l.endsWith(":")||(l+=":"),u.push({type:"paragraph",children:[{text:l,bold:!0}]}),c?(u.push({type:"paragraph",children:[{text:c}]}),x.push(`${l}
${c}`)):x.push(l),n<p.length-1&&u.push({type:"paragraph",children:[{text:"",bold:!0}]})}const k=[];if(s){const n=s.split(/[\r\n,]+/).map(i=>i.replace(/^[-*•\d.)\s]+/,"").trim()).filter(Boolean);for(const i of n){const f=I(i);f&&k.push(f)}}return{title:r,formattedContent:u,content:x.join(`

`),isPerformanceReview:!0,metadata:{templateFor:/lideran[cç]a/i.test(t)&&!/n[aã]o\s*lideran[cç]a/i.test(t)?"LEADERSHIP":"NON_LEADERSHIP"},competences:k}}let v=null;try{if(typeof window<"u"){const a=window.fetch;window.fetch=async function(...d){try{const e=d[1];let o=null;if(e?.headers)if(e.headers instanceof Headers)o=e.headers.get("Authorization")||e.headers.get("authorization");else if(Array.isArray(e.headers)){const s=e.headers.find(([r])=>r.toLowerCase()==="authorization");s&&(o=s[1])}else typeof e.headers=="object"&&(o=e.headers.Authorization||e.headers.authorization);if(o&&o.toLowerCase().startsWith("bearer ")){const s=o.replace(/^bearer\s+/i,"").trim();s.length>20&&(v=s)}}catch{}return a.apply(this,d)};const t=XMLHttpRequest.prototype.setRequestHeader;XMLHttpRequest.prototype.setRequestHeader=function(d,e){try{if(d?.toLowerCase()==="authorization"&&e?.toLowerCase().startsWith("bearer ")){const o=e.replace(/^bearer\s+/i,"").trim();o.length>20&&(v=o)}}catch{}return t.apply(this,[d,e])}}}catch{}function H(){if(v)return v;if(typeof window>"u")return null;const a=window;if(a.keycloak?.token)return a.keycloak.token;const t=[],d=e=>{if(!e||typeof e!="string")return;const o=e.match(/eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+/g);if(o)for(const s of o)try{const r=JSON.parse(atob(s.split(".")[1].replace(/-/g,"+").replace(/_/g,"/")));t.push({token:s,exp:r.exp?r.exp*1e3:1/0})}catch{}};try{for(let e=0;e<sessionStorage.length;e++){const o=sessionStorage.key(e);o&&d(sessionStorage.getItem(o)||"")}}catch{}try{for(let e=0;e<localStorage.length;e++){const o=localStorage.key(e);o&&d(localStorage.getItem(o)||"")}}catch{}try{d(document.cookie)}catch{}for(const e of["keycloak","_keycloak","kc","auth","currentUser","__PRELOADED_STATE__"])try{a[e]&&d(typeof a[e]=="string"?a[e]:JSON.stringify(a[e]))}catch{}if(t.length>0){const e=Date.now(),o=t.filter(s=>s.exp>e);return o.length>0?o[0].token:t[0].token}return null}function R(){const a=document.getElementById(P);if(a){a.style.display==="none"?(a.style.display="block",setTimeout(()=>{a.shadowRoot?.querySelector("textarea")?.focus()},50)):a.style.display="none";return}const t=document.createElement("div");t.id=P,t.style.position="fixed",t.style.top="50%",t.style.left="50%",t.style.transform="translate(-50%, -50%)",t.style.width="380px",t.style.height="380px",t.style.maxWidth="90vw",t.style.maxHeight="90vh",t.style.zIndex="2147483647",t.style.display="block",t.style.boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 0 100vmax rgba(0, 0, 0, 0.45)",t.style.borderRadius="12px",t.style.fontFamily='-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';const d=t.attachShadow({mode:"open"}),e=document.createElement("style");e.textContent=`
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
  `,d.appendChild(e);const o=document.createElement("div");o.className="modal",o.innerHTML=`
    <div class="header">
      <span class="title">Zup Logbook</span>
      <button class="close-btn" type="button" title="Fechar">✕</button>
    </div>
    <textarea placeholder="Cole o Markdown ou texto do relato aqui..." autofocus></textarea>
    <div class="status"></div>
    <button class="submit-btn" type="button" disabled>Enviar</button>
  `,d.appendChild(o);const s=o.querySelector(".close-btn"),r=o.querySelector("textarea"),y=o.querySelector(".status"),h=o.querySelector(".submit-btn"),p=()=>{t.style.display="none",window.removeEventListener("pointerdown",b,!0)},b=n=>{n.composedPath().includes(t)||p()};s.onclick=n=>{n.stopPropagation(),p()};const u=(n,i)=>{y.className=`status ${n}`,y.textContent=i},x=()=>{y.className="status",y.textContent=""};r.oninput=()=>{h.disabled=!r.value.trim(),x()};const k=async()=>{const n=r.value.trim();if(!n){u("error","Cole o relato antes de enviar.");return}let i=null;try{i=JSON.parse(n)}catch{i=$(n)}if(!i||!i.title&&!i.content){u("error","Não foi possível identificar o título ou conteúdo do relato.");return}const f=H();if(!f){u("error","Token de autenticação não encontrado na página.");return}h.disabled=!0,h.textContent="Enviando...",x();try{const c=await fetch("https://apiznt.zenity.zup.com.br/dune/v1/entry",{method:"POST",headers:{"Content-Type":"application/json",Accept:"*/*",authorization:`Bearer ${f}`},credentials:"omit",body:JSON.stringify(i)}),l=await c.text();let g={};try{g=JSON.parse(l)}catch{g={text:l}}if(c.ok)u("success",`Relato${g?.id?` #${g.id}`:""} enviado com sucesso!`),r.value="",h.disabled=!0;else{const m=g?.message||g?.error||l||`Status HTTP ${c.status}`;u("error",`Falha (${c.status}): ${m}`)}}catch(c){u("error",`Erro de conexão: ${c.message}`)}finally{h.textContent="Enviar",h.disabled=!r.value.trim()}};h.onclick=n=>{n.stopPropagation(),k()},r.onkeydown=n=>{(n.ctrlKey||n.metaKey)&&n.key==="Enter"&&(n.preventDefault(),k()),n.key==="Escape"&&p()},document.body.appendChild(t),setTimeout(()=>{r.focus(),window.addEventListener("pointerdown",b,!0)},100)}R(),z.mountZupLogbook=R,Object.defineProperty(z,Symbol.toStringTag,{value:"Module"})})(this.ZupLogbook=this.ZupLogbook||{});
