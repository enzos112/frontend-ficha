import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const sql = neon(process.env.DATABASE_URL);
  
  const { uuid, codigo_tramite, region } = req.body;

  if (!uuid || !codigo_tramite || !region) {
    return res.status(400).json({ 
      error: 'Faltan datos obligatorios: UUID, Código de Trámite y Región son necesarios.' 
    });
  }

  try {
    await sql`
      INSERT INTO sesiones (id, codigo_tramite, region)
      VALUES (${uuid}, ${codigo_tramite}, ${region})
      ON CONFLICT (id) 
      DO UPDATE SET 
        region = EXCLUDED.region,
        fecha_inicio = CURRENT_TIMESTAMP
    `;

    return res.status(200).json({ 
      success: true, 
      message: 'Sesión iniciada correctamente',
      data: { uuid, codigo_tramite, region }
    });

  } catch (error) {
    console.error('Error detallado en init-session:', error);
    
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Error de sincronización, intenta de nuevo.' });
    }

    return res.status(500).json({ error: 'No pudimos registrar tu sesión en el padrón.' });
  }
}