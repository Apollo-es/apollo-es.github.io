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

  function tokenize(value){
    return normalise(value)
      .replace(/[^a-z0-9]+/g, ' ')
      .split(/\s+/)
      .filter(Boolean);
  }

  function toList(value){
    if(Array.isArray(value)){
      return value.map(item => String(item)).filter(Boolean);
    }
    if(typeof value === 'string'){
      return value
        .split(/[;,#|]/)
        .map(item => item.trim())
        .filter(Boolean);
    }
    return [];
  }

  function formatLabel(value){
    if(!value) return '';
    const prepared = String(value)
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .toLowerCase()
      .trim();
    return prepared.replace(/(^|\s)([a-záéíóúñ])/g, (match, prefix, letter) => prefix + letter.toUpperCase());
  }

  function escapeHtml(value){
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttribute(value){
    return escapeHtml(value).replace(/`/g, '&#96;');
  }

  function truncate(value, limit){
    if(!value) return '';
    const text = value.replace(/\s+/g, ' ').trim();
    if(text.length <= limit) return text;
    return text.slice(0, Math.max(0, limit - 1)) + '…';
  }

  function readCorpus(){
    const node = document.getElementById('apollo-ai-corpus');
    if(!node || !node.textContent) return {};
    try{
      const payload = node.textContent.trim();
      return payload ? JSON.parse(payload) : {};
    }catch(error){
      console.warn('Apollo AI corpus parse error:', error);
      return {};
    }
  }

  function collectDomEntries(){
    const nodes = document.querySelectorAll('[data-ai-entry]');
    return Array.from(nodes).map(node => ({
      title: node.getAttribute('data-ai-title') || '',
      summary: node.getAttribute('data-ai-summary') || '',
      url: node.getAttribute('data-ai-url') || '',
      section: node.getAttribute('data-ai-type') || '',
      tags: toList(node.getAttribute('data-ai-tags') || ''),
      views: Number(node.getAttribute('data-ai-weight') || 0) || 0
    }));
  }

  function createRecord(entry, section){
    if(!entry) return null;
    const title = entry.title || '';
    const summary = entry.summary || '';
    const url = entry.url || '';
    if(!title || !url) return null;

    const tags = toList(entry.tags);
    if(entry.tag) tags.push(entry.tag);
    if(entry.hashtags) tags.push(...toList(entry.hashtags));

    const categoryValues = toList(entry.category);
    const typeValue = entry.type || entry.tipo || (categoryValues[0] || section || '');
    const sectionLabel = section || '';
    const combined = [title, summary, tags.join(' '), categoryValues.join(' '), typeValue, sectionLabel]
      .filter(Boolean)
      .join(' ');
    const baseTokens = tokenize(combined);
    const tokenSet = new Set(baseTokens);
    const canonicalSet = new Set();
    baseTokens.forEach(token => canonicalSet.add(canonicalize(token)));

    const keywordSet = new Set();
    tags.forEach(tag => keywordSet.add(canonicalize(tag)));
    categoryValues.forEach(cat => keywordSet.add(canonicalize(cat)));
    if(typeValue) keywordSet.add(canonicalize(typeValue));

    const weight = Number(entry.views || entry.vistas || entry.popularidad || entry.popularity || entry.weight || 0) || 0;

    return {
      id: entry.id || url || title,
      title,
      summary,
      url,
      section: sectionLabel,
      sectionCanonical: canonicalize(sectionLabel),
      type: typeValue,
      displayType: formatLabel(typeValue || sectionLabel),
      weight,
      tokenSet,
      canonicalSet,
      keywordSet,
      text: normalise(combined)
    };
  }

  function mergeRecords(target, source){
    if(!target || !source) return target;
    source.tokenSet.forEach(token => target.tokenSet.add(token));
    source.canonicalSet.forEach(token => target.canonicalSet.add(token));
    source.keywordSet.forEach(token => target.keywordSet.add(token));
    if(source.weight > target.weight) target.weight = source.weight;
    if(source.summary && (!target.summary || source.summary.length > target.summary.length)){
      target.summary = source.summary;
    }
    if(!target.type && source.type){
      target.type = source.type;
      target.displayType = source.displayType;
    }
    return target;
  }

  function addRecord(map, entry, section){
    if(!entry) return;
    const candidate = createRecord(entry, section);
    if(!candidate) return;
    const key = candidate.url || candidate.id;
    if(map.has(key)){
      const existing = map.get(key);
      map.set(key, mergeRecords(existing, candidate));
    } else {
      map.set(key, candidate);
    }
  }

  function buildDynamicIndex(corpus){
    const map = new Map();
    const domEntries = collectDomEntries();
    const resourceList = Array.isArray(corpus.resources) ? corpus.resources : [];
    const newsList = Array.isArray(corpus.news) ? corpus.news : [];
    const guideList = Array.isArray(corpus.guides) ? corpus.guides : [];
    const forumList = Array.isArray(corpus.forums) ? corpus.forums : [];

    resourceList.forEach(item => addRecord(map, item, 'recursos'));
    newsList.forEach(item => {
      const enriched = Object.assign({}, item, { tags: toList(item.tags || item.tag) });
      addRecord(map, enriched, 'noticias');
    });
    guideList.forEach(item => addRecord(map, item, 'guias'));
    forumList.forEach(forum => {
      addRecord(map, forum, 'foros');
      if(Array.isArray(forum.topics)){
        forum.topics.forEach(topic => {
          addRecord(map, {
            title: topic.name,
            summary: topic.summary || forum.summary || '',
            url: topic.url,
            type: 'foro',
            tags: [forum.name]
          }, 'foros');
        });
      }
    });
    domEntries.forEach(entry => {
      addRecord(map, {
        title: entry.title,
        summary: entry.summary,
        url: entry.url,
        type: entry.section,
        tags: entry.tags,
        views: entry.views
      }, entry.section || 'recursos');
    });

    return Array.from(map.values()).sort((a, b) => (b.weight || 0) - (a.weight || 0));
  }

  function scoreRecord(record, tokens, normalisedQuery){
    let score = 0;
    for(const token of tokens){
      const canonical = canonicalize(token);
      if(record.canonicalSet.has(canonical)){
        score += 4;
      } else if(record.tokenSet.has(token)){
        score += 2;
      } else if(record.text.includes(token)){
        score += 1;
      }
      if(record.keywordSet.has(canonical)){
        score += 3;
      }
      if(record.sectionCanonical && record.sectionCanonical === canonical){
        score += 2;
      }
      if(record.type && canonicalize(record.type) === canonical){
        score += 2;
      }
    }
    if(record.summary && normalise(record.summary).includes(normalisedQuery)){
      score += 2;
    }
    const popularityBoost = Math.min(4, Math.log10((record.weight || 0) + 1) * 2);
    score += popularityBoost;
    return score;
  }

  function rankDynamic(records, tokens, normalisedQuery){
    const matches = [];
    for(const record of records){
      const score = scoreRecord(record, tokens, normalisedQuery);
      if(score > 3){
        matches.push({record, score});
      }
    }
    matches.sort((a, b) => b.score - a.score || (b.record.weight || 0) - (a.record.weight || 0));
    return matches.slice(0, Math.min(4, matches.length));
  }

  function renderDynamicResponse(matches){
    if(!matches.length) return null;
    const items = matches.map(match => {
      const record = match.record;
      const safeTitle = escapeHtml(record.title);
      const safeUrl = escapeAttribute(record.url || '#');
      const summaryText = truncate(record.summary || '', 220);
      const summaryHtml = summaryText ? `<p>${escapeHtml(summaryText)}</p>` : '';
      const label = record.displayType ? escapeHtml(record.displayType) : '';
      const chip = label ? `<span class="ai-chip">${label}</span>` : '';
      return `<li><a href="${safeUrl}">${safeTitle}</a>${summaryHtml}${chip}</li>`;
    }).join('');
    return `<p class="ai-response-lead">Recursos recomendados por Apollo AI</p><ul class="ai-response-list">${items}</ul>`;
  }

  let corpusData = {};
  let dynamicIndex = [];
  let dynamicExamples = [];
  let dynamicSeeds = [];
  let defaultReplyText = '';

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

  function refreshDynamicState(){
    corpusData = readCorpus();
    dynamicIndex = buildDynamicIndex(corpusData);
    dynamicExamples = dynamicIndex.slice(0, 3)
      .map(entry => entry && entry.title ? `«${entry.title}»` : '')
      .filter(Boolean);

    const resourceCount = Array.isArray(corpusData.resources) ? corpusData.resources.length : 0;
    const guideCount = Array.isArray(corpusData.guides) ? corpusData.guides.length : 0;
    const newsCount = Array.isArray(corpusData.news) ? corpusData.news.length : 0;
    const forumCount = Array.isArray(corpusData.forums) ? corpusData.forums.length : 0;
    const coverageParts = [];
    if(resourceCount) coverageParts.push(`${resourceCount} recursos`);
    if(guideCount) coverageParts.push(`${guideCount} guías`);
    if(newsCount) coverageParts.push(`${newsCount} noticias`);
    if(forumCount) coverageParts.push(`${forumCount} foros`);
    const coverageSummary = coverageParts.length ? coverageParts.join(', ').replace(/, ([^,]+)$/, ' y $1') : '';
    defaultReplyText = (coverageSummary
      ? `Puedo guiarte a ${coverageSummary} verificados por Apollo-es.`
      : 'Puedo guiarte a recursos, guías, noticias y foros verificados por Apollo-es.') +
      ' Usa búsquedas como «roms switch actualizadas», «guía leyendas za» o «foros pokemon» para empezar.';

    dynamicSeeds = dynamicIndex.slice(0, 4)
      .map(entry => entry && entry.title ? {label: entry.title} : null)
      .filter(Boolean);
  }

  refreshDynamicState();

  let trendingMemory = readTrending();
  renderTrending(trendingMemory.length ? trendingMemory : dynamicSeeds);

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
    if(trendingMemory.length){
      const examples = trendingMemory
        .slice(0, 3)
        .map(item => item && item.label ? `«${item.label}»` : '')
        .filter(Boolean)
        .join(', ');
      if(examples){
        return `${defaultReplyText} Prueba con ${examples} para empezar.`;
      }
    }
    if(dynamicExamples.length){
      return `${defaultReplyText} Prueba con ${dynamicExamples.join(', ')} para empezar.`;
    }
    return defaultReplyText;
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
    const tokens = tokenize(query);
    if(!tokens.length) return defaultReplyMessage();

    const dynamicMatches = rankDynamic(dynamicIndex, tokens, normalised);
    const dynamicResponse = renderDynamicResponse(dynamicMatches);
    if(dynamicResponse){
      return dynamicResponse;
    }

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

  let refreshTimer = null;
  function scheduleRefresh(){
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(() => {
      const previousTitles = dynamicIndex.map(item => item && item.title).join('|');
      refreshDynamicState();
      const nextTitles = dynamicIndex.map(item => item && item.title).join('|');
      if(previousTitles !== nextTitles || !trendingMemory.length){
        renderTrending(trendingMemory.length ? trendingMemory : dynamicSeeds);
      }
    }, 80);
  }

  const corpusNode = document.getElementById('apollo-ai-corpus');
  if(corpusNode && typeof MutationObserver !== 'undefined'){
    const observer = new MutationObserver(scheduleRefresh);
    observer.observe(corpusNode, {childList: true, characterData: true, subtree: true});
  }

  const catalogRoot = document.querySelector('[data-catalog-root]');
  if(catalogRoot && typeof MutationObserver !== 'undefined'){
    const attributeList = ['data-ai-entry','data-ai-title','data-ai-summary','data-ai-url','data-ai-tags','data-ai-type','data-ai-weight'];
    const domObserver = new MutationObserver(scheduleRefresh);
    domObserver.observe(catalogRoot, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: attributeList
    });
  }

  document.addEventListener('apollo-ai:update', scheduleRefresh);

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
