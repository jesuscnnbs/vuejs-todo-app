import { describe, it, expect, beforeAll } from 'vitest'
import { createMockRequest, createMockResponse, generateTestEmail } from '../__tests__/helpers.js'
import registerHandler from '../auth/register.js'
import todosHandler from './index.js'
import todoByIdHandler from './[id].js'

describe('Todos API', () => {
  let authToken: string
  let userId: number

  beforeAll(async () => {
    // Crear un usuario de prueba y obtener token
    const email = generateTestEmail()
    const registerReq = createMockRequest({
      method: 'POST',
      body: {
        email,
        password: 'Test1234',
        name: 'Test User',
      },
    })
    const { res, getJson } = createMockResponse()
    await registerHandler(registerReq, res)
    const data = getJson()
    authToken = data.token
    userId = data.user.id
  })

  describe('GET /api/todos', () => {
    it('should list all todos for authenticated user', async () => {
      const req = createMockRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      })
      const { res, getStatus, getJson } = createMockResponse()

      await todosHandler(req, res)

      expect(getStatus()).toBe(200)
      expect(getJson()).toHaveProperty('todos')
      expect(Array.isArray(getJson().todos)).toBe(true)
    })

    it('should fail without authentication', async () => {
      const req = createMockRequest({
        method: 'GET',
      })
      const { res, getStatus, getJson } = createMockResponse()

      await todosHandler(req, res)

      expect(getStatus()).toBe(401)
      expect(getJson().error).toContain('No autenticado')
    })
  })

  describe('POST /api/todos', () => {
    it('should create a new todo', async () => {
      const req = createMockRequest({
        method: 'POST',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        body: {
          title: 'Test Todo',
          description: 'Test Description',
          priority: 'high',
        },
      })
      const { res, getStatus, getJson } = createMockResponse()

      await todosHandler(req, res)

      expect(getStatus()).toBe(201)
      const data = getJson()
      expect(data).toHaveProperty('todo')
      expect(data.todo.title).toBe('Test Todo')
      expect(data.todo.description).toBe('Test Description')
      expect(data.todo.priority).toBe('high')
      expect(data.todo.completed).toBe(false)
    })

    it('should create todo with default priority', async () => {
      const req = createMockRequest({
        method: 'POST',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        body: {
          title: 'Test Todo Default Priority',
        },
      })
      const { res, getStatus, getJson } = createMockResponse()

      await todosHandler(req, res)

      expect(getStatus()).toBe(201)
      expect(getJson().todo.priority).toBe('medium')
    })

    it('should fail with empty title', async () => {
      const req = createMockRequest({
        method: 'POST',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        body: {
          title: '',
        },
      })
      const { res, getStatus, getJson } = createMockResponse()

      await todosHandler(req, res)

      expect(getStatus()).toBe(400)
      expect(getJson().error).toContain('título')
    })

    it('should fail with invalid priority', async () => {
      const req = createMockRequest({
        method: 'POST',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        body: {
          title: 'Test Todo',
          priority: 'invalid',
        },
      })
      const { res, getStatus, getJson } = createMockResponse()

      await todosHandler(req, res)

      expect(getStatus()).toBe(400)
      expect(getJson().error).toContain('Prioridad inválida')
    })

    it('should fail with title too long', async () => {
      const req = createMockRequest({
        method: 'POST',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        body: {
          title: 'a'.repeat(501),
        },
      })
      const { res, getStatus, getJson } = createMockResponse()

      await todosHandler(req, res)

      expect(getStatus()).toBe(400)
      expect(getJson().error).toContain('500 caracteres')
    })
  })

  describe('PUT /api/todos/:id', () => {
    let todoId: number

    beforeAll(async () => {
      // Crear una tarea para actualizar
      const req = createMockRequest({
        method: 'POST',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        body: {
          title: 'Todo to Update',
        },
      })
      const { res, getJson } = createMockResponse()
      await todosHandler(req, res)
      todoId = getJson().todo.id
    })

    it('should update todo title', async () => {
      const req = createMockRequest({
        method: 'PUT',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        query: { id: todoId.toString() },
        body: {
          title: 'Updated Title',
        },
      })
      const { res, getStatus, getJson } = createMockResponse()

      await todoByIdHandler(req, res)

      expect(getStatus()).toBe(200)
      expect(getJson().todo.title).toBe('Updated Title')
    })

    it('should mark todo as completed', async () => {
      const req = createMockRequest({
        method: 'PUT',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        query: { id: todoId.toString() },
        body: {
          completed: true,
        },
      })
      const { res, getStatus, getJson } = createMockResponse()

      await todoByIdHandler(req, res)

      expect(getStatus()).toBe(200)
      expect(getJson().todo.completed).toBe(true)
      expect(getJson().todo.completedAt).not.toBeNull()
    })

    it('should mark todo as not completed', async () => {
      const req = createMockRequest({
        method: 'PUT',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        query: { id: todoId.toString() },
        body: {
          completed: false,
        },
      })
      const { res, getStatus, getJson } = createMockResponse()

      await todoByIdHandler(req, res)

      expect(getStatus()).toBe(200)
      expect(getJson().todo.completed).toBe(false)
      expect(getJson().todo.completedAt).toBeNull()
    })

    it('should update priority', async () => {
      const req = createMockRequest({
        method: 'PUT',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        query: { id: todoId.toString() },
        body: {
          priority: 'low',
        },
      })
      const { res, getStatus, getJson } = createMockResponse()

      await todoByIdHandler(req, res)

      expect(getStatus()).toBe(200)
      expect(getJson().todo.priority).toBe('low')
    })

    it('should fail with invalid todo id', async () => {
      const req = createMockRequest({
        method: 'PUT',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        query: { id: '999999' },
        body: {
          title: 'Updated',
        },
      })
      const { res, getStatus, getJson } = createMockResponse()

      await todoByIdHandler(req, res)

      expect(getStatus()).toBe(404)
      expect(getJson().error).toContain('no encontrada')
    })

    it('should fail with empty title', async () => {
      const req = createMockRequest({
        method: 'PUT',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        query: { id: todoId.toString() },
        body: {
          title: '',
        },
      })
      const { res, getStatus, getJson } = createMockResponse()

      await todoByIdHandler(req, res)

      expect(getStatus()).toBe(400)
      expect(getJson().error).toContain('vacío')
    })
  })

  describe('DELETE /api/todos/:id', () => {
    it('should delete a todo', async () => {
      // Crear una tarea para eliminar
      const createReq = createMockRequest({
        method: 'POST',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        body: {
          title: 'Todo to Delete',
        },
      })
      const { res: createRes, getJson: getCreateJson } = createMockResponse()
      await todosHandler(createReq, createRes)
      const todoId = getCreateJson().todo.id

      // Eliminar la tarea
      const deleteReq = createMockRequest({
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        query: { id: todoId.toString() },
      })
      const { res: deleteRes, getStatus, getJson } = createMockResponse()

      await todoByIdHandler(deleteReq, deleteRes)

      expect(getStatus()).toBe(200)
      expect(getJson().message).toContain('eliminada')
    })

    it('should fail to delete non-existent todo', async () => {
      const req = createMockRequest({
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        query: { id: '999999' },
      })
      const { res, getStatus, getJson } = createMockResponse()

      await todoByIdHandler(req, res)

      expect(getStatus()).toBe(404)
      expect(getJson().error).toContain('no encontrada')
    })
  })

  describe('Authorization', () => {
    it('should not allow user to access another user\'s todo', async () => {
      // Crear otro usuario
      const email2 = generateTestEmail()
      const registerReq2 = createMockRequest({
        method: 'POST',
        body: {
          email: email2,
          password: 'Test1234',
          name: 'Test User 2',
        },
      })
      const { res: registerRes2, getJson: getRegisterJson2 } = createMockResponse()
      await registerHandler(registerReq2, registerRes2)
      const token2 = getRegisterJson2().token

      // Crear una tarea con el primer usuario
      const createReq = createMockRequest({
        method: 'POST',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        body: {
          title: 'Private Todo',
        },
      })
      const { res: createRes, getJson: getCreateJson } = createMockResponse()
      await todosHandler(createReq, createRes)
      const todoId = getCreateJson().todo.id

      // Intentar acceder con el segundo usuario
      const accessReq = createMockRequest({
        method: 'PUT',
        headers: {
          authorization: `Bearer ${token2}`,
        },
        query: { id: todoId.toString() },
        body: {
          title: 'Hacked',
        },
      })
      const { res: accessRes, getStatus } = createMockResponse()

      await todoByIdHandler(accessReq, accessRes)

      expect(getStatus()).toBe(404)
    })
  })
})
