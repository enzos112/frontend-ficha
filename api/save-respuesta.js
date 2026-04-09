import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const sql = neon(process.env.DATABASE_URL);
  
  const { uuid, pregunta_id, opcion_id } = req.body;

  if (!uuid || !pregunta_id || !opcion_id) {
    return res.status(400).json({ error: 'Datos incompletos para registrar la respuesta' });
  }

  try {
    await sql`
      INSERT INTO respuestas_usuarios (sesion_id, pregunta_id, opcion_id)
      VALUES (${uuid}, ${pregunta_id}, ${opcion_id})
      ON CONFLICT (sesion_id, pregunta_id) DO NOTHING
    `;

    return res.status(200).json({ 
      success: true,
      message: 'Respuesta guardada'
    });

  } catch (error) {
    console.error('Error al guardar respuesta:', error);
    return res.status(500).json({ error: 'Hubo un error al registrar tu decisión' });
  }
}