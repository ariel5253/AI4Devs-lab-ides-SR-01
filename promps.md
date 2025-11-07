
# 📘 Prompts de Desarrollo – Funcionalidad de Gestión de Candidatos (AI4DEVS-LAB-IDES-SR-01)

Este documento consolida los **prompts maestros** utilizados en el desarrollo de las historias de usuario del módulo **ATS – Gestión de Candidatos**, abarcando tanto la creación de nuevos candidatos como su visualización dentro del dashboard del reclutador.

---

## 🧩 Prompt 1 — Añadir Candidato al Sistema ATS

Eres un desarrollador senior full-stack experto en TypeScript, React, Node.js y Prisma.  
Debes implementar COMPLETAMENTE la siguiente historia de usuario **end-to-end**, respetando la estructura actual del proyecto, sin sobrescribir archivos existentes innecesariamente y reutilizando toda la configuración vigente.

──────────────────────────────  
📂 **CONTEXTO REAL DEL PROYECTO**  
──────────────────────────────  
Monorepo: AI4DEVS-LAB-IDES-SR-01

Estructura:
```
├── backend/
│   ├── src/
│   ├── prisma/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env (ya configurado)
│   │   DB_PASSWORD=D1ymf8wyQEGthFR1E9xhCq
│   │   DB_USER=LTIdbUser
│   │   DB_NAME=LTIdb
│   │   DB_PORT=5432
│   │   DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/${DB_NAME}"
│   └── node_modules/
│
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── tsconfig.json
│   ├── node_modules/
│
└── docker-compose.yml (ya levanta Postgres en 5440:5432)
```

──────────────────────────────  
📖 **HISTORIA DE USUARIO**  
──────────────────────────────  
**Añadir Candidato al Sistema ATS**  
Como reclutador,  
Quiero poder añadir candidatos al sistema ATS,  
Para gestionar sus datos y procesos de selección de manera eficiente.

──────────────────────────────  
✅ **CRITERIOS DE ACEPTACIÓN**  
──────────────────────────────  
1. Desde el dashboard del reclutador debe verse un botón “Añadir candidato”.  
2. Al hacer clic, se muestra un formulario con los campos: nombre, apellido, correo electrónico, teléfono, dirección, educación y experiencia laboral.  
3. Validación de datos: email válido y campos requeridos.  
4. Subida de CV (PDF o DOCX) opcional.  
5. Confirmación de éxito tras enviar.  
6. Manejo de errores amigable.  
7. Accesible y usable desde desktop y móvil.  

──────────────────────────────  
🧱 **ETAPAS DE IMPLEMENTACIÓN**  
──────────────────────────────  
1. **Base de Datos (Prisma):** crear modelo `Candidate`, generar migración y repositorio.  
2. **Backend (Express):** implementar `POST /api/candidates`, validación con Zod, carga de archivos con multer.  
3. **Frontend (React):** formulario accesible, validaciones con `react-hook-form` + `ZodResolver`, y manejo de estado de envío.  

──────────────────────────────  
🧪 **COMANDOS DE PRUEBA**  
──────────────────────────────  
```bash
# Backend
cd backend
npm i
npx prisma generate
npx prisma migrate dev
npm run dev

# Frontend
cd frontend
npm i
npm start
```

──────────────────────────────  
🎯 **RESULTADO ESPERADO**  
──────────────────────────────  
El reclutador puede registrar nuevos candidatos, adjuntar su CV y obtener confirmación visual.  
Los datos se almacenan correctamente en la base de datos y son validados tanto en frontend como backend.

---

## 🧩 Prompt 2 — Listar Candidatos en el Dashboard

Ahora debes ampliar la funcionalidad para que el reclutador pueda visualizar todos los candidatos registrados desde su dashboard.

──────────────────────────────  
📖 **HISTORIA DE USUARIO**  
──────────────────────────────  
**Listar Candidatos en el Dashboard**  
Como reclutador,  
Quiero poder ver en el dashboard una lista de todos los candidatos registrados,  
Para tener una visión general rápida de sus datos básicos y acceder a su información.

──────────────────────────────  
✅ **CRITERIOS DE ACEPTACIÓN**  
──────────────────────────────  
- Mostrar una tabla con los candidatos.
- Columnas: nombre completo, correo, teléfono, educación, experiencia, CV.
- Datos obtenidos vía `GET /api/candidates`.
- Tabla ordenada, limpia, responsiva y accesible.
- Mostrar mensajes de carga, error o vacío según el estado.
- Mantener visible el botón “Añadir candidato”.

──────────────────────────────  
🧱 **BACKEND — EXTENSIÓN API**  
──────────────────────────────  
Nuevo endpoint `GET /api/candidates` en `backend/src/routes/candidate.routes.ts`.

- Consulta ordenada por `createdAt DESC`.
- Manejo de errores con códigos 500 y mensajes claros.

──────────────────────────────  
🧩 **FRONTEND — ACTUALIZACIÓN DASHBOARD**  
──────────────────────────────  
En `RecruiterDashboard.tsx`, uso de `useEffect` para obtener datos vía `fetch`.

- Estado local `candidates` y control de estados (cargando, éxito, error).
- Tabla HTML accesible (uso de roles y headers).
- Enlace “Ver CV” si existe `cvUrl`.
- Mensaje claro si no hay registros.

──────────────────────────────  
🎨 **EJEMPLO DE TABLA**  
──────────────────────────────  
| Nombre Completo | Correo                | Teléfono    | Educación   | Experiencia | CV    |
|------------------|-----------------------|-------------|-------------|-------------|-------|
| Juan Pérez       | juanperez@mail.com    | 3001234567  | Ingeniería   | 3 años      | [Ver CV] |

──────────────────────────────  
🧪 **TESTS**  
──────────────────────────────  
- Mock del fetch con lista de candidatos.
- Validación de renderizado y mensajes condicionales.

──────────────────────────────  
🎯 **RESULTADO FINAL**  
──────────────────────────────  
El dashboard muestra una tabla dinámica con los candidatos registrados, mensajes de estado apropiados y enlaces a los CV.  
La integración mantiene la accesibilidad, consistencia y compatibilidad completa con la HU anterior.

---

## 🧩 Conclusión General

Ambos prompts fueron cumplidos satisfactoriamente en el proyecto AI4DEVS-LAB-IDES-SR-01, logrando un flujo end-to-end completo:

- **Alta de candidatos:**
  - Validaciones front y back, subida de CV y persistencia en PostgreSQL mediante Prisma.
  - Código organizado por capas (repositorio, rutas, esquemas y middlewares).

- **Listado de candidatos:**
  - Lectura de datos real-time mediante `GET /api/candidates`.
  - Interfaz responsiva y accesible en React con visualización clara y jerárquica de datos.

🔹 Ambos desarrollos mantuvieron intacta la configuración original (.env, Docker, Jest).  
🔹 Se aplicaron buenas prácticas de arquitectura limpia, naming coherente, commits semánticos y pruebas automatizadas.  
🔹 El resultado final es un módulo ATS funcional, extensible y alineado con principios modernos de desarrollo full-stack TypeScript.