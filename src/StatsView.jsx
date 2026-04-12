// StatsView.jsx
// Equipo 2 — datos quemados por ahora
// Cuando Enzo conecte /api/get-estadisticas, App.jsx le pasará `datos` como prop real

import { useState } from "react";

// ── Datos quemados (Enzo los reemplaza con la API) ──────────────────────────
const DATOS_MOCK = {
  totalFichas: 127439,
  porRegion: [
    { region: "Lima",       total: 48200, perfilTop: "El Vivillo",     pct: 34 },
    { region: "Arequipa",   total: 12800, perfilTop: "El Técnico",     pct: 29 },
    { region: "Cusco",      total: 9400,  perfilTop: "El Resistente",  pct: 31 },
    { region: "Piura",      total: 8100,  perfilTop: "El Tranquilo",   pct: 27 },
    { region: "Cajamarca",  total: 6700,  perfilTop: "El Radical",     pct: 38 },
    { region: "La Libertad",total: 7200,  perfilTop: "El Negociador",  pct: 25 },
    { region: "Junín",      total: 4900,  perfilTop: "El Mediático",   pct: 22 },
    { region: "Otros",      total: 30139, perfilTop: "El Tranquilo",   pct: 24 },
  ],
  porPerfil: [
    { perfil: "El Vivillo",     pct: 26, color: "#FFFF00",  emoji: "🦊" },
    { perfil: "El Radical",     pct: 19, color: "#FF6B00",  emoji: "🔥" },
    { perfil: "El Tranquilo",   pct: 17, color: "#00FF41",  emoji: "🦥" },
    { perfil: "El Resistente",  pct: 14, color: "#00FFFF",  emoji: "💪" },
    { perfil: "El Negociador",  pct: 10, color: "#FF00AA",  emoji: "🤝" },
    { perfil: "El Técnico",     pct:  7, color: "#00FFFF",  emoji: "📋" },
    { perfil: "El Mediático",   pct:  5, color: "#FF6B00",  emoji: "📱" },
    { perfil: "El Pituco",      pct:  2, color: "#FFFF00",  emoji: "🕶️" },
  ],
  porEdad: [
    { rango: "18-30", pct: 61 },
    { rango: "31+",   pct: 39 },
  ],
  porGenero: [
    { genero: "Hombre",            pct: 47, color: "#FF6B00" },
    { genero: "Mujer",             pct: 44, color: "#FF00AA" },
    { genero: "Prefiero no decir", pct:  9, color: "#FFFF00" },
  ],
  chismeTop: "El cajero de Miraflores solo funciona si llegas con tamales.",
};

const TABS = ["PERFILES", "REGIONES", "DEMOGRAFÍA"];

