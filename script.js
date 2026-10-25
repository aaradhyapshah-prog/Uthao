const authScreen = document.getElementById('auth-screen');
const appScreen = document.getElementById('app-screen');
const tabButtons = document.querySelectorAll('.tab-btn');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const themeToggle = document.getElementById('theme-toggle');
const profileBtn = document.getElementById('profile-btn');
const accountModal = document.getElementById('account-modal');
const closeModal = document.getElementById('close-modal');
const saveProfileBtn = document.getElementById('save-profile');
const logoutBtn = document.getElementById('logout-btn');
const toast = document.getElementById('toast');
const langButtons = document.querySelectorAll('.lang-btn');
const featureCards = document.querySelectorAll('.feature-card');

const translations = {
  en: {
    welcomeLabel: 'Welcome',
    heading: 'Where to?',
    ride: 'Ride',
    rideSub: 'Fast pickups',
    rideText: 'Book a ride, set your fare, and let nearby drivers bid for your trip.',
    food: 'Food',
    foodSub: 'Order meals',
    foodText: 'Order your favorite meals and have them delivered hot and fast.',
    courier: 'Courier',
    courierSub: 'Send parcels',
    courierText: 'Send packages securely with trusted delivery partners near you.',
    settings: 'Settings',
    settingsSub: 'Preferences',
    settingsText: 'Adjust alerts, notifications, privacy, and app behavior quickly.',
    activity: 'Activity',
    activitySub: 'Trip history',
    activityText: 'Review your recent trips, orders, receipts, and service updates.',
    support: 'Review & Customer Support',
    supportSub: 'Feedback & help',
    supportText: 'Share feedback, raise issues, and chat with our support team.',
    login: 'Login',
    signup: 'Sign Up',
    enterUthao: 'Enter UTHAO',
    createAccount: 'Create Account'
  },
  ne: {
    welcomeLabel: 'स्वागत',
    heading: 'तपाईं कहाँ जान चाहनुहुन्छ?',
    ride: 'सवारी',
    rideSub: 'छिटो उठान',
    rideText: 'सवारी बुक गर्नुहोस्, आफ्नो मूल्य तय गर्नुहोस् र नजिकैका चालकले तपाइँका लागि बोली दिन्छन्।',
    food: 'खाना',
    foodSub: 'भोजन अर्डर गर्नुहोस्',
    foodText: 'तपाईंको मनपर्ने खाना अर्डर गर्नुहोस् र तताउने ढंगले वितरण गर्नुहोस्।',
    courier: 'कारियर',
    courierSub: 'प्याकेज पठाउनुहोस्',
    courierText: 'नजिकका भरोसेमूलक डेलिभेरी पार्टनरहरूसँग पार्सल पठाउनुहोस्।',
    settings: 'सेटिङ्स',
    settingsSub: 'पसन्द',
    settingsText: 'अलर्ट, सूचना, गोपनीयता र एप व्यवहारलाई सजिलै समायोजन गर्नुहोस्।',
    activity: 'गतिविधि',
    activitySub: 'यात्रा इतिहास',
    activityText: 'तपाईंको हालको यात्रा, अर्डर, रसीद र सेवा अपडेट हेर्नुहोस्।',
    support: 'समीक्षा र ग्राहक सहयोग',
    supportSub: 'प्रतिक्रिया र सहयोग',
    supportText: 'प्रतिक्रिया दिनुहोस्, समस्या रिपोर्ट गर्नुहोस् र सहयोग टीमसँग कुरा गर्नुहोस्।',
    login: 'लगइन',
    signup: 'साइन अप',
    enterUthao: 'UTHAO मा प्रवेश',
    createAccount: 'खाता बनाउनुहोस्'
  }
};

let currentLanguage = localStorage.getItem('uthao-lang') || 'en';
let currentTheme = localStorage.getItem('uthao-theme') || 'dark';

const state = {
  user: {
    name: 'Uthao User',
    email: 'user@example.com',
    phone: '+977 9800000000',
    avatar: ''
  }
};

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

function setTheme(theme) {
  currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('uthao-theme', theme);

  if (theme === 'dark') {
    themeToggle.textContent = '☀';
  } else {
    themeToggle.textContent = '☾';
  }
}

function setLanguage(lang) {
  currentLanguage = lang;
  document.documentElement.lang = lang;
  localStorage.setItem('uthao-lang', lang);

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    if (translations[lang][key]) el.textContent = translations[lang][key];
  });

  langButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  const loginButton = document.querySelector('#login-form .primary-btn');
  const signupButton = document.querySelector('#signup-form .primary-btn');
  if (loginButton) loginButton.textContent = translations[lang].enterUthao;
  if (signupButton) signupButton.textContent = translations[lang].createAccount;

  const activeTab = document.querySelector('.tab-btn.active');
  if (activeTab) activeTab.textContent = translations[lang][activeTab.dataset.auth];
}

function showAuthForm(formName) {
  const isLogin = formName === 'login';
  loginForm.classList.toggle('hidden', !isLogin);
  signupForm.classList.toggle('hidden', isLogin);

  tabButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.auth === formName);
  });
}

