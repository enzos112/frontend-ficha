<<<<<<< HEAD
import { useState, useEffect } from "react";
import HomeView             from "./HomeView";
import QuizView             from "./QuizView";
import ResultView           from "./ResultView";
import StatsView            from "./StatsView"; 
import { ChismesCanal }     from "./ChismeModal";
import TermsModal           from "./TermsModal"; // 👈 AHORA SÍ: Import corregido
import AdminView            from "./AdminView";

// ── UTILIDADES DE SESIÓN ──
function generarUUID() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
=======
import { useState, useEffect, useCallback } from "react";
import HomeView    from "./HomeView";
import QuizView    from "./QuizView";
import ResultView  from "./ResultView";
import StatsView   from "./StatsView";
import AdminView   from "./AdminView";
import TermsModal  from "./TermsModal";
import { ChismesCanal } from "./ChismeModal";
import { PREGUNTAS }    from "./data";

// ── Sesión anónima ──────────────────────────────────────────────────────────
function generarUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
>>>>>>> 5f648edecfcb4191d8df842463ca01ff48aeb712
  });
}

function generarCodigo() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function getOrCreateSesion() {
  let s = localStorage.getItem("sesion_ficha");
  if (s) return JSON.parse(s);
  const nueva = { uuid: generarUUID(), codigo: generarCodigo() };
  localStorage.setItem("sesion_ficha", JSON.stringify(nueva));
  return nueva;
}

