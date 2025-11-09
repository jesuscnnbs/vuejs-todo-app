# Scripts de Utilidad

Scripts para gestión de la base de datos y usuarios.

## Crear Usuario Administrador

Script para crear un usuario administrador en la base de datos.

### Uso:

```bash
npm run create-admin
```

### ¿Qué hace?

1. Lee las credenciales de Neon desde `.env.local`
2. Se conecta a la base de datos
3. Verifica si el usuario admin ya existe
4. Si no existe, crea uno nuevo con:
   - **Email**: `admin@example.com`
   - **Password**: `Admin1234`
   - **Name**: `Admin User`
   - **Role**: `admin`

### Personalizar credenciales:

Edita el archivo `scripts/create-admin.ts` líneas 17-21:

```typescript
const adminData: AdminData = {
  email: 'tu-email@example.com',     // Cambia esto
  password: 'TuPassword123',          // Cambia esto
  name: 'Tu Nombre',                  // Cambia esto
}
```

### Comportamiento si el usuario existe:

- Si el email ya existe y **NO es admin** → Lo actualiza a rol `admin`
- Si el email ya existe y **es admin** → No hace nada, muestra mensaje

### Ejemplo de salida:

```
🔧 Creating admin user...

✅ Connected to database
🔐 Hashing password...
📝 Creating admin user...

✅ Admin user created successfully!

📋 Admin Details:
   ID: 1
   Email: admin@example.com
   Name: Admin User
   Role: admin
   Password: Admin1234

💡 Save these credentials in a secure place!

✨ Script completed successfully!
```

## Requisitos:

- `.env.local` configurado con `DATABASE_URL` o `POSTGRES_URL`
- Base de datos con migraciones ejecutadas (`npm run db:push`)
- Package `tsx` instalado (ya incluido en devDependencies)

## Seguridad:

⚠️ **IMPORTANTE**:
- Cambia la contraseña por defecto después de crear el admin
- No commitees las credenciales al repositorio
- Usa contraseñas seguras en producción
