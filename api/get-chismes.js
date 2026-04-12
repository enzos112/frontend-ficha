import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);
  const { region } = req.query;

  try {
    const chismes = await sql`
      SELECT 
        id, 
        texto_chisme as texto, 
        region,
        json_build_object(
          'risa', reac_risa,
          'enojo', reac_enojo,
          'fuego', reac_fuego,
          'sorpresa', reac_sorpresa
        ) as reacciones
      FROM chismes 
      WHERE estado = 'aprobado'
      -- Si no hay de la region, trae cualquiera (nacional)
      AND (LOWER(region) = LOWER(${region || 'nacional'}) OR region = 'nacional')
      ORDER BY RANDOM() 
      LIMIT 15
    `;

    return res.status(200).json(chismes);
  } catch (error) {
    console.error('Error al obtener chismes:', error);
    return res.status(500).json({ error: 'Error en el radar de chismes' });
  }
}