import { useState } from "react";

const REGIONES = [
  "Amazonas","Arequipa","Cajamarca","Lima","Trujillo",
  
];

const EDADES = [
  { id: "18-30", label: "18 – 30", emoji: "⚡" },
  { id: "31+",   label: "31 a más", emoji: "👊" },
];

const GENEROS = [
  { id: "hombre",  label: "Hombre",            emoji: "♂️", color: "#FF6B00" },
  { id: "mujer",   label: "Mujer",              emoji: "♀️", color: "#FF00AA" },
  { id: "nd",      label: "Prefiero no decirlo",emoji: "✦",  color: "#FFFF00" },
];

export default function HomeView({ onStart, onVerChismes, onVerStats, onVerTerms, onVerAdmin }) {
  const [region, setRegion] = useState("");
  const [edad,   setEdad]   = useState("");
  const [genero, setGenero] = useState("");

  const listo = region && edad && genero;

  return (
    <div className="hv-root">
      {/* Gradiente de fondo sutil */}
      <div className="hv-bg-glow" />

      {/* Header */}
      <header className="hv-header">
        <span className="hv-header-left">RNIF · 2026</span>
        <div className="hv-header-btns">
          <button className="hv-chismes-btn" onClick={onVerStats}>📊 PADRÓN</button>
          <button className="hv-chismes-btn" onClick={onVerChismes}>🗞️ CHISMES</button>
        </div>
      </header>

      <main className="hv-main">
        {/* Badge */}
        <div className="hv-pill">
          <span className="hv-dot" style={{background:"#FF00AA"}} />
          <span className="hv-pill-txt">EXPERIMENTO SOCIAL · PERÚ</span>
          <span className="hv-dot" style={{background:"#00FF41"}} />
        </div>

        {/* Título */}
        <div className="hv-titulo">
          <p className="hv-pre">SACA TU</p>
          <h1 className="hv-ficha">FICHA</h1>
          <div className="hv-sello-circle">
            <span className="hv-sello-txt">OFICIAL</span>
          </div>
        </div>

        {/* Instrucción estilo TikTok */}
        <div className="hv-instruccion">
          <div className="hv-swipe-demo">
            <div className="hv-swipe-left">
              <span>👈</span>
              <span className="hv-swipe-lbl">IZQUIERDA</span>
            </div>
            <div className="hv-swipe-card-mini">
              <span style={{fontSize:22}}>🇵🇪</span>
            </div>
            <div className="hv-swipe-right">
              <span className="hv-swipe-lbl">DERECHA</span>
              <span>👉</span>
            </div>
          </div>
          <p className="hv-swipe-desc">Desliza o toca para elegir · 20 preguntas · 3 segundos cada una</p>
        </div>

        {/* Card */}
        <div className="hv-card">
          <div className="hv-card-stripe" />
          {/* Departamento */}
          <label className="hv-label">📍 TU DEPARTAMENTO</label>
          <div className="hv-sel-wrap">
            <select
              className="hv-select"
              value={region}
              onChange={e => setRegion(e.target.value)}
            >
              <option value="">— Elige tu tierra —</option>
              {REGIONES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <span className="hv-sel-arrow">▾</span>
          </div>

          {/* Edad */}
          <label className="hv-label">⚡ TU RANGO DE EDAD</label>
          <div className="hv-toggle-group" style={{marginBottom:16}}>
            {EDADES.map(e => (
              <button
                key={e.id}
                className={`hv-toggle ${edad === e.id ? "hv-toggle-edad-on" : ""}`}
                onClick={() => setEdad(e.id)}
                style={edad === e.id ? {
                  background: "rgba(255,255,0,0.15)",
                  borderColor: "#FFFF00",
                  color: "#FFFF00",
                } : {}}
              >
                <span className="hv-toggle-emoji">{e.emoji}</span>
                <span className="hv-toggle-lbl">{e.label}</span>
              </button>
            ))}
          </div>

          {/* Género */}
          <label className="hv-label">✦ TU GÉNERO</label>
          <div className="hv-toggle-group" style={{marginBottom:20}}>
            {GENEROS.map(g => (
              <button
                key={g.id}
                className={`hv-toggle ${genero === g.id ? "hv-toggle-genero-on" : ""}`}
                onClick={() => setGenero(g.id)}
                style={genero === g.id ? {
                  background: `${g.color}22`,
                  borderColor: g.color,
                  color: g.color,
                } : {}}
              >
                <span className="hv-toggle-emoji">{g.emoji}</span>
                <span className="hv-toggle-lbl">{g.label}</span>
              </button>
            ))}
          </div>

          <button
            className={`hv-btn ${!listo ? "hv-btn-off" : ""}`}
            disabled={!listo}
            onClick={() => listo && onStart({ region, edad, genero })}
          >
            TRAMITAR MI FICHA →
          </button>
          <p className="hv-disclaimer">Anónimo · Satírico · Sin datos personales</p>
        </div>

        {/* Stats */}
        <div className="hv-stats">
          {[["127K+","fichas"],["20","preguntas"],["8","perfiles"]].map(([n,l]) => (
            <div key={l} className="hv-stat">
              <span className="hv-stat-n">{n}</span>
              <span className="hv-stat-l">{l}</span>
            </div>
          ))}
        </div>
      </main>

      <footer className="hv-footer">
        <p>© 2026 Saca tu Ficha — Sátira electoral peruana</p>
        <div className="hv-footer-links">
          <button className="hv-footer-link" onClick={onVerTerms}>Términos y Condiciones</button>
          <span className="hv-footer-sep">·</span>
          <button className="hv-footer-link" onClick={onVerAdmin}>Admin</button>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Black+Han+Sans&family=Public+Sans:wght@400;700&family=Courier+Prime:wght@400;700&display=swap');

        /* ── Variables de fuente chicha ── */
        :root {
          --f-titulo:  'Black Han Sans', sans-serif;
          --f-bloque:  'Archivo Black', sans-serif;
          --f-cuerpo:  'Public Sans', sans-serif;
          --f-codigo:  'Courier Prime', monospace;
        }

        .hv-root {
          min-height: 100vh; background: #0A0A0A; color: #fff;
          font-family: var(--f-cuerpo);
          max-width: 480px; margin: 0 auto;
          position: relative; overflow-x: hidden;
        }
        .hv-bg-glow {
          position: fixed; top: -100px; left: 50%; transform: translateX(-50%);
          width: 300px; height: 300px; border-radius: 50%;
          background: radial-gradient(circle, rgba(255,107,0,0.14) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }

        /* ── Header ── */
        .hv-header {
          position: relative; z-index: 1;
          display: flex; justify-content: space-between; align-items: center;
          padding: 12px 16px; border-bottom: 1px solid #1a1a1a;
        }
        .hv-header-left {
          font-family: var(--f-codigo); font-size: 9px;
          color: #444; letter-spacing: 2px;
        }
        .hv-header-btns { display: flex; gap: 6px; align-items: center; }
        .hv-chismes-btn {
          background: #1a1a1a; border: 1px solid #333; border-radius: 20px;
          padding: 5px 11px; font-family: var(--f-bloque);
          font-size: 10px; color: #FF6B00;
          letter-spacing: 0.5px; cursor: pointer; transition: border-color 0.2s;
          white-space: nowrap;
        }
        .hv-chismes-btn:hover { border-color: #FF6B00; }

        /* ── Main ── */
        .hv-main {
          position: relative; z-index: 1;
          padding: 24px 16px 32px;
          display: flex; flex-direction: column; align-items: center; gap: 20px;
        }

        /* ── Pill ── */
        .hv-pill {
          display: flex; align-items: center; gap: 8px;
          background: #111; padding: 6px 14px; border-radius: 100px;
          border: 1px solid #2a2a2a;
        }
        .hv-dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; }
        .hv-pill-txt {
          font-family: var(--f-bloque); font-size: 10px;
          color: #888; letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        /* ── Título ── */
        .hv-titulo { text-align: center; position: relative; line-height: 1; width: 100%; }
        .hv-pre {
          font-family: var(--f-bloque);
          font-size: clamp(32px, 9vw, 42px);
          color: #ccc; letter-spacing: 6px; line-height: 1;
          text-transform: uppercase;
        }
        .hv-ficha {
          font-family: var(--f-titulo);
          font-size: clamp(78px, 22vw, 102px);
          letter-spacing: 4px; line-height: 0.88;
          background: linear-gradient(135deg, #FF6B00 0%, #FFFF00 35%, #FF00AA 65%, #00FF41 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          text-transform: uppercase;
        }
        .hv-sello-circle {
          position: absolute; top: 8px; right: 8px;
          border: 2px solid #FF00AA; border-radius: 50%;
          width: 48px; height: 48px;
          display: flex; align-items: center; justify-content: center;
          transform: rotate(15deg); opacity: 0.7;
        }
        .hv-sello-txt { font-family: var(--f-bloque); font-size: 7px; color: #FF00AA; letter-spacing: 1px; }

        /* ── Swipe demo ── */
        .hv-instruccion { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .hv-swipe-demo  { display: flex; align-items: center; gap: 12px; }
        .hv-swipe-left, .hv-swipe-right {
          display: flex; align-items: center; gap: 4px;
          font-family: var(--f-bloque); font-size: 12px; letter-spacing: 1px;
        }
        .hv-swipe-left  { color: #FF00AA; }
        .hv-swipe-right { color: #00FF41; }
        .hv-swipe-lbl   { font-size: 10px; }
        .hv-swipe-card-mini {
          width: 48px; height: 60px;
          background: #111; border: 1px solid #333; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          animation: wobble 2s ease-in-out infinite;
        }
        @keyframes wobble {
          0%,100% { transform: rotate(-3deg); }
          50%      { transform: rotate(3deg); }
        }
        .hv-swipe-desc {
          font-family: var(--f-bloque); font-size: 11px;
          color: #555; text-align: center; letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        /* ── Card formulario ── */
        .hv-card {
          width: 100%; background: #111; border: 1px solid #222;
          border-radius: 12px; padding: 22px 18px; position: relative; overflow: hidden;
        }
        .hv-card-stripe {
          position: absolute; top: 0; left: 0; right: 0; height: 4px;
          background: linear-gradient(90deg, #FF6B00, #FFFF00, #FF00AA, #00FF41);
        }
        .hv-label {
          display: block; font-family: var(--f-bloque);
          font-size: 11px; letter-spacing: 2px;
          color: #FF6B00; margin-bottom: 10px; text-transform: uppercase;
        }
        .hv-sel-wrap { position: relative; margin-bottom: 16px; }
        .hv-select {
          width: 100%; padding: 13px 38px 13px 14px;
          background: #1a1a1a; border: 1px solid #333; border-radius: 8px;
          color: #fff; font-family: var(--f-cuerpo); font-size: 15px;
          appearance: none; cursor: pointer; outline: none; transition: border-color 0.2s;
        }
        .hv-select:focus { border-color: #FF6B00; }
        .hv-select option { background: #1a1a1a; }
        .hv-sel-arrow {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          color: #FF6B00; font-size: 16px; pointer-events: none;
        }

        /* ── Botón principal ── */
        .hv-btn {
          width: 100%; padding: 16px; background: #FF6B00; color: #000;
          border: none; border-radius: 8px;
          font-family: var(--f-titulo);
          font-size: 22px; letter-spacing: 2px; cursor: pointer;
          margin-bottom: 10px; transition: opacity 0.2s, transform 0.1s;
          text-transform: uppercase;
        }
        .hv-btn:not(.hv-btn-off):active { transform: scale(0.97); }
        .hv-btn-off {
          background: #1a1a1a !important; color: #333 !important;
          border: 1px solid #222; cursor: not-allowed;
        }
        .hv-disclaimer {
          font-family: var(--f-codigo); font-size: 10px;
          color: #444; text-align: center;
        }

        /* ── Toggles edad / género ── */
        .hv-toggle-group { display: flex; gap: 8px; width: 100%; }
        .hv-toggle {
          flex: 1; min-width: 0; padding: 12px 6px;
          background: #1a1a1a; border: 2px solid #222; border-radius: 10px;
          display: flex; flex-direction: column; align-items: center; gap: 5px;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s, color 0.15s, transform 0.1s;
          color: #555;
        }
        .hv-toggle:active { transform: scale(0.93); }
        .hv-toggle-emoji { font-size: 20px; line-height: 1; }
        .hv-toggle-lbl {
          font-family: var(--f-bloque);
          font-size: 11px; letter-spacing: 0.5px;
          text-align: center; line-height: 1.2;
          text-transform: uppercase;
        }

        /* ── Stats ── */
        .hv-stats {
          display: flex; justify-content: center; gap: 28px;
          padding: 14px 0; border-top: 1px solid #1a1a1a; width: 100%;
        }
        .hv-stat  { display: flex; flex-direction: column; align-items: center; gap: 2px; }
        .hv-stat-n {
          font-family: var(--f-titulo); font-size: 28px;
          color: #FFFF00; line-height: 1;
        }
        .hv-stat-l {
          font-family: var(--f-codigo); font-size: 9px;
          color: #555; letter-spacing: 1px; text-transform: uppercase;
        }

        /* ── Footer ── */
        .hv-footer {
          text-align: center; padding: 14px 16px; border-top: 1px solid #1a1a1a;
          display: flex; flex-direction: column; gap: 6px;
        }
        .hv-footer p { font-family: var(--f-codigo); font-size: 9px; color: #333; }
        .hv-footer-links { display: flex; justify-content: center; align-items: center; gap: 8px; }
        .hv-footer-link {
          background: transparent; border: none;
          font-family: var(--f-bloque); font-size: 9px; color: #333;
          cursor: pointer; text-transform: uppercase; letter-spacing: 0.5px;
          text-decoration: underline; transition: color 0.2s;
        }
        .hv-footer-link:hover { color: #FF6B00; }
        .hv-footer-sep { color: #2a2a2a; font-size: 10px; }
      `}</style>
    </div>
  );
}