import * as fs from "fs";
import * as path from "path";
import { EnvVarInfo } from "../types";

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
 * Detect environment variables from:
 * 1. .env.example / .env.local.example files (parsed)
 * 2. process.env.XXX references in source code
 * 3. import.meta.env.XXX references (Vite)
 */
export function detectEnvVars(projectPath: string): EnvVarInfo[] {
  const envMap = new Map<string, EnvVarInfo>();

  // 1. Parse .env.example files
  const envFiles = [
    ".env.example",
    ".env.local.example",
    ".env.template",
    ".env.sample",
  ];

  for (const envFile of envFiles) {
    const fullPath = path.join(projectPath, envFile);
    if (fs.existsSync(fullPath)) {
      const parsed = parseEnvFile(fullPath, envFile);
      for (const v of parsed) {
        envMap.set(v.name, v);
      }
    }
  }

  // 2. Scan source code for process.env.XXX and import.meta.env.XXX
  const srcDir = fs.existsSync(path.join(projectPath, "src"))
    ? path.join(projectPath, "src")
    : projectPath;

  const codeVars = scanCodeForEnvVars(srcDir, projectPath);
  for (const v of codeVars) {
    if (envMap.has(v.name)) {
      // Enrich existing with source info
      const existing = envMap.get(v.name)!;
      if (!existing.source.includes(v.source)) {
        existing.source += `, ${v.source}`;
      }
    } else {
      envMap.set(v.name, v);
    }
  }

  return Array.from(envMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

// ── .env file parser ──

function parseEnvFile(filePath: string, fileName: string): EnvVarInfo[] {
  const vars: EnvVarInfo[] = [];
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  let lastComment = "";

  for (const line of lines) {
    const trimmed = line.trim();

    // Track comments as descriptions
    if (trimmed.startsWith("#")) {
      lastComment = trimmed.replace(/^#\s*/, "");
      continue;
    }

    // Skip empty lines (reset comment)
    if (!trimmed) {
      lastComment = "";
      continue;
    }

    // Parse KEY=VALUE
    const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)/);
    if (match) {
      const name = match[1];
      const rawValue = match[2].replace(/^['"]|['"]$/g, "").trim();

      vars.push({
        name,
        defaultValue: rawValue || undefined,
        description: lastComment || undefined,
        required: !rawValue, // empty value = required
        source: fileName,
      });

      lastComment = "";
    }
  }

  return vars;
}

// ── Source code scanner ──

function scanCodeForEnvVars(dir: string, projectPath: string): EnvVarInfo[] {
  const vars: EnvVarInfo[] = [];
  const seen = new Set<string>();
  const files = collectSourceFiles(dir);

  // Common false positives from regex patterns, comments, type definitions
  const falsePositives = new Set([
    "VAR_NAME",
    "XXX",
    "VITE_XXX",
    "YOUR_",
    "EXAMPLE_",
    "NODE_ENV", // built-in, not worth listing
  ]);

  for (const file of files) {
    const content = safeRead(file);
    const relFile = path.relative(projectPath, file);
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Skip comments and string patterns (regex literals, template examples)
      const trimmed = line.trim();
      if (
        trimmed.startsWith("//") ||
        trimmed.startsWith("*") ||
        trimmed.startsWith("/*")
      )
        continue;
      // Skip lines that look like regex definitions or test patterns
      if (/RegExp|\.match\(|\.test\(|\/[^/]+\/[gimsuy]/.test(line)) continue;

      // process.env.VAR_NAME
      const processEnvRegex = /process\.env\.([A-Z_][A-Z0-9_]*)/g;
      let match: RegExpExecArray | null;
      while ((match = processEnvRegex.exec(line)) !== null) {
        const name = match[1];
        if (!seen.has(name) && !falsePositives.has(name)) {
          seen.add(name);
          vars.push({ name, required: true, source: relFile });
        }
      }

      // process.env['VAR_NAME'] or process.env["VAR_NAME"]
      const bracketRegex = /process\.env\[['"]([A-Z_][A-Z0-9_]*)['"]\]/g;
      while ((match = bracketRegex.exec(line)) !== null) {
        const name = match[1];
        if (!seen.has(name) && !falsePositives.has(name)) {
          seen.add(name);
          vars.push({ name, required: true, source: relFile });
        }
      }

      // import.meta.env.VITE_XXX
      const viteEnvRegex = /import\.meta\.env\.([A-Z_][A-Z0-9_]*)/g;
      while ((match = viteEnvRegex.exec(line)) !== null) {
        const name = match[1];
        if (!seen.has(name) && !falsePositives.has(name)) {
          seen.add(name);
          vars.push({ name, required: true, source: relFile });
        }
      }
    }
  }

  return vars;
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

function safeRead(filePath: string): string {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return "";
  }
}
