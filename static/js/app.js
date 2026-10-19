// app.js - client-only UI logic with robust login fallback
function openFeature(name){
  document.querySelectorAll(".panel").forEach(p=>p.classList.add("hidden"));
  if(name === "ride") document.getElementById("ride-panel").classList.remove("hidden");
}

function demoLogin(){
  document.getElementById('auth-view').classList.add('hidden');
  document.getElementById('dashboard-view').classList.remove('hidden');
  const evt = new Event('DOMContentLoaded'); document.dispatchEvent(evt);
}

async function apiLogin(){
  const form = document.getElementById("login-form");
  if(!form) return alert('Login form not found');

  const isPages = location.hostname.endsWith('github.io');
  if(isPages){
    const errEl = document.getElementById('login-error');
    if(errEl){ errEl.style.display='block'; errEl.innerText = 'Backend unavailable on Pages — demo login enabled.'; }
    return demoLogin();
  }

  const fd = new FormData(form);
  try {
    const res = await fetch("/api/login", { method: "POST", body: fd });
    const text = await res.text();
    const contentType = res.headers.get("content-type") || "";

    if(!res.ok){
      let msg = `Server error ${res.status}`;
      try { const j = JSON.parse(text); msg = j.detail || j.message || JSON.stringify(j); } catch(e) { if(text) msg = text; }
      alert("Login failed: " + msg);
      console.error("Login failed:", res.status, text);
      return;
    }

    if(!contentType.includes('application/json')){
      alert('Unexpected response from server (expected JSON). See console for details.');
      console.error('Unexpected content-type', contentType, 'raw response:', text);
      return;
    }

    const data = JSON.parse(text);
    if(data && data.access_token){
      localStorage.setItem("token", data.access_token);
      location.href = "/dashboard";
    } else {
      alert('Login failed: no token returned.');
      console.error('No token in response', data);
    }
  } catch (err) {
    console.error('Network or parse error during login', err);
    alert('Network error: ' + (err.message || err));
  }
}

// map.js integration is loaded separately; ensure map functions exist

// Attach form handler if needed
document.addEventListener('DOMContentLoaded', ()=>{
  const form = document.getElementById('login-form');
  if(form){
    if(!form.getAttribute('onsubmit')){
      form.addEventListener('submit', function(e){ e.preventDefault(); apiLogin(); });
    }
  }
});
