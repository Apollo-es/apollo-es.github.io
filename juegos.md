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
<div class="search"><input id="q" type="search" placeholder="Buscar juegos..."></div>

<section class="filters" id="game-filters" aria-label="Filtrar catálogo de juegos">
  <div class="filter-group">
    <label for="filter-console">Consola</label>
    <select id="filter-console" data-placeholder="Todas">
      <option value="">Todas</option>
    </select>
  </div>
  <div class="filter-group">
    <label for="filter-developer">Desarrolladora</label>
    <select id="filter-developer" data-placeholder="Todas">
      <option value="">Todas</option>
    </select>
  </div>
  <div class="filter-group">
    <label for="filter-genre">Género</label>
    <select id="filter-genre" data-placeholder="Todos">
      <option value="">Todos</option>
    </select>
  </div>
  <div class="filter-actions">
    <button class="btn alt" type="button" id="filter-reset">Limpiar filtros</button>
  </div>
</section>

<div id="items" class="grid">
  {% for item in site.data.items %}
    {% if item.categoria contains "juegos" and item.oculto != true %}
      {% include card.html item=item %}
    {% endif %}
  {% endfor %}
</div>
