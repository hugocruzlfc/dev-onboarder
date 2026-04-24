import { describe, it, expect, afterEach } from "vitest";
import {
  analyzeDependencies,
  getProjectName,
} from "../src/analyzer/dependencies";
import { createFixture } from "./helpers";

let cleanup: (() => void) | undefined;
afterEach(() => cleanup?.());

describe("analyzeDependencies", () => {
  it("parses production and dev dependencies from package.json", () => {
    const fixture = createFixture({
      "package.json": JSON.stringify({
        name: "test-project",
        dependencies: { express: "^4.18.0", zod: "^3.22.0" },
        devDependencies: { typescript: "^5.3.0" },
        scripts: { dev: "ts-node src/index.ts", build: "tsc" },
      }),
    });
    cleanup = fixture.cleanup;

    const { analysis, scripts } = analyzeDependencies(fixture.path);

    expect(analysis.production).toHaveLength(2);
    expect(analysis.development).toHaveLength(1);
    expect(analysis.total).toBe(3);
    expect(scripts.dev).toBe("ts-node src/index.ts");
  });

  it("classifies known libraries correctly", () => {
    const fixture = createFixture({
      "package.json": JSON.stringify({
        dependencies: {
          next: "^14.0.0",
          zustand: "^4.5.0",
          prisma: "^5.0.0",
        },
      }),
    });
    cleanup = fixture.cleanup;

    const { analysis } = analyzeDependencies(fixture.path);
    const byName = Object.fromEntries(
      analysis.production.map((d) => [d.name, d]),
    );

    expect(byName["next"].category).toBe("framework");
    expect(byName["zustand"].category).toBe("state-management");
    expect(byName["prisma"].category).toBe("database");
  });

  it("guesses category for unknown packages by name", () => {
    const fixture = createFixture({
      "package.json": JSON.stringify({
        dependencies: {
          "@nestjs/config": "^3.0.0",
          "my-eslint-plugin": "^1.0.0",
          "@radix-ui/react-dialog": "^1.0.0",
        },
      }),
    });
    cleanup = fixture.cleanup;

    const { analysis } = analyzeDependencies(fixture.path);
    const byName = Object.fromEntries(
      analysis.production.map((d) => [d.name, d]),
    );

    expect(byName["@nestjs/config"].category).toBe("framework");
    expect(byName["my-eslint-plugin"].category).toBe("linting");
    expect(byName["@radix-ui/react-dialog"].category).toBe("ui-components");
  });

  it("returns empty analysis when no package.json exists", () => {
    const fixture = createFixture({});
    cleanup = fixture.cleanup;

    const { analysis, scripts } = analyzeDependencies(fixture.path);
    expect(analysis.total).toBe(0);
    expect(scripts).toEqual({});
  });
});

describe("getProjectName", () => {
  it("returns name from package.json", () => {
    const fixture = createFixture({
      "package.json": JSON.stringify({ name: "my-cool-project" }),
    });
    cleanup = fixture.cleanup;

    expect(getProjectName(fixture.path)).toBe("my-cool-project");
  });

  it("falls back to directory name when no package.json", () => {
    const fixture = createFixture({});
    cleanup = fixture.cleanup;

    const dirName = require("path").basename(fixture.path);
    expect(getProjectName(fixture.path)).toBe(dirName);
  });
});
