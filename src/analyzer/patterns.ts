import * as fs from "fs";
import * as path from "path";
import { PatternInfo, FolderStructure, DependencyAnalysis } from "../types";

export function detectPatterns(
  projectPath: string,
  structure: FolderStructure,
  deps: DependencyAnalysis,
): PatternInfo[] {
  const patterns: PatternInfo[] = [];
  const topLevelDirs = getDirNames(structure);
  const srcDirs = getSrcSubDirs(structure);
  const allDirs = [...topLevelDirs, ...srcDirs];
  const depNames = new Set(
    [...deps.production, ...deps.development].map((d) => d.name),
  );

  // Feature-based / Domain-driven
  if (
    allDirs.includes("features") ||
    allDirs.includes("domains") ||
    allDirs.includes("modules")
  ) {
    patterns.push({
      name: "Feature-Based / Modular Architecture",
      description:
        "El código está organizado por funcionalidades o dominios de negocio. Cada módulo/feature contiene todo lo necesario (componentes, hooks, servicios, tipos) para esa funcionalidad.",
      evidence: filterExisting(["features/", "domains/", "modules/"], allDirs),
    });
  }

  // MVC / Controller pattern
  if (
    allDirs.includes("controllers") ||
    allDirs.includes("models") ||
    allDirs.includes("views")
  ) {
    patterns.push({
      name: "MVC (Model-View-Controller)",
      description:
        "Separación de responsabilidades en Modelos (datos), Vistas (UI) y Controladores (lógica de negocio). Cada capa tiene una responsabilidad clara.",
      evidence: filterExisting(["controllers/", "models/", "views/"], allDirs),
    });
  }

  // Repository pattern
  if (allDirs.includes("repositories") || allDirs.includes("repository")) {
    patterns.push({
      name: "Repository Pattern",
      description:
        "Abstracción de la capa de acceso a datos. Los repositorios encapsulan la lógica de consultas a la base de datos, separándola de la lógica de negocio.",
      evidence: ["repositories/ o repository/"],
    });
  }

  // Service layer
  if (allDirs.includes("services") || allDirs.includes("service")) {
    patterns.push({
      name: "Service Layer",
      description:
        "Capa de servicios que encapsula la lógica de negocio. Los servicios son consumidos por controladores o componentes y pueden comunicarse con APIs externas o repositorios.",
      evidence: ["services/"],
    });
  }

  // Dependency Injection (NestJS)
  if (depNames.has("@nestjs/core")) {
    patterns.push({
      name: "Dependency Injection (IoC)",
      description:
        "NestJS utiliza Inversión de Control (IoC) con inyección de dependencias. Los servicios se inyectan automáticamente a través de decoradores (@Injectable, @Inject).",
      evidence: [
        "@nestjs/core detectado",
        "Decoradores @Injectable(), @Module()",
      ],
    });
  }

  // Container/Presentational (Smart/Dumb components)
  if (
    allDirs.includes("containers") ||
    (allDirs.includes("pages") && allDirs.includes("components"))
  ) {
    patterns.push({
      name: "Container/Presentational Components",
      description:
        'Separación entre componentes "inteligentes" (containers/pages) que manejan estado y lógica, y componentes "tontos" (presentational) que solo renderizan UI.',
      evidence: filterExisting(
        ["containers/", "pages/", "components/"],
        allDirs,
      ),
    });
  }

  // Custom hooks pattern
  if (allDirs.includes("hooks")) {
    patterns.push({
      name: "Custom Hooks Pattern",
      description:
        "Lógica reutilizable extraída en custom hooks. Permite compartir comportamiento entre componentes sin duplicar código.",
      evidence: ["hooks/"],
    });
  }

  // Atomic Design
  if (
    ["atoms", "molecules", "organisms", "templates"].some((d) =>
      allDirs.includes(d),
    )
  ) {
    patterns.push({
      name: "Atomic Design",
      description:
        "Metodología de diseño de UI que organiza componentes en: Atoms (botones, inputs), Molecules (grupos de atoms), Organisms (secciones complejas), Templates y Pages.",
      evidence: filterExisting(
        ["atoms/", "molecules/", "organisms/", "templates/"],
        allDirs,
      ),
    });
  }

  // Middleware pattern
  if (allDirs.includes("middleware") || allDirs.includes("middlewares")) {
    patterns.push({
      name: "Middleware Pattern",
      description:
        "Funciones intermedias que procesan requests/responses en cadena. Se usan para auth, logging, validación, etc.",
      evidence: ["middleware/"],
    });
  }

  // Guards / Interceptors / Pipes (NestJS)
  if (
    allDirs.includes("guards") ||
    allDirs.includes("interceptors") ||
    allDirs.includes("pipes")
  ) {
    patterns.push({
      name: "Guards / Interceptors / Pipes",
      description:
        "Patrones de NestJS para control de acceso (Guards), transformación de datos (Pipes) e interceptación de requests/responses (Interceptors).",
      evidence: filterExisting(["guards/", "interceptors/", "pipes/"], allDirs),
    });
  }

  // Context pattern (React)
  if (allDirs.includes("context") || allDirs.includes("providers")) {
    patterns.push({
      name: "Context / Provider Pattern",
      description:
        "Uso de React Context para compartir estado o funcionalidad a través del árbol de componentes sin prop drilling.",
      evidence: filterExisting(["context/", "providers/"], allDirs),
    });
  }

  // Compound Components
  if (hasFilePattern(projectPath, /compound/i)) {
    patterns.push({
      name: "Compound Components",
      description:
        "Patrón donde un componente padre coordina el estado de sus hijos. Ejemplo: <Tabs> con <Tab.Panel>, <Tab.List>.",
      evidence: ['Archivos con patrón "compound" detectados'],
    });
  }

  // Monorepo
  if (
    fs.existsSync(path.join(projectPath, "packages")) ||
    fs.existsSync(path.join(projectPath, "apps"))
  ) {
    patterns.push({
      name: "Monorepo",
      description:
        "Múltiples proyectos o paquetes dentro de un solo repositorio. Permite compartir código y dependencias entre proyectos.",
      evidence: filterExisting(
        ["packages/", "apps/"],
        topLevelDirs.concat(
          fs.existsSync(path.join(projectPath, "packages")) ? ["packages"] : [],
          fs.existsSync(path.join(projectPath, "apps")) ? ["apps"] : [],
        ),
      ),
    });
  }

  // Server Actions pattern (Next.js)
  if (allDirs.includes("actions") && depNames.has("next")) {
    patterns.push({
      name: "Server Actions",
      description:
        "Funciones que se ejecutan en el servidor directamente desde componentes React. Patrón de Next.js para mutaciones de datos sin crear API routes.",
      evidence: ["actions/"],
    });
  }

  // Colocation pattern (App Router)
  const appDir =
    path.join(projectPath, "app") || path.join(projectPath, "src", "app");
  if (
    fs.existsSync(path.join(projectPath, "app")) ||
    fs.existsSync(path.join(projectPath, "src", "app"))
  ) {
    if (depNames.has("next")) {
      patterns.push({
        name: "File-Based Routing (App Router)",
        description:
          "Next.js App Router donde la estructura de carpetas en app/ define las rutas de la aplicación. Cada page.tsx es una ruta, layout.tsx define layouts compartidos.",
        evidence: ["app/ directory con Next.js"],
      });
    }
  }

  // If no patterns detected
  if (patterns.length === 0) {
    patterns.push({
      name: "Estructura simple",
      description:
        "El proyecto no sigue un patrón arquitectónico complejo. Los archivos se organizan por tipo (componentes, utils, etc.).",
      evidence: ["Estructura plana de directorios"],
    });
  }

  return patterns;
}

// ── Helpers ──

function getDirNames(structure: FolderStructure): string[] {
  return (structure.children || [])
    .filter((c) => c.type === "directory")
    .map((c) => c.name);
}

function getSrcSubDirs(structure: FolderStructure): string[] {
  const src = (structure.children || []).find(
    (c) => c.name === "src" && c.type === "directory",
  );
  if (!src || !src.children) return [];
  return src.children.filter((c) => c.type === "directory").map((c) => c.name);
}

function filterExisting(candidates: string[], dirs: string[]): string[] {
  return candidates.filter((c) => dirs.includes(c.replace("/", "")));
}

function hasFilePattern(projectPath: string, pattern: RegExp): boolean {
  const srcDir = path.join(projectPath, "src");
  const searchDir = fs.existsSync(srcDir) ? srcDir : projectPath;

  try {
    const entries = fs.readdirSync(searchDir, { withFileTypes: true });
    return entries.some((e) => pattern.test(e.name));
  } catch {
    return false;
  }
}
