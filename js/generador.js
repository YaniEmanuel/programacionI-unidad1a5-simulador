// Nota: acá están o deberían salir  7 familias...
// La idea es que cada llamada devuelva 1 ejercicio listo para usar, en teoría..
// con: {tema, tipo, enunciado, opciones?, correcta?, respuesta?, explicacion}

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

  // --- Helpers "mi estilo" para fabricar explicaciones cortas y limpias ---
  function explLinea(txt){ return `• ${txt}`; }
  function joinExp(arr){ return arr.join("<br>"); }

  // 1) Variables (declaración básica y tipos). MCQ
  function genVariables(){
    // Mantengo cosas simples y clásicas de la cursada
    const variantes = [
      {
        enunciado: "¿Cuál es una declaración válida de entero en C++?",
        opciones: ["int x;", "integer x;", "var x:int;", "num x;"],
        correcta: 0,
        expl: "En C++ se usa la palabra clave 'int' seguida del identificador."
      },
      {
        enunciado: "¿Cuál es una asignación válida a una variable entera?",
        opciones: ["int x = 5;", "x := 5;", "x ← 5", "def x = 5;"],
        correcta: 0,
        expl: "En C++ la asignación válida en declaración es: int x = 5;"
      },
      {
        enunciado: "¿Cuál es el nombre de variable válido?",
        opciones: ["_total", "2valor", "precio final", "float"],
        correcta: 0,
        expl: "Los identificadores no pueden iniciar con dígito ni contener espacios; tampoco pueden ser palabras reservadas."
      }
    ];
    const v = Utils.choice(variantes);
    return {
      tema: T.VAR, tipo: "mcq",
      enunciado: v.enunciado,
      opciones: v.opciones.slice(),
      correcta: v.correcta,
      explicacion: v.expl
    };
  }

  // 2) Operadores / Precedencia. MCQ (resultado numérico)
  function genOperadores(){
    // Garantizo divisiones limpias (d múltiplo de e) para no meter decimales raros
    const a = Utils.randInt(2,9), b = Utils.randInt(2,9),
          c = Utils.randInt(2,9), e = Utils.randInt(2,5);
    const k = Utils.randInt(1,3);
    const d = e * Utils.randInt(1,4) * k;

    const expr = `${a} + ${b} * ${c} - ${d} / ${e}`;
    const res = Utils.evalAritmetica(`${a} + ${b} * ${c} - ${d} / ${e}`);

    // Distractores típicos: sumar todo en orden, cambiar precedencia, etc.
    const d1 = a + b + c - d / e;        // se olvidan de * primero
    const d2 = (a + b) * c - d / e;      // agrupan mal a+b
    const d3 = a + b * c - d;            // ignoran la división

    // Opciones únicas y mezcladas
    let opciones = Array.from(new Set([res, d1, d2, d3])).slice(0,4).map(x=>String(x));
    while(opciones.length<4) opciones.push(String(res+Utils.randInt(-3,3)));
    Utils.barajar(opciones);
    const correcta = opciones.indexOf(String(res));

    const exp = joinExp([
      explLinea("Primero * y /; luego + y -."),
      explLinea(`${b}*${c} = ${b*c}`),
      explLinea(`${d}/${e} = ${d/e}`),
      explLinea(`Queda: ${a} + ${b*c} - ${d/e} = ${res}`)
    ]);

    return {
      tema: T.OPE, tipo: "mcq",
      enunciado: `¿Resultado de: ${expr} ?`,
      opciones, correcta, explicacion: exp
    };
  }

  // 3) Lógicos/Relacionales. MCQ Verdadero/Falso
  function genLogicos(){
    const a = Utils.randInt(0,9), b = Utils.randInt(0,9), c = Utils.randInt(0,9);
    const formas = [
      {txt: `(${a} < ${b}) && (${b} <= ${c})`, val: (a<b) && (b<=c)},
      {txt: `(${a} == ${b}) || (${b} != ${c})`, val: (a==b) || (b!=c)},
      {txt: `!(${a} >= ${b})`, val: !(a>=b)},
    ];
    const f = Utils.choice(formas);
    const opciones = ["Verdadero","Falso"];
    const correcta = f.val ? 0 : 1;
    const exp = joinExp([
      explLinea("Se evalúan primero las comparaciones (<, <=, ==, !=, >=)."),
      explLinea("Luego se aplican los lógicos: !, &&, || (con su precedencia)."),
      explLinea(`En este caso, la expresión resulta: ${f.val ? "Verdadera" : "Falsa"}.`)
    ]);
    return {
      tema: T.LOG, tipo:"mcq",
      enunciado: `Con enteros a=${a}, b=${b}, c=${c}, ¿el valor de ${f.txt} es...?`,
      opciones, correcta, explicacion: exp
    };
  }

  // 4) Asignaciones / Trazas. Ejercicio de respuesta libre (número)
  function genAsignaciones(){
    // Variante típica: swap simple, operadores compuestos, etc.
    const base = Utils.choice(["compuestos","swap","mixto"]);
    let enun = "", pasos = [], respuesta = 0;

    if(base==="compuestos"){
      let x = Utils.randInt(2,9), y = Utils.randInt(2,9);
      const x0 = x;
      pasos.push(`Inicio: x=${x}, y=${y}`);
      x += y; pasos.push(`x = x + y → x=${x}`);
      x *= 2; pasos.push(`x = x * 2 → x=${x}`);
      x %= y; pasos.push(`x = x % y → x=${x}`);
      respuesta = x;
      enun = `Dado: x=${x0}; y=${y}; luego x=x+y; x=x*2; x=x%y; ¿valor final de x?`;
    }else if(base==="swap"){
      let x=Utils.randInt(2,9), y=Utils.randInt(2,9);
      const x0=x, y0=y;
      pasos.push(`Inicio: x=${x}, y=${y}`);
      let aux=x; pasos.push(`aux = x → aux=${aux}`);
      x=y;       pasos.push(`x = y → x=${x}`);
      y=aux;     pasos.push(`y = aux → y=${y}`);
      respuesta = x;
      enun = `Con x=${x0}, y=${y0}, hacé el intercambio usando 'aux'. ¿Qué valor queda en x al final?`;
    }else{ // mixto
      let x=Utils.randInt(3,9), y=Utils.randInt(1,4);
      const x0=x, y0=y;
      pasos.push(`Inicio: x=${x}, y=${y}`);
      x-=y; pasos.push(`x = x - y → x=${x}`);
      y+=x; pasos.push(`y = y + x → y=${y}`);
      x*=y; pasos.push(`x = x * y → x=${x}`);
      respuesta = x;
      enun = `Partiendo de x=${x0}, y=${y0}, ejecutar: x=x-y; y=y+x; x=x*y; ¿valor final de x?`;
    }

    return {
      tema: T.ASG, tipo:"exercise",
      enunciado: enun,
      respuesta: String(respuesta),
      explicacion: pasos
    };
  }

  // 5) Condicionales (Si/Segun). MCQ “qué imprime”
  function genCondicionales(){
    const tipo = Utils.choice(["if","segun"]);
    if(tipo==="if"){
      const x = Utils.randInt(0,12);
      // if anidado simple
      const enun = `Si x=${x}:
Si (x % 2 == 0) entonces imprimir "PAR"
Sino si (x > 10) imprimir "GRANDE"
Sino imprimir "IMPAR"`;
      let out = "";
      if(x%2===0) out="PAR"; else if(x>10) out="GRANDE"; else out="IMPAR";
      const opciones = Utils.barajar(["PAR","GRANDE","IMPAR","Nada"]);
      return {
        tema: T.CON, tipo:"mcq",
        enunciado: `¿Qué imprime el siguiente pseudocódigo?\n\n${enun}`,
        opciones, correcta: opciones.indexOf(out),
        explicacion: `Se evalúa en orden: paridad primero, si no, x>10; con x=${x} resulta "${out}".`
      };
    }else{
      const op = Utils.randInt(1,3);
      const enun = `Segun (op) hacer:
1 → imprimir "A"
2 → imprimir "B"
3 → imprimir "C"
otro → imprimir "Z"`;
      let out = (op===1?"A":op===2?"B":op===3?"C":"Z");
      const opciones = Utils.barajar(["A","B","C","Z"]);
      return {
        tema: T.CON, tipo:"mcq",
        enunciado: `Con op=${op}, ¿qué imprime?\n\n${enun}`,
        opciones, correcta: opciones.indexOf(out),
        explicacion: `Coincide el caso ${op}; imprime "${out}".`
      };
    }
  }

  // 6) Repetitivas (mientras/para). Ejercicio de respuesta libre
  function genRepetitivas(){
    const tipo = Utils.choice(["mientras","para"]);
    if(tipo==="mientras"){
      let x = Utils.randInt(0,4), k = Utils.randInt(2,4), T = Utils.randInt(8,12);
      const x0=x, pasos=[];
      let it=0;
      while(x<T){ x+=k; it++; pasos.push(`Iteración ${it}: x=${x}`); }
      const enun = `Con x=${x0}, mientras (x < ${T}) { x = x + ${k}; } ¿valor final de x y cuántas iteraciones? (respondé solo x)`;
      return {
        tema: T.REP, tipo:"exercise",
        enunciado: enun,
        respuesta: String(x),
        explicacion: pasos
      };
    }else{
      const A=Utils.randInt(1,4), B=Utils.randInt(6,12), h=Utils.choice([1,2,3]);
      let s=0, pasos=[];
      for(let i=A;i<=B;i+=h){ s+=i; pasos.push(`i=${i} → s=${s}`); }
      const enun = `s=0; para (i=${A}; i<=${B}; i=${h}) hacer s=s+i; ¿valor final de s?`;
      return {
        tema: T.REP, tipo:"exercise",
        enunciado: enun,
        respuesta: String(s),
        explicacion: pasos
      };
    }
  }

  // 7) Casos prácticos: bisiesto / promedio. MCQ o exercise según caso
  function genCasos(){
    const tipo = Utils.choice(["bisiesto","promedio"]);
    if(tipo==="bisiesto"){
      const y = Utils.randInt(1980,2100);
      const leap = (y%400===0) || (y%4===0 && y%100!==0);
      const opciones = ["Sí","No"];
      const correcta = leap?0:1;
      const exp = joinExp([
        explLinea("Regla de bisiesto:"),
        explLinea("• divisible por 400 → bisiesto"),
        explLinea("• si no, divisible por 4 y NO por 100 → bisiesto"),
        explLinea("• si no, no es bisiesto")
      ]);
      return {
        tema: T.CAS, tipo:"mcq",
        enunciado: `Año ${y}: ¿es bisiesto?`,
        opciones, correcta, explicacion: exp
      };
    }else{
      const n1=Utils.randInt(1,10), n2=Utils.randInt(1,10), n3=Utils.randInt(1,10);
      const prom=(n1+n2+n3)/3;
      const apr = prom>=6 ? "Aprobada" : "Desaprobada";
      const opciones = Utils.barajar(["Aprobada","Desaprobada","Recupera","Invalida"]);
      return {
        tema: T.CAS, tipo:"mcq",
        enunciado: `Notas: ${n1}, ${n2}, ${n3}. Se aprueba con promedio ≥ 6. ¿Resultado?`,
        opciones, correcta: opciones.indexOf(apr),
        explicacion: `Promedio = ${(n1+n2+n3)} / 3 = ${prom.toFixed(2)} → ${apr}.`
      };
    }
  }

  // --- API público: un solo punto de entrada ---
  function generar(tema){
    // Si eligen "Todos", matcheo al azar
    const pick = (tema==="TODOS") ? Utils.choice(Object.values(T)) : tema;

    switch(pick){
      case T.VAR: return genVariables();
      case T.OPE: return genOperadores();
      case T.LOG: return genLogicos();
      case T.ASG: return genAsignaciones();
      case T.CON: return genCondicionales();
      case T.REP: return genRepetitivas();
      case T.CAS: return genCasos();
      default:     return genOperadores();
    }
  }

  window.Generador = { generar, TEMAS:T };
})();

