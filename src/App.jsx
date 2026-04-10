import { useState, useEffect, useCallback } from "react";
import HomeView             from "./HomeView";
import QuizView             from "./QuizView";
import ResultView           from "./ResultView";
import ChismeModal, { ChismesCanal } from "./ChismeModal";
import { PREGUNTAS }        from "./data";

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
  const [vista,      setVista]   = useState("home");  // home | quiz | result | canal
  const [region,     setRegion]  = useState("");
  const [sesion,     setSesion]  = useState(null);
  const [respuestas, setResp]    = useState([]);
  const [perfilId,   setPerfil]  = useState(null);
  const [chismesU,   setChismesU]= useState([]); // chismes enviados por usuarios

  useEffect(() => { setSesion(getOrCreateSesion()); }, []);

  // ── Calcular perfil ganador ──
  function calcularPerfil(resps) {
    const conteo = {};
    resps.forEach(r => { conteo[r.perfil_id] = (conteo[r.perfil_id] || 0) + 1; });
    return Object.entries(conteo).sort((a,b) => b[1]-a[1])[0]?.[0] || "tranquilo";
  }

  // ── Handlers ──
  function handleStart(reg) {
    setRegion(reg);
    setResp([]);
    setVista("quiz");
  }

  const handleAnswer = useCallback(({ pregunta_id, lado, perfil_id }) => {
    setResp(prev => [...prev, { pregunta_id, lado, perfil_id }]);
    // TODO (Enzo): POST /api/submit-respuesta
  }, []);

  function handleFinish() {
    const ganador = calcularPerfil(respuestas);
    setPerfil(ganador);
    setVista("result");
    // TODO (Enzo): POST /api/finalizar-ficha
  }

  function handleNuevoChisme(chisme) {
    setChismesU(prev => [chisme, ...prev]);
    // TODO (Enzo): POST /api/submit-chisme
  }

  function handleReiniciar() {
    setResp([]);
    setPerfil(null);
    setRegion("");
    setVista("home");
  }

  // ── Render ──
  if (vista === "home") {
    return (
      <HomeView
        onStart={handleStart}
        onVerChismes={() => setVista("canal")}
      />
    );
  }

  if (vista === "quiz") {
    return (
      <QuizView
        preguntas={PREGUNTAS}
        onAnswer={handleAnswer}
        onFinish={handleFinish}
        totalRespondidas={0}
      />
    );
  }

  if (vista === "result") {
    return (
      <ResultView
        perfilId={perfilId}
        region={region}
        codigo={sesion?.codigo || "FCH-0000"}
        onReiniciar={handleReiniciar}
        onVerCanal={() => setVista("canal")}
      />
    );
  }

  if (vista === "canal") {
    return (
      <ChismesCanal
        chismesExtra={chismesU}
        onNuevoChisme={handleNuevoChisme}
        onClose={() => setVista(perfilId ? "result" : "home")}
      />
    );
  }

  return null;
}