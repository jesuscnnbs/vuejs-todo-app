# Tests de Integración de la API

Tests completos para todos los endpoints de la API usando Vitest.

## Ejecutar los tests

```bash
# Modo watch (se re-ejecutan al cambiar archivos)
npm run test:api

# Ejecutar una sola vez
npm run test:api:run
```

## Configuración

### Variables de entorno

Los tests usan `.env.test` para configuración. Si no existe, usa `.env.local` como fallback.

**Archivo `.env.test`:**
```env
DATABASE_URL=your_test_database_url
JWT_SECRET=test-secret-key
JWT_EXPIRES_IN=7d
```

⚠️ **Importante**: Usa una base de datos de prueba diferente a producción para evitar contaminar datos reales.

## Estructura de tests

```
api/
├── __tests__/
│   ├── setup.ts          # Configuración global de tests
│   ├── helpers.ts        # Utilidades para crear mocks
│   └── README.md         # Esta documentación
├── auth/
│   └── auth.test.ts      # Tests de autenticación
├── todos/
│   └── todos.test.ts     # Tests de tareas
└── admin/
    └── admin.test.ts     # Tests de administración
```

## Cobertura de tests

### Autenticación (`auth.test.ts`)
- ✅ Registro de usuarios (éxito y validaciones)
- ✅ Login (credenciales válidas e inválidas)
- ✅ Verificación de tokens
- ✅ Logout
- ✅ Validaciones de email y contraseña
- ✅ Protección contra duplicados

### Tareas (`todos.test.ts`)
- ✅ Listar tareas del usuario
- ✅ Crear tareas (con validaciones)
- ✅ Actualizar tareas
- ✅ Marcar como completado/no completado
- ✅ Eliminar tareas
- ✅ Autorización (usuarios no pueden ver tareas de otros)
- ✅ Validaciones de prioridad y longitud

### Administración (`admin.test.ts`)
- ✅ Listar usuarios con estadísticas
- ✅ Estadísticas generales de la aplicación
- ✅ Control de acceso (solo admins)
- ✅ Protección de endpoints

## Helpers disponibles

### `createMockRequest(options)`
Crea un mock de VercelRequest para probar endpoints.

```typescript
const req = createMockRequest({
  method: 'POST',
  body: { email: 'test@example.com' },
  headers: { authorization: 'Bearer token' },
  query: { id: '123' }
})
```

### `createMockResponse()`
Crea un mock de VercelResponse con helpers para verificar respuestas.

```typescript
const { res, getStatus, getJson } = createMockResponse()
await handler(req, res)
expect(getStatus()).toBe(200)
expect(getJson()).toHaveProperty('user')
```

### `generateTestEmail()`
Genera emails únicos para tests (evita conflictos).

```typescript
const email = generateTestEmail()
// test-1699564832123-x7k2p@test.com
```

## Buenas prácticas

1. **Limpieza automática**: Los tests usan emails únicos para evitar conflictos
2. **Aislamiento**: Cada test es independiente
3. **Base de datos real**: Los tests usan la DB configurada (mejor que mocks)
4. **Cobertura completa**: Happy paths + casos de error

## Troubleshooting

### Error: "DATABASE_URL no está configurada"
Crea `.env.test` con tu connection string de base de datos.

### Error: "JWT_SECRET no está configurado"
Agrega `JWT_SECRET=test-secret` a tu `.env.test`.

### Tests fallan por timeout
Aumenta el timeout en `vitest.config.api.ts`:
```typescript
testTimeout: 60000 // 60 segundos
```
