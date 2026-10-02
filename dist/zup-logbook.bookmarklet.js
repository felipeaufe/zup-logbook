(function(S){"use strict";const w="zup-logbook-host",E=[{id:1,name:"Colaboramos de verdade"},{id:2,name:"Nosso compromisso é coletivo"},{id:3,name:"Vamos direto ao ponto"},{id:4,name:"Focamos no cliente"},{id:5,name:"Entregamos valor de ponta a ponta"},{id:6,name:"Decidimos com contexto"},{id:7,name:"Protagonizamos o futuro"},{id:8,name:"Tomamos a iniciativa"},{id:9,name:"Entrega soluções técnicas"},{id:10,name:"Aplicabilidade de novos conhecimentos técnicos"},{id:11,name:"Linguagem de Programação [Java, Go, Kotlin, C#, Python, Swift, etc ]"},{id:12,name:"Algoritmos e Estrutura de Dados"},{id:13,name:"Fluxo de trabalho/Workflow"},{id:14,name:"Pipeline CI/CD"},{id:15,name:"APIs"},{id:16,name:"Segurança"},{id:17,name:"Arquitetura de soluções"},{id:18,name:"Redes (VPC, CDN, DNS, etc)"},{id:19,name:"Infra / IaC (Terraform, CloudFormation, etc)"},{id:23,name:"StackSpot AI"},{id:25,name:"Computing services (EC2, ECS, EKS, Fargate, Lambda, etc)"},{id:26,name:"Observabilidade e Monitoramento"},{id:27,name:"SQL / noSQL"},{id:28,name:"Cache"},{id:29,name:"Inteligencia Artificial"},{id:40,name:"Arquitetura de Solução"},{id:41,name:"Qualidade"},{id:50,name:"Testes Automatizados"},{id:52,name:"Log, Debug, Performance"},{id:53,name:"Versionamento"},{id:54,name:"Code Review"},{id:59,name:"Arquitetura"},{id:62,name:"CI/CD"},{id:72,name:"Bancos de dados"},{id:80,name:"Codificação"},{id:83,name:"Arquitetura de Sistemas"},{id:86,name:"DevOps e Observabilidade"},{id:97,name:"Boas Práticas de programação e automação"},{id:106,name:"Linux"}];function v(n){return n.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]/g,"")}function z(n){const e=v(n);return e?E.find(t=>{const o=v(t.name);return o===e||o.includes(e)||e.includes(o)})||{id:0,name:n.trim()}:null}function L(n){let e=n.replace(/^```[a-z]*\s*/i,"").replace(/\s*```$/,"").trim();const i=e.match(/compet[eê]ncias:\s*([\s\S]*)$/i);let t="";i&&(t=i[1].trim(),e=e.slice(0,i.index).trim());let o="";const r=e.search(/descri[cç][aã]o:/i);r!==-1?(o=e.slice(0,r).replace(/t[ií]tulo:\s*/i,"").trim(),e=e.slice(r).replace(/descri[cç][aã]o:\s*/i,"").trim()):o=e.split(/\r?\n/)[0]?.replace(/t[ií]tulo:\s*/i,"").trim()||"",o=o.split(/\r?\n/)[0]?.trim()||"";const c=/(Resultado\/impacto(?:\s*\(momento atual\))?:?|Atitude e comportamento:?|Conhecimento T[eé]cnico da Pr[aá]tica:?|Aprendizado Tech:?|Expectativas de Entregas:?|Coment[aá]rios Adicionais(?: e Feedback Recebido)?:?)/gi,l=[];let d;for(;(d=c.exec(e))!==null;)l.push({index:d.index,header:d[0],end:d.index+d[0].length});const f=[],g=[];for(let u=0;u<l.length;u++){const m=l[u],a=u+1<l.length?l[u+1].index:e.length;let s=e.slice(m.end,a).trim();s=s.replace(/^-+\s*|\s*-+$/g,"").trim();let h=m.header.trim();h.endsWith(":")||(h+=":"),f.push({type:"paragraph",children:[{text:h,bold:!0}]}),s?(f.push({type:"paragraph",children:[{text:s}]}),g.push(`${h}
${s}`)):g.push(h),u<l.length-1&&f.push({type:"paragraph",children:[{text:"",bold:!0}]})}const p=[];if(t){const u=t.split(/[\r\n,]+/).map(m=>m.replace(/^[-*•\d.)\s]+/,"").trim()).filter(Boolean);for(const m of u){const a=z(m);a&&p.push(a)}}return{title:o,formattedContent:f,content:g.join(`

`),isPerformanceReview:!0,metadata:{templateFor:/lideran[cç]a/i.test(n)&&!/n[aã]o\s*lideran[cç]a/i.test(n)?"LEADERSHIP":"NON_LEADERSHIP"},competences:p}}let x=null;try{if(typeof window<"u"){const n=window.fetch;window.fetch=async function(...i){try{const t=i[1];let o=null;if(t?.headers)if(t.headers instanceof Headers)o=t.headers.get("Authorization")||t.headers.get("authorization");else if(Array.isArray(t.headers)){const r=t.headers.find(([c])=>c.toLowerCase()==="authorization");r&&(o=r[1])}else typeof t.headers=="object"&&(o=t.headers.Authorization||t.headers.authorization);if(o&&o.toLowerCase().startsWith("bearer ")){const r=o.replace(/^bearer\s+/i,"").trim();r.length>20&&(x=r)}}catch{}return n.apply(this,i)};const e=XMLHttpRequest.prototype.setRequestHeader;XMLHttpRequest.prototype.setRequestHeader=function(i,t){try{if(i?.toLowerCase()==="authorization"&&t?.toLowerCase().startsWith("bearer ")){const o=t.replace(/^bearer\s+/i,"").trim();o.length>20&&(x=o)}}catch{}return e.apply(this,[i,t])}}}catch{}function A(){if(x)return x;if(typeof window>"u")return null;const n=window;if(n.keycloak?.token)return n.keycloak.token;const e=[],i=t=>{if(!t||typeof t!="string")return;const o=t.match(/eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+/g);if(o)for(const r of o)try{const c=JSON.parse(atob(r.split(".")[1].replace(/-/g,"+").replace(/_/g,"/")));e.push({token:r,exp:c.exp?c.exp*1e3:1/0})}catch{}};try{for(let t=0;t<sessionStorage.length;t++){const o=sessionStorage.key(t);o&&i(sessionStorage.getItem(o)||"")}}catch{}try{for(let t=0;t<localStorage.length;t++){const o=localStorage.key(t);o&&i(localStorage.getItem(o)||"")}}catch{}try{i(document.cookie)}catch{}for(const t of["keycloak","_keycloak","kc","auth","currentUser","__PRELOADED_STATE__"])try{n[t]&&i(typeof n[t]=="string"?n[t]:JSON.stringify(n[t]))}catch{}if(e.length>0){const t=Date.now(),o=e.filter(r=>r.exp>t);return o.length>0?o[0].token:e[0].token}return null}function C(){const n=document.getElementById(w);if(n){n.style.display==="none"?(n.style.display="block",setTimeout(()=>{n.shadowRoot?.querySelector("textarea")?.focus()},50)):n.style.display="none";return}const e=document.createElement("div");e.id=w,e.style.position="fixed",e.style.top="50%",e.style.left="50%",e.style.transform="translate(-50%, -50%)",e.style.width="380px",e.style.height="380px",e.style.maxWidth="90vw",e.style.maxHeight="90vh",e.style.zIndex="2147483647",e.style.display="block",e.style.boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 0 100vmax rgba(0, 0, 0, 0.45)",e.style.borderRadius="12px",e.style.fontFamily='-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';const i=e.attachShadow({mode:"open"}),t=document.createElement("style");t.textContent=`
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
  `,i.appendChild(t);const o=document.createElement("div");o.className="modal",o.innerHTML=`
    <div class="header">
      <span class="title">Zup Logbook</span>
      <button class="close-btn" type="button" title="Fechar">✕</button>
    </div>
    <textarea placeholder="Cole o texto ou JSON do relato aqui..." autofocus></textarea>
    <div class="status"></div>
    <button class="submit-btn" type="button" disabled>Enviar</button>
  `,i.appendChild(o);const r=o.querySelector(".close-btn"),c=o.querySelector("textarea"),l=o.querySelector(".status"),d=o.querySelector(".submit-btn"),f=()=>{e.style.display="none",window.removeEventListener("pointerdown",g,!0)},g=a=>{a.composedPath().includes(e)||f()};r.onclick=a=>{a.stopPropagation(),f()};const p=(a,s)=>{l.className=`status ${a}`,l.textContent=s},u=()=>{l.className="status",l.textContent=""};c.oninput=()=>{d.disabled=!c.value.trim(),u()};const m=async()=>{const a=c.value.trim();if(!a){p("error","Cole o relato antes de enviar.");return}let s=null;try{s=JSON.parse(a)}catch{s=L(a)}if(!s||!s.title&&!s.content){p("error","Não foi possível identificar o título ou conteúdo do relato.");return}const h=A();if(!h){p("error","Token de autenticação não encontrado na página.");return}d.disabled=!0,d.textContent="Enviando...",u();try{const y=await fetch("https://apiznt.zenity.zup.com.br/dune/v1/entry",{method:"POST",headers:{"Content-Type":"application/json",Accept:"*/*",authorization:`Bearer ${h}`},credentials:"omit",body:JSON.stringify(s)}),k=await y.text();let b={};try{b=JSON.parse(k)}catch{b={text:k}}if(y.ok)p("success",`Relato${b?.id?` #${b.id}`:""} enviado com sucesso!`),c.value="",d.disabled=!0;else{const P=b?.message||b?.error||k||`Status HTTP ${y.status}`;p("error",`Falha (${y.status}): ${P}`)}}catch(y){p("error",`Erro de conexão: ${y.message}`)}finally{d.textContent="Enviar",d.disabled=!c.value.trim()}};d.onclick=a=>{a.stopPropagation(),m()},c.onkeydown=a=>{(a.ctrlKey||a.metaKey)&&a.key==="Enter"&&(a.preventDefault(),m()),a.key==="Escape"&&f()},document.body.appendChild(e),setTimeout(()=>{c.focus(),window.addEventListener("pointerdown",g,!0)},100)}C(),S.mountZupLogbook=C,Object.defineProperty(S,Symbol.toStringTag,{value:"Module"})})(this.ZupLogbook=this.ZupLogbook||{});
