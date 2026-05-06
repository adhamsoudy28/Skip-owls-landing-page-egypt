/* =========================================================
   SkipOwls VSL Landing Page — interactivity
   Vanilla JS, no dependencies.
   ========================================================= */

const WORKER_URL = "https://skipowls-proxy.adhamsoudy03.workers.dev/";

// ----------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  initYear();
  initPhoneField();
  initForm();
});

/* ---------- Footer year ---------- */
function initYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
}

/* ---------- Phone field — digits only, live validation ---------- */
function initPhoneField() {
  const input = document.getElementById("phone");
  const error = document.getElementById("phoneError");
  if (!input) return;

  // Only allow digits — block letters and special characters
  input.addEventListener("input", () => {
    input.value = input.value.replace(/[^\d]/g, "");
    input.classList.remove("is-invalid");
    if (error) error.hidden = true;
  });

  // Prevent pasting non-numeric characters
  input.addEventListener("paste", (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData || window.clipboardData).getData("text");
    input.value = pasted.replace(/[^\d]/g, "");
  });

  // Block letter keys from even registering
  input.addEventListener("keypress", (e) => {
    if (!/[\d]/.test(e.key) && e.key !== "Backspace" && e.key !== "Tab" && e.key !== "Enter") {
      e.preventDefault();
    }
  });
}

/* ---------- Phone validation ---------- */
function validatePhone() {
  const code  = document.getElementById("phoneCode").value;
  const input = document.getElementById("phone");
  const error = document.getElementById("phoneError");
  const raw   = input.value.trim();

  // Strip leading zeros silently
  var digits = raw.replace(/^0+/, "");

  // Empty check
  if (!digits) {
    showPhoneError(input, error, "Please enter your phone number.");
    return null;
  }

  // Too short — only block if clearly not a real number
  if (digits.length < 7) {
    showPhoneError(input, error, "Number is too short.");
    return null;
  }

  // Block obviously fake patterns (e.g. 1111111111)
  if (/^(\d)\1{6,}$/.test(digits)) {
    showPhoneError(input, error, "Please enter a real phone number.");
    return null;
  }

  // Everything else — accept it and let GHL handle formatting
  return code + digits;
}

function showPhoneError(input, error, msg) {
  input.classList.add("is-invalid");
  if (error) {
    error.textContent = msg;
    error.hidden = false;
  }
}

/* ---------- Form ---------- */
function initForm() {
  const form = document.getElementById("claimForm");
  if (!form) return;

  const inputs = form.querySelectorAll("input, select");
  inputs.forEach((input) => {
    input.addEventListener("input",  () => input.classList.remove("is-invalid"));
    input.addEventListener("change", () => input.classList.remove("is-invalid"));
  });

  form.addEventListener("submit", function(e) {
    e.preventDefault();

    // Validate all standard fields first
    if (!validate(form)) return;

    // Validate phone separately (smart validation)
    var formattedPhone = validatePhone();
    if (!formattedPhone) return;

    // Grab all values upfront
    var nameVal     = document.getElementById("name").value.trim();
    var emailVal    = document.getElementById("email").value.trim();
    var agencyVal   = document.getElementById("agency").value.trim();
    var verticalVal = document.getElementById("vertical").value;
    var volumeVal   = document.getElementById("volume").value;

    // Fire worker in background — do NOT await, never block redirect
    fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: nameVal,
        email:     emailVal,
        phone:     formattedPhone,
        agency:    agencyVal,
        vertical:  verticalVal,
        volume:    volumeVal,
      })
    }).catch(function(err) {
      console.warn("[SkipOwls] Worker error:", err);
    });

    // Fire Meta Pixel Lead event before redirect
    if (typeof fbq === "function") fbq("track", "Lead");

    // Redirect immediately — don't wait for worker
    window.location.replace("/book/?full_name=" + encodeURIComponent(nameVal) + "&email=" + encodeURIComponent(emailVal) + "&phone=" + encodeURIComponent(formattedPhone));
  });
}

function validate(form) {
  let firstInvalid = null;

  form.querySelectorAll("[required]").forEach((input) => {
    // Skip phone — validated separately
    if (input.id === "phone") return;

    const value = (input.value || "").trim();
    let invalid = !value;

    if (!invalid && input.type === "email") {
      invalid = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    if (invalid) {
      input.classList.add("is-invalid");
      if (!firstInvalid) firstInvalid = input;
    }
  });

  if (firstInvalid) { firstInvalid.focus(); return false; }
  return true;
}

