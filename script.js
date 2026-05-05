/* =========================================================
   SkipOwls VSL Landing Page — interactivity
   Vanilla JS, no dependencies.
   ========================================================= */

const WORKER_URL  = "https://skipowls-proxy.adhamsoudy03.workers.dev/";
const CALENDAR_URL = "https://cal.com/";

// ----------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  initYear();
  initForm();
  initBookNowLink();
});

/* ---------- Footer year ---------- */
function initYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
}

/* ---------- Phone formatter — Egyptian numbers to E.164 ---------- */
function formatPhone(raw) {
  var digits = raw.replace(/\D/g, '');
  if (digits.startsWith('0')) digits = '20' + digits.slice(1); // 01X → 201X
  if (!digits.startsWith('+')) digits = '+' + digits;          // 201X → +201X
  return digits;
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
    if (!validate(form)) return;

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
          phone:     formatPhone(document.getElementById("phone").value.trim()),
          agency:    document.getElementById("agency").value.trim(),
          vertical:  document.getElementById("vertical").value,
          volume:    document.getElementById("volume").value,
        })
      });

      const data = await res.json();
      console.log("[SkipOwls] Worker response:", data);

      if (!res.ok) throw new Error("Worker returned " + res.status);

      // Show success state
      form.hidden = true;
      success.hidden = false;
      success.scrollIntoView({ behavior: "smooth", block: "center" });

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

/* ---------- Book-now link in success state ---------- */
function initBookNowLink() {
  const link = document.getElementById("bookNow");
  if (link && CALENDAR_URL) link.href = CALENDAR_URL;
}
