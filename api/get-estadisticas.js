import { neon } from '@neondatabase/serverless';

function toInt(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  // Siempre devolvemos la misma “shape” que espera StatsView.jsx
  const base = {
    totalFichas: 0,
    porRegion: [],
    porPerfil: [],
    porEdad: [],
    porGenero: [],
  };

  try {
    const total = await sql`SELECT COUNT(*)::int as total FROM sesiones;`;
    base.totalFichas = toInt(total?.[0]?.total, 0);
  } catch (e) {
    console.error('get-estadisticas totalFichas:', e);
  }

  // Distribución por perfil (usa perfil_final_id si existe)
  try {
    const rows = await sql`
      WITH t AS (
        SELECT COUNT(*)::numeric AS total
        FROM sesiones
        WHERE perfil_final_id IS NOT NULL
      )
      SELECT
        COALESCE(p.nombre_ficha, 'SIN PERFIL') AS perfil,
        ROUND((COUNT(*)::numeric / NULLIF((SELECT total FROM t), 0)) * 100)::int AS pct
      FROM sesiones s
      LEFT JOIN perfiles p ON p.id = s.perfil_final_id
      WHERE s.perfil_final_id IS NOT NULL
      GROUP BY COALESCE(p.nombre_ficha, 'SIN PERFIL')
      ORDER BY pct DESC, perfil ASC
      LIMIT 20;
    `;

    // Paleta “chicha” para barras (repite si hay más)
    const colores = ["#FFFF00", "#FF6B00", "#00FF41", "#00FFFF", "#FF00AA"];
    const emojis  = ["🦊", "🔥", "🦥", "💪", "🤝", "📋", "📱", "🕶️", "🧨", "🧃"];

    base.porPerfil = (rows || []).map((r, i) => ({
      perfil: r.perfil,
      pct: toInt(r.pct, 0),
      color: colores[i % colores.length],
      emoji: emojis[i % emojis.length],
    }));
  } catch (e) {
    console.error('get-estadisticas porPerfil:', e);
  }

  // Distribución por región + perfil dominante por región
  try {
    const rows = await sql`
      WITH base_region AS (
        SELECT
          COALESCE(NULLIF(TRIM(region), ''), 'Nacional') AS region,
          COUNT(*)::int AS total
        FROM sesiones
        GROUP BY COALESCE(NULLIF(TRIM(region), ''), 'Nacional')
      ),
      top_perfil AS (
        SELECT
          COALESCE(NULLIF(TRIM(s.region), ''), 'Nacional') AS region,
          COALESCE(p.nombre_ficha, 'SIN PERFIL') AS perfilTop,
          COUNT(*)::int AS cnt,
          ROW_NUMBER() OVER (
            PARTITION BY COALESCE(NULLIF(TRIM(s.region), ''), 'Nacional')
            ORDER BY COUNT(*) DESC
          ) AS rn
        FROM sesiones s
        LEFT JOIN perfiles p ON p.id = s.perfil_final_id
        WHERE s.perfil_final_id IS NOT NULL
        GROUP BY COALESCE(NULLIF(TRIM(s.region), ''), 'Nacional'), COALESCE(p.nombre_ficha, 'SIN PERFIL')
      )
      SELECT
        br.region,
        br.total,
        COALESCE(tp.perfilTop, 'SIN PERFIL') AS perfilTop,
        CASE
          WHEN br.total = 0 THEN 0
          ELSE ROUND((COALESCE(tp.cnt, 0)::numeric / br.total::numeric) * 100)::int
        END AS pct
      FROM base_region br
      LEFT JOIN top_perfil tp
        ON tp.region = br.region AND tp.rn = 1
      ORDER BY br.total DESC, br.region ASC
      LIMIT 30;
    `;

    base.porRegion = (rows || []).map(r => ({
      region: r.region,
      total: toInt(r.total, 0),
      perfilTop: r.perfilTop,
      pct: toInt(r.pct, 0),
    }));
  } catch (e) {
    console.error('get-estadisticas porRegion:', e);
  }

  // Edad / género (opcionales: solo si existen columnas en `sesiones`)
  try {
    const porEdad = await sql`
      SELECT COALESCE(NULLIF(TRIM(edad), ''), 'general') AS rango, COUNT(*)::int AS total
      FROM sesiones
      GROUP BY COALESCE(NULLIF(TRIM(edad), ''), 'general')
      ORDER BY total DESC;
    `;
    const total = porEdad.reduce((acc, r) => acc + toInt(r.total, 0), 0) || 1;
    base.porEdad = porEdad.map(r => ({
      rango: r.rango,
      pct: Math.round((toInt(r.total, 0) / total) * 100),
    }));
  } catch (e) {
    // si la columna no existe, no rompemos el endpoint
  }

  try {
    const porGenero = await sql`
      SELECT COALESCE(NULLIF(TRIM(genero), ''), 'general') AS genero, COUNT(*)::int AS total
      FROM sesiones
      GROUP BY COALESCE(NULLIF(TRIM(genero), ''), 'general')
      ORDER BY total DESC;
    `;
    const total = porGenero.reduce((acc, r) => acc + toInt(r.total, 0), 0) || 1;
    const colores = ["#FF6B00", "#FF00AA", "#FFFF00", "#00FF41", "#00FFFF"];
    base.porGenero = porGenero.map((r, i) => ({
      genero: r.genero,
      pct: Math.round((toInt(r.total, 0) / total) * 100),
      color: colores[i % colores.length],
    }));
  } catch (e) {
    // si la columna no existe, no rompemos el endpoint
  }

  return res.status(200).json(base);
}

