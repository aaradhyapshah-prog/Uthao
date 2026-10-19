const DICT = {
  en: {
    page_title: "Uthao — Demo",
    tagline: "You set the fare. Drivers compete.",
    welcome_kicker: "WELCOME BACK",
    welcome_title: "Hop in. Name your price.",
    welcome_sub: "City rides, intercity, courier, freight and food — seven services, one app.",
    label_email: "Email",
    label_password: "Password",
    label_fullname: "Full name",
    label_phone: "Phone",
    label_change_password: "Change password",
    btn_enter: "Enter UTHAO",
    btn_signup: "Sign up",
    btn_save: "Save",
    btn_logout: "Logout",
    btn_setpins: "Set Pins",
    btn_bookride: "Book Ride",
    btn_send: "Send",
    btn_signup: "Sign up",
    signup_title: "Create account",
    no_account: "Don't have an account?",
    have_account: "Already have an account?",
    link_signup: "Sign up",
    link_signin: "Sign in",
    login_error: "Could not read response.",
    tile_ride: "Ride",
    tile_food: "Food",
    tile_courier: "Courier",
    tile_settings: "Settings",
    tile_history: "Activity",
    tile_support: "Support",
    settings_title: "Settings",
    settings_lang: "Language",
    settings_theme: "Theme",
    settings_currency: "Default currency",
    settings_vehicle: "Default vehicle",
    opt_system: "System",
    opt_light: "Light",
    opt_dark: "Dark",
    history_title: "Activity / History",
    support_title: "Support",
    support_desc: "Send feedback or open a ticket (demo only).",
    account_title: "Account",
    footer_note: "This is a static demo on GitHub Pages. Server-side features (login, orders) are simulated in the browser.",
    ph_pickup: "Pickup",
    ph_dropoff: "Dropoff",
    demo_backend_unavailable: "Backend unavailable on Pages — demo mode enabled.",
    demo_confirm_use_demo: "Backend not available. Use demo login?",
    alert_account_saved: "Account saved (demo).",
    alert_signup_success: "Account created (demo). You are now signed in.",
    alert_ride_booked: "Ride booked (demo).",
    no_activity: "No activity yet."
  },
  ne: {
    page_title: "उठाओ — डेमो",
    tagline: "तपाईंले भाडा सेट गर्नुहोस्। चालकहरू प्रतिस्पर्धा गर्छन्।",
    welcome_kicker: "फेरि स्वागत छ",
    welcome_title: "सवार हुनुहोस्। आफ्नो मूल्य राख्नुहोस्।",
    welcome_sub: "सहर राइड, अन्तरसहर, कूरियर, मालवाहक र खाना — सात सेवाहरू, एउटै एप।",
    label_email: "इमेल",
    label_password: "पासवर्ड",
    label_fullname: "पूरा नाम",
    label_phone: "फोन",
    label_change_password: "पासवर्ड परिवर्तन गर्नुहोस्",
    btn_enter: "उठAO मा प्रवेश गर्नुहोस्",
    btn_signup: "साइन अप",
    btn_save: "सेभ गर्नुहोस्",
    btn_logout: "लगआउट",
    btn_setpins: "पिन सेट गर्नुहोस्",
    btn_bookride: "राइड बुक गर्नुहोस्",
    btn_send: "पठाउनुहोस्",
    signup_title: "खाता सिर्जना गर्नुहोस्",
    no_account: "खाता छैन?",
    have_account: "पहिले नै खाता छ?",
    link_signup: "साइन अप",
    link_signin: "साइन इन",
    login_error: "सर्भरबाट जवाफ पढ्न सकेन।",
    tile_ride: "राइड",
    tile_food: "खाना",
    tile_courier: "कुरियर",
    tile_settings: "सेटिङ्स",
    tile_history: "गतिविधि",
    tile_support: "समर्थन",
    settings_title: "सेटिङ्स",
    settings_lang: "भाषा",
    settings_theme: "थिम",
    settings_currency: "पूर्वनिर्धारित मुद्रा",
    settings_vehicle: "पूर्वनिर्धारित सवारी",
    opt_system: "सिस्टम",
    opt_light: "हल्का",
    opt_dark: "गाढा",
    history_title: "गतिविधि / इतिहास",
    support_title: "समर्थन",
    support_desc: "प्रतिक्रिया पठाउनुहोस् वा टिकट खोल्नुहोस् (डेमो मात्र)।",
    account_title: "खाता",
    footer_note: "यो GitHub Pages मा स्टाटिक डेमो हो। सर्भर-साइड सुविधाहरू (लगइन, अर्डर) ब्राउजरमा सिमुलेट गरिएका छन्।",
    ph_pickup: "पिकअप",
    ph_dropoff: "ड्रपअफ",
    demo_backend_unavailable: "Pages मा ब्याकएन्ड उपलब्ध छैन — डेमो मोड सक्षम भयो।",
    demo_confirm_use_demo: "ब्याकएन्ड उपलब्ध छैन। डेमो लगइन प्रयोग गर्ने?",
    alert_account_saved: "खाता सेभ गरियो (डेमो)।",
    alert_signup_success: "खाता सिर्जना गरियो (डेमो)। तपाईं अहिले साइन इन हुनुहुन्छ।",
    alert_ride_booked: "राइड बुक गरियो (डेमो)।",
    no_activity: "अहिले सम्म कुनै गतिविधि छैन।"
  }
};

function translateAll(lang){
  const dict = DICT[lang] || DICT['en'];
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key = el.getAttribute('data-i18n');
    if(dict[key]) el.innerText = dict[key];
  });
  // placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{
    const key = el.getAttribute('data-i18n-placeholder');
    if(dict[key]) el.setAttribute('placeholder', dict[key]);
  });
}

function t(key){
  const lang = localStorage.getItem('lang') || ( (typeof window !== 'undefined' && window.getSettings) ? (window.getSettings().lang||'en') : 'en');
  return (DICT[lang] && DICT[lang][key]) || DICT['en'][key] || key;
}

window.translateAll = translateAll;
window.t = t;

// Initialize on DOM
document.addEventListener('DOMContentLoaded', ()=>{
  const s = localStorage.getItem('lang') || 'en';
  const sel = document.getElementById('lang-select');
  if(sel) sel.value = s;
  translateAll(s);
  if(sel) sel.addEventListener('change', e=>{ const v=e.target.value; localStorage.setItem('lang',v); translateAll(v); });
});
