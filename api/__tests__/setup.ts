import { beforeAll, afterEach } from 'vitest'
import { config } from 'dotenv'
import { resolve } from 'path'

// Cargar variables de entorno de test (PRIMERO)
config({ path: resolve(__dirname, '../../.env.test') })

// Si .env.test no tiene DATABASE_URL, cargar .env.local SIN sobrescribir
if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
  config({ path: resolve(__dirname, '../../.env.local'), override: false })
}

beforeAll(async () => {
  // Verificar que tenemos las variables de entorno necesarias
  if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
    throw new Error('DATABASE_URL o POSTGRES_URL no está configurada para tests')
  }

  if (!process.env.JWT_SECRET) {
    console.warn('⚠️  JWT_SECRET no está configurada, usando valor por defecto para tests')
    process.env.JWT_SECRET = 'test-secret-key-for-testing-only'
  }

  console.log('✅ Entorno de testing configurado')
  console.log('🔑 JWT_SECRET (primeros 20 chars):', process.env.JWT_SECRET!.substring(0, 20) + '...')
})

afterEach(async () => {
  // Aquí podríamos limpiar datos de test entre pruebas
  // Por ahora lo dejamos vacío ya que usamos emails únicos con timestamps
})
