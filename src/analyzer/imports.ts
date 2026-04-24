import * as fs from "fs";
import * as path from "path";
import { ImportGraphNode, EntryPointInfo } from "../types";

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
 * Build an import graph of the project's source files.
 * Returns nodes with their imports and who imports them.
 */
export function buildImportGraph(projectPath: string): ImportGraphNode[] {
  const srcDir = fs.existsSync(path.join(projectPath, "src"))
    ? path.join(projectPath, "src")
    : projectPath;

  const files = collectSourceFiles(srcDir);
  const graph = new Map<
    string,
    { imports: Set<string>; importedBy: Set<string> }
  >();

  // Initialize all files
  for (const file of files) {
    const rel = path.relative(projectPath, file);
    graph.set(rel, { imports: new Set(), importedBy: new Set() });
  }

  // Parse imports
  for (const file of files) {
    const rel = path.relative(projectPath, file);
    const content = safeRead(file);
    const imports = extractImports(content);

    for (const imp of imports) {
      // Only track local imports (relative paths)
      if (!imp.startsWith(".")) continue;

      const resolved = resolveImport(file, imp, files);
      if (!resolved) continue;

      const resolvedRel = path.relative(projectPath, resolved);
      const node = graph.get(rel);
      if (node) node.imports.add(resolvedRel);

      const targetNode = graph.get(resolvedRel);
      if (targetNode) targetNode.importedBy.add(rel);
    }
  }

  return Array.from(graph.entries()).map(([file, { imports, importedBy }]) => ({
    file,
    imports: Array.from(imports),
    importedBy: Array.from(importedBy),
  }));
}

/**
 * Detect the main entry points of the project.
 */
export function detectEntryPoints(
  projectPath: string,
  graph: ImportGraphNode[],
  scripts: Record<string, string>,
): EntryPointInfo[] {
  const entries: EntryPointInfo[] = [];
  const seen = new Set<string>();

  // 1. From package.json main/bin
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(projectPath, "package.json"), "utf-8"),
    );

    if (pkg.main) {
      const mainFile = findSourceFor(projectPath, pkg.main);
      if (mainFile && !seen.has(mainFile)) {
        seen.add(mainFile);
        entries.push({
          file: mainFile,
          type: "main",
          description: "Entry point principal definido en package.json (main)",
        });
      }
    }

    if (pkg.bin) {
      const bins =
        typeof pkg.bin === "string" ? { [pkg.name]: pkg.bin } : pkg.bin;
      for (const [name, binPath] of Object.entries(bins)) {
        const srcFile = findSourceFor(projectPath, binPath as string);
        if (srcFile && !seen.has(srcFile)) {
          seen.add(srcFile);
          entries.push({
            file: srcFile,
            type: "main",
            description: `CLI binary "${name}"`,
          });
        }
      }
    }
  } catch {
    // ignore
  }

  // 2. Common server entry points
  const serverFiles = [
    "src/main.ts",
    "src/index.ts",
    "src/server.ts",
    "src/app.ts",
    "server.ts",
    "index.ts",
    "app.ts",
    "src/main.js",
    "src/index.js",
    "src/server.js",
    "src/app.js",
  ];
  for (const sf of serverFiles) {
    if (!seen.has(sf) && fs.existsSync(path.join(projectPath, sf))) {
      seen.add(sf);
      entries.push({
        file: sf,
        type: "server",
        description: `Archivo de entrada del servidor (${path.basename(sf)})`,
      });
    }
  }

  // 3. Next.js / framework pages
  const layoutFiles = [
    "app/layout.tsx",
    "src/app/layout.tsx",
    "app/page.tsx",
    "src/app/page.tsx",
    "pages/index.tsx",
    "src/pages/index.tsx",
    "pages/_app.tsx",
    "src/pages/_app.tsx",
  ];
  for (const lf of layoutFiles) {
    if (!seen.has(lf) && fs.existsSync(path.join(projectPath, lf))) {
      seen.add(lf);
      entries.push({
        file: lf,
        type: "page",
        description: `Página/layout principal del framework`,
      });
    }
  }

  // 4. Most-imported files (hubs) – top 3
  const hubs = graph
    .filter((n) => n.importedBy.length > 0)
    .sort((a, b) => b.importedBy.length - a.importedBy.length)
    .slice(0, 3);

  for (const hub of hubs) {
    if (!seen.has(hub.file)) {
      seen.add(hub.file);
      entries.push({
        file: hub.file,
        type: "config",
        description: `Archivo hub (importado por ${hub.importedBy.length} archivos)`,
      });
    }
  }

  return entries;
}

// ── Helpers ──

function collectSourceFiles(dir: string, maxDepth = 6, depth = 0): string[] {
  if (depth >= maxDepth) return [];
  const results: string[] = [];

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (IGNORED_DIRS.has(entry.name) || entry.name.startsWith(".")) continue;
      const full = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        results.push(...collectSourceFiles(full, maxDepth, depth + 1));
      } else if (
        entry.isFile() &&
        CODE_EXTENSIONS.has(path.extname(entry.name))
      ) {
        results.push(full);
      }
    }
  } catch {
    // ignore
  }

  return results;
}

function extractImports(content: string): string[] {
  const imports: string[] = [];

  // import ... from 'xxx'
  const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
  let match: RegExpExecArray | null;
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  // require('xxx')
  const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((match = requireRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  // export ... from 'xxx'
  const reExportRegex = /export\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
  while ((match = reExportRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  return imports;
}

function resolveImport(
  fromFile: string,
  importPath: string,
  allFiles: string[],
): string | null {
  const dir = path.dirname(fromFile);
  const base = path.resolve(dir, importPath);

  // Try exact match, then with extensions, then /index variants
  const candidates = [
    base,
    ...Array.from(CODE_EXTENSIONS).map((ext) => base + ext),
    ...Array.from(CODE_EXTENSIONS).map((ext) => path.join(base, "index" + ext)),
  ];

  const allFilesSet = new Set(allFiles);
  for (const c of candidates) {
    if (allFilesSet.has(c)) return c;
  }

  return null;
}

function findSourceFor(projectPath: string, distPath: string): string | null {
  // dist/index.js -> src/index.ts
  const srcPath = distPath
    .replace(/^dist\//, "src/")
    .replace(/^\.\/dist\//, "src/")
    .replace(/\.js$/, ".ts");

  if (fs.existsSync(path.join(projectPath, srcPath))) return srcPath;

  // Try original path
  const originalTs = distPath.replace(/\.js$/, ".ts");
  if (fs.existsSync(path.join(projectPath, originalTs))) return originalTs;

  if (fs.existsSync(path.join(projectPath, distPath))) return distPath;

  return null;
}

function safeRead(filePath: string): string {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return "";
  }
}
