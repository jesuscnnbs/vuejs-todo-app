import { describe, it, expect, beforeAll } from 'vitest'
import { createMockRequest, createMockResponse, generateTestEmail } from '../__tests__/helpers.js'
import { getDb } from '../../db/connection.js'
import { users } from '../../db/schema.js'
import { eq } from 'drizzle-orm'
import registerHandler from '../auth/register.js'
import loginHandler from '../auth/login.js'
import usersHandler from './users.js'
import statsHandler from './stats.js'

describe('Admin API', () => {
  let adminToken: string
  let userToken: string

  beforeAll(async () => {
    const db = getDb()

    // Crear un usuario regular
    const userEmail = generateTestEmail()
    const userRegisterReq = createMockRequest({
      method: 'POST',
      body: {
        email: userEmail,
        password: 'Test1234',
        name: 'Regular User',
      },
    })
    const { res: userRegisterRes, getJson: getUserRegisterJson } = createMockResponse()
    await registerHandler(userRegisterReq, userRegisterRes)
    userToken = getUserRegisterJson().token

    // Crear un usuario admin
    const adminEmail = generateTestEmail()
    const adminPassword = 'Admin1234'
    const adminRegisterReq = createMockRequest({
      method: 'POST',
      body: {
        email: adminEmail,
        password: adminPassword,
        name: 'Admin User',
      },
    })
    const { res: adminRegisterRes, getJson: getAdminRegisterJson } = createMockResponse()
    await registerHandler(adminRegisterReq, adminRegisterRes)
    const adminUserId = getAdminRegisterJson().user.id

    // Actualizar el usuario a admin en la base de datos
    await db
      .update(users)
      .set({ role: 'admin' })
      .where(eq(users.id, adminUserId))

    // Hacer login de nuevo para obtener un token con el rol actualizado
    const adminLoginReq = createMockRequest({
      method: 'POST',
      body: {
        email: adminEmail,
        password: adminPassword,
      },
    })
    const { res: adminLoginRes, getJson: getAdminLoginJson } = createMockResponse()
    await loginHandler(adminLoginReq, adminLoginRes)
    adminToken = getAdminLoginJson().token
  })

  describe('GET /api/admin/users', () => {
    it('should return users list for admin', async () => {
      const req = createMockRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      })
      const { res, getStatus, getJson } = createMockResponse()

      await usersHandler(req, res)

      expect(getStatus()).toBe(200)
      expect(getJson()).toHaveProperty('users')
      expect(Array.isArray(getJson().users)).toBe(true)
      expect(getJson().users.length).toBeGreaterThan(0)

      // Verificar estructura de usuario
      const user = getJson().users[0]
      expect(user).toHaveProperty('id')
      expect(user).toHaveProperty('email')
      expect(user).toHaveProperty('name')
      expect(user).toHaveProperty('role')
      expect(user).toHaveProperty('isActive')
      expect(user).toHaveProperty('totalTodos')
      expect(user).toHaveProperty('completedTodos')
    })

    it('should deny access to non-admin users', async () => {
      const req = createMockRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      })
      const { res, getStatus, getJson } = createMockResponse()

      await usersHandler(req, res)

      expect(getStatus()).toBe(403)
      expect(getJson().error).toContain('Acceso denegado')
    })

    it('should deny access without authentication', async () => {
      const req = createMockRequest({
        method: 'GET',
      })
      const { res, getStatus, getJson } = createMockResponse()

      await usersHandler(req, res)

      expect(getStatus()).toBe(403)
      expect(getJson().error).toContain('Acceso denegado')
    })

    it('should reject non-GET methods', async () => {
      const req = createMockRequest({
        method: 'POST',
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      })
      const { res, getStatus, getJson } = createMockResponse()

      await usersHandler(req, res)

      expect(getStatus()).toBe(405)
      expect(getJson().error).toContain('Método no permitido')
    })
  })

  describe('GET /api/admin/stats', () => {
    it('should return application statistics for admin', async () => {
      const req = createMockRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      })
      const { res, getStatus, getJson } = createMockResponse()

      await statsHandler(req, res)

      expect(getStatus()).toBe(200)
      const data = getJson()
      expect(data).toHaveProperty('stats')

      // Verificar estadísticas de usuarios
      expect(data.stats).toHaveProperty('users')
      expect(data.stats.users).toHaveProperty('totalUsers')
      expect(data.stats.users).toHaveProperty('activeUsers')
      expect(data.stats.users).toHaveProperty('adminUsers')
      expect(typeof data.stats.users.totalUsers).toBe('number')
      expect(data.stats.users.totalUsers).toBeGreaterThan(0)

      // Verificar estadísticas de todos
      expect(data.stats).toHaveProperty('todos')
      expect(data.stats.todos).toHaveProperty('totalTodos')
      expect(data.stats.todos).toHaveProperty('completedTodos')
      expect(data.stats.todos).toHaveProperty('pendingTodos')
      expect(typeof data.stats.todos.totalTodos).toBe('number')

      // Verificar estadísticas de sesiones
      expect(data.stats).toHaveProperty('sessions')
      expect(data.stats.sessions).toHaveProperty('activeSessions')
      expect(typeof data.stats.sessions.activeSessions).toBe('number')
    })

    it('should deny access to non-admin users', async () => {
      const req = createMockRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      })
      const { res, getStatus, getJson } = createMockResponse()

      await statsHandler(req, res)

      expect(getStatus()).toBe(403)
      expect(getJson().error).toContain('Acceso denegado')
    })

    it('should deny access without authentication', async () => {
      const req = createMockRequest({
        method: 'GET',
      })
      const { res, getStatus, getJson } = createMockResponse()

      await statsHandler(req, res)

      expect(getStatus()).toBe(403)
      expect(getJson().error).toContain('Acceso denegado')
    })

    it('should reject non-GET methods', async () => {
      const req = createMockRequest({
        method: 'POST',
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      })
      const { res, getStatus, getJson } = createMockResponse()

      await statsHandler(req, res)

      expect(getStatus()).toBe(405)
      expect(getJson().error).toContain('Método no permitido')
    })
  })

  describe('Admin Authorization', () => {
    it('should verify admin has elevated privileges', async () => {
      // Probar que admin puede acceder a users
      const usersReq = createMockRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      })
      const { res: usersRes, getStatus: getUsersStatus } = createMockResponse()
      await usersHandler(usersReq, usersRes)
      expect(getUsersStatus()).toBe(200)

      // Probar que admin puede acceder a stats
      const statsReq = createMockRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      })
      const { res: statsRes, getStatus: getStatsStatus } = createMockResponse()
      await statsHandler(statsReq, statsRes)
      expect(getStatsStatus()).toBe(200)
    })

    it('should verify regular user cannot access admin endpoints', async () => {
      // Intentar acceder a users como usuario regular
      const usersReq = createMockRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      })
      const { res: usersRes, getStatus: getUsersStatus } = createMockResponse()
      await usersHandler(usersReq, usersRes)
      expect(getUsersStatus()).toBe(403)

      // Intentar acceder a stats como usuario regular
      const statsReq = createMockRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      })
      const { res: statsRes, getStatus: getStatsStatus } = createMockResponse()
      await statsHandler(statsReq, statsRes)
      expect(getStatsStatus()).toBe(403)
    })
  })
})
