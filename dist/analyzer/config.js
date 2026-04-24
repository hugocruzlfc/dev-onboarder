"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectConfigs = detectConfigs;
exports.detectPackageManager = detectPackageManager;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const CONFIG_MAP = {
    "tsconfig.json": {
        tool: "TypeScript",
        description: "Configuración del compilador TypeScript (strict mode, paths, target, etc.)",
    },
    "tsconfig.build.json": {
        tool: "TypeScript",
        description: "Configuración TypeScript para build de producción",
    },
    "next.config.js": {
        tool: "Next.js",
        description: "Configuración del framework Next.js (redirects, rewrites, plugins)",
    },
    "next.config.mjs": {
        tool: "Next.js",
        description: "Configuración del framework Next.js (formato ESM)",
    },
    "next.config.ts": {
        tool: "Next.js",
        description: "Configuración del framework Next.js (formato TypeScript)",
    },
    "vite.config.ts": {
        tool: "Vite",
        description: "Configuración del bundler Vite (plugins, aliases, proxy)",
    },
    "vite.config.js": {
        tool: "Vite",
        description: "Configuración del bundler Vite",
    },
    "tailwind.config.js": {
        tool: "Tailwind CSS",
        description: "Configuración de Tailwind (theme, plugins, content paths)",
    },
    "tailwind.config.ts": {
        tool: "Tailwind CSS",
        description: "Configuración de Tailwind (formato TypeScript)",
    },
    "tailwind.config.mjs": {
        tool: "Tailwind CSS",
        description: "Configuración de Tailwind (formato ESM)",
    },
    "postcss.config.js": {
        tool: "PostCSS",
        description: "Configuración de PostCSS y sus plugins",
    },
    "postcss.config.mjs": {
        tool: "PostCSS",
        description: "Configuración de PostCSS (formato ESM)",
    },
    ".eslintrc": {
        tool: "ESLint",
        description: "Reglas de linting para mantener calidad de código",
    },
    ".eslintrc.js": {
        tool: "ESLint",
        description: "Reglas de linting para mantener calidad de código",
    },
    ".eslintrc.json": {
        tool: "ESLint",
        description: "Reglas de linting para mantener calidad de código",
    },
    "eslint.config.js": {
        tool: "ESLint",
        description: "Configuración de ESLint v9+ (flat config)",
    },
    "eslint.config.mjs": {
        tool: "ESLint",
        description: "Configuración de ESLint v9+ (flat config, ESM)",
    },
    ".prettierrc": {
        tool: "Prettier",
        description: "Configuración del formateador de código",
    },
    ".prettierrc.js": {
        tool: "Prettier",
        description: "Configuración del formateador de código",
    },
    "prettier.config.js": {
        tool: "Prettier",
        description: "Configuración del formateador de código",
    },
    "biome.json": {
        tool: "Biome",
        description: "Configuración de Biome (linter + formatter)",
    },
    "jest.config.js": {
        tool: "Jest",
        description: "Configuración del framework de testing Jest",
    },
    "jest.config.ts": {
        tool: "Jest",
        description: "Configuración de Jest (formato TypeScript)",
    },
    "vitest.config.ts": {
        tool: "Vitest",
        description: "Configuración del framework de testing Vitest",
    },
    "cypress.config.ts": {
        tool: "Cypress",
        description: "Configuración de Cypress para tests E2E",
    },
    "cypress.config.js": {
        tool: "Cypress",
        description: "Configuración de Cypress para tests E2E",
    },
    "playwright.config.ts": {
        tool: "Playwright",
        description: "Configuración de Playwright para tests E2E",
    },
    ".env.example": {
        tool: "Environment",
        description: "Variables de entorno requeridas (plantilla para .env)",
    },
    ".env.local.example": {
        tool: "Environment",
        description: "Variables de entorno locales (plantilla)",
    },
    "docker-compose.yml": {
        tool: "Docker",
        description: "Configuración de Docker Compose para servicios (DB, cache, etc.)",
    },
    "docker-compose.yaml": {
        tool: "Docker",
        description: "Configuración de Docker Compose para servicios",
    },
    Dockerfile: {
        tool: "Docker",
        description: "Definición de imagen Docker para el proyecto",
    },
    ".dockerignore": {
        tool: "Docker",
        description: "Archivos excluidos del build de Docker",
    },
    "nest-cli.json": {
        tool: "NestJS",
        description: "Configuración del CLI de NestJS",
    },
    ".storybook": {
        tool: "Storybook",
        description: "Configuración de Storybook para desarrollo de componentes",
    },
    "turbo.json": {
        tool: "Turborepo",
        description: "Configuración del build system para monorepo",
    },
    "pnpm-workspace.yaml": {
        tool: "pnpm",
        description: "Configuración de workspace para monorepo con pnpm",
    },
    "lerna.json": {
        tool: "Lerna",
        description: "Configuración de Lerna para monorepo",
    },
    ".github": {
        tool: "GitHub",
        description: "Workflows CI/CD, templates de issues/PRs",
    },
    "prisma/schema.prisma": {
        tool: "Prisma",
        description: "Esquema de base de datos y modelos de Prisma",
    },
    "drizzle.config.ts": {
        tool: "Drizzle",
        description: "Configuración de Drizzle ORM",
    },
    ".husky": {
        tool: "Husky",
        description: "Git hooks para linting, testing pre-commit",
    },
    "commitlint.config.js": {
        tool: "Commitlint",
        description: "Reglas para mensajes de commit convencionales",
    },
    ".lintstagedrc": {
        tool: "lint-staged",
        description: "Configuración para ejecutar linters en archivos staged",
    },
};
function detectConfigs(projectPath) {
    const configs = [];
    for (const [file, info] of Object.entries(CONFIG_MAP)) {
        const fullPath = path.join(projectPath, file);
        if (fs.existsSync(fullPath)) {
            configs.push({
                file,
                tool: info.tool,
                description: info.description,
            });
        }
    }
    return configs;
}
function detectPackageManager(projectPath) {
    if (fs.existsSync(path.join(projectPath, "pnpm-lock.yaml")))
        return "pnpm";
    if (fs.existsSync(path.join(projectPath, "yarn.lock")))
        return "yarn";
    if (fs.existsSync(path.join(projectPath, "bun.lockb")) ||
        fs.existsSync(path.join(projectPath, "bun.lock")))
        return "bun";
    if (fs.existsSync(path.join(projectPath, "package-lock.json")))
        return "npm";
    return "npm";
}
//# sourceMappingURL=config.js.map