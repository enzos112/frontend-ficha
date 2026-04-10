import { useState, useEffect } from "react";
import { PERFILES } from "./data";

export default function ResultView({ perfilId, region, codigo, onReiniciar, onVerCanal }) {
  const [fase, setFase]         = useState("oculto");
  const [selloOn, setSello]     = useState(false);
  const [copied, setCopied]     = useState(false);
  const [chismeEnv, setChismeE] = useState("");
  const [enviando, setEnv]      = useState(false);
  const [chismeOk, setChismeOk] = useState(false);

  const perfil = PERFILES[perfilId] || PERFILES.tranquilo;
  const col    = perfil.color || "#FF6B00";
  const fecha  = new Date().toLocaleDateString("es-PE", { day:"2-digit", month:"long", year:"numeric" });
  const MAX_CH = 280;

  useEffect(() => {
    const t1 = setTimeout(() => setFase("visible"), 80);
    const t2 = setTimeout(() => setSello(true), 700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  async function compartir() {
    const txt = `🇵🇪 Saqué mi ficha: "${perfil.nombre}" en SacaTuFicha.pe\n${perfil.descripcion.slice(0,80)}...\n¡Saca la tuya! (Código: ${codigo})`;
    try {
      if (navigator.share) await navigator.share({ text: txt });
      else { await navigator.clipboard.writeText(txt); setCopied(true); setTimeout(() => setCopied(false), 2500); }
    } catch {}
  }

  async function enviarChisme() {
    if (chismeEnv.trim().length < 20 || enviando) return;
    setEnv(true);
    await new Promise(r => setTimeout(r, 700));
    setEnv(false);
    setChismeOk(true);
    // TODO (Enzo): POST /api/submit-chisme
  }

  return (
    <div className="rv-root">
      {fase === "visible" && <Confeti />}

      {/* Header */}
      <header className="rv-header">
        <span className="rv-logo">Saca tu Ficha</span>
        <div className="rv-header-right">
          <button className="rv-canal-btn" onClick={onVerCanal}>🗞️ Canal</button>
          <span className="rv-badge">RESULTADO</span>
        </div>
      </header>

      <main className="rv-main">
        <p className="rv-intro">Luego de análisis del padrón, se determina:</p>

        {/* ══ CERTIFICADO ══ */}
        <div className={`rv-cert fase-${fase}`} style={{"--col": col}}>
          <div className="rv-cert-stripe" />

          {/* Sello */}
          <div className={`rv-sello ${selloOn ? "rv-sello-on" : ""}`}>
            <p className="rv-s-top">EXPEDIENTE</p>
            <p className="rv-s-cod">{codigo}</p>
            <p className="rv-s-bot">APROBADO</p>
          </div>

          <div className="rv-cert-head">
            <p className="rv-cert-inst">REPÚBLICA DEL PERÚ — RNIF</p>
            <div className="rv-cert-div" style={{background:col}} />
          </div>

          <div className="rv-cert-emoji-wrap" style={{borderColor:col, boxShadow:`0 0 20px ${col}44`}}>
            <span className="rv-cert-emoji">{perfil.emoji}</span>
          </div>

          <p className="rv-tipo-lbl">TIPO DE FICHA IDENTIFICADO</p>
          <h1 className="rv-nombre" style={{color:col, textShadow:`0 0 24px ${col}55`}}>
            {perfil.nombre}
          </h1>
          <p className="rv-desc">{perfil.descripcion}</p>

          {/* Rasgos */}
          <div className="rv-rasgos">
            <p className="rv-rasgos-lbl">RASGOS IDENTIFICADOS</p>
            {perfil.rasgos.map((r,i) => (
              <div key={i} className="rv-rasgo">
                <span style={{color:col,fontSize:8}}>◆</span>
                <span>{r}</span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="rv-cert-footer">
            <div className="rv-cf-col">
              <p className="rv-cf-lbl">DEPARTAMENTO</p>
              <p className="rv-cf-val">{region}</p>
            </div>
            <div className="rv-cf-sep" />
            <div className="rv-cf-col">
              <p className="rv-cf-lbl">EMISIÓN</p>
              <p className="rv-cf-val">{fecha}</p>
            </div>
            <div className="rv-cf-sep" />
            <div className="rv-cf-col">
              <p className="rv-cf-lbl">CÓDIGO</p>
              <p className="rv-cf-val rv-cf-mono" style={{color:col}}>{codigo}</p>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className={`rv-acciones fase-${fase}`}>
          <button className="rv-btn-compartir" style={{background:col}} onClick={compartir}>
            {copied ? "✓ COPIADO" : "📤 COMPARTIR MI FICHA"}
          </button>
          <button className="rv-btn-otra" onClick={onReiniciar}>Sacar otra ficha →</button>
        </div>

        {/* ══ SECCIÓN: Enviar chisme al canal (premio por completar) ══ */}
        <div className={`rv-chisme-sec fase-${fase}`}>
          <div className="rv-chisme-sec-stripe" />
          <p className="rv-chisme-sec-titulo">🎉 ¡COMPLETASTE TUS 20 PREGUNTAS!</p>
          <p className="rv-chisme-sec-sub">
            Te ganaste el derecho a soltar un chisme al canal.
            Si pasa la revisión, lo verán todos los que saquen su ficha.
          </p>

          {!chismeOk ? (
            <>
              <div className="rv-ta-wrap">
                <textarea
                  className="rv-textarea"
                  placeholder="Suelta el chisme de la realidad peruana... (mín. 20 caracteres)"
                  value={chismeEnv}
                  onChange={e => setChismeE(e.target.value.slice(0, MAX_CH))}
                  rows={4}
                />
                <span className={`rv-chars ${chismeEnv.length >= MAX_CH * 0.9 ? "rv-chars-warn" : ""}`}>
                  {chismeEnv.length}/{MAX_CH}
                </span>
              </div>
              <button
                className={`rv-btn-soltar ${chismeEnv.trim().length < 20 || enviando ? "rv-btn-off" : ""}`}
                onClick={enviarChisme}
                disabled={chismeEnv.trim().length < 20 || enviando}
              >
                {enviando ? "ENVIANDO..." : "🔥 SOLTAR AL CANAL"}
              </button>
              <button className="rv-btn-skip" onClick={onVerCanal}>
                Ver el canal de chismes →
              </button>
            </>
          ) : (
            <div className="rv-chisme-ok">
              <span className="rv-ok-icon">🔥</span>
              <p className="rv-ok-titulo">¡CHISME RECIBIDO!</p>
              <p className="rv-ok-sub">Pendiente de revisión. Si pasa, aparece en el canal.</p>
              <button className="rv-btn-canal" onClick={onVerCanal}>Ver el canal →</button>
            </div>
          )}
        </div>
      </main>

      <RvStyles />
    </div>
  );
}

function Confeti() {
  const piezas = Array.from({length:20},(_,i) => ({
    id:i, color:["#FF6B00","#FFFF00","#FF00AA","#00FF41","#fff"][i%5],
    left:`${i*5}%`, delay:`${(i*0.1).toFixed(1)}s`, size: 6+(i%4)*2,
  }));
  return (
    <div style={{position:"fixed",top:0,left:0,width:"100%",pointerEvents:"none",zIndex:20}}>
      {piezas.map(p => (
        <div key={p.id} style={{
          position:"absolute",top:-20,left:p.left,
          width:p.size,height:p.size*0.55,background:p.color,borderRadius:2,
          animation:`rv-caer 3s ease-in ${p.delay} forwards`,
        }} />
      ))}
      <style>{`@keyframes rv-caer{0%{transform:translateY(0) rotate(0);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}`}</style>
    </div>
  );
}

function RvStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Public+Sans:wght@400;600;700&family=Special+Elite&family=Courier+Prime:wght@400;700&display=swap');

      .rv-root { min-height:100vh;background:#0A0A0A;color:#fff;font-family:'Public Sans',sans-serif;max-width:480px;margin:0 auto;overflow-x:hidden; }

      .rv-header { position:sticky;top:0;z-index:10;background:#0f0f0f;border-bottom:1px solid #1a1a1a;padding:10px 16px;display:flex;justify-content:space-between;align-items:center; }
      .rv-logo   { font-family:'Bebas Neue',sans-serif;font-size:17px;letter-spacing:2px;background:linear-gradient(90deg,#FF6B00,#FF00AA);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text; }
      .rv-header-right { display:flex;align-items:center;gap:8px; }
      .rv-canal-btn { background:#1a1a1a;border:1px solid #333;border-radius:16px;padding:4px 10px;font-family:'Courier Prime',monospace;font-size:10px;color:#FF6B00;cursor:pointer; }
      .rv-badge     { font-family:'Courier Prime',monospace;font-size:9px;color:#FFFF00;border:1px solid #FFFF00;padding:3px 7px;opacity:0.8; }

      .rv-main { padding:18px 16px 48px;display:flex;flex-direction:column;gap:18px; }
      .rv-intro { font-family:'Courier Prime',monospace;font-size:10px;color:#555;text-align:center;letter-spacing:1px; }

      /* Certificado */
      .rv-cert { background:#111;border:1px solid #2a2a2a;border-radius:12px;padding:26px 18px 20px;position:relative;overflow:hidden;transition:opacity 0.5s,transform 0.5s; }
      .fase-oculto  { opacity:0;transform:scale(0.95); }
      .fase-visible { opacity:1;transform:scale(1); }

      .rv-cert-stripe { position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#FF6B00,#FFFF00,#FF00AA,#00FF41); }

      /* Sello */
      .rv-sello { position:absolute;top:18px;right:14px;width:72px;height:72px;border:2.5px solid var(--col);border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;transform:scale(3) rotate(-20deg);transition:opacity 0.25s,transform 0.4s cubic-bezier(0.175,0.885,0.32,1.275);z-index:2; }
      .rv-sello-on { opacity:0.85 !important;transform:scale(1) rotate(-20deg) !important; }
      .rv-s-top,.rv-s-bot { font-family:'Courier Prime',monospace;font-size:7px;color:var(--col);letter-spacing:1px;font-weight:700; }
      .rv-s-cod { font-family:'Courier Prime',monospace;font-size:9px;font-weight:700;color:var(--col); }

      .rv-cert-head { text-align:center;margin-bottom:16px; }
      .rv-cert-inst { font-family:'Courier Prime',monospace;font-size:9px;color:#555;letter-spacing:2px;margin-bottom:7px; }
      .rv-cert-div  { height:2px;width:50%;margin:0 auto;border-radius:1px;opacity:0.6; }

      .rv-cert-emoji-wrap { width:76px;height:76px;border-radius:50%;border:2px solid;background:#1a1a1a;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;transition:box-shadow 0.3s; }
      .rv-cert-emoji { font-size:34px;line-height:1; }

      .rv-tipo-lbl { font-family:'Courier Prime',monospace;font-size:9px;color:#555;letter-spacing:2px;text-align:center;margin-bottom:6px; }
      .rv-nombre   { font-family:'Bebas Neue',sans-serif;font-size:clamp(30px,9vw,42px);letter-spacing:4px;text-align:center;line-height:1.1;margin-bottom:10px; }
      .rv-desc     { font-family:'Special Elite',system-ui;font-size:13px;color:#bbb;text-align:center;line-height:1.55;font-style:italic;margin-bottom:16px; }

      .rv-rasgos     { border-top:1px solid #1a1a1a;border-bottom:1px solid #1a1a1a;padding:12px 0;margin-bottom:16px; }
      .rv-rasgos-lbl { font-family:'Courier Prime',monospace;font-size:9px;color:#444;letter-spacing:2px;text-align:center;margin-bottom:8px; }
      .rv-rasgo      { display:flex;align-items:baseline;gap:8px;font-family:'Public Sans',sans-serif;font-size:13px;color:#bbb;margin-bottom:4px; }

      .rv-cert-footer { display:flex;justify-content:center;flex-wrap:wrap;gap:0;margin-bottom:0; }
      .rv-cf-col { flex:1;min-width:80px;text-align:center;padding:0 8px; }
      .rv-cf-sep { width:1px;background:#1a1a1a;margin:4px 0; }
      .rv-cf-lbl { font-family:'Courier Prime',monospace;font-size:8px;color:#444;letter-spacing:1.5px;margin-bottom:3px; }
      .rv-cf-val { font-family:'Public Sans',sans-serif;font-size:12px;font-weight:700;color:#fff; }
      .rv-cf-mono { font-family:'Courier Prime',monospace !important; }

      /* Acciones */
      .rv-acciones { display:flex;flex-direction:column;gap:10px;align-items:center;transition:opacity 0.5s 0.3s; }
      .rv-acciones.fase-oculto  { opacity:0; }
      .rv-acciones.fase-visible { opacity:1; }

      .rv-btn-compartir { width:100%;padding:15px;border:none;border-radius:8px;font-family:'Bebas Neue',sans-serif;font-size:19px;letter-spacing:3px;cursor:pointer;color:#000;transition:opacity 0.2s,transform 0.1s; }
      .rv-btn-compartir:active { transform:scale(0.97); }
      .rv-btn-otra { background:transparent;border:1px solid #2a2a2a;border-radius:8px;padding:10px 24px;font-family:'Public Sans',sans-serif;font-size:13px;color:#555;cursor:pointer;transition:border-color 0.2s,color 0.2s; }
      .rv-btn-otra:hover { border-color:#FF6B00;color:#FF6B00; }

      /* Sección chisme */
      .rv-chisme-sec { background:#111;border:1px solid #222;border-radius:12px;padding:20px 18px;position:relative;overflow:hidden;transition:opacity 0.5s 0.5s; }
      .rv-chisme-sec.fase-oculto  { opacity:0; }
      .rv-chisme-sec.fase-visible { opacity:1; }
      .rv-chisme-sec-stripe { position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#FF6B00,#FFFF00,#FF00AA,#00FF41); }
      .rv-chisme-sec-titulo { font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:2px;color:#FFFF00;margin-bottom:6px; }
      .rv-chisme-sec-sub    { font-family:'Special Elite',system-ui;font-size:13px;color:#777;line-height:1.5;font-style:italic;margin-bottom:14px; }

      .rv-ta-wrap  { position:relative;margin-bottom:10px; }
      .rv-textarea { width:100%;padding:12px 14px;background:#1a1a1a;border:1px solid #333;border-radius:8px;color:#fff;font-family:'Public Sans',sans-serif;font-size:14px;line-height:1.5;resize:none;min-height:96px;outline:none;transition:border-color 0.2s; }
      .rv-textarea:focus { border-color:#FF6B00; }
      .rv-textarea::placeholder { color:#444;font-style:italic; }
      .rv-chars      { position:absolute;bottom:8px;right:10px;font-family:'Courier Prime',monospace;font-size:10px;color:#444; }
      .rv-chars-warn { color:#FF6B00 !important; }

      .rv-btn-soltar { width:100%;padding:14px;background:#FF6B00;color:#000;border:none;border-radius:8px;font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:2px;cursor:pointer;margin-bottom:8px;transition:opacity 0.2s; }
      .rv-btn-off    { opacity:0.35 !important;cursor:not-allowed !important; }
      .rv-btn-skip   { background:transparent;border:none;font-family:'Courier Prime',monospace;font-size:11px;color:#444;cursor:pointer;text-decoration:underline;width:100%;text-align:center; }
      .rv-btn-skip:hover { color:#888; }

      .rv-chisme-ok { display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center;padding:10px 0; }
      .rv-ok-icon   { font-size:40px;animation:pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275); }
      @keyframes pop { from{transform:scale(0)} to{transform:scale(1)} }
      .rv-ok-titulo { font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:2px;color:#00FF41; }
      .rv-ok-sub    { font-family:'Special Elite',system-ui;font-size:13px;color:#666;font-style:italic; }
      .rv-btn-canal { background:transparent;border:1px solid #00FF41;border-radius:8px;padding:10px 20px;font-family:'Courier Prime',monospace;font-size:11px;color:#00FF41;cursor:pointer; }
    `}</style>
  );
}