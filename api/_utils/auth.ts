import jwt, { SignOptions } from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import type { VercelRequest } from '@vercel/node'
interface JWTPayload {
  userId: number
  email: string
  role: string
}

/**
 * Hashea una contraseña usando bcrypt
 * @param password - Contraseña en texto plano
 * @returns Hash de la contraseña
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return bcrypt.hash(password, saltRounds)
}

/**
 * Verifica que una contraseña coincida con su hash
 * @param password - Contraseña en texto plano
 * @param hash - Hash almacenado en la base de datos
 * @returns true si coinciden, false en caso contrario
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Extrae y verifica el token JWT del header Authorization
 * @param req - Request de Vercel
 * @returns Payload decodificado si es válido, null en caso contrario
 */
export function verifyToken(req: VercelRequest): JWTPayload | null {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7) // Remover "Bearer "

  if (!token || token.trim() === '') {
    return null
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
    return decoded
  } catch (error) {
    return null
  }
}

/**
 * Genera un nuevo token JWT con la información del usuario
 * @param userId - ID del usuario
 * @param email - Email del usuario
 * @param role - Rol del usuario (user/admin)
 * @returns Token JWT firmado
 */
export function generateToken(userId: number, email: string, role: string): string {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error('JWT_SECRET no está configurado en las variables de entorno')
  }

  const token = jwt.sign({ userId, email, role }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as SignOptions)

  return token
}

/**
 * Middleware para verificar que el usuario sea administrador
 * @param payload - Payload del JWT
 * @returns true si es admin, false en caso contrario
 */
export function requireAdmin(payload: JWTPayload | null): boolean {
  return payload !== null && payload.role === 'admin'
}

/**
 * Valida formato de email
 * @param email - Email a validar
 * @returns true si el formato es válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valida requisitos de contraseña
 * @param password - Contraseña a validar
 * @returns Objeto con resultado y mensaje de error
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: 'La contraseña debe tener al menos 8 caracteres' }
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'La contraseña debe contener al menos una mayúscula' }
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'La contraseña debe contener al menos una minúscula' }
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'La contraseña debe contener al menos un número' }
  }

  return { valid: true }
}
