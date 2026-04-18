import { useState, useRef, useEffect } from "react";
import ChismeModal from "./ChismeModal";

export default function QuizView({ preguntas, chismes, onAnswer, onFinish, sesionId }) {
  const [current, setCurrent]     = useState(0);
  const [elegido, setElegido]     = useState(null); 
  const [drag, setDrag]           = useState(0);    
  const [isDragging, setIsDrag]   = useState(false);
  const [showChisme, setShowChisme] = useState(false);
  const [chismeData, setChisme]   = useState(null);
  const [animSalida, setAnimSal]  = useState(null); 
  const [animEntrada, setAnimEnt] = useState(false);
  const [feedback, setFeedback]   = useState(null); 

  const cardRef   = useRef(null);
  const startX    = useRef(0);
  const UMBRAL    = 80; 

  const pregunta = preguntas[current];

  useEffect(() => {
    setAnimEnt(true);
    const t = setTimeout(() => setAnimEnt(false), 400);
    return () => clearTimeout(t);
  }, [current]);

  function onPointerDown(e) {
    if (feedback || elegido) return; 
    setIsDrag(true);
    startX.current = e.touches ? e.touches[0].clientX : e.clientX;
  }
  
  function onPointerMove(e) {
    if (!isDragging) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    setDrag(x - startX.current);
  }
  
  function onPointerUp() {
    if (!isDragging) return;
    setIsDrag(false);
    if (drag < -UMBRAL) confirmarElecion("izquierda");
    else if (drag > UMBRAL) confirmarElecion("derecha");
    else setDrag(0);
  }

  // ── LÓGICA DE ELECCIÓN SIN BLOQUEO (UX FLUIDA) ──
  async function confirmarElecion(lado) {
    if (elegido) return;
    
    // 1. REACCIÓN INMEDIATA: Sacamos la tarjeta ya mismo
    setElegido(lado);
    setAnimSal(lado === "izquierda" ? "left" : "right");
    setDrag(0);

    const opcion = lado === "izquierda" ? pregunta.izquierda : pregunta.derecha;

    try {
      // 2. DISPARAMOS LA PETICIÓN (pero no dejamos que el await congele la pantalla)
      const porcentajeReal = await onAnswer({ 
        pregunta_id: pregunta.id, 
        opcion_id: opcion?.opcion_id,
        perfil_id: opcion?.perfil,
      });

      // 3. LANZAMOS EL FEEDBACK (ahora que tenemos la data)
      let mensajeFeedback = "";
      if (porcentajeReal === 100) {
        mensajeFeedback = "🚀 ¡Eres el primero!";
      } else if (porcentajeReal >= 50) {
        mensajeFeedback = `🔥 El ${porcentajeReal}% coincide`;
      } else {
        mensajeFeedback = `💀 Solo el ${porcentajeReal}% eligió esto`;
      }
      
      setFeedback(mensajeFeedback);

      // 4. TIEMPO DE LECTURA (500ms)
      setTimeout(() => {
        const next = current + 1;
        const probabilidadChisme = Math.random() > 0.80; 
        
        if (probabilidadChisme && chismes?.length > 0 && next < preguntas.length) {
          const randomIndex = Math.floor(Math.random() * chismes.length);
          setChisme(chismes[randomIndex]);
          setShowChisme(true);
        }

        setAnimSal(null);
        setElegido(null);
        setFeedback(null); 

        if (next >= preguntas.length) {
          onFinish();
        } else {
          setCurrent(next);
        }
      }, 500); // ⏱️ Ahora sí se llega a leer el porcentaje

    } catch (err) {
      console.error("Fallo en red:", err);
      // Fallback para no trabar el quiz si la red falla
      setCurrent(prev => prev + 1);
      setElegido(null);
    }
  }

  if (!pregunta) return null;

  const opacIzq = drag < 0 ? Math.min(1, Math.abs(drag) / UMBRAL) : 0;
  const opacDer = drag > 0 ? Math.min(1, drag / UMBRAL) : 0;

  return (
    <div className="qv-root">
      <header className="qv-header">
        <span className="qv-logo">Saca tu Ficha</span>
        <button className="qv-btn-finalizar" onClick={onFinish}>
          📊 VER MI FICHA
        </button>
      </header>

      <main className="qv-main">
        <div className="qv-indicators" style={{ opacity: feedback ? 0 : 1 }}>
          <div className="qv-ind-izq" style={{ opacity: opacIzq }}>
            <span className="qv-ind-txt">{pregunta.izquierda?.texto}</span>
          </div>
          <div className="qv-ind-der" style={{ opacity: opacDer }}>
            <span className="qv-ind-txt">{pregunta.derecha?.texto}</span>
          </div>
        </div>

        <div className="qv-stack">
          <div className="qv-card-bg" />

          {/* Efecto Espejo / Feedback */}
          {feedback && (
            <div className="qv-feedback-overlay">
              <span className="qv-feedback-txt">{feedback}</span>
            </div>
          )}

          <div
            ref={cardRef}
            className={`qv-card ${animEntrada ? "qv-card-enter" : ""} ${animSalida ? "qv-card-exit-" + animSalida : ""}`}
            style={{
              transform: !animSalida ? `translateX(${drag}px) rotate(${drag/12}deg)` : undefined,
              pointerEvents: (feedback || elegido) ? "none" : "auto"
            }}
            onMouseDown={onPointerDown}
            onMouseMove={onPointerMove}
            onMouseUp={onPointerUp}
            onTouchStart={onPointerDown}
            onTouchMove={onPointerMove}
            onTouchEnd={onPointerUp}
          >
            <div className="qv-card-stripe" />
            <div className="qv-pregunta-wrap">
              <p className="qv-pregunta">{pregunta.texto}</p>
            </div>
            <p className="qv-hint">← desliza para elegir →</p>
          </div>
        </div>

        <div className="qv-botones" style={{ opacity: (feedback || elegido) ? 0.3 : 1 }}>
          <button className="qv-btn-izq" onClick={() => confirmarElecion("izquierda")} disabled={!!elegido}>
             {pregunta.izquierda?.texto}
          </button>
          <button className="qv-btn-der" onClick={() => confirmarElecion("derecha")} disabled={!!elegido}>
             {pregunta.derecha?.texto}
          </button>
        </div>
      </main>

      {/* Los 4 emojis están configurados en el ChismeModal (risa, enojo, fuego, sorpresa) */}
      {showChisme && chismeData && (
        <ChismeModal
          chisme={chismeData}
          sesionId={sesionId} 
          soloVer={true}
          onClose={() => setShowChisme(false)}
        />
      )}

      <QvStyles />
    </div>
  );
}

function QvStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Public+Sans:wght@400;600;700&family=Special+Elite&family=Courier+Prime:wght@400;700&display=swap');

      .qv-root { min-height: 100vh; background: #0A0A0A; color: #fff; font-family: 'Public Sans', sans-serif; max-width: 480px; margin: 0 auto; display: flex; flex-direction: column; user-select: none; overflow: hidden; }
      
      .qv-header { position: sticky; top: 0; z-index: 10; background: #0f0f0f; border-bottom: 1px solid #1a1a1a; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; }
      .qv-logo { font-family: 'Bebas Neue', sans-serif; font-size: 18px; letter-spacing: 2px; color: #FF6B00; }

      .qv-main { flex: 1; padding: 16px; display: flex; flex-direction: column; align-items: center; gap: 20px; justify-content: center; }
      .qv-indicators { width: 100%; display: flex; justify-content: space-between; min-height: 40px; padding: 0 10px; }
      .qv-ind-txt { font-family: 'Special Elite', cursive; font-size: 12px; max-width: 120px; text-align: center; line-height: 1.2; }
      .qv-ind-izq .qv-ind-txt { color: #FF00AA; } .qv-ind-der .qv-ind-txt { color: #00FF41; }

      .qv-stack { width: 100%; position: relative; height: 320px; display: flex; align-items: center; justify-content: center; }
      .qv-card-bg { position: absolute; inset: 10px; border-radius: 16px; background: #151515; transform: scale(0.95); border: 1px solid #222; }
      
      .qv-feedback-overlay { position: absolute; inset: 0; z-index: 10; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.85); border-radius: 16px; animation: fade-in 0.2s ease; }
      .qv-feedback-txt { font-family: 'Bebas Neue', sans-serif; font-size: 28px; color: #FFFF00; text-align: center; padding: 20px; letter-spacing: 1px; line-height: 1.1; }
      @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }

      .qv-btn-finalizar { background: transparent; border: 1.5px solid #FF6B00; color: #FF6B00; padding: 6px 14px; border-radius: 20px; font-family: 'Bebas Neue', sans-serif; font-size: 14px; cursor: pointer; transition: 0.2s; }
      .qv-btn-finalizar:hover { background: #FF6B00; color: #000; }

      .qv-card { position: absolute; inset: 0; background: #111; border: 1px solid #2a2a2a; border-radius: 16px; padding: 30px 20px; display: flex; flex-direction: column; justify-content: center; align-items: center; touch-action: none; box-shadow: 0 10px 30px rgba(0,0,0,0.5); z-index: 2; }
      .qv-card-enter { animation: card-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
      @keyframes card-in { from { opacity: 0; transform: translateY(30px) scale(0.9); } to { opacity: 1; transform: translateY(0) scale(1); } }
      .qv-card-exit-left { animation: exit-left 0.4s forwards; }
      .qv-card-exit-right { animation: exit-right 0.4s forwards; }
      @keyframes exit-left { to { transform: translateX(-150%) rotate(-20deg); opacity: 0; } }
      @keyframes exit-right { to { transform: translateX(150%) rotate(20deg); opacity: 0; } }

      .qv-card-stripe { position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #FF6B00, #FF00AA); }
      .qv-pregunta { font-family: 'Special Elite', cursive; font-size: 19px; color: #fff; text-align: center; line-height: 1.5; }
      .qv-hint { font-family: 'Courier Prime', monospace; font-size: 10px; color: #444; margin-top: 20px; text-transform: uppercase; letter-spacing: 1px; }

      .qv-botones { width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      .qv-btn-izq, .qv-btn-der { padding: 15px; border-radius: 12px; border: 1px solid; background: #111; color: #fff; font-family: 'Public Sans', sans-serif; font-size: 12px; font-weight: bold; cursor: pointer; min-height: 70px; transition: 0.1s; }
      .qv-btn-izq { border-color: #FF00AA; }
      .qv-btn-der { border-color: #00FF41; }
    `}</style>
  );
}