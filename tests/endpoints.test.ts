import { describe, it, expect, afterEach } from "vitest";
import { detectEndpoints } from "../src/analyzer/endpoints";
import { DependencyAnalysis } from "../src/types";
import { createFixture } from "./helpers";

let cleanup: (() => void) | undefined;
afterEach(() => cleanup?.());

function makeDeps(...names: string[]): DependencyAnalysis {
  return {
    production: names.map((n) => ({
      name: n,
      version: "1.0.0",
      category: "framework" as const,
      description: "",
    })),
    development: [],
    total: names.length,
  };
}

describe("detectEndpoints", () => {
  it("detects Express-style routes", () => {
    const fixture = createFixture({
      "package.json": JSON.stringify({ dependencies: { express: "^4.18.0" } }),
      "src/routes.ts": `
import { Router } from 'express';
const router = Router();
router.get('/users', getUsers);
router.post('/users', createUser);
router.delete('/users/:id', deleteUser);
export default router;
      `,
    });
    cleanup = fixture.cleanup;

    const endpoints = detectEndpoints(fixture.path, makeDeps("express"));

    expect(endpoints).toHaveLength(3);
    expect(endpoints[0].method).toBe("GET");
    expect(endpoints[0].path).toBe("/users");
    expect(endpoints[1].method).toBe("POST");
    expect(endpoints[2].method).toBe("DELETE");
    expect(endpoints[2].path).toBe("/users/:id");
  });

  it("detects NestJS decorators", () => {
    const fixture = createFixture({
      "package.json": JSON.stringify({
        dependencies: { "@nestjs/core": "^10.0.0" },
      }),
      "src/users.controller.ts": `
import { Controller, Get, Post } from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Get('/list')
  async findAll() { return []; }

  @Post()
  async create() { return {}; }
}
      `,
    });
    cleanup = fixture.cleanup;

    const endpoints = detectEndpoints(fixture.path, makeDeps("@nestjs/core"));

    expect(endpoints.length).toBeGreaterThanOrEqual(2);
    const getEndpoint = endpoints.find((e) => e.method === "GET");
    const postEndpoint = endpoints.find((e) => e.method === "POST");
    expect(getEndpoint).toBeDefined();
    expect(getEndpoint!.path).toBe("/list");
    expect(postEndpoint).toBeDefined();
    expect(postEndpoint!.handler).toBe("create");
  });

  it("detects Next.js App Router route handlers", () => {
    const fixture = createFixture({
      "package.json": JSON.stringify({ dependencies: { next: "^14.0.0" } }),
      "app/api/users/route.ts": `
export async function GET(request: Request) {
  return Response.json([]);
}

export async function POST(request: Request) {
  return Response.json({});
}
      `,
    });
    cleanup = fixture.cleanup;

    const endpoints = detectEndpoints(fixture.path, makeDeps("next"));

    expect(endpoints).toHaveLength(2);
    expect(endpoints[0].method).toBe("GET");
    expect(endpoints[0].path).toBe("/api/users");
    expect(endpoints[1].method).toBe("POST");
  });

  it("detects Next.js Pages API routes", () => {
    const fixture = createFixture({
      "package.json": JSON.stringify({ dependencies: { next: "^14.0.0" } }),
      "pages/api/hello.ts": `
export default function handler(req, res) {
  res.json({ message: 'hello' });
}
      `,
      "pages/api/users/[id].ts": `
export default function handler(req, res) {
  res.json({ id: req.query.id });
}
      `,
    });
    cleanup = fixture.cleanup;

    const endpoints = detectEndpoints(fixture.path, makeDeps("next"));

    expect(endpoints).toHaveLength(2);
    const hello = endpoints.find((e) => e.path === "/api/hello");
    const userId = endpoints.find((e) => e.path.includes(":id"));
    expect(hello).toBeDefined();
    expect(userId).toBeDefined();
  });

  it("returns empty for projects without recognized frameworks", () => {
    const fixture = createFixture({
      "package.json": JSON.stringify({ dependencies: { lodash: "^4.0.0" } }),
      "src/index.ts": "console.log('hello');",
    });
    cleanup = fixture.cleanup;

    const endpoints = detectEndpoints(fixture.path, makeDeps("lodash"));
    expect(endpoints).toHaveLength(0);
  });
});
