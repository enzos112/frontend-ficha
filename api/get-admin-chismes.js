import { neon } from '@neondatabase/serverless';

function adminOk(req) {
  const pass = req.headers['x-admin-pass'];
  const expected = process.env.ADMIN_PASS || 'admin2026';
  return pass && String(pass) === String(expected);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' });
  if (!adminOk(req)) return res.status(401).json({ error: 'No autorizado' });

  const sql = neon(process.env.DATABASE_URL);

  try {
    const pendientes = await sql`
      SELECT
        id::text as id,
        texto_chisme as texto,
        COALESCE(NULLIF(TRIM(region), ''), 'Nacional') as region,
        COALESCE(to_char(created_at, 'YYYY-MM-DD'), to_char(fecha_creacion, 'YYYY-MM-DD'), '') as fecha
      FROM chismes
      WHERE estado = 'pendiente'
      ORDER BY COALESCE(created_at, fecha_creacion) DESC NULLS LAST, id DESC
      LIMIT 200;
    `;

    const aprobados = await sql`
      SELECT
        id::text as id,
        texto_chisme as texto,
        COALESCE(NULLIF(TRIM(region), ''), 'Nacional') as region,
        COALESCE(to_char(created_at, 'YYYY-MM-DD'), to_char(fecha_creacion, 'YYYY-MM-DD'), '') as fecha
      FROM chismes
      WHERE estado = 'aprobado'
      ORDER BY COALESCE(created_at, fecha_creacion) DESC NULLS LAST, id DESC
      LIMIT 200;
    `;

    return res.status(200).json({ success: true, pendientes, aprobados });
  } catch (error) {
    console.error('Error get-admin-chismes:', error);
    return res.status(500).json({ error: 'Error cargando chismes admin' });
  }
}

