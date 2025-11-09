import { describe, it, expect } from 'vitest'
import { createMockRequest, createMockResponse, generateTestEmail } from '../__tests__/helpers.js'
import registerHandler from './register.js'
import loginHandler from './login.js'
import verifyHandler from './verify.js'
import logoutHandler from './logout.js'

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const email = generateTestEmail()
      const req = createMockRequest({
        method: 'POST',
        body: {
          email,
          password: 'Test1234',
          name: 'Test User',
        },
      })
      const { res, getStatus, getJson } = createMockResponse()

      await registerHandler(req, res)

      expect(getStatus()).toBe(201)
      const data = getJson()
      expect(data).toHaveProperty('user')
      expect(data).toHaveProperty('token')
      expect(data.user.email).toBe(email)
      expect(data.user.name).toBe('Test User')
      expect(data.user.role).toBe('user')
    })

    it('should fail with invalid email format', async () => {
      const req = createMockRequest({
        method: 'POST',
        body: {
          email: 'invalid-email',
          password: 'Test1234',
          name: 'Test User',
        },
      })
      const { res, getStatus, getJson } = createMockResponse()

      await registerHandler(req, res)

      expect(getStatus()).toBe(400)
      expect(getJson().error).toContain('email')
    })

    it('should fail with weak password', async () => {
      const req = createMockRequest({
        method: 'POST',
        body: {
          email: generateTestEmail(),
          password: 'weak',
          name: 'Test User',
        },
      })
      const { res, getStatus, getJson } = createMockResponse()

      await registerHandler(req, res)

      expect(getStatus()).toBe(400)
      expect(getJson().error).toContain('contraseña')
    })

    it('should fail with missing fields', async () => {
      const req = createMockRequest({
        method: 'POST',
        body: {
          email: generateTestEmail(),
        },
      })
      const { res, getStatus, getJson } = createMockResponse()

      await registerHandler(req, res)

      expect(getStatus()).toBe(400)
      expect(getJson().error).toContain('requeridos')
    })

    it('should fail with duplicate email', async () => {
      const email = generateTestEmail()

      // First registration
      const req1 = createMockRequest({
        method: 'POST',
        body: {
          email,
          password: 'Test1234',
          name: 'Test User',
        },
      })
      const { res: res1 } = createMockResponse()
      await registerHandler(req1, res1)

      // Second registration with same email
      const req2 = createMockRequest({
        method: 'POST',
        body: {
          email,
          password: 'Test1234',
          name: 'Test User 2',
        },
      })
      const { res: res2, getStatus, getJson } = createMockResponse()

      await registerHandler(req2, res2)

      expect(getStatus()).toBe(409)
      expect(getJson().error).toContain('registrado')
    })

    it('should reject non-POST methods', async () => {
      const req = createMockRequest({
        method: 'GET',
      })
      const { res, getStatus, getJson } = createMockResponse()

      await registerHandler(req, res)

      expect(getStatus()).toBe(405)
      expect(getJson().error).toContain('Método no permitido')
    })
  })

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const email = generateTestEmail()
      const password = 'Test1234'

      // Register first
      const registerReq = createMockRequest({
        method: 'POST',
        body: { email, password, name: 'Test User' },
      })
      const { res: registerRes } = createMockResponse()
      await registerHandler(registerReq, registerRes)

      // Login
      const loginReq = createMockRequest({
        method: 'POST',
        body: { email, password },
      })
      const { res: loginRes, getStatus, getJson } = createMockResponse()

      await loginHandler(loginReq, loginRes)

      expect(getStatus()).toBe(200)
      const data = getJson()
      expect(data).toHaveProperty('user')
      expect(data).toHaveProperty('token')
      expect(data.user.email).toBe(email)
    })

    it('should fail with invalid credentials', async () => {
      const req = createMockRequest({
        method: 'POST',
        body: {
          email: 'nonexistent@test.com',
          password: 'WrongPassword1',
        },
      })
      const { res, getStatus, getJson } = createMockResponse()

      await loginHandler(req, res)

      expect(getStatus()).toBe(401)
      expect(getJson().error).toContain('Credenciales inválidas')
    })

    it('should fail with wrong password', async () => {
      const email = generateTestEmail()

      // Register
      const registerReq = createMockRequest({
        method: 'POST',
        body: { email, password: 'Test1234', name: 'Test User' },
      })
      const { res: registerRes } = createMockResponse()
      await registerHandler(registerReq, registerRes)

      // Login with wrong password
      const loginReq = createMockRequest({
        method: 'POST',
        body: { email, password: 'WrongPassword1' },
      })
      const { res: loginRes, getStatus, getJson } = createMockResponse()

      await loginHandler(loginReq, loginRes)

      expect(getStatus()).toBe(401)
      expect(getJson().error).toContain('Credenciales inválidas')
    })

    it('should fail with missing fields', async () => {
      const req = createMockRequest({
        method: 'POST',
        body: { email: 'test@test.com' },
      })
      const { res, getStatus, getJson } = createMockResponse()

      await loginHandler(req, res)

      expect(getStatus()).toBe(400)
      expect(getJson().error).toContain('requeridos')
    })
  })

  describe('GET /api/auth/verify', () => {
    it('should verify valid token', async () => {
      const email = generateTestEmail()

      // Register to get token
      const registerReq = createMockRequest({
        method: 'POST',
        body: { email, password: 'Test1234', name: 'Test User' },
      })
      const { res: registerRes, getJson: getRegisterJson } = createMockResponse()
      await registerHandler(registerReq, registerRes)
      const { token } = getRegisterJson()

      // Verify token
      const verifyReq = createMockRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${token}`,
        },
      })
      const { res: verifyRes, getStatus, getJson } = createMockResponse()

      await verifyHandler(verifyReq, verifyRes)

      expect(getStatus()).toBe(200)
      expect(getJson().user.email).toBe(email)
    })

    it('should fail with missing token', async () => {
      const req = createMockRequest({
        method: 'GET',
      })
      const { res, getStatus, getJson } = createMockResponse()

      await verifyHandler(req, res)

      expect(getStatus()).toBe(401)
      expect(getJson().error).toContain('Token inválido')
    })

    it('should fail with invalid token', async () => {
      const req = createMockRequest({
        method: 'GET',
        headers: {
          authorization: 'Bearer invalid-token',
        },
      })
      const { res, getStatus, getJson } = createMockResponse()

      await verifyHandler(req, res)

      expect(getStatus()).toBe(401)
      expect(getJson().error).toContain('Token inválido')
    })
  })

  describe('POST /api/auth/logout', () => {
    it('should logout successfully with valid token', async () => {
      const email = generateTestEmail()

      // Register to get token
      const registerReq = createMockRequest({
        method: 'POST',
        body: { email, password: 'Test1234', name: 'Test User' },
      })
      const { res: registerRes, getJson: getRegisterJson } = createMockResponse()
      await registerHandler(registerReq, registerRes)
      const { token } = getRegisterJson()

      // Logout
      const logoutReq = createMockRequest({
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
        },
      })
      const { res: logoutRes, getStatus, getJson } = createMockResponse()

      await logoutHandler(logoutReq, logoutRes)

      expect(getStatus()).toBe(200)
      expect(getJson().message).toContain('Sesión cerrada')
    })

    it('should fail logout without token', async () => {
      const req = createMockRequest({
        method: 'POST',
      })
      const { res, getStatus, getJson } = createMockResponse()

      await logoutHandler(req, res)

      expect(getStatus()).toBe(401)
      expect(getJson().error).toContain('No autenticado')
    })
  })
})
