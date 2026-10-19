document.addEventListener("DOMContentLoaded", ()=>{
  const btn = document.getElementById("theme-toggle");
  if(!btn) return;
  const saved = localStorage.getItem("theme") || "system";
  applyTheme(saved);
  btn.addEventListener("click", ()=>{
    const cur = localStorage.getItem("theme") || "system";
    const next = cur === "dark" ? "light" : cur === "light" ? "system" : "dark";
    localStorage.setItem("theme", next); applyTheme(next);
  })
  function applyTheme(mode){
    if(mode === "system"){
      const dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    } else {
      document.documentElement.setAttribute("data-theme", mode === "dark" ? "dark" : "light");
    }
  }
})
