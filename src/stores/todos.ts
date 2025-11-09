import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Todo, CreateTodoInput, UpdateTodoInput } from '@/types'
import { useApi } from '@/composables/useApi'

export const useTodosStore = defineStore('todos', () => {
  const { apiClient } = useApi()

  // Estado
  const todos = ref<Todo[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed - Estadísticas
  const totalTodos = computed(() => todos.value.length)
  const completedTodos = computed(() => todos.value.filter((t) => t.completed).length)
  const pendingTodos = computed(() => todos.value.filter((t) => !t.completed).length)

  // Computed - Filtros por prioridad
  const todosByPriority = computed(() => ({
    high: todos.value.filter((t) => t.priority === 'high' && !t.completed),
    medium: todos.value.filter((t) => t.priority === 'medium' && !t.completed),
    low: todos.value.filter((t) => t.priority === 'low' && !t.completed),
  }))

  /**
   * Obtener todas las tareas del usuario
   */
  async function fetchTodos() {
    try {
      loading.value = true
      error.value = null

      const response = await apiClient.get('/todos')
      todos.value = response.data.todos
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Error cargando tareas'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Crear una nueva tarea
   */
  async function createTodo(input: CreateTodoInput) {
    try {
      loading.value = true
      error.value = null

      const response = await apiClient.post('/todos', input)
      todos.value.unshift(response.data.todo)
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Error creando tarea'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualizar una tarea existente
   */
  async function updateTodo(id: number, updates: UpdateTodoInput) {
    try {
      loading.value = true
      error.value = null

      const response = await apiClient.put(`/todos/${id}`, updates)
      const updatedTodo = response.data.todo

      const index = todos.value.findIndex((t) => t.id === id)
      if (index !== -1) {
        todos.value[index] = updatedTodo
      }
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Error actualizando tarea'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Toggle estado completado de una tarea
   */
  async function toggleTodo(id: number) {
    const todo = todos.value.find((t) => t.id === id)
    if (!todo) return

    await updateTodo(id, { completed: !todo.completed })
  }

  /**
   * Eliminar una tarea
   */
  async function deleteTodo(id: number) {
    try {
      loading.value = true
      error.value = null

      await apiClient.delete(`/todos/${id}`)
      todos.value = todos.value.filter((t) => t.id !== id)
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Error eliminando tarea'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // Estado
    todos,
    loading,
    error,
    // Getters
    totalTodos,
    completedTodos,
    pendingTodos,
    todosByPriority,
    // Actions
    fetchTodos,
    createTodo,
    updateTodo,
    toggleTodo,
    deleteTodo,
  }
})
