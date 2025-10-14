---
layout: default
title: Juegos
permalink: /juegos/
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
