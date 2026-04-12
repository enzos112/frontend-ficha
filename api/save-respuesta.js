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
    // 1. Guardamos la respuesta del usuario
    await sql`
      INSERT INTO respuestas_usuarios (sesion_id, pregunta_id, opcion_id)
      VALUES (${uuid}, ${pregunta_id}, ${opcion_id})
      ON CONFLICT (sesion_id, pregunta_id) DO NOTHING
    `;

    // 2. Calculamos el porcentaje real de esta opción frente al total de la pregunta
    const stats = await sql`
      WITH total_pregunta AS (
        SELECT COUNT(*) as total FROM respuestas_usuarios WHERE pregunta_id = ${pregunta_id}
      ),
      total_opcion AS (
        SELECT COUNT(*) as votos FROM respuestas_usuarios WHERE opcion_id = ${opcion_id}
      )
      SELECT 
        total_opcion.votos, 
        total_pregunta.total,
        ROUND((total_opcion.votos::numeric / total_pregunta.total::numeric) * 100) as porcentaje
      FROM total_opcion, total_pregunta;
    `;

    // Si es la primera vez que se responde, será el 100%
    const porcentajeFinal = stats[0]?.porcentaje || 100;

    return res.status(200).json({ 
      success: true,
      message: 'Respuesta guardada',
      porcentaje: Number(porcentajeFinal) // 👈 Devolvemos el número
    });

  } catch (error) {
    console.error('Error al guardar respuesta:', error);
    return res.status(500).json({ error: 'Hubo un error al registrar tu decisión' });
  }
}