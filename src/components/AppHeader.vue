<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { computed } from 'vue'

const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const isAdmin = computed(() => authStore.isAdmin)
const userName = computed(() => authStore.user?.name || 'User')

const handleLogout = async () => {
  await authStore.logout()
}
</script>

<template>
  <div class="navbar bg-base-100 border-b-2 border-primary/20">
    <div class="navbar-start">
      <div class="dropdown">
        <div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h8m-8 6h16"
            />
          </svg>
        </div>
        <ul
          tabindex="0"
          class="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
        >
          <li><RouterLink to="/">Home</RouterLink></li>
          <li v-if="isAuthenticated"><RouterLink to="/dashboard">Dashboard</RouterLink></li>
          <li v-if="isAdmin"><RouterLink to="/admin">Admin</RouterLink></li>
        </ul>
      </div>
      <RouterLink to="/" class="btn btn-ghost text-xl">Todo App</RouterLink>
    </div>

    <div class="navbar-center hidden lg:flex">
      <ul class="menu menu-horizontal px-1">
        <li><RouterLink to="/" class="btn btn-link">Home</RouterLink></li>
        <li v-if="isAuthenticated">
          <RouterLink to="/dashboard" class="btn btn-link">Dashboard</RouterLink>
        </li>
        <li v-if="isAdmin"><RouterLink to="/admin" class="btn btn-link">Admin</RouterLink></li>
      </ul>
    </div>

    <div class="navbar-end gap-2">
      <template v-if="!isAuthenticated">
        <RouterLink to="/login" class="btn btn-ghost">Login</RouterLink>
        <RouterLink to="/register" class="btn btn-primary">Sign Up</RouterLink>
      </template>

      <template v-else>
        <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar placeholder">
            <div class="bg-neutral text-neutral-content w-8 rounded-full">
              <span class="text-xl">{{ userName.charAt(0).toUpperCase() }}</span>
            </div>
          </div>
          <ul
            tabindex="0"
            class="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
          >
            <li class="menu-title">
              <span>{{ userName }}</span>
            </li>
            <li><RouterLink to="/dashboard">Dashboard</RouterLink></li>
            <li v-if="isAdmin"><RouterLink to="/admin">Admin Panel</RouterLink></li>
            <li><a @click="handleLogout">Logout</a></li>
          </ul>
        </div>
      </template>
    </div>
  </div>
</template>
