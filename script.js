/* =========================================================
   SkipOwls VSL Landing Page — interactivity
   Vanilla JS, no dependencies.
   ========================================================= */

// ---- Configuration (replace these with real values when ready) ----
const VIDEO_EMBED_URL = ""; // e.g. "https://www.youtube.com/embed/XXXX?autoplay=1&rel=0"
const FORM_ENDPOINT = ""; // e.g. "https://formspree.io/f/xxxxxxx" or your webhook
const CALENDAR_URL = "https://cal.com/"; // e.g. "https://cal.com/skipowls/15min"

// ----------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  initYear();
  initStickyCta();
  initVideoPlaceholder();
  initForm();
  initBookNowLink();
});

/* ---------- Footer year ---------- */
function initYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
}

/* ---------- Sticky CTA bar ---------- */
function initStickyCta() {
  const hero = document.getElementById("hero");
  const sticky = document.getElementById("stickyCta");
  const claim = document.getElementById("claim");
  if (!hero || !sticky) return;

  sticky.hidden = false;

  const showSticky = () => sticky.classList.add("is-visible");
  const hideSticky = () => sticky.classList.remove("is-visible");

  // Hide when hero is in view, show otherwise.
  const heroObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) hideSticky();
      else showSticky();
    },
    { threshold: 0, rootMargin: "-80px 0px 0px 0px" }
  );
  heroObserver.observe(hero);

  // Also hide when the form/claim section is in view (no need to push to itself).
  if (claim) {
    const claimObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) hideSticky();
      },
      { threshold: 0.25 }
    );
    claimObserver.observe(claim);
  }
}

/* ---------- Video placeholder ---------- */
function initVideoPlaceholder() {
  const card = document.getElementById("videoCard");
  if (!card) return;

  card.addEventListener("click", () => {
    if (!VIDEO_EMBED_URL) {
      card.innerHTML =
        '<span style="color:#B7BCC8;font-size:14px;text-align:center;padding:0 24px;line-height:1.5;">Video coming soon. Meanwhile, scroll down for the full pitch.</span>';
      card.style.cursor = "default";
      return;
    }
    const iframe = document.createElement("iframe");
    iframe.src = VIDEO_EMBED_URL;
    iframe.title = "SkipOwls demo video";
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "0";
    iframe.style.display = "block";
    card.innerHTML = "";
    card.appendChild(iframe);
  });
}

/* ---------- Form ---------- */
function initForm() {
  const form = document.getElementById("claimForm");
  const success = document.getElementById("formSuccess");
  if (!form || !success) return;

  const inputs = form.querySelectorAll("input, select");

  inputs.forEach((input) => {
    input.addEventListener("input", () => input.classList.remove("is-invalid"));
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
      if (FORM_ENDPOINT) {
        const data = new FormData(form);
        const res = await fetch(FORM_ENDPOINT, {
          method: "POST",
          body: data,
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error("Submission failed");
      } else {
        // No backend wired up — simulate success for preview/demo.
        await new Promise((r) => setTimeout(r, 600));
      }

      // Swap form for success state.
      form.hidden = true;
      success.hidden = false;
      success.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (err) {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Try again";
      }
      alert(
        "Something went wrong submitting the form. Please email hello@skipowls.com and we'll get you set up."
      );
    }
  });
}

function validate(form) {
  let firstInvalid = null;

  const required = form.querySelectorAll("[required]");
  required.forEach((input) => {
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

  if (firstInvalid) {
    firstInvalid.focus();
    return false;
  }
  return true;
}

/* ---------- Book-now link in success state ---------- */
function initBookNowLink() {
  const link = document.getElementById("bookNow");
  if (link && CALENDAR_URL) link.href = CALENDAR_URL;
}
