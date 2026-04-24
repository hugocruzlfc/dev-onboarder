import * as fs from "fs";
import * as path from "path";
import {
  DependencyAnalysis,
  DependencyInfo,
  DependencyCategory,
  KNOWN_LIBRARIES,
} from "../types";

export function analyzeDependencies(projectPath: string): {
  analysis: DependencyAnalysis;
  scripts: Record<string, string>;
} {
  const pkgPath = path.join(projectPath, "package.json");

  if (!fs.existsSync(pkgPath)) {
    return {
      analysis: { production: [], development: [], total: 0 },
      scripts: {},
    };
  }

  const pkgContent = fs.readFileSync(pkgPath, "utf-8");
  const pkg = JSON.parse(pkgContent);

  const production = classifyDeps(pkg.dependencies || {});
  const development = classifyDeps(pkg.devDependencies || {});

  return {
    analysis: {
      production,
      development,
      total: production.length + development.length,
    },
    scripts: pkg.scripts || {},
  };
}

function classifyDeps(deps: Record<string, string>): DependencyInfo[] {
  return Object.entries(deps).map(([name, version]) => {
    const known = KNOWN_LIBRARIES[name];

    if (known) {
      return {
        name,
        version: version as string,
        category: known.category,
        description: known.description,
      };
    }

    return {
      name,
      version: version as string,
      category: guessCategory(name),
      description: "",
    };
  });
}

function guessCategory(name: string): DependencyCategory {
  const n = name.toLowerCase();

  // Radix UI components
  if (n.startsWith("@radix-ui/")) return "ui-components";
  // NestJS modules
  if (n.startsWith("@nestjs/")) return "framework";
  // Testing related
  if (
    n.includes("test") ||
    n.includes("spec") ||
    n.includes("mock") ||
    n.includes("stub")
  )
    return "testing";
  // Linting
  if (n.includes("eslint") || n.includes("prettier") || n.includes("lint"))
    return "linting";
  // Types packages
  if (n.startsWith("@types/")) return "utility";
  // Build tools
  if (n.includes("webpack") || n.includes("babel") || n.includes("rollup"))
    return "build-tool";
  // Styling
  if (
    n.includes("css") ||
    n.includes("style") ||
    n.includes("theme") ||
    n.includes("tailwind")
  )
    return "styling";
  // Database
  if (
    n.includes("sql") ||
    n.includes("mongo") ||
    n.includes("redis") ||
    n.includes("database") ||
    n.includes("db")
  )
    return "database";
  // Auth
  if (
    n.includes("auth") ||
    n.includes("passport") ||
    n.includes("jwt") ||
    n.includes("oauth")
  )
    return "authentication";

  return "other";
}

export function getProjectName(projectPath: string): string {
  const pkgPath = path.join(projectPath, "package.json");
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      return pkg.name || path.basename(projectPath);
    } catch {
      return path.basename(projectPath);
    }
  }
  return path.basename(projectPath);
}