<<<<<<< HEAD
// ── COMPONENTE PRINCIPAL ──
export default function App() {
  const [vista,       setVista]       = useState("home"); 
  const [region,      setRegion]      = useState("");
  const [sesion,      setSesion]      = useState(null);
  const [preguntas,   setPreg]        = useState([]);      
  const [perfilId,    setPerfil]      = useState(null);
  const [chismesU,    setChismesU]    = useState([]); 
  const [chismesPool, setChismesPool] = useState([]); 
  const [cargando,    setCarg]        = useState(false);
  const [showTerms,   setShowTerms]   = useState(false); // 👈 Controla si se ve el modal
=======
// ── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [vista,      setVista]    = useState("home");
  const [region,     setRegion]   = useState("");
  const [edad,       setEdad]     = useState("");
  const [genero,     setGenero]   = useState("");
  const [sesion,     setSesion]   = useState(null);
  const [respuestas, setResp]     = useState([]);
  const [perfilId,   setPerfil]   = useState(null);
  const [chismesU,   setChismesU] = useState([]);
  const [showTerms,  setTerms]    = useState(false);
  const [statsData,  setStats]    = useState(null);
>>>>>>> 5f648edecfcb4191d8df842463ca01ff48aeb712

  useEffect(() => { 
    setSesion(getOrCreateSesion()); 
  }, []);

<<<<<<< HEAD
  // ── 1. INICIAR TRÁMITE ──
  async function handleStart(datosHome) {
    const reg = datosHome.region || "Nacional";
    setRegion(reg);
    setCarg(true);
    
    try {
      await fetch("/api/init-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uuid: sesion.uuid, codigo_tramite: sesion.codigo, ...datosHome })
      });

      const resPreg = await fetch(`/api/get-preguntas?uuid=${sesion.uuid}`);
      const dataPreg = await resPreg.json();
      setPreg(dataPreg);

      const resChis = await fetch(`/api/get-chismes?region=${encodeURIComponent(reg)}`);
      const dataChis = await resChis.json();
      setChismesPool(dataChis); 

      setVista("quiz");
    } catch (error) {
      console.error("Error al iniciar:", error);
    } finally { 
      setCarg(false); 
    }
  }

  // ── 2. GUARDAR RESPUESTA INDIVIDUAL ──
  const handleAnswer = async (data) => {
    try {
      const res = await fetch("/api/save-respuesta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uuid: sesion.uuid, ...data })
      });
      const json = await res.json();
      return json.porcentaje || 0; 
    } catch (err) {
      console.error("Error al guardar respuesta:", err);
      return 0;
    }
  };

  // ── 3. CALCULAR RESULTADO FINAL ──
  const handleFinish = async () => {
    setCarg(true);
    try {
      const res = await fetch("/api/get-resultado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uuid: sesion.uuid })
      });
      const data = await res.json();
      
      if (data.success) {
        setPerfil(data.perfil);
        setVista("result");
      } else {
        alert("Ocurrió un error al procesar tu ficha.");
        setVista("home");
      }
    } catch (err) {
      console.error("Error al obtener resultado final:", err);
      setVista("home");
    } finally {
      setCarg(false);
    }
  };

  return (
    <>
      {cargando && <LoadingScreen />}

      {/* 👈 AHORA SÍ: El modal de términos renderiza aquí si showTerms es true */}
      {showTerms && (
        <TermsModal 
          onClose={() => setShowTerms(false)} 
          onAceptar={() => setShowTerms(false)} 
        />
      )}

      {vista === "home" && !cargando && (
        <HomeView 
          onStart={handleStart} 
          onVerChismes={() => setVista("canal")} 
          onVerStats={() => setVista("stats")} 
          onVerTerms={() => setShowTerms(true)} // 👈 AHORA SÍ: Activa el modal
=======
  function calcularPerfil(resps) {
    const conteo = {};
    resps.forEach(r => { conteo[r.perfil_id] = (conteo[r.perfil_id] || 0) + 1; });
    return Object.entries(conteo).sort((a, b) => b[1] - a[1])[0]?.[0] || "tranquilo";
  }

  function handleStart({ region: r, edad: e, genero: g }) {
    setRegion(r); setEdad(e); setGenero(g);
    setResp([]);
    setVista("quiz");
    // TODO (Enzo): GET /api/get-preguntas?uuid=...&edad=...&genero=...&region=...
  }

  const handleAnswer = useCallback(({ pregunta_id, lado, perfil_id }) => {
    setResp(prev => [...prev, { pregunta_id, lado, perfil_id }]);
    // TODO (Enzo): POST /api/save-respuesta
  }, []);

  function handleFinish() {
    const ganador = calcularPerfil(respuestas);
    setPerfil(ganador);
    setVista("result");
    // TODO (Enzo): POST /api/get-resultado
  }

  function handleNuevoChisme(chisme) {
    setChismesU(prev => [chisme, ...prev]);
    // TODO (Enzo): POST /api/submit-chisme
  }

  function handleReiniciar() {
    setResp([]); setPerfil(null); setRegion(""); setEdad(""); setGenero("");
    setVista("home");
  }

  async function irAStats() {
    setVista("stats");
    // TODO (Enzo): descomentar cuando la API esté lista:
    // if (!statsData) {
    //   const res  = await fetch("/api/get-estadisticas");
    //   const data = await res.json();
    //   setStats(data);
    // }
  }

  return (
    <>
      {showTerms && (
        <TermsModal
          onClose={() => setTerms(false)}
          onAceptar={() => setTerms(false)}
        />
      )}

      {vista === "home" && (
        <HomeView
          onStart={handleStart}
          onVerChismes={() => setVista("canal")}
          onVerStats={irAStats}
          onVerTerms={() => setTerms(true)}
>>>>>>> 5f648edecfcb4191d8df842463ca01ff48aeb712
          onVerAdmin={() => setVista("admin")}
        />
      )}

<<<<<<< HEAD
      {vista === "quiz" && !cargando && (
        <QuizView 
          preguntas={preguntas} 
          chismes={chismesPool} 
          onAnswer={handleAnswer} 
          onFinish={handleFinish} 
          sesionId={sesion?.uuid} 
        />
      )}

      {vista === "stats" && !cargando && (
        <StatsView onClose={() => setVista("home")} /> 
      )}

      {vista === "canal" && !cargando && (
        <ChismesCanal 
          chismesExtra={chismesU} 
          sesionId={sesion?.uuid}
          onNuevoChisme={(txt) => setChismesU([txt, ...chismesU])} 
          onClose={() => setVista("home")} 
        />
      )}

      {vista === "result" && !cargando && (
        <ResultView 
          perfil={perfilId} 
          region={region} 
          onReiniciar={() => {
            setSesion(getOrCreateSesion());
            setVista("home");
          }} 
        />
      )}

      {vista === "admin" && !cargando && (
        <AdminView onClose={() => setVista("home")} />
      )}
    </>
  );
}

// ── PANTALLA DE CARGA GLOBAL ──
function LoadingScreen() {
  return (
    <div style={{ 
      minHeight:"100vh", background:"#0A0A0A", 
      display:"flex", flexDirection:"column", 
      alignItems:"center", justifyContent:"center" 
    }}>
      <p style={{ 
        color:"#FF6B00", fontFamily:"'Courier Prime', monospace", 
        fontSize:"18px", letterSpacing: "2px", animation: "pulse 1.5s infinite"
      }}>
        PROCESANDO TRÁMITE...
      </p>
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }
      `}</style>
    </div>
=======
      {vista === "quiz" && (
        <QuizView
          preguntas={PREGUNTAS}
          onAnswer={handleAnswer}
          onFinish={handleFinish}
          totalRespondidas={0}
        />
      )}

      {vista === "result" && (
        <ResultView
          perfilId={perfilId}
          region={region}
          codigo={sesion?.codigo || "FCH-0000"}
          onReiniciar={handleReiniciar}
          onVerCanal={() => setVista("canal")}
          onVerStats={irAStats}
        />
      )}

      {vista === "canal" && (
        <ChismesCanal
          chismesExtra={chismesU}
          onNuevoChisme={handleNuevoChisme}
          onClose={() => setVista(perfilId ? "result" : "home")}
        />
      )}

      {vista === "stats" && (
        <StatsView
          datos={statsData || undefined}
          onClose={() => setVista(perfilId ? "result" : "home")}
        />
      )}

      {vista === "admin" && (
        <AdminView
          onClose={() => setVista("home")}
        />
      )}
    </>
>>>>>>> 5f648edecfcb4191d8df842463ca01ff48aeb712
  );
}