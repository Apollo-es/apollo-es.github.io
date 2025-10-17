---
layout: default
title: Inicio
description: "Encuentra descargas verificadas de juegos, vídeos, apps y emuladores listos para tu consola o PC."
keywords:
  - "descargar juegos"
  - "roms nintendo switch"
  - "mega mediafire drive"
  - "emuladores recomendados"
---

<div class="home-catalog" data-catalog-root>
  <div class="hero">
    <h1>Bienvenido a <strong>Apollo-es</strong></h1>
    <p>Descargas curadas de <strong>Juegos</strong> y <strong>Vídeos</strong> — alojadas en Mega, Mediafire, Drive y más. Todo con permiso.</p>
    <div class="search">
      <input id="q" type="search" placeholder="Buscar juegos, vídeos, apps...">
      <a class="btn primary" href="/enviar"><i class="ti ti-upload"></i> Enviar recurso</a>
    </div>
  </div>

{% assign noticias = site.data.noticias | sort: 'vistas' | reverse %}
{% assign destacada = noticias | first %}

{% if destacada %}
<section class="news-section">
  <header class="news-header">
    <h2>Noticias destacadas</h2>
    <p>Mantente al día con los proyectos y filtraciones más sonadas de la comunidad gaming.</p>
  </header>

  <div class="news-grid">
    <article id="{{ destacada.slug }}" class="news-card">
      <div class="news-card-body">
        <p class="news-tag">{{ destacada.tag }}</p>
        <h3>{{ destacada.titulo }}</h3>
        <p>{{ destacada.introduccion }}</p>
        {% if destacada.quote %}
        <p class="news-quote">«{{ destacada.quote.texto }}» — <a href="{{ destacada.quote.url }}" target="_blank" rel="noopener">{{ destacada.quote.autor }}</a></p>
        {% endif %}
        {% if destacada.puntos %}
        <ul class="news-highlights">
          {% for punto in destacada.puntos %}
          <li>{{ punto }}</li>
          {% endfor %}
        </ul>
        {% endif %}
        <div class="news-excerpt">
          <p>{{ destacada.introduccion | truncatewords: 40 }}</p>
        </div>
        {% assign news_path = '/noticias/' | append: destacada.slug | append: '/' %}
        {% assign share_url = site.url | append: news_path %}
        {% assign share_message = destacada.share_text | default: destacada.resumen %}
        {% assign share_text_encoded = share_message | append: ' ' | append: share_url | uri_escape %}
        {% assign share_hashtags = '' %}
        {% if destacada.share_hashtags %}
          {% capture hashtag_tokens %}
            {% assign tokens = destacada.share_hashtags | split: ' ' %}
            {% for token in tokens %}
              {% assign clean = token | strip | remove: '#' %}
              {% if clean != '' %}{% unless forloop.first %},{% endunless %}{{ clean }}{% endif %}
            {% endfor %}
          {% endcapture %}
          {% assign share_hashtags = hashtag_tokens | strip | replace: ' ', '' %}
        {% endif %}
        <div class="news-share" data-share data-share-url="{{ share_url }}" data-share-title="{{ destacada.titulo }}" data-share-text="{{ share_message | append: '\n' | append: share_url }}">
          <span>Compartir:</span>
          <button class="btn share share-native" type="button" data-share-native>
            <i class="ti ti-share-3"></i> Compartir ahora
          </button>
          <a class="btn share" href="https://twitter.com/intent/tweet?url={{ share_url | uri_escape }}&text={{ share_text_encoded }}{% if share_hashtags != '' %}&hashtags={{ share_hashtags | uri_escape }}{% endif %}" target="_blank" rel="noopener" data-platform="x">
            <i class="ti ti-brand-twitter"></i> X
          </a>
          <a class="btn share" href="https://www.facebook.com/sharer/sharer.php?u={{ share_url | uri_escape }}&quote={{ share_text_encoded }}" target="_blank" rel="noopener" data-platform="facebook">
            <i class="ti ti-brand-facebook"></i> Facebook
          </a>
          <a class="btn share" href="https://wa.me/?text={{ share_text_encoded }}" target="_blank" rel="noopener" data-platform="whatsapp">
            <i class="ti ti-brand-whatsapp"></i> WhatsApp
          </a>
        </div>
        <p class="news-meta">{{ destacada.fecha | date: "%d/%m/%Y" }}</p>
        <a class="btn primary news-read-more" href="{{ news_path | relative_url }}"><i class="ti ti-book"></i> Leer más</a>
      </div>
    </article>
  </div>

  {% if noticias.size > 1 %}
  <div class="news-secondary">
    {% for noticia in noticias offset:1 %}
    {% assign item_path = '/noticias/' | append: noticia.slug | append: '/' %}
    <a class="news-secondary-card" href="{{ item_path | relative_url }}">
      <span class="news-secondary-tag">{{ noticia.tag }}</span>
      <span class="news-secondary-title">{{ noticia.titulo }}</span>
      <span class="news-secondary-meta">{{ noticia.fecha | date: "%d/%m/%Y" }}</span>
    </a>
    {% endfor %}
  </div>
  {% endif %}
</section>
{% endif %}

  <section class="home-featured">
    <header class="home-featured-header">
      <h2>Más buscados por la comunidad</h2>
      <p>Las fichas de descarga con más interés de la semana. Accede a cada una para ver enlaces actualizados y avisos.</p>
    </header>

    {% assign juegos = site.data.items | where_exp: "item", "item.categoria contains 'juegos'" %}
    {% assign visibles = juegos | where_exp: "item", "item.oculto != true" %}
    {% assign populares = visibles | sort: 'busquedas' | reverse %}
    {% assign destacados = populares | slice: 0, 4 %}
    <div class="grid home-featured-grid" data-catalog-grid>
      {% for juego in destacados %}
        {% if juego %}
          {% include card.html item=juego %}
        {% endif %}
      {% endfor %}
    </div>
    <p class="catalog-empty" data-catalog-empty hidden>No encontramos coincidencias con tu búsqueda en la portada. Prueba con otros términos o visita el catálogo completo.</p>
  </section>
</div>
