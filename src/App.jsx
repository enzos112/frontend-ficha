import { useState, useEffect, useCallback } from "react";
import HomeView   from "./HomeView";
import QuizView   from "./QuizView";
import ResultView from "./ResultView";

// ── Sesión anónima ──────────────────────────────────────────────────────────
function generarUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}
function generarCodigo() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let c = "FCH-";
  for (let i = 0; i < 4; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
}
function getOrCreateSesion() {
  let uuid   = localStorage.getItem("stf_uuid");
  let codigo = localStorage.getItem("stf_codigo");
  if (!uuid) {
    uuid   = generarUUID();
    codigo = generarCodigo();
    localStorage.setItem("stf_uuid",   uuid);
    localStorage.setItem("stf_codigo", codigo);
  }
  return { uuid, codigo: codigo || generarCodigo() };
}

// ── MOCK DATA ───────────────────────────────────────────────────────────────
const MOCK_PREGUNTAS = [
  {
    id: 1,
    texto: "¿Qué haces cuando el trámite en la muni va a cerrar y aún no te atienden?",
    opciones: [
      { id:1, texto:"Me quedo hasta que me atiendan aunque sea a oscuras",    perfil_id:"radical"    },
      { id:2, texto:"Busco al jefe del área y le explico mi situación",        perfil_id:"negociador" },
      { id:3, texto:"Pregunto si hay alguien que 'agilice' el trámite",        perfil_id:"vivillo"    },
      { id:4, texto:"Me voy y vuelvo mañana, paciencia pe",                   perfil_id:"tranquilo"  },
    ],
  },
  {
    id: 2,
    texto: "Llega época electoral. ¿Cómo eliges a tu candidato?",
    opciones: [
      { id:5,  texto:"Leo su plan de gobierno completo",           perfil_id:"tecnico"    },
      { id:6,  texto:"Veo quién habla mejor en los debates",       perfil_id:"mediatico"  },
      { id:7,  texto:"El que no haya robado tanto",                perfil_id:"tranquilo"  },
      { id:8,  texto:"El que mi familia vota de toda la vida",     perfil_id:"tradicional"},
    ],
  },
  {
    id: 3,
    texto: "El de atrás se cuela en la fila del banco. ¿Qué haces?",
    opciones: [
      { id:9,  texto:"Le digo en voz alta frente a todos",         perfil_id:"radical"    },
      { id:10, texto:"Le digo en voz baja para no hacer escena",   perfil_id:"negociador" },
      { id:11, texto:"Lo veo y no digo nada",                      perfil_id:"tranquilo"  },
      { id:12, texto:"Me cuelo yo también, si todos lo hacen…",    perfil_id:"vivillo"    },
    ],
  },
  {
    id: 4,
    texto: "Tu vecino construye sin permiso. ¿Qué haces?",
    opciones: [
      { id:13, texto:"Llamo a la municipalidad al toque",          perfil_id:"tecnico"    },
      { id:14, texto:"Le hablo para arreglarlo entre vecinos",     perfil_id:"negociador" },
      { id:15, texto:"Nada, a mí no me afecta",                   perfil_id:"tranquilo"  },
      { id:16, texto:"Aprovecho y yo también construyo",           perfil_id:"vivillo"    },
    ],
  },
  {
    id: 5,
    texto: "¿Cuánto confías en las instituciones del Estado peruano?",
    opciones: [
      { id:17, texto:"Cero, todo es corrupción pura",              perfil_id:"radical"    },
      { id:18, texto:"Hay gente buena dentro del sistema",         perfil_id:"negociador" },
      { id:19, texto:"Depende de la institución",                  perfil_id:"tecnico"    },
      { id:20, texto:"Confío, pero verifico siempre",              perfil_id:"tecnico"    },
    ],
  },
];

const MOCK_CHISMES = [
  { id:1, texto:"Dicen que en la sede de Miraflores hay un cajero que solo funciona cuando el jefe está de buen humor.", autor_region:"Lima" },
  { id:2, texto:"Según el padrón, el 40% de los votos nulos del 2021 tenían escritos nombres de futbolistas.", autor_region:"Cusco" },
  { id:3, texto:"Un funcionario en Piura firmó el mismo documento dos veces porque 'la primera era borrador'.", autor_region:"Piura" },
];

