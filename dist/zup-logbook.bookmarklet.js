(function(k){"use strict";const x="zup-logbook-host";let f=null;try{if(typeof window<"u"){const a=window.fetch;window.fetch=async function(...s){try{const e=s[1];let t=null;if(e?.headers)if(e.headers instanceof Headers)t=e.headers.get("Authorization")||e.headers.get("authorization");else if(Array.isArray(e.headers)){const n=e.headers.find(([d])=>d.toLowerCase()==="authorization");n&&(t=n[1])}else typeof e.headers=="object"&&(t=e.headers.Authorization||e.headers.authorization);if(t&&t.toLowerCase().startsWith("bearer ")){const n=t.replace(/^bearer\s+/i,"").trim();n.length>20&&(f=n)}}catch{}return a.apply(this,s)};const r=XMLHttpRequest.prototype.setRequestHeader;XMLHttpRequest.prototype.setRequestHeader=function(s,e){try{if(s?.toLowerCase()==="authorization"&&e?.toLowerCase().startsWith("bearer ")){const t=e.replace(/^bearer\s+/i,"").trim();t.length>20&&(f=t)}}catch{}return r.apply(this,[s,e])}}}catch{}function v(){if(f)return f;if(typeof window>"u")return null;const a=window;if(a.keycloak?.token)return a.keycloak.token;const r=[],s=e=>{if(!e||typeof e!="string")return;const t=e.match(/eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+/g);if(t)for(const n of t)try{const d=JSON.parse(atob(n.split(".")[1].replace(/-/g,"+").replace(/_/g,"/")));r.push({token:n,exp:d.exp?d.exp*1e3:1/0})}catch{}};try{for(let e=0;e<sessionStorage.length;e++){const t=sessionStorage.key(e);t&&s(sessionStorage.getItem(t)||"")}}catch{}try{for(let e=0;e<localStorage.length;e++){const t=localStorage.key(e);t&&s(localStorage.getItem(t)||"")}}catch{}try{s(document.cookie)}catch{}for(const e of["keycloak","_keycloak","kc","auth","currentUser","__PRELOADED_STATE__"])try{a[e]&&s(typeof a[e]=="string"?a[e]:JSON.stringify(a[e]))}catch{}if(r.length>0){const e=Date.now(),t=r.filter(n=>n.exp>e);return t.length>0?t[0].token:r[0].token}return null}function m(){const a=document.getElementById(x);if(a){a.style.display=a.style.display==="none"?"block":"none",a.style.display==="block"&&a.shadowRoot?.querySelector("textarea")?.focus();return}const r=document.createElement("div");r.id=x,r.style.position="fixed",r.style.inset="0",r.style.zIndex="2147483647",r.style.fontFamily='-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';const s=r.attachShadow({mode:"open"}),e=document.createElement("style");e.textContent=`
    * { box-sizing: border-box; margin: 0; padding: 0; }
    .backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .modal {
      width: 360px;
      height: 360px;
      background: #181920;
      border: 1px solid #2d3142;
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.6);
      display: flex;
      flex-direction: column;
      padding: 16px;
      gap: 10px;
      color: #e2e8f0;
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
  `,s.appendChild(e);const t=document.createElement("div");t.className="backdrop";const n=document.createElement("div");n.className="modal",n.innerHTML=`
    <div class="header">
      <span class="title">Zup Logbook</span>
      <button class="close-btn" type="button" title="Fechar">✕</button>
    </div>
    <textarea placeholder="Cole o JSON do relato aqui..." autofocus></textarea>
    <div class="status"></div>
    <button class="submit-btn" type="button" disabled>Enviar</button>
  `,t.appendChild(n),s.appendChild(t);const d=n.querySelector(".close-btn"),c=n.querySelector("textarea"),b=n.querySelector(".status"),l=n.querySelector(".submit-btn"),y=()=>{r.style.display="none"};d.onclick=o=>{o.stopPropagation(),y()},n.onclick=o=>{o.stopPropagation()},t.onclick=o=>{o.target===t&&y()};const u=(o,h)=>{b.className=`status ${o}`,b.textContent=h},w=()=>{b.className="status",b.textContent=""};c.oninput=()=>{l.disabled=!c.value.trim(),w()};const S=async()=>{const o=c.value.trim();if(!o){u("error","Cole o JSON antes de enviar.");return}try{JSON.parse(o)}catch(i){u("error",`JSON inválido: ${i.message}`);return}const h=v();if(!h){u("error","Token de autenticação não encontrado na página.");return}l.disabled=!0,l.textContent="Enviando...",w();try{const i=await fetch("https://apiznt.zenity.zup.com.br/dune/v1/entry",{method:"POST",headers:{"Content-Type":"application/json",Accept:"*/*",authorization:`Bearer ${h}`},credentials:"omit",body:o}),g=await i.text();let p={};try{p=JSON.parse(g)}catch{p={text:g}}if(i.ok)u("success",`Relato${p?.id?` #${p.id}`:""} enviado com sucesso!`),c.value="",l.disabled=!0;else{const z=p?.message||p?.error||g||`Status HTTP ${i.status}`;u("error",`Falha (${i.status}): ${z}`)}}catch(i){u("error",`Erro de conexão: ${i.message}`)}finally{l.textContent="Enviar",l.disabled=!c.value.trim()}};l.onclick=o=>{o.stopPropagation(),S()},c.onkeydown=o=>{(o.ctrlKey||o.metaKey)&&o.key==="Enter"&&(o.preventDefault(),S()),o.key==="Escape"&&y()},document.body.appendChild(r),setTimeout(()=>c.focus(),50)}m(),k.mountZupLogbook=m,Object.defineProperty(k,Symbol.toStringTag,{value:"Module"})})(this.ZupLogbook=this.ZupLogbook||{});
