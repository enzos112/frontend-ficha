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
  const { id } = req.body || {};

  if (!id) return res.status(400).json({ error: 'Falta id' });

  try {
    await sql`DELETE FROM chismes WHERE id::text = ${String(id)}::text;`;
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error delete-chisme:', error);
    return res.status(500).json({ error: 'Error borrando chisme' });
  }
}

