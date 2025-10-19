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
    <p>Somos el hub <strong>#1 en español</strong> para descargas verificadas, guías expertas, foros de soporte y noticias gaming con la chispa de la IA. Encuentra fichas listas para jugar sin perseguir enlaces rotos.</p>
    <ul class="hero-highlights">
      <li><i class="ti ti-sparkles"></i> Formula preguntas como «mejores roms de Zelda» y <strong>Apollo AI</strong> te abre fichas y guías relacionadas al instante.</li>
      <li><i class="ti ti-graph"></i> Seguimos estadísticas de descargas, reseñas y foros para destacar lo más útil cada día.</li>
      <li><i class="ti ti-device-gamepad-2"></i> Configuraciones y perfiles optimizados para emuladores next-gen listos para aplicar.</li>
    </ul>
    <div class="search">
      <div class="search-intro">
        <strong>Buscador semántico con Apollo AI</strong>
        <p>Escribe títulos, géneros o dudas técnicas y la IA te responde con fichas verificadas, firmware y foros activos en cuestión de segundos.</p>
      </div>
      <label class="sr-only" for="q">Busca juegos, guías, foros o noticias</label>
      <input id="q" type="search" placeholder="Busca juegos, vídeos, apps, guías o foros...">
      <div class="search-actions">
        <a class="btn primary" href="/enviar" aria-label="¿Quieres enviarnos un recurso? Abre la guía de envío"><i class="ti ti-upload"></i> ¿Quieres enviarnos un recurso?</a>
        <p class="search-help">¿Tienes material verificado? Revisa la <a href="/enviar/">guía de envíos</a> para conocer requisitos de licencia, mirrors permitidos y el correo de contacto.</p>
      </div>
    </div>
  </div>

  <section class="home-ai" id="apollo-ai">
    <div class="home-ai-copy">
      <h2>Conoce a Apollo AI</h2>
      <p>Apollo AI cruza embeddings locales, heurísticas semánticas y el inventario vivo de Apollo-es para responder con lenguaje natural. Cada vez que añadimos un juego, guía, noticia o herramienta, el asistente lo aprende de forma automática en tu navegador.</p>
      <ul class="ai-perks">
        <li><i class="ti ti-target"></i> Matching semántico afinado que entiende sagas, géneros, idiomas y plataformas incluso si escribes con variaciones.</li>
        <li><i class="ti ti-sparkles"></i> Genera listados dinámicos con los recursos más recientes y los guarda como accesos directos locales.</li>
        <li><i class="ti ti-shield-lock"></i> Todo el procesamiento ocurre en tu dispositivo, con moderación y filtros anti-spam privados.</li>
      </ul>
    </div>
    <div class="home-ai-widget" data-ai-widget>
      <header class="widget-header">
        <span class="widget-eyebrow">Apollo AI (beta)</span>
        <h3>¿En qué podemos ayudarte?</h3>
      </header>
      <div class="widget-body">
        <div class="chat-window" data-ai-messages>
          <div class="chat-message bot">Hola, soy Apollo AI. Pregunta por <strong>roms</strong>, <strong>guías</strong>, <strong>foros</strong> o <strong>noticias</strong> y te llevo allí.</div>
        </div>
        <form class="chat-form" data-ai-form>
          <label class="sr-only" for="apollo-ai-input">Escribe tu consulta</label>
          <input id="apollo-ai-input" name="q" type="text" placeholder="Ej. mejores roms de Mario, foros de Pokémon..." autocomplete="off" required>
          <button class="btn primary" type="submit"><i class="ti ti-send"></i></button>
        </form>
        <div class="chat-suggestions" data-ai-suggestions>
          <button type="button" data-ai-suggestion="roms switch">Roms Switch</button>
          <button type="button" data-ai-suggestion="guías pokemon">Guías Pokémon</button>
          <button type="button" data-ai-suggestion="foro comunidad">Foros</button>
          <button type="button" data-ai-suggestion="noticias filtraciones">Noticias</button>
        </div>
        <div class="chat-trending" data-ai-trending hidden>
          <p class="chat-trending-title"><i class="ti ti-trending-up"></i> Consultas populares generadas por Apollo AI</p>
          <div class="chat-trending-list" data-ai-trending-list></div>
        </div>
      </div>
    </div>
  </section>

{% assign noticias = site.data.noticias | sort: 'fecha' | reverse %}
{% assign destacadas = noticias | slice: 0, 3 %}

{% capture destacado_ids %}{% for item in destacadas %}{{ item.slug }}{% unless forloop.last %},{% endunless %}{% endfor %}{% endcapture %}

