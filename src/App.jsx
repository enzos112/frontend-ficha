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

  useEffect(() => { 
    setSesion(getOrCreateSesion()); 
  }, []);

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
          onVerAdmin={() => setVista("admin")}
        />
      )}

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
  );
}