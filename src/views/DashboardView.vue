<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useTodosStore } from '@/stores/todos'
import TodoList from '@/components/TodoList.vue'

const authStore = useAuthStore()
const todosStore = useTodosStore()

onMounted(async () => {
  await todosStore.fetchTodos()
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <!-- Welcome Header -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold mb-2">
        Welcome back, {{ authStore.user?.name }}! 👋
      </h1>
      <p class="text-base-content/60">
        Manage your tasks and stay productive
      </p>
    </div>

    <!-- Todo List -->
    <TodoList />
  </div>
</template>
