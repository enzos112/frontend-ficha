import { useState, useEffect } from "react";

// ── CONFIGURACIÓN DE REACCIONES ───────────────────────────────────────────
const EMOJIS_REACCION = [
  { key: 'risa',     char: '😂' },
  { key: 'enojo',    char: '😡' }, 
  { key: 'fuego',    char: '🔥' },
  { key: 'sorpresa', char: '😱' }
];

// ─── Vista: solo un chisme (intersticial durante el quiz) ───────────────────
export function ChismeIntersticial({ chisme, sesionId, onClose }) {
  // Paracaídas para inicializar todos los contadores en 0 si no vienen de la BD
  const initialReactions = chisme?.reacciones || { risa: 0, enojo: 0, fuego: 0, sorpresa: 0 };
  const [reacciones, setReac] = useState(initialReactions);
  const [yaReaccione, setYaR] = useState(null);

  async function reaccionar(key) {
    const esMismo = yaReaccione === key;
    const anterior = yaReaccione;

    // 1. Actualización visual rápida (Optimistic UI)
    setReac(prev => {
      let nuevo = { ...prev };
      if (esMismo) {
        nuevo[key] = Math.max(0, (nuevo[key] || 0) - 1);
      } else {
        if (anterior) nuevo[anterior] = Math.max(0, (nuevo[anterior] || 0) - 1);
        nuevo[key] = (nuevo[key] || 0) + 1;
      }
      return nuevo;
    });

    setYaR(esMismo ? null : key);

    // 2. Sincronización con Neon
    try {
      await fetch('/api/save-reaccion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          uuid: sesionId, 
          chisme_id: chisme.id, 
          emoji_key: key 
        })
      });
    } catch (err) {
      console.error("Error al sincronizar reacción:", err);
    }
  }

  if (!chisme) return null;

  return (
    <div className="ci-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ci-box">
        <div className="ci-top-stripe" />
        <div className="ci-header">
          <span className="ci-dot dot-naranja" />
          <span className="ci-titulo">CHISME DEL PADRÓN</span>
          <button className="ci-close" onClick={onClose}>✕</button>
        </div>
        <div className="ci-body">
          <div className="ci-sello">FILTRADO</div>
          <p className="ci-region">{chisme.region || 'Nacional'}</p>
          <blockquote className="ci-quote">
            <span className="ci-comilla">"</span>
            {chisme.texto}
            <span className="ci-comilla">"</span>
          </blockquote>
          <div className="ci-reacciones">
            {EMOJIS_REACCION.map(r => (
              <button
                key={r.key}
                className={`ci-reac-btn ${yaReaccione === r.key ? "ci-reac-active" : ""}`}
                onClick={() => reaccionar(r.key)}
              >
                <span className="ci-reac-emoji">{r.char}</span>
                <span className="ci-reac-num">{reacciones[r.key] || 0}</span>
              </button>
            ))}
          </div>
        </div>
        <button className="ci-continuar" onClick={onClose}>CONTINUAR TRÁMITE →</button>
        <CiStyles />
      </div>
    </div>
  );
}

