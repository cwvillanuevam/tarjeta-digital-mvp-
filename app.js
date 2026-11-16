(function () {
  "use strict";

  const profile = window.BUSINESS_CARD_PROFILE || {};
  const card = document.getElementById("business-card");
  const contactList = document.getElementById("contact-list");
  const hint = document.getElementById("contact-hint");
  const status = document.getElementById("status-message");
  const contactButton = document.getElementById("contact-button");
  const layoutButtons = Array.from(document.querySelectorAll("[data-layout-button]"));
  const layoutQuery = window.matchMedia("(max-width: 700px)");

  function text(value, fallback) {
    return typeof value === "string" && value.trim() ? value.trim() : fallback;
  }

  function safeWebUrl(value) {
    if (typeof value !== "string" || !value.trim()) return "";
    const raw = value.trim();
    try {
      const url = new URL(/^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : "https://" + raw);
      return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
    } catch (_) {
      return "";
    }
  }

  function setText(id, value, fallback) {
    const node = document.getElementById(id);
    if (node) node.textContent = text(value, fallback);
  }

  const fullName = text(profile.name, "Tu nombre y apellido");
  setText("profile-name", profile.name, "Tu nombre y apellido");
  setText("profile-role", profile.role, "Cargo o especialidad");
  setText("profile-company", profile.company, "Tu organización");
  setText("company-label", profile.brand || profile.company, "TU MARCA");
  setText("profile-tagline", profile.tagline, "Una breve presentación que cuente qué haces y el valor que aportas.");

  const initials = fullName.split(/\s+/).filter(Boolean).slice(0, 2).map(function (part) {
    return part.charAt(0).toUpperCase();
  }).join("") || "TD";
  setText("avatar-initials", initials, "TD");

  if (profile.accent && /^#[0-9a-f]{6}$/i.test(profile.accent)) {
    card.style.setProperty("--card-accent", profile.accent);
    document.documentElement.style.setProperty("--accent", profile.accent);
  }

  const photoUrl = safeWebUrl(profile.photo);
  if (photoUrl) {
    const avatar = document.getElementById("avatar");
    const image = document.createElement("img");
    image.src = photoUrl;
    image.alt = "Fotografía de " + fullName;
    image.referrerPolicy = "no-referrer";
    image.addEventListener("error", function () { image.remove(); });
    avatar.replaceChildren(image);
  }

  function addContact(label, value, href, symbol, external) {
    if (!value || !href) return;
    const link = document.createElement("a");
    link.className = "contact-link";
    link.href = href;
    if (external) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
    const icon = document.createElement("span");
    icon.className = "contact-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = symbol;
    const caption = document.createElement("span");
    caption.textContent = value;
    link.append(icon, caption);
    contactList.append(link);
  }

  const email = text(profile.email, "");
  const phone = text(profile.phone, "");
  const whatsapp = text(profile.whatsapp, "");
  const website = safeWebUrl(profile.website);
  const linkedin = safeWebUrl(profile.linkedin);
  const location = text(profile.location, "");
  const mapUrl = location ? "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(location) : "";

  const validEmail = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : ""; if (validEmail) addContact("Correo", validEmail, "mailto:" + validEmail, "@", false);
  if (phone) addContact("Teléfono", phone, "tel:" + phone.replace(/[^\d+*#;,]/g, ""), "T", false);
  const whatsappDigits = whatsapp.replace(/\D/g, "");
  if (whatsappDigits.length >= 8) addContact("WhatsApp", whatsapp, "https://wa.me/" + whatsappDigits, "W", true);
  if (website) addContact("Web", profile.website, website, "↗", true);
  if (linkedin) addContact("LinkedIn", "Ver perfil profesional", linkedin, "in", true);
  if (location && mapUrl) addContact("Ubicación", location, mapUrl, "⌖", true);

  const hasContact = Boolean(validEmail || phone || whatsappDigits.length >= 8 || website || linkedin);
  contactButton.disabled = !hasContact;
  contactButton.title = hasContact ? "Descargar los datos de contacto" : "Completa al menos un medio de contacto en profile.js";
  hint.hidden = contactList.children.length > 0;
  hint.textContent = "Añade correo, teléfono, WhatsApp o enlaces en profile.js para mostrar tus datos aquí.";

  function currentLayout(mode) {
    if (mode === "auto") return layoutQuery.matches ? "portrait" : "landscape";
    return mode;
  }

  function setLayout(mode) {
    card.dataset.layout = currentLayout(mode);
    card.dataset.layoutMode = mode;
    layoutButtons.forEach(function (button) {
      const active = button.dataset.layoutButton === mode;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  layoutButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      setLayout(button.dataset.layoutButton);
    });
  });
  setLayout("auto");
  layoutQuery.addEventListener("change", function () {
    if (card.dataset.layoutMode === "auto") setLayout("auto");
  });

  function announce(message) {
    status.textContent = message;
  }

  function escapeVCard(value) {
    return String(value || "").replace(/\\/g, "\\\\").replace(/\r\n|\n|\r/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
  }

  function downloadVCard() {
    const lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      "FN:" + escapeVCard(fullName),
      "N:" + escapeVCard(fullName) + ";;;;"
    ];
    if (profile.company) lines.push("ORG:" + escapeVCard(profile.company));
    if (profile.role) lines.push("TITLE:" + escapeVCard(profile.role));
    if (validEmail) lines.push("EMAIL;TYPE=INTERNET:" + escapeVCard(validEmail));
    if (phone) lines.push("TEL;TYPE=CELL:" + escapeVCard(phone));
    if (whatsapp && whatsapp !== phone) lines.push("TEL;TYPE=CELL:" + escapeVCard(whatsapp));
    if (website) lines.push("URL:" + escapeVCard(website));
    if (profile.tagline) lines.push("NOTE:" + escapeVCard(profile.tagline));
    lines.push("END:VCARD");
    const blob = new Blob([lines.join("\r\n") + "\r\n"], { type: "text/vcard;charset=utf-8" });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = (fullName.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "") || "contacto") + ".vcf";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
    announce("Contacto descargado. Abre el archivo .vcf para guardarlo en tu agenda.");
  }

  async function copyLink() {
    const url = window.location.href;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const field = document.createElement("textarea");
        field.value = url;
        field.setAttribute("readonly", "");
        field.style.position = "fixed";
        field.style.opacity = "0";
        document.body.append(field);
        field.select();
        const copied = document.execCommand("copy");
        field.remove();
        if (!copied) throw new Error("No se pudo copiar");
      }
      announce("Enlace copiado. Ya puedes compartir tu tarjeta.");
    } catch (_) {
      announce("No fue posible copiar automáticamente. Copia la dirección desde el navegador.");
    }
  }

  document.getElementById("share-button").addEventListener("click", async function () {
    const shareData = {
      title: fullName + " | Tarjeta digital",
      text: text(profile.role, "Tarjeta de presentación digital"),
      url: window.location.href
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        announce("Tarjeta compartida.");
      } catch (error) {
        if (error && error.name !== "AbortError") await copyLink();
      }
    } else {
      await copyLink();
    }
  });

  contactButton.addEventListener("click", downloadVCard);
  document.getElementById("print-button").addEventListener("click", function () {
    window.print();
  });
})();