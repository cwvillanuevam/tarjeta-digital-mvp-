# Tarjeta profesional — Carlos Wyller Villanueva Machado

Tarjeta de presentación digital estática, adaptable a móviles y escritorio, con enlaces profesionales y una ficha de contacto vCard. Se publica mediante GitHub Pages; no requiere backend ni dependencias externas para funcionar.

## Datos del perfil

El archivo `profile.js` contiene los datos visibles y los enlaces públicos del titular:
- Nombre, cargo y organización.
- Correo personal y teléfono.
- Portafolio, LinkedIn, GitHub y ORCID.
- Descripción profesional y áreas de especialización.

Los campos vacíos no se muestran. No se incluye dirección física ni correo institucional. El repositorio y la web son públicos: cualquier dato incluido en `profile.js` puede ser consultado por los visitantes. Revisa los datos antes de añadir información nueva.

## Funcionalidades

- Tarjeta profesional vertical u horizontal con adaptación automática al dispositivo.
- Modo de presentación a pantalla completa, sin scroll, activado por el usuario.
- Enlaces directos a correo, teléfono, portafolio y perfiles profesionales.
- Compartir la tarjeta mediante el menú nativo del dispositivo o copiar el enlace.
- Añadir a contactos mediante el menú nativo de compartir archivos cuando el navegador lo admite.
- Alternativa de descarga de un archivo vCard `.vcf`, compatible con aplicaciones de contactos.
- Descarga de un QR estático que apunta a la URL pública de la tarjeta.
- Vista de impresión para guardar como PDF.
- Sin analítica, cookies, formularios ni almacenamiento de contactos en un servidor.

## Añadir a contactos desde un móvil

1. Pulsa **Añadir a contactos**.
2. En Android compatible, el navegador abre el menú nativo de compartir: selecciona **Contactos** o la opción de guardar contacto que ofrezca el dispositivo.
3. Si el navegador no puede compartir archivos, se descarga un archivo `.vcf`. Ábrelo desde Descargas y confirma la importación en Contactos.

El proceso requiere confirmación del usuario; una página web no puede guardar datos silenciosamente en la agenda del teléfono.

## Personalización

Edita `profile.js` y deja como cadena vacía (`""`) cualquier campo que no quieras publicar. Para añadir un perfil social, utiliza una URL HTTPS. WhatsApp solo debe completarse cuando se haya confirmado el número internacional correspondiente.

## Publicación

El workflow de GitHub Actions publica automáticamente la rama `main` en GitHub Pages. La URL pública es:

`https://cwvillanuevam.github.io/tarjeta-digital-mvp-/`

## Código QR

El QR contiene la URL pública canónica. Es estático y no cambia al actualizar los datos del perfil mientras se mantenga la misma URL del sitio. La generación se realiza localmente en el navegador.

## Estructura

- `index.html`: estructura y contenido de la página.
- `styles.css`: diseño responsive, presentación e impresión.
- `app.js`: interacciones, generación de vCard y QR.
- `profile.js`: datos y enlaces públicos del titular.
- `.github/workflows/deploy.yml`: publicación en GitHub Pages.
- `vendor/qrcode.js`: generador de QR local.
