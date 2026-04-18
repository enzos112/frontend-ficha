import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const sql = neon(process.env.DATABASE_URL);
  const { uuid, texto_chisme, region } = req.body;

  // Si el usuario le dio a "Enviar" pero lo dejó vacío
  if (!uuid || !texto_chisme || texto_chisme.trim() === '') {
    return res.status(400).json({ error: 'El chisme no puede estar vacío' });
  }

  try {
    if (region && String(region).trim() !== '') {
      await sql`
        INSERT INTO chismes (sesion_id, texto_chisme, region)
        VALUES (${uuid}, ${texto_chisme}, ${String(region).trim()})
      `;
    } else {
      await sql`
        INSERT INTO chismes (sesion_id, texto_chisme)
        VALUES (${uuid}, ${texto_chisme})
      `;
    }

    return res.status(200).json({ 
      success: true, 
      message: '¡Chisme enviado! Nuestros tíos de la municipalidad lo están revisando.' 
    });

  } catch (error) {
    console.error('Error al guardar chisme:', error);
    return res.status(500).json({ error: 'La línea está saturada, no pudimos guardar tu chisme.' });
  }
}