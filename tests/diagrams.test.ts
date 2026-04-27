import { describe, it, expect, afterEach } from "vitest";
import { analyzeProject } from "../src/analyzer";
import {
  generateArchitectureDiagram,
  generateDataFlowDiagram,
  generateFolderDiagram,
  generateImportGraphDiagram,
} from "../src/generator/diagrams";
import { createFixture } from "./helpers";

let cleanup: (() => void) | undefined;
afterEach(() => cleanup?.());

function makeExpressFixture() {
  const fixture = createFixture({
    "package.json": JSON.stringify({
      name: "api-server",
      dependencies: { express: "^4.18.0" },
      devDependencies: { typescript: "^5.3.0" },
      scripts: { dev: "ts-node src/index.ts", build: "tsc" },
    }),
    "tsconfig.json": JSON.stringify({
      compilerOptions: { target: "ES2020" },
    }),
    "src/index.ts": `
import express from 'express';
import { router } from './routes';
const app = express();
app.use('/api', router);
app.listen(3000);
    `,
    "src/routes.ts": `
import { Router } from 'express';
import { getUsers } from './handlers';
export const router = Router();
router.get('/users', getUsers);
    `,
    "src/handlers.ts": `
export function getUsers(req: any, res: any) {
  res.json([]);
}
    `,
  });
  cleanup = fixture.cleanup;
  return fixture;
}

describe("diagram image fallback", () => {
  it("architecture diagram contains mermaid block and mermaid.ink image", () => {
    const fixture = makeExpressFixture();
    const analysis = analyzeProject(fixture.path);
    const diagram = generateArchitectureDiagram(analysis);

    // Must have mermaid code block
    expect(diagram).toContain("```mermaid");
    expect(diagram).toContain("flowchart TB");
    expect(diagram).toContain("```\n");

    // Must have image fallback
    expect(diagram).toContain("<details>");
    expect(diagram).toContain("mermaid.ink/img/");
    expect(diagram).toContain("![Architecture Diagram]");
    expect(diagram).toContain("</details>");
  });

  it("data flow diagram contains mermaid block and mermaid.ink image", () => {
    const fixture = makeExpressFixture();
    const analysis = analyzeProject(fixture.path);
    const diagram = generateDataFlowDiagram(analysis);

    expect(diagram).toContain("```mermaid");
    expect(diagram).toContain("sequenceDiagram");
    expect(diagram).toContain("<details>");
    expect(diagram).toContain("mermaid.ink/img/");
    expect(diagram).toContain("![Data Flow Diagram]");
  });

  it("folder diagram contains mermaid block and mermaid.ink image", () => {
    const fixture = makeExpressFixture();
    const analysis = analyzeProject(fixture.path);
    const diagram = generateFolderDiagram(analysis);

    expect(diagram).toContain("```mermaid");
    expect(diagram).toContain("flowchart LR");
    expect(diagram).toContain("<details>");
    expect(diagram).toContain("mermaid.ink/img/");
    expect(diagram).toContain("![Folder Structure]");
  });

  it("import graph diagram contains mermaid block and mermaid.ink image", () => {
    const fixture = makeExpressFixture();
    const analysis = analyzeProject(fixture.path);
    const diagram = generateImportGraphDiagram(analysis);

    expect(diagram).toContain("```mermaid");
    expect(diagram).toContain("flowchart LR");
    expect(diagram).toContain("<details>");
    expect(diagram).toContain("mermaid.ink/img/");
    expect(diagram).toContain("![Import Graph]");
  });

  it("mermaid.ink URL contains valid base64url encoding", () => {
    const fixture = makeExpressFixture();
    const analysis = analyzeProject(fixture.path);
    const diagram = generateArchitectureDiagram(analysis);

    // Extract the base64url portion from the URL
    const match = diagram.match(/mermaid\.ink\/img\/([A-Za-z0-9_-]+)/);
    expect(match).not.toBeNull();

    // Decode and verify it's valid mermaid code
    const decoded = Buffer.from(match![1], "base64url").toString("utf-8");
    expect(decoded).toContain("flowchart TB");
  });

  it("returns empty string for unknown framework", () => {
    const fixture = createFixture({
      "package.json": JSON.stringify({
        name: "plain",
        dependencies: { lodash: "^4.0.0" },
        scripts: { start: "node index.js" },
      }),
      "index.js": "console.log('hello');",
    });
    cleanup = fixture.cleanup;

    const analysis = analyzeProject(fixture.path);
    expect(generateArchitectureDiagram(analysis)).toBe("");
    expect(generateDataFlowDiagram(analysis)).toBe("");
  });
});
