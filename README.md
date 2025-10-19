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

El repositorio incluye `static/config/firebase.config.sample.js`, un esqueleto con claves y colecciones recomendadas para conectar Apollo-es con Firebase.

1. Duplica el archivo, renómbralo como `firebase.config.js` y colócalo en el mismo directorio (`static/config/`).
2. Completa los valores que ofrece la consola de Firebase (`apiKey`, `authDomain`, etc.).
3. Ajusta el nombre de las colecciones para usuarios, reportes y señales de búsqueda según tu plan de datos.
4. Respeta las recomendaciones de seguridad incluidas en el archivo y establece reglas estrictas en Firestore.
5. `firebase.config.js` ya está listado en `.gitignore` para evitar que las credenciales se suban accidentalmente.

Cuando se integre la autenticación, se podrá consumir la configuración desde un script que inicialice Firebase en el navegador y sincronice los reportes o sesiones del chatbot.

## Problemas frecuentes

- Si ves un error `Missing required parameter: client_id` al intentar autenticarte con Google, revisa que `google_client_id` esté definido en `_config.yml` (puedes obtenerlo en <https://console.cloud.google.com/apis/credentials>). Mientras esté vacío, el acceso se permitirá sin autenticación.
- En entornos sin acceso a rubygems.org, `bundle install` puede fallar con `403 Forbidden`. Ejecuta el comando desde una red con acceso a internet o instala las dependencias manualmente.

## SEO y metadatos

- El layout principal integra `jekyll-seo-tag`, datos estructurados y una imagen de previsualización en `static/branding/site-preview.svg`.
- La portada añade un bloque FAQ en JSON-LD y nuevos módulos optimizados para palabras clave largas (roms, guías, foros, IA).
- Actualiza `_config.yml` si quieres añadir más palabras clave o perfiles sociales.

## IA y experiencia de usuario

Se añadió un widget “Apollo IA” que guía a los visitantes hacia juegos, guías, foros y noticias. El chatbot actual usa respuestas predefinidas pensadas para enlazar con la arquitectura del sitio, pero su interfaz y gancho están listas para conectarse a un backend con IA real o a Firebase Functions.

## Licencia

El contenido se distribuye bajo la licencia incluida en `LICENSE`.
