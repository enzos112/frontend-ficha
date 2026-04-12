import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { uuid, chisme_id, emoji_key } = req.body;
  const sql = neon(process.env.DATABASE_URL);

  if (!uuid || !chisme_id || !emoji_key) return res.status(400).json({ error: 'Faltan datos' });

  try {
    // 1. Verificamos si ya existe un voto previo (Casteamos ambos a text)
    const votoPrevio = await sql`
      SELECT emoji_key FROM chismes_votos 
      WHERE sesion_id::text = ${uuid}::text 
      AND chisme_id = ${chisme_id}
    `;

    const columnaNueva = `reac_${emoji_key}`;

    if (votoPrevio.length > 0) {
      const anterior = votoPrevio[0].emoji_key;
      const columnaAnterior = `reac_${anterior}`;
      
      if (anterior === emoji_key) {
        // CASO A: Quitar reacción
        await sql`DELETE FROM chismes_votos WHERE sesion_id::text = ${uuid}::text AND chisme_id = ${chisme_id}`;
        // Para nombres de columnas dinámicos en Neon, usamos identificadores crudos con cuidado
        await sql.query(`UPDATE chismes SET ${columnaAnterior} = ${columnaAnterior} - 1 WHERE id = $1`, [chisme_id]);
        
        return res.status(200).json({ action: 'removed' });
      } 
      
      // CASO B: Cambiar reacción
      await sql`UPDATE chismes_votos SET emoji_key = ${emoji_key} WHERE sesion_id::text = ${uuid}::text AND chisme_id = ${chisme_id}`;
      await sql.query(`
        UPDATE chismes 
        SET ${columnaAnterior} = ${columnaAnterior} - 1, 
            ${columnaNueva} = ${columnaNueva} + 1 
        WHERE id = $1
      `, [chisme_id]);

      return res.status(200).json({ action: 'changed' });
    }

    // CASO C: Voto nuevo
    await sql`INSERT INTO chismes_votos (sesion_id, chisme_id, emoji_key) VALUES (${uuid}::text, ${chisme_id}, ${emoji_key})`;
    await sql.query(`UPDATE chismes SET ${columnaNueva} = ${columnaNueva} + 1 WHERE id = $1`, [chisme_id]);
    
    return res.status(200).json({ action: 'added' });

  } catch (error) {
    console.error('Error en reacciones:', error);
    return res.status(500).json({ error: 'Error en el sistema de reacciones' });
  }
}