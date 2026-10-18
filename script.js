const toastEl = document.getElementById("toast");
const dock = document.getElementById("dock");
const userChip = document.getElementById("user-chip");
const bidInput = document.getElementById("bid");
const bidValue = document.getElementById("bid-value");

function toast(message) {
    toastEl.textContent = message;
    toastEl.classList.add("show");
    setTimeout(() => toastEl.classList.remove("show"), 2800);
}

async function api(path, options = {}) {
    const response = await fetch(path, {
        headers: { "Content-Type": "application/json", ...(options.headers || {}) },
        ...options,
        body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const data = await response.json().catch(() => ({ ok: false, message: "Could not read response." }));
    if (!response.ok || data.ok === false) {
        throw new Error(data.message || "Request failed.");
    }
    return data;
}

function showSection(sectionId) {
    document.querySelectorAll(".section").forEach((section) => section.classList.add("hidden"));
    const target = document.getElementById(sectionId);
    if (target) target.classList.remove("hidden");
    document.querySelectorAll(".dock-btn").forEach((btn) => {
        btn.classList.toggle("is-active", btn.dataset.target === sectionId);
    });
    if (sectionId === "wallet-section") loadWallet();
    if (sectionId === "activity-section") loadActivity();
}

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("uthao-theme", theme);
}

const savedTheme = localStorage.getItem("uthao-theme") || "dark";
applyTheme(savedTheme);

document.getElementById("theme-toggle").addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
});

bidInput.addEventListener("input", () => {
    bidValue.textContent = bidInput.value;
});

document.getElementById("authForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const emailError = document.getElementById("email-error");
    const passwordError = document.getElementById("password-error");
    emailError.style.display = email.includes("@") ? "none" : "block";
    passwordError.style.display = password ? "none" : "block";
    try {
        const data = await api("/api/login", { method: "POST", body: { email, password } });
        userChip.textContent = data.user.name;
        userChip.classList.remove("hidden");
        dock.classList.remove("hidden");
        showSection("dashboard-section");
        toast(`Hey ${data.user.name}, you are in.`);
    } catch (error) {
        document.getElementById("login-status").textContent = error.message;
        toast(error.message);
    }
});

document.querySelectorAll(".service-card").forEach((button) => {
    button.addEventListener("click", () => showSection(button.dataset.section));
});

document.querySelectorAll(".back-btn, .dock-btn").forEach((button) => {
    button.addEventListener("click", () => showSection(button.dataset.target));
});

document.getElementById("rideForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
        const data = await api("/api/ride", {
            method: "POST",
            body: {
                pickup: document.getElementById("pickup").value,
                destination: document.getElementById("destination").value,
                bid: document.getElementById("bid").value,
                comments: document.getElementById("comments").value,
            },
        });
        const box = document.getElementById("ride-result");
        box.classList.remove("hidden");
        box.innerHTML = `<p><strong>${data.message}</strong></p>` + data.offers.map((offer) => (
            `<div class="driver-row"><span>${offer.driver} · ${offer.rating} ★ · ${offer.eta}</span><strong>₹${offer.ask}</strong></div>`
        )).join("");
        toast(data.message);
    } catch (error) {
        toast(error.message);
    }
});

document.getElementById("intercityForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
        const data = await api("/api/intercity", {
            method: "POST",
            body: {
                origin: document.getElementById("origin").value,
                city: document.getElementById("city").value,
                date: document.getElementById("trip-date").value,
                seats: document.getElementById("seats").value,
            },
        });
        toast(`${data.message} Fare ₹${data.trip.amount}`);
        showSection("activity-section");
    } catch (error) {
        toast(error.message);
    }
});

document.getElementById("courierForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
        const data = await api("/api/courier", {
            method: "POST",
            body: {
                pickup: document.getElementById("c-pickup").value,
                drop: document.getElementById("c-drop").value,
                parcel: document.getElementById("parcel").value,
            },
        });
        toast(`${data.message} ₹${data.trip.amount}`);
        showSection("activity-section");
    } catch (error) {
        toast(error.message);
    }
});

document.getElementById("freightForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
        const data = await api("/api/freight", {
            method: "POST",
            body: {
                pickup: document.getElementById("f-pickup").value,
                drop: document.getElementById("f-drop").value,
                vehicle: document.getElementById("vehicle").value,
                weight: document.getElementById("weight").value,
            },
        });
        toast(`${data.message} ₹${data.trip.amount}`);
        showSection("activity-section");
    } catch (error) {
        toast(error.message);
    }
});

document.getElementById("orderFoodForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
        const data = await api("/api/food", {
            method: "POST",
            body: {
                dish: document.getElementById("dish").value,
                restaurant: document.getElementById("restaurant").value,
                coupon: document.getElementById("coupon").value,
            },
        });
        toast(`${data.message} ₹${data.trip.amount}`);
        showSection("activity-section");
    } catch (error) {
        toast(error.message);
    }
});

async function loadWallet() {
    const data = await api("/api/wallet");
    document.getElementById("coupon-list").innerHTML = data.coupons
        .map((coupon) => `<span class="chip">${coupon.code} · ${coupon.label}</span>`)
        .join("");
    document.getElementById("offer-list").innerHTML = data.offers
        .map((offer) => `<li><strong>${offer.title}</strong><br>${offer.detail}</li>`)
        .join("");
}

async function loadActivity() {
    const data = await api("/api/activity");
    const list = document.getElementById("activity-list");
    const empty = document.getElementById("orders-message");
    if (!data.items.length) {
        list.innerHTML = "";
        empty.classList.remove("hidden");
        return;
    }
    empty.classList.add("hidden");
    list.innerHTML = data.items.map((item) => (
        `<li><span><strong>${item.type}</strong><br>${item.title}<br><em>${item.status}</em></span><strong>₹${item.amount}</strong></li>`
    )).join("");
}

document.getElementById("apply-coupon-btn").addEventListener("click", async () => {
    try {
        const data = await api("/api/coupon", {
            method: "POST",
            body: { code: document.getElementById("apply-coupon").value },
        });
        toast(data.message);
    } catch (error) {
        toast(error.message);
    }
});

document.getElementById("submit-feedback-btn").addEventListener("click", async () => {
    const message = document.getElementById("feedback-message");
    try {
        const data = await api("/api/feedback", {
            method: "POST",
            body: { text: document.getElementById("offer-feedback").value },
        });
        message.textContent = data.message;
        message.classList.remove("hidden");
        document.getElementById("offer-feedback").value = "";
        toast(data.message);
    } catch (error) {
        toast(error.message);
    }
});

document.getElementById("clear-orders-btn").addEventListener("click", async () => {
    await api("/api/activity/clear", { method: "POST", body: {} });
    loadActivity();
    toast("Activity cleared.");
});

document.getElementById("settingsForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = await api("/api/settings", {
        method: "POST",
        body: {
            notifications: document.getElementById("notification-preferences").value,
            password: document.getElementById("password-change").value,
        },
    });
    toast(data.message);
});

document.getElementById("helpForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
        const data = await api("/api/help", {
            method: "POST",
            body: { text: document.getElementById("support-message").value },
        });
        toast(data.message);
        document.getElementById("support-message").value = "";
    } catch (error) {
        toast(error.message);
    }
});
