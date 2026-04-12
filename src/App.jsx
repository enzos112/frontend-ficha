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

  useEffect(() => { setSesion(getOrCreateSesion()); }, []);

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
          onVerAdmin={() => setVista("admin")}
        />
      )}

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
  );
}