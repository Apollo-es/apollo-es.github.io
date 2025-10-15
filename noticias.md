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
  <article id="{{ noticia.slug }}" class="news-card news-card-list">
    <div class="news-card-body">
      <p class="news-tag">{{ noticia.tag }}</p>
      <h2>{{ noticia.titulo }}</h2>
      <p class="news-meta">{{ noticia.vistas | default: 0 }} lecturas · {{ noticia.fecha | date: "%d/%m/%Y" }}</p>
      <p>{{ noticia.resumen }}</p>
      <p>{{ noticia.introduccion }}</p>
      {% if noticia.puntos %}
      <ul class="news-highlights">
        {% for punto in noticia.puntos %}
        <li>{{ punto }}</li>
        {% endfor %}
      </ul>
      {% endif %}
      {% if noticia.quote %}
      <p class="news-quote">«{{ noticia.quote.texto }}» — <a href="{{ noticia.quote.url }}" target="_blank" rel="noopener">{{ noticia.quote.autor }}</a></p>
      {% endif %}
      {% assign share_url = site.url | append: page.url | append: '#' | append: noticia.slug %}
      {% assign share_text = noticia.share_text | default: noticia.resumen | uri_escape %}
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
      <div class="news-share" data-share data-share-url="{{ share_url }}" data-share-title="{{ noticia.titulo }}" data-share-text="{{ noticia.share_text | default: noticia.resumen }}">
        <span>Compartir:</span>
        <a class="btn share" href="https://twitter.com/intent/tweet?url={{ share_url | uri_escape }}&text={{ share_text }}{% if share_hashtags != '' %}&hashtags={{ share_hashtags | uri_escape }}{% endif %}" target="_blank" rel="noopener" data-platform="x">
          <i class="ti ti-brand-twitter"></i> X
        </a>
        <a class="btn share" href="https://www.facebook.com/sharer/sharer.php?u={{ share_url | uri_escape }}&quote={{ share_text }}" target="_blank" rel="noopener" data-platform="facebook">
          <i class="ti ti-brand-facebook"></i> Facebook
        </a>
        <a class="btn share" href="https://wa.me/?text={{ share_text }}%20{{ share_url | uri_escape }}" target="_blank" rel="noopener" data-platform="whatsapp">
          <i class="ti ti-brand-whatsapp"></i> WhatsApp
        </a>
      </div>
      <div class="news-ads">
        <div class="ad-slot" aria-label="Anuncio 300×250" role="complementary">
          <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2672781546777359"
                  crossorigin="anonymous"></script>
          <!-- bloque -->
          <ins class="adsbygoogle"
               style="display:inline-block;width:300px;height:250px"
               data-ad-client="ca-pub-2672781546777359"
               data-ad-slot="6352596482"></ins>
          <script>
            (adsbygoogle = window.adsbygoogle || []).push({});
          </script>
        </div>
        <div class="ad-slot ad-slot-wide" aria-label="Anuncio 728×90" role="complementary">
          <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2672781546777359"
                  crossorigin="anonymous"></script>
          <!-- bloque 2 -->
          <ins class="adsbygoogle"
               style="display:inline-block;width:728px;height:90px"
               data-ad-client="ca-pub-2672781546777359"
               data-ad-slot="7118883249"></ins>
          <script>
            (adsbygoogle = window.adsbygoogle || []).push({});
          </script>
        </div>
      </div>
    </div>
  </article>
  {% endfor %}
</div>