// ─── Vista: canal de chismes completo ──────────────────────────────────────
export function ChismesCanal({ chismesExtra = [], sesionId, onNuevoChisme, onClose }) {
  const [todos, setTodos]       = useState([...chismesExtra]);
  const [yaReaccioné, setYaR]   = useState({}); // { "id-key": true }
  const [vistaEnvio, setVistaE] = useState(false);
  const [texto, setTexto]       = useState("");
  const [region, setRegion]     = useState("Nacional");
  const [enviando, setEnv]      = useState(false);
  const [enviado, setEnviado]   = useState(false);
  const MAX = 280;

  useEffect(() => {
    setTodos(chismesExtra);
  }, [chismesExtra]);

  async function handleCanalReaccion(id, key) {
    const mapKey = `${id}-${key}`;
    if (yaReaccioné[mapKey]) return;

    setYaR(prev => ({ ...prev, [mapKey]: true }));
    setTodos(prev => prev.map(c =>
      c.id === id ? { ...c, reacciones: { ...c.reacciones, [key]: (c.reacciones?.[key] || 0) + 1 } } : c
    ));

    try {
      await fetch('/api/save-reaccion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uuid: sesionId, chisme_id: id, emoji_key: key })
      });
    } catch (err) {
      console.error("Error en reacción canal:", err);
    }
  }

  async function enviarChisme() {
    if (texto.trim().length < 20) return;
    setEnv(true);
    
    const nuevo = {
      texto: texto.trim(),
      region,
      reacciones: { risa: 0, enojo: 0, fuego: 0, sorpresa: 0 },
      nuevo: true,
    };

    await onNuevoChisme?.(nuevo.texto); // Enviamos solo el texto al padre para el fetch

    setTodos(prev => [nuevo, ...prev]);
    setTexto(""); setEnv(false); setEnviado(true); setVistaE(false);
    setTimeout(() => setEnviado(false), 3000);
  }

  return (
    <div className="cc-root">
      <div className="cc-header">
        <button className="cc-back" onClick={onClose}>← Volver</button>
        <div className="cc-header-center">
          <span className="cc-titulo">🗞️ CANAL DE CHISMES</span>
          <span className="cc-subtitle">{todos.length} reportes del padrón</span>
        </div>
        <button className="cc-nuevo-btn" onClick={() => setVistaE(true)}>+ Soltar</button>
      </div>

      {enviado && <div className="cc-toast">✓ ¡Chisme recibido! Pendiente de revisión 🔥</div>}

      <div className="cc-lista">
        {todos.length === 0 && <p style={{textAlign:'center', color:'#333', marginTop: '40px', fontFamily: 'Courier Prime'}}>No hay chismes en esta zona... aún.</p>}
        {todos.map((c, i) => (
          <div key={c.id || i} className={`cc-item ${c.nuevo ? "cc-item-nuevo" : ""}`}
            style={{ animationDelay: `${i * 30}ms` }}>
            {c.nuevo && <div className="cc-nuevo-badge">NUEVO</div>}
            <div className="cc-item-header">
              <span className="cc-item-region">{c.region || 'Nacional'}</span>
              <span className="cc-item-dot" />
            </div>
            <p className="cc-item-txt">{c.texto}</p>
            <div className="cc-item-reac">
              {EMOJIS_REACCION.map(r => (
                <button
                  key={r.key}
                  className={`cc-reac-btn ${yaReaccioné[`${c.id}-${r.key}`] ? "cc-reac-on" : ""}`}
                  onClick={() => handleCanalReaccion(c.id, r.key)}
                >
                  {r.char} <span>{c.reacciones?.[r.key] || 0}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {vistaEnvio && (
        <div className="cc-sheet-overlay" onClick={e => e.target === e.currentTarget && setVistaE(false)}>
          <div className="cc-sheet">
            <div className="cc-sheet-handle" />
            <p className="cc-sheet-titulo">SOLTAR CHISME AL PADRÓN</p>
            <p className="cc-sheet-sub">Sin nombres. Se revisa antes de aparecer.</p>
            <div className="cc-ta-wrap">
              <textarea
                className="cc-textarea"
                placeholder="Escribe el chisme de la realidad peruana..."
                value={texto}
                onChange={e => setTexto(e.target.value.slice(0, MAX))}
                rows={4}
              />
              <span className={`cc-chars ${texto.length >= MAX * 0.9 ? "cc-chars-warn" : ""}`}>
                {texto.length}/{MAX}
              </span>
            </div>
            <div className="cc-region-row">
              <span className="cc-region-lbl">REGIÓN:</span>
              <select className="cc-region-sel" value={region} onChange={e => setRegion(e.target.value)}>
                {["Nacional","Lima","Arequipa","Cusco","Piura","Cajamarca","Otro"].map(r =>
                  <option key={r} value={r}>{r}</option>
                )}
              </select>
            </div>
            {texto.trim().length < 20 && texto.length > 0 && (
              <p className="cc-error">Mínimo 20 caracteres pe 🫠</p>
            )}
            <div className="cc-sheet-btns">
              <button className="cc-btn-enviar" onClick={enviarChisme} disabled={enviando || texto.trim().length < 20}>
                {enviando ? "ENVIANDO..." : "🔥 SOLTAR CHISME"}
              </button>
              <button className="cc-btn-cancel" onClick={() => setVistaE(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
      <CcStyles />
    </div>
  );
}

export default function ChismeModal({ chisme, soloVer, sesionId, onClose, chismesExtra, onNuevoChisme }) {
  if (soloVer && chisme) return <ChismeIntersticial chisme={chisme} sesionId={sesionId} onClose={onClose} />;
  return <ChismesCanal chismesExtra={chismesExtra} sesionId={sesionId} onNuevoChisme={onNuevoChisme} onClose={onClose} />;
}

// ─── Estilos intersticial ───────────────────────────────────────────────────
function CiStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Public+Sans:wght@400;600;700&family=Special+Elite&family=Courier+Prime:wght@400;700&display=swap');
      .ci-overlay {
        position: fixed; inset: 0; background: rgba(0,0,0,0.88); z-index: 200;
        display: flex; align-items: flex-end; justify-content: center;
        animation: fade-in 0.2s ease;
      }
      @keyframes fade-in { from{opacity:0} to{opacity:1} }
      .ci-box {
        width: 100%; max-width: 480px; background: #111;
        border-radius: 16px 16px 0 0; overflow: hidden;
        animation: slide-up 0.35s cubic-bezier(0.175,0.885,0.32,1.275);
      }
      @keyframes slide-up { from{transform:translateY(100%)} to{transform:translateY(0)} }
      .ci-top-stripe { height: 3px; background: linear-gradient(90deg,#FF6B00,#FFFF00,#FF00AA,#00FF41); }
      .ci-header {
        display: flex; align-items: center; gap: 8px; padding: 12px 16px;
        border-bottom: 1px solid #1a1a1a;
      }
      .ci-dot { width:6px;height:6px;border-radius:50%; }
      .dot-naranja { background:#FF6B00; }
      .ci-titulo { font-family:'Courier Prime',monospace; font-size:10px; font-weight:700; letter-spacing:2px; color:#FF6B00; flex:1; }
      .ci-close  { background:transparent;border:none;color:#444;font-size:16px;cursor:pointer;padding:0 4px; }
      .ci-close:hover { color:#fff; }
      .ci-body { padding: 20px 18px 16px; position:relative; }
      .ci-sello {
        position:absolute;top:16px;right:16px;border:2px solid #FF00AA;color:#FF00AA;
        font-family:'Special Elite',system-ui;font-size:9px;letter-spacing:2px;
        padding:3px 7px;transform:rotate(6deg);opacity:0.7;
      }
      .ci-region { font-family:'Courier Prime',monospace;font-size:9px;color:#555;letter-spacing:2px;margin-bottom:10px; }
      .ci-quote {
        font-family:'Special Elite',system-ui;font-size:16px;color:#fff;line-height:1.55;
        background:#1a1a1a;border-left:3px solid #FFFF00;padding:14px 16px;
        border-radius:0 8px 8px 0;font-style:italic;margin-bottom:16px;
      }
      .ci-comilla { color:#FFFF00;font-size:1.3em;line-height:0;vertical-align:-0.2em;font-style:normal; }
      .ci-reacciones { display:grid; grid-template-columns: repeat(4, 1fr); gap:8px; }
      .ci-reac-btn {
        padding:10px 4px;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;
        display:flex;flex-direction:column;align-items:center;gap:2px;cursor:pointer;
        transition:border-color 0.2s,transform 0.1s;
      }
      .ci-reac-btn:hover { border-color:#444; }
      .ci-reac-btn:active { transform:scale(0.95); }
      .ci-reac-active { border-color:#FF6B00 !important;background:rgba(255,107,0,0.1) !important; }
      .ci-reac-emoji { font-size:20px; }
      .ci-reac-num { font-family:'Courier Prime',monospace;font-size:10px;color:#888; }
      .ci-continuar {
        width:100%;padding:14px;background:#FF6B00;color:#000;border:none;
        font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:3px;cursor:pointer;
        transition:opacity 0.2s;
      }
      .ci-continuar:hover { opacity:0.9; }
    `}</style>
  );
}

// ─── Estilos canal ──────────────────────────────────────────────────────────
function CcStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Public+Sans:wght@400;600;700&family=Special+Elite&family=Courier+Prime:wght@400;700&display=swap');
      .cc-root {
        min-height:100vh;background:#0A0A0A;color:#fff;
        font-family:'Public Sans',sans-serif;max-width:480px;margin:0 auto;
        display:flex;flex-direction:column;
      }
      .cc-header {
        position:sticky;top:0;z-index:10;background:#0f0f0f;
        border-bottom:1px solid #1a1a1a;padding:12px 16px;
        display:flex;align-items:center;justify-content:space-between;gap:10px;
      }
      .cc-back { background:transparent;border:none;color:#FF6B00;font-family:'Courier Prime',monospace;font-size:12px;cursor:pointer;white-space:nowrap; }
      .cc-header-center { display:flex;flex-direction:column;align-items:center;gap:2px;flex:1; }
      .cc-titulo  { font-family:'Bebas Neue',sans-serif;font-size:16px;letter-spacing:2px;color:#fff; }
      .cc-subtitle{ font-family:'Courier Prime',monospace;font-size:9px;color:#555; }
      .cc-nuevo-btn {
        background:#FF6B00;color:#000;border:none;border-radius:6px;
        font-family:'Bebas Neue',sans-serif;font-size:14px;letter-spacing:1px;
        padding:6px 10px;cursor:pointer;white-space:nowrap;
      }
      .cc-toast { background:#00FF41;color:#000;font-family:'Courier Prime',monospace;font-size:11px; font-weight:700;text-align:center;padding:10px;letter-spacing:1px; animation:toast-in 0.3s ease; }
      @keyframes toast-in { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
      .cc-lista { flex:1;padding:12px 16px;display:flex;flex-direction:column;gap:10px; }
      .cc-item { background:#111;border:1px solid #1a1a1a;border-radius:12px;padding:14px 14px 10px; position:relative;overflow:hidden; animation:item-in 0.3s ease both; }
      @keyframes item-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      .cc-item-nuevo { border-color:#FF6B00 !important; }
      .cc-nuevo-badge { position:absolute;top:0;right:0;background:#FF6B00;color:#000; font-family:'Bebas Neue',sans-serif;font-size:10px;letter-spacing:1px; padding:2px 8px;border-radius:0 12px 0 8px; }
      .cc-item-header { display:flex;align-items:center;gap:8px;margin-bottom:8px; }
      .cc-item-region { font-family:'Courier Prime',monospace;font-size:9px;color:#FF6B00;letter-spacing:1.5px; }
      .cc-item-dot    { width:4px;height:4px;border-radius:50%;background:#333; }
      .cc-item-txt    { font-family:'Special Elite',system-ui;font-size:14px;color:#ddd;line-height:1.5;margin-bottom:10px; }
      .cc-item-reac   { display:flex;gap:6px; }
      .cc-reac-btn { display:flex;align-items:center;gap:4px;padding:5px 10px; background:#1a1a1a;border:1px solid #2a2a2a;border-radius:20px; font-family:'Courier Prime',monospace;font-size:11px;color:#888; cursor:pointer;transition:border-color 0.15s,transform 0.1s; }
      .cc-reac-on { border-color:#FF6B00 !important;color:#FF6B00 !important;background:rgba(255,107,0,0.1) !important; }
      .cc-sheet-overlay { position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:100; display:flex;align-items:flex-end;justify-content:center; animation:fade-in 0.2s ease; }
      .cc-sheet { width:100%;max-width:480px;background:#111;border-radius:16px 16px 0 0; padding:16px 18px 32px;animation:slide-up 0.3s cubic-bezier(0.175,0.885,0.32,1.275); }
      .cc-sheet-handle { width:40px;height:4px;background:#333;border-radius:2px;margin:0 auto 16px; }
      .cc-sheet-titulo { font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:2px;color:#FF6B00;margin-bottom:4px; }
      .cc-sheet-sub    { font-family:'Special Elite',system-ui;font-size:12px;color:#555;font-style:italic;margin-bottom:12px; }
      .cc-ta-wrap      { position:relative;margin-bottom:10px; }
      .cc-textarea { width:100%;padding:12px 14px;background:#1a1a1a;border:1px solid #333;border-radius:8px; color:#fff;font-family:'Public Sans',sans-serif;font-size:14px;line-height:1.5; resize:none;min-height:100px;outline:none; }
      .cc-chars { position:absolute;bottom:8px;right:10px;font-family:'Courier Prime',monospace;font-size:10px;color:#444; }
      .cc-region-row { display:flex;align-items:center;gap:10px;margin-bottom:12px; }
      .cc-region-lbl { font-family:'Courier Prime',monospace;font-size:10px;color:#555;letter-spacing:1px; }
      .cc-region-sel { flex:1;padding:8px 12px;background:#1a1a1a;border:1px solid #333;border-radius:6px; color:#fff; }
      .cc-btn-enviar { width:100%;padding:14px;background:#FF6B00;color:#000;border:none;border-radius:8px; font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:2px;cursor:pointer; }
    `}</style>
  );
}