import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    const chismes = await sql`
      SELECT texto_chisme 
      FROM chismes 
      WHERE estado = 'aprobado' 
      ORDER BY RANDOM() 
      LIMIT 1
    `;

    if (chismes.length === 0) {
      return res.status(200).json({ 
        texto_chisme: "El barrio está recontra callado hoy... ¡Asegúrate de dejar tu chisme picante al terminar tu ficha!" 
      });
    }

    // Si hay chismes, mandamos el ganador
    return res.status(200).json(chismes[0]);

  } catch (error) {
    console.error('Error al obtener chisme:', error);
    return res.status(500).json({ error: 'Hubo una interferencia al captar el chisme' });
  }
}