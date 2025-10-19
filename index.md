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
    <p>Somos el centro <strong>#1 en español</strong> para ROMs verificados, guías expertas, foros de soporte y noticias gaming con la chispa de la IA. Descarga, aprende y conecta sin ruido.</p>
    <ul class="hero-highlights">
      <li><i class="ti ti-sparkles"></i> Buscador semántico con <strong>Apollo AI</strong> para ROMs, guías y mods curados.</li>
      <li><i class="ti ti-graph"></i> Recomendaciones dinámicas según tendencias de la comunidad y datos de descarga.</li>
      <li><i class="ti ti-device-gamepad-2"></i> Configuraciones pro optimizadas y listas para emuladores next-gen.</li>
    </ul>
    <div class="search">
      <input id="q" type="search" placeholder="Buscar juegos, vídeos, apps, guías o foros...">
      <a class="btn primary" href="/enviar"><i class="ti ti-upload"></i> Enviar recurso</a>
    </div>
  </div>

  <section class="home-ai" id="apollo-ai">
    <div class="home-ai-copy">
      <h2>Conoce a Apollo AI</h2>
      <p>Apollo AI mezcla embeddings locales, heurísticas semánticas y los datos curados de Apollo-es para responder con lenguaje natural. Funciona 100% en el navegador, sin enviar tus consultas a servidores externos.</p>
      <ul class="ai-perks">
        <li><i class="ti ti-target"></i> Matching semántico afinado para detectar géneros, sagas y estilos de juego en segundos.</li>
        <li><i class="ti ti-sparkles"></i> Aprende de tus consultas para crear atajos personalizados guardados localmente.</li>
        <li><i class="ti ti-shield-lock"></i> Moderación y filtros anti-spam ejecutados en tu dispositivo para mantener tus datos privados.</li>
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

  <section class="home-topics">
    <div class="topic-card">
      <h3>ROMs mejor posicionadas</h3>
      <p>Descubre los títulos con más clics y búsquedas. Curamos enlaces para <strong>Switch</strong>, <strong>retro</strong> y <strong>PC</strong>.</p>
      <ul>
        <li><a href="/juegos/pokemon-leyendas-za/">Pokémon Leyendas ZA</a> con parches y DLC.</li>
        <li><a href="/juegos/mario-kart-8-deluxe/">Mario Kart 8 Deluxe</a> listo para multiplayer.</li>
        <li><a href="/juegos/sonic-racing-crossworlds/">Sonic Racing: CrossWorlds</a> con temporadas y eventos.</li>
      </ul>
    </div>
    <div class="topic-card">
      <h3>Guías y foros en tendencia</h3>
      <p>Descubre los hilos y guías que más aportes están recibiendo esta semana.</p>
      <ul>
        <li><a href="/guias/pokemon-leyendas-za/">Pokémon Leyendas: Z-A</a> con avances verificados y walkthrough anticipado.</li>
        <li><a href="/guias/pokemon-platino/">Pokémon Platino</a> con rutas clásicas y tabla de capturas.</li>
        <li><a href="/foros/">Foros oficiales Apollo</a> para coordinar intercambios y soporte comunitario.</li>
      </ul>
    </div>
    <div class="topic-card">
      <h3>Recursos para emulación</h3>
      <p>Mantenemos firmware, keys y herramientas útiles en un solo lugar mientras la comunidad comparte configuraciones.</p>
      <ul>
        <li><a href="/emuladores/nintendo-switch-keys-1901/">Keys y firmware 19.0.1</a> listos para Yuzu y Ryujinx.</li>
        <li><a href="/emuladores/">Sección de emuladores</a> con descargas verificadas y avisos legales.</li>
        <li><a href="/foros/">Soporte técnico de la comunidad</a> con perfiles y soluciones compartidas.</li>
      </ul>
    </div>
  </section>

  <section class="home-seo">
    <header>
      <h2>¿Buscas ROMs, guías, foros o noticias?</h2>
      <p>Indexamos cada recurso con datos estructurados y palabras clave de cola larga para que Google, Bing y tu buscador favorito nos posicionen arriba.</p>
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
