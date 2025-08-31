// la idea es que no te tire la misma cosa cada dos minutos.
// - Recuerdo "firmas" de lo generado en esta sesión y las evito.

(function(){
  const T = {
    VAR: "Variables",
    OPE: "Operadores",
    LOG: "Logicos",
    ASG: "Asignaciones",
    CON: "Condicionales",
    REP: "Repetitivas",
    CAS: "Casos"
  };

  // --- Sesión: control de variedad ---
  const Sesion = {
    vistos: new Set(),        // firmas de ejercicios ya usados en esta sesión
    ordenTemas: [T.VAR, T.OPE, T.LOG, T.ASG, T.CON, T.REP, T.CAS],
    cursor: 0,
    reset(){
      this.vistos.clear();
      this.cursor = 0;
    },
    firmaDe(item){
      // Intento una firma estable y corta; prioridad: estructura/params.
      // Si hay respuesta/opciones, la incluyo para distinguir.
      const base = [
        item.tema,
        item.tipo,
        (item.plantilla||""),
        (item.enunciado||"").replace(/\s+/g," ").trim()
      ].join("|");
      if(item.tipo==="mcq"){
        return base + "|" + (item.opciones||[]).join("§");
      }else{
        return base + "|" + String(item.respuesta ?? "");
      }
    },
    marcar(item){
      this.vistos.add(this.firmaDe(item));
    },
    yaVisto(item){
      return this.vistos.has(this.firmaDe(item));
    },
    nextTemaParaTodos(){
      const t = this.ordenTemas[this.cursor % this.ordenTemas.length];
      this.cursor++;
      return t;
    }
  };

  // --- utilillos chiquitos para variar redacciones ---
  const Frases = {
    // Nada rebuscado; objetivo: que no se lea clonada la explicación
    aritPrefix: [
      "Primero multiplicación y división; luego suma y resta.",
      "Recordá: * y / antes que + y -.",
      "Aplicamos precedencia: * y / tienen prioridad sobre + y -."
    ],
    evalRes(txt){ return Utils.choice([
      `Resultado final: ${txt}.`,
      `Da como resultado ${txt}.`,
      `El valor obtenido es ${txt}.`
    ]);},
    temaLabel(t){ return Utils.choice([
      `Tema: ${t}`,
      `Área: ${t}`,
      `${t}`
    ]);},
    correcto(c){ return Utils.choice([
      `La opción correcta es "${c}".`,
      `Respuesta correcta: "${c}".`,
      `Corresponde "${c}".`
    ]);}
  };

  // --- VARIANTS: VARIABLES (MCQ) ---
  function genVariables(){
    const variantes = [
      {
        plantilla: "decl-int",
        enunciado: "¿Cuál es una declaración válida de entero en C++?",
        opciones: ["int x;", "integer x;", "var x:int;", "num x;"],
        correcta: 0,
        expl: "En C++ se usa la palabra clave 'int' seguida del identificador."
      },
      {
        plantilla: "decl-init",
        enunciado: "¿Cuál de estas es una declaración con inicialización válida?",
        opciones: ["int edad = 18;", "let edad = 18;", "edad := 18;", "def edad = 18;"],
        correcta: 0,
        expl: "La forma válida en C++: tipo + identificador + '= valor'."
      },
      {
        plantilla: "ident-valido",
        enunciado: "¿Qué identificador es válido para una variable?",
        opciones: ["_total", "2valor", "precio final", "float"],
        correcta: 0,
        expl: "No puede empezar con dígito, ni tener espacios, ni ser palabra reservada."
      },
      {
        plantilla: "tipos-simples",
        enunciado: "¿Qué tipo primitivo de C++ representa enteros con signo?",
        opciones: ["int", "float", "char", "bool"],
        correcta: 0,
        expl: "int representa enteros con signo; float es real, char carácter, bool lógico."
      }
    ];
    const v = Utils.choice(variantes);
    const item = {
      tema: T.VAR, tipo: "mcq", plantilla: v.plantilla,
      enunciado: v.enunciado,
      opciones: v.opciones.slice(),
      correcta: v.correcta,
      explicacion: v.expl
    };
    return item;
  }

  // --- OPERADORES / PRECEDENCIA (MCQ numérico) ---
  function genOperadores(){
    // Garantizo divisiones limpias
    const a = Utils.randInt(2,12), b = Utils.randInt(2,9),
          c = Utils.randInt(2,9), e = Utils.randInt(2,6);
    const d = e * Utils.randInt(1,6); // múltiplo

    const expr = `${a} + ${b} * ${c} - ${d} / ${e}`;
    const res = Utils.evalAritmetica(expr);

    // Distractores razonables
    const d1 = a + b + c - d / e;
    const d2 = (a + b) * c - d / e;
    const d3 = a + b * c - d;

    let opciones = Array.from(new Set([res, d1, d2, d3])).slice(0,4).map(String);
    while(opciones.length<4) opciones.push(String(res+Utils.randInt(-3,3)));
    Utils.barajar(opciones);
    const correcta = opciones.indexOf(String(res));

    const exp = [
      Frases.aritPrefix[Utils.randInt(0, Frases.aritPrefix.length-1)],
      `${b}*${c} = ${b*c}`,
      `${d}/${e} = ${d/e}`,
      Frases.evalRes(res)
    ].join("<br>");

    return {
      tema: T.OPE, tipo: "mcq", plantilla: "a+b*c-d/e",
      enunciado: `¿Resultado de: ${expr} ?`,
      opciones, correcta, explicacion: exp
    };
  }

  // --- LÓGICOS / RELACIONALES (MCQ V/F) ---
  function genLogicos(){
    const a = Utils.randInt(0,9), b = Utils.randInt(0,9), c = Utils.randInt(0,9);
    const formas = [
      {plantilla:"and", txt: `(${a} < ${b}) && (${b} <= ${c})`, val: (a<b) && (b<=c)},
      {plantilla:"or",  txt: `(${a} == ${b}) || (${b} != ${c})`, val: (a==b) || (b!=c)},
      {plantilla:"not", txt: `!(${a} >= ${b})`,                   val: !(a>=b)},
      {plantilla:"mix", txt: `(${a} < ${b}) || !(${b} == ${c})`,  val: (a<b) || !(b==c)}
    ];
    const f = Utils.choice(formas);
    const opciones = ["Verdadero","Falso"];
    const correcta = f.val ? 0 : 1;
    const exp = [
      "Primero se evalúan las comparaciones (<, <=, ==, !=, >=).",
      "Luego se aplican los lógicos: !, &&, || (con su precedencia).",
      `En este caso, la expresión resulta: ${f.val ? "Verdadera" : "Falsa"}.`
    ].join("<br>");
    return {
      tema: T.LOG, tipo:"mcq", plantilla: f.plantilla,
      enunciado: `Con a=${a}, b=${b}, c=${c}, ¿el valor de ${f.txt} es...?`,
      opciones, correcta, explicacion: exp
    };
  }

  // --- ASIGNACIONES / TRAZAS (Respuesta libre) ---
  function genAsignaciones(){
    // Variantes nuevas para que no canse: compuestos, swap, mixto, encadenado
    const base = Utils.choice(["compuestos","swap","mixto","encadenado"]);
    let enun = "", pasos = [], respuesta = 0, plantilla = base;

    if(base==="compuestos"){
      let x = Utils.randInt(2,12), y = Utils.randInt(2,9);
      const x0 = x;
      pasos.push(`Inicio: x=${x}, y=${y}`);
      x += y; pasos.push(`x = x + y → x=${x}`);
      x *= 2; pasos.push(`x = x * 2 → x=${x}`);
      x %= y; pasos.push(`x = x % y → x=${x}`);
      respuesta = x;
      enun = `Dados x=${x0} y y=${y}, ejecutar: x=x+y; x=x*2; x=x%y; ¿valor final de x?`;
    }else if(base==="swap"){
      let x=Utils.randInt(2,12), y=Utils.randInt(2,12);
      const x0=x, y0=y;
      pasos.push(`Inicio: x=${x}, y=${y}`);
      let aux=x; pasos.push(`aux = x → aux=${aux}`);
      x=y;       pasos.push(`x = y → x=${x}`);
      y=aux;     pasos.push(`y = aux → y=${y}`);
      respuesta = x;
      enun = `Con x=${x0}, y=${y0}, intercambio con 'aux'. ¿Qué valor queda en x al final?`;
    }else if(base==="mixto"){
      let x=Utils.randInt(3,12), y=Utils.randInt(1,6);
      const x0=x, y0=y;
      pasos.push(`Inicio: x=${x}, y=${y}`);
      x-=y; pasos.push(`x = x - y → x=${x}`);
      y+=x; pasos.push(`y = y + x → y=${y}`);
      x*=y; pasos.push(`x = x * y → x=${x}`);
      respuesta = x;
      enun = `Partiendo de x=${x0}, y=${y0}, ejecutar: x=x-y; y=y+x; x=x*y; ¿valor final de x?`;
    }else{ // encadenado
      let a=Utils.randInt(1,5), b=Utils.randInt(2,6), c=Utils.randInt(2,6);
      const a0=a, b0=b, c0=c;
      pasos.push(`Inicio: a=${a}, b=${b}, c=${c}`);
      a = b = c + a; pasos.push(`a = b = c + a → a=${a}, b=${b}, c=${c}`);
      c += a;        pasos.push(`c = c + a → c=${c}`);
      respuesta = a; // valor pedido: a
      enun = `Dado a=${a0}, b=${b0}, c=${c0} ejecutar: a=b=c+a; c=c+a; ¿valor final de a?`;
    }

    return {
      tema: T.ASG, tipo:"exercise", plantilla,
      enunciado: enun,
      respuesta: String(respuesta),
      explicacion: pasos
    };
  }

  // --- CONDICIONALES (MCQ “qué imprime”) ---
  function genCondicionales(){
    const tipo = Utils.choice(["if","segun","if-anidado"]);
    if(tipo==="if"){
      const x = Utils.randInt(0,14);
      const p1 = `Si (x % 2 == 0) entonces imprimir "PAR"`;
      const p2 = `Sino imprimir "IMPAR"`;
      const enun = `x=${x}\n${p1}\n${p2}`;
      const out = (x%2===0) ? "PAR" : "IMPAR";
      const opciones = Utils.barajar(["PAR","IMPAR","Nada","Error"]);
      return {
        tema: T.CON, tipo:"mcq", plantilla:"if-paridad",
        enunciado: `¿Qué imprime el siguiente pseudocódigo?\n\n${enun}`,
        opciones, correcta: opciones.indexOf(out),
        explicacion: `x%2==0 indica paridad. Con x=${x} se imprime "${out}".`
      };
    }
    if(tipo==="if-anidado"){
      const x = Utils.randInt(0,14);
      const enun = `x=${x}
Si (x % 2 == 0) entonces
  Si (x > 10) imprimir "PAR-GRANDE"
  Sino imprimir "PAR"
Sino
  imprimir "IMPAR"`;
      let out;
      if(x%2===0){ out = (x>10?"PAR-GRANDE":"PAR"); }
      else out="IMPAR";
      const opciones = Utils.barajar(["PAR","IMPAR","PAR-GRANDE","Nada"]);
      return {
        tema: T.CON, tipo:"mcq", plantilla:"if-anidado",
        enunciado: `¿Qué imprime el siguiente pseudocódigo?\n\n${enun}`,
        opciones, correcta: opciones.indexOf(out),
        explicacion: `Primero paridad; si es par, luego chequea x>10. Con x=${x} imprime "${out}".`
      };
    }
    // "segun"
    const op = Utils.randInt(1,4);
    const enun = `Segun (op) hacer
1 → imprimir "A"
2 → imprimir "B"
3 → imprimir "C"
otro → imprimir "Z"`;
    const out = (op===1?"A":op===2?"B":op===3?"C":"Z");
    const opciones = Utils.barajar(["A","B","C","Z"]);
    return {
      tema: T.CON, tipo:"mcq", plantilla:"segun",
      enunciado: `Con op=${op}, ¿qué imprime?\n\n${enun}`,
      opciones, correcta: opciones.indexOf(out),
      explicacion: `Coincide el caso ${op}; imprime "${out}".`
    };
  }

  // --- REPETITIVAS (ejercicio) ---
  function genRepetitivas(){
    const tipo = Utils.choice(["mientras","para-suma","para-cont"]);
    if(tipo==="mientras"){
      let x = Utils.randInt(0,5), k = Utils.randInt(2,5), T = Utils.randInt(9,14);
      const x0=x, pasos=[];
      let it=0;
      while(x<T){ x+=k; it++; pasos.push(`Iteración ${it}: x=${x}`); }
      const enun = `x=${x0}; mientras (x < ${T}) { x = x + ${k}; }\n¿valor final de x?`;
      return {
        tema: T.REP, tipo:"exercise", plantilla:"while-suma",
        enunciado: enun,
        respuesta: String(x),
        explicacion: pasos
      };
    }
    if(tipo==="para-suma"){
      const A=Utils.randInt(1,4), B=Utils.randInt(7,12), h=Utils.choice([1,2,3]);
      let s=0, pasos=[];
      for(let i=A;i<=B;i+=h){ s+=i; pasos.push(`i=${i} → s=${s}`); }
      const enun = `s=0; para (i=${A}; i<=${B}; i=${h}) hacer s=s+i;\n¿valor final de s?`;
      return {
        tema: T.REP, tipo:"exercise", plantilla:"for-suma",
        enunciado: enun,
        respuesta: String(s),
        explicacion: pasos
      };
    }
    // para-cont: contar múltiples de m en rango
    const A=Utils.randInt(1,6), B=Utils.randInt(10,18), m=Utils.choice([2,3,4,5]);
    let c=0, pasos=[];
    for(let i=A;i<=B;i++){
      if(i%m===0){ c++; pasos.push(`i=${i} es múltiplo de ${m} → cont=${c}`); }
    }
    const enun = `cont=0; para (i=${A}; i<=${B}; i++) si (i % ${m} == 0) cont=cont+1;\n¿Cuántos múltiplos contó?`;
    return {
      tema: T.REP, tipo:"exercise", plantilla:"for-contar",
      enunciado: enun,
      respuesta: String(c),
      explicacion: pasos
    };
  }

  // --- CASOS PRÁCTICOS (mcq) ---
  function genCasos(){
    const tipo = Utils.choice(["bisiesto","promedio"]);
    if(tipo==="bisiesto"){
      const y = Utils.randInt(1980,2100);
      const leap = (y%400===0) || (y%4===0 && y%100!==0);
      const opciones = ["Sí","No"];
      const correcta = leap?0:1;
      const exp = [
        "Regla de bisiesto:",
        "• divisible por 400 → bisiesto",
        "• si no, divisible por 4 y NO por 100 → bisiesto",
        "• si no, no es bisiesto"
      ].join("<br>");
      return {
        tema: T.CAS, tipo:"mcq", plantilla:"bisiesto",
        enunciado: `Año ${y}: ¿es bisiesto?`,
        opciones, correcta, explicacion: exp
      };
    }else{
      const n1=Utils.randInt(1,10), n2=Utils.randInt(1,10), n3=Utils.randInt(1,10);
      const prom=(n1+n2+n3)/3;
      const apr = prom>=6 ? "Aprobada" : "Desaprobada";
      const opciones = Utils.barajar(["Aprobada","Desaprobada","Recupera","Invalida"]);
      return {
        tema: T.CAS, tipo:"mcq", plantilla:"promedio",
        enunciado: `Notas: ${n1}, ${n2}, ${n3}. Se aprueba con promedio ≥ 6. ¿Resultado?`,
        opciones, correcta: opciones.indexOf(apr),
        explicacion: `Promedio = ${(n1+n2+n3)} / 3 = ${prom.toFixed(2)} → ${apr}.`
      };
    }
  }

  // --- Selector por tema (con antirepetición y reintentos) ---
  function fabricar(temaDeseado){
    const tema = (temaDeseado==="TODOS") ? Sesion.nextTemaParaTodos() : temaDeseado;

    // Intento hasta encontrar algo no visto (tope de intentos razonable)
    for(let intento=0; intento<50; intento++){
      let it;
      switch(tema){
        case T.VAR: it = genVariables(); break;
        case T.OPE: it = genOperadores(); break;
        case T.LOG: it = genLogicos(); break;
        case T.ASG: it = genAsignaciones(); break;
        case T.CON: it = genCondicionales(); break;
        case T.REP: it = genRepetitivas(); break;
        case T.CAS: it = genCasos(); break;
        default:    it = genOperadores(); break;
      }
      // Si por alguna razón llegó vacío, sigo probando
      if(!it) continue;

      // ¿Se repite?
      if(!Sesion.yaVisto(it)){
        Sesion.marcar(it);
        return it;
      }
      // Si se repitió, reintento con misma familia variando números
    }

    // Si no pude evitar repetición (muy mala suerte), devuelvo lo último.
    // Prefiero devolver algo antes que quedarme colgado.
    let backup = genOperadores();
    Sesion.marcar(backup);
    return backup;
  }

  // --- API Público ---
  function generar(tema){ return fabricar(tema); }
  function resetSesion(){ Sesion.reset(); }

  window.Generador = { generar, resetSesion, TEMAS:T };
})();
