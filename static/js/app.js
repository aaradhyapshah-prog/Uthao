function openFeature(name){
  document.querySelectorAll(".panel").forEach(p=>p.classList.add("hidden"));
  if(name === "ride") document.getElementById("ride-panel").classList.remove("hidden");
}
function apiLogin(){
  const form = document.getElementById("login-form");
  const fd = new FormData(form);
  fetch("/api/login", { method:"POST", body:fd })
    .then(r => r.json()).then(data=>{
      if(data.access_token){
        localStorage.setItem("token", data.access_token);
        location.href = "/dashboard";
      } else {
        alert("Login failed");
      }
    })
}
