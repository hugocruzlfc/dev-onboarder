import { describe, it, expect, afterEach } from "vitest";
import { analyzeMetrics } from "../src/analyzer/metrics";
import { createFixture } from "./helpers";

let cleanup: (() => void) | undefined;
afterEach(() => cleanup?.());

describe("analyzeMetrics", () => {
  it("counts files and lines correctly", () => {
    const fixture = createFixture({
      "package.json": JSON.stringify({ name: "test" }),
      "src/index.ts": "const x = 1;\nconst y = 2;\nconst z = 3;\n",
      "src/utils.ts": "export const add = (a: number, b: number) => a + b;\n",
    });
    cleanup = fixture.cleanup;

    const metrics = analyzeMetrics(fixture.path);

    // package.json + 2 ts files
    expect(metrics.totalFiles).toBe(3);
    expect(metrics.byExtension[".ts"]).toBeDefined();
    expect(metrics.byExtension[".ts"].files).toBe(2);
    expect(metrics.tsPercentage).toBe(100);
  });

  it("calculates TypeScript percentage vs JavaScript", () => {
    const fixture = createFixture({
      "package.json": JSON.stringify({ name: "test" }),
      "src/app.ts": "const a = 1;\nconst b = 2;\n",
      "src/legacy.js": "var x = 1;\n",
    });
    cleanup = fixture.cleanup;

    const metrics = analyzeMetrics(fixture.path);

    expect(metrics.tsPercentage).toBeGreaterThan(0);
    expect(metrics.tsPercentage).toBeLessThan(100);
  });

  it("tracks largest files in order", () => {
    const fixture = createFixture({
      "package.json": JSON.stringify({ name: "test" }),
      "src/small.ts": "x\n",
      "src/big.ts": Array.from(
        { length: 100 },
        (_, i) => `const line${i} = ${i};`,
      ).join("\n"),
      "src/medium.ts": Array.from(
        { length: 20 },
        (_, i) => `const x${i} = ${i};`,
      ).join("\n"),
    });
    cleanup = fixture.cleanup;

    const metrics = analyzeMetrics(fixture.path);

    expect(metrics.largestFiles[0].file).toContain("big.ts");
    expect(metrics.largestFiles[0].lines).toBeGreaterThan(
      metrics.largestFiles[1].lines,
    );
  });

  it("ignores node_modules and dist directories", () => {
    const fixture = createFixture({
      "package.json": JSON.stringify({ name: "test" }),
      "src/index.ts": "const a = 1;",
      "node_modules/lodash/index.js": "// should be ignored",
      "dist/index.js": "// should be ignored too",
    });
    cleanup = fixture.cleanup;

    const metrics = analyzeMetrics(fixture.path);

    // Only package.json + src/index.ts should be counted
    expect(metrics.totalFiles).toBe(2);
  });

  it("handles empty projects", () => {
    const fixture = createFixture({
      "package.json": JSON.stringify({ name: "test" }),
    });
    cleanup = fixture.cleanup;

    const metrics = analyzeMetrics(fixture.path);

    expect(metrics.totalFiles).toBe(1); // just package.json
    expect(metrics.tsPercentage).toBe(0);
  });
});
