import { useState, useEffect, useCallback } from "react";
import HomeView             from "./HomeView";
import QuizView             from "./QuizView";
import ResultView           from "./ResultView";
import ChismeModal, { ChismesCanal } from "./ChismeModal";

// Helper para tiempos de carga
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ── Sesión anónima ──────────────────────────────────────────────────────────
function generarUUID() {
  return crypto.randomUUID();
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

// ── App Principal ──────────────────────────────────────────────────────────
export default function App() {
  const [vista,      setVista]   = useState("home");  // home | quiz | result | canal
  const [region,     setRegion]  = useState("");
  const [sesion,     setSesion]  = useState(null);
  const [preguntas,  setPreg]    = useState([]);      // Guardará las preguntas
  const [perfilId,   setPerfil]  = useState(null);
  const [chismesU,   setChismesU]= useState([]);      // chismes de usuarios
  const [cargando,   setCarg]    = useState(false);

  useEffect(() => { setSesion(getOrCreateSesion()); }, []);

  // ── 1. INICIAR TRÁMITE Y TRAER PREGUNTAS ──
  async function handleStart(reg) {
    setRegion(reg);
    setCarg(true);
    
    try {
      // Registrar en Neon
      await fetch("/api/init-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uuid: sesion.uuid, codigo_tramite: sesion.codigo, region: reg })
      });

      // Traer preguntas
      const resPreg = await fetch(`/api/get-preguntas?uuid=${sesion.uuid}`);
      let dataPreg = await resPreg.json();

      // PARACAÍDAS Y TRADUCCIÓN A FORMATO TINDER (Izquierda / Derecha)
      if (!dataPreg || dataPreg.length === 0 || dataPreg.finished) {
        // Datos de prueba si la base de datos está vacía
        dataPreg = [{
          id: 999,
          texto: "Pregunta de prueba: ¿El de atrás se cuela en el banco, qué haces?",
          izquierda: { id: 101, texto: "Le armo chongo 🗣️", perfil: "radical" },
          derecha: { id: 102, texto: "Me hago el loco 🦊", perfil: "vivillo" }
        }];
      } else {
        // Convertimos el array "opciones" que manda Neon a "izquierda" y "derecha"
        dataPreg = dataPreg.map(p => ({
          id: p.id,
          texto: p.texto_pregunta,
          izquierda: p.opciones && p.opciones.length > 0 ? p.opciones[0] : { id: 1, texto: "Opción A", perfil: "tranquilo" },
          derecha: p.opciones && p.opciones.length > 1 ? p.opciones[1] : { id: 2, texto: "Opción B", perfil: "radical" }
        }));
      }

      setPreg(dataPreg);
      setVista("quiz");
    } catch (error) {
      console.error("Error al iniciar:", error);
      alert("Hubo un error al conectar con el padrón.");
    } finally {
      setCarg(false);
    }
  }

  // ── 2. GUARDAR RESPUESTA DEL SWIPE ──
  const handleAnswer = useCallback(async ({ pregunta_id, lado, perfil_id }) => {
    // Obtenemos el ID de la opción basándonos en si hizo swipe a izquierda o derecha
    const preguntaActual = preguntas.find(p => p.id === pregunta_id);
    const opcionId = lado === "izquierda" ? preguntaActual.izquierda.id : preguntaActual.derecha.id;

    try {
      await fetch("/api/save-respuesta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uuid: sesion.uuid, pregunta_id, opcion_id: opcionId })
      });
    } catch (error) {
      console.error("Error guardando respuesta:", error);
    }
  }, [sesion, preguntas]);

  // ── 3. FINALIZAR Y CALCULAR FICHA ──
  async function handleFinish() {
    setCarg(true);
    try {
      const res = await fetch("/api/get-resultado", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uuid: sesion.uuid }) 
      });
      const data = await res.json();
      
      if (data.success) {
        setPerfil({
          nombre: data.perfil,
          frase: data.frase,
          codigo: sesion.codigo
        });
        setVista("result");
      } else {
        // Si no hay suficientes respuestas en BD para calcular
        setPerfil({ nombre: "EL TRANQUILO", frase: "Faltan datos, pero fluyes bien.", codigo: sesion.codigo });
        setVista("result");
      }
    } catch (e) {
      console.error("Error finalizando:", e);
    } finally {
      setCarg(false);
    }
  }

  // ── 4. ENVIAR CHISME NUEVO ──
  async function handleNuevoChisme(chisme) {
    setChismesU(prev => [chisme, ...prev]);
    try {
      await fetch("/api/save-chisme", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uuid: sesion.uuid, texto_chisme: chisme }) 
      });
    } catch (error) {
      console.error("Error al guardar chisme:", error);
    }
  }

  function handleReiniciar() {
    setPreg([]);
    setPerfil(null);
    setRegion("");
    setVista("home");
  }

  // ── PANTALLA DE CARGA GLOBAL ──
  if (cargando) return (
    <div style={{ minHeight:"100vh", background:"#0A0A0A", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16 }}>
      <div style={{ width:40, height:40, border:"3px solid #1a1a1a", borderTopColor:"#FF6B00", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <p style={{ fontFamily:"monospace", fontSize:13, color:"#FF6B00", letterSpacing:1 }}>PROCESANDO EXPEDIENTE...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // ── RENDER DE VISTAS ──
  if (vista === "home") {
    return <HomeView onStart={handleStart} onVerChismes={() => setVista("canal")} />;
  }

  if (vista === "quiz") {
    return <QuizView preguntas={preguntas} onAnswer={handleAnswer} onFinish={handleFinish} totalRespondidas={0} />;
  }

  if (vista === "result") {
    return <ResultView perfil={perfilId} region={region} onReiniciar={handleReiniciar} onVerCanal={() => setVista("canal")} />;
  }

  if (vista === "canal") {
    return <ChismesCanal chismesExtra={chismesU} onNuevoChisme={handleNuevoChisme} onClose={() => setVista(perfilId ? "result" : "home")} />;
  }

  return null;
}