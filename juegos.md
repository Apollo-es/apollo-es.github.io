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

<div id="items" class="grid">
  {% for item in site.data.items %}
    {% if item.categoria contains "juegos" and item.oculto != true %}
      {% include card.html item=item %}
    {% endif %}
  {% endfor %}
</div>
