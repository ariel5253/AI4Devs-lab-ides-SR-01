# Implementación: Añadir Candidato al Sistema ATS

Este documento describe la implementación completa de la funcionalidad para añadir candidatos al sistema ATS.

## 📋 Resumen de Cambios

### Backend

#### Nuevos Archivos Creados:
1. **`backend/src/lib/prisma.ts`** - Singleton de PrismaClient para evitar múltiples instancias
2. **`backend/src/repositories/candidate.repository.ts`** - Repositorio con métodos para gestionar candidatos
3. **`backend/src/middlewares/error.middleware.ts`** - Middleware global de manejo de errores
4. **`backend/src/routes/candidate.routes.ts`** - Rutas de API para candidatos con validación y subida de CV
5. **`backend/src/app.ts`** - Configuración de Express con CORS y rutas
6. **`backend/src/server.ts`** - Punto de entrada del servidor (puerto 4000)
7. **`backend/src/tests/candidate.api.test.ts`** - Tests para la API de candidatos

#### Archivos Modificados:
1. **`backend/prisma/schema.prisma`** - Añadido modelo `Candidate`
2. **`backend/src/index.ts`** - Refactorizado para usar app.ts
3. **`backend/package.json`** - Añadidas dependencias: `zod`, `multer`, `cors`, `@types/multer`
4. **`backend/src/tests/app.test.ts`** - Actualizado para usar app.ts

### Frontend

#### Nuevos Archivos Creados:
1. **`frontend/src/components/RecruiterDashboard.tsx`** - Dashboard del reclutador con botón para añadir candidato
2. **`frontend/src/components/RecruiterDashboard.css`** - Estilos del dashboard
3. **`frontend/src/components/AddCandidateForm.tsx`** - Formulario completo para añadir candidatos
4. **`frontend/src/components/AddCandidateForm.css`** - Estilos del formulario
5. **`frontend/src/tests/AddCandidateForm.test.tsx`** - Tests para el formulario

#### Archivos Modificados:
1. **`frontend/src/App.tsx`** - Configurado React Router con rutas `/` y `/add-candidate`
2. **`frontend/package.json`** - Añadidas dependencias: `react-router-dom`, `react-hook-form`, `@hookform/resolvers`, `zod`
3. **`frontend/src/tests/App.test.tsx`** - Actualizado para el nuevo routing

## 🚀 Instrucciones de Ejecución

### Prerrequisitos

1. Docker y Docker Compose instalados
2. Node.js y npm instalados

### Paso 1: Levantar la Base de Datos

```bash
# Desde la raíz del proyecto
docker-compose up -d
```

Esto levanta PostgreSQL en el puerto 5440 (mapeado a 5432 internamente).

### Paso 2: Configurar Variables de Entorno

Asegúrate de que `backend/.env` existe y contiene:

```env
DB_PASSWORD=D1ymf8wyQEGthFR1E9xhCq
DB_USER=LTIdbUser
DB_NAME=LTIdb
DB_PORT=5432
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/${DB_NAME}"
```

**Nota:** El puerto en DATABASE_URL debe ser 5440 (el puerto externo de Docker), pero si usas `localhost:5432` desde dentro del contenedor o si tienes configuración especial, ajusta según tu caso.

### Paso 3: Instalar Dependencias del Backend

```bash
cd backend
npm install
```

### Paso 4: Configurar Prisma y Crear Migración

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name add_candidates
```

Esto creará la tabla `Candidate` en la base de datos.

### Paso 5: Iniciar el Backend

```bash
cd backend
npm run dev
```

El servidor estará corriendo en `http://localhost:4000`.

### Paso 6: Instalar Dependencias del Frontend

```bash
cd frontend
npm install
```

### Paso 7: Configurar Variables de Entorno del Frontend

Crea `frontend/.env` (o copia desde `.env.example`):

```env
REACT_APP_API_BASE_URL=http://localhost:4000
```

### Paso 8: Iniciar el Frontend

```bash
cd frontend
npm start
```

El frontend estará disponible en `http://localhost:3000`.

## 🧪 Ejecutar Tests

### Backend

```bash
cd backend
npm test
```

### Frontend

```bash
cd frontend
npm test
```

## 📝 Funcionalidades Implementadas

### ✅ Criterios de Aceptación Cumplidos

