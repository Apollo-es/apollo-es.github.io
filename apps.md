---
layout: default
title: Apps
permalink: /apps/
description: "Utilidades y aplicaciones gamer con enlaces oficiales y actualizaciones rápidas."
keywords:
  - "apps gaming"
  - "utilidades pc"
  - "descargar apk"
  - "herramientas stream"
---

<h1>Apps</h1>
<div class="search"><input id="q" type="search" placeholder="Buscar apps..."></div>

<div id="items" class="grid">
  {% for item in site.data.items %}
    {% if item.categoria contains "apps" and item.oculto != true %}
      {% include card.html item=item %}
    {% endif %}
  {% endfor %}
</div>
<p class="catalog-empty" data-empty hidden>No encontramos apps que coincidan con tu búsqueda. Ajusta los filtros o consulta de nuevo más tarde.</p>
