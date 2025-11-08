# Vue 3 Todo App con OAuth y Panel de Admin
Aplicación de gestión de tareas (Todo App) desarrollada con Vue 3, TypeScript y Pinia, que incluye autenticación JWT con email/password, panel de administración para visualizar usuarios y estadísticas, y despliegue en Vercel con Neon Database como base de datos PostgreSQL serverless.

### Stack tecnológico
Frontend: Vue 3 + TypeScript + Vite
Gestión de Estado: Pinia
Enrutamiento: Vue Router
Base de Datos: Neon PostgreSQL
ORM: Drizzle ORM
Autenticación: JWT + bcrypt
Backend: Vercel Serverless Functions
Testing: Vitest + Playwright
Calidad de Código: ESLint + Prettier

### Requisitos Previos
Node.js 18+ y npm/pnpm instalado
Cuenta en Vercel
Cuenta en Neon
Cuenta de desarrollador en Google Cloud Platform (para OAuth)
Git instalado

## Fase 1: Configuración Inicial del Proyecto
#### 1.1 Crear Proyecto Vue 3
```bash
npm create vue@latest
```
Responder a las preguntas de configuración
```bash
✔ Project name: vuejs-todo-app
✔ Add TypeScript? Yes
✔ Add JSX Support? No
✔ Add Vue Router for Single Page Application development? Yes
✔ Add Pinia for state management? Yes
✔ Add Vitest for Unit testing? Yes
✔ Add an End-to-End Testing Solution? Playwright
✔ Add ESLint for code quality? Yes
✔ Add Prettier for code formatting? Yes
✔ Add Vue DevTools 7 extension for debugging? Yes
```


```bash
cd vuejs-todo-app
npm install
```

#### 1.2 Instalar dependencias adicionles
```bash
# Dependencias de producción
npm install @neondatabase/serverless drizzle-orm axios jsonwebtoken bcryptjs

# Dependencias de desarrollo
npm install -D drizzle-kit @types/jsonwebtoken @types/bcryptjs dotenv
```

#### 1.3 Configurar Estructura de Directorios
```bash
# Crear estructura de carpetas
mkdir -p api/auth api/todos api/admin db/migrations
mkdir -p src/stores src/views src/components src/composables src/types src/middleware
```

**Estructura final del proyecto:**
```
vuejs-todo-app/
├── api/                          # Vercel Serverless Functions
│   ├── auth/
│   │   ├── register.ts          # Registro de usuarios
│   │   ├── login.ts             # Login con JWT
│   │   ├── verify.ts            # Verificar token
│   │   └── logout.ts            # Cerrar sesión
│   ├── todos/
│   │   ├── index.ts             # CRUD de todos
│   │   └── [id].ts              # Operaciones específicas
│   └── admin/
│       ├── users.ts             # Listar usuarios
│       └── stats.ts             # Estadísticas generales
├── db/
│   ├── schema.ts                # Esquema de base de datos
│   ├── connection.ts            # Configuración de conexión
│   └── migrations/              # Migraciones SQL
├── src/
│   ├── assets/                  # Recursos estáticos
│   ├── components/
│   │   ├── TodoItem.vue
│   │   ├── TodoList.vue
│   │   ├── TodoForm.vue
│   │   └── admin/
│   │       ├── UserTable.vue
│   │       └── StatsCards.vue
│   ├── views/
│   │   ├── HomeView.vue
│   │   ├── LoginView.vue
│   │   ├── RegisterView.vue
│   │   ├── DashboardView.vue
│   │   └── AdminView.vue
│   ├── stores/
│   │   ├── auth.ts              # Store de autenticación
│   │   ├── todos.ts             # Store de tareas
│   │   └── admin.ts             # Store del panel admin
│   ├── composables/
│   │   └── useApi.ts            # Composable para llamadas API
│   ├── types/
│   │   └── index.ts             # Tipos TypeScript
│   ├── router/
│   │   └── index.ts             # Configuración de rutas
│   ├── App.vue
│   └── main.ts
├── .env.local                    # Variables de entorno (no subir a Git)
├── vercel.json                   # Configuración de Vercel
├── drizzle.config.ts            # Configuración de Drizzle
└── package.json
```

## Fase 2: Configuración de Base de Datos (Neon)
#### Crear proyecto en Neon

#### Configurar Drizzle ORM

#### Definir Schema de Base de Datos

#### Configurar Conexión a Neon

#### Ejecutar Migraciones

## Fase 3: Implementación del Backend (API Routes)
#### 3.1 Utilidades de Autenticación

#### 3.2 Endpoint de Registro

#### 3.3 Endpoint de Login

#### 3.4 Endpoint de Verificación de Token

#### 3.5 Endpoint de Logout

#### 3.6 Endpoints de Todos

#### 3.7 Endpoints de Admin

## Fase 4: Implementación del Frontend

#### 4.1 Tipos TypeScript

#### 4.2 Composable para API

#### 4.3 Store de Autenticación (Pinia)

#### 4.4 Store de Todos (Pinia)

#### 4.5 Store de Admin (Pinia)

#### 4.6 Router con Protección de Rutas

# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).
