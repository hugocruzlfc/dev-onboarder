import { describe, it, expect, afterEach } from "vitest";
import { detectEnvVars } from "../src/analyzer/envvars";
import { createFixture } from "./helpers";

let cleanup: (() => void) | undefined;
afterEach(() => cleanup?.());

describe("detectEnvVars", () => {
  it("parses .env.example file", () => {
    const fixture = createFixture({
      "package.json": JSON.stringify({ name: "test" }),
      ".env.example": `
# Database configuration
DATABASE_URL=postgresql://localhost:5432/mydb

# Auth secret
NEXTAUTH_SECRET=
API_KEY=your-key-here
      `,
    });
    cleanup = fixture.cleanup;

    const vars = detectEnvVars(fixture.path);

    expect(vars.length).toBeGreaterThanOrEqual(3);

    const dbUrl = vars.find((v) => v.name === "DATABASE_URL");
    expect(dbUrl).toBeDefined();
    expect(dbUrl!.defaultValue).toBe("postgresql://localhost:5432/mydb");
    expect(dbUrl!.description).toBe("Database configuration");
    expect(dbUrl!.required).toBe(false); // has default value

    const secret = vars.find((v) => v.name === "NEXTAUTH_SECRET");
    expect(secret).toBeDefined();
    expect(secret!.required).toBe(true); // no default value

    const apiKey = vars.find((v) => v.name === "API_KEY");
    expect(apiKey).toBeDefined();
    expect(apiKey!.defaultValue).toBe("your-key-here");
  });

  it("detects process.env.XXX from source code", () => {
    const fixture = createFixture({
      "package.json": JSON.stringify({ name: "test" }),
      "src/config.ts": `
const dbUrl = process.env.DATABASE_URL;
const port = process.env.PORT || 3000;
const secret = process.env["JWT_SECRET"];
      `,
    });
    cleanup = fixture.cleanup;

    const vars = detectEnvVars(fixture.path);

    const dbUrl = vars.find((v) => v.name === "DATABASE_URL");
    expect(dbUrl).toBeDefined();
    expect(dbUrl!.source).toContain("src/config.ts");

    const port = vars.find((v) => v.name === "PORT");
    expect(port).toBeDefined();

    const jwt = vars.find((v) => v.name === "JWT_SECRET");
    expect(jwt).toBeDefined();
  });

  it("detects import.meta.env for Vite projects", () => {
    const fixture = createFixture({
      "package.json": JSON.stringify({ name: "test" }),
      "src/App.tsx": `
const apiUrl = import.meta.env.VITE_API_URL;
const isDebug = import.meta.env.VITE_DEBUG;
      `,
    });
    cleanup = fixture.cleanup;

    const vars = detectEnvVars(fixture.path);

    expect(vars.find((v) => v.name === "VITE_API_URL")).toBeDefined();
    expect(vars.find((v) => v.name === "VITE_DEBUG")).toBeDefined();
  });

  it("merges .env.example data with source code detections", () => {
    const fixture = createFixture({
      "package.json": JSON.stringify({ name: "test" }),
      ".env.example": `
# API base URL
API_URL=http://localhost:3000
      `,
      "src/api.ts": `
const url = process.env.API_URL;
      `,
    });
    cleanup = fixture.cleanup;

    const vars = detectEnvVars(fixture.path);
    const apiUrl = vars.find((v) => v.name === "API_URL");

    expect(apiUrl).toBeDefined();
    expect(apiUrl!.defaultValue).toBe("http://localhost:3000");
    expect(apiUrl!.description).toBe("API base URL");
    // Source should mention both files
    expect(apiUrl!.source).toContain(".env.example");
    expect(apiUrl!.source).toContain("src/api.ts");
  });

  it("returns empty array for projects with no env vars", () => {
    const fixture = createFixture({
      "package.json": JSON.stringify({ name: "test" }),
      "src/index.ts": "console.log('hello');",
    });
    cleanup = fixture.cleanup;

    const vars = detectEnvVars(fixture.path);
    expect(vars).toHaveLength(0);
  });
});
