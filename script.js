const loginScreen = document.getElementById("login-screen");
const dashboardScreen = document.getElementById("dashboard-screen");
const authForm = document.getElementById("authForm");
const loginStatus = document.getElementById("login-status");
const toastEl = document.getElementById("toast");

function showToast(message) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"), 2200);
}

function validateLogin() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const emailError = document.getElementById("email-error");
  const passwordError = document.getElementById("password-error");

  const emailValid = email.includes("@") && email.includes(".");
  const passwordValid = password.length >= 4;

  emailError.style.display = emailValid ? "none" : "block";
  passwordError.style.display = passwordValid ? "none" : "block";

  return emailValid && passwordValid;
}

function goToDashboard() {
  if (loginScreen) loginScreen.classList.add("hidden");
  if (dashboardScreen) dashboardScreen.classList.remove("hidden");
}

if (authForm) {
  authForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validateLogin()) {
      if (loginStatus) {
        loginStatus.textContent = "Please enter a valid email and password.";
        loginStatus.classList.remove("hidden");
      }
      showToast("Check your details.");
      return;
    }

    if (loginStatus) {
      loginStatus.textContent = "Signed in successfully.";
      loginStatus.classList.remove("hidden");
    }

    showToast("Welcome back.");
    setTimeout(goToDashboard, 250);
  });
}

const profileBtn = document.getElementById("profile-btn");
if (profileBtn) {
  profileBtn.addEventListener("click", () => {
    showToast("Profile opened.");
  });
}
