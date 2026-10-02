(function(g){"use strict";const x="zup-logbook-host";let p=null;try{if(typeof window<"u"){const n=window.fetch;window.fetch=async function(...a){try{const e=a[1];let t=null;if(e?.headers)if(e.headers instanceof Headers)t=e.headers.get("Authorization")||e.headers.get("authorization");else if(Array.isArray(e.headers)){const s=e.headers.find(([i])=>i.toLowerCase()==="authorization");s&&(t=s[1])}else typeof e.headers=="object"&&(t=e.headers.Authorization||e.headers.authorization);if(t&&t.toLowerCase().startsWith("bearer ")){const s=t.replace(/^bearer\s+/i,"").trim();s.length>20&&(p=s)}}catch{}return n.apply(this,a)};const o=XMLHttpRequest.prototype.setRequestHeader;XMLHttpRequest.prototype.setRequestHeader=function(a,e){try{if(a?.toLowerCase()==="authorization"&&e?.toLowerCase().startsWith("bearer ")){const t=e.replace(/^bearer\s+/i,"").trim();t.length>20&&(p=t)}}catch{}return o.apply(this,[a,e])}}}catch{}function S(){if(p)return p;if(typeof window>"u")return null;const n=window;if(n.keycloak?.token)return n.keycloak.token;const o=[],a=e=>{if(!e||typeof e!="string")return;const t=e.match(/eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+/g);if(t)for(const s of t)try{const i=JSON.parse(atob(s.split(".")[1].replace(/-/g,"+").replace(/_/g,"/")));o.push({token:s,exp:i.exp?i.exp*1e3:1/0})}catch{}};try{for(let e=0;e<sessionStorage.length;e++){const t=sessionStorage.key(e);t&&a(sessionStorage.getItem(t)||"")}}catch{}try{for(let e=0;e<localStorage.length;e++){const t=localStorage.key(e);t&&a(localStorage.getItem(t)||"")}}catch{}try{a(document.cookie)}catch{}for(const e of["keycloak","_keycloak","kc","auth","currentUser","__PRELOADED_STATE__"])try{n[e]&&a(typeof n[e]=="string"?n[e]:JSON.stringify(n[e]))}catch{}if(o.length>0){const e=Date.now(),t=o.filter(s=>s.exp>e);return t.length>0?t[0].token:o[0].token}return null}function m(){const n=document.getElementById(x);if(n){n.style.display=n.style.display==="none"?"flex":"none",n.style.display==="flex"&&n.shadowRoot?.querySelector("textarea")?.focus();return}const o=document.createElement("div");o.id=x,o.style.position="fixed",o.style.inset="0",o.style.zIndex="2147483647",o.style.display="flex",o.style.alignItems="center",o.style.justifyContent="center",o.style.background="rgba(0, 0, 0, 0.45)",o.style.fontFamily='-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';const a=o.attachShadow({mode:"open"}),e=document.createElement("style");e.textContent=`
    * { box-sizing: border-box; margin: 0; padding: 0; }
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
  `,a.appendChild(e);const t=document.createElement("div");t.className="modal",t.innerHTML=`
    <div class="header">
      <span class="title">Zup Logbook</span>
      <button class="close-btn" type="button" title="Fechar">✕</button>
    </div>
    <textarea placeholder="Cole o JSON do relato aqui..." autofocus></textarea>
    <div class="status"></div>
    <button class="submit-btn" type="button" disabled>Enviar</button>
  `,a.appendChild(t);const s=t.querySelector(".close-btn"),i=t.querySelector("textarea"),f=t.querySelector(".status"),l=t.querySelector(".submit-btn"),b=()=>{o.style.display="none"};s.onclick=b,o.onclick=r=>{r.target===o&&b()};const d=(r,y)=>{f.className=`status ${r}`,f.textContent=y},k=()=>{f.className="status",f.textContent=""};i.oninput=()=>{l.disabled=!i.value.trim(),k()};const w=async()=>{const r=i.value.trim();if(!r){d("error","Cole o JSON antes de enviar.");return}try{JSON.parse(r)}catch(c){d("error",`JSON inválido: ${c.message}`);return}const y=S();if(!y){d("error","Token de autenticação não encontrado na página.");return}l.disabled=!0,l.textContent="Enviando...",k();try{const c=await fetch("https://apiznt.zenity.zup.com.br/dune/v1/entry",{method:"POST",headers:{"Content-Type":"application/json",Accept:"*/*",authorization:`Bearer ${y}`},credentials:"omit",body:r}),h=await c.text();let u={};try{u=JSON.parse(h)}catch{u={text:h}}if(c.ok)d("success",`Relato${u?.id?` #${u.id}`:""} enviado com sucesso!`),i.value="",l.disabled=!0;else{const z=u?.message||u?.error||h||`Status HTTP ${c.status}`;d("error",`Falha (${c.status}): ${z}`)}}catch(c){d("error",`Erro de conexão: ${c.message}`)}finally{l.textContent="Enviar",l.disabled=!i.value.trim()}};l.onclick=w,i.onkeydown=r=>{(r.ctrlKey||r.metaKey)&&r.key==="Enter"&&(r.preventDefault(),w()),r.key==="Escape"&&b()},document.body.appendChild(o),setTimeout(()=>i.focus(),50)}m(),g.mountZupLogbook=m,Object.defineProperty(g,Symbol.toStringTag,{value:"Module"})})(this.ZupLogbook=this.ZupLogbook||{});
