import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserWithStats, AppStats } from '@/types'
import { useApi } from '@/composables/useApi'

export const useAdminStore = defineStore('admin', () => {
  const { apiClient } = useApi()

  // Estado
  const users = ref<UserWithStats[]>([])
  const stats = ref<AppStats | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Obtener lista de usuarios con estadísticas
   */
  async function fetchUsers() {
    try {
      loading.value = true
      error.value = null

      const response = await apiClient.get('/admin/users')
      users.value = response.data.users
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Error cargando usuarios'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtener estadísticas generales de la aplicación
   */
  async function fetchStats() {
    try {
      loading.value = true
      error.value = null

      const response = await apiClient.get('/admin/stats')
      stats.value = response.data.stats
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Error cargando estadísticas'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // Estado
    users,
    stats,
    loading,
    error,
    // Actions
    fetchUsers,
    fetchStats,
  }
})
