# 🚀 Dev-Onboarder

> 📖 [Read in English](README.md)

CLI tool que analiza cualquier proyecto Node.js/TypeScript y genera automáticamente una **guía de onboarding** completa para nuevos desarrolladores.

## ¿Qué hace?

Escanea tu proyecto y genera un documento `ONBOARDING.md` que incluye:

- **Resumen del proyecto** — Framework, tipo, dependencias totales, métricas
- **Quick Start** — Pasos para levantar el proyecto desde cero
- **Dónde empezar** — Entry points, archivos hub, tips de navegación
- **Métricas** — Archivos, líneas de código, % TypeScript, archivos más grandes
- **Diagramas de arquitectura** — Mermaid diagrams del flujo de datos
- **Estructura de carpetas** — Árbol visual con descripción de directorios
- **Mapa de endpoints** — Rutas API detectadas (Express, NestJS, Next.js)
- **Variables de entorno** — Parseadas de `.env.example` y código fuente
- **Stack tecnológico** — Todas las librerías categorizadas y documentadas
- **Patrones de diseño** — Detecta MVC, Feature-based, DI, Hooks, etc.
- **Grafo de dependencias internas** — Relaciones de imports entre archivos
- **Estilos** — Tailwind, CSS Modules, styled-components, etc.
- **Estado global** — Redux, Zustand, Jotai, etc.
- **Data fetching** — React Query, SWR, tRPC, Apollo, etc.
- **Base de datos** — Prisma, Drizzle, TypeORM, Mongoose, etc.
- **Autenticación** — NextAuth, Clerk, Passport, etc.
- **Testing** — Jest, Vitest, Cypress, Playwright, etc.
- **Scripts disponibles** — Todos los npm scripts documentados
- **Configuraciones** — Archivos de config detectados y su propósito

## Instalación

```bash
# Opción 1: Ejecutar directamente con npx (recomendado)
npx dev-onboarder

# Opción 2: Instalar globalmente
npm install -g dev-onboarder

# Opción 3: Clonar el repo
git clone <url>
cd dev-onboarder
npm install
npm run build
```

## Uso

```bash
# Analizar el directorio actual
npx dev-onboarder

# Analizar un proyecto específico
npx dev-onboarder /ruta/al/proyecto

# Cambiar nombre del archivo de salida
npx dev-onboarder --output GUIA.md

# Imprimir en consola en lugar de archivo
npx dev-onboarder --stdout

# Exportar análisis como JSON
npx dev-onboarder --json
```

## Ejemplo de salida

Al ejecutar en un proyecto Next.js con Prisma y Tailwind, genera algo como:

```
🔍 dev-onboarder

   Analizando: /Users/dev/mi-proyecto

✅ Guía generada exitosamente!
   📄 Archivo: /Users/dev/mi-proyecto/ONBOARDING.md

   Resumen:
   ├── Framework: Next.js ^14.0.0
   ├── Dependencias: 45
   ├── Patrones: File-Based Routing, Service Layer, Custom Hooks
   ├── Estilos: Tailwind CSS
   ├── Testing: Vitest
   ├── Estado: Zustand
   ├── DB: @prisma/client
   └── Configs: 8 archivos detectados
```

## Frameworks soportados

| Framework        | Categoría          |
| ---------------- | ------------------ |
| Next.js          | Fullstack          |
| Remix            | Fullstack          |
| NestJS           | Backend            |
| Express          | Backend            |
| Fastify          | Backend            |
| React (Vite)     | Frontend           |
| Vue.js           | Frontend           |
| Nuxt             | Fullstack          |
| Angular          | Frontend           |
| Svelte/SvelteKit | Frontend/Fullstack |
| Astro            | Fullstack          |
| Hono             | Backend            |

## Diagramas

El documento generado incluye diagramas Mermaid renderizables en GitHub, GitLab, VS Code (con extensión) y la mayoría de viewers de Markdown:

- **Diagrama de Arquitectura** — Vista general de las capas del proyecto
- **Diagrama de Estructura** — Visualización de carpetas principales
- **Diagrama de Flujo de Datos** — Secuencia típica de una interacción usuario-servidor

## Desarrollo

```bash
# Instalar deps
npm install

# Build
npm run build

# Ejecutar en modo desarrollo
npm run dev -- /ruta/al/proyecto

# Probar con tu propio proyecto
node dist/index.js /ruta/al/proyecto
```

## Tecnologías

- **TypeScript** — Type-safety completo
- **Commander** — CLI parsing
- **Chalk** — Output con colores
- **Ora** — Spinners de progreso
- **Vitest** — Testing

## Uso como librería

También puedes usar `dev-onboarder` programáticamente:

```typescript
import { analyzeProject, generateMarkdown } from "dev-onboarder";

const analysis = analyzeProject("/ruta/al/proyecto");
const markdown = generateMarkdown(analysis);

// O trabaja directamente con el análisis
console.log(analysis.framework); // { name: 'Next.js', version: '14.0.0', ... }
console.log(analysis.endpoints); // [{ method: 'GET', path: '/api/users', ... }]
console.log(analysis.envVars); // [{ name: 'DATABASE_URL', required: true, ... }]
console.log(analysis.metrics); // { totalFiles: 120, totalLines: 8500, ... }
console.log(analysis.importGraph); // [{ file: 'src/index.ts', imports: [...], importedBy: [...] }]
```

## Licencia

MIT
