import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema.js'

/**
 * Inicializa y retorna la instancia de Drizzle ORM
 * conectada a Neon Database mediante HTTP
 *
 * Esta función es compatible con Vercel Edge Functions
 * y no requiere pools de conexión tradicionales
 */
export function getDb() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL

  if (!connectionString) {
    throw new Error(
      'DATABASE_URL ni POSTGRES_URL está definida. Verifica tus variables de entorno.',
    )
  }

  // Cliente HTTP de Neon (sin conexión TCP persistente)
  const sql = neon(connectionString)

  // Retornar instancia de Drizzle con schema incluido
  return drizzle(sql, { schema })
}
