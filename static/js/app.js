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

  function getSettings(){ return loadJSON(LS.SETTINGS, {theme:'system', lang: localStorage.getItem('lang') || 'en', currency:'NPR', vehicle:'Economy'}); }
  function applyTheme(mode){ if(!mode || mode==='system'){ const dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light'); } else { document.documentElement.setAttribute('data-theme', mode === 'dark' ? 'dark' : 'light'); } }

  // expose settings getter for i18n
  window.getSettings = getSettings;

  // Users: array of {id, username, email, passwordHash, phone, avatar}
  function getUsers(){ return loadJSON(LS.USERS, []); }
  function setUsers(u){ saveJSON(LS.USERS, u); }
  function findUserByEmail(email){ return getUsers().find(x=>x.email.toLowerCase()===email.toLowerCase()); }

  function createUser({username,email,password}){
    const users = getUsers();
    if(findUserByEmail(email)) throw new Error('Email already registered');
    const id = Date.now();
    const hash = btoa(password);
    const user = {id, username, email, passwordHash: hash, phone:'', avatar:'./static/img/default-avatar.svg'};
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

  // UI state and helpers
  function show(el){ el.classList.remove('hidden'); }
  function hide(el){ el.classList.add('hidden'); }

  // Initial wiring
  document.addEventListener('DOMContentLoaded', ()=>{
    const settings = getSettings(); applyTheme(settings.theme);

    const profilePic = document.getElementById('profile-pic');
    // Only attach the click handler; opening the account modal happens only when user clicks the avatar
    profilePic && profilePic.addEventListener('click', openAccount);

    document.getElementById('show-signup')?.addEventListener('click', (e)=>{ e.preventDefault(); toggleAuthForms(true); });
    document.getElementById('show-login')?.addEventListener('click', (e)=>{ e.preventDefault(); toggleAuthForms(false); });

    document.getElementById('avatar-file')?.addEventListener('change', handleAvatarFile);

    // settings panel inputs
    document.getElementById('settings-lang').value = settings.lang || 'en';
    document.getElementById('settings-theme').value = settings.theme || 'system';
    document.getElementById('settings-currency').value = settings.currency || 'NPR';
    document.getElementById('settings-vehicle').value = settings.vehicle || 'Economy';

    document.getElementById('settings-lang').addEventListener('change', ()=>{ settings.lang=document.getElementById('settings-lang').value; saveJSON(LS.SETTINGS, settings); localStorage.setItem('lang', settings.lang); window.translateAll(settings.lang); });
    document.getElementById('settings-theme').addEventListener('change', ()=>{ settings.theme=document.getElementById('settings-theme').value; saveJSON(LS.SETTINGS, settings); applyTheme(settings.theme); });
    document.getElementById('settings-currency').addEventListener('change', ()=>{ settings.currency=document.getElementById('settings-currency').value; saveJSON(LS.SETTINGS, settings); });
    document.getElementById('settings-vehicle').addEventListener('change', ()=>{ settings.vehicle=document.getElementById('settings-vehicle').value; saveJSON(LS.SETTINGS, settings); });

    window.submitSupport = function(){ alert(window.t('support_desc') || 'Support sent (demo)'); document.getElementById('support-text').value=''; }

    // restore login state
    const cur = getCurrentUser();
    if(cur){ showDashboardFor(cur); } else { showLogin(); }

    // Do NOT auto-open or populate the account modal on load. The modal should only open when the user clicks their profile picture.

    renderHistory();
  });

  // Auth handlers exposed globally
  window.handleSignup = function(){
    try{
      const username = document.getElementById('su-name').value.trim();
      const email = document.getElementById('su-email').value.trim();
      const password = document.getElementById('su-password').value;
      if(!username||!email||!password) throw new Error(window.t('login_error') || 'Fill all fields');
      const u = createUser({username,email,password});
      alert(window.t('alert_signup_success') || 'Account created');
      showDashboardFor(u);
    }catch(err){ alert((window.t('login_error') || 'Error')+': '+err.message); }
  }

  window.handleLogin = function(){
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errEl = document.getElementById('login-error');
    if(errEl) { errEl.style.display='none'; errEl.innerText=''; }
    const u = verifyUser(email,password);
    if(u){ setCurrentUser(u); showDashboardFor(u); } else {
      if(errEl){ errEl.style.display='block'; errEl.innerText = window.t('login_error') || 'Could not read response.'; }
      setTimeout(()=>{ if(confirm(window.t('demo_confirm_use_demo') || 'Use demo?')) demoLogin(); }, 250);
    }
  }

  function demoLogin(){
    let u = getCurrentUser();
    if(!u){ const users = getUsers(); if(users.length) u = users[0]; }
    if(!u){ u = {id:1, username:'Demo User', email:'demo@uthao.local', passwordHash:btoa('demo'), phone:'', avatar:'./static/img/default-avatar.svg'}; setUsers([u]); setCurrentUser(u); }
    showDashboardFor(u);
  }

  function toggleAuthForms(showSignup){
    const login = document.getElementById('login-form');
    const signup = document.getElementById('signup-form');
    if(showSignup){ hide(login); show(signup); } else { show(login); hide(signup); }
  }

  function showLogin(){ hide(document.getElementById('dashboard-view')); show(document.getElementById('auth-view')); }
  function showDashboardFor(user){
    document.getElementById('profile-pic').src = user.avatar || './static/img/default-avatar.svg';
    hide(document.getElementById('auth-view')); show(document.getElementById('dashboard-view'));
  }

  // Account modal
  window.openAccount = function(){ const cur=getCurrentUser(); if(!cur) return alert(window.t('login_error') || 'Not signed in'); const modal=document.getElementById('account-modal'); show(modal); populateAccountModal(); }
  window.closeAccount = function(){ hide(document.getElementById('account-modal')); }
  function populateAccountModal(){ const cur=getCurrentUser(); if(!cur) return; document.getElementById('acct-username').value = cur.username || ''; document.getElementById('acct-email').value = cur.email || ''; document.getElementById('acct-phone').value = cur.phone || ''; document.getElementById('acct-avatar').src = cur.avatar || './static/img/default-avatar.svg'; }

  window.handleAvatarFile = function(e){ const file = e.target.files[0]; if(!file) return; const reader=new FileReader(); reader.onload = function(){ const data = reader.result; const cur = getCurrentUser(); cur.avatar = data; setCurrentUser(cur); const users = getUsers(); const uidx = users.findIndex(x=>x.id===cur.id); if(uidx>=0){ users[uidx].avatar=data; setUsers(users); } document.getElementById('profile-pic').src = data; document.getElementById('acct-avatar').src = data; }; reader.readAsDataURL(file); }

  window.saveAccount = function(){ const cur = getCurrentUser(); if(!cur) return alert(window.t('login_error') || 'Not signed in'); const users = getUsers(); const idx = users.findIndex(x=>x.id===cur.id); const uname = document.getElementById('acct-username').value.trim(); const email = document.getElementById('acct-email').value.trim(); const phone = document.getElementById('acct-phone').value.trim(); if(idx<0) return; users[idx].username = uname; users[idx].email = email; users[idx].phone = phone; const curPass = document.getElementById('acct-current-pass').value; const newPass = document.getElementById('acct-new-pass').value; if(curPass && newPass){ if(users[idx].passwordHash !== btoa(curPass)){ return alert(window.t('login_error') || 'Current password incorrect (demo).'); } users[idx].passwordHash = btoa(newPass); } setUsers(users); users[idx].avatar = users[idx].avatar || './static/img/default-avatar.svg'; setCurrentUser(users[idx]); populateAccountModal(); alert(window.t('alert_account_saved') || 'Account saved (demo).'); }

  window.logout = function(){ logoutUser(); location.reload(); }

  // Orders & history
  window.createOrder = function(order){ const cur = getCurrentUser(); if(!cur) return alert(window.t('login_error') || 'Sign in to create orders (demo)'); order.id = Date.now(); order.user_id = cur.id; order.created_at = new Date().toISOString(); order.status = 'completed'; saveOrder(order); renderHistory(); }

  function renderHistory(){ const cur = getCurrentUser(); const list = getOrders().filter(o=> !cur || o.user_id===cur.id); const container = document.getElementById('history-list'); if(!container) return; container.innerHTML=''; if(!list.length){ container.innerHTML=`<p>${window.t('no_activity') || 'No activity yet.'}</p>`; return; } list.forEach(o=>{ const el = document.createElement('div'); el.className='order'; el.innerHTML = `<strong>${o.service_type}</strong> — ${o.pickup} → ${o.dropoff}<div style="opacity:0.8;font-size:13px">${window.getSettings().currency || 'NPR'} ${o.fare} • ${new Date(o.created_at).toLocaleString()}</div>`; container.appendChild(el); }); }

  window.bookRideFromUI = function(){ if(!window.routeLine){ return alert(window.t('ph_pickup') + ' & ' + window.t('ph_dropoff')); } const a = window.pickupMarker.getLatLng(); const b = window.dropMarker.getLatLng(); const fare = window.calcFare(window.haversine(a.lat,a.lng,b.lat,b.lng)); const order = { service_type: window.t('tile_ride') || 'Ride', pickup: `${a.lat.toFixed(5)},${a.lng.toFixed(5)}`, dropoff: `${b.lat.toFixed(5)},${b.lng.toFixed(5)}`, fare }; window.createOrder(order); window.simulateDriverAlong(window.routeLine.getLatLngs()); alert(window.t('alert_ride_booked') || 'Ride booked (demo).'); }

  window.calcFare = function(dist_km){ const base=60; return Math.round(base + dist_km*25); }
  window.haversine = function(lat1,lon1,lat2,lon2){ const R=6371; const dLat=(lat2-lat1)*Math.PI/180; const dLon=(lon2-lon1)*Math.PI/180; const a=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)*Math.sin(dLon/2); return R*2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); }

})();
