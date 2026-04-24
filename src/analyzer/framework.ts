import * as fs from "fs";
import * as path from "path";
import {
  FrameworkInfo,
  StylingInfo,
  LibraryInfo,
  TestingInfo,
  DependencyAnalysis,
  KNOWN_LIBRARIES,
} from "../types";

export function detectFramework(
  projectPath: string,
  deps: DependencyAnalysis,
): FrameworkInfo {
  const allDeps = [...deps.production, ...deps.development];
  const depNames = new Set(allDeps.map((d) => d.name));

  // Check in priority order (more specific first)
  if (depNames.has("next")) {
    const ver = allDeps.find((d) => d.name === "next")?.version || "";
    return {
      name: "Next.js",
      version: ver,
      description:
        "Framework React fullstack con Server-Side Rendering, Static Site Generation y App Router. Soporta Server Components y Server Actions.",
      docsUrl: "https://nextjs.org/docs",
      category: "fullstack",
    };
  }

  if (depNames.has("@remix-run/react") || depNames.has("@remix-run/node")) {
    const ver =
      allDeps.find((d) => d.name === "@remix-run/react")?.version || "";
    return {
      name: "Remix",
      version: ver,
      description:
        "Framework fullstack basado en React con enfoque en web standards, loaders y actions para data fetching.",
      docsUrl: "https://remix.run/docs",
      category: "fullstack",
    };
  }

  if (depNames.has("@nestjs/core")) {
    const ver = allDeps.find((d) => d.name === "@nestjs/core")?.version || "";
    return {
      name: "NestJS",
      version: ver,
      description:
        "Framework backend progresivo para Node.js con arquitectura modular, inyección de dependencias y soporte para REST y GraphQL.",
      docsUrl: "https://docs.nestjs.com",
      category: "backend",
    };
  }

  if (depNames.has("nuxt")) {
    const ver = allDeps.find((d) => d.name === "nuxt")?.version || "";
    return {
      name: "Nuxt",
      version: ver,
      description:
        "Framework fullstack basado en Vue.js con SSR, SSG y auto-imports.",
      docsUrl: "https://nuxt.com",
      category: "fullstack",
    };
  }

  if (depNames.has("astro")) {
    const ver = allDeps.find((d) => d.name === "astro")?.version || "";
    return {
      name: "Astro",
      version: ver,
      description:
        "Framework para sitios web orientados a contenido con cero JS por defecto y arquitectura de islas.",
      docsUrl: "https://astro.build",
      category: "fullstack",
    };
  }

  if (depNames.has("@angular/core")) {
    const ver = allDeps.find((d) => d.name === "@angular/core")?.version || "";
    return {
      name: "Angular",
      version: ver,
      description: "Framework de aplicaciones web con TypeScript de Google.",
      docsUrl: "https://angular.io",
      category: "frontend",
    };
  }

  if (depNames.has("vue")) {
    const ver = allDeps.find((d) => d.name === "vue")?.version || "";
    return {
      name: "Vue.js",
      version: ver,
      description: "Framework progresivo para construir interfaces de usuario.",
      docsUrl: "https://vuejs.org",
      category: "frontend",
    };
  }

  if (depNames.has("svelte") || depNames.has("@sveltejs/kit")) {
    const ver =
      allDeps.find((d) => d.name === "svelte" || d.name === "@sveltejs/kit")
        ?.version || "";
    return {
      name: depNames.has("@sveltejs/kit") ? "SvelteKit" : "Svelte",
      version: ver,
      description:
        "Framework de compilación para UIs reactivas con rendimiento excelente.",
      docsUrl: "https://svelte.dev",
      category: depNames.has("@sveltejs/kit") ? "fullstack" : "frontend",
    };
  }

  if (depNames.has("express")) {
    const ver = allDeps.find((d) => d.name === "express")?.version || "";
    return {
      name: "Express",
      version: ver,
      description: "Framework web minimalista y flexible para Node.js.",
      docsUrl: "https://expressjs.com",
      category: "backend",
    };
  }

  if (depNames.has("fastify")) {
    const ver = allDeps.find((d) => d.name === "fastify")?.version || "";
    return {
      name: "Fastify",
      version: ver,
      description:
        "Framework web de alto rendimiento con schema-based validation.",
      docsUrl: "https://fastify.dev",
      category: "backend",
    };
  }

  if (depNames.has("hono")) {
    const ver = allDeps.find((d) => d.name === "hono")?.version || "";
    return {
      name: "Hono",
      version: ver,
      description: "Framework web ultraligero para edge computing.",
      docsUrl: "https://hono.dev",
      category: "backend",
    };
  }

  if (depNames.has("react")) {
    const ver = allDeps.find((d) => d.name === "react")?.version || "";
    return {
      name: "React",
      version: ver,
      description:
        "Biblioteca para construir interfaces de usuario con Vite u otro bundler.",
      docsUrl: "https://react.dev",
      category: "frontend",
    };
  }

  return {
    name: "Desconocido",
    version: "",
    description: "No se pudo detectar el framework principal del proyecto.",
    docsUrl: "",
    category: "unknown",
  };
}

