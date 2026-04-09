import { useState, useEffect } from "react";
import ChismeModal from "./ChismeModal";

const LOADING_PHRASES = [
  "Buscando en el padrón...",
  "Escaneando tu ADN criollo...",
  "Consultando el archivo secreto...",
  "Verificando antecedentes...",
];

export default function QuizView({ preguntas = [], onAnswer, onFinish, totalRespondidas = 0, chismes = [], onEnviarChisme }) {
  const [current, setCurrent]       = useState(0);
  const [seleccionado, setSelec]    = useState(null);
  const [animState, setAnim]        = useState("idle");
  const [showChisme, setShowChisme] = useState(false);
  const [chismeActual, setChisme]   = useState(null);
  const [cargando, setCargando]     = useState(false);
  const [phrase]                    = useState(() => LOADING_PHRASES[Math.floor(Math.random() * LOADING_PHRASES.length)]);

  const pregunta = preguntas[current];
  const totalAhora = totalRespondidas + current;
  const totalFinal = totalRespondidas + preguntas.length;
  const pct = totalFinal > 0 ? Math.round(((totalAhora) / totalFinal) * 100) : 0;

  useEffect(() => {
    setAnim("enter");
    const t = setTimeout(() => setAnim("idle"), 30);
    return () => clearTimeout(t);
  }, [current]);

  function elegir(opcion) {
    if (seleccionado) return;
    setSelec(opcion.id);
    onAnswer({ pregunta_id: pregunta.id, opcion_id: opcion.id, perfil_id: opcion.perfil_id });

    setTimeout(() => {
      setAnim("exit");
      setTimeout(() => {
        const next = current + 1;
        const respondidas = totalRespondidas + current + 1;

        if (respondidas % 5 === 0 && chismes.length > 0) {
          setChisme(chismes[Math.floor(Math.random() * chismes.length)]);
          setShowChisme(true);
        }

        if (next >= preguntas.length) {
          setCargando(true);
          setTimeout(() => onFinish(), 1400);
        } else {
          setCurrent(next);
          setSelec(null);
        }
      }, 350);
    }, 280);
  }

  if (cargando) return <Cargando phrase={phrase} />;
  if (!pregunta) return null;

  return (
    <div className="quiz-root">
      {/* Header sticky */}
      <header className="quiz-header">
        <span className="quiz-logo">Saca tu Ficha</span>
        <div className="quiz-prog-wrap">
          <div className="quiz-prog-bar">
            <div className="quiz-prog-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="quiz-pct">{pct}%</span>
        </div>
      </header>

      <main className="quiz-main">
        {/* Meta */}
        <div className="quiz-meta">
          <span className="quiz-num">PREGUNTA {totalRespondidas + current + 1}</span>
          <div className="quiz-marcas">
            {Array.from({ length: Math.min(preguntas.length, 10) }).map((_, i) => (
              <div key={i} className={`marca ${i < current ? "m-done" : i === current ? "m-active" : ""}`} />
            ))}
          </div>
        </div>

        {/* Tarjeta pregunta */}
        <div className={`quiz-card anim-${animState}`}>
          <div className="quiz-card-stripe" />
          <div className="quiz-card-num-badge">P</div>
          <p className="quiz-pregunta-txt">{pregunta.texto}</p>
        </div>

        {/* Opciones */}
        <div className={`quiz-opciones anim-${animState}`}>
          {pregunta.opciones?.map((op, i) => {
            const COLORES = ["#FF6B00","#FFFF00","#FF00AA","#00FF41"];
            const col = COLORES[i % COLORES.length];
            const isSelected = seleccionado === op.id;
            const isFaded = seleccionado && !isSelected;
            return (
              <button
                key={op.id}
                className={`opcion-btn ${isSelected ? "op-selected" : ""} ${isFaded ? "op-faded" : ""}`}
                style={isSelected ? { borderColor: col, background: col + "15" } : {}}
                onClick={() => elegir(op)}
              >
                <span
                  className="op-letra"
                  style={isSelected ? { background: col, borderColor: col, color: "#000" } : { color: col, borderColor: col + "55" }}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="op-texto">{op.texto}</span>
                {isSelected && <span className="op-check" style={{ color: col }}>✓</span>}
              </button>
            );
          })}
        </div>

        <p className="quiz-footer-note">Responde con sinceridad. El padrón sabe.</p>
      </main>

      {showChisme && chismeActual && (
        <ChismeModal
          chisme={chismeActual}
          onClose={() => setShowChisme(false)}
          onEnviarChisme={onEnviarChisme}
        />
      )}

      <QuizStyles />
    </div>
  );
}