{% if destacadas.size > 0 %}
<section class="home-featured" aria-labelledby="destacados-heading">
  <header class="home-featured-header">
    <h2 id="destacados-heading">Entradas destacadas</h2>
    <p>Empieza por las fichas, guías y herramientas que la comunidad consulta ahora mismo.</p>
  </header>
  <div class="featured-grid" data-ai-sync="resources">
    {% assign destacados_recursos = site.data.items | where_exp: "item", "item.oculto != true" %}
    {% for recurso in destacados_recursos limit:3 %}
      {% assign categoria = recurso.categoria | first | default: '' %}
      {% assign base_path = '/' | append: categoria | append: '/' %}
      {% assign recurso_url = base_path | append: recurso.id | append: '/' %}
      <article class="featured-card" data-ai-entry data-ai-type="{{ categoria }}" data-ai-title="{{ recurso.titulo | escape }}" data-ai-summary="{{ recurso.descripcion | strip_html | strip_newlines | escape }}" data-ai-url="{{ recurso_url | relative_url }}" data-ai-tags="{{ recurso.hashtags | join: ' ' | escape }}">
        <div class="featured-media">
          {% if recurso.portada %}
          <img src="{{ recurso.portada | relative_url }}" alt="Portada de {{ recurso.titulo }}">
          {% else %}
          <div class="featured-placeholder" aria-hidden="true"><i class="ti ti-device-gamepad-2"></i></div>
          {% endif %}
        </div>
        <div class="featured-body">
          <p class="featured-tag">{{ categoria | capitalize }}</p>
          <h3>{{ recurso.titulo }}</h3>
          <p>{{ recurso.descripcion }}</p>
          <div class="featured-meta">
            {% if recurso.tipo %}<span><i class="ti ti-box"></i> {{ recurso.tipo }}</span>{% endif %}
            {% if recurso.idioma %}<span><i class="ti ti-language"></i> {{ recurso.idioma | upcase }}</span>{% endif %}
          </div>
          <a class="btn primary" href="{{ recurso_url | relative_url }}"><i class="ti ti-arrow-right"></i> Ver ficha completa</a>
        </div>
      </article>
    {% endfor %}
  </div>
</section>

<section class="news-section" aria-labelledby="noticias-heading">
  <header class="news-header">
    <h2 id="noticias-heading">Noticias destacadas</h2>
    <p>Últimas filtraciones, avances oficiales y resúmenes de la escena gaming curados por el equipo Apollo.</p>
  </header>

  <div class="news-grid">
    {% for noticia in destacadas %}
      {% assign noticia_path = '/noticias/' | append: noticia.slug | append: '/' %}
      {% assign share_url = site.url | append: noticia_path %}
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
      {% assign imagen_destacada = nil %}
      {% for bloque in noticia.cuerpo %}
        {% if bloque.imagen and bloque.imagen.src %}
          {% assign imagen_destacada = bloque.imagen %}
          {% break %}
        {% endif %}
      {% endfor %}
      <article id="{{ noticia.slug }}" class="news-card" data-ai-entry data-ai-type="noticias" data-ai-title="{{ noticia.titulo | escape }}" data-ai-summary="{{ noticia.resumen | strip_html | strip_newlines | escape }}" data-ai-url="{{ noticia_path | relative_url }}" data-ai-tags="{{ noticia.tag | escape }}">
        {% if imagen_destacada %}
        <div class="news-media">
          <img src="{{ imagen_destacada.src }}" alt="{{ imagen_destacada.alt | default: noticia.titulo }}">
        </div>
        {% endif %}
        <div class="news-card-body">
          <p class="news-tag">{{ noticia.tag }}</p>
          <h3>{{ noticia.titulo }}</h3>
          <p>{{ noticia.introduccion }}</p>
          <div class="news-excerpt">
            <p>{{ noticia.resumen }}</p>
          </div>
          <div class="news-share" data-share data-share-url="{{ share_url }}" data-share-title="{{ noticia.titulo }}" data-share-text="{{ share_message | append: '\n' | append: share_url }}">
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
          <p class="news-meta">{{ noticia.fecha | date: "%d/%m/%Y" }}</p>
          <a class="btn primary news-read-more" href="{{ noticia_path | relative_url }}"><i class="ti ti-book"></i> Leer más</a>
        </div>
      </article>
    {% endfor %}
  </div>

  {% if noticias.size > 3 %}
  <div class="news-secondary">
    {% for noticia in noticias %}
      {% if forloop.index0 >= 3 and forloop.index0 < 9 %}
        {% assign item_path = '/noticias/' | append: noticia.slug | append: '/' %}
        <a class="news-secondary-card" href="{{ item_path | relative_url }}">
          <span class="news-secondary-tag">{{ noticia.tag }}</span>
          <span class="news-secondary-title">{{ noticia.titulo }}</span>
          <span class="news-secondary-meta">{{ noticia.fecha | date: "%d/%m/%Y" }}</span>
        </a>
      {% endif %}
    {% endfor %}
  </div>
  {% endif %}
