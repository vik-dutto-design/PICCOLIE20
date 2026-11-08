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
