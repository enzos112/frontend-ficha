import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const sql = neon(process.env.DATABASE_URL);
  const { uuid } = req.body;

  if (!uuid) return res.status(400).json({ error: 'Falta UUID' });

  try {
    // 1. EL CÁLCULO MATEMÁTICO EN SQL PURO
    // Sumamos los pesos de las opciones marcadas, agrupamos por perfil 
    // y ordenamos de mayor a menor. Si hay empate, RANDOM() decide.
    const resultados = await sql`
      WITH Conteo AS (
        SELECT o.perfil_id, SUM(o.peso) as total_puntos
        FROM respuestas_usuarios ru
        JOIN opciones o ON ru.opcion_id = o.id
        WHERE ru.sesion_id = ${uuid}
        GROUP BY o.perfil_id
      )
      SELECT c.perfil_id, p.nombre_ficha, p.frase_personal, c.total_puntos
      FROM Conteo c
      JOIN perfiles p ON c.perfil_id = p.id
      ORDER BY c.total_puntos DESC, RANDOM()
      LIMIT 1;
    `;

    // Si por alguna razón el usuario no contestó nada:
    if (resultados.length === 0) {
      return res.status(400).json({ error: 'Aún no has respondido suficientes preguntas.' });
    }

    const fichaGanadora = resultados[0];

    // 2. GUARDAMOS EL SELLO FINAL EN LA SESIÓN DEL USUARIO
    await sql`
      UPDATE sesiones 
      SET perfil_final_id = ${fichaGanadora.perfil_id} 
      WHERE id = ${uuid}
    `;

    // 3. LE DEVOLVEMOS SU PREMIO AL FRONTEND
    return res.status(200).json({
      success: true,
      perfil: fichaGanadora.nombre_ficha,
      frase: fichaGanadora.frase_personal,
      mensaje: '¡Trámite finalizado con éxito!'
    });

  } catch (error) {
    console.error('Error al calcular resultado:', error);
    return res.status(500).json({ error: 'El sistema de la ONPE se cayó, intenta de nuevo.' });
  }
}