import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const sql = neon(process.env.DATABASE_URL);
  const { uuid } = req.body;

  if (!uuid) return res.status(400).json({ error: 'Falta UUID' });

  try {
    const resultados = await sql`
      WITH Conteo AS (
        SELECT o.perfil_id, SUM(o.peso) as total_puntos
        FROM respuestas_usuarios ru
        JOIN opciones o ON ru.opcion_id = o.id
        WHERE ru.sesion_id::text = ${uuid}::text -- 👈 Cast en ambos lados
        GROUP BY o.perfil_id
      )
      SELECT c.perfil_id, p.nombre_ficha, p.frase_personal, c.total_puntos
      FROM Conteo c
      JOIN perfiles p ON c.perfil_id = p.id
      ORDER BY c.total_puntos DESC, RANDOM()
      LIMIT 1;
    `;

    if (resultados.length === 0) {
      return res.status(400).json({ error: 'Aún no has respondido suficientes preguntas.' });
    }

    const fichaGanadora = resultados[0];

    // Guardamos el perfil en la sesión (Cast en el ID de la sesión)
    await sql`
      UPDATE sesiones 
      SET perfil_final_id = ${fichaGanadora.perfil_id} 
      WHERE id::text = ${uuid}::text
    `;

    return res.status(200).json({
      success: true,
      perfil: fichaGanadora.nombre_ficha,
      frase: fichaGanadora.frase_personal
    });

  } catch (error) {
    console.error('Error al calcular resultado:', error);
    return res.status(500).json({ error: 'Error al procesar tu ficha política.' });
  }
}