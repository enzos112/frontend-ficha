import { useState, useEffect, useCallback } from "react";
import HomeView         from "./HomeView";
import QuizView         from "./QuizView";
import ResultView       from "./ResultView";
import StatsView        from "./StatsView";
import AdminView        from "./AdminView";
import TermsModal       from "./TermsModal";
import { ChismesCanal } from "./ChismeModal";
import { PREGUNTAS }    from "./data";

// ── Sesión anónima ──────────────────────────────────────────────────────────
function generarUUID() {
  if (crypto.randomUUID) return crypto.randomUUID();
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
  let s = localStorage.getItem("sesion_ficha");
  if (s) return JSON.parse(s);
  const nueva = { uuid: generarUUID(), codigo: generarCodigo() };
  localStorage.setItem("sesion_ficha", JSON.stringify(nueva));
  return nueva;
}

// ── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [vista,       setVista]    = useState("home");
  const [region,      setRegion]   = useState("");
  const [edad,        setEdad]     = useState("");
  const [genero,      setGenero]   = useState("");
  const [sesion,      setSesion]   = useState(null);
  const [preguntas,   setPreg]     = useState(PREGUNTAS); // usa mock hasta que Enzo conecte
  const [respuestas,  setResp]     = useState([]);
  const [perfilId,    setPerfil]   = useState(null);
  const [chismesU,    setChismesU] = useState([]);
  const [chismesPool, setChismesPool] = useState([]);
  const [showTerms,   setTerms]    = useState(false);
  const [statsData,   setStats]    = useState(null);
  const [cargando,    setCarg]     = useState(false);

  useEffect(() => { setSesion(getOrCreateSesion()); }, []);

  // ── Calcular perfil local (fallback si no hay API) ──
  function calcularPerfil(resps) {
    const conteo = {};
    resps.forEach(r => { conteo[r.perfil_id] = (conteo[r.perfil_id] || 0) + 1; });
    return Object.entries(conteo).sort((a, b) => b[1] - a[1])[0]?.[0] || "tranquilo";
  }

  // ── 1. Iniciar trámite ──
  async function handleStart({ region: r, edad: e, genero: g }) {
    setRegion(r); setEdad(e); setGenero(g);
    setResp([]);
    setCarg(true);

    try {
      // Enzo: init-session guarda uuid + datos demográficos
      await fetch("/api/init-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uuid: sesion.uuid, codigo_tramite: sesion.codigo, region: r, edad: e, genero: g }),
      }).catch(() => {}); // si falla, continuamos con mock

      // Enzo: get-preguntas filtra por uuid (sin repetir) + edad + genero + region
      const resPreg = await fetch(`/api/get-preguntas?uuid=${sesion.uuid}&region=${r}&edad=${e}&genero=${g}`)
        .then(res => res.json())
        .catch(() => null);
      if (resPreg && resPreg.length > 0) setPreg(resPreg);

      // Enzo: chismes filtrados por región
      const resChis = await fetch(`/api/get-chismes?region=${encodeURIComponent(r)}`)
        .then(res => res.json())
        .catch(() => null);
      if (resChis) setChismesPool(resChis);

    } catch (e) {
      console.error("Error init:", e);
    } finally {
      setCarg(false);
      setVista("quiz");
    }
  }

  // ── 2. Guardar respuesta ──
  const handleAnswer = useCallback(async ({ pregunta_id, lado, perfil_id }) => {
    setResp(prev => [...prev, { pregunta_id, lado, perfil_id }]);
    try {
      const res = await fetch("/api/save-respuesta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uuid: sesion?.uuid, pregunta_id, lado, perfil_id }),
      });
      const json = await res.json();
      return json.porcentaje || 0; // Enzo: % de personas que eligieron igual ("efecto espejo")
    } catch {
      return 0;
    }
  }, [sesion]);

  // ── 3. Calcular resultado final ──
  async function handleFinish() {
    setCarg(true);
    try {
      const res = await fetch("/api/get-resultado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uuid: sesion?.uuid }),
      });
      const data = await res.json();
      if (data?.perfil) {
        setPerfil(data.perfil);
      } else {
        setPerfil(calcularPerfil(respuestas)); // fallback local
      }
    } catch {
      setPerfil(calcularPerfil(respuestas)); // fallback local
    } finally {
      setCarg(false);
      setVista("result");
    }
  }

  // ── 4. Nuevo chisme ──
  function handleNuevoChisme(chisme) {
    setChismesU(prev => [chisme, ...prev]);
    // Enzo: POST /api/submit-chisme
  }

  // ── 5. Reiniciar ──
  function handleReiniciar() {
    setSesion(getOrCreateSesion());
    setResp([]); setPerfil(null); setRegion(""); setEdad(""); setGenero("");
    setVista("home");
  }

  // ── 6. Stats ──
  async function irAStats() {
    setVista("stats");
    if (!statsData) {
      try {
        const res  = await fetch("/api/get-estadisticas");
        const data = await res.json();
        setStats(data);
      } catch {
        // usa datos quemados de StatsView
      }
    }
  }

  // ── Pantalla de carga global ──
  if (cargando) {
    return (
      <div style={{ minHeight:"100vh", background:"#0A0A0A", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16 }}>
        <div style={{ width:44, height:44, border:"3px solid #1a1a1a", borderTopColor:"#FF6B00", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
        <p style={{ fontFamily:"'Archivo Black',sans-serif", fontSize:13, color:"#FF6B00", letterSpacing:2, textTransform:"uppercase" }}>
          PROCESANDO TRÁMITE...
        </p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // ── Render ──
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
          preguntas={preguntas}
          chismes={chismesPool}
          onAnswer={handleAnswer}
          onFinish={handleFinish}
          sesionId={sesion?.uuid}
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
        <AdminView onClose={() => setVista("home")} />
      )}
    </>
  );
}