import axios, { type AxiosError } from 'axios'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const API_URL = import.meta.env.VITE_API_URL || '/api'

export function useApi() {
  const router = useRouter()
  const authStore = useAuthStore()

  const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Interceptor para agregar el token de autorización
  apiClient.interceptors.request.use((config) => {
    const token = authStore.token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        // Token expirado o inválido
        authStore.logout()
        router.push('/login')
      }
      return Promise.reject(error)
    },
  )

  return {
    apiClient,
    API_URL,
  }
}
