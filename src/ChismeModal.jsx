import { useState } from "react";

export default function ChismeModal({ chisme, onClose, onEnviarChisme }) {
  const [vista, setVista]         = useState("chisme");
  const [texto, setTexto]         = useState("");
  const [enviando, setEnviando]   = useState(false);
  const [error, setError]         = useState("");
  const MAX = 280;

  async function handleEnviar() {
    if (texto.trim().length < 20) { setError("Mínimo 20 caracteres pe, ¿qué chisme es ese?"); return; }
    if (!onEnviarChisme) { setVista("gracias"); return; }
    setEnviando(true); setError("");
    try { await onEnviarChisme(texto.trim()); setVista("gracias"); }
    catch { setError("Se cayó el sistema. Intenta de nuevo."); }
    finally { setEnviando(false); }
  }

  return (
    <div className="cm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="cm-box" role="dialog" aria-modal="true">

        {/* Cinta */}
        <div className="cm-cinta">
          <div className="cm-cinta-left">
            <span className="dot dot-naranja" />
            <span className="cm-cinta-txt">CHISME OFICIAL DEL PADRÓN</span>
          </div>
          <button className="cm-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        {/* ── CHISME ── */}
        {vista === "chisme" && (
          <div className="cm-body">
            <div className="cm-sello-filtrado">FILTRADO</div>
            <p className="cm-sub-lbl">MIENTRAS TANTO, EN EL ARCHIVO SECRETO...</p>
            <blockquote className="cm-quote">
              <span className="cm-comilla">"</span>
              {chisme.texto}
              <span className="cm-comilla">"</span>
            </blockquote>
            {chisme.autor_region && (
              <p className="cm-autor">— Fuente anónima de {chisme.autor_region}</p>
            )}
            <div className="cm-sep" />
            <button className="cm-btn-main" onClick={onClose}>
              CONTINUAR MI TRÁMITE →
            </button>
            <button className="cm-btn-link" onClick={() => setVista("enviar")}>
              ¿Tienes un chisme? Suéltalo aquí
            </button>
          </div>
        )}

        {/* ── ENVIAR ── */}
        {vista === "enviar" && (
          <div className="cm-body">
            <p className="cm-sub-lbl">DECLARACIÓN ANÓNIMA AL PADRÓN</p>
            <p className="cm-enviar-sub">Sin nombres propios. Se revisa antes de publicar.</p>
            <div className="cm-ta-wrap">
              <textarea
                className="cm-textarea"
                placeholder="Suelta el chisme de la realidad peruana..."
                value={texto}
                onChange={e => { setTexto(e.target.value.slice(0, MAX)); setError(""); }}
                rows={5}
              />
              <span className={`cm-chars ${texto.length >= MAX * 0.9 ? "chars-warn" : ""}`}>
                {texto.length}/{MAX}
              </span>
            </div>
            {error && <p className="cm-error">{error}</p>}
            <button
              className={`cm-btn-main ${enviando ? "cm-btn-loading" : ""}`}
              onClick={handleEnviar}
              disabled={enviando}
            >
              {enviando ? "ENVIANDO..." : "PRESENTAR DECLARACIÓN"}
            </button>
            <button className="cm-btn-link" onClick={() => { setVista("chisme"); setError(""); }}>
              ← Volver al chisme
            </button>
          </div>
        )}

        {/* ── GRACIAS ── */}
        {vista === "gracias" && (
          <div className="cm-body cm-gracias">
            <div className="cm-gracias-icon">✓</div>
            <p className="cm-gracias-titulo">¡DECLARACIÓN RECIBIDA!</p>
            <p className="cm-gracias-sub">
              Tu chisme será revisado por el comité de fiscalización.
              Si pasa, entra al padrón.
            </p>
            <button className="cm-btn-main" onClick={onClose}>
              CONTINUAR MI TRÁMITE →
            </button>
          </div>
        )}
      </div>

      <ChismeStyles />
    </div>
  );
}

function ChismeStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Public+Sans:wght@400;600;700&family=Special+Elite&family=Courier+Prime:wght@400;700&display=swap');

      .cm-overlay {
        position: fixed; inset:0;
        background: rgba(0,0,0,0.85);
        z-index: 100;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        padding: 0;
        animation: overlay-in 0.2s ease;
      }
      @keyframes overlay-in { from{opacity:0} to{opacity:1} }

      .cm-box {
        background: #111;
        width: 100%;
        max-width: 480px;
        border-radius: 16px 16px 0 0;
        border-top: 3px solid transparent;
        border-image: linear-gradient(90deg,#FF6B00,#FFFF00,#FF00AA,#00FF41) 1;
        border-image-slice: 1;
        border-radius: 16px 16px 0 0;
        overflow: hidden;
        animation: slide-up 0.35s cubic-bezier(0.175,0.885,0.32,1.275);
        max-height: 90vh;
        overflow-y: auto;
      }
      @keyframes slide-up {
        from { transform: translateY(100%); }
        to   { transform: translateY(0); }
      }

      /* Workaround para border-radius + border-image */
      .cm-box { position: relative; }
      .cm-box::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 3px;
        background: linear-gradient(90deg,#FF6B00,#FFFF00,#FF00AA,#00FF41);
      }

      .cm-cinta {
        background: #0f0f0f;
        padding: 12px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #1a1a1a;
      }
      .cm-cinta-left { display:flex; align-items:center; gap:8px; }
      .cm-cinta-txt {
        font-family: 'Courier Prime', monospace;
        font-size: 10px;
        font-weight: 700;
        color: #FF6B00;
        letter-spacing: 2px;
      }
      .dot { width:6px; height:6px; border-radius:50%; display:inline-block; }
      .dot-naranja { background: #FF6B00; }
      .cm-close {
        background: transparent; border:none;
        color: #444; font-size:16px; cursor:pointer;
        transition: color 0.2s; line-height:1; padding:0 4px;
      }
      .cm-close:hover { color: #fff; }

      .cm-body {
        padding: 22px 18px 28px;
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      /* Sello filtrado */
      .cm-sello-filtrado {
        position: absolute;
        top: 16px; right: 16px;
        border: 2px solid #FF00AA;
        color: #FF00AA;
        font-family: 'Special Elite', system-ui;
        font-size: 10px;
        letter-spacing: 2px;
        padding: 3px 8px;
        transform: rotate(6deg);
        opacity: 0.75;
      }

      .cm-sub-lbl {
        font-family: 'Courier Prime', monospace;
        font-size: 9px;
        color: #555;
        letter-spacing: 2px;
      }

      .cm-quote {
        font-family: 'Special Elite', system-ui;
        font-size: 16px;
        color: #fff;
        line-height: 1.55;
        background: #1a1a1a;
        border-left: 3px solid #FFFF00;
        padding: 14px 16px;
        border-radius: 0 8px 8px 0;
        font-style: italic;
      }
      .cm-comilla { color: #FFFF00; font-size: 1.3em; line-height:0; vertical-align:-0.2em; font-style:normal; }

      .cm-autor {
        font-family: 'Courier Prime', monospace;
        font-size: 10px;
        color: #444;
        text-align: right;
        margin-top: -6px;
      }

      .cm-sep {
        height: 1px;
        background: linear-gradient(90deg, transparent, #2a2a2a, transparent);
      }

      .cm-btn-main {
        width: 100%;
        padding: 14px;
        background: #FF6B00;
        color: #000;
        border: none;
        border-radius: 8px;
        font-family: 'Bebas Neue', sans-serif;
        font-size: 18px;
        letter-spacing: 3px;
        cursor: pointer;
        transition: opacity 0.2s, transform 0.1s;
      }
      .cm-btn-main:hover:not(:disabled) { opacity: 0.9; }
      .cm-btn-main:active:not(:disabled) { transform: scale(0.97); }
      .cm-btn-main:disabled { opacity: 0.5; cursor: not-allowed; }
      .cm-btn-loading { opacity: 0.65 !important; }

      .cm-btn-link {
        background: transparent; border:none;
        font-family: 'Courier Prime', monospace;
        font-size: 11px;
        color: #444;
        cursor: pointer;
        text-decoration: underline;
        text-align: center;
        transition: color 0.2s;
      }
      .cm-btn-link:hover { color: #888; }

      /* Textarea */
      .cm-enviar-sub {
        font-family: 'Special Elite', system-ui;
        font-size: 13px;
        color: #666;
        font-style: italic;
      }
      .cm-ta-wrap { position: relative; }
      .cm-textarea {
        width: 100%;
        padding: 12px 14px;
        background: #1a1a1a;
        border: 1px solid #333;
        border-radius: 8px;
        color: #fff;
        font-family: 'Public Sans', sans-serif;
        font-size: 14px;
        line-height: 1.55;
        resize: vertical;
        min-height: 110px;
        outline: none;
        transition: border-color 0.2s;
      }
      .cm-textarea:focus { border-color: #FF6B00; }
      .cm-textarea::placeholder { color: #444; font-style: italic; }
      .cm-chars {
        position: absolute;
        bottom: 8px; right: 10px;
        font-family: 'Courier Prime', monospace;
        font-size: 10px;
        color: #444;
      }
      .chars-warn { color: #FF6B00 !important; }

      .cm-error {
        font-family: 'Courier Prime', monospace;
        font-size: 11px;
        color: #FF00AA;
        background: #1a0a14;
        border-left: 3px solid #FF00AA;
        padding: 8px 12px;
        border-radius: 0 6px 6px 0;
      }

      /* Gracias */
      .cm-gracias { align-items: center; text-align: center; }
      .cm-gracias-icon {
        width: 60px; height: 60px;
        border-radius: 50%;
        background: #00FF41;
        color: #000;
        font-size: 26px;
        display: flex; align-items: center; justify-content: center;
        animation: pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);
      }
      @keyframes pop { from{transform:scale(0)} to{transform:scale(1)} }
      .cm-gracias-titulo {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 22px;
        letter-spacing: 3px;
        color: #00FF41;
      }
      .cm-gracias-sub {
        font-family: 'Special Elite', system-ui;
        font-size: 13px;
        color: #888;
        line-height: 1.55;
        font-style: italic;
        max-width: 300px;
      }
    `}</style>
  );
}