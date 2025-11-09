import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginCredentials, RegisterData } from '@/types'
import { useApi } from '@/composables/useApi'

export const useAuthStore = defineStore('auth', () => {
  // Estado reactivo
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const loading = ref(false)
  const error = ref<string | null>(null)

  const { apiClient } = useApi()

  // Computed properties
  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  /**
   * Registrar nuevo usuario
   */
  async function register(data: RegisterData) {
    try {
      loading.value = true
      error.value = null

      const response = await apiClient.post('/auth/register', data)

      // Guardar token y usuario
      token.value = response.data.token
      user.value = response.data.user
      localStorage.setItem('auth_token', response.data.token)
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Error en registro'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Iniciar sesión
   */
  async function login(credentials: LoginCredentials) {
    try {
      loading.value = true
      error.value = null

      const response = await apiClient.post('/auth/login', credentials)

      // Guardar token y usuario
      token.value = response.data.token
      user.value = response.data.user
      localStorage.setItem('auth_token', response.data.token)
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Error en login'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtener datos actualizados del usuario autenticado
   */
  async function fetchUser() {
    try {
      const response = await apiClient.get('/auth/verify')
      user.value = response.data.user
    } catch (err: any) {
      error.value = 'Error verificando sesión'
      throw err
    }
  }

  /**
   * Cerrar sesión y limpiar estado
   */
  async function logout() {
    try {
      if (token.value) {
        await apiClient.post('/auth/logout')
      }
    } catch (err) {
      console.error('Error en logout:', err)
    } finally {
      // Limpiar estado local
      user.value = null
      token.value = null
      localStorage.removeItem('auth_token')
    }
  }

  /**
   * Verificar si hay una sesión válida al iniciar la app
   */
  async function checkAuth() {
    if (!token.value) {
      return false
    }

    try {
      await fetchUser()
      return true
    } catch (err) {
      logout()
      return false
    }
  }

  return {
    // Estado
    user,
    token,
    loading,
    error,
    // Getters
    isAuthenticated,
    isAdmin,
    // Actions
    register,
    login,
    logout,
    fetchUser,
    checkAuth,
  }
})
