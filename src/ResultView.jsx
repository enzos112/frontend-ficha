import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";

export default function ResultView({ perfil, region, onReiniciar }) {
  const printRef = useRef();
  const [animating, setAnimating] = useState(false);

  // Simulamos la entrada triunfal tipo Spotify Wrapped
  useEffect(() => {
    setAnimating(true);
  }, []);

  const handleDownload = async () => {
    const element = printRef.current;
    // Capturamos el div con alta calidad (scale 2)
    const canvas = await html2canvas(element, { 
      scale: 2, 
      backgroundColor: '#0A0A0A',
      useCORS: true 
    });
    const data = canvas.toDataURL('image/png');
    
    // Forzamos la descarga
    const link = document.createElement('a');
    link.href = data;
    link.download = `MiFicha-${perfil?.codigo || '2026'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Datos simulados para el ADN (Si tu API ya manda porcentajes, usa esos)
  const adnStats = perfil?.stats || [
    { nombre: perfil?.nombre || "EL RADICAL", valor: 75, color: "#FF00AA" },
    { nombre: "VIVILLO", valor: 15, color: "#FFFF00" },
    { nombre: "NEGOCIADOR", valor: 10, color: "#00FF41" }
  ];

  return (
    <div className="rv-root">
      
      {/* CONTENEDOR QUE SE CONVIERTE EN IMAGEN */}
      <div 
        ref={printRef} 
        className={`rv-share-card ${animating ? 'animate-in' : ''}`}
      >
        {/* Textura de fondo (estilo afiche chicha/ruido) */}
        <div className="rv-noise-overlay"></div>

        <header className="rv-header">
          <div className="rv-header-left">
            <span className="rv-stamp">CERTIFICADO OFICIAL</span>
            <span className="rv-code">EXP: {perfil?.codigo || "FCH-0000"}</span>
          </div>
          <div className="rv-region">📍 {region || "PERÚ"}</div>
        </header>

        <main className="rv-main">
          <p className="rv-intro">EN LAS ELECCIONES 2026, TU VIBRA ES...</p>
          
          <div className="rv-title-wrapper">
            <h1 className="rv-main-title chicha-text">
              {perfil?.nombre || "EL RADICAL"}
            </h1>
          </div>

          <p className="rv-quote">
            "{perfil?.frase || 'Si no hay chongo, no hay democracia.'}"
          </p>

          {/* Sección tipo Spotify "Tus géneros más escuchados" */}
          <div className="rv-adn-section">
            <h2 className="rv-adn-title">TU ADN CIUDADANO:</h2>
            <div className="rv-bars">
              {adnStats.map((stat, idx) => (
                <div key={idx} className="rv-bar-row">
                  <span className="rv-bar-label">{stat.nombre}</span>
                  <div className="rv-bar-bg">
                    <div 
                      className="rv-bar-fill" 
                      style={{ 
                        width: `${animating ? stat.valor : 0}%`, 
                        backgroundColor: stat.color,
                        transitionDelay: `${idx * 0.3}s`
                      }}
                    >
                      <span className="rv-bar-pct">{stat.valor}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        <footer className="rv-footer">
          <div className="rv-footer-brand">
            <span style={{color: '#FF6B00'}}>SACA</span>
            <span style={{color: '#FFFF00'}}>TU</span>
            <span style={{color: '#00FF41'}}>FICHA</span>
          </div>
          <div className="rv-url">sacatuficha.pe</div>
        </footer>
      </div>

      {/* BOTONERA EXTERNA (NO SALE EN LA FOTO) */}
      <div className="rv-actions">
        <button className="rv-btn-share" onClick={handleDownload}>
          📸 DESCARGAR MI FICHA
        </button>
        <button className="rv-btn-reset" onClick={onReiniciar}>
          VOLVER A EMPEZAR ↺
        </button>
      </div>

      <style>{`
        .rv-root {
          min-height: 100vh;
          background: #000;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          font-family: 'Public Sans', sans-serif;
        }

        /* La Tarjeta que se exporta */
        .rv-share-card {
          width: 100%;
          max-width: 400px;
          aspect-ratio: 9/16; /* Proporción exacta de IG Story */
          background: linear-gradient(160deg, #1a0011 0%, #000000 50%, #001a08 100%);
          border: 4px solid #FF00AA;
          border-radius: 20px;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          padding: 24px;
          box-shadow: 0 0 40px rgba(255, 0, 170, 0.3);
          transform: translateY(50px);
          opacity: 0;
          transition: all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .rv-share-card.animate-in {
          transform: translateY(0);
          opacity: 1;
        }

        .rv-noise-overlay {
          position: absolute;
          inset: 0;
          background-image: url('data:image/svg+xml;utf8,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)" opacity="0.1"/%3E%3C/svg%3E');
          pointer-events: none;
          z-index: 1;
        }

        .rv-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          z-index: 2;
          margin-bottom: 30px;
        }

        .rv-header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .rv-stamp {
          background: #FF00AA;
          color: #fff;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 14px;
          padding: 2px 8px;
          letter-spacing: 2px;
          transform: rotate(-3deg);
          display: inline-block;
          width: fit-content;
        }

        .rv-code {
          font-family: 'Courier Prime', monospace;
          color: #FFFF00;
          font-size: 12px;
          font-weight: bold;
        }

        .rv-region {
          font-family: 'Courier Prime', monospace;
          color: #00FF41;
          font-size: 12px;
          border: 1px solid #00FF41;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .rv-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          z-index: 2;
        }

        .rv-intro {
          font-family: 'Courier Prime', monospace;
          color: #888;
          font-size: 12px;
          letter-spacing: 1px;
          margin-bottom: 10px;
        }

        /* Estilo Chicha Text */
        .rv-title-wrapper {
          margin-bottom: 24px;
        }

        .chicha-text {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(50px, 14vw, 75px);
          line-height: 0.85;
          color: #FFFF00;
          text-shadow: 
            3px 3px 0 #FF00AA, 
            6px 6px 0 #FF6B00,
            9px 9px 0 #00FF41;
          margin: 0;
          transform: rotate(-2deg);
        }

        .rv-quote {
          font-family: 'Special Elite', system-ui;
          color: #fff;
          font-size: 16px;
          line-height: 1.4;
          background: rgba(255, 0, 170, 0.2);
          padding: 12px;
          border-left: 4px solid #FF00AA;
          margin-bottom: 40px;
        }

        .rv-adn-section {
          background: #111;
          border-radius: 12px;
          padding: 16px;
          border: 1px solid #333;
        }

        .rv-adn-title {
          font-family: 'Bebas Neue', sans-serif;
          color: #fff;
          letter-spacing: 2px;
          font-size: 20px;
          margin-bottom: 16px;
        }

        .rv-bars {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .rv-bar-row {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .rv-bar-label {
          font-family: 'Courier Prime', monospace;
          color: #aaa;
          font-size: 10px;
          font-weight: bold;
          letter-spacing: 1px;
        }

        .rv-bar-bg {
          width: 100%;
          height: 24px;
          background: #222;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
        }

        .rv-bar-fill {
          height: 100%;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 8px;
          transition: width 1.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .rv-bar-pct {
          font-family: 'Bebas Neue', sans-serif;
          color: #000;
          font-size: 14px;
        }

        .rv-footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          z-index: 2;
          margin-top: 20px;
          border-top: 1px dashed #333;
          padding-top: 16px;
        }

        .rv-footer-brand {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 24px;
          display: flex;
          gap: 4px;
          transform: rotate(-2deg);
        }

        .rv-url {
          font-family: 'Courier Prime', monospace;
          color: #fff;
          font-size: 10px;
          background: #FF00AA;
          padding: 2px 6px;
        }

        /* Botonera */
        .rv-actions {
          margin-top: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
          max-width: 400px;
        }

        .rv-btn-share {
          width: 100%;
          padding: 16px;
          background: #FF00AA;
          color: #fff;
          border: none;
          border-radius: 12px;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 22px;
          letter-spacing: 2px;
          cursor: pointer;
          transition: transform 0.1s;
        }
        .rv-btn-share:active { transform: scale(0.97); }

        .rv-btn-reset {
          width: 100%;
          padding: 12px;
          background: transparent;
          color: #888;
          border: 1px solid #333;
          border-radius: 12px;
          font-family: 'Courier Prime', monospace;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .rv-btn-reset:hover { color: #fff; border-color: #888; }
      `}</style>
    </div>
  );
}