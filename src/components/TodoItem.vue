<script setup lang="ts">
import { ref } from 'vue'

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

interface Emits {
  (e: 'toggle', id: number): void
  (e: 'delete', id: number): void
  (e: 'edit', todo: Todo): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isEditing = ref(false)
const editTitle = ref(props.todo.title)
const editDescription = ref(props.todo.description || '')

const priorityColors = {
  low: 'badge-info',
  medium: 'badge-warning',
  high: 'badge-error',
}

const handleEdit = () => {
  isEditing.value = true
  editTitle.value = props.todo.title
  editDescription.value = props.todo.description || ''
}

const saveEdit = () => {
  emit('edit', {
    ...props.todo,
    title: editTitle.value,
    description: editDescription.value,
  })
  isEditing.value = false
}

const cancelEdit = () => {
  isEditing.value = false
  editTitle.value = props.todo.title
  editDescription.value = props.todo.description || ''
}
</script>

<template>
  <div class="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
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
          <button @click="saveEdit" class="btn btn-primary btn-sm">Save</button>
          <button @click="cancelEdit" class="btn btn-ghost btn-sm">Cancel</button>
        </div>
      </template>

      <!-- View Mode -->
      <template v-else>
        <div class="flex items-start gap-3">
          <!-- Checkbox -->
          <input
            type="checkbox"
            :checked="todo.completed"
            @change="emit('toggle', todo.id)"
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
            <div tabindex="0" role="button" class="btn btn-ghost btn-sm btn-circle">
              <svg
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
              <li><a @click="handleEdit">Edit</a></li>
              <li><a @click="emit('delete', todo.id)" class="text-error">Delete</a></li>
            </ul>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