export default function StatsView({ datos = DATOS_MOCK, onClose }) {
  const [tab, setTab] = useState("PERFILES");
  const d = datos;

  return (
    <div className="sv-root">
      {/* Header */}
      <header className="sv-header">
        <button className="sv-back" onClick={onClose}>← Volver</button>
        <div className="sv-header-center">
          <span className="sv-titulo">EL PADRÓN</span>
          <span className="sv-sub">estadísticas en tiempo real</span>
        </div>
        <span className="sv-live">🔴 VIVO</span>
      </header>

      <main className="sv-main">

        {/* Contador principal */}
        <div className="sv-hero">
          <div className="sv-hero-stripe" />
          <p className="sv-hero-lbl">TOTAL DE FICHAS EMITIDAS</p>
          <p className="sv-hero-num">{d.totalFichas.toLocaleString("es-PE")}</p>
          <p className="sv-hero-sub">y contando, causa</p>
        </div>

        {/* Tabs */}
        <div className="sv-tabs">
          {TABS.map(t => (
            <button
              key={t}
              className={`sv-tab ${tab === t ? "sv-tab-on" : ""}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── Tab: PERFILES ── */}
        {tab === "PERFILES" && (
          <div className="sv-section">
            <p className="sv-section-title">¿QUIÉNES SON LOS PERUANOS?</p>
            <div className="sv-barras">
              {d.porPerfil.map((p, i) => (
                <div key={p.perfil} className="sv-barra-item" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="sv-barra-meta">
                    <span className="sv-barra-emoji">{p.emoji}</span>
                    <span className="sv-barra-nombre">{p.perfil}</span>
                    <span className="sv-barra-pct" style={{ color: p.color }}>{p.pct}%</span>
                  </div>
                  <div className="sv-barra-track">
                    <div
                      className="sv-barra-fill"
                      style={{ width: `${p.pct}%`, background: p.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Tab: REGIONES ── */}
        {tab === "REGIONES" && (
          <div className="sv-section">
            <p className="sv-section-title">¿CÓMO ES EL PERÚ POR DENTRO?</p>
            <div className="sv-regiones">
              {d.porRegion.map((r, i) => (
                <div key={r.region} className="sv-region-card" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="sv-region-top">
                    <span className="sv-region-nombre">{r.region}</span>
                    <span className="sv-region-total">{r.total.toLocaleString("es-PE")} fichas</span>
                  </div>
                  <div className="sv-region-bottom">
                    <span className="sv-region-lbl">PERFIL DOMINANTE</span>
                    <span className="sv-region-perfil">{r.perfilTop}</span>
                    <span className="sv-region-pct">{r.pct}%</span>
                  </div>
                  <div className="sv-region-bar">
                    <div
                      className="sv-region-bar-fill"
                      style={{ width: `${r.pct * 2.5}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Tab: DEMOGRAFÍA ── */}
        {tab === "DEMOGRAFÍA" && (
          <div className="sv-section">
            <p className="sv-section-title">¿QUIÉN SACA SU FICHA?</p>

            {/* Edad */}
            <div className="sv-demo-block">
              <p className="sv-demo-lbl">POR EDAD</p>
              <div className="sv-donut-row">
                {d.porEdad.map(e => (
                  <div key={e.rango} className="sv-donut-item">
                    <div className="sv-donut-circle" style={{
                      background: `conic-gradient(#FF6B00 0% ${e.pct}%, #1a1a1a ${e.pct}% 100%)`
                    }}>
                      <div className="sv-donut-inner">
                        <span className="sv-donut-num">{e.pct}%</span>
                      </div>
                    </div>
                    <p className="sv-donut-rango">{e.rango}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Género */}
            <div className="sv-demo-block">
              <p className="sv-demo-lbl">POR GÉNERO</p>
              <div className="sv-genero-lista">
                {d.porGenero.map(g => (
                  <div key={g.genero} className="sv-genero-item">
                    <div className="sv-genero-info">
                      <span className="sv-genero-nombre">{g.genero}</span>
                      <span className="sv-genero-pct" style={{ color: g.color }}>{g.pct}%</span>
                    </div>
                    <div className="sv-genero-track">
                      <div className="sv-genero-fill" style={{ width: `${g.pct}%`, background: g.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chisme más caliente */}
            <div className="sv-chisme-top">
              <p className="sv-chisme-top-lbl">🔥 CHISME MÁS POPULAR</p>
              <p className="sv-chisme-top-txt">"{d.chismeTop}"</p>
            </div>
          </div>
        )}

        <p className="sv-nota">* Datos actualizados en tiempo real · Solo para fines satíricos</p>
      </main>

      <SvStyles />
    </div>
  );
}

function SvStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Black+Han+Sans&family=Public+Sans:wght@400;700&family=Courier+Prime:wght@400;700&display=swap');

      :root {
        --f-titulo: 'Black Han Sans', sans-serif;
        --f-bloque: 'Archivo Black', sans-serif;
        --f-cuerpo: 'Public Sans', sans-serif;
        --f-codigo: 'Courier Prime', monospace;
      }

      .sv-root {
        min-height: 100vh; background: #0A0A0A; color: #fff;
        font-family: var(--f-cuerpo); max-width: 480px; margin: 0 auto;
        display: flex; flex-direction: column;
      }

      /* Header */
      .sv-header {
        position: sticky; top: 0; z-index: 10;
        background: #0f0f0f; border-bottom: 1px solid #1a1a1a;
        padding: 12px 16px;
        display: flex; align-items: center; justify-content: space-between; gap: 8px;
      }
      .sv-back {
        background: transparent; border: none; color: #FF6B00;
        font-family: var(--f-bloque); font-size: 11px; cursor: pointer;
        white-space: nowrap;
      }
      .sv-header-center { display: flex; flex-direction: column; align-items: center; flex: 1; }
      .sv-titulo {
        font-family: var(--f-titulo); font-size: 18px; letter-spacing: 2px;
        background: linear-gradient(90deg,#FF6B00,#FFFF00,#FF00AA,#00FF41);
        -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
      }
      .sv-sub { font-family: var(--f-bloque); font-size: 9px; color: #444; letter-spacing: 1px; text-transform: uppercase; }
      .sv-live { font-family: var(--f-bloque); font-size: 10px; color: #FF6B00; letter-spacing: 1px; white-space: nowrap; }

      /* Main */
      .sv-main { flex: 1; padding: 16px 16px 40px; display: flex; flex-direction: column; gap: 16px; }

      /* Hero */
      .sv-hero {
        background: #111; border: 1px solid #2a2a2a; border-radius: 12px;
        padding: 22px 18px; text-align: center; position: relative; overflow: hidden;
      }
      .sv-hero-stripe {
        position: absolute; top: 0; left: 0; right: 0; height: 4px;
        background: linear-gradient(90deg, #FF6B00, #FFFF00, #FF00AA, #00FF41);
      }
      .sv-hero-lbl { font-family: var(--f-bloque); font-size: 10px; color: #555; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px; }
      .sv-hero-num {
        font-family: var(--f-titulo); font-size: clamp(40px, 12vw, 56px);
        color: #FFFF00; line-height: 1; margin-bottom: 4px;
      }
      .sv-hero-sub { font-family: var(--f-bloque); font-size: 11px; color: #444; text-transform: uppercase; letter-spacing: 1px; }

      /* Tabs */
      .sv-tabs { display: flex; gap: 6px; }
      .sv-tab {
        flex: 1; padding: 10px 4px;
        background: #111; border: 1.5px solid #222; border-radius: 8px;
        font-family: var(--f-bloque); font-size: 10px; letter-spacing: 1px;
        color: #555; cursor: pointer; text-transform: uppercase;
        transition: border-color 0.15s, color 0.15s, background 0.15s;
      }
      .sv-tab-on {
        border-color: #FF6B00 !important;
        color: #FF6B00 !important;
        background: rgba(255,107,0,0.08) !important;
      }

      /* Section */
      .sv-section { display: flex; flex-direction: column; gap: 10px; }
      .sv-section-title {
        font-family: var(--f-titulo); font-size: 14px; letter-spacing: 1px;
        color: #fff; margin-bottom: 4px;
      }

      /* Barras de perfiles */
      .sv-barras { display: flex; flex-direction: column; gap: 10px; }
      .sv-barra-item {
        background: #111; border: 1px solid #1a1a1a; border-radius: 10px;
        padding: 10px 12px;
        animation: item-in 0.35s ease both;
      }
      @keyframes item-in { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
      .sv-barra-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 7px; }
      .sv-barra-emoji { font-size: 16px; }
      .sv-barra-nombre { font-family: var(--f-bloque); font-size: 12px; color: #ccc; flex: 1; text-transform: uppercase; }
      .sv-barra-pct { font-family: var(--f-titulo); font-size: 18px; line-height: 1; }
      .sv-barra-track { height: 6px; background: #1a1a1a; border-radius: 3px; overflow: hidden; }
      .sv-barra-fill { height: 100%; border-radius: 3px; transition: width 1s ease; }

      /* Cards de regiones */
      .sv-regiones { display: flex; flex-direction: column; gap: 8px; }
      .sv-region-card {
        background: #111; border: 1px solid #1a1a1a; border-radius: 10px;
        padding: 12px 14px; animation: item-in 0.35s ease both;
      }
      .sv-region-top { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px; }
      .sv-region-nombre { font-family: var(--f-titulo); font-size: 15px; color: #fff; }
      .sv-region-total  { font-family: var(--f-bloque); font-size: 10px; color: #555; }
      .sv-region-bottom { display: flex; align-items: center; gap: 6px; margin-bottom: 7px; }
      .sv-region-lbl    { font-family: var(--f-bloque); font-size: 9px; color: #444; letter-spacing: 1px; text-transform: uppercase; }
      .sv-region-perfil { font-family: var(--f-bloque); font-size: 11px; color: #FF6B00; flex: 1; }
      .sv-region-pct    { font-family: var(--f-titulo); font-size: 16px; color: #FFFF00; }
      .sv-region-bar    { height: 4px; background: #1a1a1a; border-radius: 2px; overflow: hidden; }
      .sv-region-bar-fill { height: 100%; background: linear-gradient(90deg,#FF6B00,#FFFF00); border-radius: 2px; transition: width 1s ease; }

      /* Demografía */
      .sv-demo-block { background: #111; border: 1px solid #1a1a1a; border-radius: 10px; padding: 14px; }
      .sv-demo-lbl { font-family: var(--f-bloque); font-size: 10px; color: #FF6B00; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 12px; }

      /* Donuts de edad */
      .sv-donut-row { display: flex; justify-content: center; gap: 32px; }
      .sv-donut-item { display: flex; flex-direction: column; align-items: center; gap: 8px; }
      .sv-donut-circle {
        width: 80px; height: 80px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
      }
      .sv-donut-inner {
        width: 56px; height: 56px; border-radius: 50%;
        background: #111; display: flex; align-items: center; justify-content: center;
      }
      .sv-donut-num  { font-family: var(--f-titulo); font-size: 18px; color: #FF6B00; }
      .sv-donut-rango { font-family: var(--f-bloque); font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px; }

      /* Género */
      .sv-genero-lista { display: flex; flex-direction: column; gap: 8px; }
      .sv-genero-item  { display: flex; flex-direction: column; gap: 4px; }
      .sv-genero-info  { display: flex; justify-content: space-between; align-items: baseline; }
      .sv-genero-nombre { font-family: var(--f-bloque); font-size: 12px; color: #ccc; text-transform: uppercase; }
      .sv-genero-pct    { font-family: var(--f-titulo); font-size: 16px; }
      .sv-genero-track  { height: 6px; background: #1a1a1a; border-radius: 3px; overflow: hidden; }
      .sv-genero-fill   { height: 100%; border-radius: 3px; transition: width 1s ease; }

      /* Chisme top */
      .sv-chisme-top {
        background: #1a1a1a; border-left: 3px solid #FFFF00;
        border-radius: 0 8px 8px 0; padding: 12px 14px;
      }
      .sv-chisme-top-lbl { font-family: var(--f-bloque); font-size: 10px; color: #FFFF00; letter-spacing: 1px; margin-bottom: 6px; }
      .sv-chisme-top-txt { font-family: var(--f-cuerpo); font-size: 13px; color: #ddd; line-height: 1.5; font-style: italic; }

      /* Nota */
      .sv-nota { font-family: var(--f-bloque); font-size: 9px; color: #2a2a2a; text-align: center; text-transform: uppercase; letter-spacing: 1px; margin-top: 8px; }
    `}</style>
  );
}