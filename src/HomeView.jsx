import { useState } from "react";

const REGIONES = [
  "Amazonas","Áncash","Apurímac","Arequipa","Ayacucho",
  "Cajamarca","Callao","Cusco","Huancavelica","Huánuco",
  "Ica","Junín","La Libertad","Lambayeque","Lima",
  "Loreto","Madre de Dios","Moquegua","Pasco","Piura",
  "Puno","San Martín","Tacna","Tumbes","Ucayali",
];

const FRASES = [
  "¿Eres más 'tramitador experto' o 'vivo del barrio'?",
  "Tu DNI ya sabe la verdad. Nosotros también.",
  "El padrón no miente. Tú sí.",
  "¿De qué barro estás hecho, causa?",
];

export default function HomeView({ onStart }) {
  const [region, setRegion] = useState("");
  const [frase] = useState(() => FRASES[Math.floor(Math.random() * FRASES.length)]);

  return (
    <div className="home-root">
      {/* Header */}
      <header className="home-header">
        <span className="home-header-tag">RNIF · REPÚBLICA DEL PERÚ · 2026</span>
        <span className="home-header-cod">REF-{Math.floor(Math.random()*9000+1000)}</span>
      </header>

      <main className="home-main">
        {/* Badge pill */}
        <div className="home-pill">
          <span className="dot dot-fucsia" />
          <span className="home-pill-txt">EXPERIMENTO SOCIAL · PERÚ</span>
          <span className="dot dot-verde" />
        </div>

        {/* Título */}
        <div className="home-titulo-wrap">
          <p className="home-pre">SACA TU</p>
          <h1 className="home-ficha">FICHA</h1>
          <div className="home-sello-decor">
            <span className="home-sello-decor-txt">OFICIAL</span>
          </div>
        </div>

        {/* Frase */}
        <p className="home-frase">{frase}</p>

        {/* Separador */}
        <div className="home-sep">
          <span className="sep-ico naranja">▶</span>
          <div className="sep-linea" />
          <span className="sep-ico amarillo">◆</span>
          <div className="sep-linea" />
          <span className="sep-ico fucsia">◀</span>
        </div>

        {/* Card */}
        <div className="home-card">
          <div className="home-card-stripe" />
          <p className="field-label">DEPARTAMENTO DE ORIGEN</p>
          <div className="select-wrap">
            <select
              className="region-select"
              value={region}
              onChange={e => setRegion(e.target.value)}
            >
              <option value="">— Selecciona tu tierra —</option>
              {REGIONES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <span className="select-arrow">▾</span>
          </div>

          <button
            className={`btn-tramitar ${!region ? "btn-off" : ""}`}
            disabled={!region}
            onClick={() => region && onStart(region)}
          >
            TRAMITAR MI FICHA →
          </button>

          <p className="home-disclaimer">Anónimo · Satírico · Sin datos personales</p>
        </div>

        {/* Stats */}
        <div className="home-stats">
          {[["127K+","fichas"],["25","deptos"],["8","perfiles"]].map(([n,l]) => (
            <div key={l} className="stat-item">
              <span className="stat-num">{n}</span>
              <span className="stat-lbl">{l}</span>
            </div>
          ))}
        </div>
      </main>

      <footer className="home-footer">© 2026 Saca tu Ficha — Sátira electoral peruana</footer>

      <Styles />
    </div>
  );
}

function Styles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Public+Sans:wght@400;600;700&family=Special+Elite&family=Courier+Prime:wght@400;700&display=swap');

      .home-root {
        min-height: 100vh;
        background: #0A0A0A;
        color: #fff;
        font-family: 'Public Sans', sans-serif;
        max-width: 480px;
        margin: 0 auto;
        position: relative;
        overflow-x: hidden;
      }

      /* Header */
      .home-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 16px;
        border-bottom: 1px solid #1a1a1a;
      }
      .home-header-tag {
        font-family: 'Courier Prime', monospace;
        font-size: 9px;
        color: #444;
        letter-spacing: 1.5px;
      }
      .home-header-cod {
        font-family: 'Courier Prime', monospace;
        font-size: 9px;
        color: #FF6B00;
      }

      /* Main */
      .home-main {
        padding: 28px 16px 32px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
      }

      /* Pill */
      .home-pill {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #111;
        padding: 6px 14px;
        border-radius: 100px;
        border: 1px solid #2a2a2a;
      }
      .home-pill-txt {
        font-family: 'Courier Prime', monospace;
        font-size: 10px;
        color: #888;
        letter-spacing: 2px;
      }
      .dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; }
      .dot-fucsia { background: #FF00AA; }
      .dot-verde  { background: #00FF41; }

      /* Título */
      .home-titulo-wrap {
        text-align: center;
        position: relative;
        line-height: 1;
        width: 100%;
      }
      .home-pre {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 48px;
        color: #fff;
        letter-spacing: 8px;
        line-height: 1;
      }
      .home-ficha {
        font-family: 'Bebas Neue', sans-serif;
        font-size: clamp(80px, 22vw, 104px);
        letter-spacing: 10px;
        line-height: 0.85;
        background: linear-gradient(135deg, #FF6B00 0%, #FFFF00 35%, #FF00AA 65%, #00FF41 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .home-sello-decor {
        position: absolute;
        top: 10px;
        right: 8px;
        border: 2px solid #FF00AA;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        transform: rotate(15deg);
        opacity: 0.75;
      }
      .home-sello-decor-txt {
        font-family: 'Special Elite', system-ui;
        font-size: 8px;
        color: #FF00AA;
        letter-spacing: 1px;
      }

      /* Frase */
      .home-frase {
        font-family: 'Special Elite', system-ui;
        font-size: 15px;
        color: #bbb;
        text-align: center;
        line-height: 1.55;
        max-width: 300px;
        font-style: italic;
      }

      /* Separador */
      .home-sep {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
      }
      .sep-ico { font-size: 11px; }
      .naranja  { color: #FF6B00; }
      .amarillo { color: #FFFF00; }
      .fucsia   { color: #FF00AA; }
      .verde    { color: #00FF41; }
      .sep-linea {
        flex: 1;
        height: 1px;
        background: linear-gradient(90deg, #FF6B00, #FF00AA);
        opacity: 0.35;
      }

      /* Card */
      .home-card {
        width: 100%;
        background: #111;
        border: 1px solid #222;
        border-radius: 12px;
        padding: 24px 18px;
        position: relative;
        overflow: hidden;
      }
      .home-card-stripe {
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 3px;
        background: linear-gradient(90deg, #FF6B00, #FFFF00, #FF00AA, #00FF41);
      }
      .field-label {
        font-family: 'Courier Prime', monospace;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 2px;
        color: #FF6B00;
        margin-bottom: 10px;
        display: block;
      }
      .select-wrap { position: relative; margin-bottom: 16px; }
      .region-select {
        width: 100%;
        padding: 13px 40px 13px 14px;
        background: #1a1a1a;
        border: 1px solid #333;
        border-radius: 8px;
        color: #fff;
        font-family: 'Public Sans', sans-serif;
        font-size: 15px;
        appearance: none;
        cursor: pointer;
        outline: none;
        transition: border-color 0.2s;
      }
      .region-select:focus { border-color: #FF6B00; }
      .region-select option { background: #1a1a1a; }
      .select-arrow {
        position: absolute;
        right: 14px;
        top: 50%;
        transform: translateY(-50%);
        color: #FF6B00;
        font-size: 16px;
        pointer-events: none;
      }

      .btn-tramitar {
        width: 100%;
        padding: 15px;
        background: #FF6B00;
        color: #000;
        border: none;
        border-radius: 8px;
        font-family: 'Bebas Neue', sans-serif;
        font-size: 20px;
        letter-spacing: 3px;
        cursor: pointer;
        margin-bottom: 12px;
        transition: background 0.2s, transform 0.1s;
      }
      .btn-tramitar:not(.btn-off):hover  { background: #ff8228; }
      .btn-tramitar:not(.btn-off):active { transform: scale(0.97); }
      .btn-off {
        background: #1a1a1a !important;
        color: #444 !important;
        border: 1px solid #222;
        cursor: not-allowed;
      }

      .home-disclaimer {
        font-family: 'Courier Prime', monospace;
        font-size: 10px;
        color: #444;
        text-align: center;
        letter-spacing: 0.5px;
      }

      /* Stats */
      .home-stats {
        display: flex;
        justify-content: center;
        gap: 28px;
        padding: 16px 0;
        border-top: 1px solid #1a1a1a;
        width: 100%;
      }
      .stat-item { display: flex; flex-direction: column; align-items: center; gap: 2px; }
      .stat-num {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 26px;
        color: #FFFF00;
        line-height: 1;
      }
      .stat-lbl {
        font-family: 'Courier Prime', monospace;
        font-size: 9px;
        color: #555;
        letter-spacing: 1px;
        text-transform: uppercase;
      }

      /* Footer */
      .home-footer {
        text-align: center;
        padding: 16px;
        border-top: 1px solid #1a1a1a;
        font-family: 'Courier Prime', monospace;
        font-size: 9px;
        color: #333;
      }
    `}</style>
  );
}