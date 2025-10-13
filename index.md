---
layout: default
title: Inicio
---

<div class="hero">
  <h1>Bienvenido a <strong>Apollo-es</strong></h1>
  <p>Descargas curadas de <strong>Juegos</strong>, <strong>Vídeos</strong> y <strong>Apps</strong> — alojadas en Mega, Mediafire, Drive y más. Todo con permiso.</p>
  <div class="search">
    <input id="q" type="search" placeholder="Buscar juegos, vídeos, apps...">
    <a class="btn primary" href="/enviar"><i class="ti ti-upload"></i> Enviar recurso</a>
  </div>
</div>

<div id="items" class="grid">
  {% for item in site.data.items %}
    {% unless item.oculto %}
      {% include card.html item=item %}
    {% endunless %}
  {% endfor %}
</div>
