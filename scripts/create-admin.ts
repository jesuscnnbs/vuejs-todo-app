import { config } from 'dotenv'
import { resolve } from 'path'
import bcrypt from 'bcryptjs'
import { getDb } from '../db/connection.js'
import { users } from '../db/schema.js'
import { eq } from 'drizzle-orm'

// Cargar variables de entorno
config({ path: resolve(__dirname, '../.env.local') })

interface AdminData {
  email: string
  password: string
  name: string
}

async function createAdmin() {
  console.log('🔧 Creating admin user...\n')

  // Datos del admin (puedes cambiarlos aquí)
  const adminData: AdminData = {
    email: 'admin@example.com',
    password: 'Admin1234',
    name: 'Admin User',
  }

  try {
    // Verificar conexión a DB
    const db = getDb()
    console.log('✅ Connected to database')

    // Verificar si el usuario ya existe
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, adminData.email.toLowerCase()),
    })

    if (existingUser) {
      console.log('\n⚠️  User already exists!')
      console.log('📧 Email:', existingUser.email)
      console.log('👤 Name:', existingUser.name)
      console.log('👑 Role:', existingUser.role)

      // Preguntar si quiere actualizar a admin
      if (existingUser.role !== 'admin') {
        console.log('\n🔄 Updating user to admin role...')
        await db.update(users).set({ role: 'admin' }).where(eq(users.id, existingUser.id))

        console.log('✅ User updated to admin successfully!')
      } else {
        console.log('\n✅ User is already an admin')
      }

      return
    }

    // Hashear contraseña
    console.log('🔐 Hashing password...')
    const passwordHash = await bcrypt.hash(adminData.password, 10)

    // Crear usuario admin
    console.log('📝 Creating admin user...')
    const [newAdmin] = await db
      .insert(users)
      .values({
        email: adminData.email.toLowerCase(),
        name: adminData.name,
        passwordHash,
        role: 'admin',
        isActive: true,
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.createdAt,
      })

    console.log('\n✅ Admin user created successfully!\n')
    console.log('📋 Admin Details:')
    console.log('   ID:', newAdmin.id)
    console.log('   Email:', newAdmin.email)
    console.log('   Name:', newAdmin.name)
    console.log('   Role:', newAdmin.role)
    console.log('   Password:', adminData.password)
    console.log('\n💡 Save these credentials in a secure place!')
  } catch (error) {
    console.error('\n❌ Error creating admin user:', error)
    process.exit(1)
  }
}

// Ejecutar script
createAdmin()
  .then(() => {
    console.log('\n✨ Script completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })
