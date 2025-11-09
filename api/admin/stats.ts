import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../db/connection.js';
import { users, todos, sessions } from '../../db/schema.js';
import { sql, gt } from 'drizzle-orm';
import { verifyToken, requireAdmin } from '../_utils/auth.js';

/**
 * Estadísticas generales de la aplicación
 * Solo accesible por administradores
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const payload = verifyToken(req);

  if (!requireAdmin(payload)) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  try {
    const db = getDb();

    // Estadísticas de usuarios
    const [userStats] = await db
      .select({
        totalUsers: sql<number>`cast(count(*) as int)`,
        activeUsers: sql<number>`cast(sum(case when ${users.isActive} then 1 else 0 end) as int)`,
        adminUsers: sql<number>`cast(sum(case when ${users.role} = 'admin' then 1 else 0 end) as int)`,
      })
      .from(users);

    // Estadísticas de tareas
    const [todoStats] = await db
      .select({
        totalTodos: sql<number>`cast(count(*) as int)`,
        completedTodos: sql<number>`cast(sum(case when ${todos.completed} then 1 else 0 end) as int)`,
        pendingTodos: sql<number>`cast(sum(case when not ${todos.completed} then 1 else 0 end) as int)`,
      })
      .from(todos);

    // Sesiones activas (no expiradas)
    const [sessionStats] = await db
      .select({
        activeSessions: sql<number>`cast(count(*) as int)`,
      })
      .from(sessions)
      .where(gt(sessions.expiresAt, new Date()));

    res.status(200).json({
      stats: {
        users: userStats,
        todos: todoStats,
        sessions: sessionStats,
      },
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
