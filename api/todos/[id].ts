import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../db/connection.js';
import { todos } from '../../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { verifyToken } from '../_utils/auth.js';

/**
 * Operaciones sobre una tarea específica
 * PUT: Actualizar tarea (toggle completed, editar datos)
 * DELETE: Eliminar tarea
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const payload = verifyToken(req);

  if (!payload) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  const { id } = req.query;
  const todoId = parseInt(id as string);

  if (isNaN(todoId)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  const db = getDb();

  try {
    // Verificar que la tarea pertenece al usuario
    const existingTodo = await db.query.todos.findFirst({
      where: and(
        eq(todos.id, todoId),
        eq(todos.userId, payload.userId)
      ),
    });

    if (!existingTodo) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    // PUT: Actualizar tarea
    if (req.method === 'PUT') {
      const updates: any = {
        updatedAt: new Date(),
      };

      // Actualizar campos proporcionados
      if (req.body.title !== undefined) {
        if (!req.body.title.trim()) {
          return res.status(400).json({ error: 'El título no puede estar vacío' });
        }
        updates.title = req.body.title.trim();
      }

      if (req.body.description !== undefined) {
        updates.description = req.body.description?.trim() || null;
      }

      if (req.body.priority !== undefined) {
        const validPriorities = ['low', 'medium', 'high'];
        if (!validPriorities.includes(req.body.priority)) {
          return res.status(400).json({ error: 'Prioridad inválida' });
        }
        updates.priority = req.body.priority;
      }

      if (req.body.dueDate !== undefined) {
        updates.dueDate = req.body.dueDate ? new Date(req.body.dueDate) : null;
      }

      // Manejar toggle de completado
      if (req.body.completed !== undefined) {
        updates.completed = req.body.completed;
        updates.completedAt = req.body.completed ? new Date() : null;
      }

      const [updatedTodo] = await db
        .update(todos)
        .set(updates)
        .where(eq(todos.id, todoId))
        .returning();

      return res.status(200).json({ todo: updatedTodo });
    }

    // DELETE: Eliminar tarea
    if (req.method === 'DELETE') {
      await db.delete(todos).where(eq(todos.id, todoId));
      return res.status(200).json({ message: 'Tarea eliminada exitosamente' });
    }

    return res.status(405).json({ error: 'Método no permitido' });

  } catch (error) {
    console.error('Error en operación de todo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
