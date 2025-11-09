import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../db/connection.js';
import { users, sessions } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import { verifyPassword, generateToken, isValidEmail } from '../_utils/auth.js';

/**
 * Endpoint para autenticación de usuarios
 * Verifica credenciales y genera token JWT
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('[LOGIN] Iniciando proceso de login');
    const { email, password } = req.body;

    // Validar campos requeridos
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    // Validar formato de email
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Formato de email inválido' });
    }

    console.log('[LOGIN] Conectando a base de datos');
    const db = getDb();

    // Buscar usuario por email
    console.log('[LOGIN] Buscando usuario:', email);
    const user = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    // Usuario no encontrado o contraseña incorrecta
    // Usamos el mismo mensaje para ambos casos por seguridad
    if (!user) {
      console.log('[LOGIN] Usuario no encontrado');
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    console.log('[LOGIN] Usuario encontrado, ID:', user.id);

    // Verificar si el usuario está activo
    if (!user.isActive) {
      console.log('[LOGIN] Usuario inactivo');
      return res.status(403).json({ error: 'Cuenta desactivada. Contacta al administrador' });
    }

    // Verificar contraseña
    console.log('[LOGIN] Verificando contraseña');
    const isPasswordValid = await verifyPassword(password, user.passwordHash);

    if (!isPasswordValid) {
      console.log('[LOGIN] Contraseña inválida');
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Actualizar último login
    console.log('[LOGIN] Actualizando último login');
    await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, user.id));

    // Generar token JWT
    console.log('[LOGIN] Generando token JWT');
    const token = generateToken(user.id, user.email, user.role);

    // Calcular fecha de expiración
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Guardar sesión en la base de datos (o actualizar si ya existe)
    console.log('[LOGIN] Guardando sesión en base de datos');
    await db.insert(sessions).values({
      userId: user.id,
      token,
      expiresAt,
      userAgent: req.headers['user-agent'] || null,
      ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || null,
    }).onConflictDoNothing();

    console.log('[LOGIN] Login exitoso para usuario:', user.id);

    // Retornar datos del usuario (sin contraseña) y token
    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: new Date(), // Retornamos la fecha actualizada
      },
      token,
    });

  } catch (error) {
    console.error('[LOGIN] Error en login:', error);
    console.error('[LOGIN] Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
