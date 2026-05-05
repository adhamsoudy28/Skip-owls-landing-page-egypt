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
  const form    = document.getElementById("claimForm");
  const success = document.getElementById("formSuccess");
  if (!form || !success) return;

  const inputs = form.querySelectorAll("input, select");
  inputs.forEach((input) => {
    input.addEventListener("input",  () => input.classList.remove("is-invalid"));
    input.addEventListener("change", () => input.classList.remove("is-invalid"));
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validate all standard fields first
    if (!validate(form)) return;

    // Validate phone separately (smart validation)
    const formattedPhone = validatePhone();
    if (!formattedPhone) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
    }

    try {
      const res = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: document.getElementById("name").value.trim(),
          email:     document.getElementById("email").value.trim(),
          phone:     formattedPhone,
          agency:    document.getElementById("agency").value.trim(),
          vertical:  document.getElementById("vertical").value,
          volume:    document.getElementById("volume").value,
        })
      });

      const data = await res.json();
      console.log("[SkipOwls] Worker response:", data);

      if (!res.ok) throw new Error("Worker returned " + res.status);

      // Redirect to booking page with pre-filled data
      var params = new URLSearchParams({
        name:  document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: formattedPhone
      });
      window.location.href = "/book?" + params.toString();

    } catch (err) {
      console.error("[SkipOwls] Submission error:", err);
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Try again";
      }
      alert("Something went wrong. Please email hello@skipowls.com and we'll get you set up.");
    }
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

