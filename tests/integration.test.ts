import { describe, it, expect, afterEach } from "vitest";
import { analyzeProject } from "../src/analyzer";
import { generateMarkdown } from "../src/generator/markdown";
import { createFixture } from "./helpers";

let cleanup: (() => void) | undefined;
afterEach(() => cleanup?.());

describe("analyzeProject (integration)", () => {
  it("analyzes a minimal project end-to-end", () => {
    const fixture = createFixture({
      "package.json": JSON.stringify({
        name: "my-app",
        dependencies: { express: "^4.18.0" },
        devDependencies: { typescript: "^5.3.0" },
        scripts: { dev: "ts-node src/index.ts", build: "tsc" },
      }),
      "tsconfig.json": JSON.stringify({
        compilerOptions: { target: "ES2020" },
      }),
      "src/index.ts": `
import express from 'express';
const app = express();
app.get('/health', (req, res) => res.json({ ok: true }));
app.post('/users', (req, res) => res.json({}));
const port = process.env.PORT || 3000;
app.listen(port);
      `,
      "src/utils.ts": "export const helper = () => 'hi';",
    });
    cleanup = fixture.cleanup;

    const analysis = analyzeProject(fixture.path);

    expect(analysis.projectName).toBe("my-app");
    expect(analysis.framework.name).toBe("Express");
    expect(analysis.dependencies.total).toBe(2);
    expect(analysis.endpoints.length).toBeGreaterThanOrEqual(2);
    expect(analysis.envVars.find((v) => v.name === "PORT")).toBeDefined();
    expect(analysis.metrics.totalFiles).toBeGreaterThanOrEqual(3);
    expect(analysis.metrics.tsPercentage).toBe(100);
    expect(analysis.importGraph.length).toBeGreaterThan(0);
    expect(analysis.configs.length).toBeGreaterThanOrEqual(1);
  });
});

describe("generateMarkdown (integration)", () => {
  it("generates complete markdown with all sections", () => {
    const fixture = createFixture({
      "package.json": JSON.stringify({
        name: "test-app",
        dependencies: { next: "^14.0.0", react: "^18.0.0" },
        devDependencies: { typescript: "^5.3.0" },
        scripts: { dev: "next dev", build: "next build" },
      }),
      ".env.example":
        "DATABASE_URL=postgresql://localhost/db\nNEXTAUTH_SECRET=",
      "src/index.ts": "export {};",
      "app/api/users/route.ts": `
export async function GET() { return Response.json([]); }
export async function POST() { return Response.json({}); }
      `,
    });
    cleanup = fixture.cleanup;

    const analysis = analyzeProject(fixture.path);
    const md = generateMarkdown(analysis);

    // Check that key sections exist
    expect(md).toContain("# 🚀 Guía de Onboarding: test-app");
    expect(md).toContain("## ⚡ Quick Start");
    expect(md).toContain("## 🧭 Dónde Empezar");
    expect(md).toContain("## 📊 Métricas del Proyecto");
    expect(md).toContain("## 🗺️ Mapa de Endpoints / Rutas");
    expect(md).toContain("## 🔑 Variables de Entorno");
    expect(md).toContain("DATABASE_URL");
    expect(md).toContain("NEXTAUTH_SECRET");
    expect(md).toContain("Next.js");
    expect(md).toContain("next dev");
    expect(md).toContain("mermaid");
  });

  it("omits sections when data is empty", () => {
    const fixture = createFixture({
      "package.json": JSON.stringify({
        name: "minimal",
        dependencies: { lodash: "^4.0.0" },
        scripts: { start: "node index.js" },
      }),
      "index.js": "console.log('hello');",
    });
    cleanup = fixture.cleanup;

    const analysis = analyzeProject(fixture.path);
    const md = generateMarkdown(analysis);

    // These should NOT appear for a minimal project
    expect(md).not.toContain("## 🗺️ Mapa de Endpoints");
    expect(md).not.toContain("## 🔑 Variables de Entorno");
  });
});
