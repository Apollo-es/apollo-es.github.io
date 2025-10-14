---
layout: default
title: Guías
permalink: /guias/
description: "Plantillas y recopilaciones para crear guías de videojuegos y emuladores en Apollo-es."
keywords:
  - "guias pokemon"
  - "walkthrough apollo"
  - "tutoriales emuladores"
  - "plantilla guias"
---

{% assign grupos = site.data.guias %}

<h1>Guías</h1>
<p class="lead">Aquí reunimos las plantillas y walkthroughs que iremos publicando. Empieza duplicando la plantilla base y completa las secciones con tus propios aportes. Las portadas se rellenan automáticamente si añades la imagen en <code>static/juegos</code> o <code>static/guias</code>.</p>

<div class="guides-groups">
  {% for grupo in grupos %}
    <section class="guide-group" id="guias-{{ grupo.categoria | slugify }}">
      <header class="guide-header">
        <h2>{{ grupo.icono }} {{ grupo.categoria }}</h2>
        <p>{{ grupo.descripcion }}</p>
      </header>
      <div class="guide-grid">
        {% for guia in grupo.guias %}
          <article class="guide-card">
            {% assign resolved_cover = '' %}
            {% assign remote_cover = guia.portada_remota | default: '' | strip %}
            {% assign cover = guia.portada | default: '' %}
            {% if cover == '' %}
              {% assign cover = '/static/guias/' | append: guia.id | append: '.png' %}
            {% endif %}
            {% if cover == '' %}
              {% assign cover = '/static/juegos/' | append: guia.id | append: '.png' %}
            {% endif %}
            {% assign cover = cover | append: '' | strip %}
            {% if cover != '' %}
              {% assign cover_prefix = cover | slice: 0,5 %}
              {% if cover contains '://' or cover_prefix == 'data:' %}
                {% assign resolved_cover = cover %}
              {% else %}
                {% assign resolved_cover = cover | relative_url %}
              {% endif %}
            {% endif %}
            <div class="guide-media">
              {% if resolved_cover %}
                <img src="{{ resolved_cover | escape }}"
                     alt="Portada de {{ guia.titulo }}"
                     loading="lazy"
                     onerror="this.dataset.fallbackLoaded ? this.remove() : (this.dataset.fallbackLoaded = '1', this.src='{{ remote_cover | escape }}');">
              {% elsif remote_cover %}
                <img src="{{ remote_cover | escape }}"
                     alt="Portada de {{ guia.titulo }}"
                     loading="lazy"
                     onerror="this.remove();">
              {% endif %}
            </div>
            <div class="guide-body">
              <h3>{{ guia.titulo }}</h3>
              <p>{{ guia.resumen }}</p>
              <a class="btn primary" href="{{ guia.url }}">Abrir guía</a>
            </div>
          </article>
        {% endfor %}
      </div>
    </section>
  {% endfor %}
</div>