</section>
{% endif %}

  <section class="home-topics">
    <div class="topic-card" data-ai-entry data-ai-type="juegos" data-ai-title="ROMs destacadas" data-ai-summary="Selección de ROMs verificadas para Switch, retro y PC" data-ai-url="/juegos/" data-ai-tags="roms switch retro pc">
      <div class="topic-heading">
        <h3>ROMs mejor posicionadas</h3>
        <p>Descubre lo que más se descarga ahora mismo para <strong>Switch</strong>, <strong>retro</strong> y <strong>PC</strong>.</p>
      </div>
      <div class="topic-grid topic-grid-cards">
        {% assign roms_destacadas = site.data.items | where_exp: "item", "item.categoria contains 'juegos' and item.oculto != true" %}
        {% for rom in roms_destacadas limit:3 %}
          {% assign rom_url = '/juegos/' | append: rom.id | append: '/' %}
          <article class="topic-tile" data-ai-entry data-ai-type="juegos" data-ai-title="{{ rom.titulo | escape }}" data-ai-summary="{{ rom.descripcion | strip_html | strip_newlines | escape }}" data-ai-url="{{ rom_url | relative_url }}" data-ai-tags="{{ rom.hashtags | join: ' ' | escape }}">
            <a class="topic-tile-link" href="{{ rom_url | relative_url }}">
              <div class="topic-tile-media">
                {% if rom.portada %}
                <img src="{{ rom.portada | relative_url }}" alt="Portada de {{ rom.titulo }}">
                {% else %}
                <div class="topic-tile-placeholder" aria-hidden="true"><i class="ti ti-device-gamepad-2"></i></div>
                {% endif %}
              </div>
              <div class="topic-tile-body">
                <h4>{{ rom.titulo }}</h4>
                <p>{{ rom.descripcion | strip_html | truncate: 120 }}</p>
                <span class="topic-tile-meta">{{ rom.tipo }} · {{ rom.idioma | upcase }}</span>
              </div>
            </a>
          </article>
        {% endfor %}
      </div>
    </div>
    <div class="topic-card" data-ai-entry data-ai-type="guias" data-ai-title="Guías y foros en tendencia" data-ai-summary="Hilos y walkthroughs con aportes activos" data-ai-url="/guias/" data-ai-tags="guias foros comunidad walkthrough">
      <div class="topic-heading">
        <h3>Guías y foros en tendencia</h3>
        <p>Accede a walkthroughs con actualizaciones diarias y a las salas comunitarias más activas.</p>
      </div>
      <div class="topic-grid topic-grid-cards">
        {% assign guia_count = 0 %}
        {% for grupo in site.data.guias %}
          {% for guia in grupo.guias %}
            {% if guia_count < 2 %}
            <article class="topic-tile" data-ai-entry data-ai-type="guias" data-ai-title="{{ guia.titulo | escape }}" data-ai-summary="{{ guia.resumen | strip_html | strip_newlines | escape }}" data-ai-url="{{ guia.url | relative_url }}" data-ai-tags="{{ grupo.categoria | escape }}">
              <a class="topic-tile-link" href="{{ guia.url | relative_url }}">
                <div class="topic-tile-media">
                  {% if guia.portada %}
                  <img src="{{ guia.portada | relative_url }}" alt="Portada de {{ guia.titulo }}">
                  {% else %}
                  <div class="topic-tile-placeholder" aria-hidden="true"><i class="ti ti-book"></i></div>
                  {% endif %}
                </div>
                <div class="topic-tile-body">
                  <h4>{{ guia.titulo }}</h4>
                  <p>{{ guia.resumen | strip_html | truncate: 120 }}</p>
                  <span class="topic-tile-meta">{{ grupo.categoria }}</span>
                </div>
              </a>
            </article>
            {% assign guia_count = guia_count | plus: 1 %}
            {% endif %}
          {% endfor %}
          {% if guia_count >= 2 %}{% break %}{% endif %}
        {% endfor %}
        <article class="topic-tile" data-ai-entry data-ai-type="foros" data-ai-title="Foros oficiales Apollo" data-ai-summary="Salas activas para soporte técnico, rom-hacking y organización comunitaria." data-ai-url="/foros/" data-ai-tags="comunidad soporte foros">
          <a class="topic-tile-link" href="/foros/">
            <div class="topic-tile-media">
              <div class="topic-tile-placeholder" aria-hidden="true"><i class="ti ti-messages"></i></div>
            </div>
            <div class="topic-tile-body">
              <h4>Foros oficiales Apollo</h4>
              <p>Un espacio moderado por IA y staff para compartir configuraciones, traducciones y soporte exprés.</p>
              <span class="topic-tile-meta">Comunidad</span>
            </div>
          </a>
        </article>
      </div>
    </div>
    <div class="topic-card" data-ai-entry data-ai-type="emuladores" data-ai-title="Recursos para emulación" data-ai-summary="Firmware, keys y herramientas actualizadas" data-ai-url="/emuladores/" data-ai-tags="emuladores firmware keys configuraciones">
      <div class="topic-heading">
        <h3>Recursos para emulación</h3>
        <p>Encuentra firmware, keys y herramientas que auditamos junto a la comunidad técnica.</p>
      </div>
      <div class="topic-grid topic-grid-cards">
        {% assign recursos_candidatos = site.data.items | where_exp: "item", "item.oculto != true" %}
        {% assign recursos_candidatos = recursos_candidatos | where_exp: "item", "item.categoria contains 'emuladores' or item.categoria contains 'apps'" %}
        {% for recurso in recursos_candidatos limit:3 %}
          {% assign recurso_categoria = recurso.categoria | first | default: 'emuladores' %}
          {% assign recurso_base = '/' | append: recurso_categoria | append: '/' %}
          {% assign recurso_url = recurso_base | append: recurso.id | append: '/' %}
          <article class="topic-tile" data-ai-entry data-ai-type="{{ recurso_categoria }}" data-ai-title="{{ recurso.titulo | escape }}" data-ai-summary="{{ recurso.descripcion | strip_html | strip_newlines | escape }}" data-ai-url="{{ recurso_url | relative_url }}" data-ai-tags="{{ recurso.hashtags | join: ' ' | escape }}">
            <a class="topic-tile-link" href="{{ recurso_url | relative_url }}">
              <div class="topic-tile-media">
                {% if recurso.portada %}
                <img src="{{ recurso.portada | relative_url }}" alt="Portada de {{ recurso.titulo }}">
                {% else %}
                <div class="topic-tile-placeholder" aria-hidden="true"><i class="ti ti-cpu"></i></div>
                {% endif %}
              </div>
              <div class="topic-tile-body">
                <h4>{{ recurso.titulo }}</h4>
                <p>{{ recurso.descripcion | strip_html | truncate: 120 }}</p>
                <span class="topic-tile-meta">{{ recurso.tipo | default: 'Recurso' }}{% if recurso.idioma %} · {{ recurso.idioma | upcase }}{% endif %}</span>
              </div>
            </a>
          </article>
        {% endfor %}
      </div>
    </div>
  </section>

  <section class="home-seo">
    <header>
      <h2>¿Buscas ROMs, guías, foros o noticias?</h2>
      <p>Cada ficha incluye metadatos completos, avisos legales, mirrors auditados y enlaces internos para que encuentres lo que necesitas en segundos.</p>
    </header>
    <div class="seo-columns">
      <div>
        <h3>ROMs populares</h3>
        <p>Listas por región, idioma, formato y compatibilidad con emuladores. Añadimos parches, savegames y actualizaciones.</p>
      </div>
      <div>
        <h3>Guías premium</h3>
        <p>Walkthroughs, builds y estrategias SEO-friendly para atraer nuevas comunidades que buscan soluciones rápidas.</p>
      </div>
      <div>
        <h3>Foros activos</h3>
        <p>Moderación híbrida humana + IA para mantener conversaciones seguras y resolver incidencias en minutos.</p>
      </div>
    </div>
  </section>
