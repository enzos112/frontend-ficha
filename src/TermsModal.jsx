export default function TermsModal({ onClose, onAceptar }) {
  return (
    <div className="tm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="tm-box" role="dialog" aria-modal="true">
        <div className="tm-stripe" />

        {/* Header */}
        <div className="tm-header">
          <div className="tm-header-left">
            <span className="tm-dot dot-naranja" />
            <span className="tm-titulo">TÉRMINOS Y CONDICIONES</span>
          </div>
          <button className="tm-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        {/* Sello */}
        <div className="tm-sello-wrap">
          <div className="tm-sello">
            <p>REP.</p>
            <p>DEL PERÚ</p>
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div className="tm-body">
          <p className="tm-intro">
            Antes de sacar tu ficha, el Estado Satírico del Perú te informa lo siguiente.
            Léelo o no lo leas, igual vas a aceptar.
          </p>

          <div className="tm-bloque">
            <p className="tm-bloque-titulo">📋 ARTÍCULO 1 — SOBRE LA NATURALEZA DE ESTO</p>
            <p className="tm-bloque-txt">
              "Saca tu Ficha" es una experiencia satírica sin fines de lucro, ni fines electorales, ni fines de ningún partido político conocido o por conocer. Si te ofendiste, es porque algo te llegó.
            </p>
          </div>

          <div className="tm-bloque">
            <p className="tm-bloque-titulo">🕵️ ARTÍCULO 2 — SOBRE TUS DATOS</p>
            <p className="tm-bloque-txt">
              No guardamos tu nombre, tu DNI, tu cara, tu número de WhatsApp ni el nombre de tu enamorado/a. Solo guardamos un código anónimo (UUID) para saber que eres la misma persona entre preguntas. Nada más. Prometido, pe.
            </p>
          </div>

          <div className="tm-bloque">
            <p className="tm-bloque-titulo">🗞️ ARTÍCULO 3 — SOBRE LOS CHISMES</p>
            <p className="tm-bloque-txt">
              Los chismes que envíes son revisados antes de publicarse. Al enviar uno, aceptas que: (a) no incluye datos personales reales, (b) no es difamatorio, (c) es simplemente la cruda realidad peruana expresada con humor. El equipo se reserva el derecho de editar o rechazar sin explicar por qué.
            </p>
          </div>

          <div className="tm-bloque">
            <p className="tm-bloque-titulo">🧠 ARTÍCULO 4 — SOBRE LOS RESULTADOS</p>
            <p className="tm-bloque-txt">
              Tu "Ficha" es un perfil satírico basado en tus respuestas. No es un diagnóstico psicológico, no es una sentencia judicial y no define tu valor como ser humano. Si te salió "El Vivillo", no significa que seas mala persona. Significa que eres peruano.
            </p>
          </div>

          <div className="tm-bloque">
            <p className="tm-bloque-titulo">📤 ARTÍCULO 5 — SOBRE COMPARTIR</p>
            <p className="tm-bloque-txt">
              Puedes compartir tu ficha en todas las redes que quieras. De hecho, te lo pedimos. Si no la compartes, el trámite no tiene validez oficial (esto es mentira, pero igual compártela).
            </p>
          </div>

          <div className="tm-bloque">
            <p className="tm-bloque-titulo">⚖️ ARTÍCULO 6 — JURISDICCIÓN</p>
            <p className="tm-bloque-txt">
              Cualquier disputa será resuelta en la cola del Banco de la Nación, turno F-247, ventanilla 8, el día que abra. Nos sometemos a la jurisdicción del sentido del humor peruano.
            </p>
          </div>

          <div className="tm-firma">
            <p className="tm-firma-txt">Firmado y sellado con buena vibra,</p>
            <p className="tm-firma-nombre">El Equipo de Saca tu Ficha</p>
            <p className="tm-firma-cargo">Dirección General de Sátira Electoral · Lima, Perú · 2026</p>
          </div>
        </div>

        {/* Botón aceptar */}
        <div className="tm-footer">
          <button className="tm-btn-aceptar" onClick={onAceptar}>
            ACEPTO Y SACO MI FICHA →
          </button>
          <button className="tm-btn-rechazar" onClick={onClose}>
            No acepto (igual puedes entrar)
          </button>
        </div>
      </div>

      <TmStyles />
    </div>
  );
}

function TmStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Black+Han+Sans&family=Public+Sans:wght@400;700&family=Courier+Prime:wght@400;700&display=swap');

      :root {
        --f-titulo: 'Black Han Sans', sans-serif;
        --f-bloque: 'Archivo Black', sans-serif;
        --f-cuerpo: 'Public Sans', sans-serif;
        --f-codigo: 'Courier Prime', monospace;
      }

      /* LA MAGIA ESTÁ AQUÍ: z-index a 99999 para que nada lo tape */
      .tm-overlay {
        position: fixed; inset: 0; background: rgba(0,0,0,0.95); z-index: 99999;
        display: flex; align-items: flex-end; justify-content: center;
        animation: fade-in 0.2s ease;
      }
      @keyframes fade-in { from{opacity:0} to{opacity:1} }

      .tm-box {
        width: 100%; max-width: 480px; background: #111;
        border-radius: 16px 16px 0 0;
        display: flex; flex-direction: column;
        max-height: 88vh;
        animation: slide-up 0.35s cubic-bezier(0.175,0.885,0.32,1.275);
        overflow: hidden;
        box-shadow: 0 -10px 40px rgba(0,0,0,0.8);
      }
      @keyframes slide-up { from{transform:translateY(100%)} to{transform:translateY(0)} }

      .tm-stripe {
        flex-shrink: 0; height: 4px;
        background: linear-gradient(90deg, #FF6B00, #FFFF00, #FF00AA, #00FF41);
      }

      .tm-header {
        flex-shrink: 0;
        display: flex; justify-content: space-between; align-items: center;
        padding: 14px 16px; border-bottom: 1px solid #1a1a1a;
      }
      .tm-header-left { display: flex; align-items: center; gap: 8px; }
      .tm-dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; }
      .dot-naranja { background: #FF6B00; }
      .tm-titulo { font-family: var(--f-titulo); font-size: 16px; letter-spacing: 1px; color: #FF6B00; }
      .tm-close  { background: transparent; border: none; color: #444; font-size: 18px; cursor: pointer; transition: color 0.2s; padding: 0 4px; }
      .tm-close:hover { color: #fff; }

      .tm-sello-wrap { flex-shrink: 0; display: flex; justify-content: center; padding: 14px 0 0; }
      .tm-sello {
        border: 2px solid #FF00AA; border-radius: 50%;
        width: 60px; height: 60px;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        transform: rotate(-10deg); opacity: 0.6;
      }
      .tm-sello p { font-family: var(--f-bloque); font-size: 7px; color: #FF00AA; letter-spacing: 1px; line-height: 1.3; text-align: center; }

      .tm-body {
        flex: 1; overflow-y: auto; padding: 16px 18px 4px;
        display: flex; flex-direction: column; gap: 14px;
        -webkit-overflow-scrolling: touch;
      }
      .tm-body::-webkit-scrollbar { width: 3px; }
      .tm-body::-webkit-scrollbar-thumb { background: #FF6B00; border-radius: 2px; }

      .tm-intro {
        font-family: var(--f-bloque); font-size: 12px; color: #888;
        text-align: center; line-height: 1.5; text-transform: uppercase; letter-spacing: 0.5px;
      }

      .tm-bloque { border-left: 3px solid #222; padding-left: 12px; }
      .tm-bloque-titulo {
        font-family: var(--f-bloque); font-size: 11px; color: #FF6B00;
        letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px;
      }
      .tm-bloque-txt {
        font-family: var(--f-cuerpo); font-size: 13px; color: #bbb; line-height: 1.55;
      }

      .tm-firma {
        border-top: 1px dashed #2a2a2a; padding-top: 14px; text-align: center;
        display: flex; flex-direction: column; gap: 3px;
      }
      .tm-firma-txt    { font-family: var(--f-cuerpo); font-size: 12px; color: #555; font-style: italic; }
      .tm-firma-nombre { font-family: var(--f-titulo); font-size: 16px; color: #fff; }
      .tm-firma-cargo  { font-family: var(--f-bloque); font-size: 9px; color: #444; text-transform: uppercase; letter-spacing: 1px; }

      .tm-footer {
        flex-shrink: 0;
        padding: 14px 18px 24px;
        display: flex; flex-direction: column; gap: 8px;
        border-top: 1px solid #1a1a1a;
      }
      .tm-btn-aceptar {
        width: 100%; padding: 15px; background: #FF6B00; color: #000;
        border: none; border-radius: 8px;
        font-family: var(--f-titulo); font-size: 18px; letter-spacing: 2px;
        cursor: pointer; transition: opacity 0.2s, transform 0.1s;
      }
      .tm-btn-aceptar:active { transform: scale(0.97); }
      .tm-btn-rechazar {
        background: transparent; border: none;
        font-family: var(--f-bloque); font-size: 10px; color: #444;
        cursor: pointer; text-align: center; text-transform: uppercase; letter-spacing: 1px;
        text-decoration: underline; padding: 4px;
        transition: color 0.2s;
      }
      .tm-btn-rechazar:hover { color: #888; }
    `}</style>
  );
}