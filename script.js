/*
  ============================================================
  NUMERO WHATSAPP — cambia solo la riga qui sotto.
  Formato: prefisso internazionale + numero, senza + e senza spazi.
  Ora è un numero di prova: 39 + 3407774806
  Quando avete il numero definitivo, sostituite il valore e basta.
  Tutti i link WhatsApp del sito leggono questa costante.
  ============================================================
*/
const WHATSAPP_NUMBER = "393808992995";

(function () {
  const number = String(WHATSAPP_NUMBER || "").replace(/\D/g, "");
  const fallbackText =
    "Ciao Piccoli e20, vorrei avere informazioni per organizzare un pranzo o una cena a domicilio.";

  function waLink(text) {
    const base = "https://wa.me/" + number;
    return text ? base + "?text=" + encodeURIComponent(text) : base;
  }

  function openWhatsApp(text) {
    const url = waLink(text);
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (!opened) window.location.href = url;
  }

  document.querySelectorAll("[data-wa]").forEach((el) => {
    if (!number) return;
    el.setAttribute("href", waLink(fallbackText));
  });

  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");
  if (header && navToggle && nav) {
    const setMenu = (open) => {
      header.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute("aria-label", open ? "Chiudi il menu" : "Apri il menu");
    };
    navToggle.addEventListener("click", () => {
      setMenu(navToggle.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", (event) => {
      if (!event.target.closest("a")) return;
      window.setTimeout(() => setMenu(false), 0);
    });
    document.addEventListener("click", (event) => {
      if (!header.contains(event.target)) setMenu(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setMenu(false);
    });
    window.addEventListener("resize", () => {
      if (window.matchMedia("(min-width: 880px)").matches) setMenu(false);
    });
  }

  const form = document.querySelector("#prenota");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!number) return;

    const data = new FormData(form);
    const nome = String(data.get("nome") || "").trim();
    const occasione = String(data.get("occasione") || "").trim();
    const quando = formatDate(String(data.get("data") || ""));
    const dataIncerta = data.get("data_incerta") != null;
    const persone = String(data.get("persone") || "").trim();
    const messaggio = String(data.get("messaggio") || "").trim();

    const lines = [
      "Ciao Piccoli e20, sono " + (nome || "un ospite") + ".",
      occasione ? "Vorrei organizzare: " + occasione + "." : "",
      quando ? "Data: " + quando + "." : "",
      dataIncerta ? "Non so ancora di preciso la data." : "",
      persone ? "Persone: " + persone + "." : "",
      messaggio,
    ].filter(Boolean);

    openWhatsApp(lines.join("\n"));
  });

  function formatDate(iso) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    if (!match) return "";
    return match[3] + "/" + match[2] + "/" + match[1];
  }
})();

(function () {
  const root = document.documentElement;
  const screen = document.querySelector(".intro-screen");
  const mark = screen && screen.querySelector(".intro-mark");
  if (!screen || !mark || !root.classList.contains("intro")) return;

  const covered = document.querySelectorAll(".skip, .site-header, .page, .site-footer");
  covered.forEach((el) => {
    el.inert = true;
  });

  let progress = 0;
  let finished = false;
  let lastY = null;

  function range() {
    return 80;
  }

  function wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  function fadeDone(el, ms) {
    return new Promise((resolve) => {
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        el.removeEventListener("transitionend", onEnd);
        resolve();
      };
      const onEnd = (event) => {
        if (event.target === el) done();
      };
      el.addEventListener("transitionend", onEnd);
      window.setTimeout(done, ms);
    });
  }

  const cue = screen.querySelector(".intro-cue");

  function render() {
    const opacity = String(1 - progress);
    mark.style.opacity = opacity;
    if (cue) cue.style.opacity = opacity;
  }

  function revealPage() {
    if (root.classList.contains("intro-reveal")) return;
    root.classList.remove("intro", "intro-exit");
    root.classList.add("intro-reveal");
    window.scrollTo(0, 0);
  }

  async function finish() {
    if (finished) return;
    finished = true;
    try {
      sessionStorage.setItem("piccoli-intro", "done");
    } catch (e) {}
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("touchstart", onTouchStart);
    window.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("keydown", onKey);
    mark.style.opacity = "0";
    if (cue) cue.style.opacity = "0";
    await fadeDone(mark, 760);
    covered.forEach((el) => {
      el.inert = false;
    });
    root.classList.add("intro-exit");
    screen.classList.add("is-gone");
    await fadeDone(screen, 500);
    revealPage();
  }

  function addDelta(px) {
    if (finished) return;
    progress = Math.min(1, Math.max(0, progress + px / range()));
    render();
    if (progress >= 1) finish();
  }

  function onWheel(event) {
    if (finished) return;
    event.preventDefault();
    let dy = event.deltaY;
    if (event.deltaMode === 1) dy *= 16;
    if (event.deltaMode === 2) dy *= range();
    addDelta(dy);
  }

  function onTouchStart(event) {
    lastY = event.touches[0] ? event.touches[0].clientY : null;
  }

  function onTouchMove(event) {
    if (finished || lastY == null || !event.touches[0]) return;
    event.preventDefault();
    const y = event.touches[0].clientY;
    addDelta(lastY - y);
    lastY = y;
  }

  function onKey(event) {
    if (finished) return;
    if (event.key === "ArrowDown" || event.key === " ") {
      event.preventDefault();
      addDelta(range() * 0.12);
    } else if (event.key === "PageDown") {
      event.preventDefault();
      addDelta(range() * 0.85);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      addDelta(range() * -0.12);
    } else if (event.key === "PageUp") {
      event.preventDefault();
      addDelta(range() * -0.85);
    }
  }

  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchmove", onTouchMove, { passive: false });
  window.addEventListener("keydown", onKey);
  render();
})();
