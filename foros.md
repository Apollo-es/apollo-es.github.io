---
layout: default
title: Foros
permalink: /foros/
description: "Participa en los foros de Apollo-es para resolver dudas de Pokémon Leyendas Z-A y enviar peticiones."
keywords:
  - "foros pokemon"
  - "foro leyendas za"
  - "comunidad gaming"
  - "apollo es preguntas"
---

{% assign foros = site.data.foros %}

<h1>Foros</h1>
<p class="lead">Únete a la conversación, deja tus dudas con un alias y ayuda a otros jugadores. Cada hilo guarda las últimas intervenciones en tu navegador para que puedas retomarlas cuando quieras.</p>

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
            <li><a href="#tema-{{ tema.slug }}">#{{ tema.slug }}</a></li>
          {% endfor %}
        </ul>
      {% endif %}
      <div class="forum-actions">
        {% if foro.temas and foro.temas.size > 0 %}
          {% assign first_topic = foro.temas | first %}
          <a class="btn primary" href="#tema-{{ first_topic.slug }}">Participar</a>
        {% endif %}
        <a class="btn alt" href="#foro-{{ foro.slug }}-hilos">Ver hilos</a>
      </div>
    </section>
  {% endfor %}
</div>

<section class="forum-board-intro">
  <h2>Hilos activos</h2>
  <p>Comparte tu mensaje indicando un alias o apodo y, si lo ves necesario, un medio de contacto. Puedes editar o borrar tus comentarios desde este mismo navegador.</p>
</section>

<div class="forum-board" id="foro-tablero">
  {% for foro in foros %}
  <article class="forum-section" id="foro-{{ foro.slug }}-hilos">
    <header class="forum-section-header">
      <h2>{{ foro.nombre }}</h2>
      <p>{{ foro.resumen | default: foro.descripcion }}</p>
    </header>

    {% if foro.temas %}
    <div class="forum-topics">
      {% for tema in foro.temas %}
      {% assign topic_key = foro.slug | append: '::' | append: tema.slug %}
      <section class="forum-topic" id="tema-{{ tema.slug }}" data-topic-key="{{ topic_key }}">
        <header class="forum-topic-header">
          <h3>{{ tema.nombre }}</h3>
          <p>{{ tema.descripcion }}</p>
          {% if tema.indicaciones %}
          <ul class="forum-guidelines">
            {% for tip in tema.indicaciones %}
            <li>{{ tip }}</li>
            {% endfor %}
          </ul>
          {% endif %}
        </header>

        <div class="forum-topic-feed" data-topic-feed>
          <p class="forum-empty">Todavía no hay mensajes aquí. Sé el primero en escribir.</p>
        </div>

        <form class="forum-topic-form" data-topic-form novalidate>
          <div class="form-row">
            <label for="alias-{{ topic_key | slugify }}">Nombre o alias</label>
            <input id="alias-{{ topic_key | slugify }}" name="alias" type="text" maxlength="40" required placeholder="Ej. LunaTrainer">
          </div>
          <div class="form-row">
            <label for="contacto-{{ topic_key | slugify }}">Contacto (opcional)</label>
            <input id="contacto-{{ topic_key | slugify }}" name="contacto" type="text" maxlength="80" placeholder="Correo o red social">
          </div>
          <div class="form-row">
            <label for="mensaje-{{ topic_key | slugify }}">Mensaje</label>
            <textarea id="mensaje-{{ topic_key | slugify }}" name="mensaje" rows="4" maxlength="720" required placeholder="Cuéntanos en qué necesitas ayuda"></textarea>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn primary">Publicar mensaje</button>
            <button type="button" class="btn alt" data-topic-clear>Limpiar</button>
          </div>
        </form>
      </section>
      {% endfor %}
    </div>
    {% endif %}
  </article>
  {% endfor %}
</div>
