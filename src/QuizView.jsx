import { useState, useRef, useEffect } from "react";
import ChismeModal from "./ChismeModal";
// Nota: Si ya borraron "./data", pueden comentar esta línea y usar chismes pasados por props
import { CHISMES_INICIALES } from "./data"; 

export default function QuizView({ preguntas, onAnswer, onFinish, totalRespondidas = 0 }) {
  const [current, setCurrent]     = useState(0);
  const [elegido, setElegido]     = useState(null); // "izquierda" | "derecha"
  const [drag, setDrag]           = useState(0);    // px de desplazamiento
  const [isDragging, setIsDrag]   = useState(false);
  const [showChisme, setShowChisme] = useState(false);
  const [chismeData, setChisme]   = useState(null);
  const [animSalida, setAnimSal]  = useState(null); // "left" | "right"
  const [animEntrada, setAnimEnt] = useState(false);
  
  // 👉 NUEVO ESTADO: Para el Efecto Espejo (Validación)
  const [feedback, setFeedback]   = useState(null); 

  const cardRef   = useRef(null);
  const startX    = useRef(0);
  const UMBRAL    = 80; // px para confirmar swipe

  const pregunta = preguntas[current];
  const pct = Math.round(((current) / preguntas.length) * 100);

  // Entrada de nueva tarjeta
  useEffect(() => {
    setAnimEnt(true);
    const t = setTimeout(() => setAnimEnt(false), 400);
    return () => clearTimeout(t);
  }, [current]);

  // ── Lógica de swipe ──────────────────────────────────────────
  function onPointerDown(e) {
    if (feedback) return; // Si hay feedback en pantalla, bloqueamos el drag
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

  function confirmarElecion(lado) {
    if (elegido) return;
    setElegido(lado);
    setAnimSal(lado === "izquierda" ? "left" : "right");
    setDrag(0);

    const opcion = lado === "izquierda" ? pregunta.izquierda : pregunta.derecha;
    onAnswer({ pregunta_id: pregunta.id, lado, perfil_id: opcion.perfil });

    // ── LÓGICA DE VALIDACIÓN SOCIAL REAL (Efecto Espejo) ──
    // Asumimos que en el futuro la BD enviará "opcion.porcentaje".
    let mensajeFeedback = "";
    if (opcion.porcentaje && opcion.porcentaje > 0) {
      if (opcion.porcentaje > 50) {
        mensajeFeedback = `🔥 El ${opcion.porcentaje}% piensa igual que tú`;
      } else {
        mensajeFeedback = `💀 Uy, solo el ${opcion.porcentaje}% eligió esto`;
      }
    } else {
      mensajeFeedback = "🚀 ¡Eres el primero en responder esto!";
    }
    
    // Mostramos el mensaje en pantalla
    setFeedback(mensajeFeedback);

    // Esperamos 1.5 segundos para que el usuario lea su validación antes de pasar a la siguiente
    setTimeout(() => {
      const next = current + 1;

      // ── LÓGICA TIKTOK: Chisme Aleatorio (Lootbox) ──
      // Probabilidad del 20% de que salga un chisme, pero nunca en la primera pregunta
      const probabilidadChisme = Math.random() > 0.80; 
      
      if (next > 1 && probabilidadChisme && next < preguntas.length) {
        // En el futuro puedes reemplazar CHISMES_INICIALES por los chismes que vengan de tu BD
        const pool = CHISMES_INICIALES || [{ texto: "Alguien se robó el microondas de la ofi..." }];
        setChisme(pool[Math.floor(Math.random() * pool.length)]);
        setShowChisme(true);
      }

      setAnimSal(null);
      setElegido(null);
      setFeedback(null); // Ocultamos el mensaje

      if (next >= preguntas.length) {
        onFinish();
      } else {
        setCurrent(next);
      }
    }, 1500); // 1.5 segundos de pausa dramática
  }

  if (!pregunta) return null;

  const rotacion = drag / 12;
  const opacIzq  = drag < 0 ? Math.min(1, Math.abs(drag) / UMBRAL) : 0;
  const opacDer  = drag > 0 ? Math.min(1, drag / UMBRAL) : 0;

  return (
    <div className="qv-root">
      {/* Header */}
      <header className="qv-header">
        <span className="qv-logo">Saca tu Ficha</span>
        <div className="qv-prog-wrap">
          <div className="qv-prog-bar">
            <div className="qv-prog-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="qv-pct">{current}/{preguntas.length}</span>
        </div>
      </header>

      <main className="qv-main">
        {/* Indicadores laterales */}
        <div className="qv-indicators" style={{ opacity: feedback ? 0 : 1, transition: 'opacity 0.2s' }}>
          <div className="qv-ind-izq" style={{ opacity: opacIzq }}>
            <span className="qv-ind-emoji">👈</span>
            <span className="qv-ind-txt">{pregunta.izquierda?.texto}</span>
          </div>
          <div className="qv-ind-der" style={{ opacity: opacDer }}>
            <span className="qv-ind-txt">{pregunta.derecha?.texto}</span>
            <span className="qv-ind-emoji">👉</span>
          </div>
        </div>

        {/* Stack de tarjetas */}
        <div className="qv-stack">
          {/* Tarjeta fantasma de atrás */}
          <div className="qv-card-bg" />

          {/* MENSAJE DE VALIDACIÓN (Aparece tras el swipe) */}
          {feedback && (
            <div className="qv-feedback-overlay">
              <span className="qv-feedback-txt">{feedback}</span>
            </div>
          )}

          {/* Tarjeta principal */}
          <div
            ref={cardRef}
            className={`qv-card ${animEntrada ? "qv-card-enter" : ""} ${animSalida === "left" ? "qv-card-exit-left" : ""} ${animSalida === "right" ? "qv-card-exit-right" : ""}`}
            style={{
              transform: !animSalida ? `translateX(${drag}px) rotate(${rotacion}deg)` : undefined,
              transition: isDragging ? "none" : undefined,
              cursor: isDragging ? "grabbing" : "grab",
              pointerEvents: feedback ? "none" : "auto" // Desactiva clics mientras lee el feedback
            }}
            onMouseDown={onPointerDown}
            onMouseMove={onPointerMove}
            onMouseUp={onPointerUp}
            onMouseLeave={onPointerUp}
            onTouchStart={onPointerDown}
            onTouchMove={onPointerMove}
            onTouchEnd={onPointerUp}
          >
            <div className="qv-card-stripe" />
            <div className="qv-num-badge">
              <span className="qv-num-txt">{current + 1}</span>
              <span className="qv-num-of">/{preguntas.length}</span>
            </div>

            {drag < -30 && <div className="qv-sello-izq" style={{ opacity: opacIzq }}><span>◀</span></div>}
            {drag > 30 && <div className="qv-sello-der" style={{ opacity: opacDer }}><span>▶</span></div>}

            <div className="qv-pregunta-wrap">
              <p className="qv-pregunta">{pregunta.texto}</p>
            </div>
            <p className="qv-hint">← desliza para elegir →</p>
          </div>
        </div>

        {/* Botones de opción */}
        <div className="qv-botones" style={{ opacity: feedback ? 0.3 : 1, transition: 'opacity 0.2s' }}>
          <button
            className="qv-btn qv-btn-izq"
            onClick={() => confirmarElecion("izquierda")}
            disabled={!!elegido || !!feedback}
          >
            <span className="qv-btn-arrow">👈</span>
            <span className="qv-btn-txt">{pregunta.izquierda?.texto}</span>
          </button>
          <button
            className="qv-btn qv-btn-der"
            onClick={() => confirmarElecion("derecha")}
            disabled={!!elegido || !!feedback}
          >
            <span className="qv-btn-txt">{pregunta.derecha?.texto}</span>
            <span className="qv-btn-arrow">👉</span>
          </button>
        </div>

        {/* Puntos de progreso */}
        <div className="qv-dots">
          {preguntas.map((_, i) => (
            <div key={i} className={`qv-dot ${i < current ? "qv-dot-done" : i === current ? "qv-dot-active" : ""}`} />
          ))}
        </div>
      </main>

      {showChisme && chismeData && (
        <ChismeModal
          chisme={chismeData}
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

      .qv-root { min-height: 100vh; background: #0A0A0A; color: #fff; font-family: 'Public Sans', sans-serif; max-width: 480px; margin: 0 auto; display: flex; flex-direction: column; user-select: none; }
      
      .qv-header { position: sticky; top: 0; z-index: 10; background: #0f0f0f; border-bottom: 1px solid #1a1a1a; padding: 10px 16px; display: flex; align-items: center; justify-content: space-between; gap: 14px; }
      .qv-logo { font-family: 'Bebas Neue', sans-serif; font-size: 17px; letter-spacing: 2px; background: linear-gradient(90deg, #FF6B00, #FF00AA); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; white-space: nowrap; }
      .qv-prog-wrap { display: flex; align-items: center; gap: 8px; flex: 1; }
      .qv-prog-bar  { flex: 1; height: 4px; background: #1a1a1a; border-radius: 2px; overflow: hidden; }
      .qv-prog-fill { height: 100%; background: linear-gradient(90deg, #FF6B00, #FFFF00); border-radius: 2px; transition: width 0.4s ease; }
      .qv-pct       { font-family: 'Courier Prime', monospace; font-size: 11px; color: #FFFF00; min-width: 36px; text-align: right; }

      .qv-main { flex: 1; padding: 16px 16px 24px; display: flex; flex-direction: column; align-items: center; gap: 16px; }
      .qv-indicators { width: 100%; display: flex; justify-content: space-between; align-items: center; gap: 8px; min-height: 36px; }
      .qv-ind-izq, .qv-ind-der { display: flex; align-items: center; gap: 6px; max-width: 44%; transition: opacity 0.1s; }
      .qv-ind-izq { flex-direction: row; } .qv-ind-der { flex-direction: row-reverse; }
      .qv-ind-emoji { font-size: 18px; }
      .qv-ind-txt { font-family: 'Special Elite', system-ui; font-size: 11px; line-height: 1.3; color: #fff; text-align: center; }
      .qv-ind-izq .qv-ind-txt { color: #FF00AA; } .qv-ind-der .qv-ind-txt { color: #00FF41; }

      .qv-stack { width: 100%; position: relative; height: clamp(220px, 50vw, 280px); display: flex; align-items: center; justify-content: center; }
      .qv-card-bg { position: absolute; inset: 8px; border-radius: 16px; background: #151515; border: 1px solid #222; transform: scale(0.95); }
      
      /* 👉 ESTILOS DEL FEEDBACK (EFECTO ESPEJO) */
      .qv-feedback-overlay {
        position: absolute;
        inset: 0;
        z-index: 5;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(10, 10, 10, 0.85);
        border-radius: 16px;
        animation: fade-in-out 1.5s ease forwards;
        padding: 20px;
      }
      .qv-feedback-txt {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 32px;
        color: #FFFF00;
        text-align: center;
        line-height: 1.1;
        letter-spacing: 1px;
        text-shadow: 0px 4px 15px rgba(255, 107, 0, 0.6);
        animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      }
      @keyframes fade-in-out {
        0% { opacity: 0; }
        15% { opacity: 1; }
        85% { opacity: 1; }
        100% { opacity: 0; }
      }
      @keyframes pop-in {
        0% { transform: scale(0.5); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }

      .qv-card { position: absolute; inset: 0; background: #111; border: 1px solid #2a2a2a; border-radius: 16px; padding: 20px 18px 16px; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; will-change: transform; touch-action: pan-y; }
      .qv-card-enter { animation: card-in 0.35s cubic-bezier(0.175,0.885,0.32,1.275); }
      @keyframes card-in { from { opacity: 0; transform: scale(0.85) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      .qv-card-exit-left  { animation: exit-left  0.45s ease forwards; } .qv-card-exit-right { animation: exit-right 0.45s ease forwards; }
      @keyframes exit-left  { to { transform: translateX(-120%) rotate(-20deg); opacity: 0; } } @keyframes exit-right { to { transform: translateX(120%)  rotate(20deg);  opacity: 0; } }
      .qv-card-stripe { position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #FF6B00, #FFFF00, #FF00AA, #00FF41); }
      
      .qv-num-badge { position: absolute; top: 10px; right: 12px; display: flex; align-items: baseline; gap: 2px; }
      .qv-num-txt { font-family: 'Bebas Neue', sans-serif; font-size: 28px; color: #FF6B00; line-height: 1; } .qv-num-of  { font-family: 'Courier Prime', monospace; font-size: 10px; color: #444; }
      
      .qv-sello-izq, .qv-sello-der { position: absolute; top: 16px; font-family: 'Bebas Neue', sans-serif; font-size: 40px; pointer-events: none; transition: opacity 0.1s; }
      .qv-sello-izq { left: 14px; color: #FF00AA; transform: rotate(-15deg); } .qv-sello-der { right: 14px; color: #00FF41; transform: rotate(15deg); }

      .qv-pregunta-wrap { flex: 1; display: flex; align-items: center; justify-content: center; padding: 16px 8px 0; }
      .qv-pregunta { font-family: 'Special Elite', system-ui; font-size: clamp(16px, 4.5vw, 20px); color: #fff; text-align: center; line-height: 1.45; }
      .qv-hint { font-family: 'Courier Prime', monospace; font-size: 9px; color: #333; text-align: center; margin-top: 8px; letter-spacing: 1px; }

      .qv-botones { width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      .qv-btn { padding: 12px 10px; border-radius: 10px; border: 1.5px solid; display: flex; align-items: center; gap: 6px; font-family: 'Public Sans', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: transform 0.1s, opacity 0.2s; min-height: 60px; }
      .qv-btn:active:not(:disabled) { transform: scale(0.96); } .qv-btn:disabled { cursor: not-allowed; }
      .qv-btn-izq { background: rgba(255,0,170,0.08); border-color: #FF00AA; color: #fff; flex-direction: row; text-align: left; } .qv-btn-izq:hover:not(:disabled) { background: rgba(255,0,170,0.15); }
      .qv-btn-der { background: rgba(0,255,65,0.08); border-color: #00FF41; color: #fff; flex-direction: row-reverse; text-align: right; } .qv-btn-der:hover:not(:disabled) { background: rgba(0,255,65,0.15); }
      .qv-btn-arrow { font-size: 18px; flex-shrink: 0; } .qv-btn-txt { font-size: 12px; line-height: 1.35; flex: 1; }

      .qv-dots { display: flex; gap: 4px; flex-wrap: wrap; justify-content: center; max-width: 280px; }
      .qv-dot { width: 8px; height: 8px; border-radius: 50%; background: #222; transition: background 0.3s, transform 0.3s; }
      .qv-dot-done { background: #FF6B00; } .qv-dot-active { background: #FFFF00; transform: scale(1.4); }
    `}</style>
  );
}