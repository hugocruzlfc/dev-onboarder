// ── Category mappings for dependency classification ──

export interface ProjectAnalysis {
  projectName: string;
  projectPath: string;
  framework: FrameworkInfo;
  dependencies: DependencyAnalysis;
  structure: FolderStructure;
  patterns: PatternInfo[];
  configs: ConfigInfo[];
  scripts: Record<string, string>;
  styling: StylingInfo;
  stateManagement: LibraryInfo[];
  dataFetching: LibraryInfo[];
  testing: TestingInfo;
  database: LibraryInfo[];
  authentication: LibraryInfo[];
  endpoints: EndpointInfo[];
  envVars: EnvVarInfo[];
  importGraph: ImportGraphNode[];
  metrics: ProjectMetrics;
  entryPoints: EntryPointInfo[];
}

export interface EndpointInfo {
  method: string;
  path: string;
  file: string;
  line: number;
  handler?: string;
}

export interface EnvVarInfo {
  name: string;
  defaultValue?: string;
  description?: string;
  required: boolean;
  source: string; // file where found
}

export interface ImportGraphNode {
  file: string;
  imports: string[];
  importedBy: string[];
}

export interface ProjectMetrics {
  totalFiles: number;
  totalLines: number;
  byExtension: Record<string, { files: number; lines: number }>;
  largestFiles: { file: string; lines: number }[];
  tsPercentage: number;
}

export interface EntryPointInfo {
  file: string;
  type: "main" | "server" | "page" | "api-route" | "config";
  description: string;
}

export interface FrameworkInfo {
  name: string;
  version: string;
  description: string;
  docsUrl: string;
  category: "frontend" | "backend" | "fullstack" | "unknown";
}

export interface DependencyAnalysis {
  production: DependencyInfo[];
  development: DependencyInfo[];
  total: number;
}

export interface DependencyInfo {
  name: string;
  version: string;
  category: DependencyCategory;
  description: string;
}

export type DependencyCategory =
  | "framework"
  | "state-management"
  | "data-fetching"
  | "styling"
  | "testing"
  | "database"
  | "authentication"
  | "validation"
  | "ui-components"
  | "build-tool"
  | "linting"
  | "utility"
  | "api"
  | "logging"
  | "other";

export interface FolderStructure {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FolderStructure[];
  description?: string;
}

export interface PatternInfo {
  name: string;
  description: string;
  evidence: string[];
}

export interface ConfigInfo {
  file: string;
  tool: string;
  description: string;
}

export interface StylingInfo {
  approach: string;
  libraries: LibraryInfo[];
  description: string;
}

export interface LibraryInfo {
  name: string;
  version: string;
  description: string;
  docsUrl: string;
}

export interface TestingInfo {
  framework: string;
  libraries: LibraryInfo[];
  hasE2E: boolean;
  hasUnit: boolean;
  hasIntegration: boolean;
}

// ── Known library catalog ──

export const KNOWN_LIBRARIES: Record<
  string,
  { category: DependencyCategory; description: string; docsUrl: string }
