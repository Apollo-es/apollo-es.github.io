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
      <li><i class="ti ti-star"></i> ROMs y parches listos para <strong>Nintendo Switch, 3DS y retro</strong>.</li>
      <li><i class="ti ti-message-chatbot"></i> Próxima integración con <strong>Firebase</strong> y nuestro asistente Apollo IA.</li>
      <li><i class="ti ti-users"></i> Comunidad activa con foros, guías y noticias diarias.</li>
    </ul>
    <div class="search">
      <input id="q" type="search" placeholder="Buscar juegos, vídeos, apps, guías o foros...">
      <a class="btn primary" href="/enviar"><i class="ti ti-upload"></i> Enviar recurso</a>
    </div>
  </div>

  <section class="home-ai" id="apollo-ia">
    <div class="home-ai-copy">
      <h2>Conoce a Apollo IA</h2>
      <p>Estamos construyendo un asistente inteligente que se integra con Firebase para que tus búsquedas de ROMs, guías, parches o debates sean instantáneas. Adelántate y pruébalo en versión previa.</p>
      <ul class="ai-perks">
        <li><i class="ti ti-target"></i> Respuestas guiadas hacia descargas verificadas, guías paso a paso y debates activos.</li>
        <li><i class="ti ti-robot"></i> Diseñado para integrarse con cuentas y progresos guardados cuando activemos Firebase Auth.</li>
        <li><i class="ti ti-shield-lock"></i> Pensado con privacidad first: controlaremos sesiones y reportes en Firestore.</li>
      </ul>
    </div>
    <div class="home-ai-widget" data-ai-widget>
      <header class="widget-header">
        <span class="widget-eyebrow">Apollo IA (beta)</span>
        <h3>¿En qué podemos ayudarte?</h3>
      </header>
      <div class="widget-body">
        <div class="chat-window" data-ai-messages>
          <div class="chat-message bot">Hola, soy Apollo IA. Pregunta por <strong>roms</strong>, <strong>guías</strong>, <strong>foros</strong> o <strong>noticias</strong> y te llevo allí.</div>
        </div>
        <form class="chat-form" data-ai-form>
          <label class="sr-only" for="apollo-ai-input">Escribe tu consulta</label>
          <input id="apollo-ai-input" name="q" type="text" placeholder="Ej. mejores roms de Mario, foros de Pokémon..." autocomplete="off" required>
          <button class="btn primary" type="submit"><i class="ti ti-send"></i></button>
        </form>
        <div class="chat-suggestions" data-ai-suggestions>
          <button type="button" data-ai-suggestion="roms switch">Roms Switch</button>
          <button type="button" data-ai-suggestion="guías zelda">Guías Zelda</button>
          <button type="button" data-ai-suggestion="foro comunidad">Foros</button>
          <button type="button" data-ai-suggestion="noticias filtraciones">Noticias</button>
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

  <section class="home-featured">
    <header class="home-featured-header">
      <h2>Juegos destacados</h2>
      <p>Nuestra selección de imprescindibles para Nintendo Switch y los lanzamientos que la comunidad sigue de cerca.</p>
    </header>

    {% assign juegos = site.data.items | where_exp: "item", "item.categoria contains 'juegos'" %}
    {% assign visibles = juegos | where_exp: "item", "item.oculto != true" %}
    {% assign destacados_ids = "pokemon-leyendas-za|mario-kart-8-deluxe|animal-crossing-new-horizons|super-mario-galaxy|super-mario-galaxy-2|sonic-frontiers" | split: "|" %}
    {% assign destacados_count = 0 %}
    <div class="grid home-featured-grid" data-catalog-grid>
      {% for destacado_id in destacados_ids %}
        {% assign juego = visibles | where: 'id', destacado_id | first %}
        {% if juego %}
          {% assign destacados_count = destacados_count | plus: 1 %}
          {% include card.html item=juego %}
        {% endif %}
      {% endfor %}
    </div>
    <p class="catalog-empty" data-catalog-empty {% if destacados_count > 0 %}hidden{% endif %}>No encontramos coincidencias con tu búsqueda en la portada. Prueba con otros términos o visita el catálogo completo.</p>
  </section>

  <section class="home-topics">
    <div class="topic-card">
      <h3>ROMs mejor posicionadas</h3>
      <p>Descubre los títulos con más clics y búsquedas. Curamos enlaces para <strong>Switch</strong>, <strong>retro</strong> y <strong>PC</strong>.</p>
      <ul>
        <li><a href="/juegos/pokemon-leyendas-za/">Pokémon Leyendas ZA</a> con parches y DLC.</li>
        <li><a href="/juegos/mario-kart-8-deluxe/">Mario Kart 8 Deluxe</a> listo para multiplayer.</li>
        <li><a href="/juegos/sonic-frontiers/">Sonic Frontiers</a> con actualizaciones rápidas.</li>
      </ul>
    </div>
    <div class="topic-card">
      <h3>Guías y foros en tendencia</h3>
      <p>Nuestros foros reciben nuevas aportaciones cada día. Únete a los hilos más calientes.</p>
      <ul>
        <li><a href="/guias/">Guías maestras de Zelda y Metroid</a> con mapas interactivos.</li>
        <li><a href="/foros/">Foros oficiales Apollo</a> para soporte y quedadas online.</li>
        <li><a href="/noticias/">Noticias curadas</a> sobre filtraciones, rom-hacking y más.</li>
      </ul>
    </div>
    <div class="topic-card">
      <h3>Configuración pro de emuladores</h3>
      <p>Optimizamos Yuzu, Ryujinx y RetroArch con perfiles exportables y descargas limpias.</p>
      <ul>
        <li><a href="/emuladores/">Emuladores certificados</a> para Switch y 3DS.</li>
        <li><a href="/apps/">Apps de soporte</a> para gestionar ROMs y bibliotecas.</li>
        <li><a href="/videos/">Vídeos tutoriales</a> paso a paso con IA para subtítulos.</li>
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
        "text": "Visita la sección de guías donde recopilamos walkthroughs, builds y vídeos con subtítulos IA listos para compartir."
      }
    },
    {
      "@type": "Question",
      "name": "¿Hay foros y comunidad para resolver dudas?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sí, contamos con foros moderados y un futuro chatbot con Firebase que te conectará rápidamente con hilos activos y recursos oficiales."
      }
    }
  ]
}
</script>