1. ✅ Botón "Añadir candidato" visible en el dashboard del reclutador
2. ✅ Formulario con todos los campos requeridos:
   - Nombre (requerido, mínimo 2 caracteres)
   - Apellido (requerido, mínimo 2 caracteres)
   - Correo electrónico (requerido, formato válido)
   - Teléfono (opcional)
   - Dirección (opcional)
   - Educación (opcional)
   - Experiencia laboral (opcional)
3. ✅ Validación de datos:
   - Email con formato válido
   - Campos requeridos no vacíos
4. ✅ Subida de CV opcional (PDF o DOCX, máximo 5 MB)
5. ✅ Guardado en BD y confirmación de éxito
6. ✅ Manejo de errores (validación, duplicado, servidor)
7. ✅ Diseño responsive y accesible

### 🔐 Seguridad y Accesibilidad

- ✅ Límite de tamaño de archivo CV: 5 MB
- ✅ Solo acepta PDF y DOCX
- ✅ Formularios con labels correctos
- ✅ Manejo de foco al mostrar mensajes
- ✅ Mensajes accesibles con `aria-live="polite"`

## 📁 Estructura de Archivos

```
backend/
├── src/
│   ├── lib/
│   │   └── prisma.ts              # Singleton de PrismaClient
│   ├── repositories/
│   │   └── candidate.repository.ts # Lógica de acceso a datos
│   ├── middlewares/
│   │   └── error.middleware.ts    # Manejo global de errores
│   ├── routes/
│   │   └── candidate.routes.ts    # Rutas de API
│   ├── app.ts                     # Configuración de Express
│   ├── server.ts                  # Punto de entrada del servidor
│   ├── index.ts                   # Exportaciones para compatibilidad
│   └── tests/
│       ├── app.test.ts
│       └── candidate.api.test.ts  # Tests de API
├── prisma/
│   └── schema.prisma              # Modelo Candidate añadido
└── uploads/                       # Directorio para CVs subidos

frontend/
├── src/
│   ├── components/
│   │   ├── RecruiterDashboard.tsx
│   │   ├── RecruiterDashboard.css
│   │   ├── AddCandidateForm.tsx
│   │   └── AddCandidateForm.css
│   ├── App.tsx                    # Routing configurado
│   └── tests/
│       ├── App.test.tsx
│       └── AddCandidateForm.test.tsx
└── .env                            # REACT_APP_API_BASE_URL
```

## 🔧 Pruebas Manuales

### Probar la API directamente con curl

```bash
curl -X POST http://localhost:4000/api/candidates \
  -F "firstName=Juan" \
  -F "lastName=Pérez" \
  -F "email=juanperez@example.com" \
  -F "phone=3001234567" \
  -F "education=Ingeniería de Sistemas" \
  -F "experience=3 años" \
  -F "cv=@./cv.pdf"
```

### Flujo Completo desde la UI

1. Abre `http://localhost:3000`
2. Haz clic en "Añadir candidato"
3. Completa el formulario:
   - Nombre: Juan
   - Apellido: Pérez
   - Email: juanperez@example.com
   - (Campos opcionales según desees)
   - CV: Selecciona un archivo PDF o DOCX (opcional)
4. Haz clic en "Guardar Candidato"
5. Verifica el mensaje de éxito
6. Verifica en la base de datos que el candidato se guardó correctamente

## 🐛 Solución de Problemas

### Error: "Cannot find module 'zod'"
**Solución:** Ejecuta `npm install` en el directorio `backend`.

### Error: "Cannot find module 'react-router-dom'"
**Solución:** Ejecuta `npm install` en el directorio `frontend`.

### Error: "Prisma Client not generated"
**Solución:** Ejecuta `npx prisma generate` en el directorio `backend`.

### Error: "Table 'Candidate' does not exist"
**Solución:** Ejecuta `npx prisma migrate dev` en el directorio `backend`.

### Error de conexión a la base de datos
**Solución:** 
1. Verifica que Docker esté corriendo: `docker-compose ps`
2. Verifica que el puerto en `DATABASE_URL` sea correcto (5440 para Docker)
3. Verifica las credenciales en `.env`

### El frontend no se conecta al backend
**Solución:**
1. Verifica que el backend esté corriendo en `http://localhost:4000`
2. Verifica que `REACT_APP_API_BASE_URL` esté configurado en `frontend/.env`
3. Reinicia el servidor de desarrollo del frontend después de crear/modificar `.env`

## 📚 Documentación Adicional

- **Prisma:** https://www.prisma.io/docs
- **React Hook Form:** https://react-hook-form.com/
- **Zod:** https://zod.dev/
- **Multer:** https://github.com/expressjs/multer

