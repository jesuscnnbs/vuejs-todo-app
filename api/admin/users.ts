import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../db/connection.js';
import { users, todos } from '../../db/schema.js';
import { eq, sql, desc } from 'drizzle-orm';
import { verifyToken, requireAdmin } from '../_utils/auth.js';

/**
 * Endpoint protegido solo para administradores
 * Retorna lista de usuarios con estadísticas de sus tareas
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const payload = verifyToken(req);

  if (!requireAdmin(payload)) {
    return res.status(403).json({
      error: 'Acceso denegado. Se requieren permisos de administrador.'
    });
  }

  try {
    const db = getDb();

    // Obtener usuarios con conteo de tareas usando JOIN
    const usersWithStats = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
        lastLogin: users.lastLogin,
        totalTodos: sql<number>`cast(count(${todos.id}) as int)`,
        completedTodos: sql<number>`cast(sum(case when ${todos.completed} then 1 else 0 end) as int)`,
      })
      .from(users)
      .leftJoin(todos, eq(users.id, todos.userId))
      .groupBy(users.id)
      .orderBy(desc(users.createdAt));

    res.status(200).json({ users: usersWithStats });

  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
