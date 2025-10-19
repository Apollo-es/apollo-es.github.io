(function(){
  const widget = document.querySelector('[data-ai-widget]');
  if(!widget) return;

  const form = widget.querySelector('[data-ai-form]');
  const input = form ? form.querySelector('input[name="q"]') : null;
  const messages = widget.querySelector('[data-ai-messages]');
  const suggestions = widget.querySelectorAll('[data-ai-suggestion]');
  const trendingContainer = widget.querySelector('[data-ai-trending]');
  const trendingList = widget.querySelector('[data-ai-trending-list]');

  if(!form || !input || !messages) return;

  const STORAGE_KEY = 'apollo-ai-trending';

  function normalise(value){
    if(!value) return '';
    let output = value.toLowerCase();
    if(typeof output.normalize === 'function'){
      output = output.normalize('NFD').replace(/\p{M}+/gu, '');
    }
    return output.trim();
  }

  const synonymLookup = new Map();
  const synonyms = {
    rom: ['roms', 'backup', 'backups', 'dump', 'dumps', 'parche', 'patch', 'iso'],
    switch: ['nsw', 'nintendo', 'nintendoswitch', 'switch'],
    guia: ['guia', 'guias', 'tutorial', 'tutoriales', 'walkthrough', 'walkthroughs', 'solucion', 'soluciones'],
    foro: ['foro', 'foros', 'community', 'comunidad', 'hilo', 'hilos', 'ayuda'],
    noticia: ['noticia', 'noticias', 'filtracion', 'filtraciones', 'leak', 'leaks', 'actualidad', 'reportes'],
    emulador: ['emulador', 'emuladores', 'yuzu', 'ryujinx', 'retroarch'],
    configuracion: ['config', 'configuracion', 'optimizacion', 'ajustes', 'settings'],
    traduccion: ['traduccion', 'traducciones', 'idioma', 'idiomas', 'subtitulo', 'subtitulos'],
    mod: ['mod', 'mods', 'romhack', 'rom-hack', 'modding', 'hack', 'hacks'],
    za: ['z-a', 'leyendas', 'legends', 'luminalia', 'kalos'],
    apollo: ['apollo', 'ia', 'ai', 'asistente', 'chatbot', 'inteligencia']
  };

  Object.entries(synonyms).forEach(([root, variants]) => {
    const tokens = new Set([root, ...variants]);
    tokens.forEach(token => synonymLookup.set(token, root));
  });

  function canonicalize(token){
    const normalised = normalise(token);
    return synonymLookup.get(normalised) || normalised;
  }

  const knowledgeBase = [
    {
      keywords: ['rom', 'switch'],
      aliases: ['retro', '3ds', 'descarga'],
      phrases: ['roms switch', 'descargas verificadas', 'nintendo switch'],
      boost: 3,
      response: 'Explora las <a href="/juegos/">ROMs verificadas</a> con metadatos, parches y mirrors activos. Las más buscadas ahora incluyen <a href="/juegos/pokemon-leyendas-za/">Pokémon Leyendas: Z-A</a> y <a href="/juegos/mario-kart-8-deluxe/">Mario Kart 8 Deluxe</a>.'
    },
    {
      keywords: ['guia', 'walkthrough'],
      aliases: ['tutorial', 'historia', 'recorrido'],
      phrases: ['guia leyendas za', 'walkthrough pokemon'],
      boost: 4,
      response: 'Visita la <a href="/guias/pokemon-leyendas-za/">guía en desarrollo de Pokémon Leyendas: Z-A</a> para usar el índice interactivo y el <a href="/guias/pokemon-leyendas-za/#walkthrough">walkthrough anticipado</a>. También puedes recorrer <a href="/guias/">todas las guías</a> con builds y mapas asistidos por IA.'
    },
    {
      keywords: ['foro', 'community'],
      aliases: ['ayuda', 'debate', 'comunidad'],
      phrases: ['foros apollo', 'foro pokemon'],
      boost: 2,
      response: 'Únete a los <a href="/foros/">foros de Apollo-es</a>. Hay salas activas para Leyendas Z-A, rom-hacking y soporte técnico moderado con Apollo AI.'
    },
    {
      keywords: ['noticia', 'actualidad'],
      aliases: ['filtracion', 'leak', 'reportes'],
      phrases: ['teraleak', 'ultimas noticias'],
      response: 'Consulta la <a href="/noticias/">sala de noticias</a> para resúmenes rápidos generados por Apollo AI y coberturas tras cada tráiler o evento.'
    },
    {
      keywords: ['emulador', 'configuracion'],
      aliases: ['yuzu', 'ryujinx', 'retroarch', 'optimizacion'],
      phrases: ['configuracion pro', 'perfiles emulador'],
      response: 'En <a href="/emuladores/">emuladores certificados</a> encontrarás perfiles optimizados y en <a href="/apps/">apps</a> tenemos herramientas para gestionar bibliotecas y shaders.'
    },
    {
      keywords: ['traduccion', 'idioma'],
      aliases: ['subtitulo', 'multilenguaje'],
      response: 'Revisamos traducciones comunitarias en los <a href="/foros/">foros</a> y listamos parches multilenguaje dentro de cada ficha de juego cuando están disponibles.'
    },
    {
      keywords: ['mod', 'romhack'],
      aliases: ['mods', 'modding', 'hack'],
      phrases: ['mods switch', 'rom hack'],
      response: 'Busca proyectos y rom-hacks destacados en <a href="/noticias/">noticias</a> o filtra por “mod” dentro del catálogo de <a href="/juegos/">juegos</a>.'
    },
    {
      keywords: ['za', 'leyendas'],
      aliases: ['luminalia', 'kalos', 'pokemon'],
      phrases: ['leyendas z-a', 'pokemon legends za', 'legends z-a'],
      boost: 5,
      response: 'Tenemos una <a href="/guias/pokemon-leyendas-za/">guía viva de Pokémon Leyendas: Z-A</a> con avances verificados y <a href="/guias/pokemon-leyendas-za/#walkthrough">walkthrough anticipado</a>. Consulta también la <a href="/juegos/pokemon-leyendas-za/">ficha de descargas</a>.'
    },
    {
      keywords: ['apollo', 'ai'],
      aliases: ['asistente', 'chatbot', 'inteligencia'],
      phrases: ['apollo ai', 'asistente apollo'],
      response: 'Apollo AI funciona en tu navegador con heurísticas semánticas y tendencias locales. Pide “recomendaciones RPG”, “mods de Zelda” o “walkthrough de Metroid” y aprenderá qué atajos mostrarte.'
    }
  ];

  const knowledgeIndex = knowledgeBase.map(entry => {
    const keywordSet = new Set();
    entry.keywords.forEach(keyword => keywordSet.add(canonicalize(keyword)));

    const aliasSet = new Set();
    (entry.aliases || []).forEach(alias => aliasSet.add(canonicalize(alias)));

    const phraseSet = new Set((entry.phrases || []).map(phrase => normalise(phrase)).filter(Boolean));
    const rawTokens = new Set([
      ...entry.keywords.map(normalise),
      ...((entry.aliases || []).map(normalise))
    ]);

    return {
      response: entry.response,
      boost: entry.boost || 0,
      keywordSet,
      aliasSet,
      phraseSet,
      rawTokens
    };
  });

  const defaultReply = 'Puedo guiarte a <a href="/juegos/">juegos</a>, <a href="/guias/">guías</a>, <a href="/foros/">foros</a>, <a href="/noticias/">noticias</a> o <a href="/emuladores/">emuladores</a>. Usa palabras clave como “mods switch”, “walkthrough zelda” o “foro leyendas za”.';

  let trendingMemory = readTrending();
  renderTrending(trendingMemory);

  function readTrending(){
    try{
      const saved = localStorage.getItem(STORAGE_KEY);
      if(!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    }catch(error){
      console.warn('Apollo AI trending storage unavailable:', error);
      return [];
    }
  }

  function saveTrending(list){
    trendingMemory = list;
    try{
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }catch(error){
      console.warn('Apollo AI trending storage blocked:', error);
    }
  }

  function renderTrending(list){
    if(!trendingContainer || !trendingList) return;
    const items = (list || []).filter(item => item && item.label);
    if(!items.length){
      trendingContainer.hidden = true;
      trendingList.innerHTML = '';
      return;
    }
    trendingContainer.hidden = false;
    trendingList.innerHTML = '';
    items.forEach(item => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = item.label;
      button.addEventListener('click', () => handleSubmit(item.label));
      trendingList.appendChild(button);
    });
  }

  function defaultReplyMessage(){
    if(!trendingMemory.length) return defaultReply;
    const examples = trendingMemory.slice(0, 3).map(item => `«${item.label}»`).join(', ');
    return `${defaultReply} Prueba con ${examples} para empezar.`;
  }

  function addMessage(content, author){
    const bubble = document.createElement('div');
    bubble.className = 'chat-message ' + (author === 'user' ? 'user' : 'bot');
    bubble.innerHTML = content;
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
  }

  function computeScore(entry, tokens, normalisedQuery){
    let score = entry.boost;
    for(const token of tokens){
      const canonical = canonicalize(token);
      if(entry.keywordSet.has(canonical)){
        score += 3;
        continue;
      }
      if(entry.aliasSet.has(canonical)){
        score += 2;
        continue;
      }
      if(entry.rawTokens.has(token)){
        score += 1;
      }
    }
    entry.phraseSet.forEach(phrase => {
      if(phrase && normalisedQuery.includes(phrase)){
        score += 4;
      }
    });
    return score;
  }

  function matchAnswer(query){
    const normalised = normalise(query);
    const tokens = normalised.split(/[^a-z0-9]+/).filter(Boolean);
    if(!tokens.length) return defaultReplyMessage();

    let best = null;
    let bestScore = 0;
    for(const entry of knowledgeIndex){
      const score = computeScore(entry, tokens, normalised);
      if(score > bestScore){
        bestScore = score;
        best = entry;
      }
    }
    return best && bestScore > 0 ? best.response : defaultReplyMessage();
  }

  function recordQuery(value){
    const trimmed = value.trim();
    const normalised = normalise(trimmed);
    if(!normalised) return;
    const label = trimmed.slice(0, 60);
    let list = Array.from(trendingMemory);
    const now = Date.now();
    const existing = list.find(item => item.q === normalised);
    if(existing){
      existing.count += 1;
      existing.ts = now;
      if(label && label.length > existing.label.length){
        existing.label = label;
      }
    }else{
      list.push({ q: normalised, label: label || normalised, count: 1, ts: now });
    }
    list.sort((a, b) => b.count - a.count || b.ts - a.ts);
    list = list.slice(0, 6);
    saveTrending(list);
    renderTrending(list);
  }

  function handleSubmit(value){
    const text = value.trim();
    if(!text) return;
    addMessage(text, 'user');
    recordQuery(text);
    const answer = matchAnswer(text);
    window.setTimeout(() => addMessage(answer, 'bot'), 200);
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = input.value;
    input.value = '';
    handleSubmit(value);
  });

  suggestions.forEach(button => {
    button.addEventListener('click', () => {
      const value = button.getAttribute('data-ai-suggestion') || '';
      if(!value) return;
      input.value = '';
      handleSubmit(value);
    });
  });
})();