export function detectStyling(
  deps: DependencyAnalysis,
  projectPath: string,
): StylingInfo {
  const allDeps = [...deps.production, ...deps.development];
  const depNames = new Set(allDeps.map((d) => d.name));
  const libraries: LibraryInfo[] = [];

  const hasTailwindConfig =
    fs.existsSync(path.join(projectPath, "tailwind.config.js")) ||
    fs.existsSync(path.join(projectPath, "tailwind.config.ts")) ||
    fs.existsSync(path.join(projectPath, "tailwind.config.mjs"));

  if (depNames.has("tailwindcss") || hasTailwindConfig) {
    libraries.push({
      name: "Tailwind CSS",
      version: allDeps.find((d) => d.name === "tailwindcss")?.version || "",
      description:
        "Framework CSS utility-first. Los estilos se aplican directamente en las clases HTML.",
      docsUrl: "https://tailwindcss.com",
    });
  }

  if (depNames.has("styled-components")) {
    libraries.push({
      name: "styled-components",
      version:
        allDeps.find((d) => d.name === "styled-components")?.version || "",
      description:
        "CSS-in-JS con template literals. Cada componente tiene sus estilos encapsulados.",
      docsUrl: "https://styled-components.com",
    });
  }

  if (depNames.has("@emotion/react") || depNames.has("@emotion/styled")) {
    libraries.push({
      name: "Emotion",
      version: allDeps.find((d) => d.name === "@emotion/react")?.version || "",
      description:
        "CSS-in-JS de alto rendimiento con soporte para estilos dinámicos.",
      docsUrl: "https://emotion.sh",
    });
  }

  if (depNames.has("sass")) {
    libraries.push({
      name: "Sass/SCSS",
      version: allDeps.find((d) => d.name === "sass")?.version || "",
      description: "Preprocesador CSS con variables, nesting, mixins y más.",
      docsUrl: "https://sass-lang.com",
    });
  }

  if (depNames.has("@vanilla-extract/css")) {
    libraries.push({
      name: "Vanilla Extract",
      version:
        allDeps.find((d) => d.name === "@vanilla-extract/css")?.version || "",
      description: "CSS-in-TypeScript con zero runtime overhead.",
      docsUrl: "https://vanilla-extract.style",
    });
  }

  let approach = "CSS estándar";
  if (libraries.length > 0) {
    approach = libraries.map((l) => l.name).join(" + ");
  }

  // Check for CSS Modules
  const srcPath = path.join(projectPath, "src");
  if (fs.existsSync(srcPath)) {
    try {
      const hasCssModules =
        findFilesRecursive(srcPath, /\.module\.(css|scss|sass)$/, 2).length > 0;
      if (hasCssModules) {
        approach += (libraries.length > 0 ? " + " : "") + "CSS Modules";
      }
    } catch {
      // ignore
    }
  }

  return {
    approach,
    libraries,
    description:
      libraries.length > 0
        ? `El proyecto usa ${approach} para el manejo de estilos.`
        : "El proyecto usa CSS estándar sin librerías adicionales.",
  };
}

export function detectStateManagement(deps: DependencyAnalysis): LibraryInfo[] {
  const stateLibs: LibraryInfo[] = [];
  const allDeps = [...deps.production, ...deps.development];

  const statePackages = [
    "zustand",
    "@reduxjs/toolkit",
    "redux",
    "react-redux",
    "jotai",
    "recoil",
    "mobx",
    "valtio",
    "xstate",
    "@tanstack/store",
    "pinia",
    "ngrx",
  ];

  for (const pkg of statePackages) {
    const dep = allDeps.find((d) => d.name === pkg);
    if (dep) {
      const known = KNOWN_LIBRARIES[pkg];
      stateLibs.push({
        name: pkg,
        version: dep.version,
        description: known?.description || "",
        docsUrl: known?.docsUrl || "",
      });
    }
  }

  return stateLibs;
}