</div>

{% assign ai_resources = site.data.items | where_exp: 'item', 'item.oculto != true' %}
{% assign ai_news = site.data.noticias %}
{% assign ai_forums = site.data.foros %}
{% assign ai_guides_raw = site.data.guias %}
{% assign ai_guides = '' %}
{% capture ai_guides_json %}
[
  {% assign guia_items = '' %}
  {% for categoria in ai_guides_raw %}
    {% for guia in categoria.guias %}
      {
        "id": {{ guia.id | jsonify }},
        "title": {{ guia.titulo | jsonify }},
        "summary": {{ guia.resumen | jsonify }},
        "url": {{ guia.url | relative_url | jsonify }},
        "category": {{ categoria.categoria | jsonify }}
      }{% unless forloop.last and forloop.parentloop.last %},{% endunless %}
    {% endfor %}
  {% endfor %}
]
{% endcapture %}

{% capture ai_resources_json %}
[
  {% for recurso in ai_resources %}
    {% assign categoria = recurso.categoria | first | default: '' %}
    {% assign base_path = '/' | append: categoria | append: '/' %}
    {% assign url = base_path | append: recurso.id | append: '/' %}
    {
      "id": {{ recurso.id | jsonify }},
      "title": {{ recurso.titulo | jsonify }},
      "summary": {{ recurso.descripcion | jsonify }},
      "url": {{ url | relative_url | jsonify }},
      "category": {{ categoria | jsonify }},
      "type": {{ recurso.tipo | jsonify }},
      "tags": {{ recurso.hashtags | jsonify }},
      "views": {{ recurso.vistas | default: recurso.popularidad | default: 0 }}
    }{% unless forloop.last %},{% endunless %}
  {% endfor %}
]
{% endcapture %}

