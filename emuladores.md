---
layout: default
title: Emuladores
---

<h1>Emuladores</h1>
<p class="lead">Reconoce a los proyectos que hacen posible disfrutar tus juegos favoritos en PC. Aquí tienes enlaces directos a sus sitios oficiales y opciones de descarga para cada consola.</p>

{% assign familias = site.data.emuladores %}
<div class="emulator-groups">
  {% for familia in familias %}
    <section class="emulator-family">
      <h2>{{ familia.icono }} {{ familia.familia }}</h2>
      {% for sistema in familia.sistemas %}
        <article class="emulator-system">
          <header class="emulator-system-header">
            <h3>{{ sistema.icono }} {{ sistema.nombre }}</h3>
          </header>
          <div class="emulator-grid">
            {% for emu in sistema.emuladores %}
              <div class="emulator-card">
                <h4>{% if emu.icono %}{{ emu.icono }} {% endif %}{{ emu.nombre }}</h4>
                <p>{{ emu.descripcion }}</p>
                <div class="emulator-links">
                  <a class="btn" href="{{ emu.sitio }}" target="_blank" rel="noopener">Sitio oficial</a>
                  {% assign descarga_url = emu.descarga | default: emu.sitio %}
                  {% if descarga_url %}
                    <a class="btn alt" href="{{ descarga_url }}" target="_blank" rel="noopener">Descarga</a>
                  {% endif %}
                  {% if emu.extras %}
                    {% for extra in emu.extras %}
                      <a class="btn alt" href="{{ extra.url }}" target="_blank" rel="noopener">{{ extra.texto }}</a>
                    {% endfor %}
                  {% endif %}
                </div>
              </div>
            {% endfor %}
          </div>
        </article>
      {% endfor %}
    </section>
  {% endfor %}
</div>
