import { neon } from '@neondatabase/serverless';

function adminOk(req) {
  const pass = req.headers['x-admin-pass'];
  const expected = process.env.ADMIN_PASS || 'admin2026';
  return pass && String(pass) === String(expected);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
  if (!adminOk(req)) return res.status(401).json({ error: 'No autorizado' });

  const sql = neon(process.env.DATABASE_URL);
  const { id, estado, texto, region } = req.body || {};

  if (!id || !estado) return res.status(400).json({ error: 'Faltan datos: id y estado' });
  if (!['pendiente', 'aprobado', 'rechazado'].includes(estado)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }

  try {
    // Actualización flexible (solo cambia texto/region si llegan)
    if (typeof texto === 'string' && texto.trim() !== '' && typeof region === 'string' && region.trim() !== '') {
      await sql`
        UPDATE chismes
        SET estado = ${estado},
            texto_chisme = ${texto.trim()},
            region = ${region.trim()}
        WHERE id::text = ${String(id)}::text
      `;
    } else if (typeof texto === 'string' && texto.trim() !== '') {
      await sql`
        UPDATE chismes
        SET estado = ${estado},
            texto_chisme = ${texto.trim()}
        WHERE id::text = ${String(id)}::text
      `;
    } else if (typeof region === 'string' && region.trim() !== '') {
      await sql`
        UPDATE chismes
        SET estado = ${estado},
            region = ${region.trim()}
        WHERE id::text = ${String(id)}::text
      `;
    } else {
      await sql`
        UPDATE chismes
        SET estado = ${estado}
        WHERE id::text = ${String(id)}::text
      `;
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error update-chisme:', error);
    return res.status(500).json({ error: 'Error actualizando chisme' });
  }
}

