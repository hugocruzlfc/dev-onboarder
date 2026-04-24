import * as fs from "fs";
import * as path from "path";
import { ProjectMetrics } from "../types";

const CODE_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".css",
  ".scss",
  ".sass",
  ".less",
  ".html",
  ".vue",
  ".svelte",
  ".json",
  ".yaml",
  ".yml",
]);

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
  "generated",
  ".svelte-kit",
  "storybook-static",
]);

/**
 * Compute project metrics: file counts, lines of code, language breakdown.
 */
export function analyzeMetrics(projectPath: string): ProjectMetrics {
  const byExtension: Record<string, { files: number; lines: number }> = {};
  const allFiles: { file: string; lines: number; ext: string }[] = [];

  countFiles(projectPath, projectPath, byExtension, allFiles);

  const totalFiles = allFiles.length;
  const totalLines = allFiles.reduce((sum, f) => sum + f.lines, 0);

  // Largest files (top 10)
  const largestFiles = allFiles
    .sort((a, b) => b.lines - a.lines)
    .slice(0, 10)
    .map((f) => ({ file: f.file, lines: f.lines }));

  // TypeScript percentage
  const tsFiles = allFiles.filter((f) => f.ext === ".ts" || f.ext === ".tsx");
  const jsFiles = allFiles.filter(
    (f) =>
      f.ext === ".js" ||
      f.ext === ".jsx" ||
      f.ext === ".mjs" ||
      f.ext === ".cjs",
  );
  const tsLines = tsFiles.reduce((sum, f) => sum + f.lines, 0);
  const jsLines = jsFiles.reduce((sum, f) => sum + f.lines, 0);
  const totalCodeLines = tsLines + jsLines;
  const tsPercentage =
    totalCodeLines > 0 ? Math.round((tsLines / totalCodeLines) * 100) : 0;

  return {
    totalFiles,
    totalLines,
    byExtension,
    largestFiles,
    tsPercentage,
  };
}

function countFiles(
  dir: string,
  projectPath: string,
  byExtension: Record<string, { files: number; lines: number }>,
  allFiles: { file: string; lines: number; ext: string }[],
  maxDepth = 6,
  depth = 0,
): void {
  if (depth >= maxDepth) return;

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry.name) || entry.name.startsWith(".")) continue;

    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      countFiles(full, projectPath, byExtension, allFiles, maxDepth, depth + 1);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (!CODE_EXTENSIONS.has(ext)) continue;

      const lines = countLines(full);
      const relFile = path.relative(projectPath, full);

      if (!byExtension[ext]) {
        byExtension[ext] = { files: 0, lines: 0 };
      }
      byExtension[ext].files++;
      byExtension[ext].lines += lines;

      allFiles.push({ file: relFile, lines, ext });
    }
  }
}

function countLines(filePath: string): number {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return content.split("\n").length;
  } catch {
    return 0;
  }
}
