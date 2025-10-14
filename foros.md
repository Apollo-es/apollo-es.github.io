---
layout: default
title: Foros
permalink: /foros/
description: "Participa en los foros de Apollo-es para resolver dudas de Pokémon, emuladores y más."
keywords:
  - "foros pokemon"
  - "foro emuladores"
  - "comunidad gaming"
  - "apollo es preguntas"
---

{% assign foros = site.data.foros %}

<h1>Foros</h1>
<p class="lead">Únete a la conversación y construyamos juntos la comunidad de Apollo. Aquí puedes resolver dudas, compartir hallazgos y ayudar a otros jugadores y entusiastas de los emuladores.</p>

<div class="forums-grid">
  {% for foro in foros %}
    <section class="forum-card" id="foro-{{ foro.slug }}">
      <header class="forum-header">
        <span class="forum-icon">{{ foro.icono }}</span>
        <h2>{{ foro.nombre }}</h2>
      </header>
      <p class="forum-description">{{ foro.descripcion }}</p>
      {% if foro.temas %}
        <ul class="forum-tags">
          {% for tema in foro.temas %}
            <li>#{{ tema }}</li>
          {% endfor %}
        </ul>
      {% endif %}
      {% if foro.enlaces %}
        <div class="forum-actions">
          {% for enlace in foro.enlaces %}
            <a class="btn{% if forloop.first %} primary{% else %} alt{% endif %}" href="{{ enlace.url }}" target="_blank" rel="noopener">{{ enlace.texto }}</a>
          {% endfor %}
        </div>
      {% endif %}
    </section>
  {% endfor %}
</div>

<section class="forum-live"
         data-shortname="{{ site.disqus_shortname | strip | escape }}"
         data-base="{{ page.url }}"
         data-requires-auth="true">
  <aside class="forum-live-menu">
    <h2>Participa ahora</h2>
    <p>Selecciona un foro y deja tu duda o consejo. Elige General para cualquier tema o Pokémon si buscas ayuda con Leyendas Z-A y otras entregas.</p>
    <ul class="forum-tablist" role="tablist" aria-label="Foros disponibles">
      {% for foro in foros %}
        <li>
          <button class="forum-tab{% if forloop.first %} active{% endif %}"
                  role="tab"
                  aria-controls="forum-thread"
                  aria-selected="{% if forloop.first %}true{% else %}false{% endif %}"
                  tabindex="{% if forloop.first %}0{% else %}-1{% endif %}"
                  data-thread="{{ foro.slug }}"
                  data-name="{{ foro.nombre }}"
                  data-summary="{{ foro.resumen | default: foro.descripcion }}">
            <span class="forum-tab-icon">{{ foro.icono }}</span>
            <span class="forum-tab-text">
              <strong>{{ foro.nombre }}</strong>
              <small>{{ foro.resumen | default: foro.descripcion }}</small>
            </span>
          </button>
        </li>
      {% endfor %}
    </ul>
  </aside>

  <div class="forum-live-content">
    <header class="forum-live-heading">
      {% assign foro_activo = foros | first %}
      <p class="forum-live-label">Hilo seleccionado</p>
      <h2 class="forum-title">{{ foro_activo.nombre }}</h2>
      <p class="forum-desc">{{ foro_activo.resumen | default: foro_activo.descripcion }}</p>
    </header>

    <div id="forum-auth" class="forum-auth">
      <h3>Inicia sesión con Google</h3>
      <p>Para evitar spam y mantener un ambiente saludable, pedimos que te autentiques antes de publicar. Tu correo no se mostrará públicamente.</p>
      {% if site.google_client_id %}
        <div id="g_id_onload"
             data-client_id="{{ site.google_client_id }}"
             data-callback="handleForumCredentialResponse"
             data-auto_prompt="false">
        </div>
        <div class="g_id_signin"
             data-type="standard"
             data-shape="pill"
             data-theme="filled_blue"
             data-text="signin_with"
             data-size="large">
        </div>
        <p class="forum-auth-note">Se recordará tu acceso en este navegador para que no tengas que verificarte cada vez. Si quieres usar otra cuenta, borra los datos de este sitio en tu navegador.</p>
      {% else %}
        <p class="forum-auth-warning">Añade tu <code>google_client_id</code> en <code>_config.yml</code> para habilitar el acceso mediante Google.</p>
      {% endif %}
    </div>

    <div id="forum-thread" class="forum-thread">
      {% if site.disqus_shortname == '' %}
        <p class="forum-thread-warning">Configura <code>disqus_shortname</code> en <code>_config.yml</code> para activar los comentarios.</p>
      {% else %}
        <noscript>Activa JavaScript para ver los comentarios proporcionados por Disqus.</noscript>
      {% endif %}
    </div>
  </div>
</section>
