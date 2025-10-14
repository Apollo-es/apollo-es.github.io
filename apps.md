---
layout: default
title: Apps
permalink: /apps/
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
