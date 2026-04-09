import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const sql = neon(process.env.DATABASE_URL);
  
  const { uuid } = req.query; 

  if (!uuid) {
    return res.status(400).json({ error: 'Se requiere identificación de ciudadano (UUID)' });
  }

  try {

    const preguntas = await sql`
      SELECT 
        p.id, 
        p.texto_pregunta,
        (
          SELECT json_agg(json_build_object('id', o.id, 'texto', o.texto_opcion))
          FROM opciones o
          WHERE o.pregunta_id = p.id
        ) AS opciones
      FROM preguntas p
      WHERE p.activa = true
      AND p.id NOT IN (
        SELECT pregunta_id FROM respuestas_usuarios WHERE sesion_id = ${uuid}
      )
      ORDER BY RANDOM()
      LIMIT 5
    `;

    if (preguntas.length === 0) {
      return res.status(200).json({ 
        finished: true, 
        message: 'Has completado todas las preguntas del padrón' 
      });
    }

    return res.status(200).json(preguntas);

  } catch (error) {
    console.error('Error en get-preguntas:', error);
    return res.status(500).json({ error: 'Error de conexión con la base de datos' });
  }
}