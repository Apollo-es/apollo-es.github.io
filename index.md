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

<section class="news-section">
  <header class="news-header">
    <h2>Noticias destacadas</h2>
    <p>Mantente al día con los proyectos y filtraciones más sonadas de la comunidad gaming.</p>
  </header>

  <div class="news-grid">
    <article id="teraleak-2024" class="news-card">
      <div class="news-card-body">
        <p class="news-tag">Teraleak 2.0</p>
        <h3>Un año del Teraleak: nuevos planes de Pokémon hasta 2030</h3>
        <p>Las nuevas tandas del llamado «Teraleak» describen cómo Game Freak reorientó Leyendas Pokémon a Kalos, el DLC Megadimensión con megaevoluciones inéditas y una Generación 10 con mundo abierto, clima dinámico y toques MMO inspirados en el sudeste asiático. También se habla de un futuro proyecto multirregión y la planificación de la Gen 11 para 2030.</p>
        <p class="news-quote">«El motor Pokémon Engine X busca que cada isla procedimental se sienta única» — <a href="https://twitter.com/CentroLeaks/status/1798739770000000000" target="_blank" rel="noopener">@CentroLeaks</a></p>
        <ul class="news-highlights">
          <li>Leyendas Pokémon: Z-A comenzó como un dúo en Johto con monturas y cooperativo 4v4 antes del cambio a Kalos.</li>
          <li>El DLC Megadimensión baraja megaevoluciones para Raichu, Lucario, Garchomp y más criaturas de Paldea.</li>
          <li>Pokémon Wind/Wave apuesta por islas generadas de forma infinita, misiones de supervivencia y combates MMO «Naia».</li>
          <li>Project «Seed» conectaría Hoenn y Sinnoh en una experiencia multirregión persistente.</li>
        </ul>
        {% assign share_url = site.url | append: page.url | append: '#teraleak-2024' %}
        {% assign share_text = 'Resumen del Teraleak 2.0: planes de Pokémon hasta 2030' | uri_escape %}
        <div class="news-share" data-share data-share-url="{{ share_url }}" data-share-title="Un año del Teraleak" data-share-text="Resumen del Teraleak 2.0: planes de Pokémon hasta 2030">
          <span>Compartir:</span>
          <a class="btn share" href="https://twitter.com/intent/tweet?url={{ share_url | uri_escape }}&text={{ share_text }}" target="_blank" rel="noopener" data-platform="x">
            <i class="ti ti-brand-twitter"></i> X
          </a>
          <a class="btn share" href="https://www.facebook.com/sharer/sharer.php?u={{ share_url | uri_escape }}" target="_blank" rel="noopener" data-platform="facebook">
            <i class="ti ti-brand-facebook"></i> Facebook
          </a>
          <a class="btn share" href="https://wa.me/?text={{ share_text }}%20{{ share_url | uri_escape }}" target="_blank" rel="noopener" data-platform="whatsapp">
            <i class="ti ti-brand-whatsapp"></i> WhatsApp
          </a>
        </div>
      </div>

      <aside class="news-aside">
        <div class="ad-slot" aria-label="Espacio publicitario" role="note">
          <p>Espacio reservado para anuncios (300×250).</p>
          <!-- Reemplaza este bloque con el script de AdSense y el código del bloque de anuncios. -->
        </div>
        <div class="ad-slot ad-slot-wide" aria-label="Espacio publicitario" role="note">
          <p>Espacio reservado para anuncios (728×90).</p>
          <!-- Inserta aquí el bloque de anuncios horizontal de tu proveedor. -->
        </div>
      </aside>
    </article>
  </div>
</section>

<div id="items" class="grid">
  {% for item in site.data.items %}
    {% unless item.oculto %}
      {% include card.html item=item %}
    {% endunless %}
  {% endfor %}
</div>
