// app.js - full client-side functionality: auth, profile, settings, orders stored in localStorage
(function(){
  // Storage utilities
  const LS = {
    USERS: 'uthao_users',
    CURRENT: 'uthao_current',
    ORDERS: 'uthao_orders',
    SETTINGS: 'uthao_settings'
  };

  function loadJSON(key, fallback){ try{ return JSON.parse(localStorage.getItem(key)) || fallback; }catch(e){ return fallback; } }
  function saveJSON(key, obj){ localStorage.setItem(key, JSON.stringify(obj)); }

  // Users: array of {id, username, email, passwordHash, phone, avatar}
  function getUsers(){ return loadJSON(LS.USERS, []); }
  function setUsers(u){ saveJSON(LS.USERS, u); }
  function findUserByEmail(email){ return getUsers().find(x=>x.email.toLowerCase()===email.toLowerCase()); }

  function createUser({username,email,password}){
    const users = getUsers();
    if(findUserByEmail(email)) throw new Error('Email already registered');
    const id = Date.now();
    // simple client-side hash simulation (NOT secure) - this is demo only
    const hash = btoa(password);
    const user = {id, username, email, passwordHash: hash, phone:'', avatar:'/static/img/default-avatar.svg'};
    users.push(user); setUsers(users); setCurrentUser(user); return user;
  }

  function verifyUser(email,password){
    const u = findUserByEmail(email); if(!u) return null;
    if(u.passwordHash === btoa(password)) return u; return null;
  }

  function setCurrentUser(u){ saveJSON(LS.CURRENT, u); }
  function getCurrentUser(){ return loadJSON(LS.CURRENT, null); }
  function logoutUser(){ localStorage.removeItem(LS.CURRENT); }

  // Orders
  function getOrders(){ return loadJSON(LS.ORDERS, []); }
  function saveOrder(order){ const list=getOrders(); list.unshift(order); saveJSON(LS.ORDERS, list); }

  // Settings
  function getSettings(){ return loadJSON(LS.SETTINGS, {theme:'system', lang:'en', currency:'NPR', vehicle:'Economy'}); }
  function saveSettings(s){ saveJSON(LS.SETTINGS, s); }

  // UI state and helpers
  function show(el){ el.classList.remove('hidden'); }
  function hide(el){ el.classList.add('hidden'); }

  // Initial wiring
  document.addEventListener('DOMContentLoaded', ()=>{
    // buttons
    const profilePic = document.getElementById('profile-pic');
    profilePic && profilePic.addEventListener('click', openAccount);

    // signup/login toggles
    document.getElementById('show-signup')?.addEventListener('click', (e)=>{ e.preventDefault(); toggleAuthForms(true); });
    document.getElementById('show-login')?.addEventListener('click', (e)=>{ e.preventDefault(); toggleAuthForms(false); });

    // account avatar file
    document.getElementById('avatar-file')?.addEventListener('change', handleAvatarFile);

    // settings panel inputs
    const s = getSettings();
    document.getElementById('settings-lang').value = s.lang || 'en';
    document.getElementById('settings-theme').value = s.theme || 'system';
    document.getElementById('settings-currency').value = s.currency || 'NPR';
    document.getElementById('settings-vehicle').value = s.vehicle || 'Economy';
    document.getElementById('settings-lang').addEventListener('change', ()=>{ s.lang=document.getElementById('settings-lang').value; saveSettings(s); translateAll(s.lang); });
    document.getElementById('settings-theme').addEventListener('change', ()=>{ s.theme=document.getElementById('settings-theme').value; saveSettings(s); applyTheme(s.theme); });
    document.getElementById('settings-currency').addEventListener('change', ()=>{ s.currency=document.getElementById('settings-currency').value; saveSettings(s); });
    document.getElementById('settings-vehicle').addEventListener('change', ()=>{ s.vehicle=document.getElementById('settings-vehicle').value; saveSettings(s); });

    // support submit
    window.submitSupport = function(){ alert('Support message sent (demo).'); document.getElementById('support-text').value=''; }

    // restore login state
    const cur = getCurrentUser();
    if(cur){ showDashboardFor(cur); } else { showLogin(); }

    // populate profile modal if user exists
    populateAccountModal();

    // render history
    renderHistory();
  });

  // Auth handlers exposed globally
  window.handleSignup = function(){
    try{
      const username = document.getElementById('su-name').value.trim();
      const email = document.getElementById('su-email').value.trim();
      const password = document.getElementById('su-password').value;
      if(!username||!email||!password) throw new Error('Fill all fields');
      const u = createUser({username,email,password});
      alert('Account created (demo). You are now signed in.');
      showDashboardFor(u);
    }catch(err){ alert('Signup error: '+err.message); }
  }

  window.handleLogin = function(){
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errEl = document.getElementById('login-error');
    if(errEl) { errEl.style.display='none'; errEl.innerText=''; }
    const u = verifyUser(email,password);
    if(u){ setCurrentUser(u); showDashboardFor(u); } else {
      if(errEl){ errEl.style.display='block'; errEl.innerText = 'Could not read response. Backend unavailable — demo only.'; }
      // also allow demo login with any credentials
      setTimeout(()=>{ if(confirm('Backend not available. Use demo login?')) demoLogin(); }, 250);
    }
  }

  function demoLogin(){
    // either pick first user or create a demo user
    let u = getCurrentUser();
    if(!u){ const users = getUsers(); if(users.length) u = users[0]; }
    if(!u){ u = {id:1, username:'Demo User', email:'demo@uthao.local', passwordHash:btoa('demo'), phone:'', avatar:'/static/img/default-avatar.svg'}; setUsers([u]); setCurrentUser(u); }
    showDashboardFor(u);
  }

  function toggleAuthForms(showSignup){
    const login = document.getElementById('login-form');
    const signup = document.getElementById('signup-form');
    if(showSignup){ hide(login); show(signup); } else { show(login); hide(signup); }
  }

  function showLogin(){ hide(document.getElementById('dashboard-view')); show(document.getElementById('auth-view')); }
  function showDashboardFor(user){
    // update avatar and welcome
    document.getElementById('profile-pic').src = user.avatar || '/static/img/default-avatar.svg';
    hide(document.getElementById('auth-view')); show(document.getElementById('dashboard-view'));
  }

  // Account modal
  window.openAccount = function(){ const cur=getCurrentUser(); if(!cur) return alert('Not signed in'); const modal=document.getElementById('account-modal'); show(modal); populateAccountModal(); }
  window.closeAccount = function(){ hide(document.getElementById('account-modal')); }
  function populateAccountModal(){ const cur=getCurrentUser(); if(!cur) return; document.getElementById('acct-username').value = cur.username || ''; document.getElementById('acct-email').value = cur.email || ''; document.getElementById('acct-phone').value = cur.phone || ''; document.getElementById('acct-avatar').src = cur.avatar || '/static/img/default-avatar.svg'; }

  window.handleAvatarFile = function(e){ const file = e.target.files[0]; if(!file) return; const reader=new FileReader(); reader.onload = function(){ const data = reader.result; // data url
    const cur = getCurrentUser(); cur.avatar = data; setCurrentUser(cur);
    // persist to users array
    const users = getUsers(); const uidx = users.findIndex(x=>x.id===cur.id); if(uidx>=0){ users[uidx].avatar=data; setUsers(users); }
    document.getElementById('profile-pic').src = data; document.getElementById('acct-avatar').src = data;
  }; reader.readAsDataURL(file); }

  window.saveAccount = function(){ const cur = getCurrentUser(); if(!cur) return alert('Not signed in'); const users = getUsers(); const idx = users.findIndex(x=>x.id===cur.id); const uname = document.getElementById('acct-username').value.trim(); const email = document.getElementById('acct-email').value.trim(); const phone = document.getElementById('acct-phone').value.trim(); if(idx<0) return;
    users[idx].username = uname; users[idx].email = email; users[idx].phone = phone; // password change
    const curPass = document.getElementById('acct-current-pass').value; const newPass = document.getElementById('acct-new-pass').value;
    if(curPass && newPass){ if(users[idx].passwordHash !== btoa(curPass)){ return alert('Current password incorrect (demo).'); } users[idx].passwordHash = btoa(newPass); }
    setUsers(users); users[idx].avatar = users[idx].avatar || '/static/img/default-avatar.svg'; setCurrentUser(users[idx]); populateAccountModal(); alert('Account saved (demo).'); }

  window.logout = function(){ logoutUser(); location.reload(); }

  // Orders & history
  window.createOrder = function(order){ const cur = getCurrentUser(); if(!cur) return alert('Sign in to create orders (demo)'); order.id = Date.now(); order.user_id = cur.id; order.created_at = new Date().toISOString(); order.status = 'completed'; saveOrder(order); renderHistory(); }

  function renderHistory(){ const cur = getCurrentUser(); const list = getOrders().filter(o=> !cur || o.user_id===cur.id); const container = document.getElementById('history-list'); if(!container) return; container.innerHTML=''; if(!list.length){ container.innerHTML='<p>No activity yet.</p>'; return; }
    list.forEach(o=>{ const el = document.createElement('div'); el.className='order'; el.innerHTML = `<strong>${o.service_type}</strong> — ${o.pickup} → ${o.dropoff}<div style="opacity:0.8;font-size:13px">Fare: ${o.fare} • ${new Date(o.created_at).toLocaleString()}</div>`; container.appendChild(el); }); }

  // Booking helper called from UI
  window.bookRideFromUI = function(){ if(!window.routeLine){ return alert('Set pickup and dropoff first.'); } const a = window.pickupMarker.getLatLng(); const b = window.dropMarker.getLatLng(); const fare = window.calcFare(window.haversine(a.lat,a.lng,b.lat,b.lng)); const order = { service_type:'Ride', pickup: `${a.lat.toFixed(5)},${a.lng.toFixed(5)}`, dropoff: `${b.lat.toFixed(5)},${b.lng.toFixed(5)}`, fare }; window.createOrder(order); window.simulateDriverAlong(window.routeLine.getLatLngs()); alert('Ride booked (demo).'); }

  // expose some utils to map.js
  window.calcFare = function(dist_km){ const base=60; return Math.round(base + dist_km*25); }
  window.haversine = function(lat1,lon1,lat2,lon2){ const R=6371; const dLat=(lat2-lat1)*Math.PI/180; const dLon=(lon2-lon1)*Math.PI/180; const a=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)*Math.sin(dLon/2); return R*2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); }

})();
