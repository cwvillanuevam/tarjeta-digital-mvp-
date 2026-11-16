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
  const fullscreenButton = document.getElementById("fullscreen-button");

  function setPresentationMode(enabled) {
    document.body.classList.toggle("presentation-mode", enabled);
    fullscreenButton.setAttribute("aria-pressed", String(enabled));
    fullscreenButton.innerHTML = enabled
      ? '<span class="button-icon" aria-hidden="true">⤢</span> Salir de pantalla completa'
      : '<span class="button-icon" aria-hidden="true">⛶</span> Pantalla completa';
  }

  fullscreenButton.addEventListener("click", async function () {
    const entering = !document.body.classList.contains("presentation-mode");
    if (!entering) {
      if (document.fullscreenElement && document.exitFullscreen) {
        try { await document.exitFullscreen(); } catch (_) { /* Se mantiene la salida visual. */ }
      }
      setPresentationMode(false);
      return;
    }

    setPresentationMode(true);
    // La API nativa oculta también la interfaz del navegador cuando está disponible.
    if (document.documentElement.requestFullscreen) {
      try {
        await document.documentElement.requestFullscreen();
      } catch (_) {
        announce("Modo de presentación activado. Este navegador no permite ocultar su barra superior.");
      }
    } else {
      announce("Modo de presentación activado. Este navegador conserva sus controles del sistema.");
    }
  });

  document.addEventListener("fullscreenchange", function () {
    if (!document.fullscreenElement && document.body.classList.contains("presentation-mode")) {
      setPresentationMode(false);
    }
  });


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
  const focusNode = document.getElementById("profile-focus");
  if (focusNode) {
    focusNode.textContent = text(profile.focus, "");
    focusNode.hidden = !text(profile.focus, "");
  }

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
  const github = safeWebUrl(profile.github);
  const orcid = safeWebUrl(profile.orcid);
  const location = text(profile.location, "");
  const mapUrl = location ? "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(location) : "";

  const validEmail = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : ""; if (validEmail) addContact("Correo", validEmail, "mailto:" + validEmail, "@", false);
  if (phone) addContact("Teléfono", phone, "tel:" + phone.replace(/[^\d+*#;,]/g, ""), "T", false);
  const whatsappDigits = whatsapp.replace(/\D/g, "");
  if (whatsappDigits.length >= 8) addContact("WhatsApp", whatsapp, "https://wa.me/" + whatsappDigits, "W", true);
  if (website) addContact("Portafolio", "Ver proyectos y experiencia", website, "↗", true);
  if (linkedin) addContact("LinkedIn", "Ver perfil profesional", linkedin, "in", true);
  if (github) addContact("GitHub", "Ver repositorios", github, "GH", true);
  if (orcid) addContact("ORCID", "Ver perfil de investigación", orcid, "iD", true);
  if (location && mapUrl) addContact("Ubicación", location, mapUrl, "⌖", true);

  // Se puede guardar un contacto aunque el visitante solo quiera conservar nombre y cargo.
  const hasContact = Boolean(fullName && fullName !== "Tu nombre y apellido");
  contactButton.disabled = !hasContact;
  contactButton.title = hasContact ? "Compartir o descargar la ficha para guardarla en Contactos" : "Completa el nombre del titular en profile.js";
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

  // QR permanente: apunta a la URL pública canónica, no a una URL temporal del navegador.
  const CARD_PUBLIC_URL = "https://cwvillanuevam.github.io/tarjeta-digital-mvp-/";
  const qrContainer = document.getElementById("qr-code");
  let qrSvgMarkup = "";
  try {
    const qr = qrcode(0, "M");
    qr.addData(CARD_PUBLIC_URL);
    qr.make();
    qrSvgMarkup = qr.createSvgTag({ cellSize: 5, margin: 3, scalable: true });
    qrContainer.innerHTML = qrSvgMarkup;
  } catch (_) {
    qrContainer.textContent = "QR no disponible";
    document.getElementById("download-qr-button").disabled = true;
  }

  const downloadQrButton = document.getElementById("download-qr-button");

  function serializeQrSvg() {
    const svgElement = qrContainer.querySelector("svg");
    if (svgElement && typeof XMLSerializer === "function") {
      const svgCopy = svgElement.cloneNode(true);
      if (!svgCopy.hasAttribute("xmlns")) {
        svgCopy.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      }
      if (!svgCopy.hasAttribute("viewBox")) {
        const width = Number.parseFloat(svgCopy.getAttribute("width")) || 300;
        const height = Number.parseFloat(svgCopy.getAttribute("height")) || 300;
        svgCopy.setAttribute("viewBox", "0 0 " + width + " " + height);
      }
      return new XMLSerializer().serializeToString(svgCopy);
    }
    return qrSvgMarkup || "";
  }

  function handleQrDownload(event) {
    event.preventDefault();
    event.stopPropagation();
    if (typeof event.stopImmediatePropagation === "function") {
      event.stopImmediatePropagation();
    }

    if (!qrSvgMarkup) {
      announce("El código QR aún no está disponible. Recarga la página e inténtalo nuevamente.");
      return;
    }

    const svgDocument = serializeQrSvg();
    if (!svgDocument || !/<svg[\\s>]/i.test(svgDocument)) {
      announce("No se pudo preparar el QR en formato SVG. Recarga la página e inténtalo nuevamente.");
      return;
    }

    try {
      const svgBlob = new Blob([svgDocument], { type: "image/svg+xml;charset=utf-8" });
      const objectUrl = URL.createObjectURL(svgBlob);
      const downloadLink = document.createElement("a");
      downloadLink.href = objectUrl;
      downloadLink.download = "tarjeta-digital-qr.svg";
      downloadLink.type = "image/svg+xml";
      downloadLink.setAttribute("aria-hidden", "true");
      downloadLink.tabIndex = -1;
      downloadLink.style.position = "fixed";
      downloadLink.style.left = "-9999px";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();

      // Algunos navegadores móviles procesan la descarga de forma diferida.
      window.setTimeout(function () {
        URL.revokeObjectURL(objectUrl);
      }, 60000);

      announce("Descargando el código QR como tarjeta-digital-qr.svg.");
    } catch (_) {
      announce("El navegador no pudo descargar el SVG. Inténtalo desde el menú del navegador.");
    }
  }

  // Captura el toque en el propio botón QR y evita que llegue a otras acciones.
  downloadQrButton.addEventListener("click", handleQrDownload, true);

  function escapeVCard(value) {
    return String(value || "")
      .replace(/\\/g, "\\\\")
      .replace(/\r\n|\n|\r/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");
  }

  function foldVCardLine(line) {
    const encoder = typeof TextEncoder === "function" ? new TextEncoder() : null;
    const parts = [];
    let current = "";
    let byteCount = 0;
    Array.from(line).forEach(function (character) {
      const size = encoder ? encoder.encode(character).length : unescape(encodeURIComponent(character)).length;
      if (byteCount + size > 75) {
        parts.push(current);
        current = " " + character;
        byteCount = 1 + size;
      } else {
        current += character;
        byteCount += size;
      }
    });
    parts.push(current);
    return parts.join("\r\n");
  }

  function buildVCardFile() {
    const givenName = text(profile.givenName, "");
    const familyName = text(profile.familyName, "");
    const note = [profile.tagline, profile.focus].filter(function (value) {
      return typeof value === "string" && value.trim();
    }).join(" | ");
    const lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      "FN:" + escapeVCard(fullName),
      "N:" + escapeVCard(familyName) + ";" + escapeVCard(givenName) + ";;;"
    ];

    if (profile.company) lines.push("ORG:" + escapeVCard(profile.company));
    if (profile.role) lines.push("TITLE:" + escapeVCard(profile.role));
    if (validEmail) lines.push("EMAIL;TYPE=INTERNET:" + escapeVCard(validEmail));
    if (phone) lines.push("TEL;TYPE=CELL:" + escapeVCard(phone));
    if (whatsapp && whatsapp !== phone) lines.push("TEL;TYPE=CELL:" + escapeVCard(whatsapp));
    if (website) lines.push("URL;TYPE=WORK:" + escapeVCard(website));
    if (linkedin) lines.push("URL;TYPE=PROFILE:" + escapeVCard(linkedin));
    if (github) lines.push("URL;TYPE=WORK:" + escapeVCard(github));
    if (orcid) lines.push("URL;TYPE=WORK:" + escapeVCard(orcid));
    if (note) lines.push("NOTE:" + escapeVCard(note));
    lines.push("END:VCARD");

    const safeName = fullName.normalize("NFKD").toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "") || "contacto";
    const content = lines.map(foldVCardLine).join("\r\n") + "\r\n";
    return {
      blob: new Blob([content], { type: "text/vcard;charset=utf-8" }),
      name: safeName + ".vcf"
    };
  }

  function downloadVCard(contactFile) {
    const objectUrl = URL.createObjectURL(contactFile.blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = contactFile.name;
    anchor.style.display = "none";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(function () { URL.revokeObjectURL(objectUrl); }, 3000);
    announce("Se descargó el contacto .vcf. En Android, abre la descarga y confirma Guardar en Contactos.");
  }

  async function addToContacts() {
    const contactFile = buildVCardFile();

    // En Android y otros móviles compatibles se abre el menú nativo para compartir/importar.
    if (typeof File === "function" && typeof navigator.share === "function" &&
        typeof navigator.canShare === "function") {
      const file = new File([contactFile.blob], contactFile.name, { type: "text/vcard" });
      const shareData = { files: [file], title: "Guardar contacto: " + fullName };
      if (navigator.canShare({ files: [file] })) {
        try {
          await navigator.share(shareData);
          announce("Elige Contactos en el menú del dispositivo para guardar esta ficha.");
          return;
        } catch (error) {
          if (error && error.name === "AbortError") return;
        }
      }
    }

    // Respaldo para navegadores que no comparten archivos vCard: descarga directa del .vcf.
    downloadVCard(contactFile);
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

  contactButton.addEventListener("click", addToContacts);
  document.getElementById("print-button").addEventListener("click", function () {
    window.print();
  });
})();