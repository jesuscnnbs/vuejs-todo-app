<script setup lang="ts">
import { RouterLink } from 'vue-router'
import BaseButton from '@/components/BaseButton.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-8 text-center">
    <h1
      class="text-5xl font-bold mb-8 bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent"
    >
      Welcome to Todo App
    </h1>

    <div class="flex flex-wrap gap-4 justify-center">
      <!-- External link button -->
      <a
        href="https://github.com/your-repo"
        target="_blank"
        rel="noopener noreferrer"
        class="btn btn-outline btn-secondary gap-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-5 h-5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
          />
        </svg>
        <span>View on GitHub</span>
      </a>

      <!-- Login button using BaseButton -->
      <RouterLink to="/login">
        <BaseButton variant="primary" size="md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-5 h-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
          <span>Login</span>
        </BaseButton>
      </RouterLink>
    </div>
  </div>
</template>
