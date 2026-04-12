import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import 'dotenv/config';

// Conectamos a Neon usando la URL de tu .env
const sql = neon(process.env.DATABASE_URL);

async function poblarBaseDeDatos() {
  try {
    // 1. Leer el archivo JSON que acabas de guardar
    console.log("📦 Leyendo el archivo preguntas_data.json...");
    const data = fs.readFileSync('./preguntas_data.json', 'utf8');
    const preguntas = JSON.parse(data);

    console.log(`🚀 Iniciando la inserción masiva de ${preguntas.length} preguntas...`);

    let insertadas = 0;

    // 2. Bucle para insertar pregunta por pregunta
    for (const p of preguntas) {
      // A. Insertar la pregunta principal y obtener su ID generado
      const resPregunta = await sql`
        INSERT INTO preguntas (texto_pregunta, region, edad, genero, etiquetas)
        VALUES (${p.texto}, ${p.region}, ${p.edad}, ${p.genero}, ${JSON.stringify(p.etiquetas)})
        RETURNING id
      `;
      
      const preguntaId = resPregunta[0].id;

      // B. Insertar la opción izquierda amarrada a la pregunta
      await sql`
        INSERT INTO opciones (pregunta_id, texto_opcion, perfil_id)
        VALUES (${preguntaId}, ${p.izquierda.texto}, ${p.izquierda.perfil})
      `;

      // C. Insertar la opción derecha amarrada a la pregunta
      await sql`
        INSERT INTO opciones (pregunta_id, texto_opcion, perfil_id)
        VALUES (${preguntaId}, ${p.derecha.texto}, ${p.derecha.perfil})
      `;

      insertadas++;
      console.log(`✅ [${insertadas}/400] Insertada: ${p.texto.substring(0, 35)}...`);
    }

    console.log(`\n🎉 ¡ÉXITO TOTAL! Se insertaron las ${insertadas} preguntas con sus respectivas opciones en Neon.`);
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Ocurrió un error crítico durante la subida:", error);
    process.exit(1);
  }
}

// Ejecutar la función
poblarBaseDeDatos();