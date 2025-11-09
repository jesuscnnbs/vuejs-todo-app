<script setup lang="ts">
import { ref, watch } from 'vue'
import { useTodosStore } from '@/stores/todos'

interface Todo {
  id: number
  title: string
  description?: string | null
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  dueDate?: string | null
  createdAt: string
}

interface Props {
  todo: Todo
}

const props = defineProps<Props>()
const todosStore = useTodosStore()

// Estados locales
const isEditing = ref(false)
const editTitle = ref(props.todo.title)
const editDescription = ref(props.todo.description || '')
const isToggling = ref(false)
const isDeleting = ref(false)
const isSaving = ref(false)

// Estado optimista para el checkbox
const localCompleted = ref(props.todo.completed)

// Sincronizar con props cuando cambie desde el store
watch(
  () => props.todo.completed,
  (newVal) => {
    localCompleted.value = newVal
  },
)

// AbortController para cancelar peticiones previas
let toggleAbortController: AbortController | null = null

const priorityColors = {
  low: 'badge-info',
  medium: 'badge-warning',
  high: 'badge-error',
}

// Toggle con cancelación de peticiones previas y UI optimista
const handleToggle = async () => {
  // Actualización optimista - cambiar inmediatamente el estado local
  const newCompletedState = !localCompleted.value
  localCompleted.value = newCompletedState

  // Cancelar petición anterior si existe
  if (toggleAbortController) {
    toggleAbortController.abort()
  }

  // Crear nuevo AbortController
  toggleAbortController = new AbortController()

  try {
    isToggling.value = true
    await todosStore.updateTodo(
      props.todo.id,
      { completed: newCompletedState },
      toggleAbortController.signal,
    )
  } catch (err: any) {
    // Si falla (no cancelado), revertir el estado local
    if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
      localCompleted.value = !newCompletedState
      console.error('Error toggling todo:', err)
    }
  } finally {
    isToggling.value = false
  }
}

// Eliminar
const handleDelete = async () => {
  if (!confirm('¿Estás seguro de eliminar esta tarea?')) return

  try {
    isDeleting.value = true
    await todosStore.deleteTodo(props.todo.id)
  } catch (err) {
    console.error('Error deleting todo:', err)
  } finally {
    isDeleting.value = false
  }
}

// Editar
const startEdit = () => {
  isEditing.value = true
  editTitle.value = props.todo.title
  editDescription.value = props.todo.description || ''
}

const saveEdit = async () => {
  if (!editTitle.value.trim()) return

  try {
    isSaving.value = true
    await todosStore.updateTodo(props.todo.id, {
      title: editTitle.value,
      description: editDescription.value,
    })
    isEditing.value = false
  } catch (err) {
    console.error('Error updating todo:', err)
  } finally {
    isSaving.value = false
  }
}

const cancelEdit = () => {
  isEditing.value = false
  editTitle.value = props.todo.title
  editDescription.value = props.todo.description || ''
}
</script>

<template>
  <div
    class="card bg-base-100 shadow-md hover:shadow-lg transition-shadow border-b border-primary/50"
  >
    <div class="card-body p-4">
      <!-- Edit Mode -->
      <template v-if="isEditing">
        <input
          v-model="editTitle"
          type="text"
          class="input input-bordered w-full mb-2"
          placeholder="Todo title"
        />
        <textarea
          v-model="editDescription"
          class="textarea textarea-bordered w-full mb-2"
          placeholder="Description (optional)"
          rows="2"
        ></textarea>
        <div class="flex gap-2">
          <button @click="saveEdit" class="btn btn-primary btn-sm" :disabled="isSaving">
            <span v-if="isSaving" class="loading loading-spinner loading-xs"></span>
            {{ isSaving ? 'Saving...' : 'Save' }}
          </button>
          <button @click="cancelEdit" class="btn btn-ghost btn-sm" :disabled="isSaving">
            Cancel
          </button>
        </div>
      </template>

      <!-- View Mode -->
      <template v-else>
        <div class="flex items-start gap-3">
          <!-- Checkbox -->
          <input
            type="checkbox"
            :checked="localCompleted"
            @change="handleToggle"
            class="checkbox checkbox-primary mt-1"
          />

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <h3
              :class="[
                'font-semibold text-lg',
                todo.completed && 'line-through text-base-content/50',
              ]"
            >
              {{ todo.title }}
            </h3>
            <p v-if="todo.description" class="text-sm text-base-content/70 mt-1">
              {{ todo.description }}
            </p>

            <!-- Metadata -->
            <div class="flex flex-wrap gap-2 mt-2">
              <span :class="['badge badge-sm', priorityColors[todo.priority]]">
                {{ todo.priority }}
              </span>
              <span v-if="todo.dueDate" class="badge badge-sm badge-ghost">
                Due: {{ new Date(todo.dueDate).toLocaleDateString() }}
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="dropdown dropdown-end">
            <div tabindex="0" role="button" class="btn btn-ghost btn-sm px-2">
              <span
                v-if="isDeleting || isToggling"
                class="loading loading-spinner loading-sm"
              ></span>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                class="w-5 h-5"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 6h.01M12 12h.01M12 18h.01"
                />
              </svg>
            </div>
            <ul
              tabindex="0"
              class="dropdown-content menu bg-base-100 rounded-box z-1 w-32 p-2 shadow"
            >
              <li><a @click="startEdit">Edit</a></li>
              <li><a @click="handleDelete" class="text-error">Delete</a></li>
            </ul>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
