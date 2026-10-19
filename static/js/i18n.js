const DICT = {
  en: {
    login_title: "Hop in. Name your price.",
    tile_ride: "Ride",
    tile_food: "Food",
    tile_courier: "Courier",
    tile_settings: "Settings",
    tile_history: "Activity",
    tile_support: "Support"
  },
  ne: {
    login_title: "राइडमा सवार हुनुहोस्। मूल्य सेट गर्नुहोस्।",
    tile_ride: "राइड",
    tile_food: "खाना",
    tile_courier: "कुरियर",
    tile_settings: "सेटिङ्स",
    tile_history: "गतिबिधि",
    tile_support: "समर्थन"
  }
}
function translateAll(lang){
  document.querySelectorAll("[data-i18n]").forEach(el=>{
    const key = el.getAttribute("data-i18n");
    el.innerText = DICT[lang][key] || DICT['en'][key] || key;
  })
}
document.addEventListener("DOMContentLoaded", ()=>{
  const s = localStorage.getItem("lang") || "en";
  const sel = document.getElementById("lang-select");
  if(sel) sel.value = s;
  translateAll(s);
  if(sel) sel.addEventListener("change", e=>{
    const v = e.target.value; localStorage.setItem("lang", v); translateAll(v);
  })
})
