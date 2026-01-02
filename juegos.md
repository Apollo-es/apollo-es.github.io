---
layout: default
title: Juegos
permalink: /juegos/
description: "Catálogo de videojuegos listos para descargar con ROM base, actualizaciones y DLC en Mega, MediaFire y Google Drive."
keywords:
  - "descargar juegos switch"
  - "roms nintendo"
  - "dlc mega"
  - "actualizacion juegos"
---

<h1>Juegos</h1>
<p class="lead">🎄 Aviso navideño: estamos cargando las fichas de Inazuma, Pokémon y Yo-kai con sus traducciones al castellano. Verás los botones “Próximamente” en las descargas mientras publicamos los enlaces definitivos.</p>
<div data-catalog-root>
<div class="search"><input id="q" type="search" placeholder="Buscar juegos..."></div>

<section class="filters" id="game-filters" aria-label="Filtrar catálogo de juegos">
  <div class="filter-group">
    <label for="filter-console">Consola</label>
    <input id="filter-console" class="filter-combobox" type="search" list="filter-console-options" autocomplete="off" placeholder="Todas las consolas">
    <datalist id="filter-console-options"></datalist>
  </div>
  <div class="filter-group">
    <label for="filter-developer">Desarrolladora</label>
    <input id="filter-developer" class="filter-combobox" type="search" list="filter-developer-options" autocomplete="off" placeholder="Todos los estudios">
    <datalist id="filter-developer-options"></datalist>
  </div>
  <div class="filter-group">
    <label for="filter-genre">Género</label>
    <input id="filter-genre" class="filter-combobox" type="search" list="filter-genre-options" autocomplete="off" placeholder="Todos los géneros">
    <datalist id="filter-genre-options"></datalist>
  </div>
  <div class="filter-group filter-group-small">
    <label for="filter-sort">Ordenar por</label>
    <select id="filter-sort">
      <option value="relevance">Relevancia</option>
      <option value="searches">Más buscados</option>
      <option value="new">Novedades</option>
    </select>
  </div>
  <div class="filter-actions">
    <button class="btn alt" type="button" id="filter-reset">Limpiar filtros</button>
  </div>
</section>

<div class="grid" data-catalog-grid>
  {% for item in site.data.items %}
    {% if item.categoria contains "juegos" and item.oculto != true %}
      {% include card.html item=item %}
    {% endif %}
  {% endfor %}
</div>
<p class="catalog-empty" data-catalog-empty hidden>No encontramos coincidencias para tu búsqueda. Ajusta los filtros o prueba con otro término.</p>
</div>
