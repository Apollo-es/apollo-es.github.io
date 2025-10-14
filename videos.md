---
layout: default
title: Vídeos
---

<h1>Vídeos</h1>
<div class="search"><input id="q" type="search" placeholder="Buscar vídeos..."></div>

<div id="items" class="grid">
  {% for item in site.data.items %}
    {% if item.categoria contains "videos" and item.oculto != true %}
      {% include card.html item=item %}
    {% endif %}
  {% endfor %}
</div>
