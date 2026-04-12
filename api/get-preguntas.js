import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  try {
    const sql = neon(process.env.DATABASE_URL);
    
    // 1. Recibimos el ADN del usuario desde el frontend
    const { uuid, region, edad, genero } = req.query;

    if (!uuid) {
      return res.status(400).json({ error: "Expediente (UUID) no proporcionado" });
    }

    // Si el usuario no mandó datos, asumimos los más amplios por defecto
    const userRegion = region || 'nacional';
    const userEdad   = edad   || 'general';
    const userGenero = genero || 'general';

    // 2. EL ALGORITMO DE HIPER-PERSONALIZACIÓN
    // Esta consulta trae 20 preguntas al azar que:
    // - Sean de su región (o nacionales)
    // - Sean de su rango de edad (o generales)
    // - Sean de su género (o generales)
    // - Y LO MÁS IMPORTANTE: Que no las haya respondido antes en sesiones previas

    const preguntas = await sql`
      SELECT 
        p.id, 
        p.texto_pregunta as texto, 
        p.region, 
        p.edad, 
        p.genero,
        json_agg(
          json_build_object(
            'id', o.id, 
            'texto', o.texto_opcion, 
            'perfil', o.perfil_id
          )
        ) as opciones
      FROM preguntas p
      JOIN opciones o ON p.id = o.pregunta_id
      WHERE (p.region = ${userRegion} OR p.region = 'nacional')
        AND (p.edad = ${userEdad} OR p.edad = 'general')
        AND (p.genero = ${userGenero} OR p.genero = 'general')
        AND p.id NOT IN (
          SELECT pregunta_id FROM respuestas WHERE uuid = ${uuid}
        )
      GROUP BY p.id
      ORDER BY RANDOM()
      LIMIT 20;
    `;

    // Si el array está vacío, significa que el usuario ya se acabó toda la base de datos
    if (preguntas.length === 0) {
      return res.status(200).json({ finished: true, message: "No hay más preguntas disponibles para este perfil." });
    }

    return res.status(200).json(preguntas);

  } catch (error) {
    console.error("Error en el algoritmo de preguntas:", error);
    return res.status(500).json({ error: "Error interno procesando el expediente" });
  }
}