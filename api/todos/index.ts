import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../db/connection.js';
import { todos } from '../../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { verifyToken } from '../_utils/auth.js';

/**
 * CRUD de tareas del usuario autenticado
 * GET: Listar todas las tareas del usuario
 * POST: Crear nueva tarea
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const payload = verifyToken(req);

  if (!payload) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  const db = getDb();

  try {
    // GET: Obtener todas las tareas del usuario
    if (req.method === 'GET') {
      const userTodos = await db.query.todos.findMany({
        where: eq(todos.userId, payload.userId),
        orderBy: [desc(todos.createdAt)],
      });

      return res.status(200).json({ todos: userTodos });
    }

    // POST: Crear nueva tarea
    if (req.method === 'POST') {
      const { title, description, priority, dueDate } = req.body;

      if (!title || title.trim().length === 0) {
        return res.status(400).json({ error: 'El título es requerido' });
      }

      if (title.trim().length > 500) {
        return res.status(400).json({ error: 'El título no puede exceder 500 caracteres' });
      }

      // Validar prioridad si se proporciona
      const validPriorities = ['low', 'medium', 'high'];
      if (priority && !validPriorities.includes(priority)) {
        return res.status(400).json({ error: 'Prioridad inválida. Usa: low, medium o high' });
      }

      const [newTodo] = await db
        .insert(todos)
        .values({
          userId: payload.userId,
          title: title.trim(),
          description: description?.trim() || null,
          priority: priority || 'medium',
          dueDate: dueDate ? new Date(dueDate) : null,
        })
        .returning();

      return res.status(201).json({ todo: newTodo });
    }

    return res.status(405).json({ error: 'Método no permitido' });

  } catch (error) {
    console.error('Error en endpoint de todos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
