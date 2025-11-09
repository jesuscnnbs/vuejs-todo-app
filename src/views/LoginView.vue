<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseButton from '@/components/BaseButton.vue'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const handleLogin = async () => {
  error.value = ''
  loading.value = true

  try {
    await authStore.login({ email: email.value, password: password.value })
    router.push('/dashboard')
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Error al iniciar sesión'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="card w-full max-w-md bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-3xl font-bold text-center justify-center mb-4">Welcome Back</h2>
        <p class="text-center text-base-content/60 mb-6">Sign in to your account</p>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <!-- Email Input -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">Email</span>
            </label>
            <input
              v-model="email"
              type="email"
              placeholder="you@example.com"
              class="input input-bordered w-full"
              required
              autocomplete="email"
            />
          </div>

          <!-- Password Input -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">Password</span>
            </label>
            <input
              v-model="password"
              type="password"
              placeholder="••••••••"
              class="input input-bordered w-full"
              required
              autocomplete="current-password"
            />
            <label class="label">
              <a href="#" class="label-text-alt link link-hover">Forgot password?</a>
            </label>
          </div>

          <!-- Error Alert -->
          <div v-if="error" class="alert alert-error">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{{ error }}</span>
          </div>

          <!-- Submit Button -->
          <div class="form-control mt-6">
            <BaseButton type="submit" variant="primary" size="lg" :loading="loading" block>
              Sign In
            </BaseButton>
          </div>
        </form>

        <!-- Divider -->
        <div class="divider">OR</div>

        <!-- Register Link -->
        <div class="text-center">
          <p class="text-sm">
            Don't have an account?
            <RouterLink to="/register" class="link link-primary font-semibold">
              Sign up
            </RouterLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
