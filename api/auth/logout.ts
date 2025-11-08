import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../db/connection.js';
import { sessions } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import { verifyToken } from '../_utils/auth.js';

/**
 * Cierra la sesión del usuario eliminando el token de la base de datos
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const payload = verifyToken(req);

    if (!payload) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const authHeader = req.headers.authorization;
    const token = authHeader?.substring(7); // Remover "Bearer "

    if (token) {
      const db = getDb();

      // Eliminar la sesión de la base de datos
      await db.delete(sessions).where(eq(sessions.token, token));
    }

    res.status(200).json({ message: 'Sesión cerrada exitosamente' });

  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({ error: 'Error cerrando sesión' });
  }
}