function openAccountModal() {
  accountModal.classList.remove('hidden');
  accountModal.setAttribute('aria-hidden', 'false');

  document.getElementById('account-name').value = state.user.name;
  document.getElementById('account-email').value = state.user.email;
  document.getElementById('account-phone').value = state.user.phone;
  document.getElementById('account-image').value = state.user.avatar || '';
  document.getElementById('modal-avatar').textContent = state.user.name.charAt(0).toUpperCase();
  document.getElementById('modal-email').textContent = state.user.email;
}

function closeAccountModal() {
  accountModal.classList.add('hidden');
  accountModal.setAttribute('aria-hidden', 'true');
}

function updateFeatureDetail(feature) {
  const detailMap = {
    ride: {
      title: translations[currentLanguage].ride,
      copy: translations[currentLanguage].rideText
    },
    food: {
      title: translations[currentLanguage].food,
      copy: translations[currentLanguage].foodText
    },
    courier: {
      title: translations[currentLanguage].courier,
      copy: translations[currentLanguage].courierText
    },
    settings: {
      title: translations[currentLanguage].settings,
      copy: translations[currentLanguage].settingsText
    },
    activity: {
      title: translations[currentLanguage].activity,
      copy: translations[currentLanguage].activityText
    },
    support: {
      title: translations[currentLanguage].support,
      copy: translations[currentLanguage].supportText
    }
  };

  const info = detailMap[feature] || detailMap.ride;
  document.getElementById('detail-title').textContent = info.title;
  document.getElementById('detail-copy').textContent = info.copy;
}

function handleLoginSubmit(event) {
  event.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value.trim();

  if (!email.includes('@') || !email.includes('.') || password.length < 4) {
    showToast(currentLanguage === 'ne' ? 'कृपया सही ईमेल र पासवर्ड प्रविष्ट गर्नुहोस्।' : 'Please enter a valid email and password.');
    return;
  }

  if (state.user.email !== email) {
    state.user.email = email;
  }

  authScreen.classList.add('hidden');
  appScreen.classList.remove('hidden');
  showToast(currentLanguage === 'ne' ? 'लगइन सफल भयो।' : 'Login successful.');
}

function handleSignupSubmit(event) {
  event.preventDefault();
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value.trim();

  if (!name || !email.includes('@') || !email.includes('.') || password.length < 4) {
    showToast(currentLanguage === 'ne' ? 'कृपया जानकारी सही प्रविष्ट गर्नुहोस्।' : 'Please fill in all fields correctly.');
    return;
  }

  state.user.name = name;
  state.user.email = email;

  authScreen.classList.add('hidden');
  appScreen.classList.remove('hidden');
  showToast(currentLanguage === 'ne' ? 'खाता सफलतापूर्वक बनाइयो।' : 'Account created successfully.');
}

tabButtons.forEach((btn) => {
  btn.addEventListener('click', () => showAuthForm(btn.dataset.auth));
});

loginForm.addEventListener('submit', handleLoginSubmit);
signupForm.addEventListener('submit', handleSignupSubmit);

featureCards.forEach((card) => {
  card.addEventListener('click', () => {
    updateFeatureDetail(card.dataset.feature);
    showToast(card.querySelector('span').textContent);
  });
});

themeToggle.addEventListener('click', () => {
  const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(nextTheme);
});

langButtons.forEach((btn) => {
  btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
});

profileBtn.addEventListener('click', openAccountModal);
closeModal.addEventListener('click', closeAccountModal);
accountModal.addEventListener('click', (event) => {
  if (event.target === accountModal) closeAccountModal();
});

saveProfileBtn.addEventListener('click', () => {
  state.user.name = document.getElementById('account-name').value.trim() || state.user.name;
  state.user.email = document.getElementById('account-email').value.trim() || state.user.email;
  state.user.phone = document.getElementById('account-phone').value.trim() || state.user.phone;
  state.user.avatar = document.getElementById('account-image').value.trim();

  const profileInitial = state.user.name.charAt(0).toUpperCase();
  document.getElementById('modal-avatar').textContent = profileInitial;
  document.getElementById('modal-email').textContent = state.user.email;

  if (state.user.avatar) {
    document.getElementById('modal-avatar').style.backgroundImage = `url('${state.user.avatar}')`;
    document.getElementById('modal-avatar').style.backgroundSize = 'cover';
    document.getElementById('modal-avatar').style.backgroundPosition = 'center';
    document.getElementById('modal-avatar').textContent = '';
  }

  showToast(currentLanguage === 'ne' ? 'प्रोफाइल अपडेट भयो।' : 'Profile updated.');
});

logoutBtn.addEventListener('click', () => {
  appScreen.classList.add('hidden');
  authScreen.classList.remove('hidden');
  showAuthForm('login');
  closeAccountModal();
  showToast(currentLanguage === 'ne' ? 'लग आउट भयो।' : 'Logged out.');
});

setTheme(currentTheme);
setLanguage(currentLanguage);
showAuthForm('login');
updateFeatureDetail('ride');
