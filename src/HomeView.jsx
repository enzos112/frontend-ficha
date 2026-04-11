import { useState } from "react";

// Regiones filtradas según el nuevo plan
const REGIONES = [
  "Lima", "Arequipa", "Cajamarca", "Cusco", "Piura", "Otras Regiones"
];

export default function HomeView({ onStart, onVerChismes, onRecover }) {
  const [region, setRegion] = useState("");
  const [modoRecuperar, setModoRecuperar] = useState(false);
  const [codigoInput, setCodigoInput] = useState("");

  return (
    <div className="hv-root">
      {/* Gradiente de fondo sutil */}
      <div className="hv-bg-glow" />

      {/* Header */}
      <header className="hv-header">
        <span className="hv-header-left">RNIF · 2026</span>
        <button className="hv-chismes-btn" onClick={onVerChismes}>
          🗞️ CHISMES
        </button>
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

        {/* Card Principal: Alterna entre Nuevo Trámite y Recuperar */}
        <div className="hv-card">
          <div className="hv-card-stripe" />
          
          {!modoRecuperar ? (
            <>
              {/* --- MODO: NUEVO TRÁMITE --- */}
              <label className="hv-label">TU DEPARTAMENTO</label>
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
              <button
                className={`hv-btn ${!region ? "hv-btn-off" : ""}`}
                disabled={!region}
                onClick={() => region && onStart(region)}
              >
                TRAMITAR MI FICHA →
              </button>
              
              <button 
                onClick={() => setModoRecuperar(true)}
                className="hv-link-btn"
              >
                ¿Ya tienes un código de trámite?
              </button>
              <p className="hv-disclaimer" style={{ marginTop: '8px' }}>Anónimo · Satírico · Sin datos personales</p>
            </>
          ) : (
            <>
              {/* --- MODO: RECUPERAR TRÁMITE --- */}
              <label className="hv-label">CÓDIGO DE TRÁMITE</label>
              <div className="hv-sel-wrap">
                <input
                  type="text"
                  className="hv-select"
                  style={{ textAlign: 'center', fontFamily: "'Courier Prime', monospace", letterSpacing: '3px', color: '#FFFF00' }}
                  placeholder="FCH-XXXX"
                  value={codigoInput}
                  onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                />
              </div>
              <button
                className={`hv-btn ${codigoInput.length < 8 ? "hv-btn-off" : ""}`}
                style={{ background: '#FF00AA', color: '#fff' }}
                disabled={codigoInput.length < 8}
                onClick={() => codigoInput.length >= 8 && onRecover(codigoInput)}
              >
                RECUPERAR FICHA ↺
              </button>
              
              <button 
                onClick={() => setModoRecuperar(false)}
                className="hv-link-btn"
              >
                Volver a Nuevo Trámite
              </button>
            </>
          )}
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

      <footer className="hv-footer">© 2026 Saca tu Ficha — Sátira electoral peruana</footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Public+Sans:wght@400;600;700&family=Special+Elite&family=Courier+Prime:wght@400;700&display=swap');

        .hv-root {
          min-height: 100vh; background: #0A0A0A; color: #fff;
          font-family: 'Public Sans', sans-serif;
          max-width: 480px; margin: 0 auto;
          position: relative; overflow-x: hidden;
        }
        .hv-bg-glow {
          position: fixed; top: -100px; left: 50%; transform: translateX(-50%);
          width: 300px; height: 300px; border-radius: 50%;
          background: radial-gradient(circle, rgba(255,107,0,0.12) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }
        .hv-header {
          position: relative; z-index: 1;
          display: flex; justify-content: space-between; align-items: center;
          padding: 12px 16px; border-bottom: 1px solid #1a1a1a;
        }
        .hv-header-left {
          font-family: 'Courier Prime', monospace; font-size: 9px;
          color: #444; letter-spacing: 2px;
        }
        .hv-chismes-btn {
          background: #1a1a1a; border: 1px solid #333; border-radius: 20px;
          padding: 5px 12px; font-family: 'Courier Prime', monospace;
          font-size: 10px; font-weight: 700; color: #FF6B00;
          letter-spacing: 1px; cursor: pointer; transition: border-color 0.2s;
        }
        .hv-chismes-btn:hover { border-color: #FF6B00; }

        .hv-main {
          position: relative; z-index: 1;
          padding: 24px 16px 32px;
          display: flex; flex-direction: column; align-items: center; gap: 20px;
        }
        .hv-pill {
          display: flex; align-items: center; gap: 8px;
          background: #111; padding: 6px 14px; border-radius: 100px;
          border: 1px solid #2a2a2a;
        }
        .hv-dot { width: 6px; height: 6px; border-radius: 50%; }
        .hv-pill-txt {
          font-family: 'Courier Prime', monospace; font-size: 10px;
          color: #888; letter-spacing: 2px;
        }
        .hv-titulo { text-align: center; position: relative; line-height: 1; width: 100%; }
        .hv-pre {
          font-family: 'Bebas Neue', sans-serif; font-size: 44px;
          color: #fff; letter-spacing: 8px; line-height: 1;
        }
        .hv-ficha {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(80px, 22vw, 100px);
          letter-spacing: 10px; line-height: 0.85;
          background: linear-gradient(135deg, #FF6B00 0%, #FFFF00 35%, #FF00AA 65%, #00FF41 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .hv-sello-circle {
          position: absolute; top: 8px; right: 8px;
          border: 2px solid #FF00AA; border-radius: 50%;
          width: 48px; height: 48px;
          display: flex; align-items: center; justify-content: center;
          transform: rotate(15deg); opacity: 0.7;
        }
        .hv-sello-txt { font-family: 'Special Elite', system-ui; font-size: 8px; color: #FF00AA; }

        /* Instrucción swipe */
        .hv-instruccion { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .hv-swipe-demo { display: flex; align-items: center; gap: 12px; }
        .hv-swipe-left, .hv-swipe-right {
          display: flex; align-items: center; gap: 4px;
          font-family: 'Bebas Neue', sans-serif; font-size: 13px; letter-spacing: 1px;
        }
        .hv-swipe-left  { color: #FF00AA; }
        .hv-swipe-right { color: #00FF41; }
        .hv-swipe-lbl { font-size: 11px; }
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
          font-family: 'Courier Prime', monospace; font-size: 10px;
          color: #555; text-align: center; letter-spacing: 0.5px;
        }

        /* Card */
        .hv-card {
          width: 100%; background: #111; border: 1px solid #222;
          border-radius: 12px; padding: 22px 18px; position: relative; overflow: hidden;
        }
        .hv-card-stripe {
          position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, #FF6B00, #FFFF00, #FF00AA, #00FF41);
        }
        .hv-label {
          display: block; font-family: 'Courier Prime', monospace;
          font-size: 10px; font-weight: 700; letter-spacing: 2px;
          color: #FF6B00; margin-bottom: 10px;
        }
        .hv-sel-wrap { position: relative; margin-bottom: 14px; }
        .hv-select {
          width: 100%; padding: 13px 38px 13px 14px;
          background: #1a1a1a; border: 1px solid #333; border-radius: 8px;
          color: #fff; font-family: 'Public Sans', sans-serif; font-size: 15px;
          appearance: none; cursor: pointer; outline: none; transition: border-color 0.2s;
        }
        .hv-select:focus { border-color: #FF6B00; }
        .hv-select option { background: #1a1a1a; }
        .hv-sel-arrow {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          color: #FF6B00; font-size: 16px; pointer-events: none;
        }
        .hv-btn {
          width: 100%; padding: 15px; background: #FF6B00; color: #000;
          border: none; border-radius: 8px; font-family: 'Bebas Neue', sans-serif;
          font-size: 20px; letter-spacing: 3px; cursor: pointer;
          margin-bottom: 10px; transition: opacity 0.2s, transform 0.1s;
        }
        .hv-btn:not(.hv-btn-off):active { transform: scale(0.97); }
        .hv-btn-off { background: #1a1a1a !important; color: #333 !important; border: 1px solid #222; cursor: not-allowed; }
        
        .hv-link-btn {
          width: 100%; background: transparent; border: none; color: #888;
          font-family: 'Courier Prime', monospace; font-size: 10px; text-decoration: underline;
          margin-top: 10px; cursor: pointer; transition: color 0.2s;
        }
        .hv-link-btn:hover { color: #FF6B00; }
        
        .hv-disclaimer { font-family: 'Courier Prime', monospace; font-size: 10px; color: #444; text-align: center; }

        .hv-stats { display: flex; justify-content: center; gap: 28px; padding: 14px 0; border-top: 1px solid #1a1a1a; width: 100%; }
        .hv-stat  { display: flex; flex-direction: column; align-items: center; gap: 2px; }
        .hv-stat-n { font-family: 'Bebas Neue', sans-serif; font-size: 26px; color: #FFFF00; line-height: 1; }
        .hv-stat-l { font-family: 'Courier Prime', monospace; font-size: 9px; color: #555; letter-spacing: 1px; text-transform: uppercase; }

        .hv-footer { text-align: center; padding: 16px; border-top: 1px solid #1a1a1a; font-family: 'Courier Prime', monospace; font-size: 9px; color: #333; }
      `}</style>
    </div>
  );
}