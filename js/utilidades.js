// Notas: helpers chiquicos para no repetir (random, barajar, tiempo, etcs y etcs)

(function(){
  const Utils = {
    randInt(min, max){ return Math.floor(Math.random()*(max-min+1))+min; },
    choice(arr){ return arr[Math.floor(Math.random()*arr.length)]; },
    barajar(arr){
      for(let i=arr.length-1;i>0;i--){
        const j=Math.floor(Math.random()*(i+1));
        [arr[i],arr[j]]=[arr[j],arr[i]];
      }
      return arr;
    },
    clamp(n, a, b){ return Math.max(a, Math.min(b, n)); },
    formatTimeHMS(s){
      const hh = String(Math.floor(s/3600)).padStart(2,"0");
      const mm = String(Math.floor((s%3600)/60)).padStart(2,"0");
      const ss = String(s%60).padStart(2,"0");
      return `${hh}:${mm}:${ss}`;
    },
    escape(str){ return String(str).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); },
    // Chiquito pero útil para evaluar expresiones seguras (solo ops permitidas):
    evalAritmetica(expr){
      // Admito dígitos, espacios y + - * / % (evito cualquier otra cosa)
      if(!/^[\d\s\+\-\*\/\%()]+$/.test(expr)) throw new Error("Expresión inválida");
      // eslint-disable-next-line no-new-func
      return Function(`"use strict"; return (${expr});`)();
    },
  };
  window.Utils = Utils;
})();

