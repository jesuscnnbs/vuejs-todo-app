<script setup lang="ts">
import { ref, computed } from 'vue'
import TodoItem from './TodoItem.vue'
import BaseButton from './BaseButton.vue'
import { useTodosStore } from '@/stores/todos'

const todosStore = useTodosStore()

const filter = ref<'all' | 'active' | 'completed'>('all')
const newTitle = ref('')
const newDescription = ref('')
const newPriority = ref<'low' | 'medium' | 'high'>('medium')
const showAddForm = ref(false)
const loading = ref(false)

const filteredTodos = computed(() => {
  const todos = todosStore.todos
  if (filter.value === 'active') return todos.filter((t) => !t.completed)
  if (filter.value === 'completed') return todos.filter((t) => t.completed)
  return todos
})

const stats = computed(() => ({
  total: todosStore.todos.length,
  active: todosStore.todos.filter((t) => !t.completed).length,
  completed: todosStore.todos.filter((t) => t.completed).length,
}))

const handleAddTodo = async () => {
  if (!newTitle.value.trim()) return

  loading.value = true
  try {
    await todosStore.createTodo({
      title: newTitle.value.trim(),
      description: newDescription.value.trim() || undefined,
      priority: newPriority.value,
    })
    newTitle.value = ''
    newDescription.value = ''
    newPriority.value = 'medium'
    showAddForm.value = false
  } catch (error) {
    console.error('Error creating todo:', error)
  } finally {
    loading.value = false
  }
}

const handleCancelAdd = () => {
  showAddForm.value = false
  newTitle.value = ''
  newDescription.value = ''
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header with Stats -->
    <div class="stats stats-vertical lg:stats-horizontal shadow w-full border-primary/20 border">
      <div class="stat">
        <div class="stat-title">Total Tasks</div>
        <div class="stat-value text-primary">{{ stats.total }}</div>
      </div>
      <div class="stat">
        <div class="stat-title">Active</div>
        <div class="stat-value text-secondary">{{ stats.active }}</div>
      </div>
      <div class="stat">
        <div class="stat-title">Completed</div>
        <div class="stat-value text-accent">{{ stats.completed }}</div>
      </div>
    </div>

    <!-- Add Todo Button / Form -->
    <div class="card bg-base-100 shadow-md">
      <div class="card-body">
        <button
          v-if="!showAddForm"
          @click="showAddForm = true"
          class="btn btn-primary btn-block gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add New Task
        </button>

        <form v-else @submit.prevent="handleAddTodo" class="space-y-4">
          <div class="form-control">
            <input
              v-model="newTitle"
              type="text"
              placeholder="What needs to be done?"
              class="input input-bordered w-full"
              required
              autofocus
            />
          </div>

          <div class="form-control">
            <textarea
              v-model="newDescription"
              placeholder="Description (optional)"
              class="textarea textarea-bordered w-full"
              rows="3"
            ></textarea>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Priority</span>
            </label>
            <select v-model="newPriority" class="select select-bordered w-full">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div class="flex gap-2">
            <BaseButton type="submit" variant="primary" :loading="loading"> Add Task </BaseButton>
            <BaseButton type="button" variant="info" outline @click="handleCancelAdd">
              Cancel
            </BaseButton>
          </div>
        </form>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex gap-2 justify-center">
      <button
        @click="filter = 'all'"
        :class="['btn btn-sm', filter === 'all' ? 'btn-primary' : 'btn-ghost']"
      >
        All
      </button>
      <button
        @click="filter = 'active'"
        :class="['btn btn-sm', filter === 'active' ? 'btn-primary' : 'btn-ghost']"
      >
        Active
      </button>
      <button
        @click="filter = 'completed'"
        :class="['btn btn-sm', filter === 'completed' ? 'btn-primary' : 'btn-ghost']"
      >
        Completed
      </button>
    </div>

    <!-- Todo List -->
    <div v-if="filteredTodos.length === 0" class="text-center py-12">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        class="h-16 w-16 mx-auto text-base-content/20"
        fill="none"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
        />
      </svg>
      <p class="text-base-content/60 mt-4">No tasks found</p>
    </div>

    <div v-else class="space-y-3">
      <TodoItem v-for="todo in filteredTodos" :key="todo.id" :todo="todo" />
    </div>
  </div>
</template>
