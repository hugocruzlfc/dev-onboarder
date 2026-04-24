import * as fs from "fs";
import * as path from "path";
import { EndpointInfo, DependencyAnalysis } from "../types";

const CODE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs"]);
const IGNORED_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  ".nuxt",
  "dist",
  "build",
  ".cache",
  "coverage",
  "__pycache__",
  ".turbo",
  ".vercel",
]);

/**
 * Detect API endpoints/routes from the source code.
 * Supports: Express, Fastify, NestJS, Next.js App Router, Next.js Pages API.
 */
export function detectEndpoints(
  projectPath: string,
  deps: DependencyAnalysis,
): EndpointInfo[] {
  const endpoints: EndpointInfo[] = [];
  const depNames = new Set(
    [...deps.production, ...deps.development].map((d) => d.name),
  );

  // Next.js App Router: app/**/route.ts
  const appDir = findDir(projectPath, "app");
  if (appDir && depNames.has("next")) {
    endpoints.push(...detectNextAppRouterEndpoints(projectPath, appDir));
  }

  // Next.js Pages API: pages/api/**
  const pagesApiDir = findDir(projectPath, "pages", "api");
  if (pagesApiDir && depNames.has("next")) {
    endpoints.push(...detectNextPagesApiEndpoints(projectPath, pagesApiDir));
  }

  // Express / Fastify / NestJS – scan source files
  const srcDir = findDir(projectPath, "src") || projectPath;
  if (
    depNames.has("express") ||
    depNames.has("fastify") ||
    depNames.has("@nestjs/core")
  ) {
    endpoints.push(...detectCodeEndpoints(srcDir, projectPath, depNames));
  }

  return endpoints;
}

// ── Next.js App Router ──

function detectNextAppRouterEndpoints(
  projectPath: string,
  appDir: string,
): EndpointInfo[] {
  const endpoints: EndpointInfo[] = [];
  const routeFiles = findFiles(appDir, /^route\.(ts|tsx|js|jsx)$/);

  for (const file of routeFiles) {
    const relativePath = path.relative(appDir, path.dirname(file));
    const routePath =
      "/" +
      relativePath
        .replace(/\\/g, "/")
        .replace(/\(.*?\)\/?/g, "") // remove route groups
        .replace(/\[\.{3}(.*?)\]/g, ":$1*") // catch-all
        .replace(/\[(.*?)\]/g, ":$1"); // dynamic segments

    const content = safeRead(file);
    const methods = detectExportedMethods(content);

    for (const method of methods) {
      endpoints.push({
        method: method.toUpperCase(),
        path: routePath.replace(/\/+$/, "") || "/",
        file: path.relative(projectPath, file),
        line: findMethodLine(content, method),
      });
    }
  }

  return endpoints;
}

function detectExportedMethods(content: string): string[] {
  const methods: string[] = [];
  const httpMethods = [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "HEAD",
    "OPTIONS",
  ];

  for (const method of httpMethods) {
    // export async function GET | export const GET | export function GET
    const pattern = new RegExp(
      `export\\s+(?:async\\s+)?(?:function|const)\\s+${method}\\b`,
    );
    if (pattern.test(content)) {
      methods.push(method);
    }
  }

  return methods;
}

// ── Next.js Pages API ──

function detectNextPagesApiEndpoints(
  projectPath: string,
  apiDir: string,
): EndpointInfo[] {
  const endpoints: EndpointInfo[] = [];
  const files = findFiles(apiDir, /\.(ts|tsx|js|jsx)$/);

  for (const file of files) {
    const relativePath = path.relative(apiDir, file);
    const routePath =
      "/api/" +
      relativePath
        .replace(/\\/g, "/")
        .replace(/\.(ts|tsx|js|jsx)$/, "")
        .replace(/\/index$/, "")
        .replace(/\[\.{3}(.*?)\]/g, ":$1*")
        .replace(/\[(.*?)\]/g, ":$1");

    endpoints.push({
      method: "ALL",
      path: routePath,
      file: path.relative(projectPath, file),
      line: 1,
    });
  }

  return endpoints;
}

// ── Express / Fastify / NestJS ──

function detectCodeEndpoints(
  srcDir: string,
  projectPath: string,
  depNames: Set<string>,
): EndpointInfo[] {
  const endpoints: EndpointInfo[] = [];
  const files = findFiles(srcDir, /\.(ts|tsx|js|jsx)$/);

  for (const file of files) {
    const content = safeRead(file);
    const relFile = path.relative(projectPath, file);
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Express / Fastify: app.get('/path', ...) | router.post('/path', ...)
      const routerMatch = line.match(
        /(?:app|router|server|fastify)\.(get|post|put|patch|delete|all|head|options)\s*\(\s*['"`]([^'"`]+)['"`]/i,
      );
      if (routerMatch) {
        endpoints.push({
          method: routerMatch[1].toUpperCase(),
          path: routerMatch[2],
          file: relFile,
          line: i + 1,
        });
        continue;
      }

      // NestJS decorators: @Get('/path'), @Post(), etc.
      if (depNames.has("@nestjs/core")) {
        const nestMatch = line.match(
          /@(Get|Post|Put|Patch|Delete|Head|Options|All)\s*\(\s*['"`]?([^'"`)]*)['"`]?\s*\)/i,
        );
        if (nestMatch) {
          endpoints.push({
            method: nestMatch[1].toUpperCase(),
            path: nestMatch[2] || "/",
            file: relFile,
            line: i + 1,
            handler: extractNextFunctionName(lines, i),
          });
        }

        // @Controller('prefix')
        // We don't add it as endpoint but we could prepend prefix to child endpoints
      }
    }
  }

  return endpoints;
}

// ── Helpers ──

function findDir(base: string, ...segments: string[]): string | null {
  // Try direct path and src/ variant
  const candidates = [
    path.join(base, ...segments),
    path.join(base, "src", ...segments),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isDirectory()) return c;
  }
  return null;
}

function findFiles(
  dir: string,
  pattern: RegExp,
  maxDepth = 6,
  depth = 0,
): string[] {
  if (depth >= maxDepth) return [];
  const results: string[] = [];

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (IGNORED_DIRS.has(entry.name) || entry.name.startsWith(".")) continue;
      const full = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        results.push(...findFiles(full, pattern, maxDepth, depth + 1));
      } else if (entry.isFile() && pattern.test(entry.name)) {
        results.push(full);
      }
    }
  } catch {
    // ignore permission errors
  }

  return results;
}

function safeRead(filePath: string): string {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return "";
  }
}

function findMethodLine(content: string, method: string): number {
  const lines = content.split("\n");
  const pattern = new RegExp(
    `export\\s+(?:async\\s+)?(?:function|const)\\s+${method}\\b`,
  );
  for (let i = 0; i < lines.length; i++) {
    if (pattern.test(lines[i])) return i + 1;
  }
  return 1;
}

function extractNextFunctionName(
  lines: string[],
  decoratorLine: number,
): string | undefined {
  for (
    let i = decoratorLine + 1;
    i < Math.min(decoratorLine + 5, lines.length);
    i++
  ) {
    const match = lines[i].match(/(?:async\s+)?(\w+)\s*\(/);
    if (match) return match[1];
  }
  return undefined;
}
