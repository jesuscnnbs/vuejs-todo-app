import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../db/connection.js';
import { users } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import { verifyToken } from '../_utils/auth.js';

/**
 * Verifica la validez del token JWT y retorna datos del usuario
 * Utilizado para mantener la sesión activa en el frontend
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const payload = verifyToken(req);

    if (!payload) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }

    const db = getDb();

    // Obtener datos actualizados del usuario
    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
      columns: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLogin: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Cuenta desactivada' });
    }

    res.status(200).json({ user });

  } catch (error) {
    console.error('Error verificando token:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
