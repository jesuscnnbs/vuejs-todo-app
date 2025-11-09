import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../db/connection.js';
import { users, sessions } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import { hashPassword, generateToken, isValidEmail, validatePassword } from '../_utils/auth.js';

/**
 * Endpoint para registro de nuevos usuarios
 * Valida datos, crea usuario con contraseña hasheada y genera token JWT
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { email, password, name } = req.body;

    // Validar campos requeridos
    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Todos los campos son requeridos (email, password, name)'
      });
    }

    // Validar formato de email
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Formato de email inválido' });
    }

    // Validar requisitos de contraseña
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.error });
    }

    // Validar longitud del nombre
    if (name.trim().length < 2) {
      return res.status(400).json({ error: 'El nombre debe tener al menos 2 caracteres' });
    }

    const db = getDb();

    // Verificar si el email ya existe
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (existingUser) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    // Hashear la contraseña
    const passwordHash = await hashPassword(password);

    // Crear nuevo usuario
    const [newUser] = await db
      .insert(users)
      .values({
        email: email.toLowerCase(),
        name: name.trim(),
        passwordHash,
        role: 'user', // Rol por defecto
        lastLogin: new Date(),
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.createdAt,
      });

    // Generar token JWT
    const token = generateToken(newUser.id, newUser.email, newUser.role);

    // Calcular fecha de expiración (7 días por defecto)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Guardar sesión en la base de datos
    await db.insert(sessions).values({
      userId: newUser.id,
      token,
      expiresAt,
      userAgent: req.headers['user-agent'] || null,
      ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || null,
    }).onConflictDoNothing();

    // Retornar usuario y token (sin datos sensibles)
    res.status(201).json({
      user: newUser,
      token,
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
