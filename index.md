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

<div class="hero">
  <h1>Bienvenido a <strong>Apollo-es</strong></h1>
  <p>Descargas curadas de <strong>Juegos</strong>, <strong>Vídeos</strong> y <strong>Apps</strong> — alojadas en Mega, Mediafire, Drive y más. Todo con permiso.</p>
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
        {% assign share_url = site.url | append: '/noticias/#' | append: destacada.slug %}
        {% assign share_text = destacada.share_text | default: destacada.resumen | uri_escape %}
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
        <div class="news-share" data-share data-share-url="{{ share_url }}" data-share-title="{{ destacada.titulo }}" data-share-text="{{ destacada.share_text | default: destacada.resumen }}">
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
        <p class="news-meta">{{ destacada.fecha | date: "%d/%m/%Y" }}</p>
        <a class="btn primary news-read-more" href="/noticias/#{{ destacada.slug }}"><i class="ti ti-book"></i> Leer más</a>
      </div>

      <aside class="news-aside">
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
      </aside>
    </article>
  </div>

  {% if noticias.size > 1 %}
  <div class="news-secondary">
    {% for noticia in noticias offset:1 %}
    <a class="news-secondary-card" href="/noticias/#{{ noticia.slug }}">
      <span class="news-secondary-tag">{{ noticia.tag }}</span>
      <span class="news-secondary-title">{{ noticia.titulo }}</span>
      <span class="news-secondary-meta">{{ noticia.fecha | date: "%d/%m/%Y" }}</span>
    </a>
    {% endfor %}
  </div>
  {% endif %}
</section>
{% endif %}

<div id="items" class="grid">
  {% for item in site.data.items %}
    {% unless item.oculto %}
      {% include card.html item=item %}
    {% endunless %}
  {% endfor %}
</div>
<p class="catalog-empty" data-empty hidden>No encontramos coincidencias con tu búsqueda en la portada. Prueba con otros términos o visita el catálogo completo.</p>
