---
layout: default
title: "Plantilla base para guías"
permalink: /guias/plantilla/
description: "Estructura editable para crear nuevas guías en Apollo-es."
keywords:
  - "plantilla walkthrough"
  - "guia apollo"
  - "como crear guia"
---

<h1>Plantilla de guía</h1>
<p class="lead">Duplica este archivo en <code>guias/</code>, renómalo usando el identificador del juego o tema y completa cada apartado. Elimina los bloques que no necesites.</p>

<section class="guide-template">
  <h2>Resumen rápido</h2>
  <ul>
    <li><strong>Juego/tema:</strong> ________</li>
    <li><strong>Plataforma:</strong> ________</li>
    <li><strong>Versión compatible:</strong> ________</li>
    <li><strong>Actualizado:</strong> {{ site.time | date: "%d/%m/%Y" }}</li>
  </ul>

  <h2>Preparativos</h2>
  <p>Describe requisitos previos, configuraciones de emulador y archivos necesarios.</p>

  <h2>Paso a paso</h2>
  <ol>
    <li>Capítulo o misión 1</li>
    <li>Capítulo o misión 2</li>
    <li>Capítulo o misión 3</li>
  </ol>

  <h2>Recursos adicionales</h2>
  <ul>
    <li>Enlaces a partidas guardadas, mods o configuraciones.</li>
    <li>Video explicativo opcional.</li>
  </ul>

  <h2>Créditos</h2>
  <p>Menciona a colaboradores y fuentes externas.</p>
</section>
