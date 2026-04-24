# 🚀 Dev-Onboarder

CLI tool that analyzes any Node.js/TypeScript project and automatically generates a complete **onboarding guide** for new developers.

## What does it do?

Scans your project and generates an `ONBOARDING.md` document that includes:

- **Project summary** — Framework, type, total dependencies, metrics
- **Quick Start** — Steps to get the project running from scratch
- **Where to start** — Entry points, hub files, navigation tips
- **Metrics** — Files, lines of code, TypeScript %, largest files
- **Architecture diagrams** — Mermaid diagrams of the data flow
- **Folder structure** — Visual tree with directory descriptions
- **Endpoints map** — Detected API routes (Express, NestJS, Next.js)
- **Environment variables** — Parsed from `.env.example` and source code
- **Tech stack** — All libraries categorized and documented
- **Design patterns** — Detects MVC, Feature-based, DI, Hooks, etc.
- **Internal dependency graph** — Import relationships between files
- **Styling** — Tailwind, CSS Modules, styled-components, etc.
- **Global state** — Redux, Zustand, Jotai, etc.
- **Data fetching** — React Query, SWR, tRPC, Apollo, etc.
- **Database** — Prisma, Drizzle, TypeORM, Mongoose, etc.
- **Authentication** — NextAuth, Clerk, Passport, etc.
- **Testing** — Jest, Vitest, Cypress, Playwright, etc.
- **Available scripts** — All npm scripts documented
- **Config files** — Detected configuration files and their purpose

## Installation

```bash
# Option 1: Run directly with npx (recommended)
npx dev-onboarder

# Option 2: Install globally
npm install -g dev-onboarder

# Option 3: Clone the repo
git clone https://github.com/hugocruzlfc/dev-onboarder.git
cd dev-onboarder
npm install
npm run build
```

## Usage

```bash
# Analyze the current directory
npx dev-onboarder

# Analyze a specific project
npx dev-onboarder /path/to/project

# Change output file name
npx dev-onboarder --output GUIDE.md

# Print to console instead of file
npx dev-onboarder --stdout

# Export analysis as JSON
npx dev-onboarder --json
```

## Example output

When running on a Next.js project with Prisma and Tailwind, it generates something like:

```
🔍 dev-onboarder

   Analyzing: /Users/dev/my-project

✅ Guide generated successfully!
   📄 File: /Users/dev/my-project/ONBOARDING.md

   Summary:
   ├── Framework: Next.js ^14.0.0
   ├── Dependencies: 45
   ├── Patterns: File-Based Routing, Service Layer, Custom Hooks
   ├── Styling: Tailwind CSS
   ├── Testing: Vitest
   ├── State: Zustand
   ├── DB: @prisma/client
   └── Configs: 8 files detected
```

## Supported frameworks

| Framework        | Category           |
| ---------------- | ------------------ |
| Next.js          | Fullstack          |
| Remix            | Fullstack          |
| NestJS           | Backend            |
| Express          | Backend            |
| Fastify          | Backend            |
| React (Vite)     | Frontend           |
| Vue.js           | Frontend           |
| Nuxt             | Fullstack          |
| Angular          | Frontend           |
| Svelte/SvelteKit | Frontend/Fullstack |
| Astro            | Fullstack          |
| Hono             | Backend            |

## Diagrams

The generated document includes Mermaid diagrams renderable on GitHub, GitLab, VS Code (with extension) and most Markdown viewers:

- **Architecture Diagram** — Overview of the project's layers
- **Structure Diagram** — Main folder visualization
- **Data Flow Diagram** — Typical user-server interaction sequence
- **Internal Dependency Graph** — Import relationships between source files

## Development

```bash
# Install deps
npm install

# Build
npm run build

# Run in development mode
npm run dev -- /path/to/project

# Test with your own project
node dist/index.js /path/to/project

# Run tests
npm test
```

## Tech stack

- **TypeScript** — Full type-safety
- **Commander** — CLI parsing
- **Chalk** — Colored output
- **Ora** — Progress spinners
- **Vitest** — Testing

## Programmatic usage

You can also use `dev-onboarder` as a library:

```typescript
import { analyzeProject, generateMarkdown } from "dev-onboarder";

const analysis = analyzeProject("/path/to/project");
const markdown = generateMarkdown(analysis);

// Or work directly with the analysis object
console.log(analysis.framework); // { name: 'Next.js', version: '14.0.0', ... }
console.log(analysis.endpoints); // [{ method: 'GET', path: '/api/users', ... }]
console.log(analysis.envVars); // [{ name: 'DATABASE_URL', required: true, ... }]
console.log(analysis.metrics); // { totalFiles: 120, totalLines: 8500, ... }
console.log(analysis.importGraph); // [{ file: 'src/index.ts', imports: [...], importedBy: [...] }]
```

## License

MIT

---

📖 [Leer en español](README.es.md)
