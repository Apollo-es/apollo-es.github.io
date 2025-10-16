---
layout: default
title: Noticias
permalink: /noticias/
description: "Noticias y filtraciones destacadas sobre videojuegos, consolas y la comunidad Apollo-es."
keywords:
  - "noticias videojuegos"
  - "filtraciones pokemon"
  - "teraleak"
  - "rumores nintendo"
---

<h1>Noticias</h1>
<p>Explora nuestras noticias más leídas y mantente informado sobre filtraciones, anuncios y movimientos clave en la escena gaming.</p>

{% assign noticias = site.data.noticias | sort: 'vistas' | reverse %}
<div class="news-list">
  {% for noticia in noticias %}
  {% assign news_path = '/noticias/' | append: noticia.slug | append: '/' %}
  {% assign share_url = site.url | append: news_path %}
  {% assign share_message = noticia.share_text | default: noticia.resumen %}
  {% assign share_text_encoded = share_message | append: ' ' | append: share_url | uri_escape %}
  {% assign share_hashtags = '' %}
  {% if noticia.share_hashtags %}
    {% capture hashtag_tokens %}
      {% assign tokens = noticia.share_hashtags | split: ' ' %}
      {% for token in tokens %}
        {% assign clean = token | strip | remove: '#' %}
        {% if clean != '' %}{% unless forloop.first %},{% endunless %}{{ clean }}{% endif %}
      {% endfor %}
    {% endcapture %}
    {% assign share_hashtags = hashtag_tokens | strip | replace: ' ', '' %}
  {% endif %}
  <article id="{{ noticia.slug }}" class="news-card news-card-list">
    <div class="news-card-body">
      <p class="news-tag">{{ noticia.tag }}</p>
      <h2>{{ noticia.titulo }}</h2>
      <p class="news-meta">{{ noticia.vistas | default: 0 }} lecturas · {{ noticia.fecha | date: "%d/%m/%Y" }}</p>
      <p>{{ noticia.resumen }}</p>
      <p>{{ noticia.introduccion | truncatewords: 40 }}</p>
      {% if noticia.puntos %}
      <ul class="news-highlights">
        {% for punto in noticia.puntos limit:3 %}
        <li>{{ punto }}</li>
        {% endfor %}
      </ul>
      {% endif %}
      <div class="news-actions">
        <a class="btn primary" href="{{ news_path | relative_url }}"><i class="ti ti-book"></i> Leer la noticia</a>
      </div>
      <div class="news-share" data-share data-share-url="{{ share_url }}" data-share-title="{{ noticia.titulo }}" data-share-text="{{ share_message | append: ' ' | append: share_url }}">
        <span>Compartir:</span>
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
    </div>
  </article>
  {% endfor %}
</div>