function Cargando({ phrase }) {
  return (
    <div style={{ minHeight:"100vh", background:"#0A0A0A", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:20 }}>
      <div style={{ width:44, height:44, border:"3px solid #1a1a1a", borderTopColor:"#FF6B00", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <p style={{ fontFamily:"'Courier Prime',monospace", fontSize:13, color:"#888", letterSpacing:1 }}>{phrase}</p>
      <div style={{ display:"flex", gap:8 }}>
        {["#FF6B00","#FFFF00","#FF00AA"].map((c,i) => (
          <div key={i} style={{ width:8, height:8, borderRadius:"50%", background:c, animation:`bounce 1.2s ease-in-out ${i*0.2}s infinite` }} />
        ))}
      </div>
      <style>{`
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes bounce { 0%,60%,100% { transform:translateY(0); opacity:0.4; } 30% { transform:translateY(-10px); opacity:1; } }
      `}</style>
    </div>
  );
}

function QuizStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Public+Sans:wght@400;600;700&family=Special+Elite&family=Courier+Prime:wght@400;700&display=swap');

      .quiz-root {
        min-height: 100vh;
        background: #0A0A0A;
        color: #fff;
        font-family: 'Public Sans', sans-serif;
        max-width: 480px;
        margin: 0 auto;
      }

      /* Header */
      .quiz-header {
        position: sticky;
        top: 0;
        z-index: 10;
        background: #0f0f0f;
        border-bottom: 1px solid #1a1a1a;
        padding: 10px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }
      .quiz-logo {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 18px;
        letter-spacing: 2px;
        background: linear-gradient(90deg, #FF6B00, #FF00AA);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        white-space: nowrap;
      }
      .quiz-prog-wrap { display:flex; align-items:center; gap:8px; flex:1; }
      .quiz-prog-bar  {
        flex: 1;
        height: 5px;
        background: #1a1a1a;
        border-radius: 3px;
        overflow: hidden;
      }
      .quiz-prog-fill {
        height: 100%;
        background: linear-gradient(90deg, #FF6B00, #FFFF00);
        border-radius: 3px;
        transition: width 0.5s ease;
      }
      .quiz-pct {
        font-family: 'Courier Prime', monospace;
        font-size: 11px;
        color: #FFFF00;
        min-width: 30px;
        text-align: right;
      }

      /* Main */
      .quiz-main {
        padding: 20px 16px 40px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      /* Meta */
      .quiz-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .quiz-num {
        font-family: 'Courier Prime', monospace;
        font-size: 10px;
        font-weight: 700;
        color: #FF6B00;
        letter-spacing: 2px;
      }
      .quiz-marcas { display: flex; gap: 4px; }
      .marca {
        width: 18px;
        height: 3px;
        background: #222;
        border-radius: 2px;
        transition: background 0.3s, transform 0.3s;
      }
      .m-done   { background: #FF6B00; }
      .m-active { background: #FFFF00; transform: scaleY(1.6); }

      /* Tarjeta pregunta */
      .quiz-card {
        background: #111;
        border: 1px solid #2a2a2a;
        border-radius: 12px;
        padding: 24px 18px 20px;
        position: relative;
        overflow: hidden;
        min-height: 110px;
      }
      .quiz-card-stripe {
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 3px;
        background: linear-gradient(90deg, #FF6B00, #FFFF00, #FF00AA, #00FF41);
      }
      .quiz-card-num-badge {
        position: absolute;
        top: 0; left: 0;
        width: 28px; height: 28px;
        background: #FF6B00;
        color: #000;
        font-family: 'Bebas Neue', sans-serif;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 0 0 8px 0;
      }
      .quiz-pregunta-txt {
        font-family: 'Special Elite', system-ui;
        font-size: clamp(17px, 4.5vw, 21px);
        color: #fff;
        line-height: 1.45;
        margin-top: 4px;
      }

      /* Opciones */
      .quiz-opciones {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .opcion-btn {
        width: 100%;
        padding: 13px 14px;
        background: #111;
        border: 1px solid #2a2a2a;
        border-radius: 10px;
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        text-align: left;
        transition: border-color 0.15s, background 0.15s, transform 0.15s, opacity 0.25s;
        animation: opcion-in 0.3s ease both;
      }
      @keyframes opcion-in {
        from { opacity:0; transform: translateX(-10px); }
        to   { opacity:1; transform: translateX(0); }
      }
      .opcion-btn:nth-child(1) { animation-delay: 0ms; }
      .opcion-btn:nth-child(2) { animation-delay: 60ms; }
      .opcion-btn:nth-child(3) { animation-delay: 120ms; }
      .opcion-btn:nth-child(4) { animation-delay: 180ms; }

      .opcion-btn:hover:not(.op-selected):not(.op-faded) {
        border-color: #444;
        transform: translateX(3px);
      }
      .op-faded { opacity: 0.3; }

      .op-letra {
        min-width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 1.5px solid;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Bebas Neue', sans-serif;
        font-size: 14px;
        transition: background 0.2s, color 0.2s;
        flex-shrink: 0;
      }
      .op-texto {
        font-family: 'Public Sans', sans-serif;
        font-size: 14px;
        color: #ddd;
        line-height: 1.4;
        flex: 1;
      }
      .op-check {
        font-size: 16px;
        font-weight: 700;
        animation: pop 0.25s ease;
        flex-shrink: 0;
      }
      @keyframes pop {
        from { transform: scale(0); }
        to   { transform: scale(1); }
      }

      /* Animaciones de tarjeta */
      .anim-enter { opacity:0; transform:translateY(18px); }
      .anim-idle  { opacity:1; transform:translateY(0); transition: opacity 0.35s ease, transform 0.35s ease; }
      .anim-exit  { opacity:0; transform:translateY(-18px); transition: opacity 0.28s ease, transform 0.28s ease; }

      .quiz-footer-note {
        font-family: 'Courier Prime', monospace;
        font-size: 10px;
        color: #333;
        text-align: center;
        letter-spacing: 0.5px;
        margin-top: 4px;
      }
    `}</style>
  );
}