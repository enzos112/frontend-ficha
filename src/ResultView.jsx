import { useState, useEffect } from "react";

const COLORES_PERFIL = {
  default: "#FF6B00",
  radical: "#FF6B00",
  vivillo: "#FFFF00",
  tranquilo: "#00FF41",
  negociador: "#FF00AA",
  tecnico: "#00FFFF",
};

export default function ResultView({ perfil, region, onReiniciar }) {
  const [fase, setFase]             = useState("oculto");
  const [selladoVisible, setSello]  = useState(false);
  const [copied, setCopied]         = useState(false);

  const col = COLORES_PERFIL[perfil?.id] || perfil?.color || "#FF6B00";

  useEffect(() => {
    const t1 = setTimeout(() => setFase("visible"), 100);
    const t2 = setTimeout(() => setSello(true), 700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const fecha = new Date().toLocaleDateString("es-PE", { day:"2-digit", month:"long", year:"numeric" });

  async function compartir() {
    const txt = `🇵🇪 Mi ficha: "${perfil?.nombre}" — ${perfil?.descripcion?.slice(0,80)}... Saca la tuya 👉 sacatuficha.pe (Código: ${perfil?.codigo})`;
    try {
      if (navigator.share) await navigator.share({ text: txt });
      else { await navigator.clipboard.writeText(txt); setCopied(true); setTimeout(() => setCopied(false), 2500); }
    } catch {}
  }

  if (!perfil) return null;

  return (
    <div className="res-root">
      {fase === "visible" && <Confeti />}

      {/* Header */}
      <header className="res-header">
        <span className="res-logo">Saca tu Ficha</span>
        <span className="res-badge">RESULTADO OFICIAL</span>
      </header>

      <main className="res-main">
        <p className="res-intro">Luego de análisis exhaustivo del padrón:</p>

        {/* CERTIFICADO */}
        <div className={`cert fase-${fase}`} style={{ "--col": col }}>
          {/* Stripe */}
          <div className="cert-stripe" />

          {/* Sello */}
          <div className={`cert-sello ${selladoVisible ? "sello-on" : ""}`}>
            <p className="sello-top">EXPEDIENTE</p>
            <p className="sello-cod">{perfil.codigo}</p>
            <p className="sello-bot">APROBADO</p>
          </div>

          {/* Header cert */}
          <div className="cert-head">
            <p className="cert-inst">REPÚBLICA DEL PERÚ — RNIF</p>
            <div className="cert-divider" style={{ background: col }} />
          </div>

          {/* Emoji */}
          <div className="cert-emoji-wrap" style={{ borderColor: col, boxShadow: `0 0 20px ${col}55` }}>
            <span className="cert-emoji">{perfil.emoji}</span>
          </div>

          <p className="cert-tipo-lbl">TIPO DE FICHA IDENTIFICADO</p>
          <h1 className="cert-nombre" style={{ color: col, textShadow: `0 0 30px ${col}66` }}>
            {perfil.nombre}
          </h1>
          <p className="cert-desc">{perfil.descripcion}</p>

          {/* Rasgos */}
          {perfil.rasgos?.length > 0 && (
            <div className="cert-rasgos">
              <p className="cert-rasgos-lbl">RASGOS IDENTIFICADOS</p>
              {perfil.rasgos.map((r, i) => (
                <div key={i} className="cert-rasgo">
                  <span style={{ color: col, fontSize: 8 }}>◆</span>
                  <span>{r}</span>
                </div>
              ))}
            </div>
          )}

          {/* Footer cert */}
          <div className="cert-footer">
            <div className="cert-footer-col">
              <p className="cf-lbl">DEPARTAMENTO</p>
              <p className="cf-val">{region}</p>
            </div>
            <div className="cf-sep" />
            <div className="cert-footer-col">
              <p className="cf-lbl">EMISIÓN</p>
              <p className="cf-val">{fecha}</p>
            </div>
            <div className="cf-sep" />
            <div className="cert-footer-col">
              <p className="cf-lbl">CÓDIGO</p>
              <p className="cf-val cf-mono" style={{ color: col }}>{perfil.codigo}</p>
            </div>
          </div>

          {perfil.estadistica && (
            <div className="cert-stat" style={{ borderLeftColor: col }}>
              <span>📊</span>
              <span>{perfil.estadistica}</span>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className={`res-acciones fase-${fase}`}>
          <button className="btn-compartir" style={{ background: col, color: col === "#FFFF00" ? "#000" : "#000" }} onClick={compartir}>
            {copied ? "✓ ¡COPIADO!" : "📤 COMPARTIR MI FICHA"}
          </button>
          <button className="btn-otra" onClick={onReiniciar}>
            Sacar otra ficha →
          </button>
        </div>

        {/* Distribución */}
        <div className={`res-dist fase-${fase}`}>
          <p className="dist-titulo">DISTRIBUCIÓN NACIONAL</p>
          <BarrasNacionales perfilActual={perfil.nombre} />
        </div>
      </main>

      <ResultStyles />
    </div>
  );
}

function BarrasNacionales({ perfilActual }) {
  const datos = [
    { nombre:"La Ficha Radical",      pct:28, color:"#FF6B00" },
    { nombre:"El Vivillo Mayor",       pct:22, color:"#FFFF00" },
    { nombre:"El Tranquilo Total",     pct:18, color:"#00FF41" },
    { nombre:"La Mente Diplomática",   pct:16, color:"#FF00AA" },
    { nombre:"El Técnico Riguroso",    pct:10, color:"#00FFFF" },
    { nombre:"Otros",                  pct: 6, color:"#444"    },
  ];
  return (
    <div className="barras-wrap">
      {datos.map(d => (
        <div key={d.nombre} className={`barra-item ${d.nombre===perfilActual?"barra-activa":""}`}>
          <span className="barra-lbl">{d.nombre}</span>
          <div className="barra-track">
            <div className="barra-fill" style={{ width:`${d.pct}%`, background: d.color }} />
          </div>
          <span className="barra-pct">{d.pct}%</span>
        </div>
      ))}
    </div>
  );
}

function Confeti() {
  const piezas = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    color: ["#FF6B00","#FFFF00","#FF00AA","#00FF41","#fff"][i % 5],
    left: `${i * 5}%`,
    delay: `${(i * 0.1).toFixed(1)}s`,
    size: 6 + (i % 4) * 2,
  }));
  return (
    <div style={{ position:"fixed", top:0, left:0, width:"100%", pointerEvents:"none", zIndex:20 }}>
      {piezas.map(p => (
        <div key={p.id} style={{
          position:"absolute", top:-20, left:p.left,
          width:p.size, height:p.size * 0.55,
          background:p.color, borderRadius:2, opacity:0.9,
          animation:`caer 3s ease-in ${p.delay} forwards`,
        }} />
      ))}
      <style>{`@keyframes caer { 0%{transform:translateY(0) rotate(0deg);opacity:1} 100%{transform:translateY(100vh) rotate(720deg);opacity:0} }`}</style>
    </div>
  );
}

function ResultStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Public+Sans:wght@400;600;700&family=Special+Elite&family=Courier+Prime:wght@400;700&display=swap');

      .res-root {
        min-height: 100vh;
        background: #0A0A0A;
        color: #fff;
        font-family: 'Public Sans', sans-serif;
        max-width: 480px;
        margin: 0 auto;
        overflow-x: hidden;
      }

      .res-header {
        position: sticky; top:0; z-index:10;
        background: #0f0f0f;
        border-bottom: 1px solid #1a1a1a;
        padding: 10px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .res-logo {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 18px;
        letter-spacing: 2px;
        background: linear-gradient(90deg, #FF6B00, #FF00AA);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .res-badge {
        font-family: 'Courier Prime', monospace;
        font-size: 9px;
        color: #FFFF00;
        border: 1px solid #FFFF00;
        padding: 3px 7px;
        letter-spacing: 1px;
        opacity: 0.8;
      }

      .res-main {
        padding: 20px 16px 48px;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .res-intro {
        font-family: 'Courier Prime', monospace;
        font-size: 11px;
        color: #555;
        text-align: center;
        letter-spacing: 1px;
      }

      /* ─── CERTIFICADO ─── */
      .cert {
        background: #111;
        border: 1px solid #2a2a2a;
        border-radius: 12px;
        padding: 28px 18px 22px;
        position: relative;
        overflow: hidden;
        transition: opacity 0.5s ease, transform 0.5s ease;
      }
      .fase-oculto  { opacity: 0; transform: scale(0.95); }
      .fase-visible { opacity: 1; transform: scale(1); }

      .cert-stripe {
        position: absolute;
        top:0; left:0; right:0;
        height: 3px;
        background: linear-gradient(90deg, #FF6B00, #FFFF00, #FF00AA, #00FF41);
      }

      /* Sello */
      .cert-sello {
        position: absolute;
        top: 20px; right: 16px;
        width: 76px; height: 76px;
        border: 2.5px solid var(--col);
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transform: scale(3) rotate(-20deg);
        transition: opacity 0.25s ease, transform 0.4s cubic-bezier(0.175,0.885,0.32,1.275);
        z-index: 2;
      }
      .sello-on { opacity: 0.85 !important; transform: scale(1) rotate(-20deg) !important; }
      .sello-top, .sello-bot {
        font-family: 'Courier Prime', monospace;
        font-size: 7px;
        color: var(--col);
        letter-spacing: 1px;
        font-weight: 700;
      }
      .sello-cod {
        font-family: 'Courier Prime', monospace;
        font-size: 9px;
        font-weight: 700;
        color: var(--col);
      }

      /* Head cert */
      .cert-head { text-align:center; margin-bottom: 18px; }
      .cert-inst {
        font-family: 'Courier Prime', monospace;
        font-size: 9px;
        color: #555;
        letter-spacing: 2px;
        margin-bottom: 8px;
      }
      .cert-divider { height: 2px; width: 50%; margin: 0 auto; border-radius: 1px; opacity: 0.6; }

      /* Emoji */
      .cert-emoji-wrap {
        width: 80px; height: 80px;
        border-radius: 50%;
        border: 2px solid;
        background: #1a1a1a;
        display: flex; align-items: center; justify-content: center;
        margin: 0 auto 14px;
        transition: box-shadow 0.3s;
      }
      .cert-emoji { font-size: 36px; line-height: 1; }

      .cert-tipo-lbl {
        font-family: 'Courier Prime', monospace;
        font-size: 9px;
        color: #555;
        letter-spacing: 2px;
        text-align: center;
        margin-bottom: 6px;
      }
      .cert-nombre {
        font-family: 'Bebas Neue', sans-serif;
        font-size: clamp(32px, 9vw, 44px);
        letter-spacing: 4px;
        text-align: center;
        line-height: 1.1;
        margin-bottom: 10px;
      }
      .cert-desc {
        font-family: 'Special Elite', system-ui;
        font-size: 14px;
        color: #bbb;
        text-align: center;
        line-height: 1.55;
        font-style: italic;
        margin-bottom: 18px;
      }

      /* Rasgos */
      .cert-rasgos {
        border-top: 1px solid #1a1a1a;
        border-bottom: 1px solid #1a1a1a;
        padding: 14px 0;
        margin-bottom: 18px;
      }
      .cert-rasgos-lbl {
        font-family: 'Courier Prime', monospace;
        font-size: 9px;
        color: #555;
        letter-spacing: 2px;
        margin-bottom: 8px;
        text-align: center;
      }
      .cert-rasgo {
        display: flex;
        align-items: baseline;
        gap: 8px;
        font-family: 'Public Sans', sans-serif;
        font-size: 13px;
        color: #ccc;
        margin-bottom: 5px;
      }

      /* Footer cert */
      .cert-footer {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 0;
        margin-bottom: 14px;
      }
      .cert-footer-col { flex:1; min-width: 90px; text-align:center; padding: 0 10px; }
      .cf-sep { width:1px; background:#1a1a1a; margin: 4px 0; }
      .cf-lbl {
        font-family: 'Courier Prime', monospace;
        font-size: 8px;
        color: #444;
        letter-spacing: 1.5px;
        margin-bottom: 3px;
      }
      .cf-val {
        font-family: 'Public Sans', sans-serif;
        font-size: 12px;
        font-weight: 700;
        color: #fff;
      }
      .cf-mono { font-family: 'Courier Prime', monospace !important; }

      /* Stat */
      .cert-stat {
        background: #1a1a1a;
        border-left: 3px solid;
        padding: 8px 12px;
        display: flex;
        align-items: center;
        gap: 8px;
        font-family: 'Courier Prime', monospace;
        font-size: 11px;
        color: #888;
        border-radius: 0 6px 6px 0;
      }

      /* Acciones */
      .res-acciones {
        display: flex;
        flex-direction: column;
        gap: 10px;
        align-items: center;
        transition: opacity 0.5s 0.3s;
      }
      .res-acciones.fase-oculto  { opacity:0; }
      .res-acciones.fase-visible { opacity:1; }

      .btn-compartir {
        width: 100%;
        padding: 16px;
        border: none;
        border-radius: 8px;
        font-family: 'Bebas Neue', sans-serif;
        font-size: 20px;
        letter-spacing: 3px;
        cursor: pointer;
        transition: opacity 0.2s, transform 0.1s;
      }
      .btn-compartir:hover  { opacity: 0.9; }
      .btn-compartir:active { transform: scale(0.97); }

      .btn-otra {
        background: transparent;
        border: 1px solid #2a2a2a;
        border-radius: 8px;
        padding: 10px 24px;
        font-family: 'Public Sans', sans-serif;
        font-size: 13px;
        color: #555;
        cursor: pointer;
        transition: border-color 0.2s, color 0.2s;
      }
      .btn-otra:hover { border-color: #FF6B00; color: #FF6B00; }

      /* Distribución */
      .res-dist {
        background: #111;
        border: 1px solid #1a1a1a;
        border-radius: 12px;
        padding: 18px;
        transition: opacity 0.5s 0.5s;
      }
      .res-dist.fase-oculto  { opacity:0; }
      .res-dist.fase-visible { opacity:1; }

      .dist-titulo {
        font-family: 'Courier Prime', monospace;
        font-size: 9px;
        color: #444;
        letter-spacing: 2px;
        margin-bottom: 14px;
      }
      .barras-wrap { display:flex; flex-direction:column; gap:8px; }
      .barra-item { display:flex; align-items:center; gap:8px; opacity:0.45; transition:opacity 0.2s; }
      .barra-activa { opacity:1 !important; }
      .barra-lbl {
        font-family: 'Courier Prime', monospace;
        font-size: 9px;
        color: #888;
        min-width: 120px;
      }
      .barra-track {
        flex:1; height:6px; background:#1a1a1a; border-radius:3px; overflow:hidden;
      }
      .barra-fill { height:100%; border-radius:3px; transition: width 1s ease 0.8s; }
      .barra-pct {
        font-family: 'Courier Prime', monospace;
        font-size: 9px;
        color: #444;
        min-width: 28px;
        text-align: right;
      }
    `}</style>
  );
}