> = {
  // Frameworks
  next: {
    category: "framework",
    description: "Framework React fullstack con SSR, SSG y App Router",
    docsUrl: "https://nextjs.org/docs",
  },
  react: {
    category: "framework",
    description: "Biblioteca para construir interfaces de usuario",
    docsUrl: "https://react.dev",
  },
  "react-dom": {
    category: "framework",
    description: "Renderizado de React para el navegador",
    docsUrl: "https://react.dev",
  },
  "@nestjs/core": {
    category: "framework",
    description: "Framework backend progresivo para Node.js",
    docsUrl: "https://docs.nestjs.com",
  },
  "@nestjs/common": {
    category: "framework",
    description: "Módulo común de NestJS con decoradores y utilidades",
    docsUrl: "https://docs.nestjs.com",
  },
  express: {
    category: "framework",
    description: "Framework web minimalista para Node.js",
    docsUrl: "https://expressjs.com",
  },
  fastify: {
    category: "framework",
    description: "Framework web de alto rendimiento para Node.js",
    docsUrl: "https://fastify.dev",
  },
  "@remix-run/react": {
    category: "framework",
    description:
      "Framework fullstack basado en React con enfoque en web standards",
    docsUrl: "https://remix.run/docs",
  },
  "@remix-run/node": {
    category: "framework",
    description: "Módulo de Remix para entorno Node.js",
    docsUrl: "https://remix.run/docs",
  },
  vue: {
    category: "framework",
    description: "Framework progresivo para construir UIs",
    docsUrl: "https://vuejs.org",
  },
  nuxt: {
    category: "framework",
    description: "Framework fullstack basado en Vue.js",
    docsUrl: "https://nuxt.com",
  },
  svelte: {
    category: "framework",
    description: "Framework de compilación para UIs reactivas",
    docsUrl: "https://svelte.dev",
  },
  "@angular/core": {
    category: "framework",
    description: "Framework de aplicaciones web de Google",
    docsUrl: "https://angular.io",
  },
  astro: {
    category: "framework",
    description: "Framework para sitios web orientados a contenido",
    docsUrl: "https://astro.build",
  },
  hono: {
    category: "framework",
    description: "Framework web ultraligero para edge computing",
    docsUrl: "https://hono.dev",
  },

  // State Management
  zustand: {
    category: "state-management",
    description: "Manejo de estado global minimalista y flexible",
    docsUrl: "https://zustand-demo.pmnd.rs",
  },
  "@reduxjs/toolkit": {
    category: "state-management",
    description: "Toolset oficial para manejo de estado con Redux",
    docsUrl: "https://redux-toolkit.js.org",
  },
  redux: {
    category: "state-management",
    description: "Contenedor de estado predecible para apps JS",
    docsUrl: "https://redux.js.org",
  },
  "react-redux": {
    category: "state-management",
    description: "Bindings oficiales de React para Redux",
    docsUrl: "https://react-redux.js.org",
  },
  jotai: {
    category: "state-management",
    description: "Manejo de estado atómico primitivo para React",
    docsUrl: "https://jotai.org",
  },
  recoil: {
    category: "state-management",
    description: "Librería de manejo de estado experimental de Meta",
    docsUrl: "https://recoiljs.org",
  },
  mobx: {
    category: "state-management",
    description: "Manejo de estado reactivo y transparente",
    docsUrl: "https://mobx.js.org",
  },
  valtio: {
    category: "state-management",
    description: "Manejo de estado basado en proxy",
    docsUrl: "https://valtio.pmnd.rs",
  },
  xstate: {
    category: "state-management",
    description: "Máquinas de estado y statecharts para JS",
    docsUrl: "https://xstate.js.org",
  },
  "@tanstack/store": {
    category: "state-management",
    description: "Store reactivo framework-agnostic",
    docsUrl: "https://tanstack.com/store",
  },
  pinia: {
    category: "state-management",
    description: "Store oficial para Vue.js",
    docsUrl: "https://pinia.vuejs.org",
  },
  ngrx: {
    category: "state-management",
    description: "Manejo de estado reactivo para Angular",
    docsUrl: "https://ngrx.io",
  },

  // Data Fetching
  "@tanstack/react-query": {
    category: "data-fetching",
    description: "Manejo de datos asíncronos con cache, revalidación y más",
    docsUrl: "https://tanstack.com/query",
  },
  swr: {
    category: "data-fetching",
    description: "React hooks para data fetching con stale-while-revalidate",
    docsUrl: "https://swr.vercel.app",
  },
  axios: {
    category: "data-fetching",
    description: "Cliente HTTP basado en promesas",
    docsUrl: "https://axios-http.com",
  },
  "@trpc/client": {
    category: "data-fetching",
    description: "Cliente tRPC para APIs type-safe end-to-end",
    docsUrl: "https://trpc.io",
  },
  "@trpc/server": {
    category: "data-fetching",
    description: "Servidor tRPC para crear APIs type-safe",
    docsUrl: "https://trpc.io",
  },
  "@trpc/react-query": {
    category: "data-fetching",
    description: "Integración de tRPC con React Query",
    docsUrl: "https://trpc.io",
  },
  "@apollo/client": {
    category: "data-fetching",
    description: "Cliente GraphQL con cache integrado",
    docsUrl: "https://apollographql.com/docs",
  },
  "graphql-request": {
    category: "data-fetching",
    description: "Cliente GraphQL minimalista",
    docsUrl: "https://github.com/jasonkuhrt/graphql-request",
  },
  ky: {
    category: "data-fetching",
    description: "Cliente HTTP basado en Fetch API",
    docsUrl: "https://github.com/sindresorhus/ky",
  },
  got: {
    category: "data-fetching",
    description: "Cliente HTTP amigable para Node.js",
    docsUrl: "https://github.com/sindresorhus/got",
  },
  graphql: {
    category: "data-fetching",
    description: "Implementación de referencia de GraphQL para JS",
    docsUrl: "https://graphql.org",
  },
  "@nestjs/graphql": {
    category: "data-fetching",
    description: "Módulo GraphQL para NestJS",
    docsUrl: "https://docs.nestjs.com/graphql/quick-start",
  },

  // Styling
  tailwindcss: {
    category: "styling",
    description: "Framework CSS utility-first",
    docsUrl: "https://tailwindcss.com",
  },
  "styled-components": {
    category: "styling",
    description: "CSS-in-JS con template literals",
    docsUrl: "https://styled-components.com",
  },
  "@emotion/react": {
    category: "styling",
    description: "Librería CSS-in-JS de alto rendimiento",
    docsUrl: "https://emotion.sh",
  },
  "@emotion/styled": {
    category: "styling",
    description: "Componentes estilizados con Emotion",
    docsUrl: "https://emotion.sh",
  },
  sass: {
    category: "styling",
    description: "Preprocesador CSS con variables, nesting y más",
    docsUrl: "https://sass-lang.com",
  },
  "@vanilla-extract/css": {
    category: "styling",
    description: "CSS-in-TypeScript con zero runtime",
    docsUrl: "https://vanilla-extract.style",
  },
  postcss: {
    category: "styling",
    description: "Herramienta para transformar CSS con plugins",
    docsUrl: "https://postcss.org",
  },
  autoprefixer: {
    category: "styling",
    description: "Plugin PostCSS para añadir vendor prefixes",
    docsUrl: "https://autoprefixer.github.io",
  },
  clsx: {
    category: "styling",
    description: "Utilidad para construir className strings condicionalmente",
    docsUrl: "https://github.com/lukeed/clsx",
  },
  "class-variance-authority": {
    category: "styling",
    description: "Utilidad para crear variantes de componentes con clases",
    docsUrl: "https://cva.style",
  },
  "tailwind-merge": {
    category: "styling",
    description: "Merge inteligente de clases Tailwind",
    docsUrl: "https://github.com/dcastil/tailwind-merge",
  },

  // UI Components
  "@radix-ui/react-dialog": {
    category: "ui-components",
    description: "Componente Dialog accesible de Radix UI",
    docsUrl: "https://radix-ui.com",
  },
  "@shadcn/ui": {
    category: "ui-components",
    description: "Componentes UI reutilizables y personalizables",
    docsUrl: "https://ui.shadcn.com",
  },
  "@mui/material": {
    category: "ui-components",
    description: "Componentes Material Design para React",
    docsUrl: "https://mui.com",
  },
  "@chakra-ui/react": {
    category: "ui-components",
    description: "Componentes UI accesibles y modulares",
    docsUrl: "https://chakra-ui.com",
  },
  antd: {
    category: "ui-components",
    description: "Sistema de diseño empresarial de Ant Group",
    docsUrl: "https://ant.design",
  },
  "@headlessui/react": {
    category: "ui-components",
    description: "Componentes UI sin estilo y accesibles",
    docsUrl: "https://headlessui.com",
  },
  "lucide-react": {
    category: "ui-components",
    description: "Iconos SVG hermosos y consistentes",
    docsUrl: "https://lucide.dev",
  },
  "@heroicons/react": {
    category: "ui-components",
    description: "Iconos SVG de los creadores de Tailwind",
    docsUrl: "https://heroicons.com",
  },

  // Testing
  jest: {
    category: "testing",
    description: "Framework de testing con zero-config",
    docsUrl: "https://jestjs.io",
  },
  vitest: {
    category: "testing",
    description: "Framework de testing ultrarrápido powered by Vite",
    docsUrl: "https://vitest.dev",
  },
  "@testing-library/react": {
    category: "testing",
    description: "Testing de componentes React centrado en el usuario",
    docsUrl: "https://testing-library.com/react",
  },
  "@testing-library/jest-dom": {
    category: "testing",
    description: "Matchers DOM personalizados para Jest",
    docsUrl: "https://testing-library.com/jest-dom",
  },
  cypress: {
    category: "testing",
    description: "Testing E2E moderno y completo",
    docsUrl: "https://cypress.io",
  },
  playwright: {
    category: "testing",
    description: "Testing E2E cross-browser de Microsoft",
    docsUrl: "https://playwright.dev",
  },
  "@playwright/test": {
    category: "testing",
    description: "Runner de tests de Playwright",
    docsUrl: "https://playwright.dev",
  },
  supertest: {
    category: "testing",
    description: "Testing de APIs HTTP",
    docsUrl: "https://github.com/ladjs/supertest",
  },
  msw: {
    category: "testing",
    description: "Mock Service Worker para interceptar requests en tests",
    docsUrl: "https://mswjs.io",
  },
  storybook: {
    category: "testing",
    description: "Workshop para construir componentes UI en aislamiento",
    docsUrl: "https://storybook.js.org",
  },

  // Database & ORM
  prisma: {
    category: "database",
    description: "ORM de próxima generación con type-safety",
    docsUrl: "https://prisma.io",
  },
  "@prisma/client": {
    category: "database",
    description: "Cliente auto-generado de Prisma para acceso a DB",
    docsUrl: "https://prisma.io/client",
  },
  "drizzle-orm": {
    category: "database",
    description: "ORM TypeScript ligero y type-safe",
    docsUrl: "https://orm.drizzle.team",
  },
  typeorm: {
    category: "database",
    description: "ORM para TypeScript y JavaScript",
    docsUrl: "https://typeorm.io",
  },
  mongoose: {
    category: "database",
    description: "ODM elegante para MongoDB y Node.js",
    docsUrl: "https://mongoosejs.com",
  },
  sequelize: {
    category: "database",
    description: "ORM multi-dialecto para Node.js",
    docsUrl: "https://sequelize.org",
  },
  knex: {
    category: "database",
    description: "Query builder SQL para Node.js",
    docsUrl: "https://knexjs.org",
  },
  "better-sqlite3": {
    category: "database",
    description: "Driver SQLite3 rápido y simple",
    docsUrl: "https://github.com/WiseLibs/better-sqlite3",
  },
  redis: {
    category: "database",
    description: "Cliente Redis para Node.js",
    docsUrl: "https://redis.io",
  },
  ioredis: {
    category: "database",
    description: "Cliente Redis robusto y completo",
    docsUrl: "https://github.com/redis/ioredis",
  },

  // Authentication
  "next-auth": {
    category: "authentication",
    description: "Autenticación completa para Next.js",
    docsUrl: "https://next-auth.js.org",
  },
  "@auth/core": {
    category: "authentication",
    description: "Auth.js core para autenticación universal",
    docsUrl: "https://authjs.dev",
  },
  "better-auth": {
    category: "authentication",
    description: "Solución de autenticación moderna y type-safe",
    docsUrl: "https://better-auth.com",
  },
  passport: {
    category: "authentication",
    description: "Middleware de autenticación para Node.js",
    docsUrl: "https://passportjs.org",
  },
  "@clerk/nextjs": {
    category: "authentication",
    description: "Autenticación y gestión de usuarios con Clerk",
    docsUrl: "https://clerk.com",
  },
  jsonwebtoken: {
    category: "authentication",
    description: "Implementación de JSON Web Tokens",
    docsUrl: "https://github.com/auth0/node-jsonwebtoken",
  },
  bcrypt: {
    category: "authentication",
    description: "Hashing de contraseñas con bcrypt",
    docsUrl: "https://github.com/kelektiv/node.bcrypt.js",
  },
  bcryptjs: {
    category: "authentication",
    description: "Implementación JS pura de bcrypt",
    docsUrl: "https://github.com/dcodeIO/bcrypt.js",
  },

  // Validation
  zod: {
    category: "validation",
    description: "Validación de esquemas TypeScript-first",
    docsUrl: "https://zod.dev",
  },
  yup: {
    category: "validation",
    description: "Validación de esquemas con builders",
    docsUrl: "https://github.com/jquense/yup",
  },
  joi: {
    category: "validation",
    description: "Validación de datos para JavaScript",
    docsUrl: "https://joi.dev",
  },
  "class-validator": {
    category: "validation",
    description: "Validación basada en decoradores",
    docsUrl: "https://github.com/typestack/class-validator",
  },
  "class-transformer": {
    category: "validation",
    description: "Transformación de objetos con decoradores",
    docsUrl: "https://github.com/typestack/class-transformer",
  },
  "@hookform/resolvers": {
    category: "validation",
    description: "Resolvers de validación para React Hook Form",
    docsUrl: "https://react-hook-form.com",
  },
  "react-hook-form": {
    category: "validation",
    description: "Formularios performantes y flexibles para React",
    docsUrl: "https://react-hook-form.com",
  },
  "@tanstack/react-form": {
    category: "validation",
    description: "Formularios type-safe y headless",
    docsUrl: "https://tanstack.com/form",
  },

  // Build Tools
  vite: {
    category: "build-tool",
    description: "Build tool ultrarrápido de nueva generación",
    docsUrl: "https://vitejs.dev",
  },
  webpack: {
    category: "build-tool",
    description: "Module bundler para JavaScript",
    docsUrl: "https://webpack.js.org",
  },
  esbuild: {
    category: "build-tool",
    description: "Bundler y minifier extremadamente rápido",
    docsUrl: "https://esbuild.github.io",
  },
  turbo: {
    category: "build-tool",
    description: "Build system incremental para monorepos",
    docsUrl: "https://turbo.build",
  },
  tsup: {
    category: "build-tool",
    description: "Bundle TypeScript sin configuración",
    docsUrl: "https://tsup.egoist.dev",
  },

  // Linting & Formatting
  eslint: {
    category: "linting",
    description: "Linter pluggable para JavaScript/TypeScript",
    docsUrl: "https://eslint.org",
  },
  prettier: {
    category: "linting",
    description: "Formateador de código opinionado",
    docsUrl: "https://prettier.io",
  },
  biome: {
    category: "linting",
    description: "Toolchain rápido para web (lint + format)",
    docsUrl: "https://biomejs.dev",
  },

  // API
  "swagger-ui-express": {
    category: "api",
    description: "Documentación Swagger UI para Express",
    docsUrl: "https://swagger.io",
  },
  "@nestjs/swagger": {
    category: "api",
    description: "Módulo Swagger/OpenAPI para NestJS",
    docsUrl: "https://docs.nestjs.com/openapi/introduction",
  },

  // Utilities
  lodash: {
    category: "utility",
    description: "Utilidades JavaScript modernas",
    docsUrl: "https://lodash.com",
  },
  "date-fns": {
    category: "utility",
    description: "Funciones modernas para manipulación de fechas",
    docsUrl: "https://date-fns.org",
  },
  dayjs: {
    category: "utility",
    description: "Librería de fechas ligera alternativa a Moment",
    docsUrl: "https://day.js.org",
  },
  uuid: {
    category: "utility",
    description: "Generación de UUIDs RFC4122",
    docsUrl: "https://github.com/uuidjs/uuid",
  },
  nanoid: {
    category: "utility",
    description: "Generador de IDs únicos pequeño y seguro",
    docsUrl: "https://github.com/ai/nanoid",
  },
  dotenv: {
    category: "utility",
    description: "Carga variables de entorno desde .env",
    docsUrl: "https://github.com/motdotla/dotenv",
  },

  // Logging
  winston: {
    category: "logging",
    description: "Logger universal multi-transporte",
    docsUrl: "https://github.com/winstonjs/winston",
  },
  pino: {
    category: "logging",
    description: "Logger JSON de muy bajo overhead",
    docsUrl: "https://getpino.io",
  },
};
