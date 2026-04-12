import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const sql = neon(process.env.DATABASE_URL);
  const { uuid } = req.body;

  if (!uuid) return res.status(400).json({ error: 'Falta UUID' });

  try {
    // 1. LA CONSULTA MAESTRA (Saca puntos y calcula el % del ADN)
    const resultados = await sql`
      WITH Conteo AS (
        SELECT o.perfil_id, SUM(o.peso) as puntos
        FROM respuestas_usuarios ru
        JOIN opciones o ON ru.opcion_id = o.id
        WHERE ru.sesion_id::text = ${uuid}::text
        GROUP BY o.perfil_id
      ),
      Total AS (
        SELECT SUM(puntos) as total_general FROM Conteo
      )
      SELECT 
        p.id, 
        p.nombre_ficha as nombre, 
        p.frase_personal as frase,
        c.puntos,
        ROUND((c.puntos::numeric / t.total_general) * 100) as porcentaje
      FROM Conteo c
      CROSS JOIN Total t
      JOIN perfiles p ON c.perfil_id = p.id
      ORDER BY c.puntos DESC, RANDOM();
    `;

    if (resultados.length === 0) {
      return res.status(400).json({ error: 'Aún no has respondido suficientes preguntas.' });
    }

    // 2. EXTRAEMOS AL GANADOR Y EL TOP 3 (Para el ADN)
    const ganador = resultados[0];
    
    // Paleta de colores chicha para las barras del ADN
    const coloresHex = ["#FF00AA", "#FFFF00", "#00FF41"]; 
    
    const adnStats = resultados.slice(0, 3).map((r, index) => ({
      nombre: r.nombre,
      valor: Number(r.porcentaje),
      color: coloresHex[index] || "#FF6B00"
    }));

    // 3. ARMAMOS EL OBJETO EXACTO QUE ESPERA ResultView.jsx
    const perfilCompleto = {
      id: ganador.id,
      nombre: ganador.nombre,
      frase: ganador.frase,
      codigo: `FCH-${uuid.substring(0, 4).toUpperCase()}`, // Simulamos un código de exp.
      stats: adnStats
    };

    // 4. GUARDAMOS AL GANADOR EN LA SESIÓN (Cast de UUID a Text)
    await sql`
      UPDATE sesiones 
      SET perfil_final_id = ${ganador.id} 
      WHERE id::text = ${uuid}::text
    `;

    // 5. ENVIAMOS LA DATA
    return res.status(200).json({
      success: true,
      perfil: perfilCompleto
    });

  } catch (error) {
    console.error('Error al calcular resultado:', error);
    return res.status(500).json({ error: 'Error al procesar tu ficha.' });
  }
}