{% capture ai_news_json %}
[
  {% for noticia in ai_news %}
    {
      "id": {{ noticia.slug | jsonify }},
      "title": {{ noticia.titulo | jsonify }},
      "summary": {{ noticia.resumen | jsonify }},
      "url": {{ '/noticias/' | append: noticia.slug | append: '/' | relative_url | jsonify }},
      "tag": {{ noticia.tag | jsonify }},
      "date": {{ noticia.fecha | date: '%Y-%m-%d' | jsonify }},
      "views": {{ noticia.vistas | default: 0 }}
    }{% unless forloop.last %},{% endunless %}
  {% endfor %}
]
{% endcapture %}

{% capture ai_forums_json %}
[
  {% for foro in ai_forums %}
    {
      "name": {{ foro.nombre | jsonify }},
      "summary": {{ foro.resumen | jsonify }},
      "url": {{ '/foros/' | append: foro.slug | append: '/' | relative_url | jsonify }},
      "topics": [{% for tema in foro.temas %}{"name": {{ tema.nombre | jsonify }}, "url": {{ '/foros/' | append: foro.slug | append: '/' | append: tema.slug | append: '/' | relative_url | jsonify }}}{% unless forloop.last %},{% endunless %}{% endfor %}]
    }{% unless forloop.last %},{% endunless %}
  {% endfor %}
]
{% endcapture %}

<script type="application/json" id="apollo-ai-corpus">
{
  "resources": {{ ai_resources_json | strip_newlines }},
  "news": {{ ai_news_json | strip_newlines }},
  "guides": {{ ai_guides_json | strip_newlines }},
  "forums": {{ ai_forums_json | strip_newlines }}
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Recursos destacados de Apollo-es",
  "itemListElement": [
    {% for recurso in ai_resources limit:3 %}
      {% assign recurso_categoria = recurso.categoria | first | default: '' %}
      {
        "@type": "ListItem",
        "position": {{ forloop.index }},
        "url": "{{ '/' | append: recurso_categoria | append: '/' | append: recurso.id | append: '/' | absolute_url }}",
        "name": {{ recurso.titulo | jsonify }}
      }{% unless forloop.last %},{% endunless %}
    {% endfor %}
  ]
}
</script>

{% if destacadas.size > 0 %}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Noticias destacadas Apollo-es",
  "itemListElement": [
    {% for noticia in destacadas %}
    {
      "@type": "ListItem",
      "position": {{ forloop.index }},
      "url": "{{ '/noticias/' | append: noticia.slug | append: '/' | absolute_url }}",
      "name": {{ noticia.titulo | jsonify }}
    }{% unless forloop.last %},{% endunless %}
    {% endfor %}
  ]
}
</script>
{% endif %}

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Dónde descargar ROMs verificadas de Nintendo Switch?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "En Apollo-es curamos ROMs con enlaces verificados, metadatos completos y soporte comunitario para Nintendo Switch, 3DS y consolas retro."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cómo acceder a guías y tutoriales paso a paso?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Visita la sección de guías donde recopilamos walkthroughs en desarrollo, cronologías retro y aportes verificados de la comunidad."
      }
    },
    {
      "@type": "Question",
      "name": "¿Hay foros y comunidad para resolver dudas?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sí, contamos con foros moderados y con Apollo AI, que sugiere hilos activos, guías y descargas verificadas según tu consulta."
      }
    }
  ]
}
</script>
