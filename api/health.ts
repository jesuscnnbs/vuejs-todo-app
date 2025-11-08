import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getDb } from '../db/connection.js'
import { sql } from 'drizzle-orm'

/**
 * Endpoint de salud para verificar la conexión a la base de datos
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const db = getDb()

    // Ejecutar una consulta simple para verificar la conexión
    const result: any = await db.execute(sql`SELECT NOW() as current_time, version() as db_version`)

    res.status(200).json({
      status: 'OK',
      message: 'Conexión a la base de datos exitosa',
      database: {
        currentTime: result[0]?.current_time,
        version: result[0]?.db_version,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error en health check:', error)

    res.status(500).json({
      status: 'ERROR',
      message: 'Fallo en la conexión a la base de datos',
      error: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString(),
    })
  }
}
