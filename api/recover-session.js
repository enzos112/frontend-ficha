import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const sql = neon(process.env.DATABASE_URL);
  const { codigo_tramite } = req.body;

  if (!codigo_tramite) return res.status(400).json({ error: 'Falta el código de trámite' });

  try {
    // Buscamos la sesión exacta
    const result = await sql`
      SELECT id as uuid, region, perfil_final_id
      FROM sesiones
      WHERE codigo_tramite = ${codigo_tramite}
      LIMIT 1
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'No se encontró ningún trámite con ese código en el padrón.' });
    }

    return res.status(200).json({ success: true, sesion: result[0] });
  } catch (error) {
    console.error('Error recuperando sesión:', error);
    return res.status(500).json({ error: 'Error al buscar en el archivo central.' });
  }
}