const MOCK_PERFILES = {
  radical:     { id:"radical",    nombre:"LA FICHA RADICAL",     emoji:"🦁", color:"#FF6B00", descripcion:"Tienes carácter, no te callas ante nadie y crees que el sistema necesita un cambio total. Protestar es tu deporte.", rasgos:["Dice lo que piensa sin filtro","Desconfía del Estado","Lidera o se va","Vota con convicción aunque pierda"], estadistica:"El 34% en tu departamento comparte este perfil." },
  vivillo:     { id:"vivillo",    nombre:"EL VIVILLO MAYOR",     emoji:"🦊", color:"#FFFF00", descripcion:"Conoces todos los atajos, todos los contactos. El sistema no te da miedo, lo navegas con una sonrisa.", rasgos:["Siempre tiene un contacto","Agiliza lo que otros no pueden","El primero en llegar","Sabe cuándo hablar y cuándo callar"], estadistica:"El 22% del país opera así. Más de los que admiten." },
  tranquilo:   { id:"tranquilo",  nombre:"EL TRANQUILO TOTAL",   emoji:"🦥", color:"#00FF41", descripcion:"Fluyes con la corriente. La paciencia es tu superpoder y prefieres evitar el conflicto. No es indiferencia, es sabiduría.", rasgos:["Espera su turno sin quejarse","No busca pelea","Adaptable a todo","Su voto es su secreto"], estadistica:"El 18% de los peruanos respira hondo antes de actuar." },
  negociador:  { id:"negociador", nombre:"LA MENTE DIPLOMÁTICA", emoji:"🤝", color:"#FF00AA", descripcion:"Ves todos los ángulos. Tu inteligencia emocional es tu carta fuerte y siempre buscas el acuerdo.", rasgos:["Escucha antes de hablar","Busca consenso siempre","Conoce las reglas","Su voto es estratégico"], estadistica:"Solo el 12% llega a acuerdos sin perder el estilo." },
  tecnico:     { id:"tecnico",    nombre:"EL TÉCNICO RIGUROSO",  emoji:"🦉", color:"#00FFFF", descripcion:"Lees el reglamento. Siempre. Crees que los problemas del Perú se resuelven con datos y gente capaz.", rasgos:["Lee el plan de gobierno","Cita cifras en conversaciones","Exige rendición de cuentas","Vota con lápiz, no con emoción"], estadistica:"El 9% del electorado es tan meticuloso como tú." },
  mediatico:   { id:"mediatico",  nombre:"EL MEDIÁTICO TOTAL",   emoji:"📺", color:"#FF6B00", descripcion:"La imagen lo es todo. Sigues la narrativa, el debate te mueve y el candidato que habla bonito te convence.", rasgos:["Se fija en la forma","Le gusta el espectáculo","Comparte antes de leer","Vota por el que sale en TV"], estadistica:"El 15% de Perú vota con los ojos." },
  tradicional: { id:"tradicional",nombre:"EL TRADICIONAL PURO",  emoji:"👨‍👩‍👧", color:"#FFFF00", descripcion:"La familia, la costumbre y lo conocido. El cambio te genera desconfianza y prefieres lo que siempre ha funcionado.", rasgos:["La familia decide","Desconfía de lo nuevo","Vota como siempre","El barrio lo es todo"], estadistica:"El 20% del electorado mantiene sus raíces vivas." },
};

// ── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [vista,            setVista]    = useState("home");
  const [region,           setRegion]   = useState("");
  const [sesion,           setSesion]   = useState(null);
  const [preguntas,        setPreg]     = useState([]);
  const [respuestas,       setResp]     = useState([]);
  const [totalRespondidas, setTotal]    = useState(0);
  const [perfil,           setPerfil]   = useState(null);
  const [cargando,         setCarg]     = useState(false);

  useEffect(() => { setSesion(getOrCreateSesion()); }, []);

  async function handleStart(reg) {
    setRegion(reg);
    setCarg(true);
    try {
      // TODO (Enzo): const res = await fetch(`/api/get-preguntas?uuid=${sesion.uuid}`);
      await delay(700);
      setPreg(MOCK_PREGUNTAS);
      setVista("quiz");
    } finally { setCarg(false); }
  }

  const handleAnswer = useCallback(async ({ pregunta_id, opcion_id, perfil_id }) => {
    setResp(prev => [...prev, { pregunta_id, opcion_id, perfil_id }]);
    // TODO (Enzo): await fetch("/api/submit-respuesta", { method:"POST", body: JSON.stringify({uuid:sesion.uuid, pregunta_id, opcion_id, perfil_id}) });
  }, [sesion]);

  async function handleFinish() {
    try {
      await delay(400);
      // TODO (Enzo): const res = await fetch("/api/finalizar-ficha", { method:"POST", body: JSON.stringify({uuid:sesion.uuid, region}) });
      const conteo = {};
      respuestas.forEach(r => { conteo[r.perfil_id] = (conteo[r.perfil_id] || 0) + 1; });
      const ganador = Object.entries(conteo).sort((a,b) => b[1]-a[1])[0]?.[0] || "tranquilo";
      const perfilData = MOCK_PERFILES[ganador] || MOCK_PERFILES.tranquilo;
      setTotal(prev => prev + preguntas.length);
      setPerfil({ ...perfilData, codigo: sesion?.codigo || "FCH-MOCK" });
      setVista("result");
    } catch(e) { console.error(e); }
  }

  async function handleEnviarChisme(texto) {
    await delay(600);
    // TODO (Enzo): await fetch("/api/submit-chisme", { method:"POST", body: JSON.stringify({uuid:sesion.uuid, texto, region}) });
  }

  function handleReiniciar() {
    setResp([]); setPreg([]); setPerfil(null); setRegion(""); setVista("home");
  }

  if (cargando) return (
    <div style={{ minHeight:"100vh", background:"#0A0A0A", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16 }}>
      <div style={{ width:40, height:40, border:"3px solid #1a1a1a", borderTopColor:"#FF6B00", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <p style={{ fontFamily:"'Courier Prime',monospace", fontSize:13, color:"#555", letterSpacing:1 }}>Cargando el expediente...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (vista === "home")   return <HomeView onStart={handleStart} />;
  if (vista === "quiz")   return <QuizView preguntas={preguntas} onAnswer={handleAnswer} onFinish={handleFinish} totalRespondidas={totalRespondidas} chismes={MOCK_CHISMES} onEnviarChisme={handleEnviarChisme} />;
  if (vista === "result") return <ResultView perfil={perfil} region={region} onReiniciar={handleReiniciar} />;
  return null;
}

const delay = ms => new Promise(r => setTimeout(r, ms));