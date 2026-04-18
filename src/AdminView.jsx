// AdminView.jsx — Panel de moderación con edición + tab de aprobados

import { useEffect, useState } from "react";

const MOCK_PENDIENTES = [
  { id: "p1", texto: "El gerente de la Municipalidad de Surco llega a las 11am y se va a las 12. Nadie dice nada.", region: "Lima",     fecha: "2026-04-10" },
  { id: "p2", texto: "En la Sunat de Piura hay una cola especial 'para conocidos'. No está en ningún cartel.",    region: "Piura",    fecha: "2026-04-10" },
  { id: "p3", texto: "Un congresista presentó el mismo proyecto de ley tres veces con diferente título.",          region: "Nacional", fecha: "2026-04-09" },
  { id: "p4", texto: "El parque de mi barrio lleva 2 años 'en remodelación'. Solo falta pintar un banco.",         region: "Arequipa", fecha: "2026-04-09" },
  { id: "p5", texto: "En el aeropuerto de Cusco hay un formulario que nadie lee pero todos firman.",               region: "Cusco",    fecha: "2026-04-08" },
];

const MOCK_APROBADOS = [
  { id: "a1", texto: "El cajero de Miraflores solo funciona si llegas con tamales.",                               region: "Lima",     fecha: "2026-04-07" },
  { id: "a2", texto: "El alcalde inauguró el mismo parque tres veces con tres diferentes placas.",                 region: "Lima",     fecha: "2026-04-06" },
  { id: "a3", texto: "En Piura los mototaxistas tienen su propio sistema de semáforos: verde = van, rojo = también van.", region: "Piura",  fecha: "2026-04-05" },
  { id: "a4", texto: "Hay un congresista que ha pedido 'cuarto intermedio' 47 veces en lo que va del año.",        region: "Nacional", fecha: "2026-04-04" },
  { id: "a5", texto: "El Yape más grande registrado fue para pagar una coima de 5 soles en la comisaría.",         region: "Nacional", fecha: "2026-04-03" },
];

const PASS = "admin2026"; // TODO (Enzo): mover auth al backend

// ─── Tabs ───────────────────────────────────────────────────────────────────
const TABS = ["PENDIENTES", "APROBADOS"];

