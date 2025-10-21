# Apollo-es

Portal comunitario con descargas verificadas de juegos, vídeos, apps y emuladores. Este repositorio contiene el código del sitio estático que se publica en GitHub Pages.

## Requisitos

- Ruby 3.1 o superior
- [Bundler](https://bundler.io/)

## Instalación y desarrollo local

1. Instala las dependencias una vez:
   ```bash
   bundle install
   ```
2. Levanta un servidor de desarrollo con recarga:
   ```bash
   bundle exec jekyll serve --livereload
   ```
3. Genera la versión final lista para desplegar:
   ```bash
   bundle exec jekyll build
   ```

## Configuración

- Ajusta los datos generales del sitio (título, descripción, enlaces de navegación) en `_config.yml`.
- Las tarjetas de recursos se cargan desde `_data/items.yml`.
- Puedes asignar portadas como rutas relativas, URLs completas o `data:` URIs en base64 si prefieres evitar subir archivos binarios al repositorio.
- Las secciones dinámicas como emuladores, guías y foros usan `_data/emuladores.yml`, `_data/guias.yml` y `_data/foros.yml` respectivamente.
- Añade tus credenciales en `_config.yml` (`disqus_shortname` y `google_client_id`) para activar los comentarios y el inicio de sesión con Google en la sección de Foros.

### Integración con Firebase (plan futuro)

El repositorio incluye `static/config/firebase.config.sample.js`, un esqueleto con claves y colecciones recomendadas para conectar Apollo-es con Firebase. Para ponerlo en marcha:

1. **Crea el proyecto y la app web**
   - Entra en <https://console.firebase.google.com>, crea un nuevo proyecto y añade una app web (marca la casilla de Firebase Hosting solo si planeas usarlo).
   - Copia las credenciales generadas (apiKey, authDomain, projectId, etc.).
2. **Duplica la configuración de ejemplo**
   - Copia `static/config/firebase.config.sample.js` a `static/config/firebase.config.js`.
   - Pega las credenciales de la app web en el nuevo archivo y ajusta los nombres de colecciones si usas estructuras distintas.
3. **Prepara los servicios necesarios**
   - Activa Authentication (Email/Password y los proveedores sociales que necesites).
   - Habilita Firestore Database en modo Production y, si vas a almacenar portadas o archivos, habilita también Storage.
   - Configura App Check desde la consola si quieres proteger el sitio contra abuso.
4. **Define las reglas de seguridad**
   - Limita la lectura/escritura de `users` a cada usuario autenticado.
   - Permite escritura anónima en `reports`, pero restringe su lectura a roles administrativos.
   - Para `searchSignals` y `savedGames` crea reglas que validen la estructura de los documentos y eviten escrituras masivas.
5. **Carga la configuración en el front-end**
   - Enlaza el archivo `firebase.config.js` desde un script cargado en `_layouts/default.html` o en el bundle que prefieras.
   - Inicializa Firebase en `assets/js/app.js` (o en un módulo separado) importando `firebaseConfig`, `collections` y `securityNotes` para mantener los nombres sincronizados.
6. **Mantén las credenciales fuera del repositorio**
   - `firebase.config.js` ya está listado en `.gitignore`, por lo que no se subirá a Git.
   - Guarda una copia segura del archivo para replicar la configuración en otros entornos.

Cuando se integre la autenticación, se podrá consumir la configuración desde un script que inicialice Firebase en el navegador y sincronice los reportes o sesiones del chatbot.

## Problemas frecuentes

- Si ves un error `Missing required parameter: client_id` al intentar autenticarte con Google, revisa que `google_client_id` esté definido en `_config.yml` (puedes obtenerlo en <https://console.cloud.google.com/apis/credentials>). Mientras esté vacío, el acceso se permitirá sin autenticación.
- En entornos sin acceso a rubygems.org, `bundle install` puede fallar con `403 Forbidden`. Ejecuta el comando desde una red con acceso a internet o instala las dependencias manualmente.

## SEO y metadatos

- El layout principal integra `jekyll-seo-tag`, datos estructurados y una imagen de previsualización en `static/branding/site-preview.svg`.
- La portada añade un bloque FAQ en JSON-LD y nuevos módulos optimizados para palabras clave largas (roms, guías, foros, IA).
- Actualiza `_config.yml` si quieres añadir más palabras clave o perfiles sociales.

## IA y experiencia de usuario

El portal integra “Apollo AI”, un asistente semántico que funciona 100% en el navegador. Combina coincidencias por sinónimos, tendencias locales (almacenadas en `localStorage`) y enlaces contextuales al catálogo. Así los visitantes obtienen respuestas inmediatas sobre ROMs verificadas, guías, foros y noticias sin depender de un backend propio.

## Licencia

El contenido se distribuye bajo la licencia incluida en `LICENSE`.
