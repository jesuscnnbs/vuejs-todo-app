import { pgTable, serial, integer, text, varchar, boolean, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Tabla de usuarios
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),

  // Hash de la contraseña con bcrypt
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),

  // Sistema de roles y permisos
  role: varchar('role', { length: 20 }).notNull().default('user'), // 'user' | 'admin'
  isActive: boolean('is_active').notNull().default(true),

  // Timestamps para auditoría
  createdAt: timestamp('created_at').notNull().defaultNow(),
  lastLogin: timestamp('last_login'),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

// Tabla de todos
export const todos = pgTable('todos', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),

  title: varchar('title', { length: 500 }).notNull(),
  description: text('description'),

  // Estado y prioridad de la tarea
  completed: boolean('completed').notNull().default(false),
  priority: varchar('priority', { length: 20 }).notNull().default('medium'), // 'low' | 'medium' | 'high'

  // Fechas relevantes
  dueDate: timestamp('due_date'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

// Relaciones
export const usersRelations = relations(users, ({ many }) => ({
  todos: many(todos)
}))

export const todosRelations = relations(todos, ({ one }) => ({
  user: one(users, {
    fields: [todos.userId],
    references: [users.id]
  })
}))

// Tipos TypeScript inferidos
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Todo = typeof todos.$inferSelect
export type NewTodo = typeof todos.$inferInsert
