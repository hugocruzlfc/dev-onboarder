import { describe, it, expect, afterEach } from "vitest";
import { buildImportGraph, detectEntryPoints } from "../src/analyzer/imports";
import { createFixture } from "./helpers";

let cleanup: (() => void) | undefined;
afterEach(() => cleanup?.());

describe("buildImportGraph", () => {
  it("tracks imports between source files", () => {
    const fixture = createFixture({
      "package.json": JSON.stringify({ name: "test" }),
      "src/index.ts": `
import { app } from './app';
import { config } from './config';
app.listen(config.port);
      `,
      "src/app.ts": `
import { config } from './config';
export const app = { listen: (p: number) => {} };
      `,
      "src/config.ts": `
export const config = { port: 3000 };
      `,
    });
    cleanup = fixture.cleanup;

    const graph = buildImportGraph(fixture.path);

    const indexNode = graph.find((n) => n.file === "src/index.ts");
    expect(indexNode).toBeDefined();
    expect(indexNode!.imports).toContain("src/app.ts");
    expect(indexNode!.imports).toContain("src/config.ts");

    const configNode = graph.find((n) => n.file === "src/config.ts");
    expect(configNode).toBeDefined();
    expect(configNode!.importedBy).toContain("src/index.ts");
    expect(configNode!.importedBy).toContain("src/app.ts");
  });

  it("ignores external (node_modules) imports", () => {
    const fixture = createFixture({
      "package.json": JSON.stringify({ name: "test" }),
      "src/index.ts": `
import express from 'express';
import { helper } from './helper';
      `,
      "src/helper.ts": `
export const helper = () => {};
      `,
    });
    cleanup = fixture.cleanup;

    const graph = buildImportGraph(fixture.path);
    const indexNode = graph.find((n) => n.file === "src/index.ts");

    expect(indexNode!.imports).toContain("src/helper.ts");
    expect(indexNode!.imports).not.toContain("express");
  });

  it("returns empty imports for isolated files", () => {
    const fixture = createFixture({
      "package.json": JSON.stringify({ name: "test" }),
      "src/standalone.ts": "export const x = 1;",
    });
    cleanup = fixture.cleanup;

    const graph = buildImportGraph(fixture.path);
    const node = graph.find((n) => n.file === "src/standalone.ts");
    expect(node).toBeDefined();
    expect(node!.imports).toHaveLength(0);
    expect(node!.importedBy).toHaveLength(0);
  });
});

describe("detectEntryPoints", () => {
  it("detects entry points from package.json main and bin", () => {
    const fixture = createFixture({
      "package.json": JSON.stringify({
        name: "test",
        main: "dist/lib.js",
        bin: { "my-cli": "dist/index.js" },
        scripts: { dev: "ts-node src/index.ts" },
      }),
      "src/lib.ts": "export const lib = {};",
      "src/index.ts": "console.log('cli');",
    });
    cleanup = fixture.cleanup;

    const graph = buildImportGraph(fixture.path);
    const entries = detectEntryPoints(fixture.path, graph, {
      dev: "ts-node src/index.ts",
    });

    expect(entries.length).toBeGreaterThanOrEqual(2);
    expect(entries.some((e) => e.file === "src/lib.ts")).toBe(true);
    expect(entries.some((e) => e.file === "src/index.ts")).toBe(true);
  });

  it("detects Next.js layout and page files", () => {
    const fixture = createFixture({
      "package.json": JSON.stringify({ name: "test" }),
      "app/layout.tsx":
        "export default function RootLayout({ children }) { return children; }",
      "app/page.tsx":
        "export default function Home() { return <div>Home</div>; }",
    });
    cleanup = fixture.cleanup;

    const graph = buildImportGraph(fixture.path);
    const entries = detectEntryPoints(fixture.path, graph, {});

    expect(entries.some((e) => e.file === "app/layout.tsx")).toBe(true);
    expect(entries.some((e) => e.file === "app/page.tsx")).toBe(true);
  });

  it("identifies hub files (most imported)", () => {
    const fixture = createFixture({
      "package.json": JSON.stringify({ name: "test" }),
      "src/types.ts": "export type User = { id: string };",
      "src/a.ts": "import { User } from './types';",
      "src/b.ts": "import { User } from './types';",
      "src/c.ts": "import { User } from './types';",
    });
    cleanup = fixture.cleanup;

    const graph = buildImportGraph(fixture.path);
    const entries = detectEntryPoints(fixture.path, graph, {});

    const hubEntry = entries.find((e) => e.file === "src/types.ts");
    expect(hubEntry).toBeDefined();
    expect(hubEntry!.description).toContain("3 archivos");
  });
});
