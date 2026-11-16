# Tarjeta Digital — MVP

Tarjeta de presentación en una página web estática, adaptable a móviles y escritorio. No requiere frameworks, instalación de dependencias ni backend.

## Funcionalidades

- Diseño adaptable con orientación automática según el ancho de pantalla.
- Selector manual de tarjeta vertical u horizontal.
- Datos de perfil configurables desde un único archivo.
- Enlaces de correo, teléfono, WhatsApp, web, LinkedIn y ubicación (solo se muestran los campos completados).
- Compartir mediante el menú nativo del dispositivo o copiar el enlace.
- Descargar contacto como archivo \`.vcf\` compatible con agendas habituales.
- Vista de impresión para guardar como PDF o imprimir.
- Sin analítica, cookies, formularios ni almacenamiento de datos personales en un servidor.

## Personalización

1. Abre [profile.js](./profile.js).
2. Reemplaza el nombre, cargo, organización y descripción.
3. Completa únicamente los medios de contacto que quieras publicar. Deja los demás como cadena vacía (\`""\`).
4. Para WhatsApp, utiliza el número internacional con código de país, solo dígitos.
5. Para fotografía, web y LinkedIn, utiliza direcciones HTTPS.
6. Guarda los cambios y vuelve a cargar la página.

**Importante:** el repositorio es público y la web publicada también lo será. No incluyas domicilio particular, datos sensibles ni medios de contacto que no quieras hacer públicos. Los datos colocados en \`profile.js\` se entregan al navegador de cualquier visitante.

## Publicación en GitHub Pages

El flujo de GitHub Actions en \`.github/workflows/deploy.yml\` publica automáticamente el contenido de la rama \`main\`.

1. En GitHub, abre **Settings → Pages**.
2. En **Build and deployment**, selecciona **GitHub Actions** como fuente si todavía no está configurada.
3. Abre la pestaña **Actions** y comprueba que el flujo **Deploy static site to GitHub Pages** finalice correctamente.
4. La URL esperada para este repositorio es:  
   \`https://cwvillanuevam.github.io/tarjeta-digital-mvp-/\`

La primera publicación puede requerir habilitar Pages desde Settings. El flujo no publica hasta que GitHub Pages esté habilitado.

## Código QR

El QR contiene la URL pública `https://cwvillanuevam.github.io/tarjeta-digital-mvp-/`. Es estático: no cambia al editar el perfil, siempre que se mantenga la misma URL del sitio. Si cambias el nombre del repositorio o el dominio publicado, tendrás que regenerar e imprimir un QR nuevo. La generación se realiza en el navegador; no se envían datos a un generador externo.

## Estructura

- \`index.html\`: estructura y contenido de la página.
- \`styles.css\`: diseño y reglas responsive/impresión.
- \`app.js\`: interacciones y generación del contacto vCard.
- \`profile.js\`: datos editables del titular.
- \`.github/workflows/deploy.yml\`: publicación en GitHub Pages.

## Pruebas manuales recomendadas

- Abrir en móvil y escritorio.
- Cambiar entre Auto, Vertical y Horizontal.
- Probar los enlaces de contacto después de personalizar \`profile.js\`.
- Descargar y abrir el archivo \`.vcf\`.
- Probar Compartir desde un navegador móvil compatible.
- Usar Imprimir y revisar la vista previa antes de guardar o imprimir.

## Licencia

Este proyecto conserva la licencia indicada en el repositorio.