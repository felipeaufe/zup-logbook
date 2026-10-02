(function(g){"use strict";const m="zup-logbook-host";let f=null;try{if(typeof window<"u"){const s=window.fetch;window.fetch=async function(...r){try{const e=r[1];let t=null;if(e?.headers)if(e.headers instanceof Headers)t=e.headers.get("Authorization")||e.headers.get("authorization");else if(Array.isArray(e.headers)){const a=e.headers.find(([i])=>i.toLowerCase()==="authorization");a&&(t=a[1])}else typeof e.headers=="object"&&(t=e.headers.Authorization||e.headers.authorization);if(t&&t.toLowerCase().startsWith("bearer ")){const a=t.replace(/^bearer\s+/i,"").trim();a.length>20&&(f=a)}}catch{}return s.apply(this,r)};const o=XMLHttpRequest.prototype.setRequestHeader;XMLHttpRequest.prototype.setRequestHeader=function(r,e){try{if(r?.toLowerCase()==="authorization"&&e?.toLowerCase().startsWith("bearer ")){const t=e.replace(/^bearer\s+/i,"").trim();t.length>20&&(f=t)}}catch{}return o.apply(this,[r,e])}}}catch{}function v(){if(f)return f;if(typeof window>"u")return null;const s=window;if(s.keycloak?.token)return s.keycloak.token;const o=[],r=e=>{if(!e||typeof e!="string")return;const t=e.match(/eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+/g);if(t)for(const a of t)try{const i=JSON.parse(atob(a.split(".")[1].replace(/-/g,"+").replace(/_/g,"/")));o.push({token:a,exp:i.exp?i.exp*1e3:1/0})}catch{}};try{for(let e=0;e<sessionStorage.length;e++){const t=sessionStorage.key(e);t&&r(sessionStorage.getItem(t)||"")}}catch{}try{for(let e=0;e<localStorage.length;e++){const t=localStorage.key(e);t&&r(localStorage.getItem(t)||"")}}catch{}try{r(document.cookie)}catch{}for(const e of["keycloak","_keycloak","kc","auth","currentUser","__PRELOADED_STATE__"])try{s[e]&&r(typeof s[e]=="string"?s[e]:JSON.stringify(s[e]))}catch{}if(o.length>0){const e=Date.now(),t=o.filter(a=>a.exp>e);return t.length>0?t[0].token:o[0].token}return null}function x(){const s=document.getElementById(m);if(s){s.style.display==="none"?(s.style.display="block",setTimeout(()=>{s.shadowRoot?.querySelector("textarea")?.focus()},50)):s.style.display="none";return}const o=document.createElement("div");o.id=m,o.style.position="fixed",o.style.top="50%",o.style.left="50%",o.style.transform="translate(-50%, -50%)",o.style.width="380px",o.style.height="380px",o.style.maxWidth="90vw",o.style.maxHeight="90vh",o.style.zIndex="2147483647",o.style.display="block",o.style.boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 0 100vmax rgba(0, 0, 0, 0.45)",o.style.borderRadius="12px",o.style.fontFamily='-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';const r=o.attachShadow({mode:"open"}),e=document.createElement("style");e.textContent=`
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
  `,r.appendChild(e);const t=document.createElement("div");t.className="modal",t.innerHTML=`
    <div class="header">
      <span class="title">Zup Logbook</span>
      <button class="close-btn" type="button" title="Fechar">✕</button>
    </div>
    <textarea placeholder="Cole o JSON do relato aqui..." autofocus></textarea>
    <div class="status"></div>
    <button class="submit-btn" type="button" disabled>Enviar</button>
  `,r.appendChild(t);const a=t.querySelector(".close-btn"),i=t.querySelector("textarea"),y=t.querySelector(".status"),l=t.querySelector(".submit-btn"),h=()=>{o.style.display="none",window.removeEventListener("pointerdown",k,!0)},k=n=>{n.composedPath().includes(o)||h()};a.onclick=n=>{n.stopPropagation(),h()};const d=(n,p)=>{y.className=`status ${n}`,y.textContent=p},w=()=>{y.className="status",y.textContent=""};i.oninput=()=>{l.disabled=!i.value.trim(),w()};const S=async()=>{const n=i.value.trim();if(!n){d("error","Cole o JSON antes de enviar.");return}try{JSON.parse(n)}catch(c){d("error",`JSON inválido: ${c.message}`);return}const p=v();if(!p){d("error","Token de autenticação não encontrado na página.");return}l.disabled=!0,l.textContent="Enviando...",w();try{const c=await fetch("https://apiznt.zenity.zup.com.br/dune/v1/entry",{method:"POST",headers:{"Content-Type":"application/json",Accept:"*/*",authorization:`Bearer ${p}`},credentials:"omit",body:n}),b=await c.text();let u={};try{u=JSON.parse(b)}catch{u={text:b}}if(c.ok)d("success",`Relato${u?.id?` #${u.id}`:""} enviado com sucesso!`),i.value="",l.disabled=!0;else{const z=u?.message||u?.error||b||`Status HTTP ${c.status}`;d("error",`Falha (${c.status}): ${z}`)}}catch(c){d("error",`Erro de conexão: ${c.message}`)}finally{l.textContent="Enviar",l.disabled=!i.value.trim()}};l.onclick=n=>{n.stopPropagation(),S()},i.onkeydown=n=>{(n.ctrlKey||n.metaKey)&&n.key==="Enter"&&(n.preventDefault(),S()),n.key==="Escape"&&h()},document.body.appendChild(o),setTimeout(()=>{i.focus(),window.addEventListener("pointerdown",k,!0)},100)}x(),g.mountZupLogbook=x,Object.defineProperty(g,Symbol.toStringTag,{value:"Module"})})(this.ZupLogbook=this.ZupLogbook||{});
