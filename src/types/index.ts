export interface User {
  id: number
  email: string
  name: string
  role: 'user' | 'admin'
  isActive: boolean
  createdAt: string
  lastLogin: string | null
}

// Tipos de autenticación
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
}

export interface AuthResponse {
  user: User
  token: string
}

// Tipos de tareas
export interface Todo {
  id: number
  userId: number
  title: string
  description: string | null
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  dueDate: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateTodoInput {
  title: string
  description?: string
  priority?: 'low' | 'medium' | 'high'
  dueDate?: string
}

export interface UpdateTodoInput {
  title?: string
  description?: string
  priority?: 'low' | 'medium' | 'high'
  dueDate?: string
  completed?: boolean
}

// Tipos del panel de admin
export interface UserWithStats extends User {
  totalTodos: number
  completedTodos: number
}

export interface AppStats {
  users: {
    totalUsers: number
    activeUsers: number
    adminUsers: number
  }
  todos: {
    totalTodos: number
    completedTodos: number
    pendingTodos: number
  }
  sessions: {
    activeSessions: number
  }
}
