1. drizzle.config.ts (archivo raíz del proyecto)

Configuración de Drizzle Kit que define:

- schema: Ubicación del esquema (./db/schema.ts)
- out: Carpeta para las migraciones (./db/migrations)
- dialect: PostgreSQL
- dbCredentials: Usa DATABASE_URL de tu archivo .env.local

2. db/schema.ts

Define el esquema de la base de datos con dos tablas:

Tabla users:

- id (serial, primary key)
- email (varchar 255, único)
- passwordHash (varchar, hasheado)
- name (varchar 255)
- role (varchar 20, default 'user')
- createdAt (timestamp)
- lastLogin (timestamp)
- updatedAt (timestamp)
- isActive: boolean('is_active').notNull().default(true),

Tabla todos:

- id (serial, primary key)
- userId (foreign key a users, cascade delete)
- title (varchar 255)
- description (text, opcional)
- completed (boolean, default false)
- priority (varchar 20, default medium)
- dueDate (timestamp)
- completedAt (timestap)
- createdAt (timestamp)
- updatedAt (timestamp)

También incluye relaciones y tipos TypeScript inferidos.

3. db/connection.ts

Configura la conexión a Neon:

- Usa el cliente @neondatabase/serverless
- Exporta instancia de Drizzle (db) lista para usar en tus API routes
- Maneja variables de entorno (DATABASE_URL o POSTGRES_URL)

4. package.json

Agregué scripts de Drizzle:
"db:generate": "drizzle-kit generate" // Genera migraciones SQL
"db:migrate": "drizzle-kit migrate" // Ejecuta migraciones
"db:push": "drizzle-kit push" // Push directo del schema
(desarrollo)
"db:studio": "drizzle-kit studio" // UI para explorar la BD
