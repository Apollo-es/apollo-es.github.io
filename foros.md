---
layout: default
title: Foros
---

<h1>Foros</h1>
<p class="lead">Únete a la conversación y construyamos juntos la comunidad de Apollo. Aquí puedes resolver dudas, compartir hallazgos y ayudar a otros jugadores y entusiastas de los emuladores.</p>

<div class="forums-grid">
  {% for foro in site.data.foros %}
    <section class="forum-card">
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
