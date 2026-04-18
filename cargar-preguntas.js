import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import 'dotenv/config';

// Conectamos a Neon usando la URL de tu .env
const sql = neon(process.env.DATABASE_URL);

async function poblarBaseDeDatos() {
  try {
    if (!process.env.DATABASE_URL) {
      console.error("❌ Falta DATABASE_URL en tu entorno/.env");
      process.exit(1);
    }

    // 1. Leer el archivo JSON que acabas de guardar
    console.log("📦 Leyendo el archivo preguntas_data.json...");
    const data = fs.readFileSync('./preguntas_data.json', 'utf8');
    const preguntas = JSON.parse(data);

    console.log(`🚀 Iniciando la inserción masiva de ${preguntas.length} preguntas...`);

    let insertadas = 0;
    let yaExistian = 0;

    // 2. Bucle para insertar pregunta por pregunta
    for (const p of preguntas) {
      // A. Si ya existe (por texto + demografía), la reutilizamos para que sea idempotente
      const existente = await sql`
        SELECT id
        FROM preguntas
        WHERE texto_pregunta = ${p.texto}
          AND region = ${p.region}
          AND edad = ${p.edad}
          AND genero = ${p.genero}
        LIMIT 1
      `;

      let preguntaId;
      if (existente.length > 0) {
        preguntaId = existente[0].id;
        yaExistian++;
      } else {
        const resPregunta = await sql`
          INSERT INTO preguntas (texto_pregunta, region, edad, genero, etiquetas)
          VALUES (${p.texto}, ${p.region}, ${p.edad}, ${p.genero}, ${JSON.stringify(p.etiquetas)})
          RETURNING id
        `;
        preguntaId = resPregunta[0].id;
      }

      // B. Insertar la opción izquierda amarrada a la pregunta
      // (Evita duplicar si vuelves a correr el script)
      await sql`
        INSERT INTO opciones (pregunta_id, texto_opcion, perfil_id)
        SELECT ${preguntaId}, ${p.izquierda.texto}, ${p.izquierda.perfil}
        WHERE NOT EXISTS (
          SELECT 1 FROM opciones
          WHERE pregunta_id = ${preguntaId}
            AND texto_opcion = ${p.izquierda.texto}
            AND perfil_id = ${p.izquierda.perfil}
        )
      `;

      // C. Insertar la opción derecha amarrada a la pregunta
      await sql`
        INSERT INTO opciones (pregunta_id, texto_opcion, perfil_id)
        SELECT ${preguntaId}, ${p.derecha.texto}, ${p.derecha.perfil}
        WHERE NOT EXISTS (
          SELECT 1 FROM opciones
          WHERE pregunta_id = ${preguntaId}
            AND texto_opcion = ${p.derecha.texto}
            AND perfil_id = ${p.derecha.perfil}
        )
      `;

      insertadas++;
      console.log(`✅ [${insertadas}/${preguntas.length}] Procesada: ${p.texto.substring(0, 35)}...`);
    }

    console.log(`\n🎉 Listo. Procesadas: ${insertadas}. Nuevas: ${insertadas - yaExistian}. Ya existían: ${yaExistian}.`);
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Ocurrió un error crítico durante la subida:", error);
    process.exit(1);
  }
}

// Ejecutar la función
poblarBaseDeDatos();