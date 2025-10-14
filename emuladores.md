---
layout: default
title: Emuladores
permalink: /emuladores/
description: "Creditos y descargas rápidas para los mejores emuladores de Nintendo, PlayStation y más."
keywords:
  - "emuladores nintendo"
  - "descargar ryujinx"
  - "emulador ps2"
  - "yuzu suyu"
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

<section class="hardware-advisor" id="hardware-advisor" data-source="/static/data/hardware-tiers.json">
  <h2>Calculadora de ajustes gráficos según tu PC</h2>
  <p>
    Esta herramienta aprovecha los perfiles abiertos del proyecto <a href="https://github.com/LibreHardware/benchmark-index" target="_blank" rel="noopener">LibreHardware Benchmark Index</a> (licencia MIT)
    para estimar qué configuraciones convienen en los emuladores más populares. Introduce los componentes principales de tu
    ordenador y obtendrás una guía rápida con resolución objetivo, FPS y trucos para estabilizar la experiencia.
  </p>

  <form id="hardware-form" class="hardware-form" novalidate>
    <div class="hardware-grid">
      <label>
        <span>CPU principal</span>
        <input type="text" id="hw-cpu" name="cpu" list="hw-cpu-list" placeholder="Ej. Ryzen 5 3600" autocomplete="off" required disabled>
        <datalist id="hw-cpu-list"></datalist>
      </label>
      <label>
        <span>GPU dedicada</span>
        <input type="text" id="hw-gpu" name="gpu" list="hw-gpu-list" placeholder="Ej. GeForce RTX 3060" autocomplete="off" required disabled>
        <datalist id="hw-gpu-list"></datalist>
      </label>
      <label>
        <span>Memoria RAM instalada (GB)</span>
        <input type="number" id="hw-ram" name="ram" min="4" max="128" step="1" value="8" required disabled>
      </label>
      <label>
        <span>Objetivo a optimizar</span>
        <select id="hw-target" name="target" disabled>
          <option value="general">Equilibrado / multiplataforma</option>
          <option value="switch">Nintendo Switch</option>
          <option value="retro">Sistemas retro (PS1, PSP, GBA…)</option>
          <option value="sony">PS3 y PS4</option>
        </select>
      </label>
    </div>
    <button class="btn primary" type="submit" disabled>Calcular recomendación</button>
  </form>

  <div class="hardware-status" id="hardware-status" role="status" aria-live="polite">
    <p>Cargando perfiles de hardware comunitarios…</p>
  </div>
  <div class="hardware-result" id="hardware-result" hidden></div>
</section>