export function detectDataFetching(deps: DependencyAnalysis): LibraryInfo[] {
  const fetchLibs: LibraryInfo[] = [];
  const allDeps = [...deps.production, ...deps.development];

  const fetchPackages = [
    "@tanstack/react-query",
    "swr",
    "axios",
    "@trpc/client",
    "@trpc/server",
    "@trpc/react-query",
    "@apollo/client",
    "graphql-request",
    "ky",
    "got",
    "graphql",
    "@nestjs/graphql",
  ];

  for (const pkg of fetchPackages) {
    const dep = allDeps.find((d) => d.name === pkg);
    if (dep) {
      const known = KNOWN_LIBRARIES[pkg];
      fetchLibs.push({
        name: pkg,
        version: dep.version,
        description: known?.description || "",
        docsUrl: known?.docsUrl || "",
      });
    }
  }

  return fetchLibs;
}

export function detectTesting(deps: DependencyAnalysis): TestingInfo {
  const allDeps = [...deps.production, ...deps.development];
  const depNames = new Set(allDeps.map((d) => d.name));
  const libraries: LibraryInfo[] = [];

  const testPackages = [
    "jest",
    "vitest",
    "@testing-library/react",
    "@testing-library/jest-dom",
    "cypress",
    "playwright",
    "@playwright/test",
    "supertest",
    "msw",
    "storybook",
  ];

  for (const pkg of testPackages) {
    const dep = allDeps.find((d) => d.name === pkg);
    if (dep) {
      const known = KNOWN_LIBRARIES[pkg];
      libraries.push({
        name: pkg,
        version: dep.version,
        description: known?.description || "",
        docsUrl: known?.docsUrl || "",
      });
    }
  }

  let framework = "No detectado";
  if (depNames.has("vitest")) framework = "Vitest";
  else if (depNames.has("jest")) framework = "Jest";

  return {
    framework,
    libraries,
    hasE2E:
      depNames.has("cypress") ||
      depNames.has("playwright") ||
      depNames.has("@playwright/test"),
    hasUnit:
      depNames.has("jest") ||
      depNames.has("vitest") ||
      depNames.has("@testing-library/react"),
    hasIntegration: depNames.has("supertest") || depNames.has("msw"),
  };
}

export function detectDatabase(deps: DependencyAnalysis): LibraryInfo[] {
  const dbLibs: LibraryInfo[] = [];
  const allDeps = [...deps.production, ...deps.development];

  const dbPackages = [
    "prisma",
    "@prisma/client",
    "drizzle-orm",
    "typeorm",
    "mongoose",
    "sequelize",
    "knex",
    "better-sqlite3",
    "redis",
    "ioredis",
  ];

  for (const pkg of dbPackages) {
    const dep = allDeps.find((d) => d.name === pkg);
    if (dep) {
      const known = KNOWN_LIBRARIES[pkg];
      dbLibs.push({
        name: pkg,
        version: dep.version,
        description: known?.description || "",
        docsUrl: known?.docsUrl || "",
      });
    }
  }

  return dbLibs;
}

export function detectAuthentication(deps: DependencyAnalysis): LibraryInfo[] {
  const authLibs: LibraryInfo[] = [];
  const allDeps = [...deps.production, ...deps.development];

  const authPackages = [
    "next-auth",
    "@auth/core",
    "better-auth",
    "passport",
    "@clerk/nextjs",
    "jsonwebtoken",
    "bcrypt",
    "bcryptjs",
  ];

  for (const pkg of authPackages) {
    const dep = allDeps.find((d) => d.name === pkg);
    if (dep) {
      const known = KNOWN_LIBRARIES[pkg];
      authLibs.push({
        name: pkg,
        version: dep.version,
        description: known?.description || "",
        docsUrl: known?.docsUrl || "",
      });
    }
  }

  return authLibs;
}

// Helper
function findFilesRecursive(
  dir: string,
  pattern: RegExp,
  maxDepth: number,
  depth = 0,
): string[] {
  if (depth >= maxDepth) return [];
  const results: string[] = [];

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;

      const fullPath = path.join(dir, entry.name);
      if (entry.isFile() && pattern.test(entry.name)) {
        results.push(fullPath);
        if (results.length >= 3) return results; // Early exit
      } else if (entry.isDirectory()) {
        results.push(
          ...findFilesRecursive(fullPath, pattern, maxDepth, depth + 1),
        );
        if (results.length >= 3) return results;
      }
    }
  } catch {
    // ignore permission errors
  }

  return results;
}
