(function(){
  const widget = document.querySelector('[data-ai-widget]');
  if(!widget) return;

  const form = widget.querySelector('[data-ai-form]');
  const input = form ? form.querySelector('input[name="q"]') : null;
  const messages = widget.querySelector('[data-ai-messages]');
  const suggestions = widget.querySelectorAll('[data-ai-suggestion]');

  if(!form || !input || !messages) return;

  const knowledgeBase = [
    {
      keywords: ['rom', 'switch', 'descargar'],
      response: 'Tenemos las ROMs de Switch mejor valoradas en la portada y en /juegos/. Empieza por <a href="/juegos/pokemon-leyendas-za/">Pokémon Leyendas ZA</a> y <a href="/juegos/mario-kart-8-deluxe/">Mario Kart 8 Deluxe</a>.'
    },
    {
      keywords: ['guia', 'tutorial', 'walkthrough'],
      response: 'Explora nuestras <a href="/guias/">guías maestras</a> con builds, mapas y vídeos comentados. Filtra por saga y dificultad.'
    },
    {
      keywords: ['foro', 'comunidad', 'ayuda'],
      response: 'Únete a la comunidad en <a href="/foros/">los foros Apollo</a>. Hay hilos activos para soporte técnico, quedadas y rom-hacking.'
    },
    {
      keywords: ['noticia', 'filtracion', 'leak'],
      response: 'Revisa <a href="/noticias/">la sala de noticias</a> para filtraciones, lanzamientos y reportes de la escena.'
    },
    {
      keywords: ['emulador', 'yuzu', 'ryujinx'],
      response: 'Visita la sección de <a href="/emuladores/">emuladores certificados</a> y las <a href="/apps/">apps de soporte</a> para configurar Yuzu, Ryujinx y RetroArch sin errores.'
    },
    {
      keywords: ['firebase', 'cuenta', 'registro'],
      response: 'Estamos preparando el login con Firebase Auth y la sincronización en Firestore. Pronto podrás registrarte y guardar progreso desde la portada.'
    }
  ];

  const defaultReply = 'Puedo guiarte a <a href="/juegos/">juegos</a>, <a href="/guias/">guías</a>, <a href="/foros/">foros</a>, <a href="/noticias/">noticias</a> o <a href="/emuladores/">emuladores</a>. ¡Pregunta lo que necesites!';

  function normalise(value){
    if(!value) return '';
    let output = value.toLowerCase();
    if(typeof output.normalize === 'function'){
      output = output.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
    return output;
  }

  function addMessage(content, author){
    const bubble = document.createElement('div');
    bubble.className = 'chat-message ' + (author === 'user' ? 'user' : 'bot');
    bubble.innerHTML = content;
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
  }

  function matchAnswer(query){
    const tokens = normalise(query).split(/[^a-z0-9]+/).filter(Boolean);
    if(!tokens.length) return defaultReply;

    for(const entry of knowledgeBase){
      const shouldRespond = entry.keywords.some(keyword => tokens.includes(keyword));
      if(shouldRespond) return entry.response;
    }
    return defaultReply;
  }

  function handleSubmit(value){
    const text = value.trim();
    if(!text) return;
    addMessage(text, 'user');
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
