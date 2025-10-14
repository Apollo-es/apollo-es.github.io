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
- Las secciones dinámicas como emuladores y foros usan `_data/emuladores.yml` y `_data/foros.yml` respectivamente.

## SEO y metadatos

El layout principal integra `jekyll-seo-tag`, datos estructurados y una imagen de previsualización en `static/branding/site-preview.svg`. Puedes actualizar dicha imagen o los metadatos globales modificando `_config.yml`.

## Licencia

El contenido se distribuye bajo la licencia incluida en `LICENSE`.
