// Nota: este archivo maneja el flujo visible: modos, timer, UI, revision...
// Objetivo: estudiar simple y que el examen tenga 1h con review al final...

(function(){
  const $ = s => document.querySelector(s);
  const on = (el,ev,fn) => el && el.addEventListener(ev,fn);

  // --- UI ---
  const selModo = $("#sel-modo");
  const selTema = $("#sel-tema");
  const btnEmpezar = $("#btn-empezar");
  const btnComprobar = $("#btn-comprobar");
  const btnSiguiente = $("#btn-siguiente");
  const btnFinalizar = $("#btn-finalizar");

  const lblEstado = $("#estado");
  const lblTimer = $("#timer");
  const lblProgreso = $("#progreso");
  const barProg = $("#bar-progreso");
  const lblProgPct = $("#lbl-progreso");
  const barScore = $("#bar-puntaje");
  const lblScore = $("#lbl-puntaje");

  const lblTemaActual = $("#tema-actual");
  const lblEnunciado = $("#enunciado");
  const listaOpciones = $("#opciones");
  const boxLibre = $("#respuesta-libre");
  const inputLibre = $("#input-respuesta");
  const boxExp = $("#explicacion");
  const zonaRevision = $("#revision");

  // --- Estado global (clarito, sin vueltas) ---
  const ST = {
    modo: "estudio",         // "estudio" | "examen"
    tema: "TODOS",
    examSize: 20,            // cantidad en examen (podés subirlo si querés)
    idx: 0,                  // índice actual (1-based a efectos de mostrar)
    total: 0,                // total de preguntas/ejercicios a recorrer
    score: 0,                // aciertos
    tick: null,              // id del setInterval
    timeLeft: 3600,          // 1 hora en segundos
    actual: null,            // ejercicio actual
    finished: false,         // terminó examen
    review: []               // historial para revisión
  };

  // --- Helpers UI ---
  function setStatus(msg){ lblEstado.textContent = msg; }
  function setProgress(i,total){
    lblProgreso.textContent = `${i}/${total}`;
    const pct = total? (i*100/total) : 0;
    barProg.style.width = `${pct}%`;
    lblProgPct.textContent = `${Math.round(pct)}%`;
  }
  function setScore(sc,total){
    lblScore.textContent = `${sc} correctas`;
    const pct = total? (sc*100/total) : 0;
    barScore.style.width = `${pct}%`;
  }
  function resetReview(){ zonaRevision.innerHTML = ""; }

  function renderMCQ(item){
    boxLibre.style.display = "none";
    inputLibre.value = "";
    listaOpciones.innerHTML = item.opciones.map((t,i)=>(
      `<li><button class="opt" data-i="${i}" type="button">${Utils.escape(t)}</button></li>`
    )).join("");
    // bind
    listaOpciones.querySelectorAll(".opt").forEach(b=>{
      b.addEventListener("click", ()=>{
        listaOpciones.querySelectorAll(".opt").forEach(x=>x.classList.remove("is-selected"));
        b.classList.add("is-selected");
        btnComprobar.disabled = (ST.modo==="estudio") ? false : true; // en examen no se comprueba ahora
        ST.seleccion = parseInt(b.dataset.i,10);
      });
    });
  }
  function renderLibre(){
    listaOpciones.innerHTML = "";
    boxLibre.style.display = "block";
    inputLibre.value = "";
    btnComprobar.disabled = (ST.modo==="estudio") ? false : true; // en examen no se comprueba ahora
  }

  function renderItem(item){
    lblTemaActual.textContent = `Tema: ${item.tema}`;
    lblEnunciado.textContent = item.enunciado;
    boxExp.style.display = "none";
    boxExp.innerHTML = "";
    ST.seleccion = null;

    if(item.tipo==="mcq") renderMCQ(item);
    else renderLibre();

    // botones por modo
    if(ST.modo==="estudio"){
      btnComprobar.disabled = true; // se habilita al seleccionar/tipear
      btnSiguiente.disabled = true;
      btnFinalizar.style.display = "none";
    }else{
      // examen: no hay "comprobar" en el momento
      btnComprobar.disabled = true;
      btnSiguiente.disabled = false;
      btnFinalizar.style.display = "inline-block";
    }
  }

  // --- Timer (1h para examen) ---
  function startTimer(){
    stopTimer();
    ST.timeLeft = 3600; // 1 hora
    updateTimer();
    ST.tick = setInterval(()=>{
      ST.timeLeft--;
      updateTimer();
      if(ST.timeLeft<=0){
        stopTimer();
        finalizarExamen(true); // por tiempo
      }
    },1000);
  }
  function stopTimer(){
    if(ST.tick) clearInterval(ST.tick);
    ST.tick=null;
  }
  function updateTimer(){
    lblTimer.textContent = "⏱ " + Utils.formatTimeHMS(ST.timeLeft);
  }

  // --- Navegación ---
  function siguiente(){
    // En examen, guardo respuesta "a ciegas" (sin feedback)
    if(ST.modo==="examen"){
      guardarRespuesta(false); // false => no mostrar explicación ahora
    }
    avanzar();
  }

  function avanzar(){
    if(ST.idx < ST.total){
      ST.idx++;
      setProgress(ST.idx, ST.total);
      ST.actual = Generador.generar(ST.tema);
      renderItem(ST.actual);
      setStatus(ST.modo==="examen" ? "Examen en curso..." : "Modo estudio");
    }else{
      // fin del bloque
      if(ST.modo==="examen"){
        finalizarExamen(false);
      }else{
        setStatus("Fin. Cambiá tema o modo y reiniciá si querés otra tanda.");
        btnSiguiente.disabled = true;
      }
    }
  }

  // --- Comprobación (solo en Estudio) ---
  function comprobar(){
    if(!ST.actual) return;
    if(ST.actual.tipo==="mcq"){
      if(ST.seleccion==null) return;
      const opts = listaOpciones.querySelectorAll(".opt");
      opts.forEach((b,i)=>{
        b.disabled = true;
        if(i===ST.actual.correcta) b.classList.add("is-correct");
        if(i===ST.seleccion && i!==ST.actual.correcta) b.classList.add("is-wrong");
      });
      const ok = (ST.seleccion===ST.actual.correcta);
      if(ok) ST.score++;
      setScore(ST.score, ST.total);
      boxExp.style.display = "block";
      boxExp.innerHTML = ST.actual.explicacion;
      btnSiguiente.disabled = false;
    }else{
      // ejercicio de respuesta libre
      const val = (inputLibre.value??"").trim();
      if(!val) return;
      const ok = (val.toLowerCase() === String(ST.actual.respuesta).toLowerCase());
      if(ok) ST.score++;
      setScore(ST.score, ST.total);
      boxExp.style.display = "block";
      // si la explicación es array, la muestro como lista
      if(Array.isArray(ST.actual.explicacion)){
        boxExp.innerHTML = ST.actual.explicacion.map(x=>`<div>${Utils.escape(x)}</div>`).join("");
      }else{
        boxExp.innerHTML = Utils.escape(ST.actual.explicacion||"");
      }
      // bloqueo input para no trampear la misma
      inputLibre.disabled = true;
      btnSiguiente.disabled = false;
    }
  }

  // --- Guardar respuesta (para revisión en Examen) ---
  function guardarRespuesta(mostrarAhora){
    const it = ST.actual;
    if(!it) return;
    let ok=false, user="";

    if(it.tipo==="mcq"){
      const sel = (ST.seleccion==null) ? -1 : ST.seleccion;
      user = sel>=0 ? it.opciones[sel] : "(sin responder)";
      ok = (sel===it.correcta);
    }else{
      user = (inputLibre.value??"").trim() || "(sin responder)";
      ok = (user.toLowerCase() === String(it.respuesta).toLowerCase());
    }
    if(ok) ST.score++;

    ST.review.push({
      tema: it.tema,
      enunciado: it.enunciado,
      correcta: (it.tipo==="mcq") ? it.opciones[it.correcta] : String(it.respuesta),
      usuario: user,
      ok,
      explicacion: it.explicacion
    });

    setScore(ST.score, ST.total);

    if(mostrarAhora){
      boxExp.style.display = "block";
      boxExp.innerHTML = Array.isArray(it.explicacion)
        ? it.explicacion.map(x=>`<div>${Utils.escape(x)}</div>`).join("")
        : Utils.escape(it.explicacion||"");
    }
  }

  // --- Final del examen ---
  function finalizarExamen(porTiempo){
    stopTimer();
    ST.finished = true;
    setStatus(porTiempo ? "⏰ Tiempo agotado. Mostrando resultados..." : "Examen finalizado. Abajo está la revisión.");
    // Mostrar revisión
    zonaRevision.innerHTML = ST.review.map(r=>{
      const badge = r.ok ? `<span style="color:var(--ok)">✅</span>` : `<span style="color:var(--bad)">❌</span>`;
      const exp = Array.isArray(r.explicacion)
        ? r.explicacion.map(x=>`<div>${Utils.escape(x)}</div>`).join("")
        : Utils.escape(r.explicacion||"");
      return `
        <div class="card" style="margin:.5rem 0">
          <div class="fila" style="gap:.6rem;align-items:flex-start">
            <div>${badge}</div>
            <div style="flex:1">
              <div class="muted">Tema: ${Utils.escape(r.tema)}</div>
              <div style="margin:.25rem 0 .5rem 0"><strong>${Utils.escape(r.enunciado)}</strong></div>
              <div class="muted">Tu respuesta: ${Utils.escape(r.usuario)}</div>
              <div>Correcta: <strong>${Utils.escape(r.correcta)}</strong></div>
              <div class="explicacion">${exp}</div>
            </div>
          </div>
        </div>
      `;
    }).join("");

    // Bloqueo botones de interacción
    btnComprobar.disabled = true;
    btnSiguiente.disabled = true;
    btnFinalizar.style.display = "none";
  }

  // --- Inicio / Reset ---
  function empezar(){
    ST.modo = selModo.value;
    ST.tema = selTema.value;
    ST.idx = 0;
    ST.total = (ST.modo==="examen") ? ST.examSize : 10; // en estudio doy tanda de 10, podés cambiarlo
    ST.score = 0;
    ST.finished = false;
    ST.review = [];
    setProgress(0, ST.total);
    setScore(0, ST.total);
    resetReview();

    // Timer solo en examen
    if(ST.modo==="examen") startTimer();
    else { stopTimer(); lblTimer.textContent = "⏱ 01:00:00"; }

    btnFinalizar.style.display = (ST.modo==="examen") ? "inline-block" : "none";
    btnSiguiente.disabled = (ST.modo==="examen") ? false : true; // en estudio espero a comprobar
    btnComprobar.disabled = (ST.modo==="estudio"); // se habilita al seleccionar/tipear
    avanzar();
  }

  // --- Binds ---
  on(btnEmpezar, "click", empezar);
  on(btnSiguiente, "click", siguiente);
  on(btnComprobar, "click", comprobar);
  on(btnFinalizar, "click", ()=>finalizarExamen(false));
  on(inputLibre, "input", ()=>{
    if(ST.modo==="estudio"){
      btnComprobar.disabled = (inputLibre.value.trim()==="");
    }
  });

  // Arranque: nada hasta que elijas Empezar (como debería ser creo)
  setStatus("Elegí modo/tema y dale a Empezar.");
})();