export default function AdminView({ onClose }) {
  const [autenticado, setAuth]    = useState(false);
  const [passInput,   setPass]    = useState("");
  const [passError,   setPassErr] = useState(false);
  const [tab,         setTab]     = useState("PENDIENTES");
  const [pendientes,  setPend]    = useState(MOCK_PENDIENTES);
  const [aprobados,   setApro]    = useState(MOCK_APROBADOS);
  const [procesando,  setProc]    = useState({});
  const [toast,       setToast]   = useState(null);
  const [editandoId,  setEditId]  = useState(null);
  const [editDraft,   setDraft]   = useState({ texto: "", region: "" });
  const [confirmarId, setConfirm] = useState(null); // para confirmar borrado
  const [cargandoListas, setCargando] = useState(false);

  function showToast(msg, color) {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 2500);
  }

  function login() {
    if (passInput === PASS) { setAuth(true); setPassErr(false); }
    else { setPassErr(true); setTimeout(() => setPassErr(false), 1500); }
  }

  async function cargarListas() {
    setCargando(true);
    try {
      const res = await fetch("/api/get-admin-chismes", {
        headers: { "x-admin-pass": passInput || PASS },
      });
      const data = await res.json();
      if (data?.success) {
        setPend(Array.isArray(data.pendientes) ? data.pendientes : []);
        setApro(Array.isArray(data.aprobados) ? data.aprobados : []);
      }
    } catch (e) {
      console.error("Error cargando admin:", e);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    if (autenticado) cargarListas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autenticado]);

  // ── Aprobar / Rechazar ──
  async function accion(id, estado) {
    if (editandoId === id && !editDraft.texto.trim()) {
      showToast("El texto no puede quedar vacío", "#FF00AA"); return;
    }
    setProc(prev => ({ ...prev, [id]: true }));
    try {
      await fetch("/api/update-chisme", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-pass": passInput || PASS },
        body: JSON.stringify({
          id,
          estado,
          texto: editandoId === id ? editDraft.texto : undefined,
          region: editandoId === id ? editDraft.region : undefined,
        }),
      });
    } catch (e) {
      console.error("Error accion admin:", e);
    }

    const chisme = pendientes.find(c => c.id === id);
    if (editandoId === id) cerrarEdicion();

    if (estado === "aprobado" && chisme) {
      const aprobado = {
        ...chisme,
        texto: editDraft.texto.trim() || chisme.texto,
        region: editDraft.region.trim() || chisme.region,
        fecha: new Date().toISOString().split("T")[0],
      };
      setApro(prev => [aprobado, ...prev]);
    }
    setPend(prev => prev.filter(c => c.id !== id));
    setProc(prev => ({ ...prev, [id]: false }));
    showToast(
      estado === "aprobado" ? "✓ Chisme aprobado — ya está en el canal" : "✕ Chisme rechazado",
      estado === "aprobado" ? "#00FF41" : "#FF00AA"
    );
  }

  // ── Edición ──
  function abrirEdicion(c) { setEditId(c.id); setDraft({ texto: c.texto, region: c.region }); }
  function cerrarEdicion()  { setEditId(null); setDraft({ texto: "", region: "" }); }

  async function guardarEdicion(id) {
    const t = editDraft.texto.trim();
    if (!t) { showToast("El texto no puede quedar vacío", "#FF00AA"); return; }
    setProc(prev => ({ ...prev, [id]: true }));
    try {
      await fetch("/api/update-chisme", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-pass": passInput || PASS },
        body: JSON.stringify({ id, estado: "pendiente", texto: t, region: editDraft.region.trim() }),
      });
    } catch (e) {
      console.error("Error guardando edición:", e);
    }
    setPend(prev => prev.map(c => c.id === id ? { ...c, texto: t, region: editDraft.region.trim() || c.region } : c));
    setProc(prev => ({ ...prev, [id]: false }));
    cerrarEdicion();
    showToast("✎ Chisme editado y guardado", "#FF6B00");
  }

  // ── Borrar aprobado ──
  async function borrarAprobado(id) {
    setProc(prev => ({ ...prev, [id]: true }));
    try {
      await fetch("/api/delete-chisme", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-pass": passInput || PASS },
        body: JSON.stringify({ id }),
      });
    } catch (e) {
      console.error("Error borrando aprobado:", e);
    }
    setApro(prev => prev.filter(c => c.id !== id));
    setProc(prev => ({ ...prev, [id]: false }));
    setConfirm(null);
    showToast("🗑️ Chisme eliminado del canal", "#FF6B00");
  }

  // ── Login ────────────────────────────────────────────────────────────────
  if (!autenticado) {
    return (
      <div className="av-root">
        <header className="av-header">
          <button className="av-back" onClick={onClose}>← Volver</button>
          <span className="av-titulo">ADMIN</span>
          <span />
        </header>
        <div className="av-login">
          <div className="av-login-card">
            <div className="av-login-stripe" />
            <p className="av-login-emoji">🔒</p>
            <p className="av-login-titulo">ZONA RESTRINGIDA</p>
            <p className="av-login-sub">Solo para el equipo de moderación</p>
            <input
              type="password"
              className={`av-input ${passError ? "av-input-err" : ""}`}
              placeholder="Contraseña de acceso"
              value={passInput}
              onChange={e => setPass(e.target.value)}
              onKeyDown={e => e.key === "Enter" && login()}
            />
            {passError && <p className="av-err-msg">Contraseña incorrecta pe 🚫</p>}
            <button className="av-btn-login" onClick={login}>ENTRAR AL PANEL →</button>
          </div>
        </div>
        <AvStyles />
      </div>
    );
  }

  // ── Panel ────────────────────────────────────────────────────────────────
  return (
    <div className="av-root">
      {toast && (
        <div className="av-toast" style={{ background: toast.color, color: "#000" }}>
          {toast.msg}
        </div>
      )}

      <header className="av-header">
        <button className="av-back" onClick={onClose}>← Volver</button>
        <div className="av-header-center">
          <span className="av-titulo">MODERACIÓN</span>
          <span className="av-header-sub">
            {tab === "PENDIENTES" ? `${pendientes.length} pendientes` : `${aprobados.length} aprobados`}
          </span>
        </div>
        <button className="av-logout" onClick={() => setAuth(false)}>Salir</button>
      </header>

      {/* Tabs */}
      <div className="av-tabs">
        {TABS.map(t => (
          <button
            key={t}
            className={`av-tab ${tab === t ? "av-tab-on" : ""}`}
            onClick={() => setTab(t)}
          >
            {t}
            <span className="av-tab-badge">
              {t === "PENDIENTES" ? pendientes.length : aprobados.length}
            </span>
          </button>
        ))}
      </div>

      <main className="av-main">
        {cargandoListas && (
          <p className="av-instruccion">Cargando del servidor...</p>
        )}

        {/* ══ TAB PENDIENTES ══ */}
        {tab === "PENDIENTES" && (
          pendientes.length === 0 ? (
            <div className="av-empty">
              <p className="av-empty-icon">🎉</p>
              <p className="av-empty-titulo">TODO MODERADO</p>
              <p className="av-empty-sub">No hay chismes pendientes.</p>
            </div>
          ) : (
            <>
              <p className="av-instruccion">
                Edita si es necesario, luego aprueba o rechaza.
              </p>
              <div className="av-lista">
                {pendientes.map((c, i) => (
                  <div key={c.id} className="av-card" style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="av-card-stripe" />
                    <div className="av-card-meta">
                      <span className="av-card-region">{c.region}</span>
                      <span className="av-card-fecha">{c.fecha}</span>
                    </div>

                    {/* Texto o editor */}
                    {editandoId === c.id ? (
                      <div className="av-edit-block">
                        <label className="av-edit-label">Texto del chisme</label>
                        <textarea
                          className="av-edit-textarea"
                          value={editDraft.texto}
                          onChange={e => setDraft(d => ({ ...d, texto: e.target.value }))}
                          rows={4}
                          disabled={procesando[c.id]}
                        />
                        <label className="av-edit-label">Región</label>
                        <input
                          type="text"
                          className="av-edit-input"
                          value={editDraft.region}
                          onChange={e => setDraft(d => ({ ...d, region: e.target.value }))}
                          placeholder="Ej. Lima"
                          disabled={procesando[c.id]}
                        />
                      </div>
                    ) : (
                      <p className="av-card-texto">"{c.texto}"</p>
                    )}

                    {/* Botones */}
                    <div className="av-card-btns">
                      {editandoId === c.id ? (
                        <>
                          <div className="av-btn-row-double">
                            <button className="av-btn av-btn-guardar" onClick={() => guardarEdicion(c.id)} disabled={procesando[c.id]}>
                              {procesando[c.id] ? "..." : "GUARDAR"}
                            </button>
                            <button className="av-btn av-btn-cancelar" onClick={cerrarEdicion} disabled={procesando[c.id]}>
                              CANCELAR
                            </button>
                          </div>
                          <div className="av-btn-row-double">
                            <button className="av-btn av-btn-aprobar" onClick={() => accion(c.id, "aprobado")} disabled={procesando[c.id]}>
                              {procesando[c.id] ? "..." : "✓ APROBAR"}
                            </button>
                            <button className="av-btn av-btn-rechazar" onClick={() => accion(c.id, "rechazado")} disabled={procesando[c.id]}>
                              {procesando[c.id] ? "..." : "✕ RECHAZAR"}
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <button className="av-btn av-btn-editar" onClick={() => abrirEdicion(c)} disabled={procesando[c.id]}>
                            ✎ EDITAR CHISME
                          </button>
                          <div className="av-btn-row-double">
                            <button className="av-btn av-btn-aprobar" onClick={() => accion(c.id, "aprobado")} disabled={procesando[c.id]}>
                              {procesando[c.id] ? "..." : "✓ APROBAR"}
                            </button>
                            <button className="av-btn av-btn-rechazar" onClick={() => accion(c.id, "rechazado")} disabled={procesando[c.id]}>
                              {procesando[c.id] ? "..." : "✕ RECHAZAR"}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )
        )}

        {/* ══ TAB APROBADOS ══ */}
        {tab === "APROBADOS" && (
          aprobados.length === 0 ? (
            <div className="av-empty">
              <p className="av-empty-icon">📭</p>
              <p className="av-empty-titulo">SIN APROBADOS AÚN</p>
              <p className="av-empty-sub">Aprueba chismes desde la pestaña Pendientes.</p>
            </div>
          ) : (
            <>
              <p className="av-instruccion">
                Estos chismes están en el canal. Puedes borrarlos si es necesario.
              </p>
              <div className="av-lista">
                {aprobados.map((c, i) => (
                  <div key={c.id} className="av-card av-card-aprobado" style={{ animationDelay: `${i * 50}ms` }}>
                    <div className="av-card-stripe av-stripe-verde" />
                    <div className="av-card-meta">
                      <span className="av-card-region">{c.region}</span>
                      <span className="av-aprobado-badge">✓ EN CANAL</span>
                      <span className="av-card-fecha">{c.fecha}</span>
                    </div>
                    <p className="av-card-texto">"{c.texto}"</p>

                    {/* Confirmación de borrado */}
                    {confirmarId === c.id ? (
                      <div className="av-confirmar-wrap">
                        <p className="av-confirmar-txt">¿Seguro que quieres borrarlo del canal?</p>
                        <div className="av-btn-row-double">
                          <button
                            className="av-btn av-btn-borrar-confirm"
                            onClick={() => borrarAprobado(c.id)}
                            disabled={procesando[c.id]}
                          >
                            {procesando[c.id] ? "..." : "🗑️ SÍ, BORRAR"}
                          </button>
                          <button
                            className="av-btn av-btn-cancelar"
                            onClick={() => setConfirm(null)}
                          >
                            CANCELAR
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        className="av-btn av-btn-borrar"
                        onClick={() => setConfirm(c.id)}
                        disabled={procesando[c.id]}
                      >
                        🗑️ BORRAR DEL CANAL
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )
        )}
      </main>

      <AvStyles />
    </div>
  );
}

const delay = ms => new Promise(r => setTimeout(r, ms));

function AvStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Black+Han+Sans&family=Public+Sans:wght@400;700&family=Courier+Prime:wght@400;700&display=swap');

      :root {
        --f-titulo: 'Black Han Sans', sans-serif;
        --f-bloque: 'Archivo Black', sans-serif;
        --f-cuerpo: 'Public Sans', sans-serif;
        --f-codigo: 'Courier Prime', monospace;
      }

      .av-root {
        min-height: 100vh; background: #0A0A0A; color: #fff;
        font-family: var(--f-cuerpo); max-width: 480px; margin: 0 auto;
        display: flex; flex-direction: column; position: relative;
      }

      /* Toast */
      .av-toast {
        position: fixed; top: 0; left: 50%; transform: translateX(-50%);
        max-width: 480px; width: 100%; padding: 12px 16px;
        font-family: var(--f-bloque); font-size: 12px; letter-spacing: 1px;
        text-align: center; z-index: 99; animation: toast-in 0.3s ease;
      }
      @keyframes toast-in { from{opacity:0;transform:translateX(-50%) translateY(-100%)} to{opacity:1;transform:translateX(-50%) translateY(0)} }

      /* Header */
      .av-header {
        position: sticky; top: 0; z-index: 10; background: #0f0f0f;
        border-bottom: 1px solid #1a1a1a; padding: 12px 16px;
        display: flex; align-items: center; justify-content: space-between; gap: 8px;
      }
      .av-back, .av-logout {
        background: transparent; border: none; font-family: var(--f-bloque);
        font-size: 11px; cursor: pointer; white-space: nowrap; letter-spacing: 0.5px;
      }
      .av-back   { color: #FF6B00; }
      .av-logout { color: #555; }
      .av-header-center { display: flex; flex-direction: column; align-items: center; flex: 1; }
      .av-titulo    { font-family: var(--f-titulo); font-size: 18px; letter-spacing: 2px; color: #FF00AA; }
      .av-header-sub{ font-family: var(--f-bloque); font-size: 9px; color: #444; text-transform: uppercase; letter-spacing: 1px; }

      /* Tabs */
      .av-tabs { display: flex; border-bottom: 1px solid #1a1a1a; }
      .av-tab {
        flex: 1; padding: 12px 8px; background: transparent; border: none;
        font-family: var(--f-bloque); font-size: 11px; letter-spacing: 1px;
        color: #444; cursor: pointer; text-transform: uppercase;
        display: flex; align-items: center; justify-content: center; gap: 6px;
        border-bottom: 2px solid transparent; transition: color 0.2s, border-color 0.2s;
      }
      .av-tab-on   { color: #FF6B00 !important; border-bottom-color: #FF6B00 !important; }
      .av-tab-badge {
        background: #1a1a1a; border-radius: 10px; padding: 1px 7px;
        font-family: var(--f-codigo); font-size: 10px; color: #555;
      }
      .av-tab-on .av-tab-badge { background: rgba(255,107,0,0.15); color: #FF6B00; }

      /* Login */
      .av-login { flex: 1; display: flex; align-items: center; justify-content: center; padding: 32px 16px; }
      .av-login-card {
        width: 100%; background: #111; border: 1px solid #222; border-radius: 12px;
        padding: 28px 20px; position: relative; overflow: hidden;
        text-align: center; display: flex; flex-direction: column; gap: 12px;
      }
      .av-login-stripe { position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg,#FF00AA,#FF6B00); }
      .av-login-emoji  { font-size: 36px; }
      .av-login-titulo { font-family: var(--f-titulo); font-size: 20px; letter-spacing: 2px; color: #FF00AA; }
      .av-login-sub    { font-family: var(--f-bloque); font-size: 11px; color: #555; text-transform: uppercase; letter-spacing: 1px; }
      .av-input {
        width: 100%; padding: 13px 14px; background: #1a1a1a; border: 1.5px solid #333;
        border-radius: 8px; color: #fff; font-family: var(--f-cuerpo); font-size: 15px;
        outline: none; text-align: center; transition: border-color 0.2s;
      }
      .av-input:focus { border-color: #FF00AA; }
      .av-input-err   { border-color: #FF00AA !important; animation: shake 0.3s ease; }
      @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
      .av-err-msg { font-family: var(--f-bloque); font-size: 11px; color: #FF00AA; }
      .av-btn-login {
        width: 100%; padding: 14px; background: #FF00AA; color: #000; border: none;
        border-radius: 8px; font-family: var(--f-titulo); font-size: 18px;
        letter-spacing: 2px; cursor: pointer; transition: opacity 0.2s, transform 0.1s;
      }
      .av-btn-login:active { transform: scale(0.97); }

      /* Panel principal */
      .av-main { flex: 1; padding: 14px 16px 40px; display: flex; flex-direction: column; gap: 12px; }
      .av-instruccion { font-family: var(--f-bloque); font-size: 10px; color: #555; text-transform: uppercase; letter-spacing: 1px; }

      /* Cards */
      .av-lista { display: flex; flex-direction: column; gap: 10px; }
      .av-card {
        background: #111; border: 1px solid #222; border-radius: 12px;
        padding: 14px 14px; position: relative; overflow: hidden;
        animation: card-in 0.35s ease both;
      }
      .av-card-aprobado { border-color: rgba(0,255,65,0.2); }
      @keyframes card-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      .av-card-stripe { position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg,#FF6B00,#FF00AA); }
      .av-stripe-verde { background: linear-gradient(90deg,#00FF41,#00FFFF) !important; }

      .av-card-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; gap: 6px; }
      .av-card-region { font-family: var(--f-bloque); font-size: 10px; color: #FF6B00; letter-spacing: 1px; text-transform: uppercase; }
      .av-card-fecha  { font-family: var(--f-codigo); font-size: 9px; color: #444; white-space: nowrap; }
      .av-aprobado-badge {
        font-family: var(--f-bloque); font-size: 9px; color: #00FF41;
        border: 1px solid rgba(0,255,65,0.4); border-radius: 10px; padding: 1px 7px;
        white-space: nowrap;
      }

      .av-card-texto {
        font-family: var(--f-cuerpo); font-size: 13px; color: #ddd;
        line-height: 1.5; font-style: italic; margin-bottom: 12px;
      }

      /* Botones */
      .av-card-btns     { display: flex; flex-direction: column; gap: 8px; }
      .av-btn-row-double{ display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
      .av-btn {
        padding: 11px 8px; border: none; border-radius: 8px;
        font-family: var(--f-bloque); font-size: 12px; letter-spacing: 0.5px;
        cursor: pointer; transition: opacity 0.2s, transform 0.1s; text-transform: uppercase;
      }
      .av-btn:active:not(:disabled) { transform: scale(0.96); }
      .av-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      .av-btn-aprobar  { background: #00FF41; color: #000; }
      .av-btn-rechazar { background: #1a1a1a; color: #FF00AA; border: 1.5px solid #FF00AA; }
      .av-btn-editar   { width: 100%; background: transparent; color: #FF6B00; border: 1.5px solid #FF6B00; }
      .av-btn-guardar  { background: #FF6B00; color: #000; }
      .av-btn-cancelar { background: #1a1a1a; color: #888; border: 1.5px solid #333; }
      .av-btn-borrar   { width: 100%; background: transparent; color: #FF00AA; border: 1.5px solid rgba(255,0,170,0.4); }
      .av-btn-borrar:hover { border-color: #FF00AA; }
      .av-btn-borrar-confirm { background: #FF00AA; color: #000; }

      /* Confirmar borrado */
      .av-confirmar-wrap { display: flex; flex-direction: column; gap: 8px; }
      .av-confirmar-txt  { font-family: var(--f-bloque); font-size: 11px; color: #FF00AA; text-transform: uppercase; letter-spacing: 0.5px; text-align: center; margin-bottom: 4px; }

      /* Edit block */
      .av-edit-block { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
      .av-edit-label { font-family: var(--f-bloque); font-size: 9px; color: #555; text-transform: uppercase; letter-spacing: 1px; }
      .av-edit-textarea, .av-edit-input {
        width: 100%; padding: 11px; background: #1a1a1a; border: 1.5px solid #333;
        border-radius: 8px; color: #fff; font-family: var(--f-cuerpo); font-size: 14px;
        outline: none; resize: vertical; box-sizing: border-box; transition: border-color 0.2s;
      }
      .av-edit-textarea:focus, .av-edit-input:focus { border-color: #FF6B00; }
      .av-edit-textarea { min-height: 90px; line-height: 1.5; }

      /* Empty */
      .av-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; text-align: center; padding: 48px 0; }
      .av-empty-icon   { font-size: 48px; }
      .av-empty-titulo { font-family: var(--f-titulo); font-size: 20px; letter-spacing: 2px; color: #00FF41; }
      .av-empty-sub    { font-family: var(--f-bloque); font-size: 10px; color: #555; text-transform: uppercase; letter-spacing: 1px; }
    `}</style>
  );
}